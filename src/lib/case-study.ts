/**
 * Splits a rendered case study after its first section, so the page can tell
 * the business story (the problem or need) before the facts and the figure.
 * `story` is everything before the second `<h2>`; `rest` starts with it.
 * A body with a single section is all story.
 */
export function splitStory(html: string): { story: string; rest: string } {
  const headings = [...html.matchAll(/<h2[\s>]/g)];
  const second = headings[1]?.index;
  if (headings[0]?.index === undefined) {
    throw new Error("A case study must start with a level 2 section");
  }
  if (second === undefined) return { story: html, rest: "" };
  return { story: html.slice(0, second), rest: html.slice(second) };
}
