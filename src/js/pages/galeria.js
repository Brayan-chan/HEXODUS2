import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initShared } from "../main.js";
import { initExistingEffects } from "../animations/existing-effects.js";

const root = document;
const cleanups = [initShared(root), initExistingEffects(root)];

// 1. Filtrado de Galería estilo Pinterest
function initGalleryFilters() {
  const filters = root.querySelectorAll(".gallery-filter");
  const items = [...root.querySelectorAll(".masonry-item")];
  if (!filters.length || !items.length) return () => {};

  const onFilterClick = (event) => {
    const button = event.currentTarget;
    const filter = button.dataset.filter;

    filters.forEach((btn) => {
      const isActive = btn === button;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    items.forEach((item) => {
      const itemCategory = (item.dataset.category || "").toLowerCase();
      const match =
        filter === "all" ||
        itemCategory === filter.toLowerCase() ||
        (filter === "fest" &&
          (itemCategory === "fest" || itemCategory.includes("fest"))) ||
        (filter === "video" && item.dataset.type !== "image");
      if (match) {
        item.classList.remove("is-hidden");
        item.style.opacity = "1";
        item.style.transform = "scale(1)";
      } else {
        item.classList.add("is-hidden");
        item.style.opacity = "0";
        item.style.transform = "scale(0.96)";
      }
    });
  };

  filters.forEach((btn) => btn.addEventListener("click", onFilterClick));
  return () => {
    filters.forEach((btn) => btn.removeEventListener("click", onFilterClick));
  };
}

// 2. Visor Lightbox a pantalla completa (Fotos y Videos)
function initGalleryLightbox() {
  const lightbox = root.getElementById("gallery-lightbox");
  if (!lightbox) return () => {};

  const img = lightbox.querySelector("[data-lightbox-img]");
  const video = lightbox.querySelector("[data-lightbox-video]");
  const embed = lightbox.querySelector("[data-lightbox-embed]");
  const counter = lightbox.querySelector("[data-lightbox-counter]");
  const closeBtns = lightbox.querySelectorAll("[data-lightbox-close]");
  const prevBtn = lightbox.querySelector("[data-lightbox-prev]");
  const nextBtn = lightbox.querySelector("[data-lightbox-next]");
  const items = [...root.querySelectorAll(".masonry-item")];

  let currentIndex = -1;
  let lastTrigger = null;

  const focusDialog = () => {
    lightbox.querySelector("button[data-lightbox-close]")?.focus({
      preventScroll: true,
    });
  };

  const restoreFocus = () => {
    lastTrigger?.focus({ preventScroll: true });
    lastTrigger = null;
  };

  // Opening a video is intentional, but sound stays opt-in. If the visitor
  // enables it, use a clear listening level instead of an inaudible 10%.
  if (video) {
    video.muted = true;
    video.volume = 0.75;
  }

  let isTransitioning = false;

  function getActiveLightboxMedia() {
    if (video && video.style.display !== "none") return video;
    if (img && img.style.display !== "none") return img;
    return null;
  }

  function getThumbnailMedia(item) {
    if (!item) return null;
    return (
      item.querySelector("img, video") ||
      item.querySelector(".masonry-card") ||
      item
    );
  }

  function getVisibleItems() {
    return items.filter((item) => !item.classList.contains("is-hidden"));
  }

  function showImage(index) {
    const visible = getVisibleItems();
    if (!visible.length) return;
    currentIndex = (index + visible.length) % visible.length;
    const currentItem = visible[currentIndex];
    const imageEl = currentItem.querySelector("img");
    const type = currentItem.dataset.type || "image";

    // Pausar y resetear reproductor de video previo
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.removeAttribute("poster");
      video.classList.remove("is-horizontal");
      video.style.display = "none";
    }
    if (embed) {
      embed.innerHTML = "";
      embed.style.display = "none";
    }
    if (img) img.style.display = "none";

    if (type === "video") {
      let videoSrc = currentItem.dataset.videoSrc;
      if (videoSrc && videoSrc.endsWith(".mov")) {
        videoSrc = videoSrc.replace(/\.mov$/, ".mp4");
      }
      if (video && videoSrc) {
        const preview = currentItem.querySelector("video");
        const poster = preview?.getAttribute("poster");
        if (poster) video.poster = poster;
        video.src = videoSrc;
        video.style.display = "block";
        video.muted = true;
        video.volume = 0.75;
        video.onloadedmetadata = () => {
          const isHoriz = video.videoWidth > video.videoHeight;
          video.classList.toggle("is-horizontal", isHoriz);
        };
        video.play().catch(() => {});
      }
    } else if (type === "youtube") {
      const ytId = currentItem.dataset.youtubeId;
      if (embed && ytId) {
        embed.innerHTML = `<iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        embed.style.display = "block";
      }
    } else if (imageEl && img) {
      img.src = imageEl.currentSrc || imageEl.src;
      img.alt = imageEl.alt;
      img.style.display = "block";
    }

    if (counter) {
      const label = type === "image" ? "Foto" : "Video";
      counter.textContent = `${label} ${currentIndex + 1} de ${visible.length}`;
    }
  }

  async function openLightbox(item) {
    if (isTransitioning) return;
    const visible = getVisibleItems();
    const index = visible.indexOf(item);
    if (index === -1) return;
    lastTrigger = item;

    const prefersReducedMotion = matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const canUseViewTransition =
      typeof document.startViewTransition === "function" &&
      !prefersReducedMotion;

    if (!canUseViewTransition) {
      showImage(index);
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      focusDialog();
      return;
    }

    const thumbMedia = getThumbnailMedia(item);

    isTransitioning = true;
    document.documentElement.classList.add(
      "is-gallery-transition",
      "is-gallery-open",
    );

    // Pre-decodificar la imagen antes de iniciar la transición para snapshot inmediato sin flash
    const imageEl = item.querySelector("img");
    const type = item.dataset.type || "image";
    if (type === "image" && imageEl && img) {
      img.src = imageEl.currentSrc || imageEl.src;
      img.alt = imageEl.alt;
      try {
        await img.decode();
      } catch {
        // Fallback seguro si la imagen ya estaba en caché
      }
    }

    if (thumbMedia)
      thumbMedia.style.viewTransitionName = "gallery-active-media";

    try {
      const transition = document.startViewTransition(async () => {
        if (thumbMedia) thumbMedia.style.viewTransitionName = "";
        showImage(index);

        const activeMedia = getActiveLightboxMedia();
        if (activeMedia)
          activeMedia.style.viewTransitionName = "gallery-active-media";

        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      });

      await transition.finished;
    } catch {
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    } finally {
      await new Promise((r) => requestAnimationFrame(r));
      const activeMedia = getActiveLightboxMedia();
      if (activeMedia) activeMedia.style.viewTransitionName = "";
      if (thumbMedia) thumbMedia.style.viewTransitionName = "";
      document.documentElement.classList.remove(
        "is-gallery-transition",
        "is-gallery-open",
      );
      focusDialog();
      isTransitioning = false;
    }
  }

  async function closeLightbox() {
    if (isTransitioning || !lightbox.classList.contains("is-open")) return;

    const prefersReducedMotion = matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const canUseViewTransition =
      typeof document.startViewTransition === "function" &&
      !prefersReducedMotion;

    if (!canUseViewTransition) {
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.classList.remove("is-horizontal");
      }
      if (embed) embed.innerHTML = "";
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      restoreFocus();
      return;
    }

    const visible = getVisibleItems();
    const currentItem = visible[currentIndex];
    const thumbMedia = getThumbnailMedia(currentItem);
    const activeMedia = getActiveLightboxMedia();

    // Si la tarjeta original está fuera de vista, alinearla suavemente para el aterrizaje
    if (thumbMedia) {
      const rect = thumbMedia.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        thumbMedia.scrollIntoView({ block: "center", behavior: "instant" });
      }
    }

    isTransitioning = true;
    document.documentElement.classList.add(
      "is-gallery-transition",
      "is-gallery-close",
    );

    if (activeMedia)
      activeMedia.style.viewTransitionName = "gallery-active-media";

    try {
      const transition = document.startViewTransition(async () => {
        if (activeMedia) activeMedia.style.viewTransitionName = "";
        if (thumbMedia)
          thumbMedia.style.viewTransitionName = "gallery-active-media";

        if (video) video.pause();
        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      });

      await transition.finished;
    } catch {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    } finally {
      await new Promise((r) => requestAnimationFrame(r));
      if (thumbMedia) thumbMedia.style.viewTransitionName = "";
      if (activeMedia) activeMedia.style.viewTransitionName = "";
      if (video) {
        video.removeAttribute("src");
        video.classList.remove("is-horizontal");
      }
      if (embed) embed.innerHTML = "";
      document.documentElement.classList.remove(
        "is-gallery-transition",
        "is-gallery-close",
      );
      restoreFocus();
      isTransitioning = false;
    }
  }

  async function navigateLightbox(newIndex) {
    if (isTransitioning) return;
    const visible = getVisibleItems();
    if (!visible.length) return;

    const nextIndexNormalized = (newIndex + visible.length) % visible.length;
    const nextItem = visible[nextIndexNormalized];
    const nextImageEl = nextItem?.querySelector("img");
    if (nextImageEl) {
      const preImg = new Image();
      preImg.src = nextImageEl.currentSrc || nextImageEl.src;
      try {
        await preImg.decode();
      } catch {
        // The visible image still provides the browser's normal fallback.
      }
    }

    const prefersReducedMotion = matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) {
      showImage(nextIndexNormalized);
      return;
    }

    isTransitioning = true;
    const figure = lightbox.querySelector(".lightbox-figure");
    const waitForFade = () =>
      new Promise((resolve) => {
        if (!figure) {
          resolve();
          return;
        }
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          figure.removeEventListener("transitionend", onTransitionEnd);
          clearTimeout(timeout);
          resolve();
        };
        const onTransitionEnd = (event) => {
          if (event.target === figure && event.propertyName === "opacity") {
            finish();
          }
        };
        const timeout = setTimeout(finish, 240);
        figure.addEventListener("transitionend", onTransitionEnd);
      });

    try {
      figure?.classList.add("is-switching");
      await waitForFade();
      showImage(nextIndexNormalized);
      await new Promise((resolve) => requestAnimationFrame(resolve));
      figure?.classList.remove("is-switching");
      await waitForFade();
    } finally {
      figure?.classList.remove("is-switching");
      isTransitioning = false;
    }
  }

  const onItemClick = (event) => {
    const item = event.currentTarget;
    if (
      document.activeElement &&
      typeof document.activeElement.blur === "function"
    ) {
      document.activeElement.blur();
    }
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
    openLightbox(item);
  };

  const onItemKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox(event.currentTarget);
    }
  };

  items.forEach((item) => {
    item.addEventListener("dragstart", (e) => e.preventDefault());
    item.addEventListener("click", onItemClick);
    item.addEventListener("keydown", onItemKeyDown);
  });

  if (lightbox) {
    lightbox.addEventListener("dragstart", (e) => e.preventDefault());
  }

  closeBtns.forEach((btn) => btn.addEventListener("click", closeLightbox));

  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      navigateLightbox(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      navigateLightbox(currentIndex + 1);
    });
  }

  const onKeyDown = (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Tab") {
      const controls = [
        ...lightbox.querySelectorAll("button, video[controls]"),
      ].filter((element) => element.getClientRects().length > 0);
      if (!controls.length) return;
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    } else if (event.key === "Escape") closeLightbox();
    else if (event.key === "ArrowLeft") navigateLightbox(currentIndex - 1);
    else if (event.key === "ArrowRight") navigateLightbox(currentIndex + 1);
  };

  window.addEventListener("keydown", onKeyDown);

  return () => {
    items.forEach((item) => {
      item.removeEventListener("click", onItemClick);
      item.removeEventListener("keydown", onItemKeyDown);
    });
    closeBtns.forEach((btn) => btn.removeEventListener("click", closeLightbox));
    window.removeEventListener("keydown", onKeyDown);
  };
}

// 3. Video previews: load only after deliberate desktop hover. Autoplaying
// large files on scroll wastes bandwidth and battery, especially on mobile.
function initPinterestVideoCards() {
  const videoCards = root.querySelectorAll(".masonry-item.is-video");
  if (!videoCards.length) return () => {};

  const canPreview =
    matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !navigator.connection?.saveData;
  const listeners = [];
  let activeVideo = null;

  const pauseVideo = (video) => {
    if (!video) return;
    video.pause();
    video.closest(".masonry-item")?.classList.remove("is-playing");
  };

  videoCards.forEach((card) => {
    const v = card.querySelector("video");
    if (!v) return;
    v.muted = true;
    v.volume = 0.75;

    const onEnter = () => {
      if (!canPreview) return;
      if (activeVideo && activeVideo !== v) pauseVideo(activeVideo);
      if (!v.src && v.dataset.previewSrc) {
        v.src = v.dataset.previewSrc;
        v.load();
      }
      activeVideo = v;
      v.muted = true;
      v.play()
        .then(() => card.classList.add("is-playing"))
        .catch(() => {});
    };
    const onLeave = () => {
      pauseVideo(v);
      if (activeVideo === v) activeVideo = null;
    };
    card.addEventListener("mouseenter", onEnter);
    card.addEventListener("mouseleave", onLeave);
    listeners.push(() => card.removeEventListener("mouseenter", onEnter));
    listeners.push(() => card.removeEventListener("mouseleave", onLeave));
  });

  const onVisibilityChange = () => {
    if (document.hidden) {
      pauseVideo(activeVideo);
      activeVideo = null;
    }
  };
  document.addEventListener("visibilitychange", onVisibilityChange);

  return () => {
    pauseVideo(activeVideo);
    listeners.forEach((clean) => clean());
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}

cleanups.push(initGalleryFilters());
cleanups.push(initGalleryLightbox());
cleanups.push(initPinterestVideoCards());

// 3. Animaciones GSAP para el Hero de Galería y CTA
function initGalleryAnimations() {
  try {
    gsap.registerPlugin(ScrollTrigger);

    const media = gsap.matchMedia();
    const tweens = [];

    media.add("(prefers-reduced-motion: reduce)", () => {
      document.documentElement.classList.add("hero-ready");
    });

    media.add("(prefers-reduced-motion: no-preference)", () => {
      // Hero Entrance Timeline
      const hero = root.querySelector(".gallery-hero");
      if (hero) {
        const badge = hero.querySelector(".gallery-hero__badge");
        const lines = hero.querySelectorAll(".gallery-hero__title-line");
        const subtitle = hero.querySelector(".gallery-hero__subtitle");
        const lateral = hero.querySelector(".gallery-hero__lateral");
        const chips = hero.querySelectorAll(".gallery-chip");
        const head = root.querySelector(".gallery-section__head");
        const filters = root.querySelector(".gallery-filters");

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => {
            document.documentElement.classList.add("hero-ready");
          },
        });

        if (badge) {
          tl.fromTo(
            badge,
            { y: -18, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6 },
            0.1,
          );
        }
        if (lines.length) {
          tl.fromTo(
            lines,
            { y: 0, yPercent: 110 },
            { y: 0, yPercent: 0, duration: 0.85, stagger: 0.14 },
            0.2,
          );
        }
        if (subtitle) {
          tl.fromTo(
            subtitle,
            { y: 22, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7 },
            0.45,
          );
        }
        if (lateral) {
          tl.fromTo(
            lateral,
            { y: 18, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.65 },
            0.6,
          );
        }
        if (chips.length) {
          tl.fromTo(
            chips,
            { y: 16, opacity: 0, scale: 0.94 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.5,
              stagger: 0.08,
              ease: "back.out(1.4)",
            },
            0.7,
          );
        }
        if (head) {
          tl.fromTo(
            head,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6 },
            0.75,
          );
        }
        if (filters) {
          tl.fromTo(
            filters,
            { y: 18, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6 },
            0.8,
          );
        }
        tweens.push(tl);
      }

      // Masonry Items Entrance
      const masonryGrid = root.querySelector(".masonry-grid");
      const masonryItems = root.querySelectorAll(
        ".masonry-item:not(.is-hidden)",
      );
      if (masonryGrid && masonryItems.length) {
        const initialBatch = Array.from(masonryItems).slice(0, 10);
        tweens.push(
          gsap.from(initialBatch, {
            scrollTrigger: {
              trigger: masonryGrid,
              start: "top 85%",
              once: true,
            },
            y: 28,
            opacity: 0,
            duration: 0.7,
            stagger: 0.05,
            ease: "power3.out",
            clearProps: "transform,opacity",
          }),
        );
      }

      // CTA ScrollTrigger Entrance
      const ctaContent = root.querySelector(".gallery-cta__content");
      if (ctaContent) {
        const eyebrow = ctaContent.querySelector(".gallery-cta__eyebrow");
        const title = ctaContent.querySelector(".gallery-cta__title");
        const copy = ctaContent.querySelector(".gallery-cta__copy");
        const actions = ctaContent.querySelector(".gallery-cta__actions");

        const ctaTl = gsap.timeline({
          scrollTrigger: {
            trigger: ctaContent,
            start: "top 85%",
            once: true,
          },
          defaults: { ease: "power3.out" },
        });

        if (eyebrow) {
          ctaTl.fromTo(
            eyebrow,
            { y: 15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5 },
            0,
          );
        }
        if (title) {
          ctaTl.fromTo(
            title,
            { y: 25, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7 },
            0.15,
          );
        }
        if (copy) {
          ctaTl.fromTo(
            copy,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6 },
            0.3,
          );
        }
        if (actions) {
          ctaTl.fromTo(
            actions,
            { y: 18, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.55 },
            0.45,
          );
        }
        tweens.push(ctaTl);
      }
    });

    return () => {
      media.revert();
      tweens.forEach((t) => t.kill());
    };
  } catch {
    return () => {};
  }
}

cleanups.push(initGalleryAnimations());

if (import.meta.hot) {
  import.meta.hot.dispose(() => cleanups.forEach((cleanup) => cleanup()));
}
