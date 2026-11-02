import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initShared } from "../main.js";
import { initActiveNavigation } from "../components/active-navigation.js";
import { initExistingEffects } from "../animations/existing-effects.js";

const root = document;
const cleanups = [initShared(root), initActiveNavigation(root)];

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

function initMembershipsAnimations() {
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
      const hero = root.querySelector(".memberships-hero");
      if (hero) {
        const badge = hero.querySelector(".memberships-hero__badge");
        const lines = hero.querySelectorAll(".memberships-hero__line b");
        const subtitle = hero.querySelector(".memberships-hero__subtitle");
        const badges = hero.querySelector(".memberships-hero__badges");

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => {
            document.documentElement.classList.add("hero-ready");
          },
        });

        if (badge) {
          tl.fromTo(
            badge,
            { y: -15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6 },
            0.1,
          );
        }
        if (lines.length) {
          tl.fromTo(
            lines,
            { y: 0, yPercent: 110 },
            { y: 0, yPercent: 0, duration: 0.85, stagger: 0.12 },
            0.2,
          );
        }
        if (subtitle) {
          tl.fromTo(
            subtitle,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7 },
            0.45,
          );
        }
        if (badges) {
          tl.fromTo(
            badges,
            { y: 18, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.65 },
            0.6,
          );
        }
        tweens.push(tl);
      }

      // 01 · Planes
      const secPlanes = root.querySelector("#planes");
      if (secPlanes) {
        const head = secPlanes.querySelector(".section-head");
        const index = secPlanes.querySelector(".section-index");
        const cards = secPlanes.querySelectorAll(".hexodus-plan-card");

        if (index || head) {
          tweens.push(
            gsap.from([index, head].filter(Boolean), {
              scrollTrigger: {
                trigger: secPlanes,
                start: "top 85%",
                once: true,
              },
              y: 28,
              opacity: 0,
              duration: 0.85,
              stagger: 0.1,
              ease: "power3.out",
              clearProps: "transform,opacity",
            }),
          );
        }

        if (cards.length) {
          tweens.push(
            gsap.from(cards, {
              scrollTrigger: {
                trigger:
                  secPlanes.querySelector(".memberships-grid") || secPlanes,
                start: "top 82%",
                once: true,
              },
              y: 32,
              opacity: 0,
              duration: 0.85,
              stagger: 0.1,
              ease: "power3.out",
              clearProps: "transform,opacity",
            }),
          );
        }
      }

      // 02 · Pases
      const secPases = root.querySelector("#pases");
      if (secPases) {
        const head = secPases.querySelector(".section-head");
        const index = secPases.querySelector(".section-index");
        const cards = secPases.querySelectorAll(".hexodus-pass-card");

        if (index || head) {
          tweens.push(
            gsap.from([index, head].filter(Boolean), {
              scrollTrigger: {
                trigger: secPases,
                start: "top 85%",
                once: true,
              },
              y: 28,
              opacity: 0,
              duration: 0.85,
              stagger: 0.1,
              ease: "power3.out",
              clearProps: "transform,opacity",
            }),
          );
        }

        if (cards.length) {
          tweens.push(
            gsap.from(cards, {
              scrollTrigger: {
                trigger: secPases.querySelector(".passes-grid") || secPases,
                start: "top 82%",
                once: true,
              },
              y: 28,
              opacity: 0,
              duration: 0.8,
              stagger: 0.08,
              ease: "power3.out",
              clearProps: "transform,opacity",
            }),
          );
        }
      }

      // 03 · FAQ & Accordion
      const secFaq = root.querySelector("#faq");
      if (secFaq) {
        const head = secFaq.querySelector(".section-head");
        const items = secFaq.querySelectorAll(".faq-item");

        if (head) {
          tweens.push(
            gsap.from(head, {
              scrollTrigger: {
                trigger: secFaq,
                start: "top 85%",
                once: true,
              },
              y: 28,
              opacity: 0,
              duration: 0.85,
              ease: "power3.out",
              clearProps: "transform,opacity",
            }),
          );
        }

        if (items.length) {
          tweens.push(
            gsap.from(items, {
              scrollTrigger: {
                trigger: secFaq.querySelector(".accordion") || secFaq,
                start: "top 82%",
                once: true,
              },
              y: 20,
              opacity: 0,
              duration: 0.75,
              stagger: 0.06,
              ease: "power3.out",
              clearProps: "transform,opacity",
            }),
          );
        }
      }

      // 04 · CTA Cierre
      const secCta = root.querySelector("#contacto-membresias");
      if (secCta) {
        const content = secCta.querySelectorAll(
          ".memberships-cta__title, .memberships-cta__desc, .memberships-cta__actions",
        );
        if (content.length) {
          tweens.push(
            gsap.from(content, {
              scrollTrigger: {
                trigger: secCta,
                start: "top 80%",
                once: true,
              },
              y: 30,
              opacity: 0,
              duration: 0.9,
              stagger: 0.1,
              ease: "power3.out",
              clearProps: "transform,opacity",
            }),
          );
        }
      }

      ScrollTrigger.refresh();
    });

    return () => {
      tweens.forEach((t) => t.kill?.());
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      media.revert();
    };
  } catch {
    return () => {};
  }
}

cleanups.push(initMembershipsAnimations());

if (import.meta.hot) {
  import.meta.hot.dispose(() => cleanups.forEach((cleanup) => cleanup()));
}
