import { describe, expect, it } from "vitest";

import { parseProjectId, projectsFor } from "./projects.ts";
import type { ProjectEntry, ProjectFacts } from "./projects.ts";

const facts: ProjectFacts = {
  order: 1,
  stack: ["C#", "Unity"],
  caseStudy: true,
};

function translations(
  slug: string,
  data: Partial<ProjectFacts> = {},
): ProjectEntry[] {
  return ["en", "pt", "fr"].map((locale) => ({
    id: `${locale}/${slug}`,
    data: { ...facts, ...data },
  }));
}

describe("parseProjectId", () => {
  it("reads the locale folder and the slug", () => {
    expect(parseProjectId("fr/theone")).toEqual({
      locale: "fr",
      slug: "theone",
    });
  });

  it.each(["theone", "de/theone", "en/", "en/a/b"])("rejects %s", (id) => {
    expect(() => parseProjectId(id)).toThrow("<locale>/<slug>.md");
  });
});

describe("projectsFor", () => {
  it("returns the projects of one locale in display order", () => {
    const entries = [
      ...translations("second", { order: 2 }),
      ...translations("first", { order: 1 }),
    ];
    const projects = projectsFor(entries, "pt");
    expect(projects.map(({ id }) => id)).toEqual(["pt/first", "pt/second"]);
    expect(projects.map(({ slug }) => slug)).toEqual(["first", "second"]);
  });

  it("fails when a translation is missing", () => {
    const entries = translations("theone").filter(
      ({ id }) => id !== "fr/theone",
    );
    expect(() => projectsFor(entries, "en")).toThrow(
      '"theone" has no fr translation',
    );
  });

  it("fails when translations disagree on the shared facts", () => {
    const entries = translations("theone").map((entry) =>
      entry.id === "fr/theone"
        ? { ...entry, data: { ...facts, stack: ["C#"] } }
        : entry,
    );
    expect(() => projectsFor(entries, "en")).toThrow(
      '"fr/theone" differs from "en/theone"',
    );
  });
});
