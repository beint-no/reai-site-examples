import { renderCompactLegalFooter } from "../../packages/reai-cloudflare-storefront/footer.mjs";

export const SITE_ORIGIN = "https://duofiller.respiro.workers.dev";
export const HANDLE = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;
export const CONTACT_EMAIL = "post@brewket.no";

const ALLOWED_TAGS = new Set(["P", "H2", "H3", "UL", "OL", "LI", "STRONG", "EM", "A", "BR", "B", "I"]);

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
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/\s+/g, " ")
  .trim();

const message = (context, key) => context?.messages?.[key] || key;
const publicPath = (context, value) => context?.publicPath?.(value) || value;
const isNorwegian = (context) => context?.locale?.startsWith("nb");

export const MARKETS = Object.freeze([
  { handle: "norway", currency: "NOK" },
  { handle: "europe", currency: "EUR" },
  { handle: "international", currency: "USD" },
]);

export function defaultMarketForLocale(locale) {
  return String(locale || "").startsWith("nb") ? "norway" : "international";
}

export function marketQueryFor(locale, market) {
  if (!market || market === defaultMarketForLocale(locale)) return "";
  return `?market=${encodeURIComponent(market)}`;
}

export function marketQuery(context) {
  return marketQueryFor(context?.locale, context?.market);
}

const href = (context, path) => `${publicPath(context, path)}${marketQuery(context)}`;

function currencySwitcher(context) {
  const current = context?.market || defaultMarketForLocale(context?.locale);
  const options = MARKETS.map((item) => {
    const selected = item.handle === current ? " selected" : "";
    return `<option value="${escapeHtml(item.handle)}"${selected}>${escapeHtml(item.currency)}</option>`;
  }).join("");
  return `<label class="currency-switch"><span class="visually-hidden">${escapeHtml(message(context, "currency_label"))}</span><select name="market" data-market-select aria-label="${escapeHtml(message(context, "currency_label"))}">${options}</select></label>`;
}
const staticPaths = (context) => isNorwegian(context)
  ? { support: "/brukerstotte/", contact: "/kontakt/", search: "/sok/", cart: "/handlekurv/", shipping: "/policies/frakt/", refund: "/policies/retur/", privacy: "/policies/personvern/", terms: "/policies/vilkar/" }
  : { support: "/support/", contact: "/contact/", search: "/search/", cart: "/cart/", shipping: "/policies/shipping/", refund: "/policies/refund/", privacy: "/policies/privacy/", terms: "/policies/terms/" };

export const displayTitle = (product) => String(product?.title || "").replace(/^Duofiller\b/i, "DuoFiller");

export function formatMoney(value, currency, context) {
  return new Intl.NumberFormat(context?.locale || "en-NO", {
    style: "currency",
    currency: String(currency || "NOK").toUpperCase(),
    maximumFractionDigits: Number(value) % 1 ? 2 : 0,
  }).format(Number(value));
}

export const productByHandle = (store, handle) => (store?.products || []).find((product) => product.handle === handle);
export const collectionByHandle = (store, handle) => (store?.collections || []).find((collection) => collection.handle === handle);

const imageCandidates = (image) => {
  if (!image) return [];
  const candidates = [...(image.renditions || []), image].filter((candidate) => candidate?.url && Number(candidate.width) > 0);
  return [...new Map(candidates.map((candidate) => [Number(candidate.width), candidate])).values()]
    .sort((left, right) => Number(left.width) - Number(right.width));
};

const imageUrl = (image, width = 960) => {
  const candidates = imageCandidates(image);
  return candidates.find((candidate) => Number(candidate.width) >= width)?.url || candidates.at(-1)?.url || image?.url || "";
};

const staticAssetHandle = (handle) => handle === "duofiller-core-g3" ? "duofiller_core_g3" : handle;

