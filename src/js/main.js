import { initMenu } from "./components/menu.js";
import { initHeader } from "./components/header.js";

export function initShared(root) {
  const cleanups = [initMenu(root), initHeader(root)];
  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}
