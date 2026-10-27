export function initHeader(root) {
  const header = root.querySelector("[data-header]");
  if (!header) return () => {};
  let compact = window.scrollY > 112;
  let frame = 0;
  const update = () => {
    frame = 0;
    if (!compact && window.scrollY > 112) compact = true;
    if (compact && window.scrollY < 32) compact = false;
    header.classList.toggle("is-scrolled", compact);
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    window.removeEventListener("scroll", onScroll);
    if (frame) cancelAnimationFrame(frame);
  };
}
