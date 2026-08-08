# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The marketing site for Zignal Nexora, a systems-integration / automation company ("we don't
reinvent software, we integrate the products your operation already needs"). The shipped
site is `index.html` plus a small `assets/` folder of decorative background images — no
build step, no package manager, no framework, no server-side code. All CSS and JS are
embedded inline in `index.html`; the only external dependency is the Google Fonts stylesheet
link (Inter + JetBrains Mono).

Hosted on GitHub Pages, serving directly from the repo root on the default branch.

## Working with this repo

- There is no build/lint/test tooling. To preview changes, run a static file server from
  the repo root (e.g. `python -m http.server 8000`) and open `http://localhost:8000/` —
  opening `index.html` via `file:///` also works for everything except relative asset paths
  behaving oddly in some browsers, so prefer a local server. There is no compilation step.
- Since the page is one file, prefer targeted edits over rewrites. Keep the existing
  three-part structure intact: `<style>` in `<head>`, semantic HTML in `<body>`, then a
  single IIFE `<script>` at the end of `<body>`.
- `.nojekyll` at the repo root disables GitHub Pages' Jekyll processing — don't remove it.

## Architecture inside `index.html`

**Theming**: All colors are CSS custom properties on `:root` (dark, the default) and
re-declared under `[data-theme="light"]`, using `oklch()` for the accent colors. Never
hardcode a color in a new component — add both a dark and light value to the variable block
instead. Theme state persists to `localStorage` under `zn-theme` and is toggled via
`#theme-toggle` (navbar) / `#theme-toggle-footer` (footer), both styled as a sliding
track-and-knob switch (`.theme-switch`) driven purely by CSS attribute selectors keyed off
`[data-theme]` — the toggle JS only flips the attribute and localStorage, it does not touch
any element styles directly.

**i18n**: The site is bilingual (Spanish default, English toggle), via a different mechanism
than a plain data-attribute text swap:
- Any translatable text is written twice inline, each copy wrapped in `<span lang="es">…</span>`
  / `<span lang="en">…</span>` siblings. Pure CSS shows/hides the right one:
  `html[data-lang="en"] [lang="es"]{display:none}` and the inverse for `[lang="en"]` when
  `data-lang` isn't `"en"`. Toggling language is just setting `data-lang` on `<html>` — no JS
  text-swapping pass over the DOM is needed for this content.
- Placeholders are the exception: they can't hold child elements, so inputs/textareas still
  use `data-es-ph` / `data-en-ph`, applied by a small JS loop in `applyLang()`.
- The product `<select>` in the lead form is a deliberate exception to the whole scheme: its
  `<option>` labels are static "Spanish / English" strings (e.g. `"Dashboards de métricas /
  Metrics Dashboards"`) rather than being toggled at all. This is intentional, not an
  oversight — **`<option>` elements render only their raw text content and ignore CSS
  `display` on child nodes**, so `<span lang="es">`/`<span lang="en">` inside an `<option>`
  will render both languages concatenated together with no separator. Do not "fix" this by
  wrapping option text in lang spans; either keep the static bilingual string or swap it via
  a `data-es`/`data-en` JS pass (`option.textContent = …`) the way placeholders are handled.
- When adding new bilingual content: use the `lang` span pattern for anything that can
  contain markup, `data-es-ph`/`data-en-ph` for placeholders, and remember the `<option>`
  caveat above.

**Hero & product imagery**: `assets/` holds 7 WebP images — `hero-bg.webp` /
`hero-bg-light.webp` (theme-swapped hero background, toggled by the same `[data-theme]` CSS
attribute selectors as the theme switch, no JS) and `bg-1.webp`…`bg-5.webp` (one per product
card in `#productos`, cross-faded behind the product list). These are abstract dark
line/graph art, not photos — that's why they compress to a few KB each as WebP despite
starting as multi-MB PNGs; if regenerating them, `ffmpeg -i in.png -vf scale=W:-1 -quality
80 out.webp` reproduces the pipeline used to shrink the originals from ~12MB to ~80KB total.
In light theme the product-card backgrounds are inverted via CSS filter
(`invert(1) hue-rotate(180deg) saturate(.7)`) rather than using a second set of light-mode
images.

