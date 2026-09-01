export const SITE_ORIGIN = "https://kebabking-reai-preview.respiro.workers.dev";
export const HANDLE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const EDITORIAL_PATHS = [
  "/",
  "/handlekurv/",
  "/bestilling/fullfort/",
  "/kontakt/",
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

const priceRange = (variants = []) => {
  const prices = variants.map((variant) => Number(variant.price)).filter(Number.isFinite);
  if (!prices.length) return "Pris kommer";
  const minimum = Math.min(...prices);
  const maximum = Math.max(...prices);
  return minimum === maximum ? formatMoney(minimum) : `${formatMoney(minimum)} – ${formatMoney(maximum)}`;
};

const imageCandidates = (image) => {
  if (!image) return [];
  const candidates = [...(image.renditions || []), image]
    .filter((candidate) => candidate?.url && Number(candidate.width) > 0);
  const byWidth = new Map(candidates.map((candidate) => [Number(candidate.width), candidate]));
  return [...byWidth.values()].sort((left, right) => Number(left.width) - Number(right.width));
};

const imageUrl = (image, preferredWidth = 960) => {
  const candidates = imageCandidates(image);
  return candidates.find((candidate) => Number(candidate.width) >= preferredWidth)?.url
    || candidates.at(-1)?.url
    || image?.url
    || "";
};

const responsiveImage = (image, { alt = "", preferredWidth = 960, sizes = "100vw", loading = "lazy" } = {}) => {
  const src = imageUrl(image, preferredWidth);
  if (!src) return '<span class="image-fallback">KK</span>';
  const candidates = imageCandidates(image);
  const srcset = candidates.map((candidate) => `${candidate.url} ${candidate.width}w`).join(", ");
  const width = Number(image.width) > 0 ? ` width="${Number(image.width)}"` : "";
  const height = Number(image.height) > 0 ? ` height="${Number(image.height)}"` : "";
  return `<img src="${escapeHtml(src)}"${srcset ? ` srcset="${escapeHtml(srcset)}" sizes="${escapeHtml(sizes)}"` : ""} alt="${escapeHtml(alt)}"${width}${height} loading="${loading}" decoding="async">`;
};

const metaDescription = (value, fallback) => stripHtml(value || fallback).slice(0, 155) || fallback;

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

export const productByHandle = (store, handle) => (store?.products || [])
  .find((product) => product.handle === handle) || null;

export const collectionByHandle = (store, handle) => (store?.collections || [])
  .find((collection) => collection.handle === handle) || null;

const publishedCollections = (store) => (store?.collections || [])
  .filter((collection) => collection.handle !== "frontpage" && (collection.products || []).length > 0);

const collectionProducts = (store, collection) => {
  if (!collection) return store?.products || [];
  const byHandle = new Map((store?.products || []).map((product) => [product.handle, product]));
  return (collection.products || []).map((member) => byHandle.get(member.handle)).filter(Boolean);
};

const navMarkup = (store) => publishedCollections(store).slice(0, 5)
  .map((collection) => `<a href="/collections/${escapeHtml(collection.handle)}/">${escapeHtml(collection.title)}</a>`)
  .join("");

const header = (store) => `<a class="skip-link" href="#main">Hopp til innhold</a><header class="site-header"><div class="shell header-inner"><a class="brand" href="/"><span>Kebab</span> King</a><button class="menu-button" type="button" data-menu-button>Meny</button><nav class="main-nav" data-main-nav><a href="/">Hjem</a>${navMarkup(store)}<a href="/collections/all/">Hele menyen</a></nav><div class="header-actions"><a href="tel:+4747737469">Ring</a><a class="cart-link" href="/handlekurv/">Kurv <span data-cart-count>0</span></a></div></div></header>`;

const footer = () => `<footer class="site-footer"><div class="shell footer-grid"><div><a class="brand brand-footer" href="/"><span>Kebab</span> King</a><p>Turkish og Middle Eastern mat i Trondheim sentrum.</p></div><div><h2>Besøk oss</h2><p>Brattørgata 4<br>7010 Trondheim</p><a href="tel:+4747737469">+47 477 37 469</a></div><div><h2>Åpningstider</h2><p>Man–tor og søn: 14:00–23:00<br>Fre–lør: 14:00–03:30</p></div><div><h2>Snarveier</h2><a href="/collections/all/">Hele menyen</a><a href="/kontakt/">Kontakt og veibeskrivelse</a><a href="https://www.foodora.no/en/restaurant/mx9p/kebab-king-mx9p" rel="external">Foodora</a></div></div><div class="shell footer-bottom"><span>Kebab King Trondheim</span><a href="https://reai.no" rel="external">Drevet av ReAI</a></div></footer><div class="cart-toast" role="status" data-cart-toast hidden></div>`;

const documentHtml = ({ title, description, canonicalPath, body, store, schema = "", ogImage = "" }) => {
  const canonical = `${SITE_ORIGIN}${canonicalPath}`;
  return `<!doctype html><html lang="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="theme-color" content="#11100d"><link rel="canonical" href="${escapeHtml(canonical)}"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:type" content="website">${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}">` : ""}<link rel="stylesheet" href="/assets/store.css?v=1"><script type="module" src="/assets/store.js?v=1"></script>${schema}</head><body>${header(store)}<main id="main">${body}</main>${footer()}</body></html>`;
};

const productCard = (product) => {
  if (!product?.handle) return "";
  const image = product.images?.[0];
  return `<article class="product-card"><a class="product-card-image" href="/products/${escapeHtml(product.handle)}/">${responsiveImage(image, { alt: image?.alt || product.title, preferredWidth: 640, sizes: "(max-width: 720px) 46vw, 280px" })}</a><div class="product-card-copy"><p>${escapeHtml(product.brand || "Kebab King")}</p><h3><a href="/products/${escapeHtml(product.handle)}/">${escapeHtml(product.title)}</a></h3><strong>${priceRange(product.variants)}</strong></div></article>`;
};

const productGrid = (products) => {
  const cards = (products || []).map(productCard).filter(Boolean);
  return cards.length
    ? `<div class="product-grid" data-collection-grid>${cards.join("")}</div>`
    : '<div class="empty-state"><h2>Menyen klargjøres</h2><p>Produktene publiseres fra ReAI når menyen er godkjent.</p></div>';
};

export function renderHomePage(store) {
  const products = (store?.products || []).slice(0, 8);
  const collections = publishedCollections(store).slice(0, 6);
  const collectionCards = collections.map((collection) => {
    const productsInCollection = collectionProducts(store, collection);
    const image = productByHandle(store, collection.products?.[0]?.handle)?.images?.[0];
    return `<a class="collection-card" href="/collections/${escapeHtml(collection.handle)}/">${responsiveImage(image, { alt: image?.alt || collection.title, preferredWidth: 960, sizes: "(max-width: 760px) 100vw, 33vw" })}<span><small>Utforsk</small><strong>${escapeHtml(collection.title)}</strong></span></a>`;
  }).join("");
  const body = `<section class="hero"><div class="shell hero-grid"><div><p class="eyebrow">TRONDHEIM SENTRUM</p><h1>Stor smak.<br>Rett fra grillen.</h1><p>Utforsk menyen, velg favorittene dine og gå videre til en trygg kasse hos ReAI.</p><div class="button-row"><a class="button" href="/collections/all/">Se hele menyen</a><a class="text-link" href="tel:+4747737469">Ring +47 477 37 469</a></div></div><aside><span>Åpent til</span><strong>23:00</strong><small>Fredag og lørdag til 03:30</small></aside></div></section>${collections.length ? `<section class="section shell"><div class="section-heading"><p class="eyebrow">KATEGORIER</p><h2>Finn det du har lyst på.</h2></div><div class="collection-grid">${collectionCards}</div></section>` : ""}<section class="section section-dark"><div class="shell"><div class="section-heading"><p class="eyebrow">FRA MENYEN</p><h2>Bestill når du er klar.</h2></div>${productGrid(products)}</div></section><section class="location-band"><div class="shell location-grid"><div><p class="eyebrow">FINN OSS</p><h2>Brattørgata 4</h2><p>7010 Trondheim</p></div><div><p>Man–tor og søn: 14:00–23:00<br>Fre–lør: 14:00–03:30</p><a class="button button-light" href="/kontakt/">Kontakt og veibeskrivelse</a></div></div></section>`;
  return documentHtml({
    title: "Kebab King Trondheim | Meny og bestilling",
    description: "Utforsk menyen til Kebab King i Brattørgata, Trondheim.",
    canonicalPath: "/",
    body,
    store,
  });
}

export function renderCollectionPage(store, handle) {
  const collection = handle === "all" ? null : collectionByHandle(store, handle);
  const products = collectionProducts(store, collection);
  const title = collection?.title || "Hele menyen";
  const description = metaDescription(collection?.seoDescription || collection?.description, `Se ${title.toLocaleLowerCase("nb-NO")} hos Kebab King Trondheim.`);
  const body = `<section class="page-hero"><div class="shell"><p class="eyebrow">MENY</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div></section><section class="section shell">${productGrid(products)}</section>`;
  return documentHtml({
    title: `${title} | Kebab King Trondheim`,
    description,
    canonicalPath: `/collections/${handle}/`,
    body,
    store,
  });
}

export function renderProductPage(store, product, availability = {}) {
  const variants = product.variants || [];
  const firstAvailable = variants.find((variant) => availability[variant.id] === true) || variants[0];
  const image = product.images?.[0];
  const gallery = (product.images || []).map((item, index) => `<button type="button" data-gallery-image="${escapeHtml(imageUrl(item, 1200))}" data-gallery-alt="${escapeHtml(item.alt || `${product.title} produktbilde ${index + 1}`)}">${responsiveImage(item, { alt: "", preferredWidth: 320, sizes: "84px" })}</button>`).join("");
  const options = variants.length > 1
    ? `<label class="variant-field">Velg variant<select data-product-variant>${variants.map((variant) => {
        const label = variant.options?.map((option) => option.value).filter(Boolean).join(" / ") || product.title;
        const available = availability[variant.id] === true;
        return `<option value="${escapeHtml(variant.id)}" data-price="${escapeHtml(variant.price)}" data-available="${available}"${variant.id === firstAvailable?.id ? " selected" : ""}>${escapeHtml(label)} · ${formatMoney(variant.price)}${available ? "" : " · Utsolgt"}</option>`;
      }).join("")}</select></label>`
    : "";
  const available = firstAvailable && availability[firstAvailable.id] === true;
  const description = metaDescription(product.seoDescription || product.description, product.title);
  const schema = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: stripHtml(product.description || description),
    image: (product.images || []).map((item) => item.url),
    brand: { "@type": "Brand", name: product.brand || "Kebab King" },
    offers: variants.map((variant) => ({
      "@type": "Offer",
      priceCurrency: "NOK",
      price: String(variant.price),
      availability: availability[variant.id] === true ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE_ORIGIN}/products/${product.handle}/`,
    })),
  }).replaceAll("<", "\\u003c")}</script>`;
  const body = `<section class="product-page"><div class="shell product-layout"><div class="product-media"><div class="main-product-image">${responsiveImage(image, { alt: image?.alt || product.title, preferredWidth: 1200, sizes: "(max-width: 800px) 100vw, 55vw", loading: "eager" })}</div>${gallery ? `<div class="product-gallery">${gallery}</div>` : ""}</div><div class="product-info"><p class="eyebrow">${escapeHtml(product.brand || "KEBAB KING")}</p><h1>${escapeHtml(product.title)}</h1><p class="product-price" data-product-price>${priceRange(variants)}</p><form data-product-form>${options}<label class="quantity-field">Antall<input type="number" min="1" max="20" value="1" inputmode="numeric" data-quantity></label><button class="button product-button" type="button" data-add-to-cart data-id="${escapeHtml(product.id)}" data-title="${escapeHtml(product.title)}" data-handle="${escapeHtml(product.handle)}" data-image="${escapeHtml(imageUrl(image, 480))}" data-variant="${escapeHtml(firstAvailable?.id || "")}" data-price="${escapeHtml(firstAvailable?.price || "")}" data-available="${available}"${available ? "" : " disabled"}>${available ? "Legg i handlekurven" : "Utsolgt"}</button></form><div class="product-description">${product.description ? `<p>${escapeHtml(stripHtml(product.description))}</p>` : ""}</div></div></div></section>`;
  return documentHtml({
    title: `${product.seoTitle || product.title} | Kebab King Trondheim`,
    description,
    canonicalPath: `/products/${product.handle}/`,
    body,
    store,
    schema,
    ogImage: image?.url || "",
  });
}

const messagePage = (store, title, heading, text, canonicalPath) => documentHtml({
  title,
  description: text,
  canonicalPath,
  store,
  body: `<section class="page-hero message-page"><div class="shell"><p class="eyebrow">KEBAB KING</p><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(text)}</p><a class="button" href="/">Til forsiden</a></div></section>`,
});

export const renderNotFoundPage = (store, _context, canonicalPath = "/404.html") => messagePage(
  store,
  "Fant ikke siden | Kebab King Trondheim",
  "Her var det tomt.",
  "Siden finnes ikke eller har fått en ny adresse.",
  canonicalPath,
);

export const renderUnavailablePage = (store, _context, canonicalPath = "/") => messagePage(
  store,
  "Midlertidig utilgjengelig | Kebab King Trondheim",
  "Menyen tar en kort pause.",
  "Vi får ikke hentet menyen akkurat nå. Prøv igjen om litt.",
  canonicalPath,
);

export function renderSitemap(store) {
  const paths = [
    ...EDITORIAL_PATHS,
    "/collections/all/",
    ...publishedCollections(store).map((collection) => `/collections/${collection.handle}/`),
    ...(store?.products || []).map((product) => `/products/${product.handle}/`),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(paths)].map((path) => `  <url><loc>${SITE_ORIGIN}${path}</loc></url>`).join("\n")}\n</urlset>\n`;
}
