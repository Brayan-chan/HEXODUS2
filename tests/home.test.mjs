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
