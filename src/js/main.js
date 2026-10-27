import { initMenu } from "./components/menu.js";
import { initHeader } from "./components/header.js";

export function initShared(root) {
  const cleanups = [initMenu(root), initHeader(root)];
  const fontStylesheet = root.querySelector("[data-font-stylesheet]");
  let firstFrame = 0;
  let secondFrame = 0;
  if (fontStylesheet) {
    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        fontStylesheet.media = "all";
      });
    });
  }
  return () => {
    if (firstFrame) cancelAnimationFrame(firstFrame);
    if (secondFrame) cancelAnimationFrame(secondFrame);
    cleanups.forEach((cleanup) => cleanup());
  };
}
