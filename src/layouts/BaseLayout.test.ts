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
    slots: { default: "<main>Content</main>" },
  });
}

describe("BaseLayout", () => {
  it("renders the document language, title and description", async () => {
    const html = await render("/");
    expect(html).toContain('<html lang="en">');
    expect(html).toContain("<title>Page title</title>");
    expect(html).toContain(
      '<meta name="description" content="Page description">',
    );
  });

  it("points the canonical link at the absolute URL of the page", async () => {
    const html = await render("/projects/");
    expect(html).toContain(
      '<link rel="canonical" href="https://rodbrice.github.io/projects/">',
    );
  });

  it("renders the page content inside the body", async () => {
    expect(await render("/")).toMatch(
      /<body[^>]*>\s*<main>Content<\/main>\s*<\/body>/,
    );
  });
});
