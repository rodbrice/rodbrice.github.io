/** Allows every crawler and points it at the sitemap. */
export function robotsTxt(site: URL): string {
  const sitemap = new URL("sitemap-index.xml", site).href;
  return `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`;
}
