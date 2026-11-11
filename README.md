# CV Master Builder

A free, open-source, browser-based CV / resume builder.

**Live site:** https://diyarkrd.github.io/cv-builder-/

## Features

- 46 CV templates across 6 categories (Minimal, Professional, Creative, Bold, Dark)
- Live WYSIWYG editing — click any text on the CV to edit it
- Drag & drop section reordering, automatic A4 pagination
- Customize colors, fonts, photo style, spacing, layout
- AI assistant (free providers, optional OpenRouter key)
- Import existing CV from PDF or TXT
- Print / PDF export via the browser
- All data stays in your browser (localStorage)

## Tech stack

React 19 + TypeScript + Vite 7 + Tailwind CSS 3 + shadcn/ui (Radix) + pdf.js

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build

```bash
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build
```

## Deploy to GitHub Pages

The repo includes `.github/workflows/deploy.yml`, which builds the app and
deploys `dist/` to GitHub Pages on every push to `main`.

In the repository settings, make sure **Settings → Pages → Source** is set to
**GitHub Actions** (not "Deploy from a branch"), otherwise the raw unbuilt
source gets served and the site shows a blank page.

The `base` path in `vite.config.ts` must match the repository name:

```ts
base: '/cv-builder-/'
```
