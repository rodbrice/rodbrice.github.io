import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { flowLabels } from "../../src/data/diagram-labels.ts";
import { figureFor, hasDiagram } from "../../src/data/diagrams.ts";
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

const CASE_STUDIES = [
  "field-operations",
  "facture-qr",
  "property-management",
  "plan-review",
  "rot-and-resolve",
];
/** The verified stage shown on each featured card, in display order. */
const CARD_STATUSES = [
  "Private client project · Final client validation",
  "Public repository · v0.1.0 released",
  "Private project · MVP in development",
  "Public repository · Early development",
];
/** The other projects, each one plain row: its title and verified stage. */
const ROWS = [
  { title: "Rot & Resolve", status: "Personal project" },
  { title: "AGV dispatch simulation", status: "Private project · Experiment" },
];
/** Public projects: their case studies link to the source repository. */
const PUBLIC_SOURCES: Record<string, string> = {
  "facture-qr": "https://github.com/rodbrice/facture-qr",
  "plan-review": "https://github.com/rodbrice/plan-review",
};

test.describe("project list", () => {
  test("shows the projects in order, linking to their case studies", async ({
    page,
  }) => {
    await page.goto("/");
    const list = page.getByRole("region", { name: "Selected projects" });
    await expect(list.getByRole("heading", { level: 4 })).toHaveText([
      "Industrial Field Operations Management System",
      "Facture QR — Swiss QR-bill invoicing",
      "Property management application",
      "plan-review — Terraform change risk review",
      // The row's title link ends with a decorative arrow.
      /^Rot & Resolve/,
      "AGV dispatch simulation",
    ]);
    await expect(list.getByRole("link")).toHaveCount(CASE_STUDIES.length);
    await list.getByRole("link", { name: "Rot & Resolve" }).click();
    await expect(page).toHaveURL("/projects/rot-and-resolve/");
  });

  test("cards give the problem, my contribution, a status and one action", async ({
    page,
  }) => {
    await page.goto("/");
    const cards = page
      .getByRole("region", { name: "Featured work" })
      .locator(".project-list > li");
    await expect(cards).toHaveCount(CARD_STATUSES.length);
    for (const [index, status] of CARD_STATUSES.entries()) {
      const card = cards.nth(index);
      await expect(card.locator("dt")).toHaveText([
        "Problem",
        "My contribution",
      ]);
      for (const line of await card.locator("dd").allInnerTexts()) {
        expect(line.length).toBeGreaterThan(20);
        expect(line.length).toBeLessThanOrEqual(160);
      }
      const marker = card.locator(".status");
      await expect(marker).toContainText(`Current status: ${status}`);
      await expect(marker.locator("svg")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      const tags = card.getByRole("list", { name: "Technologies" });
      expect(await tags.getByRole("listitem").count()).toBeLessThanOrEqual(6);
      // Tags stay secondary: smaller than the problem and contribution lines.
      const size = (locator: typeof tags) =>
        locator.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      expect(await size(tags)).toBeLessThan(
        await size(card.locator("dd").first()),
      );
      await expect(card.getByRole("link")).toHaveCount(1);
    }
  });

  test("other projects are plain rows: kind, title, problem, status and technologies", async ({
    page,
  }) => {
    await page.goto("/");
    const rows = page
      .getByRole("region", { name: "Other engineering projects" })
      .locator(".project-rows > li");
    await expect(rows).toHaveCount(ROWS.length);
    for (const [index, { title, status }] of ROWS.entries()) {
      const row = rows.nth(index);
      await expect(row.getByRole("heading", { level: 4 })).toHaveText(
        new RegExp(`^${title}`),
      );
      await expect(row.locator(".problem")).not.toBeEmpty();
      await expect(row.locator(".status")).toContainText(
        `Current status: ${status}`,
      );
      await expect(
        row.getByRole("list", { name: "Technologies" }).getByRole("listitem"),
      ).not.toHaveCount(0);
      // No contribution line, figure or card chrome: the featured cards carry that.
      await expect(row.locator("dl, figure")).toHaveCount(0);
      await expect(row.locator("svg")).toHaveCount(1); // The status marker.
    }
    // A case study is linked from the title; without one, the title is text.
    await expect(rows.first().getByRole("link")).toHaveAttribute(
      "href",
      "/projects/rot-and-resolve/",
    );
    await expect(rows.last().getByRole("link")).toHaveCount(0);
  });

  for (const locale of LOCALES) {
    test(`splits featured work from other projects in ${locale}`, async ({
      page,
    }) => {
      const t = useTranslations(locale);
      await page.goto(localizePath("/", locale));
      const list = page.getByRole("region", { name: t("projects.title") });
      await expect(list.getByRole("heading", { level: 3 })).toHaveText([
        t("projects.featured"),
        t("projects.other"),
      ]);
      const ids = (name: string, selector: string) =>
        list
          .getByRole("region", { name, exact: true })
          .locator(selector)
          .evaluateAll((items) => items.map((item) => item.id));
      expect(await ids(t("projects.featured"), "article.card")).toEqual([
        "project-field-operations",
        "project-facture-qr",
        "project-property-management",
        "project-plan-review",
      ]);
      expect(await ids(t("projects.other"), "article.row")).toEqual([
        "project-rot-and-resolve",
        "project-agv-dispatch",
      ]);
    });
  }

  test("every card action leads to a page that exists", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    const links = page.locator(".project-list a, .project-rows a");
    for (const href of await links.evaluateAll((all) =>
      all.map((link) => link.getAttribute("href") ?? ""),
    )) {
      expect(href).toMatch(/^\/projects\/[a-z-]+\/$/);
      expect((await request.get(href)).status()).toBe(200);
    }
  });

  for (const locale of LOCALES.filter((other) => other !== "en")) {
    test(`cards are localized in ${locale}`, async ({ page }) => {
      const t = useTranslations(locale);
      await page.goto(localizePath("/", locale));
      const first = page.locator(".project-list > li").first();
      await expect(first.locator("dt")).toHaveText([
        t("project.problem"),
        t("project.contribution"),
      ]);
      await expect(first.locator(".status")).toContainText(
        `${t("project.clientProject")} · ${t("status.clientValidation")}`,
      );
      await expect(page.locator("#project-facture-qr .status")).toContainText(
        `${t("project.publicRepository")} · ${t("status.firstRelease")}`,
      );
      await expect(
        first.getByRole("link", { name: new RegExp(t("project.readCase")) }),
      ).toHaveAttribute(
        "href",
        localizePath("/projects/field-operations/", locale),
      );
      await expect(page.locator("#project-agv-dispatch .status")).toContainText(
        `${t("project.privateProject")} · ${t("status.experiment")}`,
      );
    });
  }

  test("is reachable from the main call to action", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "View projects" }).click();
    await expect(page).toHaveURL("/#projects");
    await expect(
      page.getByRole("heading", { name: "Selected projects" }),
    ).toBeInViewport();
  });
});

