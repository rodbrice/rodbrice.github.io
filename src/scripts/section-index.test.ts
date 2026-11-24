import { readFileSync } from "node:fs";

import { expect, it } from "vitest";

it("keeps the complete section index script within 1 KB before minification", () => {
  const source = readFileSync(new URL("./section-index.ts", import.meta.url));
  expect(source.byteLength).toBeLessThanOrEqual(1000);
});
