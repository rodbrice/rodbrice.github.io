export type Theme = "light" | "dark";

/** localStorage key for an explicit theme choice. Also read by the inline script in BaseLayout. */
export const THEME_STORAGE_KEY = "theme";

export function parseTheme(
  value: string | null | undefined,
): Theme | undefined {
  return value === "light" || value === "dark" ? value : undefined;
}

/** An explicit choice wins; otherwise the operating system preference decides. */
export function resolveTheme(
  explicit: Theme | undefined,
  prefersDark: boolean,
): Theme {
  return explicit ?? (prefersDark ? "dark" : "light");
}

export function oppositeTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}
