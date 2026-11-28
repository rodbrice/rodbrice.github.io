import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { LOCALES, localizePath } from "../../src/i18n/locales.ts";

/** The projects with a case study, each title travelling between two pages. */
const CASE_STUDIES = [
  "field-operations",
  "facture-qr",
  "property-management",
  "plan-review",
  "rot-and-resolve",
];

/** The titles that can take a view transition name, and their text. */
function titles(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("[data-title-transition]")].map(
      (title) => ({
        name: title.dataset.titleTransition,
        text: title.textContent.replace(/[→↗]/g, "").trim(),
        // At rest no title is named, so none can move on the next navigation.
        current: getComputedStyle(title).viewTransitionName,
      }),
    ),
  );
}

/**
 * Records, for each page the browser reveals, whether a view transition ran
 * and which pseudo elements it animated.
 */
async function recordReveals(page: Page) {
  await page.addInitScript(() => {
    window.addEventListener("pagereveal", (event) => {
      const key = `reveal:${location.pathname}`;
      const transition = event.viewTransition;
      if (!transition) {
        sessionStorage.setItem(key, JSON.stringify({ ran: false }));
        return;
      }
      void transition.ready.then(() => {
        const pseudoElements = document
          .getAnimations()
          .map((animation) =>
            animation.effect instanceof KeyframeEffect
              ? animation.effect.pseudoElement
              : null,
          )
          .filter((pseudo) => pseudo !== null);
        sessionStorage.setItem(
          key,
          JSON.stringify({ ran: true, pseudoElements }),
        );
      });
    });
  });
}

/** The reveal recorded for a path, once there is one. */
async function reveal(page: Page, path: string) {
  const read = () =>
    page.evaluate((key) => sessionStorage.getItem(key), `reveal:${path}`);
  await expect.poll(read).not.toBeNull();
  return JSON.parse((await read()) ?? "null") as {
    ran: boolean;
    pseudoElements?: string[];
  };
}

/** The project titles that a transition moved. */
function movedTitles(pseudoElements: readonly string[] = []) {
  return [
    ...new Set(
      pseudoElements
        .map((pseudo) => /^::view-transition-group\((.+)\)$/.exec(pseudo)?.[1])
        .filter((name) => name !== undefined && name !== "root"),
    ),
  ];
}

async function skipWithoutTransitions(page: Page) {
  test.skip(
    !(await page.evaluate(() => "onpagereveal" in window)),
    "Cross-document view transitions are not supported",
  );
}

test.describe("page transitions", () => {
  for (const locale of LOCALES) {
    test(`each case title has one name, shared by its home card, in ${locale}`, async ({
      page,
    }) => {
      await page.goto(localizePath("/", locale));
      const home = await titles(page);
      expect(home.map(({ name }) => name).sort()).toEqual(
        CASE_STUDIES.map((slug) => `project-title-${slug}`).sort(),
      );
      expect(home.map(({ current }) => current)).toEqual(
        home.map(() => "none"),
      );

      for (const slug of CASE_STUDIES) {
        await page.goto(localizePath(`/projects/${slug}/`, locale));
        const heading = page.getByRole("heading", { level: 1 });
        await expect(heading).toHaveAttribute(
          "data-title-transition",
          `project-title-${slug}`,
        );
        const names = (await titles(page)).map(({ name }) => name);
        expect(new Set(names).size).toBe(names.length);
        // The card on the home page shows the same title as the case's heading.
        expect(
          home.find(({ name }) => name === `project-title-${slug}`)?.text,
        ).toBe((await heading.textContent())?.trim());
      }
    });
  }

  test("only the chosen title travels: to the case, to the next case and back home", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await recordReveals(page);
    await page.goto("/");
    await skipWithoutTransitions(page);

    const card = page.locator("#project-field-operations");
    await card.evaluate((element) => {
      element.scrollIntoView({ block: "center" });
    });
    await card.locator('a[href="/projects/field-operations/"]').click();
    await expect(page).toHaveURL("/projects/field-operations/");
    const toCase = await reveal(page, "/projects/field-operations/");
    expect(toCase.ran).toBe(true);
    expect(toCase.pseudoElements).toEqual(
      expect.arrayContaining([
        "::view-transition-old(root)",
        "::view-transition-new(root)",
      ]),
    );
    expect(movedTitles(toCase.pseudoElements)).toEqual([
      "project-title-field-operations",
    ]);

    const next = page.locator("a.next");
    const nextPath = await next.getAttribute("href");
    const nextSlug = /\/projects\/([^/]+)\/$/.exec(nextPath ?? "")?.[1];
    await next.click();
    await expect(page).toHaveURL(nextPath ?? "");
    const toNext = await reveal(page, nextPath ?? "");
    expect(toNext.ran).toBe(true);
    expect(movedTitles(toNext.pseudoElements)).toEqual([
      `project-title-${nextSlug ?? ""}`,
    ]);

    await page.locator("a.back").click();
    await expect(page).toHaveURL("/#projects");
    const home = await reveal(page, "/");
    expect(home.ran).toBe(true);
    // The heading travels back only when its card is on screen.
    expect(
      movedTitles(home.pseudoElements).every(
        (name) => name === `project-title-${nextSlug ?? ""}`,
      ),
    ).toBe(true);
    // Once the transition ends, the names stay on the titles that just moved.
    const named = (await titles(page)).filter(
      ({ current }) => current !== "none",
    );
    expect(named.length).toBeLessThanOrEqual(1);
  });

  test("reduced motion navigates without a transition or a named title", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await recordReveals(page);
    await page.goto("/");
    await skipWithoutTransitions(page);
    await page
      .getByRole("region", { name: "Selected projects" })
      .getByRole("link", { name: "Rot & Resolve" })
      .click();
    await expect(page).toHaveURL("/projects/rot-and-resolve/");
    expect(await reveal(page, "/projects/rot-and-resolve/")).toEqual({
      ran: false,
    });
    await expect(page.getByRole("heading", { level: 1 })).toHaveCSS(
      "view-transition-name",
      "none",
    );
  });
});
