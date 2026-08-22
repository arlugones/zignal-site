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

**Theming**: All colors are CSS custom properties. `:root` holds the **dark** palette and
`[data-theme="light"]` overrides it with the light one, using `oklch()` for the accent colors.
Note the indirection: the *stylesheet's* base is dark, but the *site's default* is light —
`<html>` ships with `data-theme="light"` on all three pages and `'light'` is the localStorage
fallback, so a first-time visitor sees the light palette. Keep `<meta name="theme-color">` in
sync with the light `--bg`, since that is what a first-time visitor renders. Never
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

**Brand mark**: the head-and-circuit glyph in the navbar and footer is the real logo, extracted
from the Fiverr kit's `SVG Vector Files/Transparent Logo.svg` (the kit also ships a stacked
lockup with a wordmark and the tagline "NO REINVENTAMOS SOFTWARE" — the site deliberately does
not use it; the wordmark stays HTML text in Inter 600 so it is selectable, translatable, and
crisp at any size, and the kit's thin wide-tracked wordmark does not sit in a 64px bar).
- **The kit's artwork is white-on-black; that is the whole reason a naive drop-in disappears.**
  Every path in the source carries `style="fill: #ffffff"`, and the site's default theme is
  light. Those inline fills are stripped so the mark inherits `currentColor` from `.nav-brand`
  / `.footer-brand` / `.brand` and tracks the theme with no JS and no second asset. The one
  exception is the pupil at the centre of the concentric "eye" (`circle cx="1042.4"
  cy="842.4"`), which takes `var(--accent)` — it is the mark's focal point and it echoes the
  convergence node in `.signal-net`. **Don't reintroduce a hardcoded fill.**
- `index.html` defines the paths once as `<symbol id="zn-mark">` just inside `<body>` and
  `<use href="#zn-mark">`s it in both places. The legal pages each carry their **own inline
  copy** — cross-document `<use href="file.svg#id">` is blocked in browsers and an `<img>`
  cannot inherit `currentColor`, so the mark is mirrored across all three files the same way
  the palette is. Update all three together.
- The `viewBox` `492.3 472.81 1015.3 1054.66` is already the tight bounding box, so the art
  touches all four edges and the aspect is **0.963, not 1** — size it `31×32` / `27×28`, never
  square, or it letterboxes. Below ~30px this mark turns to mush (the old diamond-and-Z glyph
  it replaced was legible at 22px; this one is not), which is why the footer went 22px → 28px
  and the navbar 26px → 32px.
- **The favicon is a different glyph on purpose.** At 16px the head is unreadable, and an SVG
  favicon renders as an isolated document where `currentColor` resolves to black rather than
  `--tx`. So the favicon is a hand-drawn concentric node — ring plus dot, the one part of the
  mark that survives 16px — with **explicit** colors (`#070a0f` disc, `#00b8d7` ring, the
  resolved value of the dark `--accent`). Same data-URI in all three files. Don't point it at
  the kit's `.ico`: that file is 285KB.

**Hero & product imagery**: everything in `assets/` is WebP, and it must stay that way — the
whole page is ~220KB over the wire and the images are most of it.
- `hero-bg.webp` / `hero-bg-light.webp` — theme-swapped hero background, toggled by the same
  `[data-theme]` CSS attribute selectors as the theme switch, no JS.
- `card-automation.webp`, `card-dashboards.webp`, `card-whatsapp.webp`,
  `card-omnichannel.webp`, `card-analytics.webp` — one behind each flip card's front face,
  set as an inline `background-image` on `.flip-front-bg`. These are 3D allegorical renders
  (not the abstract line art the earlier `bg-N.webp` set used).
- `bg-1.webp`…`bg-5.webp` are **orphaned** — leftovers from the removed product-card cycle.
  Nothing references them; delete them if you're tidying.

The renders arrived as ~500–800KB JPEGs (2.9MB total, which dominated page load). They are
now 1100px-wide WebP, 106KB for all five. Re-encode anything new the same way:

```
ffmpeg -i in.jpg -vf scale=1100:-1 -c:v libwebp -quality 75 -compression_level 6 out.webp
```

