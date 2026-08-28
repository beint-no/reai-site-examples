export const SITE_ORIGIN = "https://budmates.respiro.workers.dev";
export const HANDLE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const STORE_SCRIPT = "/assets/store.js?v=9";
export const STORE_STYLE = "/assets/store.css?v=2";

export const NAV_ITEMS = [
  { handle: "papes", label: "Papes" },
  { handle: "raw", label: "RAW" },
  { handle: "ocb", label: "OCB" },
  { handle: "vekter", label: "Vekter" },
  { handle: "grinder", label: "Grinder" },
  { handle: "bong", label: "Bong" },
  { handle: "gpen-stundenglass", label: "Stündenglass & G-Pen" },
];

export const FEATURE_HANDLES = ["gpen-stundenglass", "raw", "ocb"];
export const HIDDEN_COLLECTION_HANDLES = new Set(["frontpage", "ligher"]);

export const EDITORIAL_PATHS = [
  "/",
  "/artikler/",
  "/artikler/bong-guide-komplett/",
  "/artikler/bong-typer-glass-silikon-akryl/",
  "/artikler/den-ultimate-guiden-til-rullepapir/",
  "/artikler/gravity-bong-hva-er-det-og-bor-du-kjope-en/",
  "/artikler/grinder-den-komplette-guiden-til-urtekverner/",
  "/artikler/hva-er-cones-og-bor-du-bruke-det/",
  "/artikler/hva-er-forskjellen-pa-tynne-og-tykke-papes/",
  "/artikler/hva-er-ocb-alt-du-trenger-a-vite-om-den-franske-merkevaren/",
  "/artikler/hva-er-perkolator-bong/",
  "/artikler/hva-er-raw-rullepapir-alt-du-trenger-a-vite-om-det-amerikanske-merket/",
  "/artikler/hvilke-papes-er-best-guide-for-nybegynnere/",
  "/artikler/hvilken-storrelse-pa-papes-bor-du-velge/",
  "/artikler/hvordan-bruke-bong-nybegynner/",
  "/artikler/hvordan-bruke-vaporizer-nybegynner/",
  "/artikler/hvordan-rulle-royk-her-er-vare-gode-tips/",
  "/artikler/hvordan-vaske-bong/",
  "/artikler/hvordan-vaske-en-grinder-her-er-vaere-gode-tips/",
  "/artikler/hvorfor-brenner-rullepapiret-ujevnt-5-vanlige-arsaker/",
  "/artikler/manitou-tobakk-sky-green-og-gold-den-komplette-guiden/",
  "/artikler/raw-eller-ocb-hvilket-merke-er-best-for-dine-papes/",
  "/artikler/rengjore-vedlikeholde-vaporizer/",
  "/artikler/rullepapir-med-filter-fordeler-og-beste-valg/",
  "/artikler/ubleket-vs-bleket-rullepapir-hva-er-best-og-hvorfor/",
  "/artikler/vaporizer-guide-komplett/",
  "/artikler/vaporizer-vs-royking/",
  "/faq/",
  "/handlekurv/",
  "/kontakt/",
  "/kunnskap/",
  "/kunnskap/diskret-levering/",
  "/kunnskap/materialer-og-holdbarhet/",
  "/kunnskap/rengjoring-og-vedlikehold/",
  "/levering/",
  "/om/",
  "/personvern/",
  "/sok/",
  "/utvalg/",
  "/vilkar/",
];

const ALLOWED_TAGS = new Set(["P", "H2", "H3", "UL", "OL", "LI", "STRONG", "EM", "A", "BR", "B", "I"]);
const RELATED_COLLECTION_ORDER = [
  "papes", "raw", "ocb", "bong", "grinder", "vekter", "gpen-stundenglass",
  "cones", "filter-tips", "tilbehor", "mekkebrett", "tobakk", "elements",
  "bestselgere", "favoritter",
];

export const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

