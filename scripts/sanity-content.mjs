const projectId = process.env.SANITY_PROJECT_ID || "yr2v9nsi";
const dataset = process.env.SANITY_DATASET || "production";
const apiVersion = "2026-10-30";

const query = `{
  "site": *[_id == "siteSettings"][0],
  "home": *[_id == "homePage"][0]{...,
    experience{...,cards[]{...,image{...,"url":asset->url}}},
    philosophy{...,image{...,"url":asset->url}},
    team{...,image{...,"url":asset->url}},
    seo{...,image{...,"url":asset->url}}
  },
  "contact": *[_id == "contactPage"][0]{...,
    contactSection{...,locationImage{...,"url":asset->url}},
    seo{...,image{...,"url":asset->url}}
  },
  "galleryPage": *[_id == "galleryPage"][0]{...,seo{...,image{...,"url":asset->url}}},
  "memberships": *[_type == "membershipPlan" && status == "active"]|order(order asc),
  "promotions": *[_type == "promotion" && active == true],
  "coaches": *[_type == "coach" && status == "active"]|order(order asc){...,photo{...,"url":asset->url}},
  "facilities": *[_type == "facility" && status == "active"]|order(order asc){...,image{...,"url":asset->url,"dimensions":asset->metadata.dimensions}}
}`;

const whatsappUrl = (phone, message = "") =>
  `https://wa.me/${phone.replace(/\D/g, "")}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

function mapCta(value, phone) {
  if (!value) return null;
  const href = value.kind === "whatsapp"
    ? whatsappUrl(phone, value.whatsappMessage)
    : value.kind === "external"
      ? value.externalUrl
      : value.internalTarget;
  return {...value, href, external: value.kind !== "internal"};
}

function withCtas(page, phone) {
  if (!page) return page;
  const clone = structuredClone(page);
  for (const section of [clone.hero, clone.philosophy, clone.team, clone.finalCta, clone.cta]) {
    if (!section) continue;
    for (const key of ["cta", "primaryCta", "secondaryCta"]) {
      if (section[key]) section[key] = mapCta(section[key], phone);
    }
  }
  return clone;
}

function mapResult(result, local) {
  if (!result?.site || !result?.home || !result?.contact || !result?.galleryPage) {
    throw new Error("Sanity no contiene todavía los documentos singleton requeridos");
  }
  const phone = result.site.phoneE164;
  const monthly = result.memberships.filter((item) => item.kind === "monthly").map((item) => ({
    id: item.sourceKey.current, name: item.name, amount: item.amount, unit: item.unit,
    tag: item.tag, features: item.features || [], action: item.actionLabel,
    whatsappUrl: whatsappUrl(phone, item.whatsappMessage), featured: item.featured,
  }));
  const passes = result.memberships.filter((item) => item.kind === "pass").map((item) => ({
    id: item.sourceKey.current, name: item.name, amount: item.amount,
  }));
  const gallery = result.facilities.filter((item) => item.placements?.includes("gallery")).map((item) => ({
    id: item.sourceKey.current, src: item.image.url, alt: item.image.alt, category: item.category,
    tag: item.tag, width: item.image.dimensions?.width || 1200, height: item.image.dimensions?.height || 1200,
  }));
  const homeFacilities = result.facilities.filter((item) => item.placements?.includes("home")).map((item) => ({
    id: item.sourceKey.current, title: item.title, src: item.image.url, alt: item.image.alt,
    category: item.category, tag: item.tag,
  }));
  const pageSeo = {
    home: result.home.seo,
    contacto: result.contact.seo,
    galeria: result.galleryPage.seo,
  };
  const seo = {...local.seo};
  for (const [id, value] of Object.entries(pageSeo)) {
    seo[id] = {title: value.title, description: value.description, image: value.image.url};
  }
  const approvals = result.site.contentApproval || {};
  return {
    ...local,
    site: {
      ...local.site, ...result.site,
      phoneConfirmed: Boolean(approvals.phone), addressConfirmed: Boolean(approvals.address),
      mapsUrlConfirmed: Boolean(approvals.maps),
      hours: {
        weekdays: {display: result.site.hours.weekdays, confirmed: Boolean(approvals.hours)},
        saturday: {display: result.site.hours.saturday, confirmed: Boolean(approvals.hours)},
        sunday: {display: result.site.hours.sunday, confirmed: Boolean(approvals.hours)},
      },
      headerCta: mapCta(result.site.headerCta, phone),
    },
    memberships: {currency: "MXN", confirmed: Boolean(approvals.membershipPrices), plans: monthly, passes},
    promotions: {enrollment: result.promotions[0] || local.promotions.enrollment},
    gallery, seo,
    content: {
      home: withCtas(result.home, phone), contact: result.contact,
      gallery: withCtas(result.galleryPage, phone), coaches: result.coaches,
      homeFacilities,
    },
    contentSource: "sanity",
  };
}

export async function loadSanityContent(local) {
  const mode = process.env.SANITY_CONTENT_MODE || "auto";
  if (mode === "local") return {...local, content: {coaches: null, homeFacilities: null}, contentSource: "local"};
  const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url, {headers: {Accept: "application/json"}, signal: AbortSignal.timeout(8000)});
    if (!response.ok) throw new Error(`Sanity respondió ${response.status}`);
    const payload = await response.json();
    if (payload.error) throw new Error(payload.error.description || payload.error.type);
    return mapResult(payload.result, local);
  } catch (error) {
    if (mode === "required") throw error;
    console.warn(`[contenido] Sanity no disponible; se usará el respaldo local. ${error.message}`);
    return {...local, content: {coaches: null, homeFacilities: null}, contentSource: "local"};
  }
}
