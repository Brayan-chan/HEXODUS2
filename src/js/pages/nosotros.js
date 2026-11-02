import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initShared } from "../main.js";
import { initActiveNavigation } from "../components/active-navigation.js";
import { initExistingEffects } from "../animations/existing-effects.js";

const root = document;
const cleanups = [initShared(root), initActiveNavigation(root)];

// Parallax & magnetic button micro-interactions
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

// Interactive Video Controller
function initVideoPlayer() {
  const container = root.querySelector("[data-video-container]");
  if (!container) return () => {};

  const video = container.querySelector("#hexodusBrandVideo");
  const playTrigger = container.querySelector("[data-play-trigger]");
  const soundTrigger = container.querySelector("[data-sound-trigger]");
  const soundIcon = container.querySelector(".about-video-box__sound-icon");
  const progressBar = container.querySelector(".about-video-box__progress-bar");
  const progressFill = container.querySelector("[data-progress-fill]");

  if (!video) return () => {};

  const togglePlay = () => {
    if (video.paused || video.ended) {
      video
        .play()
        .then(() => {
          container.classList.add("is-playing");
        })
        .catch(() => {});
    } else {
      video.pause();
      container.classList.remove("is-playing");
    }
  };

  const toggleSound = (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
    if (soundIcon) {
      soundIcon.textContent = video.muted ? "🔇" : "🔊";
    }
  };

  const updateProgress = () => {
    if (video.duration && progressFill) {
      const percent = (video.currentTime / video.duration) * 100;
      progressFill.style.width = `${percent}%`;
    }
  };

  const onSeek = (e) => {
    if (!video.duration || !progressBar) return;
    const rect = progressBar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pos * video.duration;
  };

  const onVideoEnded = () => {
    container.classList.remove("is-playing");
  };

  playTrigger?.addEventListener("click", togglePlay);
  video.addEventListener("click", togglePlay);
  soundTrigger?.addEventListener("click", toggleSound);
  video.addEventListener("timeupdate", updateProgress);
  video.addEventListener("ended", onVideoEnded);
  progressBar?.addEventListener("click", onSeek);

  return () => {
    playTrigger?.removeEventListener("click", togglePlay);
    video.removeEventListener("click", togglePlay);
    soundTrigger?.removeEventListener("click", toggleSound);
    video.removeEventListener("timeupdate", updateProgress);
    video.removeEventListener("ended", onVideoEnded);
    progressBar?.removeEventListener("click", onSeek);
  };
}

cleanups.push(initVideoPlayer());

