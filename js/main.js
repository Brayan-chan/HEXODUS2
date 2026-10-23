const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const header = document.querySelector("[data-header]");
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");

const closeMenu = () => {
  menu?.classList.remove("is-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
};

menuToggle?.addEventListener("click", () => {
  const open = !menu?.classList.contains("is-open");
  menu?.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
});
document
  .querySelectorAll("[data-menu] a")
  .forEach((link) => link.addEventListener("click", closeMenu));

let headerIsCompact = window.scrollY > 112;
let headerFrame = 0;

const updateHeader = () => {
  headerFrame = 0;
  const scrollTop = window.scrollY;

  // Distintos umbrales de entrada y salida evitan que el header oscile
  // cuando cambia de altura cerca de la parte superior de la página.
  if (!headerIsCompact && scrollTop > 112) headerIsCompact = true;
  if (headerIsCompact && scrollTop < 32) headerIsCompact = false;

  header?.classList.toggle("is-scrolled", headerIsCompact);
};

const requestHeaderUpdate = () => {
  if (!headerFrame) headerFrame = requestAnimationFrame(updateHeader);
};

updateHeader();
window.addEventListener("scroll", requestHeaderUpdate, { passive: true });

if (!reduceMotion) {
  requestAnimationFrame(() => document.body.classList.add("is-ready"));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: "0px 0px -4% 0px" },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((item) => observer.observe(item));

  const parallaxItems = [...document.querySelectorAll("[data-parallax]")];
  let ticking = false;
  const parallax = () => {
    parallaxItems.forEach((item) => {
      const rect = item.parentElement.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight) {
        const amount = Number(item.dataset.parallax || 20);
        const progress =
          (rect.top + rect.height / 2 - innerHeight / 2) / innerHeight;
        item.style.transform = `translate3d(0, ${(-progress * amount).toFixed(2)}px, 0) scale(1.06)`;
      }
    });
    ticking = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(parallax);
        ticking = true;
      }
    },
    { passive: true },
  );
  parallax();
} else {
  document.body.classList.add("is-ready");
  document
    .querySelectorAll(".reveal")
    .forEach((item) => item.classList.add("is-in"));
}

document.querySelectorAll(".faq-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const willOpen = !item.classList.contains("is-open");
    document.querySelectorAll(".faq-item").forEach((other) => {
      other.classList.remove("is-open");
      other.querySelector("button").setAttribute("aria-expanded", "false");
      other.querySelector("button b").textContent = "+";
    });
    if (willOpen) {
      item.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
      button.querySelector("b").textContent = "−";
    }
  });
});

const trackedSections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".desktop-nav a")];
const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) =>
        link.classList.toggle("is-active", link.hash === `#${entry.target.id}`),
      );
    });
  },
  { rootMargin: "-35% 0px -58% 0px" },
);
trackedSections.forEach((section) => navObserver.observe(section));

if (!reduceMotion && matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.querySelectorAll(".button").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      button.style.setProperty(
        "--mx",
        `${(event.clientX - rect.left - rect.width / 2) * 0.08}px`,
      );
      button.style.setProperty(
        "--my",
        `${(event.clientY - rect.top - rect.height / 2) * 0.12}px`,
      );
    });
    button.addEventListener("pointerleave", () => {
      button.style.setProperty("--mx", "0px");
      button.style.setProperty("--my", "0px");
    });
  });
}

const privacyDialog = document.querySelector("[data-privacy-dialog]");
document
  .querySelector("[data-privacy-open]")
  ?.addEventListener("click", () => privacyDialog?.showModal());
document
  .querySelectorAll("[data-privacy-close]")
  .forEach((button) =>
    button.addEventListener("click", () => privacyDialog?.close()),
  );
privacyDialog?.addEventListener("click", (event) => {
  if (event.target === privacyDialog) privacyDialog.close();
});

