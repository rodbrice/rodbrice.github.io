import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { PROFILES } from "../../src/data/profile.ts";
import { LOCALES, localizePath } from "../../src/i18n/locales.ts";

const WCAG_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
  "best-practice",
];

test.describe("home page", () => {
  test("shows the name as the main heading, with the role", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Roduit Brice · Software Developer");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Roduit Brice",
    );
    await expect(
      page.getByText("Software Developer — C#/.NET, React & TypeScript"),
    ).toBeVisible();
  });

  test("links to the public profiles", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: "LinkedIn profile" }),
    ).toHaveAttribute("href", PROFILES.linkedin);
    await expect(
      page.getByRole("link", { name: "Code on GitHub" }),
    ).toHaveAttribute("href", PROFILES.github);
  });

  test("has an about section reachable by its anchor", async ({ page }) => {
    await page.goto("/#about");
    const about = page.getByRole("region", { name: "About" });
    await expect(about).toBeInViewport();
    await expect(about).toContainText("based in Switzerland");
  });

  test("describes its author as structured data", async ({ page }) => {
    await page.goto("/fr/");
    const json = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    expect(JSON.parse(json ?? "")).toMatchObject({
      "@type": "Person",
      name: "Roduit Brice",
      url: "https://rodbrice.github.io/fr/",
      jobTitle: "Développeur logiciel",
      sameAs: [PROFILES.github, PROFILES.linkedin],
    });
  });

  test("loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });

  for (const locale of LOCALES) {
    for (const colorScheme of ["light", "dark"] as const) {
      test(`has no detectable accessibility violations in ${locale}, ${colorScheme} theme`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme });
        await page.goto(localizePath("/", locale));
        const results = await new AxeBuilder({ page })
          .withTags(WCAG_TAGS)
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe("not found page", () => {
  test("explains the page is missing and links home", async ({ page }) => {
    const response = await page.goto("/no-such-page/");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Page not found",
    );
    await page.getByRole("link", { name: "Back to the home page" }).click();
    await expect(page).toHaveURL("/");
  });

  test("has no detectable accessibility violations", async ({ page }) => {
    await page.goto("/no-such-page/");
    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
