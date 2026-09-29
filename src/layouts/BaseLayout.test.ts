import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import BaseLayout from "./BaseLayout.astro";

async function render(path: string): Promise<string> {
  const container = await AstroContainer.create({
    astroConfig: { site: "https://rodbrice.github.io" },
  });
  return container.renderToString(BaseLayout, {
    props: { title: "Page title", description: "Page description" },
    request: new Request(`https://rodbrice.github.io${path}`),
    slots: { default: "Content" },
  });
}

describe("BaseLayout", () => {
  it("renders the document language, title and description", async () => {
    const html = await render("/");
    expect(html).toMatch(/<html lang="en"[\s>]/);
    expect(html).toContain("<title>Page title</title>");
    expect(html).toMatch(
      /<meta name="description" content="Page description"[\s>]/,
    );
  });

  it("points the canonical link at the absolute URL of the page", async () => {
    const html = await render("/projects/");
    expect(html).toMatch(
      /<link rel="canonical" href="https:\/\/rodbrice\.github\.io\/projects\/"[\s>]/,
    );
  });

  it("renders the page content in the main landmark, behind a skip link", async () => {
    const html = await render("/");
    expect(html).toMatch(/<a class="skip-link" href="#main"[\s>]/);
    expect(html).toMatch(/<main id="main"[^>]*>Content<\/main>/);
  });

  it("preloads the self-hosted font", async () => {
    expect(await render("/")).toMatch(
      /<link rel="preload" href="[^"]+\.woff2" as="font"/,
    );
  });
});