test.describe("renamed game case study", () => {
  for (const locale of LOCALES) {
    const from = localizePath("/projects/theone/", locale);
    const to = localizePath("/projects/rot-and-resolve/", locale);

    test(`${from} leads to ${to}`, async ({ page }) => {
      await page.goto(from);
      await expect(page).toHaveURL(to);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Rot & Resolve",
      );
    });
  }

  test("the old name is gone from every page in every language", async ({
    page,
  }) => {
    for (const locale of LOCALES) {
      for (const path of ["/", "/projects/rot-and-resolve/"]) {
        await page.goto(localizePath(path, locale));
        await expect(page.locator("body")).not.toContainText("TheOne");
        await expect(page).not.toHaveTitle(/TheOne/);
      }
    }
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
        await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
          "content",
          "article",
        );
        await expect(
          page.getByRole("list", { name: t("project.stack") }),
        ).toBeVisible();
        await page.getByRole("link", { name: t("project.back") }).click();
        await expect(page).toHaveURL(`${localizePath("/", locale)}#projects`);
      });

      test("opens with the story, status and contribution before the facts", async ({
        page,
      }) => {
        await page.goto(url);
        const callouts = page.locator(".callouts");
        await expect(callouts.locator("dt")).toHaveText([
          t("project.status"),
          t("project.contribution"),
        ]);
        await expect(callouts.locator(".status svg")).toHaveAttribute(
          "aria-hidden",
          "true",
        );
        await expect(callouts.locator("dd").last()).not.toBeEmpty();
        // Document order: header callouts, then the story, then the facts.
        const order = await page.evaluate(() => {
          const at = (selector: string) =>
            [...document.querySelectorAll("*")].findIndex((el) =>
              el.matches(selector),
            );
          return [at(".callouts"), at(".story h2"), at("#facts")];
        });
        expect(order[0]).toBeGreaterThan(-1);
        expect(order).toEqual([...order].sort((a, b) => a - b));
        const index = page.getByRole("navigation", { name: t("nav.sections") });
        await expect(index.getByRole("link").first()).toHaveAttribute(
          "href",
          `#${(await page.locator(".story h2").getAttribute("id")) ?? ""}`,
        );
        // The index lists every target in page order, each exactly once.
        const hrefs = await index
          .getByRole("link")
          .evaluateAll((links) => links.map((l) => l.getAttribute("href")));
        const targets = await page.evaluate((ids) => {
          const all = [...document.querySelectorAll("*")];
          return ids.map((id) =>
            all.findIndex(
              (el) => el.id === decodeURIComponent((id ?? "").slice(1)),
            ),
          );
        }, hrefs);
        expect(targets.every((position) => position > -1)).toBe(true);
        expect(targets).toEqual([...targets].sort((a, b) => a - b));
        expect(new Set(hrefs).size).toBe(hrefs.length);
        // Two entries never read the same, e.g. a figure named like a section.
        const labels = await index
          .getByRole("link")
          .evaluateAll((links) =>
            links.map((l) => l.textContent.replace(/^\s*\d+/, "").trim()),
          );
        expect(new Set(labels).size).toBe(labels.length);
      });

      test("shows facts, its diagram if any and a localized next project", async ({
        page,
      }) => {
        await page.goto(url);
        await expect(
          page.getByRole("heading", { name: t("project.facts"), exact: true }),
        ).toBeVisible();
        await expect(page.locator("dl.facts")).toContainText(t("project.type"));
        const figure = figureFor(slug);
        const diagram = page.getByRole("img", {
          name: t("project.architecture"),
          exact: true,
        });
        const index = page.getByRole("navigation", { name: t("nav.sections") });
        if (figure?.kind === "flow") {
          const caption = page.locator("figure#diagram figcaption");
          await expect(caption).toHaveText(
            `${t("project.figure")} 1. ${t(figure.title)}. ${t("project.synthetic")}`,
          );
          await expect(
            page.getByRole("figure", { name: new RegExp(t(figure.title)) }),
          ).toBeVisible();
          const flow = page.getByRole("list", { name: t(figure.title) });
          const { steps, outputs, formats } = flowLabels[locale];
          await expect(flow.locator(":scope > li > strong")).toHaveText([
            ...steps.map(({ title }) => title),
            outputs,
          ]);
          await expect(flow.locator(".formats li")).toHaveText(formats);
          // Synthetic and schematic: no figures, values or screenshots.
          expect(await flow.innerText()).not.toMatch(/\d/);
          await expect(page.locator("figure#diagram img")).toHaveCount(0);
          await expect(diagram).toHaveCount(0);
          await expect(index.locator('a[href="#diagram"]')).toHaveText(
            new RegExp(t(figure.title)),
          );
        } else if (hasDiagram(slug)) {
          await expect(diagram).toBeVisible();
          await expect(page.locator("figure#diagram")).toContainText(
            `${t("project.figure")} 1.`,
          );
          await expect(page.locator("figure#diagram")).toContainText(
            t("project.illustration"),
          );
          await expect(index.locator('a[href="#diagram"]')).toHaveCount(1);
          const labels =
            slug === "property-management"
              ? {
                  en: ["Domain", "Application", "Infrastructure · API"],
                  pt: ["Domínio", "Aplicação", "Infraestrutura · API"],
                  fr: ["Domaine", "Application", "Infrastructure · API"],
                }[locale]
              : {
                  en: ["Client", "Dedicated server"],
                  pt: ["Cliente", "Servidor dedicado"],
                  fr: ["Client", "Serveur dédié"],
                }[locale];
          for (const label of labels) {
            await expect(diagram).toContainText(label);
          }
        } else {
          expect(figure).toBeUndefined();
          // No approved diagram: no figure, and no index entry pointing to one.
          await expect(diagram).toHaveCount(0);
          await expect(page.locator("figure")).toHaveCount(0);
          await expect(index.locator('a[href="#diagram"]')).toHaveCount(0);
        }
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        const nextSlug =
          CASE_STUDIES[(CASE_STUDIES.indexOf(slug) + 1) % CASE_STUDIES.length];
        await page
          .getByRole("link", { name: new RegExp(t("project.next")) })
          .click();
        await expect(page).toHaveURL(
          localizePath(`/projects/${nextSlug ?? "field-operations"}/`, locale),
        );
      });

      test("supports the case index and next project with the keyboard", async ({
        page,
      }) => {
        await page.goto(url);
        const index = page.getByRole("navigation", { name: t("nav.sections") });
        const first = index.getByRole("link").first();
        await page.getByRole("button", { name: t("theme.dark") }).focus();
        await page.keyboard.press("Tab");
        await expect(first).toBeFocused();
        expect(
          await first.evaluate((el) => getComputedStyle(el).outlineStyle),
        ).toBe("solid");
        await page.keyboard.press("Enter");
        await expect(page).toHaveURL(
          `${url}${(await first.getAttribute("href")) ?? ""}`,
        );
        await expect(page.locator(".story h2")).toBeInViewport();
        for (const link of await index.getByRole("link").all()) {
          const href = (await link.getAttribute("href")) ?? "";
          await link.focus();
          await page.keyboard.press("Enter");
          await expect(page).toHaveURL(`${url}${href}`);
          await expect(page.locator(href)).toBeInViewport();
          if (href === "#mon-rôle" || href === "#qualité-et-état-actuel") {
            // Put this heading in the reading area, ahead of the following heading.
            await page.locator(href).evaluate((heading) => {
              heading.scrollIntoView({ block: "center" });
            });
            await expect(link).toHaveAttribute("aria-current", "location");
          }
        }
        const scrollRegion = page.getByRole("region", {
          name: t("project.architecture"),
          exact: true,
        });
        const scrolls =
          figureFor(slug)?.kind === "architecture" &&
          (await scrollRegion.evaluate(
            (el) => el.scrollWidth > el.clientWidth,
          ));
        if (scrolls) {
          await scrollRegion.focus();
          await page.keyboard.press("ArrowRight");
          await expect
            .poll(() => scrollRegion.evaluate((el) => el.scrollLeft))
            .toBeGreaterThan(0);
        }
        const next = page.getByRole("link", {
          name: new RegExp(t("project.next")),
        });
        const href = (await next.getAttribute("href")) ?? "";
        await next.focus();
        await page.keyboard.press("Enter");
        await expect(page).toHaveURL(href);
      });

      test("keeps the figure and index available without JavaScript", async ({
        browser,
        baseURL,
      }) => {
        const context = await browser.newContext({ javaScriptEnabled: false });
        const page = await context.newPage();
        await page.goto(`${baseURL ?? "http://localhost:4321"}${url}`);
        if (figureFor(slug)?.kind === "architecture") {
          await expect(
            page.getByRole("img", {
              name: t("project.architecture"),
              exact: true,
            }),
          ).toBeVisible();
        }
        if (figureFor(slug)?.kind === "flow") {
          await expect(page.locator("figure#diagram ol > li")).toHaveCount(5);
        }
        const links = page
          .getByRole("navigation", { name: t("nav.sections") })
          .getByRole("link");
        await expect(links.nth(1)).toHaveAttribute("href", "#facts");
        const target = hasDiagram(slug) ? links.nth(2) : links.nth(1);
        const href = (await target.getAttribute("href")) ?? "";
        if (hasDiagram(slug)) expect(href).toBe("#diagram");
        await target.click();
        await expect(page).toHaveURL(`${url}${href}`);
        await expect(
          page.locator(`[id="${decodeURIComponent(href.slice(1))}"]`),
        ).toBeInViewport();
        await context.close();
      });

      test("links to its public source, or says the code is private", async ({
        page,
      }) => {
        await page.goto(url);
        const source = PUBLIC_SOURCES[slug];
        const repositoryLinks = page.locator(
          '.prose a[href^="https://github.com/"]',
        );
        const evidence = page.locator("dl.facts dt", {
          hasText: t("project.evidence"),
        });
        if (source === undefined) {
          await expect(repositoryLinks).toHaveCount(0);
          await expect(
            page.locator('dl.facts a[href^="https://github.com/"]'),
          ).toHaveCount(0);
        } else {
          await expect(
            page.locator(".prose").locator(`a[href="${source}"]`),
          ).toHaveCount(1);
          await expect(evidence).toHaveCount(1);
          await expect(
            page.locator(`dl.facts a[href="${source}"]`),
          ).toContainText(t("project.publicRepository"));
        }
        if (slug === "facture-qr") {
          // The published release is part of the evidence.
          await expect(
            page
              .locator(".prose")
              .locator(
                'a[href="https://github.com/rodbrice/facture-qr/releases/tag/v0.1.0"]',
              ),
          ).toHaveCount(1);
        }
        if (slug === "rot-and-resolve") {
          // Private code: no repository link, a walkthrough instead.
          await expect(page.locator(".prose").last()).toContainText(
            {
              en: "Code private — walkthrough available on request.",
              pt: "Código privado — apresentação disponível sob pedido.",
              fr: "Code privé — présentation possible sur demande.",
            }[locale],
          );
        }
        if (slug === "field-operations" || slug === "property-management") {
          await expect(evidence).toHaveCount(1);
          await expect(page.locator("dl.facts")).toContainText(
            t("project.walkthrough"),
          );
        }
      });

      test("covers role, status, learning and evidence", async ({ page }) => {
        await page.goto(url);
        const headings = await page
          .locator(".prose h2")
          .evaluateAll((all) => all.map((heading) => heading.textContent));
        const covered = (pattern: RegExp) =>
          headings.some((heading) => pattern.test(heading));
        const sections = {
          en: [/role/i, /status/i, /learned/i, /evidence/i],
          pt: [/papel/i, /estado/i, /aprend/i, /evidências/i],
          fr: [/rôle/i, /état/i, /appris/i, /vérifiables/i],
        }[locale];
        expect(sections.filter((pattern) => !covered(pattern))).toEqual([]);
      });

      test("says when a client or private project is anonymized", async ({
        page,
      }) => {
        await page.goto(url);
        await expect(page.getByText(t("project.confidential"))).toHaveCount(
          slug === "field-operations" ? 1 : 0,
        );
        await expect(page.getByText(t("project.private"))).toHaveCount(
          slug === "property-management" ? 1 : 0,
        );
        await expect(page.getByText(t("project.clientWork"))).toHaveCount(
          slug === "field-operations" ? 1 : 0,
        );
        await expect(page.getByText(t("project.privateWork"))).toHaveCount(
          slug === "property-management" ? 1 : 0,
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
