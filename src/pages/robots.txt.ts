import type { APIRoute } from "astro";

import { robotsTxt } from "../lib/robots";

export const GET: APIRoute = ({ site }) => {
  if (site === undefined) {
    throw new Error("`site` must be set in astro.config.ts");
  }
  return new Response(robotsTxt(site), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
