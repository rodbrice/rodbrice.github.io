import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

import { PROJECT_STATUSES } from "./lib/projects";

/**
 * One Markdown file per project and language:
 * `src/content/projects/<locale>/<slug>.md`. The body is the case study.
 */
const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Short label above the title, e.g. the kind of system. */
      kind: z.string(),
      /** Two or three lines for the case study lead and the page description. */
      summary: z.string(),
      /** One line on the card: the problem or context the project answers. */
      problem: z.string().max(160),
      /** One line on the card and the case study: what I did myself. */
      contribution: z.string().max(160),
      /** The verified stage of the project, labelled in each language by `src/i18n/ui.ts`. */
      status: z.enum(PROJECT_STATUSES),
      /** Position in the project list, starting at 1. */
      order: z.number().int().positive(),
      /** The most relevant technologies, at most six, shown as secondary tags. */
      stack: z.array(z.string()).nonempty().max(6),
      /** Public repository, linked from the card and the case study. */
      source: z.url().optional(),
      /** Private code: names, screens and code stay private. */
      confidential: z.boolean().default(false),
      /** With `confidential`: client work (the default), or the author's own private project. */
      clientWork: z.boolean().default(true),
      /** Shown under "Featured work" on the home page; the rest go under "Other engineering projects". */
      featured: z.boolean().default(false),
      /** Whether the project has its own case study page, or only a card. */
      caseStudy: z.boolean().default(true),
      /** Approved screenshots, shown on the case study page. */
      media: z
        .array(
          z.object({
            image: image(),
            alt: z.string(),
            caption: z.string().optional(),
          }),
        )
        .default([]),
    }),
});

export const collections = { projects };
