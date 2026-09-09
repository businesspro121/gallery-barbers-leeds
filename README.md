# Gallery Barbers — Leeds Kirkgate Market

A mobile-first website for **Gallery Barbers**, a unisex barber shop on
Stall 10–11, Leeds Kirkgate Market, Leeds LS2 7HJ.

Plain HTML, CSS and JavaScript. No build step, no framework, no npm install —
open `index.html` and it runs.

**This build is client-ready.** There are no placeholder banners, no
"not connected" badges and no developer instructions anywhere on the page. Every
section is populated and every interaction works.

---

## Before it goes live

Short list. Nothing here blocks showing the site to the client.

| What | Where | Note |
|---|---|---|
| **Prices and durations** | `index.html`, Services section | Indicative and typical for the trade. Confirm the shop's real figures and edit in place. |
| **Opening hours** (Mon–Sat 9:00–17:30) | `assets/js/config.js` → `hours` | Transcribed from the shop's own window sign. Worth a confirming phone call — they drive the booking slots *and* the Google structured data. |
| **Facebook / TikTok** | `assets/js/config.js` → `social` | Empty, so no button is shown. Add a URL and the button appears by itself. The shop's window sign shows a Facebook logo, so the page probably exists. |
| **Domain** | `index.html`, `robots.txt`, `sitemap.xml` | Currently `businesspro121.github.io/gallery-barbers-leeds`. Search that string and replace it everywhere. |
| **Photography rights** | `source-photos/` | See below. |

### Photography

All ten supplied images are used. Four are demonstrably the shop's own — the
same white brick wall runs through them:

- `logo.png` — the shopfront
- `1.png` — the interior
- `3.png` — a 2×2 sheet of their own cuts, split into four tiles
- `4.png` — colour and curl work

The other six (`2`, `5`, `6`, `7`, `8`, `9`) are style-reference and portfolio
shots on backgrounds that do not match the shop, so they were most likely
collected from elsewhere. **`5.png` is built from celebrity press photographs**
(Jennifer Lawrence, Brittany Murphy), which on a business website raises
implied-endorsement questions on top of copyright.

They are fine for a sample the client is reviewing. Before the site is published
to the public, either confirm the shop owns them or swap them for the shop's own
photographs. `tools/build-images.py` regenerates everything from
`source-photos/`, so replacing a file and re-running is the whole job.

Any photograph showing a recognisable customer needs that customer's permission.

---

## Getting it onto GitHub

```bash
git remote add origin https://github.com/<your-username>/gallery-barbers-leeds.git
git push -u origin main
```

Then in the repo: **Settings → Pages → Source: GitHub Actions**. The workflow in
`.github/workflows/pages.yml` publishes on every push to `main`.

To preview locally:

```bash
python -m http.server 8123
```

---

## Editing the site

### Prices and services

They live in `index.html`, not a JavaScript file, so Google can read them. Each
service is one block:

```html
<li class="svc">
  <h4 class="svc__name">Skin Fade</h4>
  <span class="svc__price">£16</span>
  <p class="svc__desc">Taken down to the skin and blended clean…</p>
  ...
</li>
```

Copy a block to add a service, delete it to remove one, copy a whole
`<div class="svc__cat">` to add a category.

**The booking form's service menu builds itself from this list at page load** —
there is no second place to update.

### Gallery

Each photo is one `<li class="tile" data-cat="…">` in `index.html`. The
`data-cat` value drives the filter buttons: `haircuts`, `fades`, `beards`,
`ladies`, `designs`, `shop`. Always write a real `alt` description — it is read
aloud to screen readers.

### Photos

Drop new originals into `source-photos/` and run:

```bash
python tools/build-images.py
```

Needs Pillow (`pip install Pillow`). It produces every responsive WebP size,
splits the contact-sheet sources into individual tiles, and rebuilds the social
share card.

### Everything else

`assets/js/config.js` — phone, WhatsApp, opening hours, Google settings, social
links. Heavily commented, and the only file needed for integrations. Nothing
secret goes in it; it ships to the browser.

---

## The hero cloth

The hero backdrop is a barber's cape, pinned along the top and moving in the
draught, with the shop's name woven into it — Verlet cloth physics on a
Three.js plane (`assets/js/hero-cloth.js`).

It is strictly an enhancement layered over the hero photograph, which paints
immediately and stays underneath. The cloth loads only when the visitor has not
asked for reduced motion, the connection is not save-data or 2G, WebGL is
available, and the browser is idle after load. It pauses when the hero scrolls
out of view or the tab is hidden, and the footer animation toggle switches it
off mid-visit. If it never loads, the hero is simply the photograph.

