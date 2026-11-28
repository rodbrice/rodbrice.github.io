import { describe, expect, it } from "vitest";

import {
  DEFAULT_LOCALE,
  LOCALE_INFO,
  LOCALES,
  isLocale,
  localizePath,
} from "./locales.ts";

describe("localizePath", () => {
  it("keeps the default locale at the root", () => {
    expect(localizePath("/", DEFAULT_LOCALE)).toBe("/");
    expect(localizePath("/projects/rot-and-resolve/", "en")).toBe(
      "/projects/rot-and-resolve/",
    );
  });

  it("prefixes the other locales", () => {
    expect(localizePath("/", "pt")).toBe("/pt/");
    expect(localizePath("/projects/rot-and-resolve/", "fr")).toBe(
      "/fr/projects/rot-and-resolve/",
    );
  });

  it("rejects relative paths", () => {
    expect(() => localizePath("projects/", "pt")).toThrow("absolute site path");
  });
});

describe("isLocale", () => {
  it("recognises the configured locales only", () => {
    for (const locale of LOCALES) expect(isLocale(locale)).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale("pt-BR")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe("LOCALE_INFO", () => {
  it("gives every locale a distinct language tag and label", () => {
    const info = LOCALES.map((locale) => LOCALE_INFO[locale]);
    expect(new Set(info.map(({ lang }) => lang)).size).toBe(LOCALES.length);
    expect(new Set(info.map(({ label }) => label)).size).toBe(LOCALES.length);
  });
});
