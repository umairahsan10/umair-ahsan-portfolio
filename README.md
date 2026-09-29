# Umair Ahsan — Portfolio

Personal portfolio site: React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion + Lenis.

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   `npm install`
2. Start the dev server:
   `npm run dev`
3. Production build:
   `npm run build`

## Structure

- `lib/motion-tokens.ts` — central motion tokens (durations, easings, springs, variants). No hardcoded animation values elsewhere.
- `styles/index.css` — Tailwind entry + design tokens (`--color-*` variables, dark mode overrides).
- `components/ui/` — shared primitives (`Section`, `StaggerGroup`/`StaggerItem`, `Cursor`, `Magnetic`).
- `scripts/optimize-images.mjs` — converts project screenshots in `public/projects` to WebP:
  `npm run optimize-images` (keep `.webp` filenames in sync with `components/Projects.tsx`).
- `scripts/qa.mjs` — visual + functional QA (screenshots, console errors, anchors, theme, scrollspy).
  First run: `npx playwright install chromium`, then start `npm run preview` and run `npm run qa`.
  Screenshots land in `qa-screenshots/` (gitignored).

## Checks

- `npm run typecheck` — strict TypeScript
- `npm run build` — production build
