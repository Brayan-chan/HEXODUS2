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
  const getActiveIndex = () => {
    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(trackCenter - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  const updateControlsState = () => {
    const activeIndex = getActiveIndex();

    cards.forEach((card, i) => {
      const isActive = i === activeIndex;
      card.classList.toggle("is-active", isActive);
      card.setAttribute("aria-current", isActive ? "true" : "false");
    });

    if (currentIndicator) {
      currentIndicator.textContent = String(activeIndex + 1).padStart(2, "0");
    }
    if (totalIndicator) {
      totalIndicator.textContent = String(cards.length).padStart(2, "0");
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

  const scrollToCard = (index, behavior = "smooth") => {
    const clamped = Math.max(0, Math.min(cards.length - 1, index));
    const targetCard = cards[clamped];
    if (!targetCard) return;

    const targetScroll =
      targetCard.offsetLeft - (track.clientWidth - targetCard.offsetWidth) / 2;

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

  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateControlsState();
        ticking = false;
      });
      ticking = true;
    }
  };
  track.addEventListener("scroll", onScroll, { passive: true });
  listeners.push(() => track.removeEventListener("scroll", onScroll));

  const onResize = () => updateControlsState();
  window.addEventListener("resize", onResize, { passive: true });
  listeners.push(() => window.removeEventListener("resize", onResize));

  // ── Start on card index 2 (3rd card — Rodrigo E. Castillo) ───────────────
  // Use "instant" scroll so there's no animation flash on first load.
  // Falls back gracefully if fewer than 3 cards exist.
  const START_INDEX = Math.min(2, cards.length - 1);
  if (START_INDEX > 0) {
    // Wait one frame so layout is ready, then jump without animation
    requestAnimationFrame(() => {
      scrollToCard(START_INDEX, "instant");
      // Update controls state after the instant jump
      requestAnimationFrame(updateControlsState);
    });
  } else {
    updateControlsState();
  }

  return () => {
    listeners.forEach((remove) => remove());
  };
}
