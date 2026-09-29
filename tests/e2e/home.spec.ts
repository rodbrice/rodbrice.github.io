import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { SKILLS, TIMELINE } from "../../src/data/experience.ts";
import { PROFILES } from "../../src/data/profile.ts";
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

  test("shows the owner's timeline word for word in French", async ({
    page,
  }) => {
    await page.goto("/fr/#experience");
    const timeline = page.getByRole("region", { name: "Parcours" });
    await expect(timeline).toBeInViewport();
    const entries = await timeline
      .getByRole("listitem")
      .evaluateAll((items) =>
        items.map((item) =>
          (item as HTMLElement).innerText.replace(/\s+/g, " ").trim(),
        ),
      );
    expect(entries).toEqual([
      "2026–Aujourd’hui Développeur logiciel indépendant Suisse / Europe Missions privées en développement backend et full stack. Travail sur des applications métier avec C#/.NET, ASP.NET Core, React, TypeScript, PostgreSQL, tests automatisés, Docker et CI/CD.",
      "2023–2025 Développeur logiciel freelance Brésil Réalisation de solutions backend et full stack pour différents clients. Analyse des besoins, conception technique, bases de données relationnelles, API REST, logique métier, interfaces web, tests et livraisons itératives.",
      "2022 Web Development Le Wagon, Lausanne Programme intensif de 10 semaines en développement web.",
      "Formation en cours Bachelor en ingénierie logicielle Instituto Infnet, Brésil Diplôme prévu en 2029.",
    ]);
  });

  for (const locale of LOCALES) {
    const t = useTranslations(locale);

    test(`shows the timeline, technologies and contact in ${locale}`, async ({
      page,
    }) => {
      await page.goto(localizePath("/", locale));

      const timeline = page.getByRole("region", {
        name: t("experience.title"),
      });
      await expect(timeline.getByRole("heading", { level: 3 })).toHaveText(
        TIMELINE.map(({ title }) => title[locale]),
      );

      const skills = page.getByRole("region", { name: t("skills.title") });
      for (const { label, skills: names } of SKILLS) {
        await expect(
          skills
            .getByRole("list", { name: label[locale] })
            .getByRole("listitem"),
        ).toHaveText(names.map((name) => name[locale]));
      }

      const contact = page.getByRole("region", { name: t("contact.title") });
      await expect(
        contact.getByRole("link", { name: "LinkedIn" }),
      ).toHaveAttribute("href", PROFILES.linkedin);
      await expect(
        contact.getByRole("link", { name: "GitHub" }),
      ).toHaveAttribute("href", PROFILES.github);
      await expect(contact.getByRole("link")).toHaveCount(2);
    });
  }

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
