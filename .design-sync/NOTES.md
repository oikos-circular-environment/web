# design-sync notes — oikos-web

## Repo shape

`oikos-web` is a Next.js **app**, not a publishable component package — there is no `build` script that emits a `dist/` entry with `main`/`module`/`exports`. shadcn/ui components live as loose source files in `src/components/ui/*.tsx` (button, card, field, input, label, navigation-menu, separator, sonner, textarea), copied in by the shadcn CLI rather than built/versioned.

This means the converter runs in **synth-entry mode** (`[NO_DIST]`), scanning `srcDir: "src/components/ui"` directly via ts-morph instead of a compiled `.d.ts` tree. Prop extraction is a bit weaker than a real `dist/` build would give, but was sufficient here — `31/31` components parsed cleanly.

## Self-package symlink (required for synth-entry mode)

The converter's non-`--entry` path resolves `PKG_DIR` as `<node-modules>/<cfg.pkg>` — i.e. it expects the DS package to be installed under its own `node_modules`, which is never true for an app's own source. Fix applied:

```sh
ln -sfn .. node_modules/oikos-web
```

This makes `node_modules/oikos-web` a self-referencing symlink back to the repo root, so `PKG_DIR` resolves to the real `package.json`/`src/`/`tsconfig.json`. **Re-create this symlink on every fresh clone** — it's inside `node_modules/`, which is gitignored and rebuilt by `npm ci`.

## CSS: compiled Tailwind v4, not the raw source

`src/app/globals.css` is Tailwind v4 CSS-first source (`@import "tailwindcss"; @theme inline { ... }`) — the converter's CSS scrape needs an actually-**compiled** stylesheet with real utility-class rules, not the `@theme`/`@import` source. Fix applied: `.ds-sync/compile-tailwind.mjs` runs `@tailwindcss/postcss` over `src/app/globals.css` (Tailwind v4's automatic content detection scans the whole project — no explicit content glob needed) and writes the compiled output to `.design-sync/generated/tailwind.css`, which `cfg.cssEntry` points at.

**This compiled file is NOT committed** (generated, gitignored) — **re-run `node .ds-sync/compile-tailwind.mjs` before every rebuild**, otherwise `cfg.cssEntry` points at a stale or missing file. Re-syncs should treat this as an extra pre-build step alongside `cfg.buildCmd` (there is no real `buildCmd` here — this compile step + the synth-entry scan together stand in for one).

## Preview scope decision (2026-07-08 first sync)

User chose **floor cards only** for this first sync (8 real components / 31 exported symbols including subcomponents — small enough that authoring can happen incrementally on any future re-sync, not required upfront).

Three components' default synth-entry crash-safe render came out **blank** (not the honest floor card — an actual empty render), so those three got minimal authored previews to clear the render-check gate rather than shipping a broken card:
- `Button` — default crash-safe props render an empty `<button>` with no label.
- `FieldSeparator` — a bare `<hr>`-equivalent with no children is real but only 20px tall, under the `[RENDER_BLANK]` byte threshold.
- `NavigationMenuItem` — a Radix `Item` with no content only renders meaningfully composed inside `NavigationMenu > NavigationMenuList`.

All other 28 exports ship as the honest typographic floor card (unauthored, not broken) — a good next target for incremental authoring on a future re-sync.

## Known render warns

None outstanding — render check is clean (`31/31`) as of the sync above.

## Re-sync risks

- **The self-package symlink and the compiled-Tailwind step are both outside git** (node_modules + generated dir) — a fresh clone or CI box needs both re-created before `package-build.mjs`/`resync.mjs` will work. Neither failure mode is obvious from the converter's own error messages (`ENOENT .../oikos-web/package.json` for the symlink; `[CSS_RUNTIME]` self-styling fallback for the missing compiled CSS) — this file is the only record of the fix.
- **Tailwind's automatic content detection** means the compiled CSS reflects whatever classes exist anywhere in the app at compile time, not just `src/components/ui/`. If a shadcn primitive's classes are only used deep in an app route Tailwind's scanner missed, they could theoretically be absent — not observed here, but worth a second look if a future re-sync shows unstyled utility classes that weren't a problem this time.
- **synth-entry `.d.ts` quality**: without a real `dist/` build, prop types come from ts-morph reading `src/components/ui/*.tsx` directly. If shadcn's CLI regenerates a component with a materially different prop shape, re-verify the emitted `.d.ts` looks right rather than assuming it's still accurate.
- 25 of 31 components are still on the floor card (unauthored) — the next incremental sync should confirm with the user whether to author more before assuming this is "done."
