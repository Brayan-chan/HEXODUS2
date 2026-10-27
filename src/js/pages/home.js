import { initShared } from "../main.js";
import { initGallery } from "../components/gallery.js";
import { initActiveNavigation } from "../components/active-navigation.js";
import { initCardHighlight } from "../components/card-highlight.js";
import { initExistingEffects } from "../animations/existing-effects.js";
import { initHomeAnimations } from "../animations/home-animations.js";

const root = document;
const cleanups = [
  initShared(root),
  initActiveNavigation(root),
  initCardHighlight(root.querySelector(".plans") ?? root),
];
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
let cleanupExistingEffects = initExistingEffects(root);
const onMotionChange = () => {
  cleanupExistingEffects();
  cleanupExistingEffects = initExistingEffects(root);
};
motionPreference.addEventListener("change", onMotionChange);
cleanups.push(() => {
  motionPreference.removeEventListener("change", onMotionChange);
  cleanupExistingEffects();
});
root
  .querySelectorAll("[data-facility-gallery]")
  .forEach((gallery) => cleanups.push(initGallery(gallery)));
initHomeAnimations(root).then((cleanup) => cleanups.push(cleanup));

if (import.meta.hot)
  import.meta.hot.dispose(() => cleanups.forEach((cleanup) => cleanup()));