const responsiveImage = (image, { alt = "", sizes = "100vw", loading = "lazy", priority = false } = {}) => {
  if (!image?.url) return "";
  const candidates = imageCandidates(image);
  const srcset = candidates.map((candidate) => `${candidate.url} ${candidate.width}w`).join(", ");
  const source = srcset ? `<source type="image/avif" srcset="${escapeHtml(srcset)}" sizes="${escapeHtml(sizes)}">` : "";
  return `<picture class="responsive-picture">${source}<img src="${escapeHtml(imageUrl(image))}"${srcset ? ` srcset="${escapeHtml(srcset)}" sizes="${escapeHtml(sizes)}"` : ""} alt="${escapeHtml(image.alt || alt)}"${Number(image.width) ? ` width="${Number(image.width)}"` : ""}${Number(image.height) ? ` height="${Number(image.height)}"` : ""} loading="${priority ? "eager" : loading}"${priority ? ' fetchpriority="high"' : ""} decoding="async"></picture>`;
};

const staticProductPicture = (product, { sizes = "100vw", loading = "lazy", priority = false } = {}) => {
  const handle = escapeHtml(product.handle);
  const assetHandle = staticAssetHandle(handle);
  const title = escapeHtml(displayTitle(product));
  return `<picture class="responsive-picture"><source type="image/avif" srcset="/assets/products/${assetHandle}-1-480.avif 480w, /assets/products/${assetHandle}-1-800.avif 800w" sizes="${escapeHtml(sizes)}"><img src="/assets/products/${assetHandle}-1.webp" alt="${title}" width="800" height="800" loading="${priority ? "eager" : loading}"${priority ? ' fetchpriority="high"' : ""} decoding="async"></picture>`;
};

const productPicture = (product, options = {}) => responsiveImage(product?.images?.[0], options) || staticProductPicture(product, options);

export function sanitizeHtml(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<\/?([a-z0-9]+)(\s[^>]*)?>/gi, (match, tag, attributes = "") => {
      const name = tag.toUpperCase();
      if (!ALLOWED_TAGS.has(name)) return "";
      if (match.startsWith("</")) return `</${tag.toLowerCase()}>`;
      if (name === "BR") return "<br>";
      if (name !== "A") return `<${tag.toLowerCase()}>`;
      const href = attributes.match(/href\s*=\s*["']([^"']+)["']/i)?.[1] || "";
      if (!/^(?:https:\/\/|mailto:|\/)/i.test(href)) return "<a>";
      return `<a href="${escapeHtml(href)}">`;
    });
}

const priceRange = (product, store, context) => {
  const prices = (product?.variants || []).map((variant) => Number(variant.price)).filter(Number.isFinite);
  if (!prices.length) return formatMoney(0, store?.currency, context);
  const minimum = Math.min(...prices);
  const maximum = Math.max(...prices);
  const shown = formatMoney(minimum, store?.currency, context);
  return minimum === maximum ? shown : `${message(context, "commerce_from")} ${shown}`;
};

export function matchRoute(pathname) {
  const path = pathname === "/index.html" ? "/" : pathname;
  if (path === "/sitemap.xml") return { type: "sitemap" };
  const product = path.match(/^\/products\/([^/]+)\/?$/);
  if (product) {
    const handle = product[1].replaceAll("_", "-");
    return { type: "product", handle, canonicalPath: `/products/${handle}/`, needsSlash: !path.endsWith("/") || handle !== product[1], valid: HANDLE.test(handle) };
  }
  const collection = path.match(/^\/collections\/([^/]+)\/?$/);
  if (collection) return { type: "collection", handle: collection[1], canonicalPath: `/collections/${collection[1]}/`, needsSlash: !path.endsWith("/"), valid: collection[1] === "all" || HANDLE.test(collection[1]) };
  return null;
}

const breadcrumbs = (items) => `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${items.map((item, index) => `<li>${index === items.length - 1 ? `<span aria-current="page">${escapeHtml(item.label)}</span>` : `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`}</li>`).join("")}</ol></nav>`;

const navCollections = (store) => (store?.collections || []).filter((collection) => ["addons", "g3-spare-repair-parts"].includes(collection.handle));

