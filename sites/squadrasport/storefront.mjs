import { renderCompactLegalFooter } from "../../packages/reai-cloudflare-storefront/footer.mjs";

export const SITE_ORIGIN = "https://squadrasport.no";
export const HANDLE = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;

const NAVIGATION = [
  ["fotball", "Fotball"],
  ["volleyball", "Volleyball"],
  ["handball", "Håndball"],
  ["basketball", "Basketball"],
  ["innebandy", "Innebandy"],
  ["baller", "Baller"],
  ["trening", "Trening"],
  ["friidrett-overdel", "Friidrett"],
  ["medisinsk", "Medisinsk"],
  ["utstyr", "Utstyr"],
  ["fornebu", "Fornebu"],
];

export const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const plainText = (value = "") => String(value)
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]*>/g, " ")
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/\s+/g, " ")
  .trim();

const productDescription = (value = "") => plainText(value)
  .split(/(?<=[.!?])\s+/)
  .filter((sentence) => !/(?:rabatt|pakkepris)/i.test(sentence))
  .join(" ");

const money = (value) => new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
}).format(Number(value));

const imageCandidates = (image) => {
  if (!image) return [];
  const candidates = [...(image.renditions || []), image]
    .filter((candidate) => candidate?.url && Number(candidate.width) > 0);
  return [...new Map(candidates.map((candidate) => [Number(candidate.width), candidate])).values()]
    .sort((left, right) => Number(left.width) - Number(right.width));
};

const imageUrl = (image, preferredWidth = 960) => {
  const candidates = imageCandidates(image);
  return candidates.find((candidate) => Number(candidate.width) >= preferredWidth)?.url
    || candidates.at(-1)?.url
    || image?.url
    || "";
};

const productImage = (product) => product?.images?.[0] || null;

const responsiveImage = (image, { alt = "", sizes = "100vw", width = 960, eager = false, main = false } = {}) => {
  const src = imageUrl(image, width);
  if (!src) return "";
  const srcset = imageCandidates(image).map((candidate) => `${candidate.url} ${candidate.width}w`).join(", ");
  return `<img src="${escapeHtml(src)}"${srcset ? ` srcset="${escapeHtml(srcset)}" sizes="${escapeHtml(sizes)}"` : ""} alt="${escapeHtml(alt)}"${Number(image.width) > 0 ? ` width="${Number(image.width)}"` : ""}${Number(image.height) > 0 ? ` height="${Number(image.height)}"` : ""} loading="${eager ? "eager" : "lazy"}"${eager ? ' fetchpriority="high"' : ""}${main ? " data-main-product-image" : ""} decoding="async">`;
};

export function matchRoute(pathname) {
  const path = pathname === "/index.html" ? "/" : pathname;
  if (path === "/") return { type: "home" };
  if (path === "/sitemap.xml") return { type: "sitemap" };
  for (const [prefix, type] of [["products", "product"], ["collections", "collection"]]) {
    const match = path.match(new RegExp(`^/${prefix}/([^/]+)/?$`));
    if (match) return {
      type,
      handle: match[1],
      canonicalPath: `/${prefix}/${match[1]}`,
      needsSlash: path.endsWith("/"),
      valid: HANDLE.test(match[1]),
    };
  }
  return null;
}

export const productByHandle = (store, handle) => (store?.products || [])
  .find((product) => product.handle === handle) || null;

export const collectionByHandle = (store, handle) => (store?.collections || [])
  .find((collection) => collection.handle === handle) || null;

const productCard = (product) => {
  if (!product?.handle) return "";
  const image = productImage(product);
  const prices = (product.variants || []).map((variant) => Number(variant.price))
    .filter((price) => Number.isFinite(price));
  const price = prices.length ? money(Math.min(...prices)) : "";
  return `<article class="product-card"><a class="product-card-image" href="/products/${escapeHtml(product.handle)}">${image ? responsiveImage(image, { alt: image.alt || product.title, sizes: "(max-width: 700px) 45vw, 23vw", width: 480 }) : '<span class="image-placeholder">SQUADRA</span>'}</a><div class="product-card-copy"><p>${escapeHtml(product.brand || "Squadra Sport")}</p><h3><a href="/products/${escapeHtml(product.handle)}">${escapeHtml(product.title || product.handle)}</a></h3>${price ? `<strong>${price}</strong>` : ""}</div></article>`;
};

