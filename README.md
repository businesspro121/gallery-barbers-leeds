# Gallery Barbers — Leeds Kirkgate Market

A mobile-first website for **Gallery Barbers**, Stall 10–11, Leeds Kirkgate Market,
Leeds LS2 7HJ.

Plain HTML, CSS and JavaScript. No build step, no framework, no npm install — open
`index.html` and it runs. First load is about **165 KB** over the wire (gzipped HTML/CSS/JS plus the hero
photograph); everything else is lazy-loaded.

---

## ⚠️ Read this before you publish

Four things on this site are **not confirmed yet**. They are marked in the page with
a dashed gold underline, and each one is listed here.

| What | Where | Status |
|---|---|---|
| **Service names, prices, durations** | `index.html`, Services section | Placeholders. A banner on the page says so. Replace with the shop's real price list. |
| **Opening hours** (Mon–Sat 9:00–17:30) | `assets/js/config.js` → `hours` | Transcribed from the shop's own window sign. Confirm before launch — they drive the booking slots *and* the Google structured data. |
| **Facebook / TikTok URLs** | `assets/js/config.js` → `social` | Empty. The buttons stay visibly disabled until real URLs are added — the site will not link to an account it cannot verify. The shop's window sign shows a Facebook logo, so ask them for the page. |
| **Domain** | `index.html`, `robots.txt`, `sitemap.xml` | Currently `businesspro121.github.io/gallery-barbers-leeds`. Search for that string and replace it everywhere. |

### About the photographs

Eight photos were supplied. **Only four are used.**

**Used** — these are demonstrably the shop's own (the same white brick wall appears
across them):

- `source-photos/logo.png` — the shopfront
- `source-photos/1.png` — the interior
- `source-photos/3.png` — a 2×2 grid of their own cuts, split into four gallery tiles
- `source-photos/4.png` — colour and curl work

**Not used** — `2.png`, `5.png`, `6.png` and `7.png` are style-reference collages
gathered from elsewhere, not the shop's own photography. `5.png` is made up of
celebrity press photographs (Jennifer Lawrence, Brittany Murphy). Publishing them
would be copyright infringement, so they are gitignored under
`source-photos/_unlicensed-do-not-publish/` and never reach the site.

The gallery has three clearly-labelled placeholder tiles where real photos should go.
**Any photo showing a recognisable customer needs that customer's permission first.**

---

## Getting it onto GitHub

```bash
git init
git add .
git commit -m "Gallery Barbers website"
git branch -M main
git remote add origin https://github.com/<your-username>/gallery-barbers-leeds.git
git push -u origin main
```

Then in the repo: **Settings → Pages → Source: GitHub Actions**. The workflow in
`.github/workflows/pages.yml` publishes the site on every push to `main`.

To preview locally:

```bash
python -m http.server 8123
```

---

## Editing the site

### Prices and services

They live directly in `index.html` (not in a JavaScript file) so Google can read them.
Look for the big `EDIT ME ▸ SERVICES & PRICES` comment. Each service is one block:

```html
<li class="svc">
  <h4 class="svc__name">Skin Fade</h4>
  <span class="svc__price editable">£16</span>
  <p class="svc__desc">Taken down to the skin and blended clean…</p>
  ...
</li>
```

Copy a block to add a service, delete it to remove one. Remove `class="editable"` from
a price once it is confirmed and the dashed underline disappears.

**The booking form's service menu builds itself from this list at page load** — there
is no second place to update.

### Gallery

Same idea: each photo is one `<li class="tile" data-cat="…">` in `index.html`. The
`data-cat` value drives the filter buttons (`haircuts`, `fades`, `colour`, `interior`,
`exterior`). Always write a real `alt` description — it is read aloud to screen readers.

### Photos

Drop new originals into `source-photos/` and run:

```bash
python tools/build-images.py
```

That produces every responsive WebP size plus the social share card. Requires Pillow
(`pip install Pillow`).

### Everything else

`assets/js/config.js` — phone number, WhatsApp, opening hours, Google keys, social
links. It is heavily commented and it is the only file you need for integrations.
Nothing secret goes in it; it ships to the browser.

---

## How the booking form works

