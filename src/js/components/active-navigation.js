export function initActiveNavigation(root) {
  const links = [...root.querySelectorAll(".desktop-nav a")];
  const sections = [...root.querySelectorAll("main section[id]")];
  if (!("IntersectionObserver" in window)) return () => {};
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((link) =>
          link.classList.toggle(
            "is-active",
            link.hash === `#${entry.target.id}`,
          ),
        );
      }
    },
    { rootMargin: "-35% 0px -58% 0px" },
  );
  sections.forEach((section) => observer.observe(section));
  return () => observer.disconnect();
}
