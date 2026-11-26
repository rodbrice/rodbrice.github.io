/**
 * The projects that have an approved architecture diagram in
 * `src/components/Diagram.astro`. A case study without one has no figure.
 */
export const DIAGRAM_PROJECTS: readonly string[] = [
  "field-operations",
  "property-management",
  "theone",
];

export function hasDiagram(slug: string): boolean {
  return DIAGRAM_PROJECTS.includes(slug);
}