function chrome(store, active, canonicalPath, context) {
  const paths = staticPaths(context);
  const home = href(context, "/");
  const core = href(context, "/products/duofiller-core-g3/");
  const connections = href(context, "/collections/addons/");
  const parts = href(context, "/collections/g3-spare-repair-parts/");
  const languagePath = isNorwegian(context)
    ? `${canonicalPath}${marketQueryFor("en-NO", context.market)}`
    : `/nb${canonicalPath}${marketQueryFor("nb-NO", context.market)}`;
  const year = new Date().getFullYear();
  const legalFooter = renderCompactLegalFooter({
    owner: "Brewket AS",
    locale: context.locale,
    year,
    refundHref: href(context, paths.refund),
    privacyHref: href(context, paths.privacy),
    termsHref: href(context, paths.terms),
    className: "footer-bottom shell",
    labels: {
      label: message(context, "footer_legal_label"),
      poweredBy: message(context, "footer_powered_by"),
      refund: message(context, "footer_refund"),
      privacy: message(context, "footer_privacy"),
      terms: message(context, "footer_terms"),
    },
  });
  return {
    header: `<a class="skip-link" href="#main">${escapeHtml(message(context, "skip_to_content"))}</a><aside class="announcement" aria-label="${escapeHtml(message(context, "announcement_label"))}"><ul class="shell"><li>${escapeHtml(message(context, "announcement_norway"))}</li><li>${escapeHtml(message(context, "announcement_heads"))}</li><li>${escapeHtml(message(context, "announcement_support"))}</li></ul></aside><header class="site-header"><div class="header-inner shell"><a class="brand" href="${home}" aria-label="DuoFiller"><img src="/assets/duofiller-logo.webp" alt="DuoFiller — Can Easy" width="600" height="134"></a><nav class="main-nav" id="main-navigation" aria-label="${escapeHtml(message(context, "nav_label"))}" data-nav><a href="${core}"${active === "core" ? ' aria-current="page"' : ""}>${escapeHtml(message(context, "nav_core"))}</a><a href="${connections}"${active === "connections" ? ' aria-current="page"' : ""}>${escapeHtml(message(context, "nav_connections"))}</a><a href="${parts}"${active === "parts" ? ' aria-current="page"' : ""}>${escapeHtml(message(context, "nav_parts"))}</a><a href="${href(context, paths.support)}">${escapeHtml(message(context, "nav_support"))}</a><a href="${href(context, paths.contact)}">${escapeHtml(message(context, "nav_contact"))}</a></nav><div class="header-tools">${currencySwitcher(context)}<a class="language-switch" href="${escapeHtml(languagePath)}" hreflang="${isNorwegian(context) ? "en" : "nb"}">${escapeHtml(message(context, "language_switch"))}</a><a class="tool-link" href="${href(context, paths.search)}"><span class="tool-label">${escapeHtml(message(context, "nav_search"))}</span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg></a><a class="tool-link" href="${href(context, paths.cart)}"><span class="tool-label">${escapeHtml(message(context, "nav_cart"))}</span><span class="cart-count" data-cart-count>0</span></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-navigation" aria-label="${escapeHtml(message(context, "nav_menu_open"))}" data-nav-toggle><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg></button></div></div></header>`,
    footer: `<footer class="footer"><div class="footer-grid shell"><div class="footer-brand"><a href="${home}"><img src="/assets/duofiller-logo.webp" alt="DuoFiller" width="600" height="134" loading="lazy" decoding="async"></a><p>${escapeHtml(message(context, "footer_description"))}</p></div><div><h2>${escapeHtml(message(context, "footer_shop"))}</h2><nav><a href="${core}">${escapeHtml(message(context, "nav_core"))}</a><a href="${href(context, "/collections/all/")}">${escapeHtml(message(context, "footer_all_products"))}</a><a href="${parts}">${escapeHtml(message(context, "footer_g3_parts"))}</a></nav></div><div><h2>${escapeHtml(message(context, "footer_learn"))}</h2><nav><a href="${href(context, paths.support)}">${escapeHtml(message(context, "support_centre"))}</a><a href="https://docs.duofiller.com/english/specs/">${escapeHtml(message(context, "footer_manuals"))}</a><a href="${href(context, paths.contact)}">${escapeHtml(message(context, "nav_contact"))}</a></nav></div><div><h2>${escapeHtml(message(context, "footer_company"))}</h2><nav><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a><a href="${href(context, paths.shipping)}">${escapeHtml(message(context, "footer_shipping"))}</a></nav></div></div>${legalFooter}</footer><div class="toast" role="status" aria-live="polite" data-toast hidden></div>`,
  };
}

