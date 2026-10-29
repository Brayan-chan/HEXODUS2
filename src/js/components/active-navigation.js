export function initActiveNavigation(root) {
  const links = [
    ...root.querySelectorAll(
      '.desktop-nav a[href^="#"], .mobile-menu a[href^="#"]',
    ),
  ];
  const sections = [...root.querySelectorAll("main section[id]")];
  if (!("IntersectionObserver" in window)) return () => {};
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((link) => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle("is-active", active);
          if (active) link.setAttribute("aria-current", "location");
          else if (link.getAttribute("aria-current") === "location")
            link.removeAttribute("aria-current");
        });
      }
    },
    { rootMargin: "-35% 0px -58% 0px" },
  );
  sections.forEach((section) => observer.observe(section));
  return () => observer.disconnect();
}
