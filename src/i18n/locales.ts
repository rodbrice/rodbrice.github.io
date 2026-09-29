export const LOCALES = ["en", "pt", "fr"] as const;

export type Locale = (typeof LOCALES)[number];

/** Served at the site root; the other locales live under /<locale>/. */
export const DEFAULT_LOCALE: Locale = "en";

interface LocaleInfo {
  /** BCP 47 tag for the `lang` and `hreflang` attributes. */
  lang: string;
  /** Name of the language, written in that language. */
  label: string;
}

export const LOCALE_INFO: Record<Locale, LocaleInfo> = {
  en: { lang: "en", label: "English" },
  pt: { lang: "pt-BR", label: "Português" },
  fr: { lang: "fr", label: "Français" },
};

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.some((locale) => locale === value);
}

/** Maps a site path such as `/projects/` to its URL in the given locale. */
export function localizePath(path: string, locale: Locale): string {
  if (!path.startsWith("/")) {
    throw new Error(`Expected an absolute site path, got "${path}"`);
  }
  return locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;
}
