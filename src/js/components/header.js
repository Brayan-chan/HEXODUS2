export function initHeader(root) {
  if (!root.querySelector("[data-header]")) return () => {};
  let frame = 0;
  const clearDeepLinkState = () => {
    frame = requestAnimationFrame(() =>
      document.documentElement.classList.remove("has-deep-link"),
    );
  };
  if (document.readyState === "complete") clearDeepLinkState();
  else window.addEventListener("load", clearDeepLinkState, { once: true });
  return () => {
    window.removeEventListener("load", clearDeepLinkState);
    if (frame) cancelAnimationFrame(frame);
  };
}
