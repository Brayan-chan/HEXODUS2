export function initGallery(root) {
  const stage = root.querySelector(".facility-stage");
  const image = root.querySelector("[data-gallery-image]");
  const mobileSource = root.querySelector("picture source");
  const caption = root.querySelector("[data-gallery-caption]");
  const count = root.querySelector("[data-gallery-count]");
  const thumbs = [...root.querySelectorAll(".facility-thumb")];
  if (!stage || !image || !mobileSource || !caption || !count || !thumbs.length)
    return () => {};
  let requestId = 0;
  const listeners = [];

  const select = async (button) => {
    if (button.classList.contains("is-active")) return;
    const current = ++requestId;
    const source = matchMedia("(max-width: 600px)").matches
      ? button.dataset.mobile
      : button.dataset.desktop;
    stage.classList.add("is-changing");
    try {
      await new Promise((resolve, reject) => {
        const preload = new Image();
        preload.onload = resolve;
        preload.onerror = reject;
        preload.src = source;
      });
    } catch {
      if (current === requestId) stage.classList.remove("is-changing");
      return;
    }
    if (current !== requestId) return;
    mobileSource.srcset = button.dataset.mobile;
    image.src = button.dataset.desktop;
    image.alt = button.dataset.alt;
    caption.textContent = button.dataset.caption;
    count.textContent = button.dataset.count;
    thumbs.forEach((thumb) => {
      const active = thumb === button;
      thumb.classList.toggle("is-active", active);
      thumb.setAttribute("aria-pressed", String(active));
    });
    requestAnimationFrame(() => stage.classList.remove("is-changing"));
  };

  thumbs.forEach((thumb, index) => {
    const click = () => select(thumb);
    const keydown = (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const next = thumbs[(index + direction + thumbs.length) % thumbs.length];
      next.focus();
      select(next);
    };
    thumb.addEventListener("click", click);
    thumb.addEventListener("keydown", keydown);
    listeners.push(() => {
      thumb.removeEventListener("click", click);
      thumb.removeEventListener("keydown", keydown);
    });
  });
  return () => {
    requestId++;
    listeners.forEach((remove) => remove());
  };
}
