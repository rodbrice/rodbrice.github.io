import { expect, test } from "@playwright/test";

import { LOCALE_INFO, LOCALES, localizePath } from "../../src/i18n/locales.ts";
import { useTranslations } from "../../src/i18n/ui.ts";

const SITE = "https://rodbrice.github.io";

for (const locale of LOCALES) {
  test.describe(`home page in ${LOCALE_INFO[locale].label}`, () => {
    const t = useTranslations(locale);
    const url = localizePath("/", locale);

    test("is served in its language", async ({ page }) => {
      await page.goto(url);
      await expect(page.locator("html")).toHaveAttribute(
        "lang",
        LOCALE_INFO[locale].lang,
      );
      await expect(
        page.getByText(t("home.eyebrow"), { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: t("a11y.skipLink") }),
      ).toBeAttached();
      await expect(
        page.getByRole("button", { name: t("theme.dark") }),
      ).toBeVisible();
    });

    test("marks its own language as current in the picker", async ({
      page,
    }) => {
      await page.goto(url);
      const picker = page.getByRole("navigation", {
        name: t("language.label"),
      });
      await expect(
        picker.getByRole("link", { name: LOCALE_INFO[locale].label }),
      ).toHaveAttribute("aria-current", "page");
      await expect(picker.locator('[aria-current="page"]')).toHaveCount(1);
    });

    test("declares its canonical URL and every translation", async ({
      page,
    }) => {
      await page.goto(url);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        SITE + url,
      );
      for (const alternate of LOCALES) {
        await expect(
          page.locator(
            `link[rel="alternate"][hreflang="${LOCALE_INFO[alternate].lang}"]`,
          ),
        ).toHaveAttribute("href", SITE + localizePath("/", alternate));
      }
      await expect(
        page.locator('link[rel="alternate"][hreflang="x-default"]'),
      ).toHaveAttribute("href", `${SITE}/`);
    });
  });
}

test("the language picker moves between the translations of a page", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Português" }).click();
  await expect(page).toHaveURL("/pt/");
  await page.getByRole("link", { name: "Français" }).click();
  await expect(page).toHaveURL("/fr/");
  await page.getByRole("link", { name: "English" }).click();
  await expect(page).toHaveURL("/");
});
