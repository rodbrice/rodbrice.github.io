import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import config from "../lighthouserc.json";

const urls = [
  "/",
  "/pt/",
  "/fr/",
  "/projects/rot-and-resolve/",
  "/pt/projects/field-operations/",
  "/fr/projects/property-management/",
];

describe("Lighthouse performance gate", () => {
  it("collects three runs of all six approved pages from the production build", () => {
    expect(config.ci.collect.staticDistDir).toBe("./dist");
    expect(config.ci.collect.url).toEqual(urls);
    expect(config.ci.collect.numberOfRuns).toBe(3);
  });

  it("enforces every approved budget as an error", () => {
    expect(config.ci.assert.assertions).toEqual({
      "categories:performance": ["error", { minScore: 0.95 }],
      "categories:accessibility": ["error", { minScore: 1 }],
      "categories:best-practices": ["error", { minScore: 0.95 }],
      "categories:seo": ["error", { minScore: 1 }],
      "largest-contentful-paint": ["error", { maxNumericValue: 1500 }],
      "cumulative-layout-shift": ["error", { maxNumericValue: 0.05 }],
      "resource-summary:script:size": ["error", { maxNumericValue: 20480 }],
      "total-blocking-time": ["error", { maxNumericValue: 150 }],
    });
  });

  it("documents the six measured URLs in the README budget", () => {
    const readme = readFileSync(
      new URL("../README.md", import.meta.url),
      "utf8",
    );
    const budget = readme
      .split("The Lighthouse budget")[1]
      ?.split("CI also")[0];
    expect(budget?.match(/^- `([^`]+)`$/gm)).toEqual(
      urls.map((url) => `- \`${url}\``),
    );
  });
});