function documentHtml({ title, description, canonicalPath, active = "", body, store, context, ogType = "website", ogImage = `${SITE_ORIGIN}/assets/duofiller-social.webp`, robots = "" }) {
  const canonical = `${SITE_ORIGIN}${publicPath(context, canonicalPath)}`;
  const { header, footer } = chrome(store, active, canonicalPath, context);
  const english = `${SITE_ORIGIN}${canonicalPath}`;
  const norwegian = `${SITE_ORIGIN}/nb${canonicalPath}`;
  return `<!doctype html><html lang="${escapeHtml(context.locale)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="theme-color" content="#f7f5ef">${robots ? `<meta name="robots" content="${escapeHtml(robots)}">` : '<meta name="robots" content="noindex,nofollow">'}<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="${escapeHtml(canonical)}"><link rel="alternate" hreflang="en-NO" href="${escapeHtml(english)}"><link rel="alternate" hreflang="nb-NO" href="${escapeHtml(norwegian)}"><link rel="alternate" hreflang="x-default" href="${escapeHtml(english)}"><meta property="og:type" content="${escapeHtml(ogType)}"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:image" content="${escapeHtml(ogImage)}"><meta name="twitter:card" content="summary_large_image"><meta name="reai-api-base" content="${escapeHtml(publicPath(context, "/reai"))}"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/site.css"><script type="module" src="/assets/store.js"></script></head><body>${header}<noscript><p class="noscript">${escapeHtml(message(context, "noscript"))}</p></noscript><main id="main">${body}</main>${footer}</body></html>`;
}

function productCard(product, store, context) {
  const productHref = href(context, `/products/${product.handle}/`);
  return `<article class="product-card"><a class="product-card-media" href="${productHref}">${productPicture(product, { sizes: "(max-width:520px) 130px, (max-width:780px) 45vw, 23vw" })}</a><div class="product-card-body"><p>${escapeHtml(product.brand || "DuoFiller")}</p><h3><a href="${productHref}">${escapeHtml(displayTitle(product))}</a></h3><div class="product-card-price"><strong>${escapeHtml(priceRange(product, store, context))}</strong></div></div></article>`;
}

export function renderCollectionPage(store, handle, context) {
  const collection = handle === "all" ? null : collectionByHandle(store, handle);
  if (handle !== "all" && !collection) return renderNotFoundPage(store, context);
  const products = handle === "all"
    ? store.products || []
    : (collection.products || []).map((member) => productByHandle(store, member.handle) || member).filter(Boolean);
  const title = handle === "all" ? message(context, "commerce_all_products") : collection.title;
  const description = collection?.description || (isNorwegian(context) ? "Fylleutstyr, tilkoblinger og servicedeler fra Brewket." : "Filling equipment, connections and service parts from Brewket.");
  const count = `${products.length} ${message(context, products.length === 1 ? "commerce_product" : "commerce_products")}`;
  const active = handle === "addons" ? "connections" : handle.includes("repair-parts") ? "parts" : "";
  const body = `<header class="page-hero page-hero--compact"><div class="shell">${breadcrumbs([{ href: href(context, "/"), label: message(context, "nav_home") }, { label: title }])}<p class="eyebrow">${escapeHtml(count)}</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(stripHtml(description))}</p></div></header><section class="section section-white catalog-section"><div class="catalog-layout shell"><nav class="catalog-nav" aria-label="${escapeHtml(message(context, "footer_shop"))}"><h2>${escapeHtml(message(context, "footer_shop"))}</h2>${navCollections(store).map((item) => `<a href="${href(context, `/collections/${item.handle}/`)}"${item.handle === handle ? ' aria-current="page"' : ""}>${escapeHtml(item.title)}</a>`).join("")}<a href="${href(context, "/collections/all/")}"${handle === "all" ? ' aria-current="page"' : ""}>${escapeHtml(message(context, "commerce_all_products"))}</a></nav><div><div class="catalog-toolbar"><span>${escapeHtml(count)}</span><a href="${href(context, staticPaths(context).search)}">${escapeHtml(message(context, "nav_search"))} →</a></div><div class="product-grid" data-server-rendered="true">${products.map((product) => productCard(product, store, context)).join("")}</div></div></div></section>`;
  return documentHtml({ title: `${title} | DuoFiller`, description: stripHtml(collection?.seoDescription || description), canonicalPath: `/collections/${handle}/`, active, body, store, context });
}

