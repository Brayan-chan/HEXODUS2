import { gsap } from "gsap";
import { initShared } from "../main.js";

const root = document;
const cleanups = [initShared(root)];
const markHeroReady = () => root.documentElement.classList.add("hero-ready");

function initContactAnimations() {
  const media = gsap.matchMedia();

  try {
    media.add("(prefers-reduced-motion: reduce)", markHeroReady);
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const hero = root.querySelector(".contact-page__hero");
      if (!hero) {
        markHeroReady();
        return;
      }

      const context = gsap.context(() => {
        const lines = hero.querySelectorAll(".contact-hero__line b");
        const copy = hero.querySelector(".contact-hero__copy");
        const actions = hero.querySelector(".contact-hero__actions");
        const phone = hero.querySelector(".contact-hero__phone");
        const photo = hero.querySelector(".contact-hero__photo");
        const timeline = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: markHeroReady,
        });

        timeline.fromTo(
          lines,
          { y: 0, yPercent: 110 },
          { y: 0, yPercent: 0, duration: 0.85, stagger: 0.12 },
          0.1,
        );
        timeline.fromTo(
          copy,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, clearProps: "transform,opacity" },
          0.35,
        );
        timeline.fromTo(
          [actions, phone],
          { y: 14, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.08,
            clearProps: "transform,opacity",
          },
          0.45,
        );
        timeline.fromTo(
          photo,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.85, clearProps: "transform,opacity" },
          0.2,
        );
      }, hero);

      return () => {
        context.revert();
        markHeroReady();
      };
    });

    return () => media.revert();
  } catch {
    media.revert();
    markHeroReady();
    return () => {};
  }
}

cleanups.push(initContactAnimations());

if (import.meta.hot) {
  import.meta.hot.dispose(() => cleanups.forEach((cleanup) => cleanup()));
}
