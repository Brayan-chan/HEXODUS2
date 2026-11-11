import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createServer, preview } from "vite";

let browser;
let server;
let url;

before(async () => {
  server = await preview({
    configFile: "vite.config.js",
    preview: { host: "127.0.0.1", port: 0, strictPort: false },
  });
  url = server.resolvedUrls.local[0];
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  await server?.httpServer.close();
});

test("HTML works without JavaScript on mobile", async () => {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    javaScriptEnabled: false,
  });
  await page.goto(url);
  assert.equal(await page.locator("h1").isVisible(), true);
  assert.equal(await page.locator(".experience h2").isVisible(), true);
  assert.equal(await page.locator("[data-menu] a").first().isVisible(), true);
  assert.equal(await page.locator(".plan").count(), 3);
  assert.equal(await page.locator(".faq-item").count(), 5);
  await page.locator(".faq-item").nth(1).locator("summary").click();
  assert.equal(await page.locator(".faq-item").nth(1).getAttribute("open"), "");
  await page.close();
});

test("mobile promotion strip is an infinite marquee, not manual scrolling", async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(url);
  const promo = page.locator(".promo");
  const track = page.locator(".promo__track");
  assert.equal(await page.locator(".promo__group").count(), 2);
  assert.equal(
    await track.evaluate((element) => getComputedStyle(element).animationName),
    "promo-marquee",
  );
  assert.equal(
    await promo.evaluate((element) => getComputedStyle(element).overflowX),
    "hidden",
  );
  await page.close();
});

test("navigation keeps a dark canvas while swapping documents", async () => {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.addInitScript(() => {
    addEventListener("pageswap", (event) => {
      sessionStorage.setItem(
        "usedViewTransition",
        String(!!event.viewTransition),
      );
    });
  });
  await page.goto(url);
  await page.locator('.desktop-nav a[href="/nosotros/"]').click();
  await page.waitForURL("**/nosotros/");
  const state = await page.evaluate(() => ({
    html: getComputedStyle(document.documentElement).backgroundColor,
    body: getComputedStyle(document.body).backgroundColor,
    main: getComputedStyle(document.querySelector("main")).backgroundColor,
    usedViewTransition: sessionStorage.getItem("usedViewTransition"),
  }));
  assert.equal(state.html, "rgb(8, 10, 15)");
  assert.equal(state.body, "rgb(8, 10, 15)");
  assert.equal(state.main, "rgb(255, 255, 255)");
  assert.equal(state.usedViewTransition, "true");
  await page.close();
});

test("hero titles use the local font and finish their entrance without Google Fonts", async () => {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  const routes = [
    ["", ".hero-line b"],
    ["membresias/", ".memberships-hero__line b"],
    ["nosotros/", ".about-hero__line b"],
    ["contacto/", ".contact-hero__line b"],
    ["galeria/", ".gallery-hero__title-line"],
  ];
  for (const [path, selector] of routes) {
    await page.goto(new URL(path, url).href);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(
      await page.evaluate(() =>
        document.fonts.check('700 16px "Barlow Condensed"'),
      ),
      true,
    );
    await page.waitForTimeout(1400);
    const lines = await page.locator(selector).evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        const parent = element.parentElement.getBoundingClientRect();
        return {
          opacity: Number(getComputedStyle(element).opacity),
          font: getComputedStyle(element).fontFamily,
          visibleHeight:
            Math.min(rect.bottom, parent.bottom) -
            Math.max(rect.top, parent.top),
          height: rect.height,
        };
      }),
    );
    assert.ok(lines.length > 0, `missing title on ${path}`);
    for (const line of lines) {
      assert.match(line.font, /Barlow Condensed/);
      assert.equal(line.opacity, 1, `title hidden on ${path}`);
      assert.ok(
        line.visibleHeight >= line.height * 0.7,
        `title clipped on ${path}`,
      );
    }
  }
  await page.close();
});

