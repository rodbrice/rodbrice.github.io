import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import type { Locale } from "../i18n/locales.ts";
import BaseLayout from "./BaseLayout.astro";

interface RenderOptions {
  url: string;
  locale?: Locale;
  path?: string;
  type?: "website" | "article";
}

async function render({
  url,
  locale = "en",
  path,
  type,
}: RenderOptions): Promise<string> {
  const container = await AstroContainer.create({
    astroConfig: { site: "https://rodbrice.github.io" },
  });
  return container.renderToString(BaseLayout, {
    props: {
      title: "Page title",
      description: "Page description",
      locale,
      ...(path === undefined ? {} : { path }),
      ...(type === undefined ? {} : { type }),
    },
    request: new Request(`https://rodbrice.github.io${url}`),
    slots: { default: "Content" },
  });
}

const meta = (property: string, content: string): RegExp =>
  new RegExp(
    `<meta property="${property}" content="${content.replaceAll(".", "\\.")}"[\\s>]`,
  );

const alternate = (hreflang: string, href: string): RegExp =>
  new RegExp(
    `<link rel="alternate" hreflang="${hreflang}" href="${href.replaceAll(".", "\\.")}"`,
  );

describe("BaseLayout", () => {
  it("renders the title and description", async () => {
    const html = await render({ url: "/", path: "/" });
    expect(html).toContain("<title>Page title</title>");
    expect(html).toMatch(
      /<meta name="description" content="Page description"[\s>]/,
    );
  });

  it("sets the document language from the locale", async () => {
    expect(await render({ url: "/", path: "/" })).toMatch(
      /<html lang="en"[\s>]/,
    );
    expect(await render({ url: "/pt/", locale: "pt", path: "/" })).toMatch(
      /<html lang="pt-BR"[\s>]/,
    );
  });

  it("points the canonical link at the page in its own locale", async () => {
    const html = await render({
      url: "/fr/projects/",
      locale: "fr",
      path: "/projects/",
    });
    expect(html).toMatch(
      /<link rel="canonical" href="https:\/\/rodbrice\.github\.io\/fr\/projects\/"[\s>]/,
    );
  });

  it("lists every translation as an hreflang alternate, English as the default", async () => {
    const html = await render({
      url: "/pt/projects/",
      locale: "pt",
      path: "/projects/",
    });
    expect(html).toMatch(
      alternate("en", "https://rodbrice.github.io/projects/"),
    );
    expect(html).toMatch(
      alternate("pt-BR", "https://rodbrice.github.io/pt/projects/"),
    );
    expect(html).toMatch(
      alternate("fr", "https://rodbrice.github.io/fr/projects/"),
    );
    expect(html).toMatch(
      alternate("x-default", "https://rodbrice.github.io/projects/"),
    );
  });

  it("omits the canonical and alternates for pages without a path", async () => {
    const html = await render({ url: "/missing/" });
    expect(html).not.toContain('rel="canonical"');
    expect(html).not.toContain('rel="alternate"');
  });

  it("renders the page content in the main landmark, behind a translated skip link", async () => {
    const html = await render({ url: "/fr/", locale: "fr", path: "/" });
    expect(html).toMatch(
      /<a class="skip-link" href="#main"[^>]*>Aller au contenu<\/a>/,
    );
    expect(html).toMatch(/<main id="main"[^>]*>Content<\/main>/);
  });

  it("describes the page for link previews", async () => {
    const html = await render({
      url: "/fr/projects/",
      locale: "fr",
      path: "/projects/",
    });
    expect(html).toMatch(meta("og:type", "website"));
    expect(html).toMatch(meta("og:title", "Page title"));
    expect(html).toMatch(meta("og:description", "Page description"));
    expect(html).toMatch(
      meta("og:url", "https://rodbrice.github.io/fr/projects/"),
    );
    expect(html).toMatch(meta("og:image", "https://rodbrice.github.io/og.png"));
    expect(html).toMatch(
      /<meta name="twitter:card" content="summary_large_image"[\s>]/,
    );
  });

  it("gives the Open Graph locale and its translations", async () => {
    const html = await render({ url: "/pt/", locale: "pt", path: "/" });
    expect(html).toMatch(meta("og:locale", "pt_BR"));
    expect(html).toMatch(meta("og:locale:alternate", "en_US"));
    expect(html).toMatch(meta("og:locale:alternate", "fr_FR"));
    expect(html).not.toMatch(meta("og:locale:alternate", "pt_BR"));
  });

  it("lets case studies declare themselves as articles", async () => {
    const html = await render({
      url: "/projects/theone/",
      path: "/projects/theone/",
      type: "article",
    });
    expect(html).toMatch(meta("og:type", "article"));
  });

  it("omits og:url for pages without a path", async () => {
    expect(await render({ url: "/missing/" })).not.toContain('"og:url"');
  });

  it("preloads the self-hosted font", async () => {
    expect(await render({ url: "/", path: "/" })).toMatch(
      /<link rel="preload" href="[^"]+\.woff2" as="font"/,
    );
  });
});
