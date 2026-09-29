import { describe, expect, it } from "vitest";

import { LOCALES } from "./locales.ts";
import { ui, useTranslations } from "./ui.ts";

describe("UI dictionaries", () => {
  const englishKeys = Object.keys(ui.en).sort();

  it.each(LOCALES)("%s defines exactly the English keys", (locale) => {
    expect(Object.keys(ui[locale]).sort()).toEqual(englishKeys);
  });

  it.each(LOCALES)("%s has no empty or padded strings", (locale) => {
    for (const [key, value] of Object.entries(ui[locale])) {
      expect(value, key).not.toBe("");
      expect(value, key).toBe(value.trim());
    }
  });

  it.each(LOCALES.filter((locale) => locale !== "en"))(
    "%s translates the page texts instead of copying English",
    (locale) => {
      const t = useTranslations(locale);
      expect(t("home.eyebrow")).not.toBe(ui.en["home.eyebrow"]);
      expect(t("notFound.title")).not.toBe(ui.en["notFound.title"]);
    },
  );
});
