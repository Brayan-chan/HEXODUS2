import { chromium } from "playwright";
import { preview } from "vite";

const server = await preview({
  configFile: "vite.config.js",
  preview: { host: "127.0.0.1", port: 0, strictPort: false },
});
const browser = await chromium.launch();
const url = server.resolvedUrls.local[0];

try {
  for (const [name, viewport, javaScriptEnabled, path] of [
    ["desktop", { width: 1440, height: 900 }, true, ""],
    ["mobile", { width: 390, height: 844 }, true, ""],
    ["mobile-no-js", { width: 390, height: 844 }, false, ""],
    ["contact-desktop", { width: 1440, height: 900 }, true, "contacto/"],
    ["contact-mobile", { width: 390, height: 844 }, true, "contacto/"],
  ]) {
    const page = await browser.newPage({
      viewport,
      deviceScaleFactor: 1,
      javaScriptEnabled,
    });
    await page.goto(new URL(path, url).href, { waitUntil: "domcontentloaded" });
    for (
      let y = 0;
      y < (await page.evaluate(() => document.body.scrollHeight));
      y += viewport.height * 0.8
    ) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(60);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);
    await page.screenshot({
      path: `docs/baseline/${path ? name : `home-${name}`}-after.png`,
      fullPage: true,
    });
    console.log(`Captured ${name}`);
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
