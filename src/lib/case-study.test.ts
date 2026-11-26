import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { LOCALES } from "../i18n/locales.ts";
import { splitStory } from "./case-study.ts";

describe("splitStory", () => {
  it("keeps the first section as the story and the rest after it", () => {
    const html =
      '<h2 id="problem">Problem</h2><p>Paper.</p>\n<h2 id="role">Role</h2><p>Me.</p><h2 id="x">X</h2>';
    expect(splitStory(html)).toEqual({
      story: '<h2 id="problem">Problem</h2><p>Paper.</p>\n',
      rest: '<h2 id="role">Role</h2><p>Me.</p><h2 id="x">X</h2>',
    });
  });

  it("treats a single section as all story", () => {
    const html = "<h2>Only</h2><p>Text.</p>";
    expect(splitStory(html)).toEqual({ story: html, rest: "" });
  });

  it("does not split on other headings or on h2-like tags", () => {
    const html = "<h2>A</h2><h3>B</h3><h2x>no</h2x><p>c</p>";
    expect(splitStory(html).rest).toBe("");
  });

  it("rejects a body that does not open with a section", () => {
    expect(() => splitStory("<p>Intro without heading.</p>")).toThrow(
      "level 2 section",
    );
  });
});

describe("case study bodies", () => {
  const dir = new URL("../content/projects/", import.meta.url);

  it.each(LOCALES)(
    "%s case studies open with a section, so the story comes first",
    (locale) => {
      for (const file of readdirSync(new URL(`${locale}/`, dir))) {
        const source = readFileSync(new URL(`${locale}/${file}`, dir), "utf8");
        if (/^caseStudy: false$/m.test(source)) continue;
        const body = source.split(/^---$/m)[2]?.trim() ?? "";
        expect(body, file).toMatch(/^## /);
        expect(body.match(/^## /gm)?.length ?? 0, file).toBeGreaterThan(1);
      }
    },
  );
});
