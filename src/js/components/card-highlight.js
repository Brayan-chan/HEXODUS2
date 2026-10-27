export function initCardHighlight(root) {
  const cards = [...root.querySelectorAll(".plan")];
  if (!cards.length) return () => {};
  const mobile = matchMedia("(max-width: 900px)");
  let frame = 0;
  const update = () => {
    frame = 0;
    if (!mobile.matches) {
      cards.forEach((card) => card.classList.remove("is-scroll-active"));
      return;
    }
    const center = innerHeight * 0.52;
    let closest = null;
    let distance = Infinity;
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      const delta = Math.abs(rect.top + rect.height / 2 - center);
      if (
        rect.bottom > innerHeight * 0.12 &&
        rect.top < innerHeight * 0.88 &&
        delta < distance
      ) {
        closest = card;
        distance = delta;
      }
    }
    cards.forEach((card) =>
      card.classList.toggle("is-scroll-active", card === closest),
    );
  };
  const requestUpdate = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  mobile.addEventListener("change", requestUpdate);
  return () => {
    window.removeEventListener("scroll", requestUpdate);
    window.removeEventListener("resize", requestUpdate);
    mobile.removeEventListener("change", requestUpdate);
    if (frame) cancelAnimationFrame(frame);
  };
}