const productGrid = (products) => {
  const cards = products.map(productCard).filter(Boolean);
  return cards.length
    ? `<div class="product-grid">${cards.join("")}</div>`
    : '<div class="empty-state"><h2>Produkter kommer snart</h2><p>Utvalget vises her når det er publisert.</p></div>';
};

const navigation = (store) => {
  const known = store ? new Set((store.collections || []).map((collection) => collection.handle)) : null;
  return NAVIGATION.filter(([handle]) => !known || known.has(handle))
    .map(([handle, label]) => `<a href="/collections/${handle}">${label}</a>`).join("");
};

const header = (store) => `<a class="skip-link" href="#main">Hopp til innhold</a><header class="site-header"><div class="header-inner"><a class="brand" href="/" aria-label="Squadra Sport, forside"><img src="/assets/logo.png" alt="Squadra Sport" width="128" height="52"></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav" data-menu-toggle>Meny</button><nav id="main-nav" aria-label="Hovedmeny" data-main-nav>${navigation(store)}<a href="/collections/all">Alle produkter</a><a href="/pages/contact">Kontakt</a></nav><div class="header-tools"><a href="/search" aria-label="Søk">Søk</a><a href="/cart" aria-label="Handlekurv">Kurv <span data-cart-count>0</span></a></div></div></header>`;

const footer = () => `<footer class="site-footer"><div class="footer-inner"><div><a class="footer-brand" href="/">SQUADRA SPORT</a><p>Sport og lagutstyr.</p></div><div><h2>Handle</h2><a href="/collections/all">Alle produkter</a><a href="/search">Søk</a><a href="/cart">Handlekurv</a></div><div><h2>Informasjon</h2><a href="/pages/contact">Kontakt</a><a href="/pages/terms">Kjøpsvilkår</a><a href="/policies/refund-policy">Retur</a><a href="/policies/privacy-policy">Personvern</a></div></div>${renderCompactLegalFooter({ owner: "Squadra Sport AS", locale: "nb-NO", privacyHref: "/policies/privacy-policy", refundHref: "/policies/refund-policy", termsHref: "/pages/terms", className: "legal-footer" })}</footer><div class="cart-toast" data-cart-toast role="status" aria-live="polite" hidden></div>`;

export function documentHtml({ title, description, path, body, store = null }) {
  const canonical = `${SITE_ORIGIN}${path}`;
  return `<!doctype html><html lang="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#ffffff"><meta name="robots" content="noindex,nofollow"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="${escapeHtml(canonical)}"><link rel="icon" href="/assets/logo.png" type="image/png"><link rel="stylesheet" href="/assets/site.css?v=4"><script type="module" src="/assets/site.js?v=4"></script></head><body>${header(store)}<noscript><p class="noscript">JavaScript må være aktivert for handlekurv og kasse.</p></noscript><main id="main">${body}</main>${footer()}</body></html>`;
}

const breadcrumbs = (items) => `<nav class="breadcrumbs" aria-label="Brødsmulesti"><ol>${items.map((item, index) => `<li>${index === items.length - 1 ? `<span aria-current="page">${escapeHtml(item.label)}</span>` : `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`}</li>`).join("")}</ol></nav>`;