test("promotion strip stays below the header and keeps its phase across pages", async () => {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    for (const path of ["", "nosotros/", "membresias/"]) {
      await page.goto(new URL(path, url).href);
      const promo = page.locator(".promo");
      const phaseDifference = await promo
        .locator(".promo__track")
        .evaluate((track) => {
          const progress = track
            .getAnimations()[0]
            .effect.getComputedTiming().progress;
          const actual = progress * 24000;
          const expected = Date.now() % 24000;
          const difference = Math.abs(actual - expected);
          return Math.min(difference, 24000 - difference);
        });
      assert.ok(phaseDifference < 1500, `marquee restarted on ${path}`);
      await page.evaluate(() =>
        window.scrollTo({ top: 500, behavior: "instant" }),
      );
      const positions = await page.evaluate(() => ({
        headerBottom: document
          .querySelector(".site-header")
          .getBoundingClientRect().bottom,
        promoTop: document.querySelector(".promo").getBoundingClientRect().top,
      }));
      assert.equal(positions.promoTop, positions.headerBottom);
    }
    await page.close();
  }
});

test("every hero reveals once without resetting during navigation or slow loading", async () => {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.route(/\.(?:js|woff2)(?:\?.*)?$/, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 250));
      await route.continue();
    });
    await page.addInitScript(() => {
      window.heroFrames = [];
      const sample = () => {
        const lines = [
          ...document.querySelectorAll("h1 b, .gallery-hero__title-line"),
        ];
        if (lines.length) {
          window.heroFrames.push(
            lines.map((line) => {
              const rect = line.getBoundingClientRect();
              const clip = line.parentElement.getBoundingClientRect();
              const range = document.createRange();
              range.selectNodeContents(line);
              return {
                visible: Math.max(
                  0,
                  Math.min(
                    1,
                    (Math.min(rect.bottom, clip.bottom) -
                      Math.max(rect.top, clip.top)) /
                      rect.height,
                  ),
                ),
                textWidth: range.getBoundingClientRect().width,
                fontsReady:
                  document.fonts.check('900 16px "Barlow Condensed"') &&
                  document.fonts.check("400 16px Inter"),
              };
            }),
          );
        }
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    for (const path of [
      "",
      "membresias/",
      "nosotros/",
      "galeria/",
      "contacto/",
    ]) {
      if (!path) await page.goto(url);
      else {
        if (width < 900) await page.locator("[data-menu-toggle]").click();
        const nav = width < 900 ? ".mobile-menu" : ".desktop-nav";
        await page.locator(`${nav} a[href="/${path}"]`).click();
        await page.waitForURL(new URL(path, url).href);
      }
      await page.waitForFunction(() =>
        window.heroFrames?.at(-1)?.every((line) => line.visible > 0.99),
      );
      const frames = await page.evaluate(() => window.heroFrames);
      assert.ok(frames.length > 5, `missing frames: ${width}px ${path}`);
      for (let index = 0; index < frames.at(-1).length; index++) {
        const samples = frames.map((frame) => frame[index]).filter(Boolean);
        assert.ok(
          samples.some((line) => line.visible < 0.05),
          `title appeared before entrance: ${width}px ${path}`,
        );
        assert.ok(
          samples.filter((line) => line.visible > 0.05 && line.visible < 0.95)
            .length >= 3,
          `entrance skipped: ${width}px ${path}`,
        );
        for (let frame = 1; frame < samples.length; frame++) {
          assert.ok(
            samples[frame].visible >= samples[frame - 1].visible - 0.03,
            `title reset during entrance: ${width}px ${path}`,
          );
        }
        const visible = samples.filter((line) => line.visible > 0.1);
        assert.ok(
          visible.every((line) => line.fontsReady),
          `title revealed before fonts: ${width}px ${path}`,
        );
        assert.ok(
          Math.max(...visible.map((line) => line.textWidth)) -
            Math.min(...visible.map((line) => line.textWidth)) <
            1,
          `title changed width: ${width}px ${path}`,
        );
      }
    }
    await page.close();
  }
});

test("membership help button remains readable on hover and keyboard focus", async () => {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.goto(new URL("membresias/", url).href);
  const button = page.locator(".memberships-help-section__btn-outline");
  await button.hover();
  await page.waitForTimeout(350);
  assert.equal(
    await button.evaluate((el) => getComputedStyle(el).color),
    "rgb(8, 10, 15)",
  );
  await page.mouse.move(0, 0);
  await page.keyboard.press("Tab");
  await button.focus();
  await page.waitForTimeout(350);
  assert.equal(
    await button.evaluate((el) => getComputedStyle(el).color),
    "rgb(8, 10, 15)",
  );
  await page.close();
});

