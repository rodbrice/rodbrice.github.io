import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { hasDiagram } from "../../src/data/diagrams.ts";
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
  "theone",
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
    await expect(list.getByRole("heading", { level: 3 })).toHaveText([
      "Industrial Field Operations Management System",
      "Facture QR — Swiss QR-bill invoicing",
      "Property management application",
      "plan-review — Terraform change risk review",
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

      test("shows facts, its diagram if any and a localized next project", async ({
        page,
      }) => {
        await page.goto(url);
        await expect(
          page.getByRole("heading", { name: t("project.facts"), exact: true }),
        ).toBeVisible();
        await expect(page.locator("dl")).toContainText(t("project.type"));
        const diagram = page.getByRole("img", {
          name: t("project.architecture"),
          exact: true,
        });
        const index = page.getByRole("navigation", { name: t("nav.sections") });
        if (hasDiagram(slug)) {
          await expect(diagram).toBeVisible();
          await expect(page.locator("figure#diagram")).toContainText(
            `${t("project.figure")} 1.`,
          );
          await expect(page.locator("figure#diagram")).toContainText(
            t("project.illustration"),
          );
          await expect(index.locator('a[href="#diagram"]')).toHaveCount(1);
          const labels =
            slug === "field-operations"
              ? ["React + TypeScript", "ASP.NET Core", "PostgreSQL"]
              : slug === "property-management"
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
        await expect(page).toHaveURL(`${url}#facts`);
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
          hasDiagram(slug) &&
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
        if (hasDiagram(slug)) {
          await expect(
            page.getByRole("img", {
              name: t("project.architecture"),
              exact: true,
            }),
          ).toBeVisible();
        }
        const second = page
          .getByRole("navigation", { name: t("nav.sections") })
          .getByRole("link")
          .nth(1);
        const href = (await second.getAttribute("href")) ?? "";
        if (hasDiagram(slug)) expect(href).toBe("#diagram");
        await second.click();
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
        if (source === undefined) {
          await expect(repositoryLinks).toHaveCount(0);
        } else {
          await expect(
            page.locator(".prose").locator(`a[href="${source}"]`),
          ).toHaveCount(1);
        }
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