**Product card cycle**: `#product-cards` auto-advances through the 5 `.product-card`
articles every 5.2s (paused/reset on hover or click), toggling an `.is-active` class that
both highlights the card (CSS) and cross-fades the matching `.product-bg[data-bg="N"]` layer
behind the section. Respects `prefers-reduced-motion` (no auto-advance, no reveal-on-scroll
animation, no transitions).

**Reveal-on-scroll**: elements marked `[data-reveal]` start hidden/offset and animate in via
an `IntersectionObserver` that adds `.zn-in` on first intersection, staggered by list
position. This is presentation-only — don't rely on it for anything that must be visible
without JS.

**Lead form**: `#lead-form`'s submit handler validates a work email — free consumer
providers (Gmail, Outlook, Yahoo, iCloud, etc., see the `FREE_EMAIL_DOMAINS` list in the
script) are rejected inline before submission is attempted, which is deliberate business
logic (this is a B2B lead form), not a bug to relax. On a valid submission it POSTs to
`FORM_ENDPOINT` (currently empty — fill in a Formspree endpoint URL to enable it) and falls
back to opening a pre-filled `mailto:` link if the endpoint is unset or the request fails.
Status is shown inline via `#form-status`.

**Phone country picker**: the phone field is a custom listbox (`#phone-field`), not a native
`<select>`, built from the `COUNTRIES` table in the script. It submits two fields —
`phone_country` (a hidden input holding the dial code) and `phone` (the national number) —
which the mailto/Formspree payload joins back together. Two things to know before touching it:
- **Flags are hand-drawn inline SVGs**, generated by the small composition helpers at the top
  of the picker IIFE (`fH`/`fV`/`fCross`/`star`/…) and keyed by ISO code in the `flags` map.
  They exist because emoji flags (`🇪🇨`) are **invisible on Windows** — Segoe UI Emoji ships
  no flag glyphs, so every Windows browser silently degrades them to the two-letter code
  ("EC"). Don't "simplify" these back to emoji. A handful of intricate flags (MX, BR, SA, KR,
  and other emblem-heavy ones) are deliberately reduced to accurate colors/layout without the
  fine emblem detail.
- Native `<select>` can't hold this markup for the same reason `<option>` can't hold lang
  spans (see the i18n note above) — options render raw text only.
- The picker markup deliberately sits in a `<div class="field">` with an explicit
  `<label for="phone-number">`, **not** wrapped in a bare `<label>` like the other fields.
  Wrapping it re-introduces a fixed bug: an implicit label forwards every click inside it to
  its first labelable control, so clicking a country in the list re-triggered the toggle
  button and the dropdown reopened instantly after each selection.

**Responsive breakpoints**: `1024px` (products grid collapses to 1 column), `900px` (contact
grid collapses to 1 column), `768px` (nav collapses to a hamburger dropdown via
`.nav-links.open`, and the nav's primary CTA button is hidden to make room — see the
`.nav-actions .nav-cta` selector, which needs that specificity to win over the base `.btn`
rule appearing later in the stylesheet), `480px` (padding/spacing reductions, contact form
fields stack). `prefers-reduced-motion: reduce` disables all transitions/animations
globally, including the reveal-on-scroll and product-card auto-cycle.

## `site/` — design-tool source, not part of the shipped site

`site/Zignal Nexora.dc.html` (plus its `support.js` runtime and the original uncompressed
PNGs in `site/assets/`) is the export from the design-canvas tool this visual direction was
originally drafted in. `index.html` at the repo root is a hand-ported, dependency-free
rewrite of that design — same visuals and copy, but with the tool's `{{ template }}`
bindings and `style-hover="…"` pseudo-attributes converted to real CSS classes with `:hover`/
`:focus` rules, and (unlike the original export) actual responsive breakpoints, since the
canvas export had none. `site/` is not linked from the deployed site and doesn't need to
stay in sync file-for-file with `index.html` — treat it as a reference if the design needs to
be reopened in that tool, not as a second copy to maintain in parallel.
