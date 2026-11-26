import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { LOCALES } from "../i18n/locales.ts";
import type { Locale } from "../i18n/locales.ts";
import { ui } from "../i18n/ui.ts";
import { AI_ASSISTED_DEVELOPMENT, SKILLS, TIMELINE } from "./experience.ts";

const PROJECTS_DIR = new URL("../content/projects/", import.meta.url);

/** A project's Markdown source in one locale. */
function projectSource(locale: Locale, slug: string): string {
  return readFileSync(new URL(`${locale}/${slug}.md`, PROJECTS_DIR), "utf8");
}

/** The display position of a project, from its front matter. */
function projectOrder(slug: string): number {
  return Number(/^order: (\d+)$/m.exec(projectSource("en", slug))?.[1]);
}

/** Vendor and product names of AI coding tools; the site names none of them. */
const AI_TOOL_NAMES =
  /claude|anthropic|openai|chatgpt|copilot|codex|cursor|gemini|windsurf/i;

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
      for (const { label, skills } of SKILLS) {
        // A way of working, not a technology from the timeline or projects.
        if (label.en === AI_ASSISTED_DEVELOPMENT.en) continue;
        for (const skill of skills) {
          expect(sources).toContain(skill[locale].toLowerCase());
        }
      }
    },
  );
});

describe("skill groups", () => {
  const slugs = readdirSync(new URL("en/", PROJECTS_DIR)).map((file) =>
    file.replace(/\.md$/, ""),
  );

  it.each(SKILLS.map((group) => [group.label.en, group] as const))(
    "%s links to existing projects, in display order",
    (_, { projects }) => {
      expect(projects.length).toBeGreaterThan(0);
      expect(new Set(projects).size).toBe(projects.length);
      for (const slug of projects) expect(slugs).toContain(slug);
      const orders = projects.map(projectOrder);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
    },
  );

  it.each(SKILLS.map((group) => [group.label.en, group] as const))(
    "%s links only to projects that show these skills",
    (label, { skills, projects }) => {
      for (const slug of projects) {
        const markdown = projectSource("en", slug).toLowerCase();
        const stack = /^stack: \[(.*)\]$/m.exec(markdown)?.[1] ?? "";
        const source = markdown.replace(/\s+/g, " ");
        if (label === AI_ASSISTED_DEVELOPMENT.en) {
          // The case study says how supervised coding agents were used.
          expect(source).toMatch(/supervised coding (agents|assistance)/);
        } else if (label === "Testing and delivery") {
          expect(source).toMatch(/\btests?\b/);
        } else {
          expect(
            skills.some(({ en }) => stack.includes(en.toLowerCase())),
          ).toBe(true);
        }
      }
    },
  );

  it("puts Python with the public projects written in it", () => {
    const python = SKILLS.find(({ skills }) =>
      skills.some(({ en }) => en === "Python"),
    );
    expect(python?.projects).toEqual(["plan-review", "agv-dispatch"]);
  });
});

describe("AI tools", () => {
  it.each(LOCALES)("%s names no AI vendor or product", (locale) => {
    const texts = [
      ...Object.values(ui[locale]),
      ...SKILLS.flatMap(({ label, skills }) => [
        label[locale],
        ...skills.map((skill) => skill[locale]),
      ]),
      ...TIMELINE.flatMap((entry) =>
        Object.values(entry).map(
          (field: Record<Locale, string>) => field[locale],
        ),
      ),
      ...readdirSync(new URL(`${locale}/`, PROJECTS_DIR)).map((file) =>
        projectSource(locale, file.replace(/\.md$/, "")),
      ),
    ];
    for (const text of texts) expect(text).not.toMatch(AI_TOOL_NAMES);
  });
});
