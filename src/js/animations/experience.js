export async function initExperienceMotion(root) {
  if (!root) return () => {};
  try {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]);
    gsap.registerPlugin(ScrollTrigger);
    const heading = root.querySelector(".section-head");
    if (!heading) return () => {};
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      let tween;
      const trigger = ScrollTrigger.create({
        trigger: heading,
        start: "top 85%",
        once: true,
        onEnter: () => {
          tween = gsap.fromTo(
            heading,
            { y: 20, opacity: 0.65 },
            {
              y: 0,
              opacity: 1,
              duration: 0.65,
              ease: "power2.out",
              clearProps: "transform,opacity",
            },
          );
        },
      });
      return () => {
        trigger.kill();
        tween?.kill();
        gsap.set(heading, { clearProps: "transform,opacity" });
      };
    });
    return () => media.revert();
  } catch (error) {
    console.warn("La animación de experiencia no pudo cargar:", error);
    return () => {};
  }
}
