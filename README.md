# rodbrice.github.io

Source of my personal portfolio, published at <https://rodbrice.github.io>.

A static site built with [Astro](https://astro.build) and TypeScript. It ships
plain HTML and CSS, with no client-side framework.

## Requirements

- Node.js 24 (see `.nvmrc`; Astro needs 22.12 or later)
- pnpm 12 (the exact version is pinned in `package.json`)

## Getting started

```sh
pnpm install
pnpm dev
```

The dev server runs at <http://localhost:4321>.

## Scripts

| Command             | What it does                                        |
| ------------------- | --------------------------------------------------- |
| `pnpm dev`          | Start the dev server                                |
| `pnpm build`        | Build the static site into `dist/`                  |
| `pnpm preview`      | Serve the production build locally                  |
| `pnpm check`        | Type-check `.astro` and TypeScript files            |
| `pnpm lint`         | Lint with ESLint (type-aware rules and a11y checks) |
| `pnpm format`       | Format everything with Prettier                     |
| `pnpm format:check` | Check formatting without writing                    |
| `pnpm verify`       | Run every check CI runs, in the same order          |

## Project structure

```text
public/        Static files copied as-is
src/layouts/   Page shells
src/pages/     One file per route
```

## License

The source code is released under the [MIT License](LICENSE).

The written content, images and personal branding of the site are not covered
by that license: © Roduit Brice, all rights reserved.
