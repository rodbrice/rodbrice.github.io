/// <reference types="astro/client" />

// Lets type-aware tooling outside Astro's own checker, such as ESLint, type
// `.astro` imports in TypeScript files. `astro check` still resolves each
// component's real props.
declare module "*.astro" {
  import type { AstroComponentFactory } from "astro/runtime/server/index.js";

  const component: AstroComponentFactory;
  export default component;
}
