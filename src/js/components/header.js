export function initHeader(root) {
  const header = root.querySelector("[data-header]");
  if (!header) return () => {};
  const opensAtSection =
    window.location.hash !== "" &&
    window.location.hash !== "#inicio" &&
    Boolean(root.getElementById(window.location.hash.slice(1)));
  let compact = window.scrollY > 112 || opensAtSection;
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
  const clearDeepLinkState = () => {
    requestAnimationFrame(() =>
      document.documentElement.classList.remove("has-deep-link"),
    );
  };
  header.classList.toggle("is-scrolled", compact);
  frame = requestAnimationFrame(update);
  window.addEventListener("scroll", onScroll, { passive: true });
  if (document.readyState === "complete") clearDeepLinkState();
  else window.addEventListener("load", clearDeepLinkState, { once: true });
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("load", clearDeepLinkState);
    if (frame) cancelAnimationFrame(frame);
  };
}
