import { build } from "vite";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { render } from "./render.mjs";

try {
  const result = await render();
  await build({ configFile: resolve("vite.config.js") });
  const robots = result.production
    ? `User-agent: *\nAllow: /\nSitemap: ${new URL("sitemap.xml", result.origin).href}\n`
    : "User-agent: *\nAllow: /\n";
  await writeFile(resolve("dist/robots.txt"), robots);
  if (result.production) {
    const urls = result.routes
      .map(
        (route) =>
          `  <url><loc>${new URL(route.path, result.origin).href}</loc></url>`,
      )
      .join("\n");
    await writeFile(
      resolve("dist/sitemap.xml"),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    );
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
