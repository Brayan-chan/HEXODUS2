import {
  readFile,
  writeFile,
  mkdir,
  rm,
  cp,
  readdir,
  stat,
} from "node:fs/promises";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import nunjucks from "nunjucks";

const root = resolve(".");
const source = join(root, "src");
const generated = join(root, ".generated");
const dataNames = [
  "site",
  "memberships",
  "promotions",
  "routes",
  "seo",
  "gallery",
];
const readData = async (name) =>
  JSON.parse(await readFile(join(source, "data", `${name}.json`), "utf8"));

async function syncTree(from, to) {
  await mkdir(to, { recursive: true });
  const sourceEntries = await readdir(from, { withFileTypes: true });
  const names = new Set(sourceEntries.map((entry) => entry.name));
  for (const entry of sourceEntries) {
    const input = join(from, entry.name);
    const output = join(to, entry.name);
    if (entry.isDirectory()) {
      await syncTree(input, output);
    } else {
      const content = await readFile(input);
      const previous = await readFile(output).catch(() => null);
      if (!previous?.equals(content)) await writeFile(output, content);
    }
  }
  for (const entry of await readdir(to, { withFileTypes: true })) {
    if (!names.has(entry.name))
      await rm(join(to, entry.name), { recursive: true, force: true });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validate({ site, memberships, promotions, routes, seo }, production) {
  assert(
    Array.isArray(routes) && routes.length > 0,
    "routes.json must contain routes",
  );
  const ids = new Set();
  const paths = new Set();
  for (const route of routes) {
    assert(/^[a-z][a-z-]*$/.test(route.id), `Invalid route ID: ${route.id}`);
    assert(
      /^\/(?:[a-z-]+\/)*$/.test(route.path),
      `Invalid route path: ${route.path}`,
    );
    assert(
      !ids.has(route.id) && !paths.has(route.path),
      `Duplicate route: ${route.id}`,
    );
    assert(
      /^pages\/[a-z-]+\.html$/.test(route.template),
      `Invalid template: ${route.template}`,
    );
    assert(
      /^src\/js\/pages\/[a-z-]+\.js$/.test(route.entry),
      `Invalid script entry: ${route.entry}`,
    );
    assert(
      seo[route.id]?.title &&
        seo[route.id]?.description &&
        seo[route.id]?.image,
      `Missing SEO: ${route.id}`,
    );
    assert(
      seo[route.id].title.includes("{name}") &&
        seo[route.id].description.includes("{name}"),
      `SEO must reference the shared business name: ${route.id}`,
    );
    ids.add(route.id);
    paths.add(route.path);
  }
  const navigationTargets = new Set();
  for (const item of site.navigation) {
    assert(
      Boolean(item.anchor) !== Boolean(item.path),
      `Navigation needs one destination: ${item.label}`,
    );
    if (item.anchor)
      assert(/^[a-z-]+$/.test(item.anchor), `Invalid anchor: ${item.anchor}`);
    if (item.path)
      assert(
        paths.has(item.path),
        `Navigation points to an unpublished route: ${item.path}`,
      );
    const target = item.anchor ?? item.path;
    assert(
      !navigationTargets.has(target),
      `Duplicate navigation target: ${target}`,
    );
    navigationTargets.add(target);
  }
  assert(/^\+52\d{10}$/.test(site.phoneE164), "Invalid Mexican phone number");
  assert(new URL(site.mapsUrl).protocol === "https:", "Unsafe mapsUrl");
  assert(
    ["www.google.com", "maps.google.com"].includes(
      new URL(site.mapsUrl).hostname,
    ),
    "Maps URL must use Google Maps",
  );
  const embed = new URL(site.mapsEmbedUrl);
  assert(
    embed.protocol === "https:" &&
      embed.hostname === "maps.google.com" &&
      embed.searchParams.get("output") === "embed",
    "Invalid Maps embed URL",
  );
  assert(memberships.currency === "MXN", "Currency must be MXN");
  const planIds = new Set();
  for (const item of [...memberships.plans, ...memberships.passes]) {
    assert(
      /^[a-z]+$/.test(item.id) && !planIds.has(item.id),
      `Duplicate or invalid membership ID: ${item.id}`,
    );
    assert(
      Number.isSafeInteger(item.amount) && item.amount >= 0,
      `Invalid amount: ${item.id}`,
    );
    planIds.add(item.id);
  }
  assert(
    memberships.plans.every(
      (plan) => Array.isArray(plan.features) && plan.features.length,
    ),
    "Plan features missing",
  );
  assert(
    promotions.enrollment.amount === 0,
    "Promotion amount changed; review copy and conditions",
  );
  if (production) {
    const publishedIds = new Set(
      routes.filter((route) => route.published).map((route) => route.id),
    );
    const requiredRoutes = [
      "home",
      "nosotros",
      "membresias",
      "galeria",
      "contacto",
      "privacidad",
    ];
    assert(
      requiredRoutes.every((id) => publishedIds.has(id)),
      "Production requires all planned pages and approved privacy notice",
    );
    const pending = [
      ["phone", site.phoneConfirmed],
      ["address", site.addressConfirmed],
      ["Maps destination", site.mapsUrlConfirmed],
      ["weekday hours", site.hours.weekdays.confirmed],
      ["Saturday hours", site.hours.saturday.confirmed],
      ["Sunday hours", site.hours.sunday.confirmed],
      ["membership prices", memberships.confirmed],
      [
        "enrollment promotion",
        promotions.enrollment.confirmed && promotions.enrollment.termsConfirmed,
      ],
    ]
      .filter(([, confirmed]) => !confirmed)
      .map(([label]) => label);
    assert(
      pending.length === 0,
      `Production blocked by unconfirmed data: ${pending.join(", ")}`,
    );
  }
}

export async function render({ clean = true } = {}) {
  const entries = await Promise.all(dataNames.map(readData));
  const data = Object.fromEntries(
    dataNames.map((name, index) => [name, entries[index]]),
  );
  const production = process.env.SITE_ENV === "production";
  validate(data, production);
  const localNumber = data.site.phoneE164.slice(3);
  data.site.phoneDisplay = `${localNumber.slice(0, 3)} ${localNumber.slice(3, 6)} ${localNumber.slice(6)}`;
  data.site.whatsappUrl = `https://wa.me/${data.site.phoneE164.slice(1)}`;
  for (const route of data.routes) {
    const image = data.seo[route.id].image;
    assert(
      /^\/assets\/[a-z0-9-]+\.(?:webp|png|jpe?g)$/.test(image),
      `Invalid social image: ${image}`,
    );
    await stat(join(root, "public", image.slice(1)));
  }
  const siteUrl = process.env.SITE_URL ?? "http://localhost:4173/";
  const origin = new URL(siteUrl);
  assert(
    origin.protocol === "http:" || origin.protocol === "https:",
    "SITE_URL must be HTTP(S)",
  );
  if (production)
    assert(
      origin.origin === "https://hexodus.mx",
      "Production SITE_URL must be https://hexodus.mx/",
    );

  if (clean) await rm(generated, { recursive: true, force: true });
  await mkdir(join(generated, "src"), { recursive: true });
  const publicDir = join(root, "public");
  if (clean) await cp(publicDir, generated, { recursive: true });
  for (const folder of ["js", "styles"]) {
    const from = join(source, folder);
    const to = join(generated, "src", folder);
    if (clean) await cp(from, to, { recursive: true });
    else await syncTree(from, to);
  }

  const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(source, { noCache: true }),
    {
      autoescape: true,
      throwOnUndefined: true,
      trimBlocks: true,
      lstripBlocks: true,
    },
  );
  env.addFilter("number", (value) =>
    new Intl.NumberFormat("en-US").format(value),
  );
  const pass = Object.fromEntries(
    data.memberships.passes.map((item) => [item.id, item]),
  );
  const plan = Object.fromEntries(
    data.memberships.plans.map((item) => [item.id, item]),
  );
  const faqs = [
    {
      question: "¿Necesito experiencia previa?",
      answer:
        "No. Te acompañamos desde el primer día y adaptamos el entrenamiento a tu nivel.",
    },
    {
      question: "¿Puedo probar antes de inscribirme?",
      answer: `Sí. Puedes adquirir una visita diaria por $${pass.day.amount} MXN.`,
    },
    {
      question: "¿Cuáles son sus horarios?",
      answer: `Lunes a viernes de ${data.site.hours.weekdays.display}; sábados de ${data.site.hours.saturday.display}.`,
    },
    {
      question: "¿Venden suplementos?",
      answer: "Sí. Pregunta en recepción por la disponibilidad actual.",
    },
    {
      question: "¿Hay precio para estudiantes?",
      answer: `Sí, la membresía para estudiantes es de $${plan.students.amount} MXN al mes con credencial vigente.`,
    },
  ];
  for (const route of data.routes.filter((item) => item.published)) {
    const canonical = new URL(route.path, origin).href;
    const output = join(
      generated,
      route.path === "/" ? "index.html" : `${route.path.slice(1)}index.html`,
    );
    await mkdir(resolve(output, ".."), { recursive: true });
    const pageSeo = {
      ...data.seo[route.id],
      title: data.seo[route.id].title.replaceAll("{name}", data.site.name),
      description: data.seo[route.id].description.replaceAll(
        "{name}",
        data.site.name,
      ),
    };
    const html = env.render(route.template, {
      ...data,
      seo: pageSeo,
      route,
      canonical,
      socialImage: new URL(data.seo[route.id].image, origin).href,
      robots: production ? "index, follow" : "noindex, follow",
      year: new Date().getFullYear(),
      faqs,
    });
    const previous = clean
      ? null
      : await readFile(output, "utf8").catch(() => null);
    if (previous !== html) await writeFile(output, html);
  }
  return {
    routes: data.routes.filter((route) => route.published),
    generated,
    production,
    origin,
  };
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  render().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