By default (`booking.mode: "whatsapp"`) the form collects everything, then hands the
customer a **pre-written WhatsApp message** to send. This works from day one with no
backend, no monthly fee and no database — and it is honest: nothing claims to be
confirmed until the shop replies.

To connect a real booking provider or form service, set:

```js
booking: { mode: "endpoint", endpoint: "https://…", live: false }
```

The form then POSTs JSON (`service`, `barber`, `date`, `time`, `name`, `phone`,
`email`, `notes`) and shows a proper loading → success → error sequence.

**`live` stays `false` until the endpoint returns genuine availability.** While it is
false, the time picker carries a visible *Demo availability* badge and the times come
from the opening hours in `config.js`, not from a real diary. No slot is ever shown as
"booked" that isn't — the only times removed are ones that have already passed today.

---

## Compliance decisions worth knowing about

These were deliberate, and undoing them casually could cause problems:

- **No `aggregateRating` in the structured data.** The 4.9/342 figures are Google's.
  Google's structured-data policy requires ratings you mark up to be collected by you,
  not aggregated from another site. The numbers are displayed on the page with a link
  to Google — that's fine — but they are not marked up as first-party. Add
  `aggregateRating` only once the shop gathers its own reviews.
- **No review text anywhere.** Review quotes may only be displayed through the official
  Places API with Google's attribution. Scraping Maps is prohibited, and inventing
  quotes is worse. The Reviews section shows a labelled, integration-ready panel with
  the steps to connect it properly.
- **The Google Map is consent-gated.** It does not load until the visitor asks for it,
  which keeps the site on the right side of PECR/GDPR and keeps a third-party iframe
  out of the critical path. Google's attribution is preserved.
- **No analytics, no tracking, no advertising cookies.** Only two preference values in
  local storage (`gb-motion`, `gb-consent`). If analytics are ever added, the consent
  banner must gate them *before* they load, and `cookies.html` must be updated.
- **The legal pages are templates.** `privacy.html`, `cookies.html` and `terms.html`
  accurately describe how this site behaves, but the shop should read them, add a
  contact email address, and have them checked.

---

## Accessibility

- Semantic landmarks, one `h1`, logical heading order, skip link.
- Every interactive target is at least 44×44 px.
- Visible gold focus rings, never removed. Full keyboard operation, including the
  gallery lightbox (arrow keys, Home/End, Escape).
- Form errors appear next to the field *and* in a focusable summary at the top, with
  `aria-invalid` and `aria-describedby` wired up; a polite live region announces step
  changes and submission.
- Text contrast is at or above WCAG AA throughout — the palette was picked for it
  (ivory on charcoal 16.8:1, muted stone 5.6:1, gold on charcoal 7.9:1, and a darker
  gold `#7A6030` at 5.2:1 for the ivory sections).
- **Reduced motion** is respected from the OS *and* there is a visible on-page toggle
  in the footer, because the brief asked for a visible fallback. The choice persists.
  It is applied before first paint, so nothing animates before it is honoured.

## Performance

- Responsive WebP at three sizes with `srcset`/`sizes`; the hero is preloaded, the rest
  are lazy-loaded. Every `<img>` carries `width`/`height` so nothing shifts.
- No framework, no CDN scripts, no analytics. Three small local JS files, deferred.
- The one heavy third-party embed (the map) loads only on request.
- Animation is transform/opacity only, driven by `IntersectionObserver` and a single
  rAF-throttled scroll listener. The hero parallax is skipped entirely on small
  touchscreens.

---

## File map

```
index.html              the whole site — all nine sections
privacy.html            \
cookies.html             > generated by tools/build-legal.py
terms.html              /
assets/
  css/styles.css        design tokens, layout, components
  js/config.js          ← the file you edit for integrations
  js/main.js            nav, reveals, parallax, gallery, lightbox, consent
  js/booking.js         the booking flow
  img/                  generated WebP sizes + favicon + share card
source-photos/          the originals (see the licensing note above)
tools/
  build-images.py       regenerates assets/img from source-photos
  build-legal.py        regenerates the three legal pages
robots.txt, sitemap.xml
.github/workflows/pages.yml
```

---

© Gallery Barbers. Site content and photographs belong to the business; they are not
licensed for reuse. Google, Google Maps and the Google logo are trademarks of Google LLC.
