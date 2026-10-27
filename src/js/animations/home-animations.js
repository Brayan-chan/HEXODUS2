export async function initHomeAnimations(root) {
  if (!root) return () => {};
  try {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]);
    gsap.registerPlugin(ScrollTrigger);

    const media = gsap.matchMedia();
    const tweens = [];

    media.add("(prefers-reduced-motion: no-preference)", () => {
      // 1. Hero Entrance Timeline (Immediate on page load)
      const hero = root.querySelector(".hero");
      if (hero) {
        const eyebrow = hero.querySelector(".eyebrow");
        const lines = hero.querySelectorAll(".hero-line b");
        const copy = hero.querySelector(".hero__copy");
        const actions = hero.querySelector(".hero__actions");
        const signature = hero.querySelector(".hero__signature");
        const watermark = hero.querySelector(".watermark--hero");

        const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

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
            { yPercent: 110 },
            { yPercent: 0, duration: 0.85, stagger: 0.12 },
            0.2,
          );
        }
        if (copy) {
          heroTl.fromTo(
            copy,
            { y: 25, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7 },
            0.45,
          );
        }
        if (actions) {
          heroTl.fromTo(
            actions,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.65 },
            0.6,
          );
        }
        if (signature) {
          heroTl.fromTo(
            signature,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.6 },
            0.75,
          );
        }
        if (watermark) {
          heroTl.fromTo(
            watermark,
            { opacity: 0, scale: 0.9 },
            { opacity: 0.12, scale: 1, duration: 1.2, ease: "power2.out" },
            0.2,
          );
        }
        tweens.push(heroTl);
      }

      // 2. Benefits Marquee Fade-in
      const benefits = root.querySelector(".benefits");
      if (benefits) {
        tweens.push(
          gsap.from(benefits, {
            scrollTrigger: {
              trigger: benefits,
              start: "top 95%",
              once: true,
            },
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            clearProps: "opacity",
          }),
        );
      }

      // 3. Experience Section (Smooth Reveal)
      const expSection = root.querySelector(".experience");
      if (expSection) {
        const head = expSection.querySelector(".section-head");
        const index = expSection.querySelector(".section-index");
        const watermark = expSection.querySelector(".watermark");
        const cards = expSection.querySelectorAll(".media-card");

        if (index || head) {
          tweens.push(
            gsap.from([index, head].filter(Boolean), {
              scrollTrigger: {
                trigger: expSection,
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

        if (watermark) {
          tweens.push(
            gsap.from(watermark, {
              scrollTrigger: {
                trigger: expSection,
                start: "top 80%",
                once: true,
              },
              scale: 0.88,
              opacity: 0,
              duration: 1.2,
              ease: "power2.out",
              clearProps: "transform,opacity",
            }),
          );
        }

        if (cards.length) {
          tweens.push(
            gsap.from(cards, {
              scrollTrigger: {
                trigger:
                  expSection.querySelector(".experience-grid") || expSection,
                start: "top 85%",
                once: true,
              },
              y: 32,
              opacity: 0,
              duration: 0.9,
              stagger: 0.08,
              ease: "power3.out",
              clearProps: "transform,opacity",
            }),
          );
        }
      }

      // 4. Memberships Section
      const memberships = root.querySelector(".memberships");
      if (memberships) {
        const head = memberships.querySelector(".section-head");
        const index = memberships.querySelector(".section-index");
        const plans = memberships.querySelectorAll(".plans .plan");
        const passes = memberships.querySelectorAll(".short-passes");

        if (index || head) {
          tweens.push(
            gsap.from([index, head].filter(Boolean), {
              scrollTrigger: {
                trigger: memberships,
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

        if (plans.length) {
          tweens.push(
            gsap.from(plans, {
              scrollTrigger: {
                trigger: memberships.querySelector(".plans") || memberships,
                start: "top 82%",
                once: true,
              },
              y: 36,
              opacity: 0,
              duration: 0.95,
              stagger: 0.1,
              ease: "power3.out",
              clearProps: "transform,opacity",
            }),
          );
        }

        if (passes.length) {
          tweens.push(
            gsap.from(passes, {
              scrollTrigger: {
                trigger: passes,
                start: "top 90%",
                once: true,
              },
              y: 20,
              opacity: 0,
              duration: 0.8,
              ease: "power3.out",
              clearProps: "transform,opacity",
            }),
          );
        }
      }

      // 5. Philosophy / Nosotros Section
      const philosophy = root.querySelector(".philosophy");
      if (philosophy) {
        const contentItems = philosophy.querySelectorAll(
          ".section-index, .philosophy__title, .philosophy__copy, .philosophy__subcopy, .philosophy__actions",
        );
        const card = philosophy.querySelector(".philosophy__card");

        if (contentItems.length) {
          tweens.push(
            gsap.from(contentItems, {
              scrollTrigger: {
                trigger: philosophy,
                start: "top 82%",
                once: true,
              },
              y: 26,
              opacity: 0,
              duration: 0.85,
              stagger: 0.08,
              ease: "power3.out",
              clearProps: "transform,opacity",
            }),
          );
        }

        if (card) {
          tweens.push(
            gsap.from(card, {
              scrollTrigger: {
                trigger: philosophy,
                start: "top 82%",
                once: true,
              },
              y: 35,
              opacity: 0,
              duration: 1,
              ease: "power3.out",
              clearProps: "transform,opacity",
            }),
          );
        }
      }

      // 6. Team Section
      const team = root.querySelector(".team");
      if (team) {
        const head = team.querySelector(".section-head");
        const index = team.querySelector(".section-index");
        const photo = team.querySelector(".team-grid figure");
        const coaches = team.querySelectorAll(
          ".coach-list article, .coach-list .button",
        );

        if (index || head) {
          tweens.push(
            gsap.from([index, head].filter(Boolean), {
              scrollTrigger: {
                trigger: team,
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

        if (photo) {
          tweens.push(
            gsap.from(photo, {
              scrollTrigger: {
                trigger: team.querySelector(".team-grid") || team,
                start: "top 82%",
                once: true,
              },
              y: 32,
              opacity: 0,
              duration: 0.95,
              ease: "power3.out",
              clearProps: "transform,opacity",
            }),
          );
        }

        if (coaches.length) {
          tweens.push(
            gsap.from(coaches, {
              scrollTrigger: {
                trigger: team.querySelector(".coach-list") || team,
                start: "top 82%",
                once: true,
              },
              y: 26,
              opacity: 0,
              duration: 0.85,
              stagger: 0.1,
              ease: "power3.out",
              clearProps: "transform,opacity",
            }),
          );
        }
      }

      // 7. Gallery Section
      const gallery = root.querySelector(".gallery");
      if (gallery) {
        const head = gallery.querySelector(".section-head");
        const index = gallery.querySelector(".section-index");
        const stage = gallery.querySelector(".facility-stage");
        const thumbs = gallery.querySelectorAll(".facility-thumb");

        if (index || head) {
          tweens.push(
            gsap.from([index, head].filter(Boolean), {
              scrollTrigger: {
                trigger: gallery,
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

        if (stage) {
          tweens.push(
            gsap.from(stage, {
              scrollTrigger: {
                trigger: gallery.querySelector(".facility-gallery") || gallery,
                start: "top 82%",
                once: true,
              },
              y: 30,
              opacity: 0,
              duration: 0.9,
              ease: "power3.out",
              clearProps: "transform,opacity",
            }),
          );
        }

        if (thumbs.length) {
          tweens.push(
            gsap.from(thumbs, {
              scrollTrigger: {
                trigger: gallery.querySelector(".facility-controls") || gallery,
                start: "top 88%",
                once: true,
              },
              y: 20,
              opacity: 0,
              duration: 0.7,
              stagger: 0.08,
              ease: "power3.out",
              clearProps: "transform,opacity",
            }),
          );
        }
      }

      // 8. Community Section
      const community = root.querySelector(".community");
      if (community) {
        const textItems = community.querySelectorAll(
          ".community__text .section-index, .community__text h2, .community__text p",
        );
        const card = community.querySelector(".review-card");

        if (textItems.length) {
          tweens.push(
            gsap.from(textItems, {
              scrollTrigger: {
                trigger: community,
                start: "top 82%",
                once: true,
              },
              y: 28,
              opacity: 0,
              duration: 0.85,
              stagger: 0.08,
              ease: "power3.out",
              clearProps: "transform,opacity",
            }),
          );
        }

        if (card) {
          tweens.push(
            gsap.from(card, {
              scrollTrigger: {
                trigger: community,
                start: "top 82%",
                once: true,
              },
              y: 34,
              opacity: 0,
              duration: 1,
              ease: "power3.out",
              clearProps: "transform,opacity",
            }),
          );
        }
      }

      // 9. FAQ Section
      const faq = root.querySelector(".faq");
      if (faq) {
        const headItems = faq.querySelectorAll(
          ".faq-grid > div:first-child .section-index, .faq-grid > div:first-child h2, .faq-grid > div:first-child p, .faq-grid > div:first-child .button",
        );
        const items = faq.querySelectorAll(".faq-item");

        if (headItems.length) {
          tweens.push(
            gsap.from(headItems, {
              scrollTrigger: {
                trigger: faq,
                start: "top 85%",
                once: true,
              },
              y: 28,
              opacity: 0,
              duration: 0.85,
              stagger: 0.08,
              ease: "power3.out",
              clearProps: "transform,opacity",
            }),
          );
        }

        if (items.length) {
          tweens.push(
            gsap.from(items, {
              scrollTrigger: {
                trigger: faq.querySelector(".accordion") || faq,
                start: "top 82%",
                once: true,
              },
              y: 22,
              opacity: 0,
              duration: 0.75,
              stagger: 0.07,
              ease: "power3.out",
              clearProps: "transform,opacity",
            }),
          );
        }
      }

      // 10. Final CTA ("Hoy decides")
      const finalCta = root.querySelector(".final-cta");
      if (finalCta) {
        const contentItems = finalCta.querySelectorAll(
          ".final-cta__eyebrow, .final-cta__title, .final-cta__copy, .final-cta__actions",
        );
        if (contentItems.length) {
          tweens.push(
            gsap.from(contentItems, {
              scrollTrigger: {
                trigger: finalCta,
                start: "top 80%",
                once: true,
              },
              y: 32,
              opacity: 0,
              duration: 0.95,
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
      media.revert();
      tweens.forEach((tw) => tw.kill && tw.kill());
    };
  } catch (error) {
    console.warn("Home animations disabled or failed:", error);
    return () => {};
  }
}
