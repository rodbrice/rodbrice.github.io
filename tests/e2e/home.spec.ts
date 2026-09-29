import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const WCAG_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
  "best-practice",
];

test.describe("home page", () => {
  test("shows the name as the main heading", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Roduit Brice");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Roduit Brice",
    );
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

  for (const colorScheme of ["light", "dark"] as const) {
    test(`has no detectable accessibility violations in the ${colorScheme} theme`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto("/");
      const results = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .analyze();
      expect(results.violations).toEqual([]);
    });
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
