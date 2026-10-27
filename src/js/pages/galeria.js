import { initShared } from "../main.js";
import { initActiveNavigation } from "../components/active-navigation.js";
import { initExistingEffects } from "../animations/existing-effects.js";

const root = document;
const cleanups = [
  initShared(root),
  initActiveNavigation(root),
  initExistingEffects(root),
];

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
      const match = filter === "all" || item.dataset.category === filter;
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

// 2. Visor Lightbox a pantalla completa
function initGalleryLightbox() {
  const lightbox = root.getElementById("gallery-lightbox");
  if (!lightbox) return () => {};

  const img = lightbox.querySelector("[data-lightbox-img]");
  const counter = lightbox.querySelector("[data-lightbox-counter]");
  const closeBtns = lightbox.querySelectorAll("[data-lightbox-close]");
  const prevBtn = lightbox.querySelector("[data-lightbox-prev]");
  const nextBtn = lightbox.querySelector("[data-lightbox-next]");
  const items = [...root.querySelectorAll(".masonry-item")];

  let currentIndex = -1;

  function getVisibleItems() {
    return items.filter((item) => !item.classList.contains("is-hidden"));
  }

  function showImage(index) {
    const visible = getVisibleItems();
    if (!visible.length) return;
    currentIndex = (index + visible.length) % visible.length;
    const currentItem = visible[currentIndex];
    const imageEl = currentItem.querySelector("img");
    if (!imageEl) return;

    img.src = imageEl.src;
    img.alt = imageEl.alt;
    if (counter) {
      counter.textContent = `Foto ${currentIndex + 1} de ${visible.length}`;
    }
  }

  function openLightbox(item) {
    const visible = getVisibleItems();
    const index = visible.indexOf(item);
    if (index === -1) return;
    showImage(index);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  const onItemClick = (event) => {
    const item = event.currentTarget;
    openLightbox(item);
  };

  const onItemKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox(event.currentTarget);
    }
  };

  items.forEach((item) => {
    item.addEventListener("click", onItemClick);
    item.addEventListener("keydown", onItemKeyDown);
  });

  closeBtns.forEach((btn) => btn.addEventListener("click", closeLightbox));

  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showImage(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showImage(currentIndex + 1);
    });
  }

  const onKeyDown = (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    else if (event.key === "ArrowLeft") showImage(currentIndex - 1);
    else if (event.key === "ArrowRight") showImage(currentIndex + 1);
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

cleanups.push(initGalleryFilters());
cleanups.push(initGalleryLightbox());

if (import.meta.hot) {
  import.meta.hot.dispose(() => cleanups.forEach((cleanup) => cleanup()));
}
