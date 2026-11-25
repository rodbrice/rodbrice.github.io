import { expect, test } from "@playwright/test";
import { LOCALES, localizePath } from "../../src/i18n/locales";
import { netcodeLabels } from "../../src/data/netcode-labels";

for (const locale of LOCALES) {
  const labels = netcodeLabels[locale];
  for (const path of ["/", "/projects/theone/"]) {
    test(`network controls work by keyboard: ${locale} ${path}`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(localizePath(path, locale));
      const island = page.locator("[data-network]");
      await island.scrollIntoViewIfNeeded();
      const button = island.getByRole("button");
      await expect(button).toBeVisible();
      await expect(island).toHaveAttribute("data-running", "false");
      await button.focus();
      await page.keyboard.press("Enter");
      await expect(button).toHaveText(labels.pause);
      await expect(island).toHaveAttribute("data-running", "true");
      await expect
        .poll(() => island.locator("[data-pending]").textContent())
        .not.toBe("0");
      await page.keyboard.press("Space");
      await expect(button).toHaveText(labels.play);
      await expect(island).toHaveAttribute("data-running", "false");
      const frozen = await island.locator("[data-pending]").textContent();
      await page.waitForTimeout(120);
      await expect(island.locator("[data-pending]")).toHaveText(frozen ?? "");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Shift+Tab");
      await expect(button).toBeFocused();
      const range = island.getByRole("slider", {
        name: new RegExp(labels.rtt),
      });
      await range.focus();
      await page.keyboard.press("Home");
      await expect(island.locator("[data-latency]")).toHaveText("0 ms");
      await page.keyboard.press("End");
      await expect(island.locator("[data-latency]")).toHaveText("400 ms");
      await page.keyboard.press("Tab");
      await expect(
        island.getByRole("checkbox", { name: labels.prediction }),
      ).toBeFocused();
      await page.keyboard.press("Space");
      await expect(
        island.getByRole("checkbox", { name: labels.prediction }),
      ).not.toBeChecked();
    });
  }
  test(`network diagram survives without JavaScript: ${locale}`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(
      `${baseURL ?? "http://localhost:4321"}${localizePath("/projects/theone/", locale)}`,
    );
    const island = page.locator("[data-network]");
    await expect(island.getByRole("img", { name: labels.title })).toBeVisible();
    await expect(island.getByRole("button")).toHaveCount(0);
    await expect(island).toContainText(labels.description);
    await context.close();
  });
}

test("stops offscreen and resumes without overriding an explicit pause", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/projects/theone/");
  const island = page.locator("[data-network]");
  await island.scrollIntoViewIfNeeded();
  await expect(island).toHaveAttribute("data-running", "true");
  await page.getByRole("heading", { level: 1 }).scrollIntoViewIfNeeded();
  await expect(island).toHaveAttribute("data-running", "false");
  await island.scrollIntoViewIfNeeded();
  await expect(island).toHaveAttribute("data-running", "true");
  await island.getByRole("button").click();
  await page.getByRole("heading", { level: 1 }).scrollIntoViewIfNeeded();
  await island.scrollIntoViewIfNeeded();
  await expect(island).toHaveAttribute("data-running", "false");
});
