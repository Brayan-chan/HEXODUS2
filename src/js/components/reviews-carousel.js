const TRUNCATE_CHARS = 110; // characters shown before "Ver más" on mobile

export function initReviewsCarousel(root) {
  const track = root.querySelector("[data-reviews-track]");
  const prevBtn = root.querySelector("[data-reviews-prev]");
  const nextBtn = root.querySelector("[data-reviews-next]");
  const currentIndicator = root.querySelector("[data-reviews-current]");
  const totalIndicator = root.querySelector("[data-reviews-total]");
  const dots = [...root.querySelectorAll("[data-reviews-dot]")];
  const cards = [...root.querySelectorAll(".community-card")];

  if (!track || !cards.length) return () => {};

  const listeners = [];
  const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = -1;
  let trackWidth = 0;
  let cardCenters = [];
  let scrollFrame = 0;
  let resizeFrame = 0;

  // ── "Ver más / Ver menos" expand logic ───────────────────────────────────
  cards.forEach((card) => {
    const textEl = card.querySelector(".community-card__quote-text");
    const expandBtn = card.querySelector(".community-card__expand");
    if (!textEl || !expandBtn) return;

    const fullText = textEl.textContent.trim();
    // Only truncate if text exceeds threshold
    if (fullText.length <= TRUNCATE_CHARS) {
      expandBtn.style.display = "none";
      return;
    }

    // Truncate to nearest word boundary
    const truncated =
      fullText.slice(0, TRUNCATE_CHARS).replace(/\s+\S*$/, "") + "…";
    let expanded = false;

    const render = () => {
      textEl.textContent = expanded ? fullText : truncated;
      expandBtn.textContent = expanded ? "Ver menos" : "Ver más";
      expandBtn.setAttribute("aria-expanded", String(expanded));
    };
    render();

    const onExpand = (e) => {
      e.stopPropagation(); // prevent card click (which would scroll)
      expanded = !expanded;
      render();
    };
    expandBtn.addEventListener("click", onExpand);
    listeners.push(() => expandBtn.removeEventListener("click", onExpand));
  });

  // ── Carousel core ─────────────────────────────────────────────────────────
  // Measure once per resize, rather than reading every card on each scroll frame.
  const measureCards = () => {
    trackWidth = track.clientWidth;
    cardCenters = cards.map((card) => card.offsetLeft + card.offsetWidth / 2);
  };

  const getActiveIndex = () => {
    const trackCenter = track.scrollLeft + trackWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    cardCenters.forEach((cardCenter, index) => {
      const distance = Math.abs(trackCenter - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  const updateControlsState = () => {
    const nextIndex = getActiveIndex();
    if (nextIndex === activeIndex) return;
    activeIndex = nextIndex;

    cards.forEach((card, i) => {
      const isActive = i === activeIndex;
      card.classList.toggle("is-active", isActive);
      card.setAttribute("aria-current", isActive ? "true" : "false");
    });

    if (currentIndicator) {
      currentIndicator.textContent = String(activeIndex + 1).padStart(2, "0");
    }
    if (prevBtn) {
      const isStart = activeIndex === 0;
      prevBtn.disabled = isStart;
      prevBtn.setAttribute("aria-disabled", String(isStart));
    }

    if (nextBtn) {
      const isEnd = activeIndex === cards.length - 1;
      nextBtn.disabled = isEnd;
      nextBtn.setAttribute("aria-disabled", String(isEnd));
    }

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  const scrollToCard = (
    index,
    behavior = motionPreference.matches ? "instant" : "smooth",
  ) => {
    const clamped = Math.max(0, Math.min(cards.length - 1, index));
    const targetScroll = cardCenters[clamped] - trackWidth / 2;

    track.scrollTo({
      left: Math.max(0, targetScroll),
      behavior,
    });
  };

  const onPrevClick = () => {
    const activeIndex = getActiveIndex();
    scrollToCard(activeIndex - 1);
  };

  const onNextClick = () => {
    const activeIndex = getActiveIndex();
    scrollToCard(activeIndex + 1);
  };

  if (prevBtn) {
    prevBtn.addEventListener("click", onPrevClick);
    listeners.push(() => prevBtn.removeEventListener("click", onPrevClick));
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", onNextClick);
    listeners.push(() => nextBtn.removeEventListener("click", onNextClick));
  }

  dots.forEach((dot, index) => {
    const onClick = () => scrollToCard(index);
    dot.addEventListener("click", onClick);
    listeners.push(() => dot.removeEventListener("click", onClick));
  });

  cards.forEach((card, index) => {
    const onCardClick = () => {
      if (getActiveIndex() !== index) {
        scrollToCard(index);
      }
    };
    card.addEventListener("click", onCardClick);
    listeners.push(() => card.removeEventListener("click", onCardClick));
  });

  const onKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onPrevClick();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      onNextClick();
    }
  };
  track.addEventListener("keydown", onKeyDown);
  listeners.push(() => track.removeEventListener("keydown", onKeyDown));

  const onScroll = () => {
    if (!scrollFrame) {
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        if (!resizeFrame) updateControlsState();
      });
    }
  };
  track.addEventListener("scroll", onScroll, { passive: true });
  listeners.push(() => track.removeEventListener("scroll", onScroll));

  const onResize = () => {
    if (resizeFrame || track.clientWidth === trackWidth) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      measureCards();
      scrollToCard(activeIndex, "instant");
      updateControlsState();
    });
  };
  window.addEventListener("resize", onResize, { passive: true });
  listeners.push(() => window.removeEventListener("resize", onResize));
  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(track);

  // ── Start on card index 2 (3rd card — Rodrigo E. Castillo) ───────────────
  // Position and highlight together before the next paint to avoid a loading flash.
  const START_INDEX = Math.min(2, cards.length - 1);
  if (totalIndicator) {
    totalIndicator.textContent = String(cards.length).padStart(2, "0");
  }
  measureCards();
  scrollToCard(START_INDEX, "instant");
  updateControlsState();

  return () => {
    resizeObserver.disconnect();
    cancelAnimationFrame(scrollFrame);
    cancelAnimationFrame(resizeFrame);
    listeners.forEach((remove) => remove());
  };
}
