import { describe, expect, it } from "vitest";

import { parseProjectId, primaryAction, projectsFor } from "./projects.ts";
import type { ProjectEntry, ProjectFacts } from "./projects.ts";

const facts: ProjectFacts = {
  order: 1,
  stack: ["C#", "Unity"],
  caseStudy: true,
  status: "inDevelopment",
  confidential: false,
  clientWork: true,
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

  it.each<[string, Partial<ProjectFacts>]>([
    ["status", { status: "experiment" }],
    ["visibility", { confidential: true }],
    ["kind of private work", { clientWork: false }],
    ["source", { source: "https://github.com/rodbrice/other" }],
  ])("fails when translations disagree on the %s", (_, change) => {
    const entries = translations("theone").map((entry) =>
      entry.id === "pt/theone"
        ? { ...entry, data: { ...facts, ...change } }
        : entry,
    );
    expect(() => projectsFor(entries, "en")).toThrow(
      '"pt/theone" differs from "en/theone"',
    );
  });

  it("fails when a card would have no action", () => {
    const entries = translations("lonely", { caseStudy: false });
    expect(() => projectsFor(entries, "en")).toThrow(
      '"lonely": A project needs a case study, a public source or the confidential flag',
    );
  });
});

describe("primaryAction", () => {
  it("prefers the case study", () => {
    expect(
      primaryAction({ ...facts, source: "https://github.com/rodbrice/x" }),
    ).toEqual({ kind: "caseStudy" });
  });

  it("links to the public source when there is no case study", () => {
    expect(
      primaryAction({
        ...facts,
        caseStudy: false,
        source: "https://github.com/rodbrice/x",
      }),
    ).toEqual({ kind: "source", href: "https://github.com/rodbrice/x" });
  });

  it.each([true, false])(
    "names a private project without a page, client work %s",
    (clientWork) => {
      expect(
        primaryAction({
          ...facts,
          caseStudy: false,
          confidential: true,
          clientWork,
        }),
      ).toEqual({ kind: "private", clientWork });
    },
  );

  it("refuses a card that would lead nowhere", () => {
    expect(() => primaryAction({ ...facts, caseStudy: false })).toThrow(
      "needs a case study",
    );
  });
});
