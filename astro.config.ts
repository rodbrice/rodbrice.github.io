import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";

import { DEFAULT_LOCALE, LOCALE_INFO, LOCALES } from "./src/i18n/locales.ts";

export default defineConfig({
  site: "https://rodbrice.github.io",
  integrations: [
    sitemap({
      // Each URL lists its translations, matching the hreflang links in the page head.
      i18n: {
        defaultLocale: DEFAULT_LOCALE,
        locales: Object.fromEntries(
          LOCALES.map((locale) => [locale, LOCALE_INFO[locale].lang]),
        ),
      },
    }),
  ],
  fonts: [
    {
      // Only the Latin subset of Inter: it covers English, Portuguese and French
      // (including œ, curly quotes and dashes) in a single 48 kB file.
      provider: fontProviders.local(),
      name: "Inter",
      cssVariable: "--font-sans",
      fallbacks: ["sans-serif"],
      options: {
        variants: [
          {
            src: [
              "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
            ],
            weight: "100 900",
            style: "normal",
            unicodeRange: [
              "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
            ],
          },
        ],
      },
    },
  ],
});
