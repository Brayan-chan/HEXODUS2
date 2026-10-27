import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { defineConfig } from "vite";

const routes = JSON.parse(
  readFileSync(resolve("src/data/routes.json"), "utf8"),
);
const generated = resolve(".generated");
const input = Object.fromEntries(
  routes
    .filter((route) => route.published)
    .map((route) => [
      route.id,
      join(
        generated,
        route.path === "/" ? "index.html" : `${route.path.slice(1)}index.html`,
      ),
    ]),
);

export default defineConfig({
  root: generated,
  publicDir: resolve("public"),
  build: {
    outDir: resolve("dist"),
    emptyOutDir: true,
    rolldownOptions: { input },
  },
});