test("contact details and map are on their own page", async () => {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    javaScriptEnabled: false,
  });
  await page.route("https://maps.google.com/**", (route) => route.abort());
  await page.goto(url);
  assert.equal(await page.locator(".contact-grid").count(), 0);
  assert.equal((await page.locator("a[href='/contacto/']").count()) > 0, true);
  await page.goto(new URL("contacto/", url).href);
  assert.equal(await page.locator("h1").isVisible(), true);
  assert.equal(
    await page.getByText("Calle Zafiro, Mza. 1, Lote 8.").count(),
    1,
  );
  assert.equal(await page.locator(".contact-page__map-frame").count(), 1);
  assert.equal(
    await page.locator(".contact-page__map-frame").getAttribute("loading"),
    "lazy",
  );
  await page.close();
});

test("full videos use consistent accessible controls and useful audio levels", async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  await page.goto(new URL("nosotros/", url).href);
  const brandVideo = page.locator("#hexodusBrandVideo");
  assert.equal(await brandVideo.getAttribute("controls"), "");
  assert.equal(await page.locator(".about-video-box__controls").count(), 0);
  assert.equal(await brandVideo.evaluate((video) => video.volume), 0.75);

  await page.goto(new URL("galeria/", url).href);
  const previews = page.locator(".masonry-video-preview");
  assert.ok((await previews.count()) > 0);
  assert.equal(
    await previews.evaluateAll((videos) =>
      videos.every(
        (video) => !video.hasAttribute("src") && !!video.dataset.previewSrc,
      ),
    ),
    true,
  );

  const firstVideoCard = page.locator(".masonry-item.is-video").first();
  await firstVideoCard.evaluate((card) => card.click());
  const lightboxVideo = page.locator("[data-lightbox-video]");
  await page.waitForFunction(() =>
    document.querySelector("#gallery-lightbox")?.classList.contains("is-open"),
  );
  assert.equal(await lightboxVideo.getAttribute("controls"), "");
  assert.equal(await lightboxVideo.evaluate((video) => video.volume), 0.75);
  assert.equal(await lightboxVideo.evaluate((video) => video.muted), true);
  await page.waitForFunction(
    () =>
      document.activeElement?.matches("button[data-lightbox-close]") === true,
  );
  assert.equal(
    await page
      .locator("button[data-lightbox-close]")
      .evaluate((button) => button === document.activeElement),
    true,
  );
  await page.keyboard.press("Escape");
  await page.waitForFunction(
    () =>
      !document
        .querySelector("#gallery-lightbox")
        ?.classList.contains("is-open"),
  );
  await page.waitForFunction(
    () => document.activeElement?.matches(".masonry-item.is-video") === true,
  );
  assert.equal(
    await firstVideoCard.evaluate((card) => card === document.activeElement),
    true,
  );
  await page.close();
});

test("gallery navigation swaps decoded media without a document transition flash", async () => {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.addInitScript(() => {
    window.galleryTransitionCalls = 0;
    const original = document.startViewTransition?.bind(document);
    if (original) {
      document.startViewTransition = (callback) => {
        window.galleryTransitionCalls += 1;
        return original(callback);
      };
    }
  });
  await page.goto(new URL("galeria/", url).href);
  await page.locator(".masonry-item").first().click();
  await page.waitForFunction(
    () =>
      document.activeElement?.matches("button[data-lightbox-close]") === true,
  );

  const before = await page.evaluate(() => window.galleryTransitionCalls);
  const counter = page.locator("[data-lightbox-counter]");
  const previousLabel = await counter.textContent();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(
    (label) =>
      document.querySelector("[data-lightbox-counter]")?.textContent !==
        label &&
      !document
        .querySelector(".lightbox-figure")
        ?.classList.contains("is-switching"),
    previousLabel,
  );

  assert.equal(
    await page.evaluate(() => window.galleryTransitionCalls),
    before,
  );
  const activeImage = page.locator("[data-lightbox-img]");
  assert.equal(
    await activeImage.evaluate(
      (image) =>
        image.style.display !== "none" &&
        image.complete &&
        image.naturalWidth > 0,
    ),
    true,
  );
  await page.close();
});

