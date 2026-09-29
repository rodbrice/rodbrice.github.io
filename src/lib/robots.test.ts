import { describe, expect, it } from "vitest";

import { robotsTxt } from "./robots.ts";

describe("robotsTxt", () => {
  it("allows crawling and points at the sitemap of the site", () => {
    expect(robotsTxt(new URL("https://rodbrice.github.io"))).toBe(
      "User-agent: *\nAllow: /\n\nSitemap: https://rodbrice.github.io/sitemap-index.xml\n",
    );
  });
});
