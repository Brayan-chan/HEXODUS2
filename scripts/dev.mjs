import chokidar from "chokidar";
import { createServer } from "vite";
import { render } from "./render.mjs";

await render();
const server = await createServer({
  configFile: "vite.config.js",
  server: { host: "127.0.0.1" },
});
await server.listen();
server.printUrls();

let timer;
const watcher = chokidar.watch("src", {
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 150,
    pollInterval: 50,
  },
});

watcher.on("error", (error) => {
  console.warn("Watcher warning:", error.message);
});

watcher.on("all", () => {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    try {
      await render({ clean: false });
      server.ws.send({ type: "full-reload" });
    } catch (error) {
      console.error("Render failed:", error);
    }
  }, 100);
});
const close = async () => {
  clearTimeout(timer);
  await watcher.close();
  await server.close();
};
process.once("SIGINT", async () => {
  await close();
  process.exit();
});
process.once("SIGTERM", async () => {
  await close();
  process.exit();
});
