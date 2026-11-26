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

The Lighthouse budget in `lighthouserc.json` checks the median of three runs
for each of these six URLs:

- `/`
- `/pt/`
- `/fr/`
- `/projects/theone/`
- `/pt/projects/field-operations/`
- `/fr/projects/property-management/`

It requires performance and best practices ≥ 0.95, accessibility and SEO = 1,
largest contentful paint (LCP) ≤ 1500 ms, cumulative layout shift (CLS) ≤ 0.05,
script transfer size ≤ 20 KB (20,480 bytes), and total blocking time (TBT)
≤ 150 ms.

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

## Projects

Each project is a Markdown file per language in
`src/content/projects/<locale>/<slug>.md`: the front matter feeds the card on
the home page (schema in `src/content.config.ts`) and the body is the case
study at `/projects/<slug>/`. Set `caseStudy: false` for a card without a page,
and `confidential: true` for private code, which adds a note that names, screens
and code are withheld; add `clientWork: false` when it is a private project of
the author's rather than client work. Each card shows a one-line `problem`,
a one-line `contribution`, a `status` (labelled per language in
`src/i18n/ui.ts`), at most six `stack` tags and one action: the case study,
else the public `source`, else a private-project note. Case studies open with
their first section, the business story, before the facts and figure. Figures
are listed in `src/data/diagrams.ts`: SVG architecture diagrams in
`src/components/Diagram.astro`, the field-to-office flow in
`src/components/FlowDiagram.astro`; a case study without one has no figure.
Screenshots go in `src/assets/` and are listed under `media`; Astro serves them
as responsive AVIF/WebP. The build fails if a project is missing in a language,
its translations disagree on order, stack, `caseStudy`, `status`, visibility or
`source`, or its card would have no action.

## Project structure

```text
public/          Static files copied as-is
scripts/         Repository checks, with their unit tests
src/components/  Header, footer, project cards, language picker and theme toggle
src/content/     Projects, one Markdown file per language
src/data/        Public profile links
src/i18n/        Locales, URL helpers and interface strings
src/layouts/     Page shells
src/lib/         Pure helpers, with unit tests
src/pages/       One file per route
src/scripts/     Client-side logic, with unit tests
src/styles/      Design tokens, reset and global styles
tests/e2e/       Playwright browser and accessibility tests
```

## License

The source code is released under the [MIT License](LICENSE).

The written content, images and personal branding of the site are not covered
by that license: © Roduit Brice, all rights reserved.
