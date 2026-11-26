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

test.describe("section index", () => {
  test("tracks sections when scrolling in both directions and opening an anchor", async ({
    page,
  }) => {
    await page.goto("/#experience");
    const index = page.getByRole("navigation", { name: "On this page" });
    for (const id of [
      "experience",
      "contact",
      "skills",
      "about",
      "approach",
      "projects",
    ]) {
      await page.locator(`#${id}`).evaluate((section) => {
        section.scrollIntoView();
      });
      await expect(index.locator('[aria-current="location"]')).toHaveCount(1);
      await expect(index.locator(`[href="#${id}"]`)).toHaveAttribute(
        "aria-current",
        "location",
      );
    }
  });

  test("supports keyboard activation and visible focus", async ({ page }) => {
    await page.goto("/");
    const link = page
      .getByRole("navigation", { name: "On this page" })
      .getByRole("link")
      .first();
    await page.getByRole("button", { name: "Dark theme" }).focus();
    await page.keyboard.press("Tab");
    await expect(link).toBeFocused();
    await expect(link).toBeInViewport();
    expect(await link.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe(
      "solid",
    );
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/#projects");
    await expect(page.locator("#projects")).toBeInViewport();
    await expect(link).toHaveAttribute("aria-current", "location");
  });

  test("fits the viewport and stays alongside content on desktop", async ({
    page,
  }) => {
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if ((page.viewportSize()?.width ?? 0) >= 1024) {
      await page.locator("#skills").evaluate((section) => {
        section.scrollIntoView();
      });
      await expect(
        page.getByRole("navigation", { name: "On this page" }),
      ).toBeInViewport();
    }
  });

  test("keeps the index usable without JavaScript", async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(baseURL ?? "http://localhost:4321");
    await page
      .getByRole("navigation", { name: "On this page" })
      .getByRole("link", { name: "About", exact: true })
      .click();
    await expect(page).toHaveURL(/#about$/);
    await expect(page.locator("#about")).toBeInViewport();
    await context.close();
  });
});

test.describe("narrow screens", () => {
  // WCAG 1.4.10 reflow: 320 CSS pixels wide, without scrolling sideways. The
  // project cards hold the longest unbreakable phrases (their status line).
  for (const path of ["/", "/pt/", "/fr/"]) {
    test(`fits a 320 px viewport without horizontal scrolling: ${path}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(path);
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      ).toBe(true);
      // Each card stays inside the content column, not only inside the viewport.
      const overflowing = await page
        .locator("article.card")
        .evaluateAll((cards) =>
          cards
            .filter((card) => {
              const column = card.closest("section");
              if (!column) return true;
              return (
                card.getBoundingClientRect().right >
                column.getBoundingClientRect().right + 0.5
              );
            })
            .map((card) => card.querySelector("h4")?.textContent ?? ""),
        );
      expect(overflowing).toEqual([]);
    });
  }
});
