import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { LOCALES, localizePath } from "../../src/i18n/locales";
import { dispatchLabels } from "../../src/data/dispatch-labels";

for (const locale of LOCALES) {
  const labels = dispatchLabels[locale];
  test(`dispatch native controls work by keyboard: ${locale}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(localizePath("/", locale));
    const island = page.locator("[data-dispatch]");
    await island.scrollIntoViewIfNeeded();
    const pause = island.getByRole("button");
    await expect(pause).toHaveText(labels.play);
    await expect(island).toHaveAttribute("data-running", "false");
    const range = island.getByRole("slider", { name: labels.demand });
    await range.focus();
    await page.keyboard.press("Home");
    await expect(island.locator("[data-demand-value]")).toHaveText(
      `4 ${labels.perMinute}`,
    );
    await page.keyboard.press("End");
    await expect(island.locator("[data-demand-value]")).toHaveText(
      `40 ${labels.perMinute}`,
    );
    await page.keyboard.press("Tab");
    const policy = island.getByRole("combobox", { name: labels.policy });
    await expect(policy).toBeFocused();
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    await expect(policy).toHaveValue("first");
    await page.keyboard.press("Home");
    await page.keyboard.press("Enter");
    await expect(policy).toHaveValue("nearest");
    await page.keyboard.press("Tab");
    await expect(pause).toBeFocused();
    expect(
      await pause.evaluate((el) => getComputedStyle(el).outlineStyle),
    ).toBe("solid");
    await page.keyboard.press("Enter");
    await expect(island).toHaveAttribute("data-running", "true");
    await expect(pause).toHaveText(labels.pause);
    await expect
      .poll(() => island.locator("[data-busy]").textContent())
      .not.toBe("0");
    await page.keyboard.press("Space");
    await expect(island).toHaveAttribute("data-running", "false");
    await expect(pause).toHaveText(labels.play);
    const frozen = await island.locator(".readings").textContent();
    await page.waitForTimeout(150);
    await expect(island.locator(".readings")).toHaveText(frozen ?? "");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(pause).toBeFocused();
  });
  test(`dispatch fallback is useful without JavaScript: ${locale}`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(
      `${baseURL ?? "http://localhost:4321"}${localizePath("/", locale)}`,
    );
    const island = page.locator("[data-dispatch]");
    await expect(island.getByRole("img", { name: labels.title })).toBeVisible();
    await expect(island).toContainText(labels.corridor);
    await expect(island).toContainText(labels.description);
    await expect(island.getByRole("button")).toHaveCount(0);
    await context.close();
  });
  for (const colorScheme of ["light", "dark"] as const) {
    test(`dispatch has no axe violations: ${locale} ${colorScheme}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      await page.goto(localizePath("/", locale));
      await page.locator("[data-dispatch]").scrollIntoViewIfNeeded();
      expect(
        (
          await new AxeBuilder({ page })
            .withTags([
              "wcag2a",
              "wcag2aa",
              "wcag21a",
              "wcag21aa",
              "wcag22aa",
              "best-practice",
            ])
            .analyze()
        ).violations,
      ).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    });
  }
}

test("dispatch stops offscreen, on hidden tabs, and preserves explicit pause", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const island = page.locator("[data-dispatch]");
  await island.scrollIntoViewIfNeeded();
  await expect(island).toHaveAttribute("data-running", "true");
  await page.getByRole("heading", { level: 1 }).scrollIntoViewIfNeeded();
  await expect(island).toHaveAttribute("data-running", "false");
  await island.scrollIntoViewIfNeeded();
  await expect(island).toHaveAttribute("data-running", "true");
  // Chromium headless does not reliably hide a tab when another page is opened.
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(island).toHaveAttribute("data-running", "false");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(island).toHaveAttribute("data-running", "true");
  await island.getByRole("button").click();
  await page.getByRole("heading", { level: 1 }).scrollIntoViewIfNeeded();
  await island.scrollIntoViewIfNeeded();
  await expect(island).toHaveAttribute("data-running", "false");
});

test("dispatch retains its static diagram when IntersectionObserver is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    delete (window as unknown as Record<string, unknown>).IntersectionObserver;
  });
  await page.goto("/");
  await expect(page.locator("[data-dispatch] svg")).toBeVisible();
  await expect(page.locator("[data-dispatch] [data-interactive]")).toBeHidden();
});