export function renderHomePage(store) {
  const products = (store?.products || []).slice(0, 8);
  const categories = NAVIGATION.slice(0, 5)
    .map(([handle, label]) => collectionByHandle(store, handle) && `<a href="/collections/${handle}">${label}<span>Se utvalget ↗</span></a>`)
    .filter(Boolean).join("");
  const body = `<section class="home-hero"><div class="hero-images"><img src="/assets/hero-volleyball.jpg" alt="Volleyballspillere på banen" width="1600" height="1067" fetchpriority="high"><img src="/assets/hero-volleyball-player.jpg" alt="Volleyballspiller i drakt" width="1125" height="1687"></div><div class="hero-shade"></div><div class="hero-copy"><p>Squadra Sport</p><h1>Utstyr for laget.</h1><a class="button button-light" href="/collections/all">Se alle produkter</a></div></section><section class="section"><div class="section-heading"><div><p class="eyebrow">Fra butikken</p><h2>Finn utstyret ditt</h2></div><a href="/collections/all">Hele utvalget ↗</a></div>${categories ? `<div class="category-links">${categories}</div>` : ""}${productGrid(products)}</section><section class="sports-band"><p>Fotball · Volleyball · Håndball · Basketball · Innebandy</p><h2>For trening, kamp og lag.</h2><a class="button" href="/pages/contact">Kontakt oss</a></section>`;
  return documentHtml({ title: "Squadra Sport | Sport og lagutstyr", description: "Sportsklær og utstyr for laget fra Squadra Sport.", path: "/", body, store });
}

export function renderCollectionPage(store, handle) {
  const collection = handle === "all" ? null : collectionByHandle(store, handle);
  const title = collection?.title || "Alle produkter";
  const products = handle === "all" ? (store?.products || []) : (collection?.products || [])
    .map((member) => productByHandle(store, member.handle) || member);
  const description = plainText(collection?.seoDescription || collection?.description || "Utforsk utvalget hos Squadra Sport.");
  const body = `<section class="page-heading"><div class="content-width">${breadcrumbs([{ label: "Hjem", href: "/" }, { label: title }])}<p class="eyebrow">${products.length} produkter</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div></section><section class="section"><div class="section-heading"><h2>Produkter</h2><a href="/search">Søk i butikken ↗</a></div>${productGrid(products)}</section>`;
  return documentHtml({ title: `${title} | Squadra Sport`, description, path: `/collections/${handle}`, body, store });
}

