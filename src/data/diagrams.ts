import type { UiKey } from "../i18n/ui.ts";

/** The approved figure of a case study. */
export interface ProjectFigure {
  /**
   * `flow`: an HTML step list in `src/components/FlowDiagram.astro`.
   * `architecture`: an SVG in `src/components/Diagram.astro`.
   */
  kind: "flow" | "architecture";
  /** Index entry, accessible name and caption title. */
  title: UiKey;
  /** What the figure is, stated in its caption. */
  note: UiKey;
}

/**
 * The projects that have an approved figure. A case study without one has no
 * figure and no index entry for it; no generic diagram stands in.
 */
export const PROJECT_FIGURES: Readonly<Record<string, ProjectFigure>> = {
  // Drawn from scratch: no client name, real values, forms or screens.
  "field-operations": {
    kind: "flow",
    title: "project.flow",
    note: "project.synthetic",
  },
  "property-management": {
    kind: "architecture",
    title: "project.architecture",
    note: "project.illustration",
  },
  "rot-and-resolve": {
    kind: "architecture",
    title: "project.architecture",
    note: "project.illustration",
  },
};

export const DIAGRAM_PROJECTS: readonly string[] = Object.keys(PROJECT_FIGURES);

export function figureFor(slug: string): ProjectFigure | undefined {
  return PROJECT_FIGURES[slug];
}

export function hasDiagram(slug: string): boolean {
  return figureFor(slug) !== undefined;
}
