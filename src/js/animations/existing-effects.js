export function initExistingEffects(root) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const cleanup = [];
  const items = [...root.querySelectorAll("[data-parallax]")];
  let frame = 0;
  const parallax = () => {
    frame = 0;
    for (const item of items) {
      const rect = item.parentElement.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= innerHeight) continue;
      const amount = Number(item.dataset.parallax || 20);
      const progress =
        (rect.top + rect.height / 2 - innerHeight / 2) / innerHeight;
      item.style.transform = `translate3d(0, ${(-progress * amount).toFixed(2)}px, 0) scale(1.06)`;
    }
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(parallax);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  parallax();
  cleanup.push(() => {
    window.removeEventListener("scroll", onScroll);
    if (frame) cancelAnimationFrame(frame);
    items.forEach((item) => {
      item.style.transform = "";
    });
  });

  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    root.querySelectorAll(".button").forEach((button) => {
      const move = (event) => {
        const rect = button.getBoundingClientRect();
        button.style.setProperty(
          "--mx",
          `${(event.clientX - rect.left - rect.width / 2) * 0.08}px`,
        );
        button.style.setProperty(
          "--my",
          `${(event.clientY - rect.top - rect.height / 2) * 0.12}px`,
        );
      };
      const leave = () => {
        button.style.setProperty("--mx", "0px");
        button.style.setProperty("--my", "0px");
      };
      button.addEventListener("pointermove", move);
      button.addEventListener("pointerleave", leave);
      cleanup.push(() => {
        button.removeEventListener("pointermove", move);
        button.removeEventListener("pointerleave", leave);
        button.style.removeProperty("--mx");
        button.style.removeProperty("--my");
      });
    });
  }
  return () => cleanup.forEach((remove) => remove());
}