export function renderProductPage(store, product, availability = {}) {
  const images = product.images || [];
  const variants = product.variants || [];
  const first = variants.find((variant) => availability[variant.id] === true) || variants[0];
  const available = first ? availability[first.id] === true : false;
  const optionNames = [...new Set(variants.flatMap((variant) => (variant.options || []).map((option) => option.name)))];
  const image = images[0];
  const galleryNavigation = images.length > 1
    ? `<button class="gallery-control gallery-prev" type="button" data-gallery-step="-1" aria-label="Forrige bilde"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5 8 12 15 19"></path></svg></button><button class="gallery-control gallery-next" type="button" data-gallery-step="1" aria-label="Neste bilde"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5 16 12 9 19"></path></svg></button><span class="gallery-count" data-gallery-count aria-live="polite">1 / ${images.length}</span>`
    : "";
  const thumbnailStrip = images.length > 1
    ? `<div class="image-thumbnails">${images.map((item, index) => `<button type="button" data-image-src="${escapeHtml(imageUrl(item))}" data-image-alt="${escapeHtml(item.alt || product.title)}" aria-label="Vis produktbilde ${index + 1}" aria-pressed="${index === 0}">${responsiveImage(item, { alt: "", sizes: "90px", width: 320 })}</button>`).join("")}</div>`
    : "";
  const gallery = images.length
    ? `<div class="product-gallery" data-product-gallery><div class="main-image" role="group" aria-label="Produktbilder"${images.length > 1 ? ' tabindex="0"' : ""}>${responsiveImage(image, { alt: image.alt || product.title, sizes: "(max-width: 800px) 95vw, 48vw", eager: true, main: true })}${galleryNavigation}</div>${thumbnailStrip}</div>`
    : '<div class="main-image"><span class="image-placeholder">SQUADRA</span></div>';
  const variantOptions = variants.length > 1 ? `${optionNames.map((name) => {
    const values = [...new Set(variants.flatMap((variant) => (variant.options || []).filter((option) => option.name === name).map((option) => option.value)))];
    const selected = first?.options?.find((option) => option.name === name)?.value;
    return `<label class="variant-label">${escapeHtml(name)}<select data-option-select data-option-name="${escapeHtml(name)}">${values.map((value) => `<option value="${escapeHtml(value)}"${value === selected ? " selected" : ""}>${escapeHtml(value)}</option>`).join("")}</select></label>`;
  }).join("")}<select data-variant-select${optionNames.length ? " hidden aria-hidden=\"true\" tabindex=\"-1\"" : ""} aria-label="Variant">${variants.map((variant) => `<option value="${escapeHtml(variant.id)}" data-price="${escapeHtml(variant.price)}" data-available="${availability[variant.id] === true}" data-options="${escapeHtml(JSON.stringify(Object.fromEntries((variant.options || []).map((entry) => [entry.name, entry.value]))))}"${variant.id === first?.id ? " selected" : ""}>${escapeHtml(variant.options?.map((entry) => entry.value).join(" / ") || product.title)} · ${money(variant.price)}${availability[variant.id] === true ? "" : " · Ikke tilgjengelig"}</option>`).join("")}</select>` : "";
  const colorImageNote = images.length > 0 && optionNames.some((name) => name.toLowerCase() === "farge")
    ? '<p class="product-note">Bildene kan vise en annen farge enn den du har valgt.</p>'
    : "";
  const description = productDescription(product.description || product.seoDescription || "");
  const body = `<section class="product-page"><div class="content-width">${breadcrumbs([{ label: "Hjem", href: "/" }, { label: "Produkter", href: "/collections/all" }, { label: product.title }])}<div class="product-layout">${gallery}<div class="product-details"><p class="eyebrow">${escapeHtml(product.brand || "Squadra Sport")}</p><h1>${escapeHtml(product.title)}</h1><p class="product-price" data-product-price>${first ? money(first.price) : ""}</p><p class="product-note">Frakt beregnes i kassen.</p><div class="product-form">${variantOptions}${colorImageNote}<label class="quantity-label">Antall<input type="number" min="1" max="20" value="1" inputmode="numeric" data-quantity></label><button class="button" type="button" data-add-to-cart data-id="${escapeHtml(product.id)}" data-handle="${escapeHtml(product.handle)}" data-title="${escapeHtml(product.title)}" data-image="${escapeHtml(imageUrl(image, 480))}" data-variant="${escapeHtml(first?.id || "")}" data-price="${escapeHtml(first?.price || "")}" data-available="${available}"${available ? "" : " disabled"}>${available ? "Legg i handlekurv" : "Ikke tilgjengelig"}</button></div>${description ? `<div class="description"><h2>Om produktet</h2><p>${escapeHtml(description)}</p></div>` : ""}</div></div></div></section>`;
  return documentHtml({ title: `${product.seoTitle || product.title} | Squadra Sport`, description: productDescription(product.seoDescription || description || product.title).slice(0, 155), path: `/products/${product.handle}`, body, store });
}

export const renderNotFoundPage = (store) => documentHtml({
  title: "Siden finnes ikke | Squadra Sport",
  description: "Siden finnes ikke.",
  path: "/404",
  body: '<section class="message-page"><div class="content-width"><p class="eyebrow">404</p><h1>Vi finner ikke siden.</h1><p>Prøv å søke etter produktet eller gå til forsiden.</p><a class="button" href="/">Til forsiden</a></div></section>',
  store,
});

export const renderUnavailablePage = (store) => documentHtml({
  title: "Midlertidig utilgjengelig | Squadra Sport",
  description: "Produktutvalget er midlertidig utilgjengelig.",
  path: "/",
  body: '<section class="message-page"><div class="content-width"><h1>Vi får ikke vist utvalget akkurat nå.</h1><p>Prøv igjen om litt.</p><a class="button" href="/">Til forsiden</a></div></section>',
  store,
});

