# rodbrice.github.io

Source of my personal portfolio, published at <https://rodbrice.github.io>.

A static site built with [Astro](https://astro.build) and TypeScript. It ships
plain HTML and CSS, with no client-side framework.

## Requirements

- Node.js 24 (see `.nvmrc`; Astro needs 22.12 or later)
- pnpm 10 (the exact version is pinned in `package.json`)

## Getting started

```sh
pnpm install
pnpm dev
```

The dev server runs at <http://localhost:4321>.

## Scripts

| Command                 | What it does                                             |
| ----------------------- | -------------------------------------------------------- |
| `pnpm dev`              | Start the dev server                                     |
| `pnpm build`            | Build the static site into `dist/`                       |
| `pnpm preview`          | Serve the production build locally                       |
| `pnpm check`            | Type-check `.astro` and TypeScript files                 |
| `pnpm lint`             | Lint with ESLint (type-aware rules and a11y checks)      |
| `pnpm format`           | Format everything with Prettier                          |
| `pnpm format:check`     | Check formatting without writing                         |
| `pnpm test`             | Run unit tests with Vitest                               |
| `pnpm test:e2e`         | Run browser tests and axe accessibility checks on `dist` |
| `pnpm check:images`     | Fail if a committed image still carries EXIF/XMP data    |
| `pnpm check:html`       | Validate the built HTML                                  |
| `pnpm check:links`      | Check internal links in the built site                   |
| `pnpm check:lighthouse` | Run Lighthouse on the built site against the budget      |
| `pnpm verify`           | Run all of the above, in the order CI does               |

Browser tests need Chromium once: `pnpm exec playwright install chromium`.
Lighthouse uses the Chrome it finds on the system; set `CHROME_PATH` to point it
at another build.

The Lighthouse budget in `lighthouserc.json` requires, on the median of three
runs per language: performance and best practices of at least 95,
accessibility and SEO of 100, a largest contentful paint under 1.5 s, a
cumulative layout shift under 0.05 and less than 10 kB of JavaScript.

CI also scans the full git history for secrets with
[gitleaks](https://github.com/gitleaks/gitleaks). Images must be committed
without metadata; `exiftool -all= <file>` strips it.

## Design

All colours, type sizes, spacing and motion live as CSS custom properties in
`src/styles/tokens.css`; components use those tokens rather than raw values.
Colours are defined in OKLCH for both themes with `light-dark()`. The site
follows the system theme, and the header button stores an explicit choice.

The accent colour is a single hue, currently amber (`65`). To change it, edit
`--accent-hue` in `src/styles/tokens.css` (for example `185` teal or `270`
indigo); the lightness of each theme is fixed so text contrast stays within
WCAG AA.

Inter is self-hosted from `@fontsource-variable/inter` (Latin subset only) and
preloaded, with a metric-matched fallback so the layout does not shift when it
loads.

## Publishing

Every push to `main` builds the site and deploys it to GitHub Pages
(`.github/workflows/deploy.yml`). The build writes a sitemap with the
translations of each page, a `robots.txt` that points to it, and Open Graph
tags for link previews; `public/og.png` is the shared preview image.

## Languages

The site is in English at the root, Portuguese under `/pt/` and French under
`/fr/`. The locale list and URL helpers live in `src/i18n/locales.ts`; interface
strings live in `src/i18n/ui.ts`, where TypeScript requires every language to
define exactly the English keys and a unit test checks the same at runtime.
Each page declares its canonical URL and `hreflang` alternates for all three
languages.

## Project structure

```text
public/          Static files copied as-is
scripts/         Repository checks, with their unit tests
src/components/  Header, footer, language picker and theme toggle
src/i18n/        Locales, URL helpers and interface strings
src/layouts/     Page shells
src/pages/       One file per route
src/scripts/     Client-side logic, with unit tests
src/styles/      Design tokens, reset and global styles
tests/e2e/       Playwright browser and accessibility tests
```

## License

The source code is released under the [MIT License](LICENSE).

The written content, images and personal branding of the site are not covered
by that license: © Roduit Brice, all rights reserved.