The name is woven tone-on-tone rather than printed in ivory, so it reads as
fabric behind the headline instead of competing with it.

There is also a React/TypeScript version at `components/ui/woven-cloth.tsx`,
with setup instructions in [`components/README.md`](components/README.md).

---

## How the booking form works

By default (`booking.mode: "whatsapp"`) the form collects everything, then hands
the customer a pre-written WhatsApp message to send. This works from day one
with no backend, no monthly fee and no database.

To connect a real provider or form service:

```js
booking: { mode: "endpoint", endpoint: "https://…", live: false }
```

The form then POSTs JSON (`service`, `barber`, `date`, `time`, `name`, `phone`,
`email`, `notes`) with a proper loading → success → error sequence.

`live` stays `false` until that endpoint returns genuine availability. While it
is false the time slots come from the opening hours in `config.js` and the
wording says the shop will confirm — so no slot is ever presented as guaranteed.
The only times removed are ones that have already passed today.

---

## Compliance decisions worth knowing about

Deliberate, and worth understanding before changing:

- **No `aggregateRating` in the structured data.** The 4.9/342 figures are
  Google's, and Google's policy requires marked-up ratings to be collected by
  you, not aggregated from another site. The numbers are displayed on the page
  with a link to Google, which is fine; they are not marked up as first-party.
- **No review quotes.** Review text may only be shown through the official
  Places API with Google's attribution. Scraping Maps is prohibited and writing
  your own is worse, so the Reviews section presents the real figures, the
  Google link and the required trademark attribution — and nothing invented.
- **The Instagram grid uses the shop's own photographs**, each linking to the
  profile. It is not a scraped feed. Wire up the Instagram Basic Display API
  through your own server if you want it live.
- **The Google Map is consent-gated.** It does not load until the visitor asks,
  which keeps the site right with PECR/GDPR and keeps a third-party iframe out
  of the critical path. Google's attribution is preserved.
- **No analytics, no tracking, no advertising cookies.** Two preference values
  in local storage (`gb-motion`, `gb-consent`). If analytics are added later,
  the consent banner must gate them *before* they load and `cookies.html` must
  be updated.
- **The legal pages are templates.** `privacy.html`, `cookies.html` and
  `terms.html` accurately describe how this site behaves, but the shop should
  read them, add a contact email, and have them checked.

---

## Accessibility

- Semantic landmarks, one `h1`, no heading-level jumps, skip link.
- Buttons, form controls and nav links are at least 44 px tall. The only smaller
  targets are links inside a sentence, which WCAG 2.5.8 exempts.
- Visible gold focus rings, never removed. Full keyboard operation, including
  the gallery lightbox (arrow keys, Home/End, Escape).
- Form errors appear next to the field *and* in a focusable summary, with
  `aria-invalid` and `aria-describedby` wired up; a polite live region announces
  step changes and submission.
- Every text/background pair on the page was measured in-browser and meets
  WCAG AA.
- **Reduced motion** is honoured from the OS *and* through a visible toggle in
  the footer. It is applied before first paint, and it disables the hero cloth,
  the reveals and the marquee.

## Performance

- Responsive WebP at two or three sizes each with `srcset`/`sizes`; the hero is
  preloaded, the other forty-odd images are lazy-loaded. Every `<img>` carries
  `width`/`height`, so nothing shifts.
- No framework, no analytics, no web fonts beyond the two families.
- Three.js is the only third-party runtime script, loaded after `load` during
  idle time, and skipped entirely on reduced motion or a constrained connection.
- The map iframe loads only on request.
- Animation is transform/opacity only, driven by `IntersectionObserver` and a
  single rAF-throttled scroll listener.

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
  js/main.js            nav, reveals, gallery, lightbox, consent, motion toggle
  js/booking.js         the booking flow
  js/hero-cloth.js      the woven cape in the hero
  img/                  generated WebP sizes + favicon + share card
components/
  README.md             React/shadcn setup, and what changed in the component
  ui/woven-cloth.tsx    the React/TypeScript component, Gallery Barbers palette
  ui/woven-cloth-demo.tsx   the hero section built with it
source-photos/          the originals (see the photography note above)
tools/
  build-images.py       regenerates assets/img from source-photos
  build-legal.py        regenerates the three legal pages
robots.txt, sitemap.xml
.github/workflows/pages.yml
```

---

© Gallery Barbers. Site content belongs to the business. Google, Google Maps and
the Google logo are trademarks of Google LLC.
