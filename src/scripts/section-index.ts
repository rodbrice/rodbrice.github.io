export function initSectionIndex() {
  if (!("IntersectionObserver" in window)) return;
  const links = [
    ...document.querySelectorAll<HTMLAnchorElement>(".section-index a"),
  ];
  const visible = new Set<string>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = `#${entry.target.id}`;
        if (entry.isIntersecting) visible.add(id);
        else visible.delete(id);
      }
      const current = links.findLast((link) => visible.has(link.hash));
      if (!current) return;
      for (const link of links) {
        if (link === current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
    },
    { rootMargin: "0px 0px -50% 0px" },
  );
  for (const link of links) {
    const section = document.getElementById(link.hash.slice(1));
    if (section) observer.observe(section);
  }
}
