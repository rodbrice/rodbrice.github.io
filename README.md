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

| Command             | What it does                                             |
| ------------------- | -------------------------------------------------------- |
| `pnpm dev`          | Start the dev server                                     |
| `pnpm build`        | Build the static site into `dist/`                       |
| `pnpm preview`      | Serve the production build locally                       |
| `pnpm check`        | Type-check `.astro` and TypeScript files                 |
| `pnpm lint`         | Lint with ESLint (type-aware rules and a11y checks)      |
| `pnpm format`       | Format everything with Prettier                          |
| `pnpm format:check` | Check formatting without writing                         |
| `pnpm test`         | Run unit tests with Vitest                               |
| `pnpm test:e2e`     | Run browser tests and axe accessibility checks on `dist` |
| `pnpm check:images` | Fail if a committed image still carries EXIF/XMP data    |
| `pnpm check:html`   | Validate the built HTML                                  |
| `pnpm check:links`  | Check internal links in the built site                   |
| `pnpm verify`       | Run all of the above, in the order CI does               |

Browser tests need Chromium once: `pnpm exec playwright install chromium`.

CI also scans the full git history for secrets with
[gitleaks](https://github.com/gitleaks/gitleaks). Images must be committed
without metadata; `exiftool -all= <file>` strips it.

## Project structure

```text
public/        Static files copied as-is
scripts/       Repository checks, with their unit tests
src/layouts/   Page shells
src/pages/     One file per route
tests/e2e/     Playwright browser and accessibility tests
```

## License

The source code is released under the [MIT License](LICENSE).

The written content, images and personal branding of the site are not covered
by that license: © Roduit Brice, all rights reserved.
