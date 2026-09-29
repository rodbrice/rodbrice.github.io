import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { LOCALES, localizePath } from "../../src/i18n/locales.ts";
import { useTranslations } from "../../src/i18n/ui.ts";

const WCAG_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
  "best-practice",
];

const CASE_STUDIES = ["field-operations", "property-management", "theone"];

test.describe("project list", () => {
  test("shows the projects in order, linking to their case studies", async ({
    page,
  }) => {
    await page.goto("/");
    const list = page.getByRole("region", { name: "Selected projects" });
    await expect(list.getByRole("heading", { level: 3 })).toHaveText([
      "Field operations management platform",
      "Property management platform",
      "TheOne",
      "AGV dispatch simulation",
    ]);
    await expect(list.getByRole("link")).toHaveCount(CASE_STUDIES.length);
    await list.getByRole("link", { name: "TheOne" }).click();
    await expect(page).toHaveURL("/projects/theone/");
  });

  test("is reachable from the main call to action", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "View projects" }).click();
    await expect(page).toHaveURL("/#projects");
    await expect(
      page.getByRole("heading", { name: "Selected projects" }),
    ).toBeInViewport();
  });
});

for (const locale of LOCALES) {
  const t = useTranslations(locale);

  for (const slug of CASE_STUDIES) {
    const url = localizePath(`/projects/${slug}/`, locale);

    test.describe(`case study ${url}`, () => {
      test("has a title, its technologies and a way back", async ({ page }) => {
        await page.goto(url);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(
          page.getByRole("list", { name: t("project.stack") }),
        ).toBeVisible();
        await page.getByRole("link", { name: t("project.back") }).click();
        await expect(page).toHaveURL(`${localizePath("/", locale)}#projects`);
      });

      test("says when a client project is anonymized", async ({ page }) => {
        await page.goto(url);
        await expect(page.getByText(t("project.confidential"))).toHaveCount(
          slug === "theone" ? 0 : 1,
        );
      });

      for (const colorScheme of ["light", "dark"] as const) {
        test(`has no detectable accessibility violations, ${colorScheme} theme`, async ({
          page,
        }) => {
          await page.emulateMedia({ colorScheme });
          await page.goto(url);
          const results = await new AxeBuilder({ page })
            .withTags(WCAG_TAGS)
            .analyze();
          expect(results.violations).toEqual([]);
        });
      }
    });
  }
}
