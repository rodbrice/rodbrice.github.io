import { describe, expect, it } from "vitest";

import { LOCALES } from "../i18n/locales.ts";
import { useTranslations } from "../i18n/ui.ts";
import { flowLabels } from "./diagram-labels.ts";
import { figureFor, hasDiagram, PROJECT_FIGURES } from "./diagrams.ts";

describe("project figures", () => {
  it("are optional: a project without an approved figure has none", () => {
    expect(hasDiagram("facture-qr")).toBe(false);
    expect(hasDiagram("plan-review")).toBe(false);
    expect(figureFor("plan-review")).toBeUndefined();
  });

  it("show the field-to-office flow as an illustration with synthetic data", () => {
    expect(figureFor("field-operations")).toEqual({
      kind: "flow",
      title: "project.flow",
      note: "project.synthetic",
    });
  });

  it.each(LOCALES)("%s labels every figure and its caption", (locale) => {
    const t = useTranslations(locale);
    for (const { title, note } of Object.values(PROJECT_FIGURES)) {
      expect(t(title)).not.toBe("");
      expect(t(note)).not.toBe("");
    }
  });

  it.each(LOCALES)(
    "%s draws tablet, sync, review queue and validation, then the outputs",
    (locale) => {
      const { steps, formats } = flowLabels[locale];
      expect(steps).toHaveLength(flowLabels.en.steps.length);
      expect(steps).toHaveLength(4);
      expect(formats).toHaveLength(3);
      expect(formats.slice(0, 2)).toEqual(["PDF", "Excel"]);
      expect(formats[2]).toContain("SAP");
      for (const { title, detail } of steps) {
        expect(title).toBe(title.trim());
        expect(detail).not.toBe("");
      }
    },
  );

  it.each(LOCALES)("%s captions the flow as synthetic", (locale) => {
    expect(useTranslations(locale)("project.synthetic")).toMatch(
      /synthetic|synthétiques|sintéticos/,
    );
  });
});
