import { isLocale, LOCALES } from "../i18n/locales.ts";
import type { Locale } from "../i18n/locales.ts";

/**
 * The verified stage of a project. Each value has a label in every language
 * (`status.<value>` in `src/i18n/ui.ts`); add one only for a stage the
 * project's own documentation supports.
 */
export const PROJECT_STATUSES = [
  "clientValidation",
  "firstRelease",
  "inDevelopment",
  "mvpInDevelopment",
  "earlyDevelopment",
  "personal",
  "experiment",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

/** The fields every translation of a project must share. */
export interface ProjectFacts {
  order: number;
  stack: readonly string[];
  caseStudy: boolean;
  featured: boolean;
  status: ProjectStatus;
  confidential: boolean;
  clientWork: boolean;
  source?: string | undefined;
}

/**
 * The one action a project card offers: its case study, else its public
 * source, else a plain note that the project is private. A card never shows
 * a link that leads nowhere.
 */
export type PrimaryAction =
  | { kind: "caseStudy" }
  | { kind: "source"; href: string }
  | { kind: "private"; clientWork: boolean };

export function primaryAction(
  facts: Pick<
    ProjectFacts,
    "caseStudy" | "source" | "confidential" | "clientWork"
  >,
): PrimaryAction {
  if (facts.caseStudy) return { kind: "caseStudy" };
  if (facts.source !== undefined) return { kind: "source", href: facts.source };
  if (facts.confidential) {
    return { kind: "private", clientWork: facts.clientWork };
  }
  throw new Error(
    "A project needs a case study, a public source or the confidential flag",
  );
}

/**
 * The site path where a project can be read about: its case study, or else
 * its card on the home page, so a mention of the project never leads nowhere.
 */
export function projectPath(
  slug: string,
  facts: Pick<ProjectFacts, "caseStudy">,
): string {
  return facts.caseStudy ? `/projects/${slug}/` : `/#${cardId(slug)}`;
}

/** The `id` of a project's card on the home page. */
export function cardId(slug: string): string {
  return `project-${slug}`;
}

/**
 * Splits projects already in display order into the featured ones and the
 * others, each keeping that order.
 */
export function splitFeatured<
  Entry extends { data: Pick<ProjectFacts, "featured"> },
>(projects: readonly Entry[]): { featured: Entry[]; other: Entry[] } {
  return {
    featured: projects.filter(({ data }) => data.featured),
    other: projects.filter(({ data }) => !data.featured),
  };
}

export interface ProjectEntry {
  /** Content id such as `fr/rot-and-resolve`: the locale folder, then the project slug. */
  id: string;
  data: ProjectFacts;
}

/** Splits a content id such as `fr/rot-and-resolve` into its locale and slug. */
export function parseProjectId(id: string): { locale: Locale; slug: string } {
  const [locale, slug, ...rest] = id.split("/");
  if (!isLocale(locale) || !slug || rest.length > 0) {
    throw new Error(
      `Project "${id}" must live in src/content/projects/<locale>/<slug>.md`,
    );
  }
  return { locale, slug };
}

/**
 * The projects of one locale, in display order. Throws when a project is
 * missing in another language, its translations disagree on a shared fact
 * (order, stack, case study, featured, status, visibility or source), or it offers no
 * card action, so a translation gap fails the build instead of shipping.
 */
export function projectsFor<Entry extends ProjectEntry>(
  entries: readonly Entry[],
  locale: Locale,
): (Entry & { slug: string })[] {
  const bySlug = new Map<string, Map<Locale, Entry>>();
  for (const entry of entries) {
    const { locale: entryLocale, slug } = parseProjectId(entry.id);
    const translations = bySlug.get(slug) ?? new Map<Locale, Entry>();
    translations.set(entryLocale, entry);
    bySlug.set(slug, translations);
  }

  const problems: string[] = [];
  const projects: (Entry & { slug: string })[] = [];
  for (const [slug, translations] of bySlug) {
    const missing = LOCALES.filter((other) => !translations.has(other));
    const entry = translations.get(locale);
    if (missing.length > 0 || entry === undefined) {
      problems.push(`"${slug}" has no ${missing.join(", ")} translation`);
      continue;
    }
    for (const other of translations.values()) {
      if (!sameFacts(entry.data, other.data)) {
        problems.push(
          `"${other.id}" differs from "${entry.id}" in its shared facts`,
        );
      }
    }
    try {
      primaryAction(entry.data);
    } catch (error) {
      problems.push(`"${slug}": ${(error as Error).message}`);
    }
    projects.push({ ...entry, slug });
  }
  if (problems.length > 0) {
    throw new Error(
      `Project translations are inconsistent:\n${problems.join("\n")}`,
    );
  }

  return projects.sort((a, b) => a.data.order - b.data.order);
}

function sameFacts(a: ProjectFacts, b: ProjectFacts): boolean {
  return (
    a.order === b.order &&
    a.caseStudy === b.caseStudy &&
    a.featured === b.featured &&
    a.status === b.status &&
    a.confidential === b.confidential &&
    a.clientWork === b.clientWork &&
    a.source === b.source &&
    a.stack.join("\n") === b.stack.join("\n")
  );
}