export const stripHtml = (value = "") => String(value)
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&nbsp;/g, " ")
  .replace(/&#39;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, " ")
  .trim();

export const formatMoney = (value) => new Intl.NumberFormat("nb-NO", {
  minimumFractionDigits: Number(value) % 1 ? 2 : 0,
  maximumFractionDigits: 2,
}).format(Number(value)) + " kr";

export const priceRange = (variants = []) => {
  const prices = variants.map((variant) => Number(variant.price)).filter((price) => Number.isFinite(price));
  if (!prices.length) return "0 kr";
  const minimum = Math.min(...prices);
  const maximum = Math.max(...prices);
  return minimum === maximum ? formatMoney(minimum) : `${formatMoney(minimum)} – ${formatMoney(maximum)}`;
};

export const siteImage = (product) => product?.images?.[0] || null;

export const imageCandidates = (image) => {
  if (!image) return [];
  const candidates = [...(image.renditions || []), image]
    .filter((candidate) => candidate?.url && Number(candidate.width) > 0);
  const byWidth = new Map(candidates.map((candidate) => [Number(candidate.width), candidate]));
  return [...byWidth.values()].sort((left, right) => Number(left.width) - Number(right.width));
};

export const imageUrl = (image, preferredWidth = 960) => {
  const candidates = imageCandidates(image);
  return candidates.find((candidate) => Number(candidate.width) >= preferredWidth)?.url
    || candidates.at(-1)?.url
    || image?.url
    || "";
};

export const imageSrcset = (image) => imageCandidates(image)
  .map((candidate) => `${candidate.url} ${candidate.width}w`)
  .join(", ");

export function responsiveImage(image, {
  alt = "",
  preferredWidth = 960,
  sizes,
  loading,
  fetchPriority,
  main = false,
} = {}) {
  const src = imageUrl(image, preferredWidth);
  if (!src) return "";
  const srcset = imageSrcset(image);
  const width = Number(image.width) > 0 ? ` width="${Number(image.width)}"` : "";
  const height = Number(image.height) > 0 ? ` height="${Number(image.height)}"` : "";
  const source = srcset
    ? `<source data-responsive-source type="image/avif" srcset="${escapeHtml(srcset)}"${sizes ? ` sizes="${escapeHtml(sizes)}"` : ""}>`
    : "";
  return `<picture class="responsive-picture">${source}<img${main ? " data-main-product-image" : ""} src="${escapeHtml(src)}"${srcset ? ` srcset="${escapeHtml(srcset)}"` : ""}${srcset && sizes ? ` sizes="${escapeHtml(sizes)}"` : ""} alt="${escapeHtml(alt)}"${width}${height}${loading ? ` loading="${loading}"` : ""}${fetchPriority ? ` fetchpriority="${fetchPriority}"` : ""} decoding="async"></picture>`;
}

export function localPicture(src, {
  alt = "",
  width,
  height,
  sizes = "100vw",
  widths = [640, 1200, 1600],
  loading = "lazy",
} = {}) {
  const base = String(src).replace(/\.webp$/i, "");
  const srcset = widths.map((candidate) => `${base}-${candidate}.avif ${candidate}w`).join(", ");
  return `<picture class="responsive-picture"><source type="image/avif" srcset="${escapeHtml(srcset)}" sizes="${escapeHtml(sizes)}"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${Number(width) > 0 ? ` width="${Number(width)}"` : ""}${Number(height) > 0 ? ` height="${Number(height)}"` : ""}${loading ? ` loading="${loading}"` : ""} decoding="async"></picture>`;
}

const CARD_IMAGE_SIZES = "(max-width: 620px) 46vw, (max-width: 1000px) 30vw, 280px";
const CATEGORY_IMAGE_SIZES = "(max-width: 560px) calc(100vw - 28px), (max-width: 900px) calc(50vw - 28px), 383px";
const HERO_IMAGE_SIZES = "(max-width: 620px) 175px, (max-width: 900px) 225px, 310px";
const PRODUCT_IMAGE_SIZES = "(max-width: 780px) calc(100vw - 36px), 600px";

const galleryButton = (image, index, productTitle) => {
  const src = imageUrl(image, 960);
  const srcset = imageSrcset(image);
  const alt = image.alt || `${productTitle} – produktbilde ${index + 1}`;
  const thumbnail = responsiveImage(image, { preferredWidth: 480, sizes: "96px", loading: "lazy" });
  return `<button type="button" data-gallery-src="${escapeHtml(src)}" data-gallery-alt="${escapeHtml(alt)}"${srcset ? ` data-gallery-srcset="${escapeHtml(srcset)}" data-gallery-sizes="${escapeHtml(PRODUCT_IMAGE_SIZES)}"` : ""} aria-label="Vis produktbilde ${index + 1}" aria-current="${index === 0 ? "true" : "false"}"${index === 0 ? ' class="is-active"' : ""}>${thumbnail}</button>`;
};

const rewriteStoreHref = (href) => String(href || "")
  .replace(/https?:\/\/(?:www\.)?budmates\.no\/blogs\/news\/([^/?#]+)/gi, "/artikler/$1/")
  .replace(/\/blogs\/news\/([^/?#]+)/gi, "/artikler/$1/")
  .replace(/https?:\/\/(?:www\.)?budmates\.no\/collections\/([^/?#]+)/gi, "/collections/$1/")
  .replace(/https?:\/\/(?:www\.)?budmates\.no\/products\/([^/?#]+)/gi, "/products/$1/");

const isSafeHref = (href) => {
  const value = String(href || "").trim();
  if (!value) return false;
  if (value.startsWith("/") || value.startsWith("mailto:") || value.startsWith("tel:")) return true;
  return /^https?:\/\//i.test(value) && !/^https?:\/\/javascript/i.test(value);
};

export function sanitizeHtml(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<\/?([a-z0-9]+)(\s[^>]*)?>/gi, (match, tag, attrs = "") => {
      const name = tag.toUpperCase();
      if (!ALLOWED_TAGS.has(name)) return "";
      if (match.startsWith("</")) return `</${tag.toLowerCase()}>`;
      if (name === "BR") return "<br>";
      if (name === "A") {
        const href = rewriteStoreHref(attrs.match(/href\s*=\s*["']([^"']+)["']/i)?.[1] || "");
        if (!isSafeHref(href)) return "";
        return `<a href="${escapeHtml(href)}">`;
      }
      return `<${tag.toLowerCase()}>`;
    });
}

export function formatDescription(text) {
  const raw = String(text || "").trim();
  if (!raw) return "";
  if (/<[a-z][\s\S]*>/i.test(raw)) return sanitizeHtml(raw);
  const spaced = raw.replace(/\.([A-ZÆØÅ])/g, ". $1");
  const parts = spaced.split(/\bSpesifikasjoner\b/i);
  const blocks = [];
  const intro = parts[0].trim();
  if (intro) {
    const sentences = intro.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g)?.map((sentence) => sentence.trim()).filter(Boolean) || [intro];
    for (let index = 0; index < sentences.length; index += 2) {
      blocks.push(`<p>${escapeHtml(sentences.slice(index, index + 2).join(" "))}</p>`);
    }
  }
  if (parts.length > 1) {
    blocks.push("<h2>Spesifikasjoner</h2>");
    const spec = parts.slice(1).join(" ").trim();
    if (spec) blocks.push(`<p>${escapeHtml(spec)}</p>`);
  }
  return blocks.join("");
}

export function metaDescription(value, fallback = "") {
  const text = stripHtml(value || fallback).slice(0, 155);
  return text || fallback;
}

export function matchRoute(pathname) {
  const path = pathname === "/index.html" ? "/" : pathname;
  if (path === "/") return { type: "home" };
  if (path === "/sitemap.xml") return { type: "sitemap" };
  const product = path.match(/^\/products\/([^/]+)\/?$/);
  if (product) {
    return {
      type: "product",
      handle: product[1],
      canonicalPath: `/products/${product[1]}/`,
      needsSlash: !path.endsWith("/"),
      valid: HANDLE.test(product[1]),
    };
  }
  const collection = path.match(/^\/collections\/([^/]+)\/?$/);
  if (collection) {
    return {
      type: "collection",
      handle: collection[1],
      canonicalPath: `/collections/${collection[1]}/`,
      needsSlash: !path.endsWith("/"),
      valid: collection[1] === "all" || HANDLE.test(collection[1]),
    };
  }
  return null;
}

export function navItems(store) {
  if (!store?.collections) return NAV_ITEMS;
  const byHandle = new Map(store.collections.map((collection) => [collection.handle, collection]));
  return NAV_ITEMS.filter((item) => (byHandle.get(item.handle)?.products || []).length > 0);
}

export function publishedCollections(store) {
  return (store?.collections || []).filter((collection) => (
    !HIDDEN_COLLECTION_HANDLES.has(collection.handle) && (collection.products || []).length > 0
  ));
}

export function collectionByHandle(store, handle) {
  return (store?.collections || []).find((collection) => collection.handle === handle) || null;
}

export function productByHandle(store, handle) {
  return (store?.products || []).find((product) => product.handle === handle) || null;
}

export function collectionImage(collection, store) {
  if (collection?.imageUrl?.startsWith("https://app.reai.no/")) return { url: collection.imageUrl };
  for (const member of collection?.products || []) {
    const image = siteImage(productByHandle(store, member.handle));
    if (image?.url) return image;
  }
  return null;
}

export function relatedProducts(store, product, limit = 4) {
  const handle = product.handle;
  const collections = store?.collections || [];
  const preferred = [
    ...RELATED_COLLECTION_ORDER.map((item) => collections.find((collection) => collection.handle === item)).filter(Boolean),
    ...collections.filter((collection) => !RELATED_COLLECTION_ORDER.includes(collection.handle)),
  ];
  const seen = new Set([handle]);
  const related = [];
  const push = (candidate) => {
    if (!candidate || seen.has(candidate.handle)) return;
    seen.add(candidate.handle);
    related.push(candidate);
  };
  for (const collection of preferred) {
    if (!(collection.products || []).some((member) => member.handle === handle)) continue;
    for (const member of collection.products) {
      push(productByHandle(store, member.handle));
      if (related.length >= limit) return related;
    }
  }
  if (related.length < limit && product.brand && product.brand !== "BudMates.no") {
    for (const candidate of store.products || []) {
      if (candidate.brand !== product.brand) continue;
      push(candidate);
      if (related.length >= limit) return related;
    }
  }
  return related;
}

export function productCard(product, label = "") {
  if (!product?.handle) return "";
  const image = siteImage(product);
  const prices = (product.variants || []).map((variant) => Number(variant.price)).filter((price) => Number.isFinite(price));
  const from = prices.length ? Math.min(...prices) : 0;
  const compare = Math.max(0, ...(product.variants || []).map((variant) => Number(variant.compareAtPrice || 0)));
  const media = image
    ? responsiveImage(image, { alt: image.alt || product.title, preferredWidth: 480, sizes: CARD_IMAGE_SIZES, loading: "lazy" })
    : '<span class="product-image-fallback">BM</span>';
  return `<article class="product-card"><a class="product-card-media" href="/products/${escapeHtml(product.handle)}/">${label ? `<span class="product-badge">${escapeHtml(label)}</span>` : ""}${media}</a><div class="product-card-copy"><p>${escapeHtml(product.brand || "BudMates")}</p><h3><a href="/products/${escapeHtml(product.handle)}/">${escapeHtml(product.title)}</a></h3><div class="product-card-price"><strong>${formatMoney(from)}</strong>${compare > from ? `<del>${formatMoney(compare)}</del>` : ""}</div></div></article>`;
}

export function productGrid(products, label = "") {
  const cards = (products || []).map((product) => productCard(product, label)).filter(Boolean);
  return cards.length
    ? `<div class="product-grid" data-collection-grid data-server-rendered="true">${cards.join("")}</div>`
    : '<div class="empty-state"><h2>Ingen produkter akkurat nå</h2><p>Utvalget oppdateres fortløpende.</p></div>';
}

function jsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replaceAll("<", "\\u003c")}</script>`;
}

function collectionBlurb(collection, fallback) {
  if (collection?.seoDescription) return stripHtml(collection.seoDescription);
  const text = stripHtml(collection?.description || "");
  return text || fallback;
}

function breadcrumbs(items) {
  return `<nav class="shop-breadcrumbs" aria-label="Brødsmulesti"><ol>${items.map((item, index) => {
    const current = index === items.length - 1;
    const content = item.href && !current
      ? `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`
      : `<span${current ? ' aria-current="page"' : ""}>${escapeHtml(item.label)}</span>`;
    return `<li>${content}</li>`;
  }).join("")}</ol></nav>`;
}

function chrome(store, active = "") {
  const items = navItems(store);
  const nav = [
    `<a href="/"${active === "home" ? ' aria-current="page"' : ""}>Hjem</a>`,
    ...items.map((item) => `<a href="/collections/${item.handle}/"${active === item.handle ? ' aria-current="page"' : ""}>${escapeHtml(item.label)}</a>`),
  ].join("");
  const year = new Date().getFullYear();
  return {
    header: `<a class="skip-link" href="#main">Hopp til innhold</a>
  <aside class="shop-announcement" aria-label="Kjøpsfordeler"><ul class="shop-shell"><li>Betal med Vipps</li><li>Fri frakt over 850 kr</li><li>69 kr under 850 kr</li><li>Diskré pakking</li></ul></aside>
  <header class="shop-header"><div class="shop-header-inner shop-shell">
    <a class="shop-logo" href="/" aria-label="BudMates, forside"><img src="/assets/brand/budmates-logo.png" alt="BudMates" width="200" height="64" decoding="async"></a>
    <button class="shop-menu-toggle" type="button" aria-label="Åpne meny" aria-expanded="false" aria-controls="shop-navigation" data-nav-toggle><span></span></button>
    <nav class="shop-nav" id="shop-navigation" aria-label="Hovedmeny" data-nav-links>${nav}</nav>
    <div class="shop-tools"><a href="/sok/" aria-label="Søk">Søk</a><a href="/handlekurv/" aria-label="Handlekurv">Kurv <span class="cart-count" data-cart-count>0</span></a></div>
  </div></header>
  <a class="trust-strip" href="https://no.trustpilot.com/review/budmates.no" rel="noopener"><span>Dette sier kundene våre</span><strong>Enestående</strong><span class="trust-stars">★★★★★</span><span>4,7 av 5 på Trustpilot</span></a>`,
    footer: `<footer class="shop-footer"><div class="shop-shell shop-footer-grid"><div><a class="shop-logo shop-logo--footer" href="/"><img src="/assets/brand/budmates-logo.png" alt="BudMates" width="200" height="64" loading="lazy" decoding="async"></a><p>Norges headshop på nett. Sendt raskt og diskré fra lager i Norge.</p></div><div><h2>Handle</h2><a href="/collections/papes/">Papes</a><a href="/collections/raw/">RAW</a><a href="/collections/ocb/">OCB</a><a href="/collections/all/">Alle produkter</a></div><div><h2>Informasjon</h2><a href="/levering/">Frakt og levering</a><a href="/kontakt/">Kontakt oss</a><a href="/om/">Om oss</a><a href="/faq/">Vanlige spørsmål</a></div><div><h2>Vilkår</h2><a href="/vilkar/">Salgsvilkår</a><a href="/personvern/">Personvern</a><a href="/artikler/">Artikler</a></div></div><div class="shop-footer-bottom shop-shell"><span>© ${year} BudMates AS · Org.nr. 929 151 291</span><div><a href="https://www.instagram.com/budmates.no">Instagram</a><a href="https://www.snapchat.com/add/budmates.no">Snapchat</a></div></div></footer><div class="cart-toast" role="status" aria-live="polite" data-cart-toast hidden></div>`,
  };
}

export function documentHtml({
  title,
  description,
  canonicalPath,
  active = "",
  body,
  store = null,
  schema = "",
  ogType = "website",
  ogImage = `${SITE_ORIGIN}/assets/brand/budmates-logo.png`,
}) {
  const { header, footer } = chrome(store, active);
  const url = `${SITE_ORIGIN}${canonicalPath}`;
  return `<!doctype html><html lang="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark light"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="theme-color" content="#050605"><link rel="canonical" href="${escapeHtml(url)}"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="preconnect" href="https://app.reai.no" crossorigin><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(url)}"><meta property="og:type" content="${escapeHtml(ogType)}"><meta property="og:image" content="${escapeHtml(ogImage)}"><meta property="og:locale" content="nb_NO"><meta property="og:site_name" content="BudMates"><link rel="stylesheet" href="/assets/site.css"><link rel="stylesheet" href="${STORE_STYLE}"><script src="${STORE_SCRIPT}" defer></script>${schema}</head><body>${header}<noscript><p class="noscript-banner">JavaScript må være aktivert for handlekurv og utsjekk.</p></noscript><main id="main">${body}</main>${footer}</body></html>`;
}

function editorialHome() {
  return `<section class="home-delivery"><div class="shop-shell home-delivery-grid"><figure>${localPicture("/assets/discreet-delivery.webp", { alt: "Diskré, nøytral pakke klar for levering", width: 1600, height: 1200, sizes: "(max-width: 860px) calc(100vw - 28px), 560px" })}</figure><div><p class="shop-kicker">Fra lageret til døren</p><h2>Diskré hele veien.</h2><p>Ordren pakkes nøytralt og sendes fra norsk lager. Avsenderen står som BM AS, uten produktnavn på utsiden.</p><a class="store-button" href="/levering/">Slik leverer vi</a></div></div></section>
<section class="shop-section home-editorial"><div class="shop-shell"><div class="shop-section-head"><div><p class="shop-kicker">BudMates guider</p><h2>Lær mer.</h2></div><a class="shop-text-link" href="/artikler/">Alle artikler →</a></div><div class="home-editorial-grid"><a href="/artikler/den-ultimate-guiden-til-rullepapir/"><span>01 / RULLEPAPIR</span><h3>Den ultimate guiden til papes.</h3><p>Merker, størrelser, papirtype og filter – forklart fra start.</p><strong>Les guiden →</strong></a><a href="/artikler/bong-guide-komplett/"><span>02 / BONG</span><h3>Den komplette bong-guiden.</h3><p>Materialer, størrelser, filtrering og hva du bør se etter.</p><strong>Les guiden →</strong></a><a href="/artikler/vaporizer-guide-komplett/"><span>03 / VAPORIZER</span><h3>Guide til vaporizere.</h3><p>Hvordan ulike modeller fungerer, vedlikehold og nyttige valg.</p><strong>Les guiden →</strong></a></div></div></section>
<section class="service-band" aria-label="Kjøpsfordeler"><ul class="shop-shell"><li><strong>Fri frakt</strong><span>På ordre over 850 kr</span></li><li><strong>Diskré levering</strong><span>BM AS som avsender</span></li><li><strong>Norsk lager</strong><span>Sendes fra Vadsø</span></li><li><strong>Spør oss</strong><span>post@budmates.no</span></li></ul></section>`;
}

export function renderHomePage(store) {
  const bestsellers = (collectionByHandle(store, "bestselgere")?.products || [])
    .map((member) => productByHandle(store, member.handle))
    .filter(Boolean);
  const hero = bestsellers.slice(0, 3);
  const features = FEATURE_HANDLES
    .map((handle) => collectionByHandle(store, handle))
    .filter((collection) => (collection?.products || []).length > 0);
  const gpen = (collectionByHandle(store, "gpen-stundenglass")?.products || [])
    .map((member) => productByHandle(store, member.handle))
    .filter(Boolean);
  const shown = new Set([...bestsellers.slice(0, 8), ...hero, ...gpen.slice(0, 2)].map((product) => product.handle));
  const more = (store?.products || []).filter((product) => !shown.has(product.handle) && siteImage(product)).slice(0, 8);
  const heroCards = hero.map((product, index) => {
    const image = siteImage(product);
    return `<a class="hero-product hero-product--${index + 1}" href="/products/${escapeHtml(product.handle)}/"><span>${index === 0 ? "Mest valgt" : "Fra utvalget"}</span>${image ? responsiveImage(image, { alt: image.alt || product.title, preferredWidth: 480, sizes: HERO_IMAGE_SIZES, fetchPriority: index === 0 ? "high" : undefined }) : ""}<strong>${escapeHtml(product.title)}</strong></a>`;
  }).join("");
  const categoryCards = features.map((collection) => {
    const image = collectionImage(collection, store);
    const media = responsiveImage(image, {
      alt: collection.title,
      preferredWidth: 640,
      sizes: CATEGORY_IMAGE_SIZES,
      loading: "lazy",
    });
    return `<a class="category-feature" href="/collections/${escapeHtml(collection.handle)}/">${media}<span>${escapeHtml(collection.title)}</span><small>${collection.products.length} produkter</small></a>`;
  }).join("");
  const body = `<section class="store-hero${hero.length ? "" : " store-hero--plain"}" data-storefront="home"><div class="shop-shell store-hero-grid"><div class="store-hero-copy"><p class="shop-kicker">Diskré pakking · Lager i Norge</p><h1>Norges beste<br><span>headshop.</span></h1><p>Rullepapir, bonger, grindere, vaporizere og tilbehør – samlet på ett ryddigere sted.</p><div class="store-actions"><a class="store-button" href="/collections/all/">Se alle produkter</a><a class="store-button store-button--ghost" href="/collections/bestselgere/">Bestselgere</a></div></div>${hero.length ? `<div class="hero-product-stack">${heroCards}</div>` : ""}</div></section>
${categoryCards ? `<section class="shop-section shop-section--light"><div class="shop-shell"><div class="shop-section-head"><div><p class="shop-kicker">Populære kategorier</p><h2>Finn din greie.</h2></div><a class="shop-text-link" href="/collections/all/">Se hele utvalget →</a></div><div class="category-feature-grid">${categoryCards}</div></div></section>` : ""}
${bestsellers.length ? `<section class="shop-section"><div class="shop-shell"><div class="shop-section-head"><div><p class="shop-kicker">Det kundene velger igjen</p><h2>Bestselgere.</h2></div><a class="shop-text-link" href="/collections/bestselgere/">Se alle →</a></div>${productGrid(bestsellers.slice(0, 8), "Populær")}</div></section>` : ""}
${gpen.length ? `<section class="brand-feature"><div class="shop-shell brand-feature-grid"><div><p class="shop-kicker">Offisiell distributør</p><h2>Stündenglass<br>& G Pen.</h2><p>Gravity infusers, vaporizere og originalt tilbehør – tilgjengelig fra lager i Norge.</p><a class="store-button" href="/collections/gpen-stundenglass/">Se kolleksjonen</a></div><div class="brand-feature-products">${gpen.slice(0, 2).map((product) => productCard(product)).join("")}</div></div></section>` : ""}
${more.length ? `<section class="shop-section shop-section--light"><div class="shop-shell"><div class="shop-section-head"><div><p class="shop-kicker">Fra utvalget</p><h2>Mer å se.</h2></div><a class="shop-text-link" href="/collections/all/">Se alt →</a></div>${productGrid(more)}</div></section>` : ""}
${editorialHome()}`;
  return documentHtml({
    title: "BudMates — Norges headshop på nett",
    description: "Rullepapir, bonger, grindere, vaporizere og tilbehør fra norsk lager. Fri frakt over 850 kr og diskré levering.",
    canonicalPath: "/",
    active: "home",
    body,
    store,
  });
}

export function renderCollectionPage(store, handle) {
  const isAll = handle === "all";
  const collection = isAll ? null : collectionByHandle(store, handle);
  if (!isAll && !collection) return null;
  const members = isAll
    ? (store?.products || [])
    : (collection.products || []).map((member) => productByHandle(store, member.handle) || member).filter((product) => product.handle);
  const title = isAll ? "Alle produkter" : collection.title;
  const description = isAll
    ? "Hele utvalget fra BudMates – papes, filter, grindere, bonger, vaporizere, vekter og tilbehør."
    : collectionBlurb(collection, `Se hele utvalget i ${title.toLowerCase()}.`);
  const countLabel = `${members.length} produkter`;
  const active = isAll ? "" : (NAV_ITEMS.find((item) => item.handle === handle)?.handle || "");
  const image = isAll ? "" : collectionImage(collection, store);
  const trail = breadcrumbs([{ href: "/", label: "Hjem" }, { label: title }]);
  const body = `<header class="collection-hero" data-storefront="collection"><div class="shop-shell">${trail}<p class="shop-kicker">${escapeHtml(countLabel)}</p><h1>${escapeHtml(isAll ? "Alle produkter." : title)}</h1><p>${escapeHtml(description)}</p></div></header><section class="shop-section shop-section--light" aria-labelledby="collection-products"><div class="shop-shell"><h2 class="sr-only" id="collection-products">Produkter i ${escapeHtml(title)}</h2><div class="catalog-toolbar"><strong>${escapeHtml(countLabel)}</strong><a href="/sok/">${isAll ? "Søk i utvalget" : "Søk i hele butikken"}</a></div>${productGrid(members)}</div></section>`;
  return documentHtml({
    title: `${title} | BudMates`,
    description: metaDescription(collection?.seoDescription || description, description),
    canonicalPath: `/collections/${handle}/`,
    active,
    body,
    store,
    ogImage: image?.url || undefined,
  });
}

export function renderProductPage(store, product, availability = {}) {
  const image = siteImage(product);
  const images = product.images || [];
  const variants = product.variants || [];
  const related = relatedProducts(store, product);
  const crumbCollection = RELATED_COLLECTION_ORDER
    .map((handle) => collectionByHandle(store, handle))
    .find((collection) => (collection?.products || []).some((member) => member.handle === product.handle));
  const active = crumbCollection && NAV_ITEMS.some((item) => item.handle === crumbCollection.handle)
    ? crumbCollection.handle
    : "";
  const available = variants.some((variant) => availability[variant.id] === true);
  const firstVariant = variants[0];
  const gallery = images.length
    ? `<section class="product-gallery" aria-label="Produktbilder"><div class="product-main-image">${responsiveImage(images[0], { alt: images[0].alt || product.title, preferredWidth: 960, sizes: PRODUCT_IMAGE_SIZES, fetchPriority: "high", main: true })}</div>${images.length > 1 ? `<div class="product-thumbs" role="group" aria-label="Velg produktbilde">${images.map((item, index) => galleryButton(item, index, product.title)).join("")}</div>` : ""}</section>`
    : '<div class="product-main-image"><span class="product-image-fallback">BM</span></div>';
  const optionName = variants.find((variant) => variant.options?.[0]?.name)?.options?.[0]?.name || "Variant";
  const variantSelect = variants.length > 1
    ? `<label class="product-option">${escapeHtml(optionName)}<select data-product-variant>${variants.map((variant) => {
        const label = variant.options?.map((entry) => entry.value).filter(Boolean).join(" / ") || product.title;
        const inStock = availability[variant.id] === true;
        return `<option value="${escapeHtml(variant.id)}" data-site-variant="${escapeHtml(variant.id)}" data-site-price="${escapeHtml(variant.price)}" data-site-available="${inStock}">${escapeHtml(label)} · ${formatMoney(variant.price)}${inStock ? "" : " · Utsolgt"}</option>`;
      }).join("")}</select></label>`
    : "";
  const schema = jsonLd({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: images.map((item) => item.url),
    description: stripHtml(product.description || product.seoDescription || product.title),
    sku: firstVariant?.sku || undefined,
    brand: { "@type": "Brand", name: product.brand || "BudMates" },
    offers: variants.map((variant) => ({
      "@type": "Offer",
      priceCurrency: "NOK",
      price: String(variant.price),
      availability: availability[variant.id] === true ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE_ORIGIN}/products/${product.handle}/`,
    })),
  });
  const descriptionHtml = formatDescription(product.description) || `<p>${escapeHtml(product.seoDescription || "")}</p>`;
  const trail = breadcrumbs([
    { href: "/", label: "Hjem" },
    ...(crumbCollection ? [{ href: `/collections/${crumbCollection.handle}/`, label: crumbCollection.title }] : []),
    { label: product.title },
  ]);
  const body = `<section class="product-page shop-section--light" data-storefront="product"><div class="shop-shell">${trail}<div class="product-layout">${gallery}<div class="product-info"><p class="product-vendor">${escapeHtml(product.brand || "BudMates")}</p><h1>${escapeHtml(product.title)}</h1><div class="product-price" data-product-price aria-live="polite">${priceRange(variants)}</div><p class="product-shipping-note">Avgifter inkludert. Frakt beregnes i kassen.</p><form class="product-purchase" data-product-form>${variantSelect}<div class="product-buy-row"><label>Antall<span class="quantity-control"><button type="button" data-quantity-minus aria-label="Reduser antall">−</button><input type="number" value="1" min="1" max="20" inputmode="numeric" aria-label="Antall" data-quantity><button type="button" data-quantity-plus aria-label="Øk antall">+</button></span></label><button class="store-button store-button--buy" type="button" data-add-to-cart data-id="${escapeHtml(product.id)}" data-title="${escapeHtml(product.title)}" data-price="${escapeHtml(firstVariant?.price ?? "")}" data-image="${escapeHtml(imageUrl(image, 480))}" data-handle="${escapeHtml(product.handle)}" data-variant="${escapeHtml(firstVariant?.id || "")}" data-site-available="${available}"${available ? "" : " disabled"}>${available ? "Legg i handlekurven" : "Utsolgt"}</button></div></form><ul class="product-trust"><li>✓ Lager i Norge</li><li>✓ Diskré pakking</li><li>✓ Fri frakt over 850 kr</li></ul><section class="product-description" aria-label="Produktinformasjon">${descriptionHtml}</section></div></div></div></section>${related.length ? `<section class="shop-section"><div class="shop-shell"><div class="shop-section-head"><div><p class="shop-kicker">Andre så også på</p><h2>Mer i samme kategori.</h2></div></div>${productGrid(related)}</div></section>` : ""}`;
  return documentHtml({
    title: `${product.seoTitle || product.title} | BudMates`.replace(" | BudMates | BudMates", " | BudMates"),
    description: metaDescription(product.seoDescription || product.description, product.title),
    canonicalPath: `/products/${product.handle}/`,
    active,
    body,
    store,
    schema,
    ogType: "product",
    ogImage: image?.url || `${SITE_ORIGIN}/assets/brand/budmates-logo.png`,
  });
}

export function renderMessagePage(store, { title, heading, text, kicker = "BudMates" }) {
  const body = `<section class="simple-hero"><div class="shop-shell" style="min-height:60vh;display:flex;flex-direction:column;justify-content:center"><p class="shop-kicker">${escapeHtml(kicker)}</p><h1>${escapeHtml(heading)}</h1><p style="color:#b8bbb0">${escapeHtml(text)}</p><p><a class="store-button" href="/">Til forsiden</a></p></div></section>`;
  return documentHtml({
    title,
    description: text,
    canonicalPath: "/404.html",
    body,
    store,
  });
}

export function renderNotFoundPage(store) {
  return renderMessagePage(store, {
    title: "Fant ikke siden | BudMates",
    heading: "Her var det tomt.",
    text: "Siden finnes ikke, eller har fått en ny adresse.",
    kicker: "404",
  });
}

export function renderUnavailablePage(store) {
  return renderMessagePage(store, {
    title: "Midlertidig utilgjengelig | BudMates",
    heading: "Utvalget er nede.",
    text: "Vi får ikke hentet produkter fra lageret akkurat nå. Prøv igjen om litt.",
    kicker: "Site API",
  });
}

export function renderSitemap(store) {
  const collections = publishedCollections(store);
  const products = store?.products || [];
  const paths = [
    ...EDITORIAL_PATHS,
    "/collections/all/",
    ...collections.map((collection) => `/collections/${collection.handle}/`),
    ...products.map((product) => `/products/${product.handle}/`),
  ];
  const unique = [...new Set(paths)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${unique.map((path) => `  <url><loc>${SITE_ORIGIN}${path}</loc></url>`).join("\n")}\n</urlset>\n`;
}