const facilityGallery = document.querySelector("[data-facility-gallery]");
if (facilityGallery) {
  const stage = facilityGallery.querySelector(".facility-stage");
  const stageImage = facilityGallery.querySelector("[data-gallery-image]");
  const mobileSource = facilityGallery.querySelector("picture source");
  const caption = facilityGallery.querySelector("[data-gallery-caption]");
  const count = facilityGallery.querySelector("[data-gallery-count]");
  const thumbs = [...facilityGallery.querySelectorAll(".facility-thumb")];
  let requestId = 0;

  const selectImage = async (button) => {
    if (button.classList.contains("is-active")) return;
    const currentRequest = ++requestId;
    const mobile = matchMedia("(max-width: 600px)").matches;
    const source = mobile ? button.dataset.mobile : button.dataset.desktop;
    const preload = new Image();

    stage.classList.add("is-changing");
    preload.src = source;
    try {
      if (preload.decode) await preload.decode();
    } catch (_) {
      await new Promise((resolve) => {
        preload.onload = preload.onerror = resolve;
      });
    }
    if (currentRequest !== requestId) return;

    stageImage.src = button.dataset.desktop;
    stageImage.alt = button.dataset.alt;
    mobileSource.srcset = button.dataset.mobile;
    caption.textContent = button.dataset.caption;
    count.textContent = button.dataset.count;
    thumbs.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    requestAnimationFrame(() => stage.classList.remove("is-changing"));
  };

  thumbs.forEach((button, index) => {
    button.addEventListener("click", () => selectImage(button));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const next = thumbs[(index + direction + thumbs.length) % thumbs.length];
      next.focus();
      selectImage(next);
    });
  });
}

const membershipCards = [...document.querySelectorAll(".plans .plan")];
if (membershipCards.length) {
  const mobileCards = matchMedia("(max-width: 900px)");
  let cardFrame = 0;

  const highlightClosestCard = () => {
    cardFrame = 0;
    if (!mobileCards.matches) {
      membershipCards.forEach((card) =>
        card.classList.remove("is-scroll-active"),
      );
      return;
    }

    const viewportCenter = innerHeight * 0.52;
    let closestCard = null;
    let closestDistance = Infinity;

    membershipCards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
      const visible =
        rect.bottom > innerHeight * 0.12 && rect.top < innerHeight * 0.88;
      if (visible && distance < closestDistance) {
        closestDistance = distance;
        closestCard = card;
      }
    });

    membershipCards.forEach((card) =>
      card.classList.toggle("is-scroll-active", card === closestCard),
    );
  };

  const requestCardHighlight = () => {
    if (!cardFrame) cardFrame = requestAnimationFrame(highlightClosestCard);
  };

  highlightClosestCard();
  window.addEventListener("scroll", requestCardHighlight, { passive: true });
  window.addEventListener("resize", requestCardHighlight);
  mobileCards.addEventListener?.("change", requestCardHighlight);
}

const benefitsTrack = document.querySelector(".benefits__track");
if (benefitsTrack && !reduceMotion) {
  const carouselAnimation = benefitsTrack.getAnimations()[0];

  if (carouselAnimation) {
    let previousScrollY = window.scrollY;
    let currentRate = 1;
    let targetRate = 1;
    let carouselFrame = 0;

    const settleCarousel = () => {
      currentRate += (targetRate - currentRate) * 0.18;
      targetRate += (1 - targetRate) * 0.075;
      carouselAnimation.updatePlaybackRate(currentRate);

      if (Math.abs(currentRate - 1) < 0.01 && Math.abs(targetRate - 1) < 0.01) {
        carouselAnimation.updatePlaybackRate(1);
        carouselFrame = 0;
        return;
      }

      carouselFrame = requestAnimationFrame(settleCarousel);
    };

    const reactCarouselToScroll = () => {
      const scrollY = window.scrollY;
      const delta = scrollY - previousScrollY;
      previousScrollY = scrollY;

      if (Math.abs(delta) < 1) return;

      const impulse = Math.min(Math.abs(delta) / 18, 1.6);
      targetRate = delta > 0 ? 1.15 + impulse : -(0.35 + impulse);

      if (!carouselFrame) carouselFrame = requestAnimationFrame(settleCarousel);
    };

    window.addEventListener("scroll", reactCarouselToScroll, { passive: true });
  }
}