test("mobile gallery exposes usable previous and next controls", async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(new URL("galeria/", url).href);
  await page.locator(".masonry-item").first().click();
  await page.waitForFunction(
    () =>
      document.activeElement?.matches("button[data-lightbox-close]") === true,
  );

  for (const selector of ["[data-lightbox-prev]", "[data-lightbox-next]"]) {
    const control = page.locator(selector);
    assert.equal(await control.isVisible(), true);
    const box = await control.boundingBox();
    assert.ok(box.width >= 44 && box.height >= 44);
    assert.ok(box.x >= 0 && box.x + box.width <= 390);
  }

  const counter = page.locator("[data-lightbox-counter]");
  const previousLabel = await counter.textContent();
  await page.locator("[data-lightbox-next]").click();
  await page.waitForFunction(
    (label) =>
      document.querySelector("[data-lightbox-counter]")?.textContent !==
        label &&
      !document
        .querySelector(".lightbox-figure")
        ?.classList.contains("is-switching"),
    previousLabel,
  );
  assert.notEqual(await counter.textContent(), previousLabel);
  await page.close();
});

test("subpage navigation preserves its active state and deep-links home", async () => {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  await page.goto(new URL("galeria/", url).href);
  const galleryLink = page.locator('.desktop-nav a[href="/galeria/"]');
  assert.equal(await galleryLink.getAttribute("aria-current"), "page");
  assert.equal(
    await galleryLink.evaluate((link) => link.classList.contains("is-active")),
    true,
  );

  await page.locator('.desktop-nav a[href="/#inicio"]').click();
  await page.waitForURL(/\/#inicio$/);
  assert.equal(new URL(page.url()).pathname, "/");
  assert.equal(await page.locator("#inicio").isVisible(), true);
  assert.equal(
    await page
      .locator("#inicio")
      .evaluate((section) => section.getBoundingClientRect().top < innerHeight),
    true,
  );

  await page.goto(new URL("contacto/", url).href);
  assert.equal(
    await page
      .locator('.desktop-nav a[href="/contacto/"]')
      .getAttribute("aria-current"),
    "page",
  );
  await page.close();
});

test("header stays in place across pages, scroll and button interaction", async () => {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const measure = () =>
    page.locator(".site-header").evaluate((header) => {
      const rect = (element) => {
        const { x, y, width, height } = element.getBoundingClientRect();
        return [x, y, width, height];
      };
      return {
        header: rect(header),
        brand: rect(header.querySelector(".brand")),
        links: [...header.querySelectorAll(".desktop-nav a")].map(rect),
        button: rect(header.querySelector(".header-cta")),
        font: getComputedStyle(header).fontFamily,
        background: getComputedStyle(header).backgroundColor,
      };
    });

  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  const initial = await measure();
  assert.equal(initial.font, "system-ui, sans-serif");
  for (const path of ["membresias/", "nosotros/", "galeria/", "contacto/"]) {
    await page.goto(new URL(path, url).href);
    await page.evaluate(() => document.fonts.ready);
    assert.deepEqual(await measure(), initial, `header moved on ${path}`);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForFunction(() => window.scrollY > 112);
    assert.deepEqual(
      await measure(),
      initial,
      `header moved on scroll: ${path}`,
    );
  }
  await page.locator(".header-cta").hover();
  assert.deepEqual(await measure(), initial, "header moved on button hover");
  await page.close();
});

test("nosotros page renders all editorial sections and has zero overflow", async () => {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  await page.goto(new URL("nosotros/", url).href);
  const nosotrosLink = page.locator('.desktop-nav a[href="/nosotros/"]');
  assert.equal(await nosotrosLink.getAttribute("aria-current"), "page");
  assert.equal(
    await nosotrosLink.evaluate((link) => link.classList.contains("is-active")),
    true,
  );

  assert.equal(await page.locator("h1").isVisible(), true);
  for (const id of [
    "nosotros",
    "entrenar",
    "experiencia",
    "esencia",
    "instalaciones",
    "equipo",
    "servicios",
    "comunidad",
    "empieza",
  ]) {
    assert.equal(
      await page.locator(`#${id}`).count(),
      1,
      `Section #${id} missing`,
    );
  }

  for (const width of [320, 360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      `nosotros overflow at ${width}px`,
    );
  }

  await page.close();
});

test("membresias page renders all plans and passes with zero overflow", async () => {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  await page.goto(new URL("membresias/", url).href);
  const membresiasLink = page.locator('.desktop-nav a[href="/membresias/"]');
  assert.equal(await membresiasLink.getAttribute("aria-current"), "page");
  assert.equal(
    await membresiasLink.evaluate((link) =>
      link.classList.contains("is-active"),
    ),
    true,
  );

  assert.equal(await page.locator("h1").isVisible(), true);
  for (const id of ["inicio-membresias", "planes", "pases", "asesoria"]) {
    assert.equal(
      await page.locator(`#${id}`).count(),
      1,
      `Section #${id} missing`,
    );
  }

  assert.equal(await page.locator(".hexodus-plan-card").count(), 3);
  assert.equal(await page.locator(".hx-b3-flex-card").count(), 3);

  for (const width of [320, 360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      `membresias overflow at ${width}px`,
    );
  }

  await page.close();
});

test("development HTML loads its stylesheet before JavaScript", async () => {
  const dev = await createServer({
    configFile: "vite.config.js",
    server: { host: "127.0.0.1", port: 0, strictPort: false },
  });
  try {
    await dev.listen();
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      javaScriptEnabled: false,
    });
    await page.route("https://fonts.googleapis.com/**", (route) =>
      route.abort(),
    );
    await page.goto(dev.resolvedUrls.local[0], {
      waitUntil: "load",
    });
    assert.equal(
      await page
        .locator(".hero")
        .evaluate((element) => getComputedStyle(element).backgroundColor),
      "rgb(8, 10, 15)",
    );
    assert.equal(await page.locator("h1").isVisible(), true);
    await page.close();
  } finally {
    await dev.close();
  }
});

