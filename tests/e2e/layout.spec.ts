import { expect, test } from "@playwright/test";

test.describe("theme", () => {
  test("follows the system preference by default", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Dark theme" });
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("html")).not.toHaveAttribute("data-theme");
  });

  test("switches theme and remembers the choice", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Dark theme" });
    const background = () =>
      page.evaluate(
        () => getComputedStyle(document.documentElement).backgroundColor,
      );
    const lightBackground = await background();

    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(await background()).not.toBe(lightBackground);

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");

    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  test("applies a saved theme while parsing, so the other theme never flashes", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.addInitScript(() => {
      localStorage.setItem("theme", "dark");
    });
    let themeAtFirstParse: string | null = null;
    await page.exposeFunction("reportTheme", (theme: string | null) => {
      themeAtFirstParse = theme;
    });
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        (
          window as unknown as { reportTheme: (theme: string | null) => void }
        ).reportTheme(document.documentElement.getAttribute("data-theme"));
      });
    });
    await page.goto("/");
    await expect.poll(() => themeAtFirstParse).toBe("dark");
  });
});

test.describe("keyboard navigation", () => {
  test("offers a skip link that moves focus to the main content", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Tab order differs between engines");
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: "Skip to content" });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
  });
});