// GSAP Editorial Text & Scroll Reveal Animations
function initNosotrosAnimations() {
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
      // 00 · Hero text entrance timeline
      const hero = root.querySelector(".about-hero");
      if (hero) {
        const eyebrow = hero.querySelector(".about-hero__badge-eyebrow");
        const lines = hero.querySelectorAll(".about-hero__line b");
        const copy = hero.querySelector(".about-hero__copy");
        const actions = hero.querySelector(".about-hero__actions");
        const location = hero.querySelector(".about-hero__location");
        const glassCard = hero.querySelector(".about-hero__glass-card");

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
        if (actions) {
          heroTl.fromTo(
            actions,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.65 },
            0.6,
          );
        }
        if (location) {
          heroTl.fromTo(
            location,
            { y: 15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6 },
            0.7,
          );
        }
        if (glassCard) {
          heroTl.fromTo(
            glassCard,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.65 },
            0.45,
          );
        }
        tweens.push(heroTl);
      }

      // 01 · #entrenar (Más que un lugar para entrenar)
      const secEntrenar = root.querySelector("#entrenar");
      if (secEntrenar) {
        const head = secEntrenar.querySelector(".section-head");
        const index = secEntrenar.querySelector(".section-index");
        const visual = secEntrenar.querySelector(".about-personal__visual");
        const items = secEntrenar.querySelectorAll(
          ".about-personal__manifesto-item",
        );
        const quote = secEntrenar.querySelector(".about-personal__quote-card");
        const cta = secEntrenar.querySelector(".about-personal__cta");

        const tlEntrenar = gsap.timeline({
          scrollTrigger: {
            trigger: secEntrenar,
            start: "top 82%",
            once: true,
          },
          defaults: { ease: "power3.out" },
        });

        const headItems = [index, head].filter(Boolean);
        if (headItems.length) {
          tlEntrenar.from(
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

        if (visual) {
          tlEntrenar.from(
            visual,
            {
              y: 32,
              opacity: 0,
              duration: 0.85,
              clearProps: "transform,opacity",
            },
            0.1,
          );
        }

        if (items.length) {
          tlEntrenar.from(
            items,
            {
              y: 22,
              opacity: 0,
              duration: 0.7,
              stagger: 0.08,
              clearProps: "transform,opacity",
            },
            0.18,
          );
        }

        const bottomItems = [quote, cta].filter(Boolean);
        if (bottomItems.length) {
          tlEntrenar.from(
            bottomItems,
            {
              y: 18,
              opacity: 0,
              duration: 0.65,
              stagger: 0.08,
              clearProps: "transform,opacity",
            },
            0.28,
          );
        }

        tweens.push(tlEntrenar);
      }

      // 02 · #experiencia (Video de marca)
      const secExperiencia = root.querySelector("#experiencia");
      if (secExperiencia) {
        const head = secExperiencia.querySelector(".section-head");
        const index = secExperiencia.querySelector(".section-index");
        const videoBox = secExperiencia.querySelector(".about-video-box");

        const tlExperiencia = gsap.timeline({
          scrollTrigger: {
            trigger: secExperiencia,
            start: "top 82%",
            once: true,
          },
          defaults: { ease: "power3.out" },
        });

        const headItems = [index, head].filter(Boolean);
        if (headItems.length) {
          tlExperiencia.from(
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

        if (videoBox) {
          tlExperiencia.from(
            videoBox,
            {
              y: 34,
              opacity: 0,
              duration: 0.9,
              clearProps: "transform,opacity",
            },
            0.15,
          );
        }

        tweens.push(tlExperiencia);
      }

      // 03 · #esencia (3 Pilares)
      const secEsencia = root.querySelector("#esencia");
      if (secEsencia) {
        const head = secEsencia.querySelector(".section-head");
        const index = secEsencia.querySelector(".section-index");
        const pillars = secEsencia.querySelectorAll(".about-pillar-card");

        const tlEsencia = gsap.timeline({
          scrollTrigger: {
            trigger: secEsencia,
            start: "top 82%",
            once: true,
          },
          defaults: { ease: "power3.out" },
        });

        const headItems = [index, head].filter(Boolean);
        if (headItems.length) {
          tlEsencia.from(
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

        if (pillars.length) {
          tlEsencia.from(
            pillars,
            {
              y: 32,
              opacity: 0,
              duration: 0.8,
              stagger: 0.1,
              clearProps: "transform,opacity",
            },
            0.15,
          );
        }

        tweens.push(tlEsencia);
      }

      // 04 · #instalaciones (Todo listo para tu sesión / Checklist)
      const secInstalaciones = root.querySelector("#instalaciones");
      if (secInstalaciones) {
        const head = secInstalaciones.querySelector(".section-head");
        const index = secInstalaciones.querySelector(".section-index");
        const listItems = secInstalaciones.querySelectorAll(
          ".about-facilities__list li",
        );
        const visual = secInstalaciones.querySelector(
          ".about-facilities__visual",
        );
        const actions = secInstalaciones.querySelector(
          ".about-facilities__actions",
        );

        const tlInstalaciones = gsap.timeline({
          scrollTrigger: {
            trigger: secInstalaciones,
            start: "top 82%",
            once: true,
          },
          defaults: { ease: "power3.out" },
        });

        const headItems = [index, head].filter(Boolean);
        if (headItems.length) {
          tlInstalaciones.from(
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

        if (visual) {
          tlInstalaciones.from(
            visual,
            {
              y: 32,
              opacity: 0,
              duration: 0.85,
              clearProps: "transform,opacity",
            },
            0.1,
          );
        }

        if (listItems.length) {
          tlInstalaciones.from(
            listItems,
            {
              y: 20,
              opacity: 0,
              duration: 0.65,
              stagger: 0.05,
              clearProps: "transform,opacity",
            },
            0.18,
          );
        }

        if (actions) {
          tlInstalaciones.from(
            actions,
            {
              y: 18,
              opacity: 0,
              duration: 0.65,
              clearProps: "transform,opacity",
            },
            0.28,
          );
        }

        tweens.push(tlInstalaciones);
      }

      // 05 · #equipo (Coaches Walter y David)
      const secEquipo = root.querySelector("#equipo");
      if (secEquipo) {
        const head = secEquipo.querySelector(".section-head");
        const index = secEquipo.querySelector(".section-index");
        const coaches = secEquipo.querySelectorAll(".about-coach-card");

        const tlEquipo = gsap.timeline({
          scrollTrigger: {
            trigger: secEquipo,
            start: "top 82%",
            once: true,
          },
          defaults: { ease: "power3.out" },
        });

        const headItems = [index, head].filter(Boolean);
        if (headItems.length) {
          tlEquipo.from(
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

        if (coaches.length) {
          tlEquipo.from(
            coaches,
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

        tweens.push(tlEquipo);
      }

      // 06 · #servicios (Servicios adicionales)
      const secServicios = root.querySelector("#servicios");
      if (secServicios) {
        const head = secServicios.querySelector(".section-head");
        const index = secServicios.querySelector(".section-index");
        const cards = secServicios.querySelectorAll(".about-service-card");
        const action = secServicios.querySelector(".about-services__action");

        const tlServicios = gsap.timeline({
          scrollTrigger: {
            trigger: secServicios,
            start: "top 82%",
            once: true,
          },
          defaults: { ease: "power3.out" },
        });

        const headItems = [index, head].filter(Boolean);
        if (headItems.length) {
          tlServicios.from(
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

        if (cards.length) {
          tlServicios.from(
            cards,
            {
              y: 30,
              opacity: 0,
              duration: 0.8,
              stagger: 0.08,
              clearProps: "transform,opacity",
            },
            0.15,
          );
        }

        if (action) {
          tlServicios.from(
            action,
            {
              y: 18,
              opacity: 0,
              duration: 0.65,
              clearProps: "transform,opacity",
            },
            0.25,
          );
        }

        tweens.push(tlServicios);
      }

      // 07 · #comunidad (Comunidad dúo)
      const secComunidad = root.querySelector("#comunidad");
      if (secComunidad) {
        const head = secComunidad.querySelector(".section-head");
        const index = secComunidad.querySelector(".section-index");
        const cards = secComunidad.querySelectorAll(".about-community__card");
        const banner = secComunidad.querySelector(".about-community__banner");

        const tlComunidad = gsap.timeline({
          scrollTrigger: {
            trigger: secComunidad,
            start: "top 82%",
            once: true,
          },
          defaults: { ease: "power3.out" },
        });

        const headItems = [index, head].filter(Boolean);
        if (headItems.length) {
          tlComunidad.from(
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

        if (cards.length) {
          tlComunidad.from(
            cards,
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

        if (banner) {
          tlComunidad.from(
            banner,
            {
              y: 20,
              opacity: 0,
              duration: 0.7,
              clearProps: "transform,opacity",
            },
            0.25,
          );
        }

        tweens.push(tlComunidad);
      }

      // 08 · #empieza (Cierre de marca)
      const secEmpieza = root.querySelector("#empieza");
      if (secEmpieza) {
        const index = secEmpieza.querySelector(".section-index");
        const items = secEmpieza.querySelectorAll(
          ".about-closing__title, .about-closing__desc, .about-closing__actions",
        );

        const tlEmpieza = gsap.timeline({
          scrollTrigger: {
            trigger: secEmpieza,
            start: "top 82%",
            once: true,
          },
          defaults: { ease: "power3.out" },
        });

        if (index) {
          tlEmpieza.from(
            index,
            {
              y: 20,
              opacity: 0,
              duration: 0.7,
              clearProps: "transform,opacity",
            },
            0,
          );
        }

        if (items.length) {
          tlEmpieza.from(
            items,
            {
              y: 30,
              opacity: 0,
              duration: 0.85,
              stagger: 0.1,
              clearProps: "transform,opacity",
            },
            0.1,
          );
        }

        tweens.push(tlEmpieza);
      }
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

cleanups.push(initNosotrosAnimations());

if (import.meta.hot) {
  import.meta.hot.dispose(() => cleanups.forEach((cleanup) => cleanup()));
}