test("mobile menu supports keyboard and closes safely", async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url);
  await page.waitForFunction(() =>
    document.documentElement.classList.contains("has-js"),
  );
  const toggle = page.locator("[data-menu-toggle]");
  const menu = page.locator("[data-menu]");
  await menu.waitFor({ state: "hidden" });
  assert.equal(await menu.isVisible(), false);
  assert.equal(await menu.getAttribute("inert"), "");
  await toggle.click();
  assert.equal(await toggle.getAttribute("aria-expanded"), "true");
  await menu.waitFor({ state: "visible" });
  assert.equal(await menu.isVisible(), true);
  await page.keyboard.press("Escape");
  assert.equal(await toggle.getAttribute("aria-expanded"), "false");
  assert.equal(await menu.getAttribute("inert"), "");
  assert.equal(
    await toggle.evaluate((element) => element === document.activeElement),
    true,
  );
  assert.deepEqual(errors, []);
  await page.close();
});

test("gallery recovers from a broken image and accepts another selection", async () => {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  await page.goto(url);
  const gallery = page.locator("[data-facility-gallery]");
  const second = gallery.locator(".facility-thumb").nth(1);
  const third = gallery.locator(".facility-thumb").nth(2);
  await second.evaluate((element) => {
    element.dataset.desktop = "/assets/missing.webp";
  });
  await second.click();
  await page.waitForFunction(
    () =>
      !document
        .querySelector(".facility-stage")
        .classList.contains("is-changing"),
  );
  assert.equal(
    await gallery.locator("[data-gallery-caption]").textContent(),
    "Sala principal",
  );
  await third.click();
  await page.waitForFunction(
    () =>
      document.querySelector("[data-gallery-caption]").textContent ===
      "Maquinaria",
  );
  assert.equal(await third.getAttribute("aria-pressed"), "true");
  assert.equal(
    await gallery
      .locator("[data-gallery-image]")
      .evaluate((image) => image.naturalWidth > 0),
    true,
  );
  await page.close();
});

test("reduced motion leaves content visible and stops continuous strips", async () => {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await page.goto(url);
  assert.equal(await page.locator(".experience h2").isVisible(), true);
  assert.equal(
    await page
      .locator(".benefits__track")
      .evaluate((element) => getComputedStyle(element).animationName),
    "none",
  );
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.close();
});

test("representative widths have no document overflow", async () => {
  for (const width of [320, 360, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 800 } });
    await page.goto(url);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      `overflow at ${width}px`,
    );
    await page.close();
  }
});

test("changing motion preference stops existing parallax", async () => {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  await page.goto(url);
  await page.waitForFunction(
    () => document.querySelector("[data-parallax]").style.transform !== "",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(
    () => document.querySelector("[data-parallax]").style.transform === "",
  );
  assert.equal(await page.locator(".experience h2").isVisible(), true);
  await page.close();
});
