import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { LOCALES } from "../i18n/locales.ts";
import type { Locale } from "../i18n/locales.ts";
import { SKILLS, TIMELINE } from "./experience.ts";

const PROJECTS_DIR = new URL("../content/projects/", import.meta.url);

/** The `stack` list of every project written in the given locale. */
function projectStacks(locale: Locale): string[] {
  const dir = new URL(`${locale}/`, PROJECTS_DIR);
  return readdirSync(dir).flatMap((file) => {
    const source = readFileSync(new URL(file, dir), "utf8");
    const stack = /^stack: \[(.*)\]$/m.exec(source)?.[1] ?? "";
    return stack.split(",").map((name) => name.trim());
  });
}

describe("timeline", () => {
  it.each(LOCALES)("%s has no empty or padded texts", (locale) => {
    for (const { period, title, place, description } of TIMELINE) {
      for (const field of [period, title, place, description]) {
        const text = field[locale];
        expect(text).not.toBe("");
        expect(text).toBe(text.trim());
      }
    }
  });
});

describe("technologies", () => {
  it.each(LOCALES)(
    "%s lists only technologies named in the timeline or the projects",
    (locale) => {
      const sources = [
        ...TIMELINE.map(({ description }) => description[locale]),
        ...projectStacks(locale),
      ]
        .join("\n")
        .toLowerCase();
      for (const { skills } of SKILLS) {
        for (const skill of skills) {
          expect(sources).toContain(skill[locale].toLowerCase());
        }
      }
    },
  );
});