const optionGroups = (variants) => {
  const names = [];
  for (const variant of variants || []) for (const option of variant.options || []) if (option.name && !names.includes(option.name)) names.push(option.name);
  return names;
};

function productOptions(product, availability, context) {
  const names = optionGroups(product.variants);
  if (!names.length || product.variants.length < 2) return "";
  const first = product.variants.find((variant) => availability[variant.id] === true) || product.variants[0];
  const selected = Object.fromEntries((first.options || []).map((option) => [option.name, option.value]));
  const groups = names.map((name) => {
    const values = [...new Set(product.variants.map((variant) => variant.options?.find((option) => option.name === name)?.value).filter(Boolean))];
    return `<fieldset class="option-group"><legend>${escapeHtml(name)}</legend><div class="option-pills">${values.map((value) => `<button type="button" data-option-name="${escapeHtml(name)}" data-option-value="${escapeHtml(value)}" aria-pressed="${selected[name] === value}">${escapeHtml(value)}</button>`).join("")}</div></fieldset>`;
  }).join("");
  const payload = product.variants.map((variant) => ({ id: variant.id, price: variant.price, options: variant.options || [], available: availability[variant.id] ?? null }));
  return `<div class="product-options" data-product-options>${groups}</div><script type="application/json" data-product-variant-map>${JSON.stringify(payload).replaceAll("<", "\\u003c")}</script>`;
}

