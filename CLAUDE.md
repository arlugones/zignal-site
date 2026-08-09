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

**Motion system**: all motion is CSS-only (no JS animation loops, no libraries) and every
keyframe is namespaced `zn-*`. The deliberate principle, borrowed from the Resend reference
the direction came from, is that motion is *concentrated rather than scattered* — one
signature plus slow ambient movement. Resist adding more effects per section; that is what
makes this read as designed rather than generated.
- **`.signal-net` is the signature.** An inline SVG in the hero where four source lines
  converge into a single node, with accent pulses travelling along the curves via CSS
  `offset-path` + `offset-distance` (not SMIL, so the global reduced-motion rule disables it
  like any other animation). It encodes the company thesis — many systems integrated into
  one — so keep the converging geometry if you restyle it. It is masked on the left
  (`mask-image`) so pulses fade before they reach the headline, sits *below* `.hero-fade` in
  DOM order so the fade veils it, and is `display: none` under 900px.
- **`.eyebrow-wrap`** is the hero badge's rotating conic-gradient border: an oversized
  `::before` square spinning under `overflow: hidden`, with the inner `.eyebrow` painting
  `var(--bg)` over the middle to leave only a 1px rim. The wrapper's `background: var(--bd)`
  is the fallback rim when the spinner is disabled.
- `.hero-glow` drifts on an 18s loop; the marquee pauses on hover via `animation-play-state`.
- **Reduced motion**: the global block already kills `animation`/`transition` everywhere, but
  anything that would be left frozen mid-flight is additionally hidden (`.signal-pulse`,
  `.signal-ping`, `.eyebrow-wrap::before`) — a pulse stranded mid-curve reads as a bug, not
  as stillness. Check this when adding motion.

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
- The preselected country **follows the site language** (Spanish → Ecuador, English → US) and
  re-applies whenever the language toggles, via the `zn:lang` CustomEvent that `applyLang()`
  dispatches. Once the visitor picks a country themselves, a `userPicked` flag freezes it so
  a later language switch won't overwrite their choice. `setCountry()` updates the field
  without moving focus (safe on load); only `select()` closes the list and refocuses.
- `COUNTRIES` is written in dial-code order for easy editing but sorted A–Z by name at
  runtime; all lookups key off `iso`/`code`, never array position, so the sort is safe.
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

## Legal pages: `privacidad.html` (ES) and `privacy.html` (EN)

The privacy policy ships as **two standalone single-language pages**, deliberately *not* using the
landing page's `<span lang="es">`/`<span lang="en">` toggle. Long legal prose duplicated inline
would leave both languages in the DOM for crawlers and screen readers, and would make it ambiguous
which version governs. Each page states that the **Spanish version prevails** (Ecuador is the
applicable jurisdiction) and links to its counterpart via a language button plus `hreflang` tags.

- **Footer links need no JS.** `index.html`'s footer holds two anchors, `<a href="privacidad.html"
  lang="es">` and `<a href="privacy.html" lang="en">`; the existing i18n CSS shows only the one
  matching the active language. Follow that pattern rather than rewriting an `href` in script.
- **The design tokens are mirrored, not shared.** Both pages carry their own copy of the
  `:root`/`[data-theme="light"]` block so they stay self-contained like `index.html`. If the palette
  changes, update all three files. Theme choice carries across pages through the shared `zn-theme`
  localStorage key.
- **These pages exist to satisfy Meta's app-review requirements**, so some properties are load-bearing
  and must not regress:
  - The URLs must stay **live, publicly reachable, crawlable, non-geoblocked and return HTTP 200** —
    not a redirect. Give Meta the `https://` URL directly (`http://` 301-redirects under GitHub Pages'
    HTTPS enforcement). Don't move these behind a redirect or a "pretty" extensionless path unless the
    new path also returns 200.
  - The policy must keep disclosing what data is collected, the purposes, and **a specific, working
    path to request deletion** — that is section 11, the highlighted callout pointing at
    `privacy@zignalnexora.com`. Meta treats a dead privacy contact or broken link as a violation, so
    that mailbox must exist and be monitored.
  - `<meta name="robots" content="index, follow">` is intentional; don't noindex these.
- **Keep the content true to the code.** The policy enumerates exactly what the site collects (the
  seven form fields, the two `localStorage` keys, Google Fonts disclosing visitor IPs, and the absence
  of cookies/analytics/Meta pixel). If you add analytics, a tracking pixel, or a new processor, the
  disclosure and sub-processor list in **both** language files must be updated to match — an
  inaccurate policy is worse than none.
- Section 8/9 draw the controller-vs-processor line: Zignal Nexora is the *controller* for its own
  leads and a *processor* for client data flowing through WhatsApp bots, the omnichannel inbox, and
  on-prem analytics. Preserve that distinction when editing.
- Section 1 identifies the controller as **Zignal Nexora S. A.**, RUC `1793230170001`. That is the
  registered entity; elsewhere the documents use the bare trade name "Zignal Nexora" conversationally,
  which each page defines as referring to the S. A. Keep the legal name and RUC in section 1 of both
  files in sync if either ever changes.

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