export function renderSitemap(store) {
  const paths = ["/", "/pages/contact", "/collections/all",
    ...(store?.collections || []).map((collection) => `/collections/${collection.handle}`),
    ...(store?.products || []).map((product) => `/products/${product.handle}`)];
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...new Set(paths)].map((path) => `<url><loc>${SITE_ORIGIN}${path}</loc></url>`).join("")}</urlset>`;
}

export function renderStaticPage(kind) {
  const content = {
    cart: {
      title: "Handlekurv", path: "/cart",
      body: '<section class="page-heading"><div class="content-width"><h1>Handlekurv</h1></div></section><section class="section cart-layout" data-cart-root><div data-cart-items></div><aside class="cart-summary"><h2>Din bestilling</h2><p>Delsum <strong data-cart-subtotal>0 kr</strong></p><p>Frakt beregnes i kassen.</p><p class="error" data-checkout-error role="alert" hidden></p><button class="button" type="button" data-checkout-start disabled>Gå til kassen</button><a href="/collections/all">Fortsett å handle</a></aside></section>',
    },
    search: {
      title: "Søk", path: "/search",
      body: '<section class="page-heading"><div class="content-width"><h1>Søk i butikken</h1><form data-search-form role="search"><label for="search-query">Produkt eller kategori</label><div class="search-controls"><input id="search-query" type="search" name="q" autocomplete="off" data-search-query><button class="button" type="submit">Søk</button></div></form></div></section><section class="section"><p data-search-status>Skriv inn minst to tegn.</p><div class="product-grid" data-search-results></div></section>',
    },
    contact: {
      title: "Kontakt", path: "/pages/contact",
      body: '<section class="page-heading"><div class="content-width"><p class="eyebrow">Vi hjelper deg</p><h1>Kontakt</h1></div></section><section class="section contact-details"><h2>Squadra Sport AS</h2><p>Stasjonsveien 10<br>1365 Blommenholm</p><p><a href="tel:+4799003500">9900 3500</a><br><a href="mailto:info@squadrasport.no">info@squadrasport.no</a></p></section>',
    },
    complete: {
      title: "Takk for bestillingen", path: "/order/complete",
      body: '<section class="message-page" data-order-complete><div class="content-width"><p class="eyebrow">Bestilling</p><h1>Takk for handelen.</h1><p>Du får en bekreftelse på e-post når bestillingen er registrert.</p><a class="button" href="/collections/all">Fortsett å handle</a></div></section>',
    },
    privacy: {
      title: "Personvern", path: "/policies/privacy-policy",
      body: '<section class="message-page"><div class="content-width"><h1>Personvern</h1><p>Oppdatert personvernerklæring publiseres før den nye butikken åpner. Kontakt <a href="mailto:info@squadrasport.no">info@squadrasport.no</a> ved spørsmål.</p></div></section>',
    },
    refund: {
      title: "Retur", path: "/policies/refund-policy",
      body: '<section class="message-page"><div class="content-width"><h1>Retur</h1><p>Returvilkår publiseres før den nye butikken åpner. Kontakt <a href="mailto:info@squadrasport.no">info@squadrasport.no</a> ved spørsmål.</p></div></section>',
    },
    terms: {
      title: "Kjøpsvilkår", path: "/pages/terms",
      body: '<section class="message-page"><div class="content-width"><h1>Kjøpsvilkår</h1><p>Kjøpsvilkår publiseres før den nye butikken åpner. Kontakt <a href="mailto:info@squadrasport.no">info@squadrasport.no</a> ved spørsmål.</p></div></section>',
    },
  }[kind];
  if (!content) throw new RangeError(`Unknown static page: ${kind}`);
  return documentHtml({ title: `${content.title} | Squadra Sport`, description: content.title, path: content.path, body: content.body });
}