1100px covers a 2× desktop card and a 3× phone card; the art is smooth-gradient so quality 75
is visually lossless here, and the front-face overlay hides any residual artefacts anyway.
**Don't commit source JPEGs/PNGs** — convert first.

In light theme `.flip-front-bg` is inverted via CSS filter
(`invert(1) hue-rotate(180deg) saturate(.7)`) at `opacity: .3`. That filter was written for the
old line art; on the current photographic renders it washes them out to near-white, and light is
now the default theme, so this is a known open design question rather than a settled choice.

**3D flip cards** (replaced the old auto-advancing product-card cycle — that machinery is gone):
`.flip-cards-grid` holds 5 `.flip-card` articles, each a `perspective` container around a
`.flip-card-inner` that `rotateY(180deg)`s. Front and back are absolutely stacked with
`backface-visibility: hidden`. The back's `.flip-cta` sets the contact form's `<select>` by
`data-product-select` index (0–4, matching option order) and smooth-scrolls to `#contacto`,
offsetting by the navbar height; it is bound to both `click` and `touchend`.
- **`:hover` is the only thing that turns the card.** `499c954` removed the `:focus-within`
  trigger and the `.is-flipped` class toggle, so there is no class hook any more — don't write
  rules against `.is-flipped`. Touch works because mobile browsers apply sticky `:hover` on
  first tap (verified on emulated iPhone 13 and Pixel 7: tap turns the card, second tap fires
  the CTA). Known gap: a keyboard user tabbing to `.flip-cta` focuses a button on a face that
  never turns toward them — the button works, but nothing visible indicates it. Restoring
  `.flip-card:focus-within .flip-card-inner { transform: rotateY(180deg); }` would fix that.
- **The front face must be `pointer-events: none` while flipped.** `backface-visibility`
  hides the front face *visually*, but its `z-index: 2` children (`.flip-front-top` /
  `.flip-front-bottom`) still win hit-testing over the back face, so a mouse click aimed at
  the CTA lands on `.flip-front-bottom` and the button never fires. Keyboard is unaffected
  (Tab reaches the `<a>`, Enter dispatches on the element with no hit-testing), which is why
  this reads as working when tested by keyboard. Verify with
  `document.elementsFromPoint(x, y)` at the CTA’s centre — `.flip-cta` must be on top.
- `id="product-cards"` survives on the grid from the old cycle and is unreferenced.

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
logic (this is a B2B lead form), not a bug to relax. On a valid submission it POSTs the
`FormData` to `FORM_ENDPOINT` — a **Formspree** form — and falls back to opening a pre-filled
`mailto:` link if the endpoint is empty or the request fails, so leads are never silently lost
(worth keeping: Formspree's plans cap monthly submissions). Status is shown inline via
`#form-status`. Formspree specifics that the markup depends on:
- The email input is `name="email"`, which Formspree automatically uses as the **Reply-To**, so
  replies go straight to the lead. Renaming that field breaks it.
- `subject` is set on the `FormData` at submit time rather than as a `{{ }}` template, so the
  notification subject is deterministic regardless of Formspree's templating behaviour.
- `input[name="_gotcha"]` is Formspree's **honeypot**: a filled value makes Formspree silently drop
  the submission. It is positioned off-screen via `.gotcha` rather than `display: none` (some bots
  skip hidden fields) and is absolutely positioned so it doesn't occupy a cell in the form grid.
  Keep it out of the tab order and `aria-hidden`.
- Formspree receives personal data, so it is listed as a sub-processor in section 5 of both privacy
  policy pages — see the legal pages section below before changing form plumbing.

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
grid collapses to 1 column; `.signal-net` is hidden), `768px` (nav collapses to a hamburger
dropdown via `.nav-links.open`, and the nav's primary CTA button is hidden to make room — see
the `.nav-actions .nav-cta` selector, which needs that specificity to win over the base `.btn`
rule appearing later in the stylesheet), `640px` (`.flip-cards-grid` goes to 1 column), `480px`
(padding/spacing reductions, contact form fields stack). `prefers-reduced-motion: reduce`
disables all transitions/animations globally, including the reveal-on-scroll and the card flip
(which becomes an instant swap — the CTA still works).

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
  localStorage key. The **brand mark** is mirrored the same way — see the brand-mark
  notes above for why it can't be a shared file.
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
