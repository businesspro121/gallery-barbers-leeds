# React component integration — `woven-cloth`

## What this project actually is

**This repository is not a React project.** It is a static site: plain HTML, CSS
and vanilla JavaScript, with no build step, no bundler, no `package.json`.

So there is no shadcn/ui structure, no Tailwind CSS and no TypeScript here yet.
That means the component could not simply be dropped in and imported — there was
nothing to import it *into*. Both halves are therefore provided:

| Path | What it is | Runs today? |
|---|---|---|
| `components/ui/woven-cloth.tsx` | The React/TypeScript component, rebranded to Gallery Barbers | Only after the setup below |
| `components/ui/woven-cloth-demo.tsx` | The hero section built with it | Only after the setup below |
| `assets/js/hero-cloth.js` | A vanilla port of the same simulation, wired into the live hero | **Yes** — it is running on the site now |

If you are only looking at the website, you want `assets/js/hero-cloth.js`. The
`.tsx` files are here so the component is ready the day this becomes a React app.

---

## What changed from the original component

The task was to make the title text and colour match the site. Both are now
driven by two exported constants at the top of `woven-cloth.tsx`, so nothing is
buried in the embedded document:

```ts
export const WOVEN_CLOTH_BRAND = {
  ink: "#0B0B0C",       // page ground
  ivory: "#F4F0E8",     // headline / woven type
  gold: "#C6A15B",      // hem, accents
  goldDeep: "#7A6030",
  // …
};

export const WOVEN_CLOTH_WORDMARK = {
  monogram: "G B",
  eyebrow: "· LEEDS ·",
  lineOne: "GALLERY",
  lineTwo: "BARBERS",
  footerOne: "K I R K G A T E   M A R K E T",
  footerTwo: "S T A L L   1 0 – 1 1",
};
```

Concretely, against the component as supplied:

- **Title text** — `LUMINA` / `WEAVERS` / `· KYOTO ·` / `KINETIC TEXTILES 2024`
  became `GALLERY` / `BARBERS` / `· LEEDS ·` / `KIRKGATE MARKET` /
  `STALL 10–11`, and the `L W` monogram became `G B`.
- **Cloth colour** — the ivory ground (`#efe6d4 → #e3d7bf`) became charcoal
  (`#1C1C20 → #0D0D10`); the crimson hem (`#a5202c` / `#7c1622`) became antique
  gold (`#C6A15B` / `#7A6030`); the woven lettering became warm ivory.
- **Lighting** — the crimson rim light became a gold rim light
  (`0xb02330 → 0xC6A15B`), and the specular was warmed to `0x2A2418`.
- **Overlay** — the crimson CTA became the site's gold button on charcoal, and
  the copy became the real hero copy (headline, trust line, opening hours,
  walk-ins).
- **Title attribute** — `"Woven Cloth kinetic textile"` → `"Gallery Barbers woven cape"`.

Everything else — the Verlet cloth physics, the focus/isolation adapter, the
`hue`/`saturation`/`brightness` props, the `sandbox="allow-scripts"` iframe — is
unchanged.

---

## Default paths, and why `components/ui`

shadcn/ui reads its paths from `components.json` at the project root. The
defaults it writes are:

```json
{
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "utils": "@/lib/utils"
  },
  "tailwind": { "css": "app/globals.css" }
}
```

So the default component path **is** `@/components/ui`, and the default stylesheet
is `app/globals.css` (`src/app/globals.css` when you use a `src` directory).
This repository had neither, so `components/ui/` was created to match that
convention.

**Why that exact folder matters**

1. The `@/components/ui` alias is what every shadcn snippet and every published
   registry component imports from. `import WovenCloth from "@/components/ui/woven-cloth"`
   only resolves if the file is there.
2. `npx shadcn@latest add …` writes into it. If your components live somewhere
   else, the CLI creates a *second* home and you end up with two `button.tsx`
   files that drift apart.
3. It draws the line between primitives (`components/ui/*` — generic, styled,
   reusable) and product code (`components/*` — assembled, business-specific).
   That separation is what makes it safe to re-run the CLI to update a
   primitive.

---

## Setting the project up

Only needed if you want the React version. The live site does not require any of
this.

### 1. Create a Next.js app with TypeScript and Tailwind

```bash
npx create-next-app@latest gallery-barbers-app --typescript --tailwind --eslint --app --use-npm
```

Answer **Yes** to the import alias prompt and keep the default `@/*`.

To add TypeScript and Tailwind to an *existing* React app instead:

```bash
npm install -D typescript @types/react @types/node
npx tsc --init
npm install -D tailwindcss @tailwindcss/postcss postcss
```

…then add `@import "tailwindcss";` to your global stylesheet (Tailwind v4). For
Tailwind v3 use `npx tailwindcss init -p` and the three `@tailwind` directives.

### 2. Initialise shadcn/ui

```bash
cd gallery-barbers-app
npx shadcn@latest init
```

This writes `components.json`, creates `components/ui/` and `lib/utils.ts`, and
wires the CSS variables into your global stylesheet. Confirm the defaults so the
`@/components/ui` alias matches the import in `woven-cloth-demo.tsx`.

### 3. Confirm the alias in `tsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  }
}
```

### 4. Drop the component in

```bash
cp components/ui/woven-cloth.tsx       <app>/components/ui/woven-cloth.tsx
cp components/ui/woven-cloth-demo.tsx  <app>/components/ui/woven-cloth-demo.tsx
```

### 5. Use it

```tsx
import WovenClothDemo from "@/components/ui/woven-cloth-demo";

export default function Page() {
  return <WovenClothDemo />;
}
```

Or drop just the backdrop into a hero of your own:

```tsx
import WovenCloth from "@/components/ui/woven-cloth";

<section className="relative isolate min-h-[100svh] overflow-hidden bg-[#0B0B0C]">
  <WovenCloth className="absolute inset-0 -z-20 h-full w-full" />
  {/* your headline and CTAs here */}
</section>
```

No extra dependencies are needed. The component is self-contained: Three.js,
GSAP and Tailwind are loaded from CDNs *inside* the sandboxed iframe, not by your
app.

---

## A note on the two versions

The `.tsx` component renders inside an iframe that pulls five scripts from three
CDNs (Tailwind, GSAP, GSAP ScrollTrigger, Three.js, Iconify). That is fine for a
component you drop into a page, but it is a lot to put in front of a local
business's hero.

`assets/js/hero-cloth.js` is the same simulation and the same palette, running
directly on a `<canvas>` in the page. It loads one script — Three.js, and only
after the browser is idle — and it never blocks first paint:

- the hero photograph paints immediately and stays underneath;
- the cloth is skipped entirely on reduced motion, on save-data or 2G
  connections, and where WebGL is unavailable;
- the simulation pauses when the hero scrolls out of view or the tab is hidden;
- the footer animation toggle switches it off mid-visit.

If it never loads, the hero is simply the photograph. Nothing breaks.
