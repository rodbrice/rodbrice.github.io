import { expect, test } from "@playwright/test";

for (const mode of ["unsupported", "reduce"] as const) {
  test(`${mode}: visible content, keyboard, theme and document navigation`, async ({
    page,
  }) => {
    await page.emulateMedia({
      reducedMotion: mode === "reduce" ? "reduce" : "no-preference",
    });
    if (mode === "unsupported") {
      // Exercise the unsupported CSS branch without mocking CSS.supports(),
      // which would leave the browser's actual stylesheet evaluation unchanged.
      await page.route("**/*.css", async (route) => {
        const response = await route.fetch();
        const css = await response.text();
        await route.fulfill({
          response,
          body: css
            .replaceAll(
              /@supports\s*\(animation-timeline:\s*view\(\)\)/g,
              "@supports (portfolio-unsupported: true)",
            )
            .replaceAll(/@view-transition\s*\{[^}]*\}/g, ""),
        });
      });
    }
    for (const path of ["/", "/projects/theone/"]) {
      await page.goto(path);
      const reveals = page.locator("[data-reveal]");
      expect(await reveals.count()).toBeGreaterThan(0);
      for (const reveal of await reveals.all()) {
        await expect(reveal).toBeVisible();
        expect(
          await reveal.evaluate((el) => {
            const style = getComputedStyle(el);
            return [style.opacity, style.translate, style.animationName];
          }),
        ).toEqual(["1", "none", "none"]);
      }
      await page.keyboard.press("Tab");
      await expect(page.locator(".skip-link")).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.locator("main")).toBeFocused();
      const toggle = page.getByRole("button", { name: "Dark theme" });
      await toggle.focus();
      await page.keyboard.press("Space");
      await expect(toggle).toHaveAttribute("aria-pressed", "true");
      await page.evaluate(() => {
        window.addEventListener("pageswap", (event) => {
          sessionStorage.setItem(
            "navigation-transition",
            String("viewTransition" in event && Boolean(event.viewTransition)),
          );
        });
      });
      await page.getByRole("link", { name: "Português" }).click();
      await expect(page).toHaveURL(path === "/" ? "/pt/" : `/pt${path}`);
      await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
      expect(
        await page.evaluate(() =>
          sessionStorage.getItem("navigation-transition"),
        ),
      ).toBe("false");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await page.getByRole("link", { name: "English" }).click();
      await expect(page).toHaveURL(path);
      await page.goBack();
      await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
      // Reset the persisted theme for the next document's keyboard check.
      await page.evaluate(() => {
        localStorage.removeItem("theme");
      });
    }
  });
}

test("reduced motion removes transitions and animations, including pseudo elements", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.addStyleTag({
    content: `#about, #about::before { animation: probe 10s 2s infinite; transition: opacity 10s 2s; }
      #about::before { content: ""; } @keyframes probe { to { opacity: .5; } }`,
  });
  expect(
    await page.locator("#about").evaluate((el) =>
      [null, "::before"].map((pseudo) => {
        const style = getComputedStyle(el, pseudo);
        return [
          style.animationName,
          style.transitionDuration,
          style.transitionDelay,
        ];
      }),
    ),
  ).toEqual([
    ["none", "0s", "0s"],
    ["none", "0s", "0s"],
  ]);
  await expect(page.locator("[data-network]")).toHaveAttribute(
    "data-running",
    "false",
  );
  await expect(page.locator("[data-dispatch]")).toHaveAttribute(
    "data-running",
    "false",
  );
  // A live preference change also removes an already attached reveal timeline.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .locator("[data-reveal]")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
});

test("supported view timelines reveal on entry and leave focused diagrams visible", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/projects/theone/");
  test.skip(
    !(await page.evaluate(() => CSS.supports("animation-timeline: view()"))),
  );
  const diagram = page.locator("#diagram");
  expect(
    await diagram.evaluate((el) => getComputedStyle(el).animationTimeline),
  ).toBe("view()");
  expect(await diagram.evaluate((el) => getComputedStyle(el).opacity)).toBe(
    "1",
  );
  await diagram.scrollIntoViewIfNeeded();
  await expect
    .poll(() => diagram.evaluate((el) => getComputedStyle(el).translate))
    .toMatch(/^0px(?: 0px)?$/);
  await diagram.locator("[tabindex]").focus();
  expect(
    await diagram.evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
});
