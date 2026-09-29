import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

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
      /** Two or three lines for the project card and the page description. */
      summary: z.string(),
      /** Position in the project list, starting at 1. */
      order: z.number().int().positive(),
      stack: z.array(z.string()).nonempty(),
      /** Client work: names, screens and code stay private. */
      confidential: z.boolean().default(false),
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
