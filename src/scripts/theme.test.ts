import { describe, expect, it } from "vitest";

import { oppositeTheme, parseTheme, resolveTheme } from "./theme.ts";

describe("parseTheme", () => {
  it("accepts the two known themes", () => {
    expect(parseTheme("light")).toBe("light");
    expect(parseTheme("dark")).toBe("dark");
  });

  it("rejects anything else", () => {
    expect(parseTheme(null)).toBeUndefined();
    expect(parseTheme(undefined)).toBeUndefined();
    expect(parseTheme("")).toBeUndefined();
    expect(parseTheme("Dark")).toBeUndefined();
  });
});

describe("resolveTheme", () => {
  it("follows the system preference when nothing was chosen", () => {
    expect(resolveTheme(undefined, true)).toBe("dark");
    expect(resolveTheme(undefined, false)).toBe("light");
  });

  it("prefers an explicit choice over the system preference", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
});

describe("oppositeTheme", () => {
  it("switches between light and dark", () => {
    expect(oppositeTheme("light")).toBe("dark");
    expect(oppositeTheme("dark")).toBe("light");
  });
});
