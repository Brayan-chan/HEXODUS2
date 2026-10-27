import { spawnSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { resolve, join } from "node:path";

function run(script) {
  const windows = process.platform === "win32";
  const result = spawnSync(
    windows ? "cmd.exe" : "npm",
    windows ? ["/d", "/s", "/c", `npm run ${script}`] : ["run", script],
    { stdio: "inherit" },
  );
  if (result.status !== 0) throw new Error(`${script} failed`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  run("lint");
  run("format:check");
  run("build");

  const routes = JSON.parse(
    await readFile("src/data/routes.json", "utf8"),
  ).filter((route) => route.published);
  for (const route of routes) {
    const file = resolve(
      "dist",
      route.path === "/" ? "index.html" : `${route.path.slice(1)}index.html`,
    );
    const html = await readFile(file, "utf8");
    const ids = new Set(
      [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]),
    );
    for (const anchor of [...html.matchAll(/\bhref="#([^"]+)"/g)].map(
      (match) => match[1],
    )) {
      assert(ids.has(anchor), `Broken #${anchor} in ${file}`);
    }
    const paths = [
      ...[...html.matchAll(/\b(?:src|href)="(\/[^"]+)"/g)].map(
        (match) => match[1],
      ),
      ...[...html.matchAll(/\bsrcset="(\/[^"]+)"/g)].map((match) => match[1]),
    ];
    for (const path of paths) {
      const pathname = new URL(path, "https://hexodus.local").pathname;
      const targetRoute = routes.find((item) => item.path === pathname);
      const local = targetRoute
        ? resolve(
            "dist",
            pathname === "/" ? "index.html" : `${pathname.slice(1)}index.html`,
          )
        : join(resolve("dist"), decodeURIComponent(pathname));
      await stat(local).catch(() => {
        throw new Error(`Missing asset ${path} in ${file}`);
      });
      if (targetRoute && path.includes("#")) {
        const targetHtml = await readFile(local, "utf8");
        const hash = new URL(path, "https://hexodus.local").hash.slice(1);
        assert(
          targetHtml.includes(`id="${hash}"`),
          `Broken ${path} in ${file}`,
        );
      }
    }
    for (const tag of [
      "<h1",
      'name="description"',
      'rel="canonical"',
      'property="og:title"',
      'name="robots"',
    ]) {
      assert(html.includes(tag), `Missing ${tag} in ${file}`);
    }
    if (route.id === "home") {
      assert(
        html.includes("Visita diaria") &&
          html.includes("¿Cuáles son sus horarios?"),
        `Missing static home content in ${file}`,
      );
      assert(
        !html.includes("Calle Zafiro") && !html.includes("<iframe"),
        `Contact details leaked into home`,
      );
    }
    if (route.id === "contacto") {
      assert(
        html.includes("Calle Zafiro") &&
          html.includes("maps.google.com/maps") &&
          html.includes("981 178 7040"),
        `Contact details missing in ${file}`,
      );
    }
    if (route.id === "galeria") {
      assert(
        html.includes("Instalaciones") || html.includes("Galería"),
        `Gallery content missing in ${file}`,
      );
    }
    assert(
      !html.includes("hexodus-codex") && !html.includes("WordPress"),
      `Internal text leaked in ${file}`,
    );
  }
  assert(routes.length >= 2, "Published routes required");
  run("test");
  console.log("Checks passed");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