export function renderProductPage(store, product, availability = {}, context) {
  const images = product.images || [];
  const firstVariant = product.variants?.find((variant) => availability[variant.id] === true) || product.variants?.[0];
  const available = (product.variants || []).some((variant) => availability[variant.id] !== false);
  const active = product.handle === "duofiller-core-g3" ? "core" : "";
  const title = displayTitle(product);
  const description = stripHtml(product.seoDescription || product.description || title).slice(0, 320);
  const mainImage = images.length ? responsiveImage(images[0], { alt: title, sizes: "(max-width:780px) 92vw, 54vw", priority: true }) : staticProductPicture(product, { sizes: "(max-width:780px) 92vw, 54vw", priority: true });
  const thumbs = images.length > 1 ? `<div class="product-thumbs" role="group">${images.map((image, index) => `<button class="product-thumb" type="button" data-gallery-index="${index}" aria-current="${index === 0}">${responsiveImage(image, { alt: "", sizes: "96px" })}</button>`).join("")}</div><script type="application/json" data-product-gallery>${JSON.stringify(images).replaceAll("<", "\\u003c")}</script>` : "";
  const related = (store.products || []).filter((item) => item.handle !== product.handle).slice(0, 4);
  const details = sanitizeHtml(product.description) || `<p>${escapeHtml(description)}</p>`;
  const fallbackImage = `/assets/products/${staticAssetHandle(product.handle)}-1.webp`;
  const body = `<section class="product-page"><div class="shell">${breadcrumbs([{ href: href(context, "/"), label: message(context, "nav_home") }, { href: href(context, "/collections/all/"), label: message(context, "commerce_all_products") }, { label: title }])}<div class="product-layout"><section class="product-gallery" aria-label="${escapeHtml(message(context, "commerce_product_information"))}"><div class="product-main" data-gallery-main>${mainImage}</div>${thumbs}</section><section class="product-info"><p class="eyebrow">${escapeHtml(product.brand || "DuoFiller")}</p><h1>${escapeHtml(title)}</h1><p class="price" data-product-price>${escapeHtml(formatMoney(firstVariant?.price || 0, store.currency, context))}</p><p class="tax-note">${escapeHtml(message(context, "commerce_shipping_note"))}</p><form class="product-form" data-product-form>${productOptions(product, availability, context)}<div class="buy-row"><div class="quantity"><button type="button" aria-label="−" data-quantity-minus>−</button><input type="number" min="1" max="20" value="1" inputmode="numeric" aria-label="${escapeHtml(message(context, "commerce_quantity"))}" data-quantity><button type="button" aria-label="+" data-quantity-plus>+</button></div><button class="add-button" type="button" data-add-to-cart data-id="${escapeHtml(product.id)}" data-title="${escapeHtml(title)}" data-price="${escapeHtml(firstVariant?.price || 0)}" data-currency="${escapeHtml(store.currency || "NOK")}" data-image="${escapeHtml(imageUrl(images[0], 320) || fallbackImage)}" data-handle="${escapeHtml(product.handle)}" data-variant="${escapeHtml(firstVariant?.id || "")}"${available ? "" : " disabled"}>${escapeHtml(message(context, available ? "commerce_add_to_cart" : "commerce_unavailable"))}</button></div></form><ul class="product-trust"><li>${escapeHtml(message(context, "commerce_ships_norway"))}</li><li>${escapeHtml(message(context, "commerce_manufacturer_support"))}</li><li>${escapeHtml(message(context, "commerce_serviceable"))}</li></ul></section></div></div></section><section class="section section-white"><div class="product-content shell"><div><p class="eyebrow">${escapeHtml(message(context, "commerce_product_information"))}</p><h2 class="headline">${escapeHtml(title)}</h2></div><div class="prose">${details}</div></div></section>${related.length ? `<section class="section"><div class="shell"><div class="section-head"><div><p class="eyebrow">DuoFiller</p><h2 class="headline">${escapeHtml(message(context, "commerce_related"))}</h2></div></div><div class="product-grid">${related.map((item) => productCard(item, store, context)).join("")}</div></div></section>` : ""}`;
  return documentHtml({ title: `${product.seoTitle || title} | DuoFiller`, description, canonicalPath: `/products/${product.handle}/`, active, body, store, context, ogType: "product", ogImage: imageUrl(images[0]) || `${SITE_ORIGIN}${fallbackImage}` });
}

function renderMessagePage(store, context, { title, heading, text, status, canonicalPath = "/" }) {
  const body = `<section class="page-hero"><div class="shell"><p class="eyebrow">${escapeHtml(status)}</p><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(text)}</p><div class="hero-actions"><a class="button button-primary" href="${href(context, "/")}">${escapeHtml(message(context, "nav_home"))}</a><a class="button button-secondary" href="${href(context, staticPaths(context).contact)}">${escapeHtml(message(context, "nav_contact"))}</a></div></div></section>`;
  return documentHtml({ title: `${title} | DuoFiller`, description: text, canonicalPath, body, store, context, robots: "noindex" });
}

export const renderNotFoundPage = (store, context, canonicalPath = "/") => renderMessagePage(store, context, { title: "404", heading: message(context, "commerce_not_found_title"), text: message(context, "commerce_not_found_text"), status: "404", canonicalPath });
export const renderUnavailablePage = (store, context, canonicalPath = "/") => renderMessagePage(store, context, { title: "503", heading: message(context, "commerce_unavailable_title"), text: message(context, "commerce_unavailable_text"), status: "503", canonicalPath });
export const renderHomePage = () => { throw new Error("The home page is rendered by Hugo"); };

export function renderSitemap(store, context) {
  const paths = staticPaths(context);
  const staticPages = ["/", paths.support, paths.contact, paths.search, paths.cart, paths.shipping, paths.privacy, paths.terms];
  const dynamicPages = [
    ...(store.products || []).map((product) => `/products/${product.handle}/`),
    ...(store.collections || []).map((collection) => `/collections/${collection.handle}/`),
    "/collections/all/",
  ];
  const urls = [...new Set([...staticPages, ...dynamicPages])];
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((pathname) => `<url><loc>${SITE_ORIGIN}${publicPath(context, pathname)}</loc></url>`).join("")}</urlset>`;
}
