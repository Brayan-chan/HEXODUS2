import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initShared } from "../main.js";

const root = document;
const cleanups = [initShared(root)];

const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");

function initContactAnimations() {
  if (motionPreference.matches) {
    document.documentElement.classList.add("hero-ready");
    return () => {};
  }

  try {
    gsap.registerPlugin(ScrollTrigger);

    const media = gsap.matchMedia();
    const tweens = [];

    media.add("(prefers-reduced-motion: reduce)", () => {
      document.documentElement.classList.add("hero-ready");
    });

    media.add("(prefers-reduced-motion: no-preference)", () => {
      // 00 · Hero Entrance
      const hero = root.querySelector(".contact-page__hero");
      if (hero) {
        const eyebrow = hero.querySelector(".contact-hero__eyebrow");
        const lines = hero.querySelectorAll(".contact-hero__line b");
        const copy = hero.querySelector(".contact-hero__copy");

        const heroTl = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => {
            document.documentElement.classList.add("hero-ready");
          },
        });

        if (eyebrow) {
          heroTl.fromTo(
            eyebrow,
            { y: -15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6 },
            0.1,
          );
        }
        if (lines.length) {
          heroTl.fromTo(
            lines,
            { y: 0, yPercent: 110 },
            { y: 0, yPercent: 0, duration: 0.85, stagger: 0.12 },
            0.2,
          );
        }
        if (copy) {
          heroTl.fromTo(
            copy,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7 },
            0.45,
          );
        }
        tweens.push(heroTl);
      }

      // 01 · Section 01 (#contacto)
      const secContact = root.querySelector("#contacto");
      if (secContact) {
        const index = secContact.querySelector(".section-index");
        const head = secContact.querySelector(".section-head");
        const photo = secContact.querySelector(".contact-photo");
        const dataCards = secContact.querySelectorAll(".contact-data article");

        const tlContact = gsap.timeline({
          scrollTrigger: {
            trigger: secContact,
            start: "top 82%",
            once: true,
          },
          defaults: { ease: "power3.out" },
        });

        const headItems = [index, head].filter(Boolean);
        if (headItems.length) {
          tlContact.from(
            headItems,
            {
              y: 28,
              opacity: 0,
              duration: 0.8,
              stagger: 0.1,
              clearProps: "transform,opacity",
            },
            0,
          );
        }

        const gridItems = [photo, ...dataCards].filter(Boolean);
        if (gridItems.length) {
          tlContact.from(
            gridItems,
            {
              y: 32,
              opacity: 0,
              duration: 0.85,
              stagger: 0.12,
              clearProps: "transform,opacity",
            },
            0.15,
          );
        }

        tweens.push(tlContact);
      }

      // 02 · Section 02 (.contact-page__map)
      const secMap = root.querySelector(".contact-page__map");
      if (secMap) {
        const index = secMap.querySelector(".section-index");
        const head = secMap.querySelector(".section-head");
        const mapFrame = secMap.querySelector(".contact-page__map-frame");

        const tlMap = gsap.timeline({
          scrollTrigger: {
            trigger: secMap,
            start: "top 82%",
            once: true,
          },
          defaults: { ease: "power3.out" },
        });

        const headItems = [index, head].filter(Boolean);
        if (headItems.length) {
          tlMap.from(
            headItems,
            {
              y: 28,
              opacity: 0,
              duration: 0.8,
              stagger: 0.1,
              clearProps: "transform,opacity",
            },
            0,
          );
        }

        if (mapFrame) {
          tlMap.from(
            mapFrame,
            {
              y: 32,
              opacity: 0,
              duration: 0.9,
              clearProps: "transform,opacity",
            },
            0.2,
          );
        }

        tweens.push(tlMap);
      }
    });

    return () => {
      media.revert();
      tweens.forEach((t) => t.kill?.());
    };
  } catch {
    return () => {};
  }
}

cleanups.push(initContactAnimations());

if (import.meta.hot) {
  import.meta.hot.dispose(() => cleanups.forEach((cleanup) => cleanup()));
}
