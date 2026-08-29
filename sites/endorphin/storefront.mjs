import { renderCompactLegalFooter } from "../../packages/reai-cloudflare-storefront/footer.mjs";

export const SITE_ORIGIN = "https://endorphin.no";
export const HANDLE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const CONTACT_EMAIL = "post@famme.no";
export const STORE_SCRIPT = "/assets/store.js?v=13";
export const STORE_STYLE = "/assets/store.css?v=11";
export const SHIPPING_THRESHOLD = 899;

export const OPTION_LABELS = {
  Color: "Farge",
  Size: "Størrelse",
  "Shoe size": "Størrelse",
};

export const OPTION_VALUE_LABELS = {
  White: "Hvit",
  Black: "Sort",
  Hvit: "Hvit",
  Svart: "Sort",
  Beige: "Beige",
  Blå: "Blå",
  Blue: "Blå",
  "Mørk Grå": "Mørk grå",
  "Triple Black": "Triple Black",
  "White/Blue": "Hvit / Blå",
  "Black/White": "Sort / Hvit",
  "Beige / Green": "Beige / Grønn",
  "White / Mauve": "Hvit / Mauve",
};

export const PRODUCT_TITLES = {
  "endorphin-rx1-shoes": "Endorphin RX1",
  "endorphin-rx2-shoes": "Endorphin RX2",
  "airstep-shoes": "AirStep",
  "90s-trainers": "90S Trainers",
  "hvite-tennis-sokker": "Sky Knit tennissokker",
  "3-pack-sky-knit-socks": "Sky Knit sokker 3-pack",
};

export const PRODUCT_PROOF = {
  "endorphin-rx2-shoes": {
    rating: 4.8,
    count: 237,
    sourceUrl: "https://famme.no/products/endorphin-rx2-shoes",
    lifestyle: {
      src: "/assets/lifestyle/rx2-city.webp",
      alt: "Løper som knyter hvite Endorphin RX2 utendørs",
      kicker: "RX2 · Responsiv demping",
      title: "For løpeturen — og resten av dagen.",
      text: "RX2 kombinerer en lett overdel med en responsiv såle som gir en myk, stabil følelse gjennom hele steget.",
    },
    reviews: [
      { author: "Lærke", date: "19.03.2026", text: "Lette sko med skikkelig god respons." },
      { author: "Tiril", date: "13.02.2026", text: "Har to par og de er utrolig komfortable. Perfekte når man går og står mye på harde gulv." },
      { author: "Frida", date: "24.01.2026", text: "Veldig gode på lange turer, også på asfalt. Fikk ikke vonde føtter, anbefales!" },
    ],
  },
  "endorphin-rx1-shoes": {
    rating: 4.9,
    count: 73,
    sourceUrl: "https://famme.no/products/endorphin-rx1-shoes",
    lifestyle: {
      src: "/assets/lifestyle/rx1-white.webp",
      alt: "Kvinne i sort treningstøy med hvite Endorphin RX1",
      kicker: "RX1 · Myk og stabil",
      title: "Demping som varer hele dagen.",
      text: "RX1 er laget for deg som vil ha en lett sko med tydelig demping — på løpetur, på jobb og på farten.",
    },
    reviews: [
      { author: "Stine", date: "26.06.2023", text: "Beste skoene jeg har gått med! Sverger til disse på jobb og fritid! En drøm å gå i for beina." },
      { author: "Amanda Berglund", date: "18.05.2023", text: "Desidert de beste joggeskoene jeg har hatt. Lette og stødige med kjempegod demping." },
      { author: "Trude", date: "29.06.2023", text: "Dempingen i hælen er av en annen verden!" },
    ],
  },
  "airstep-shoes": {
    rating: 4.9,
    count: 83,
    sourceUrl: "https://famme.no/products/airstep-shoes",
    lifestyle: {
      src: "/assets/lifestyle/airstep-white.webp",
      alt: "Hvite AirStep-sko som knytes før en løpetur",
      kicker: "AirStep · Lett komfort",
      title: "Lett på foten. Klar for lange dager.",
      text: "AirStep har en myk og avlastende såle, luftig overdel og en stabil plattform for hverdager med mange skritt.",
    },
    reviews: [
      { author: "Kristine", date: "04.06.2026", text: "Det merkes at de er laget for å være komfortable. Enkle å bruke lenge uten å bli sliten i føttene." },
      { author: "Nora", date: "14.10.2025", text: "Behagelige, lette og veldig anvendelige sko." },
      { author: "Sofie", date: "12.09.2025", text: "AirStep er blitt mine favoritter, perfekte til både jobb og løpeturer." },
    ],
  },
  "90s-trainers": {
    rating: 4.7,
    count: 29,
    sourceUrl: "https://famme.no/products/90s-trainers",
    lifestyle: {
      src: "/assets/lifestyle/90s-lifestyle.webp",
      alt: "Hvite 90S Trainers stylet med sorte tights og hvite sokker",
      kicker: "90S Trainers · Retro komfort",
      title: "En klassiker, gjort mykere.",
      text: "90S Trainers gir retro silhuett, god støtte og en dempet såle i en sko som fungerer like godt til jobb som til hverdags.",
    },
    reviews: [
      { author: "Martine F.", date: "18.09.2024", text: "Disse skoene er mine nye favoritter. Jeg bruker dem til trening og på jobb. Superkomfortable og gode å gå i hele dagen." },
      { author: "Liv K.", date: "10.09.2024", text: "Disse skoene er perfekte for lange dager på jobb. De er så komfortable, og jeg kjenner ikke at jeg har dem på etter flere timer." },
      { author: "Synne", date: "18.08.2024", text: "Helt fantastiske sko, sitter godt på foten og er veldig komfortable å gå med." },
    ],
  },
};

export const optionValueLabel = (value = "") => OPTION_VALUE_LABELS[value] || value;
export const displayTitle = (product) => PRODUCT_TITLES[product?.handle] || String(product?.title || "").replace(/ Shoes$/i, "");
export const displayBrand = () => "Endorphin";

export const COLOR_SWATCHES = {
  White: "#f3efe6",
  Hvit: "#f3efe6",
  Black: "#161616",
  Svart: "#161616",
  Beige: "#d7c4a3",
  Blå: "#4e6f9c",
  Blue: "#4e6f9c",
  Green: "#7a8f4a",
  Grønn: "#7a8f4a",
  Mauve: "#c9a0b4",
  "Mørk Grå": "#5d5f63",
  "Triple Black": "#111111",
  "White/Blue": "linear-gradient(135deg,#f3efe6 50%,#4e6f9c 50%)",
  "Black/White": "linear-gradient(135deg,#161616 50%,#f3efe6 50%)",
  "Beige / Green": "linear-gradient(135deg,#d7c4a3 50%,#7a8f4a 50%)",
  "White / Mauve": "linear-gradient(135deg,#f3efe6 50%,#c9a0b4 50%)",
};

export const isColorOption = (name = "") => /^(color|colour|farge)$/i.test(String(name).trim());
export const isSizeOption = (name = "") => /size|størrelse|storrelse/i.test(String(name));

export const sortOptionTypes = (names = []) => [...names].sort((left, right) => {
  const rank = (name) => (isColorOption(name) ? 0 : isSizeOption(name) ? 1 : 2);
  return rank(left) - rank(right) || left.localeCompare(right, "nb");
});

export function swatchBackground(value) {
  if (COLOR_SWATCHES[value]) return COLOR_SWATCHES[value];
  const parts = String(value).split(/[/,]/).map((part) => part.trim()).filter(Boolean);
  if (parts.length > 1 && parts.every((part) => COLOR_SWATCHES[part])) {
    return `linear-gradient(135deg,${COLOR_SWATCHES[parts[0]]} 50%,${COLOR_SWATCHES[parts[1]]} 50%)`;
  }
  let hash = 2166136261;
  for (const char of String(value)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return `hsl(${hash % 360} 24% 58%)`;
}

export const NAV_ITEMS = [
  { handle: "joggesko", label: "Joggesko" },
  { handle: "sokker", label: "Sokker" },
];

export const FEATURE_HANDLES = ["joggesko", "sokker"];
export const HIDDEN_COLLECTION_HANDLES = new Set(["frontpage"]);

export const EDITORIAL_PATHS = [
  "/",
  "/faq/",
  "/frakt/",
  "/handlekurv/",
  "/kontakt/",
  "/om/",
  "/personvern/",
  "/retur/",
  "/sok/",
  "/storrelse/",
  "/vilkar/",
];

export const LEGACY_REDIRECTS = new Map([
  ["/pages/contact", "/kontakt/"],
  ["/pages/frakt", "/frakt/"],
  ["/pages/retur-og-bytte", "/retur/"],
  ["/pages/storrelsesguide", "/storrelse/"],
  ["/pages/om-oss", "/om/"],
  ["/policies/terms-of-service", "/vilkar/"],
  ["/policies/privacy-policy", "/personvern/"],
  ["/policies/refund-policy", "/retur/"],
  ["/policies/shipping-policy", "/frakt/"],
  ["/search", "/sok/"],
  ["/cart", "/handlekurv/"],
  ["/products/2-pack-cotton-no-show-socks", "/products/3-pack-sky-knit-socks/"],
]);

const ALLOWED_TAGS = new Set(["P", "H2", "H3", "UL", "OL", "LI", "STRONG", "EM", "A", "BR", "B", "I"]);
const RELATED_COLLECTION_ORDER = ["joggesko", "sokker"];

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

export const optionTypes = (variants = []) => {
  const names = [];
  for (const variant of variants) {
    for (const option of variant.options || []) {
      if (option.name && !names.includes(option.name)) names.push(option.name);
    }
  }
  return sortOptionTypes(names);
};

export const optionValues = (variants = [], name) => {
  const values = [];
  for (const variant of variants) {
    const value = variant.options?.find((option) => option.name === name)?.value;
    if (value && !values.includes(value)) values.push(value);
  }
  return values;
};

export const findVariant = (variants = [], selected = {}) => variants.find((variant) =>
  (variant.options || []).every((option) => selected[option.name] === option.value),
);

export const firstAvailableSelection = (variants = [], availability = {}) => {
  const preferred = variants.find((variant) => availability[variant.id] === true) || variants[0];
  const selected = {};
  for (const option of preferred?.options || []) selected[option.name] = option.value;
  return selected;
};

export function optionPillMarkup({ name, value, label, selected, unavailable, color }) {
  const classes = ["option-pill", color ? "option-pill--color" : "option-pill--size"];
  if (selected) classes.push("is-selected");
  if (unavailable) classes.push("is-unavailable");
  const style = color ? ` style="--option-swatch: ${escapeHtml(swatchBackground(value))}"` : "";
  const swatch = color ? `<span class="option-swatch" aria-hidden="true"></span>` : "";
  const shown = optionValueLabel(value);
  return `<button type="button" class="${classes.join(" ")}"${style} data-option-name="${escapeHtml(name)}" data-option-value="${escapeHtml(value)}" aria-pressed="${selected}" aria-label="${escapeHtml(`${label}: ${shown}`)}">${swatch}<span class="option-pill-text">${escapeHtml(shown)}</span></button>`;
}

export function renderOptionPills(variants = [], availability = {}) {
  const types = optionTypes(variants);
  if (variants.length <= 1 || !types.length) return "";
  const selected = firstAvailableSelection(variants, availability);
  const groups = types.map((name) => {
    const label = OPTION_LABELS[name] || name;
    const current = selected[name];
    const color = isColorOption(name);
    const pills = optionValues(variants, name).map((value) => {
      const trial = { ...selected, [name]: value };
      const match = findVariant(variants, trial);
      return optionPillMarkup({
        name,
        value,
        label,
        selected: selected[name] === value,
        unavailable: !match || availability[match.id] === false,
        color,
      });
    }).join("");
    const guide = isSizeOption(name) ? `<a class="option-guide-link" href="/storrelse/">Størrelsesguide</a>` : "";
    return `<fieldset class="option-group option-group--${color ? "color" : "size"}"><legend><span class="option-group-label">${escapeHtml(label)}</span>${current ? `<span class="option-group-value">${escapeHtml(optionValueLabel(current))}</span>` : ""}</legend><div class="option-pills option-pills--${color ? "color" : "size"}" role="group" aria-label="${escapeHtml(label)}">${pills}</div>${guide}</fieldset>`;
  }).join("");
  const payload = variants.map((variant) => ({
    id: variant.id,
    price: variant.price,
    options: variant.options || [],
    available: availability[variant.id] ?? null,
  }));
  return `<div class="product-options" data-product-options>${groups}</div><script type="application/json" data-product-variant-map>${JSON.stringify(payload).replaceAll("<", "\\u003c")}</script>`;
}

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
  className,
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
  return `<picture class="responsive-picture">${source}<img${className ? ` class="${escapeHtml(className)}"` : ""}${main ? " data-main-product-image" : ""} src="${escapeHtml(src)}"${srcset ? ` srcset="${escapeHtml(srcset)}"` : ""}${srcset && sizes ? ` sizes="${escapeHtml(sizes)}"` : ""} alt="${escapeHtml(alt)}"${width}${height}${loading ? ` loading="${loading}"` : ""}${fetchPriority ? ` fetchpriority="${fetchPriority}"` : ""} decoding="async"></picture>`;
}

export function localPicture(src, {
  alt = "",
  width = 1200,
  height = 1800,
  sizes = "100vw",
  widths = [480, 800, 1200],
  loading,
  fetchPriority,
} = {}) {
  const base = String(src).replace(/\.webp$/i, "");
  const srcset = widths.map((candidate) => `${base}-${candidate}.avif ${candidate}w`).join(", ");
  return `<picture class="responsive-picture"><source type="image/avif" srcset="${escapeHtml(srcset)}" sizes="${escapeHtml(sizes)}"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" width="${Number(width)}" height="${Number(height)}"${loading ? ` loading="${loading}"` : ""}${fetchPriority ? ` fetchpriority="${fetchPriority}"` : ""} decoding="async"></picture>`;
}

function deferredHoverImage(image, sizes) {
  const src = imageUrl(image, 480);
  if (!src) return "";
  const srcset = imageSrcset(image);
  const width = Number(image.width) > 0 ? ` width="${Number(image.width)}"` : "";
  const height = Number(image.height) > 0 ? ` height="${Number(image.height)}"` : "";
  return `<img class="product-card-hover" data-hover-src="${escapeHtml(src)}"${srcset ? ` data-hover-srcset="${escapeHtml(srcset)}" data-hover-sizes="${escapeHtml(sizes)}"` : ""} alt=""${width}${height} loading="lazy" decoding="async">`;
}

const CARD_IMAGE_SIZES = "(max-width: 620px) 46vw, (max-width: 1000px) 30vw, 280px";
const CATEGORY_IMAGE_SIZES = "(max-width: 560px) calc(100vw - 40px), (max-width: 900px) calc(50vw - 28px), 582px";
const PRODUCT_IMAGE_SIZES = "(max-width: 780px) calc(100vw - 40px), 600px";

const galleryButton = (image, index, productTitle) => {
  const src = imageUrl(image, 960);
  const srcset = imageSrcset(image);
  const alt = image.alt || `${productTitle} – produktbilde ${index + 1}`;
  const thumbnail = responsiveImage(image, { preferredWidth: 320, sizes: "96px", loading: "lazy" });
  return `<button type="button" data-gallery-src="${escapeHtml(src)}" data-gallery-alt="${escapeHtml(alt)}"${srcset ? ` data-gallery-srcset="${escapeHtml(srcset)}" data-gallery-sizes="${escapeHtml(PRODUCT_IMAGE_SIZES)}"` : ""} aria-label="Vis produktbilde ${index + 1}" aria-current="${index === 0 ? "true" : "false"}"${index === 0 ? ' class="is-active"' : ""}>${thumbnail}</button>`;
};

const rewriteStoreHref = (href) => String(href || "")
  .replace(/https?:\/\/(?:www\.)?endorphin\.no\/collections\/([^/?#]+)/gi, "/collections/$1/")
  .replace(/https?:\/\/(?:www\.)?endorphin\.no\/products\/([^/?#]+)/gi, "/products/$1/")
  .replace(/https?:\/\/(?:www\.)?famme\.no\/products\/([^/?#]+)/gi, "/products/$1/")
  .replace(/https?:\/\/(?:www\.)?(?:endorphin|famme)\.no\/pages\/om-oss\/?/gi, "/om/")
  .replace(/https?:\/\/(?:www\.)?(?:endorphin|famme)\.no\/pages\/frakt\/?/gi, "/frakt/")
  .replace(/https?:\/\/(?:www\.)?(?:endorphin|famme)\.no\/pages\/contact\/?/gi, "/kontakt/");

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

export function legacyRedirectPath(pathname) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return LEGACY_REDIRECTS.get(normalized) || null;
}

export function legacyRedirectUrl(url) {
  const target = legacyRedirectPath(url.pathname);
  if (!target) return null;
  const redirect = new URL(target, url.origin);
  redirect.search = url.search;
  return redirect.href;
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
  if (related.length < limit && product.brand && product.brand !== "Endorphin") {
    for (const candidate of store.products || []) {
      if (candidate.brand !== product.brand) continue;
      push(candidate);
      if (related.length >= limit) return related;
    }
  }
  for (const candidate of store.products || []) {
    push(candidate);
    if (related.length >= limit) return related;
  }
  return related;
}

const ratingLabel = (value) => Number(value).toLocaleString("nb-NO", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function ratingMarkup(handle, className = "") {
  const proof = PRODUCT_PROOF[handle];
  if (!proof) return "";
  const classes = ["rating-summary", className].filter(Boolean).join(" ");
  return `<a class="${classes}" href="${escapeHtml(proof.sourceUrl)}" target="_blank" rel="noreferrer" aria-label="${escapeHtml(`${ratingLabel(proof.rating)} av 5 basert på ${proof.count} omtaler hos Famme.no`)}"><span aria-hidden="true">★</span><strong>${ratingLabel(proof.rating)}</strong><span>(${proof.count})</span></a>`;
}

function reviewCard(handle, review) {
  const proof = PRODUCT_PROOF[handle];
  if (!proof || !review) return "";
  return `<article class="review-card"><div class="review-card-rating"><span aria-hidden="true">★★★★★</span><span class="sr-only">5 av 5 stjerner</span></div><blockquote>«${escapeHtml(review.text)}»</blockquote><footer><strong>${escapeHtml(review.author)}</strong><span>Verifisert kjøper · ${escapeHtml(review.date)}</span><a href="${escapeHtml(proof.sourceUrl)}" target="_blank" rel="noreferrer">Se original omtale</a></footer></article>`;
}

export function renderReviewGrid(handles, { all = false } = {}) {
  const cards = [];
  for (const handle of handles) {
    const proof = PRODUCT_PROOF[handle];
    if (!proof) continue;
    const reviews = all ? proof.reviews : proof.reviews.slice(0, 1);
    for (const review of reviews) cards.push(reviewCard(handle, review));
  }
  return cards.length ? `<div class="review-grid">${cards.join("")}</div>` : "";
}

function reviewSection(handle) {
  const proof = PRODUCT_PROOF[handle];
  if (!proof) return "";
  return `<section class="reviews-section" id="omtaler"><div class="shop-shell"><div class="reviews-heading"><div><p class="shop-kicker">Verifiserte omtaler</p><h2>Dette sier kundene.</h2></div><div class="reviews-score"><strong>${ratingLabel(proof.rating)}</strong><span><b aria-hidden="true">★★★★★</b>${proof.count} omtaler på <a href="${escapeHtml(proof.sourceUrl)}" target="_blank" rel="noreferrer">Famme.no</a></span></div></div>${renderReviewGrid([handle], { all: true })}</div></section>`;
}

function lifestyleSection(handle) {
  const lifestyle = PRODUCT_PROOF[handle]?.lifestyle;
  if (!lifestyle) return "";
  return `<section class="product-lifestyle"><div class="shop-shell product-lifestyle-grid"><figure>${localPicture(lifestyle.src, { alt: lifestyle.alt, sizes: "(max-width: 860px) calc(100vw - 28px), 520px", loading: "lazy" })}</figure><div><p class="shop-kicker">${escapeHtml(lifestyle.kicker)}</p><h2>${escapeHtml(lifestyle.title)}</h2><p>${escapeHtml(lifestyle.text)}</p><ul><li>Fri frakt over ${SHIPPING_THRESHOLD} kr</li><li>Gratis bytte i 30 dager</li><li>Etikettløs retur</li></ul></div></div></section>`;
}

export function productCard(product, label = "") {
  if (!product?.handle) return "";
  const image = siteImage(product);
  const hover = product.images?.[1];
  const prices = (product.variants || []).map((variant) => Number(variant.price)).filter((price) => Number.isFinite(price));
  const from = prices.length ? Math.min(...prices) : 0;
  const compare = Math.max(0, ...(product.variants || []).map((variant) => Number(variant.compareAtPrice || 0)));
  const title = displayTitle(product);
  const media = image
    ? `${responsiveImage(image, { alt: image.alt || title, preferredWidth: 480, sizes: CARD_IMAGE_SIZES, loading: "lazy" })}${hover ? deferredHoverImage(hover, CARD_IMAGE_SIZES) : ""}`
    : '<span class="product-image-fallback">E</span>';
  return `<article class="product-card"><a class="product-card-media" href="/products/${escapeHtml(product.handle)}/">${label ? `<span class="product-badge">${escapeHtml(label)}</span>` : ""}${media}</a><div class="product-card-copy"><p>${escapeHtml(displayBrand(product))}</p><h3><a href="/products/${escapeHtml(product.handle)}/">${escapeHtml(title)}</a></h3>${ratingMarkup(product.handle, "product-card-rating")}<div class="product-card-price"><strong>${formatMoney(from)}</strong>${compare > from ? `<del>${formatMoney(compare)}</del>` : ""}</div></div></article>`;
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
    `<a href="/collections/all/"${active === "all" ? ' aria-current="page"' : ""}>Alle</a>`,
  ].join("");
  const legalFooter = renderCompactLegalFooter({
    owner: "Endorphin",
    locale: "nb-NO",
    refundHref: "/retur/",
    privacyHref: "/personvern/",
    termsHref: "/vilkar/",
    className: "shop-footer-bottom shop-shell",
  });
  return {
    header: `<a class="skip-link" href="#main">Hopp til innhold</a>
  <aside class="shop-announcement" aria-label="Kjøpsfordeler"><ul class="shop-shell"><li>Gratis bytte &amp; fri frakt over ${SHIPPING_THRESHOLD} kr</li><li>Etikettløs retur</li><li>Vipps, kort og mobilbetaling</li></ul></aside>
  <header class="shop-header"><div class="shop-header-inner shop-shell">
    <a class="shop-logo" href="/" aria-label="Endorphin, forside"><img src="/assets/brand/endorphin-logo.png" alt="Endorphin" width="800" height="95" decoding="async"></a>
    <button class="shop-menu-toggle" type="button" aria-label="Åpne meny" aria-expanded="false" aria-controls="shop-navigation" data-nav-toggle><span></span></button>
    <nav class="shop-nav" id="shop-navigation" aria-label="Hovedmeny" data-nav-links>${nav}</nav>
    <div class="shop-tools"><a href="/sok/" aria-label="Søk">Søk</a><a href="/handlekurv/" aria-label="Handlekurv">Kurv <span class="cart-count" data-cart-count>0</span></a></div>
  </div></header>`,
    footer: `<footer class="shop-footer"><div class="shop-shell shop-footer-grid"><div><a class="shop-logo shop-logo--footer" href="/"><img src="/assets/brand/endorphin-logo.png" alt="Endorphin" width="800" height="95" loading="lazy" decoding="async"></a><p>Joggesko fra Famme med demping til trening, jobb og hverdag. Fri frakt over ${SHIPPING_THRESHOLD} kr.</p></div><div><h2>Handle</h2><a href="/collections/joggesko/">Joggesko</a><a href="/collections/sokker/">Sokker</a><a href="/collections/all/">Alle produkter</a></div><div><h2>Informasjon</h2><a href="/frakt/">Frakt og levering</a><a href="/storrelse/">Størrelsesguide</a><a href="/om/">Om oss</a><a href="/kontakt/">Kontakt</a><a href="/faq/">Ofte stilte spørsmål</a></div></div>${legalFooter}</footer><div class="cart-toast" role="status" aria-live="polite" data-cart-toast hidden></div>`,
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
  ogImage = `${SITE_ORIGIN}/assets/hero.webp`,
  robots = "",
}) {
  const { header, footer } = chrome(store, active);
  const url = `${SITE_ORIGIN}${canonicalPath}`;
  const robotsTag = robots ? `<meta name="robots" content="${escapeHtml(robots)}">` : "";
  return `<!doctype html><html lang="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}">${robotsTag}<meta name="theme-color" content="#f7f4ef"><link rel="canonical" href="${escapeHtml(url)}"><link rel="icon" href="/assets/favicon.png" type="image/png"><link rel="preconnect" href="https://app.reai.no" crossorigin><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(url)}"><meta property="og:type" content="${escapeHtml(ogType)}"><meta property="og:image" content="${escapeHtml(ogImage)}"><meta property="og:locale" content="nb_NO"><meta property="og:site_name" content="Endorphin"><link rel="stylesheet" href="/assets/site.css"><link rel="stylesheet" href="${STORE_STYLE}"><script type="module" src="${STORE_SCRIPT}"></script>${schema}</head><body>${header}<noscript><p class="noscript-banner">JavaScript må være aktivert for handlekurv og utsjekk.</p></noscript><main id="main">${body}</main>${footer}</body></html>`;
}

export function renderHomePage(store) {
  const shoes = (collectionByHandle(store, "joggesko")?.products || [])
    .map((member) => productByHandle(store, member.handle))
    .filter(Boolean);
  const socks = (collectionByHandle(store, "sokker")?.products || [])
    .map((member) => productByHandle(store, member.handle))
    .filter(Boolean);
  const features = FEATURE_HANDLES
    .map((handle) => collectionByHandle(store, handle))
    .filter((collection) => (collection?.products || []).length > 0);
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
  const body = `<section class="store-hero store-hero--lifestyle" data-storefront="home"><div class="shop-shell store-hero-grid"><div class="store-hero-copy"><p class="shop-kicker">Endorphin by Famme</p><h1>Demping du<br><span>merker.</span></h1><p>Lette sko utviklet for løpeturen, arbeidsdagen og alt imellom. Finn modellen som passer steget ditt.</p><div class="store-actions"><a class="store-button" href="/collections/joggesko/">Finn dine sko</a><a class="store-button store-button--ghost" href="/storrelse/">Størrelsesguide</a></div><ul class="hero-trust"><li>Fri frakt over ${SHIPPING_THRESHOLD} kr</li><li>Gratis bytte i 30 dager</li><li>Vipps, kort og mobilbetaling</li></ul></div><a class="hero-photo hero-photo--lifestyle" href="/products/endorphin-rx2-shoes/">${localPicture("/assets/lifestyle/rx2-city.webp", { alt: "Løper som knyter hvite Endorphin RX2 utendørs", sizes: "(max-width: 760px) calc(100vw - 28px), 500px", fetchPriority: "high" })}<span class="hero-photo-caption"><strong>Endorphin RX2</strong><small>Responsiv demping · hver eneste kilometer</small></span></a></div></section>
<section class="service-band" aria-label="Kjøpsfordeler"><ul class="shop-shell"><li><strong>Fri frakt</strong><span>På ordre over ${SHIPPING_THRESHOLD} kr</span></li><li><strong>Gratis bytte</strong><span>Innen 30 dager</span></li><li><strong>Etikettløs retur</strong><span>Enkelt og oversiktlig</span></li><li><strong>Trygg betaling</strong><span>Vipps, kort og mobilbetaling</span></li></ul></section>
${shoes.length ? `<section class="shop-section shop-section--light"><div class="shop-shell"><div class="shop-section-head"><div><p class="shop-kicker">Sko fra Famme</p><h2>Velg din følelse.</h2></div><a class="shop-text-link" href="/collections/joggesko/">Se alle joggesko →</a></div>${productGrid(shoes)}</div></section>` : ""}
<section class="home-campaign"><div class="shop-shell home-campaign-grid"><div class="home-campaign-copy"><p class="shop-kicker">Komfort i bevegelse</p><h2>Fra første kilometer til siste vakt.</h2><p>Endorphin-serien samler lette, dempede sko for ulike behov — fra den responsive RX2 til myke AirStep og retroinspirerte 90S Trainers.</p><a class="store-button" href="/collections/joggesko/">Sammenlign modellene</a><dl><div><dt>4 modeller</dt><dd>Ulike uttrykk og demping</dd></div><div><dt>35–42</dt><dd>Størrelser i utvalget</dd></div></dl></div><div class="home-campaign-visual">${localPicture("/assets/lifestyle/rx1-white.webp", { alt: "Kvinne i sort treningstøy med hvite Endorphin RX1", sizes: "(max-width: 860px) 52vw, 390px", loading: "lazy" })}${localPicture("/assets/lifestyle/rx1-black.webp", { alt: "Løper med sorte Endorphin RX1 i byen", sizes: "(max-width: 860px) 42vw, 330px", loading: "lazy" })}</div></div></section>
<section class="reviews-section reviews-section--home"><div class="shop-shell"><div class="reviews-heading"><div><p class="shop-kicker">Prøvd i hverdagen</p><h2>Kunder som kjenner forskjellen.</h2></div><div class="reviews-intro"><p>Verifiserte omtaler hentet fra Endorphin-skoene på Famme.no.</p><a href="https://famme.no/search?q=Endorphin&amp;type=product" target="_blank" rel="noreferrer">Finn skoene hos Famme →</a></div></div>${renderReviewGrid(["endorphin-rx2-shoes", "endorphin-rx1-shoes", "airstep-shoes"])}</div></section>
${categoryCards ? `<section class="shop-section shop-section--light"><div class="shop-shell"><div class="shop-section-head"><div><p class="shop-kicker">Hele utvalget</p><h2>Fullfør steget.</h2></div><a class="shop-text-link" href="/collections/all/">Se alt →</a></div><div class="category-feature-grid">${categoryCards}</div></div></section>` : ""}
${socks.length ? `<section class="brand-feature"><div class="shop-shell brand-feature-grid"><div><p class="shop-kicker">Tilbehør</p><h2>Sokker som<br>hører med.</h2><p>Tennissokker og no-show i bomull — til trening og hverdag.</p><a class="store-button" href="/collections/sokker/">Se sokker</a></div><div class="brand-feature-products">${socks.slice(0, 2).map((product) => productCard(product)).join("")}</div></div></section>` : ""}`;
  return documentHtml({
    title: "Endorphin — Joggesko med god demping",
    description: `Joggesko fra Famme med god demping til trening, jobb og hverdag. Fri frakt over ${SHIPPING_THRESHOLD} kr, gratis bytte og betaling med Vipps, kort eller mobilbetaling.`,
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
    ? "Hele utvalget — joggesko og sokker til trening og hverdag."
    : collectionBlurb(collection, handle === "joggesko"
      ? "Joggesko med god demping til trening, jobb og hverdag."
      : handle === "sokker"
        ? "Sokker i bomull til trening og hverdag."
        : `Se hele utvalget i ${title.toLowerCase()}.`);
  const countLabel = `${members.length} produkter`;
  const active = isAll ? "all" : (NAV_ITEMS.find((item) => item.handle === handle)?.handle || "");
  const image = isAll ? "" : collectionImage(collection, store);
  const campaign = isAll || handle === "joggesko";
  const campaignImage = isAll ? "/assets/lifestyle/rx2-city.webp" : "/assets/lifestyle/rx1-black.webp";
  const campaignAlt = isAll ? "Løper som knyter hvite Endorphin RX2" : "Løper med sorte Endorphin RX1 i byen";
  const trail = breadcrumbs([{ href: "/", label: "Hjem" }, { label: title }]);
  const hero = campaign
    ? `<header class="collection-hero collection-hero--campaign" data-storefront="collection"><div class="shop-shell collection-hero-grid"><div>${trail}<p class="shop-kicker">${escapeHtml(countLabel)} · Fra Famme</p><h1>${escapeHtml(isAll ? "Hele steget." : "Sko for hele dagen.")}</h1><p>${escapeHtml(description)} Fire modeller, ulike uttrykk — samme fokus på komfort.</p></div><figure>${localPicture(campaignImage, { alt: campaignAlt, sizes: "(max-width: 760px) calc(100vw - 28px), 440px", fetchPriority: "high" })}</figure></div></header>`
    : `<header class="collection-hero" data-storefront="collection"><div class="shop-shell">${trail}<p class="shop-kicker">${escapeHtml(countLabel)}</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div></header>`;
  const proof = campaign ? `<section class="reviews-section reviews-section--collection"><div class="shop-shell"><div class="reviews-heading"><div><p class="shop-kicker">Verifiserte omtaler</p><h2>Komfort, bekreftet.</h2></div><div class="reviews-intro"><p>Erfaringer fra kunder som har brukt skoene til løping, jobb og lange dager.</p></div></div>${renderReviewGrid(["endorphin-rx2-shoes", "endorphin-rx1-shoes", "airstep-shoes"])}</div></section>` : "";
  const body = `${hero}<section class="shop-section shop-section--light" aria-labelledby="collection-products"><div class="shop-shell"><h2 class="sr-only" id="collection-products">Produkter i ${escapeHtml(title)}</h2><div class="catalog-toolbar"><strong>${escapeHtml(countLabel)}</strong><a href="/sok/">${isAll ? "Søk i utvalget" : "Søk i hele butikken"}</a></div>${productGrid(members)}</div></section>${proof}`;
  return documentHtml({
    title: `${title} | Endorphin`,
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
    ? `<section class="product-gallery" data-gallery-index="0" aria-label="Produktbilder">${images.length > 1 ? `<div class="product-stage"><div class="product-main-image">${responsiveImage(images[0], { alt: images[0].alt || displayTitle(product), preferredWidth: 960, sizes: PRODUCT_IMAGE_SIZES, fetchPriority: "high", main: true })}</div><button class="product-gallery-nav product-gallery-nav--prev" type="button" data-gallery-prev aria-label="Forrige bilde"><span aria-hidden="true">‹</span></button><button class="product-gallery-nav product-gallery-nav--next" type="button" data-gallery-next aria-label="Neste bilde"><span aria-hidden="true">›</span></button></div><div class="product-thumbs" role="group" aria-label="Velg produktbilde">${images.map((item, index) => galleryButton(item, index, displayTitle(product))).join("")}</div>` : `<div class="product-main-image">${responsiveImage(images[0], { alt: images[0].alt || displayTitle(product), preferredWidth: 960, sizes: PRODUCT_IMAGE_SIZES, fetchPriority: "high", main: true })}</div>`}</section>`
    : '<div class="product-main-image"><span class="product-image-fallback">E</span></div>';
  const optionPills = renderOptionPills(variants, availability);
  const selectedVariant = findVariant(variants, firstAvailableSelection(variants, availability)) || firstVariant;
  const schema = jsonLd({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: images.map((item) => item.url),
    description: stripHtml(product.description || product.seoDescription || product.title),
    sku: firstVariant?.sku || undefined,
    brand: { "@type": "Brand", name: displayBrand(product) },
    offers: variants.map((variant) => ({
      "@type": "Offer",
      priceCurrency: "NOK",
      price: String(variant.price),
      availability: availability[variant.id] === true ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE_ORIGIN}/products/${product.handle}/`,
    })),
  });
  const descriptionHtml = formatDescription(product.description) || `<p>${escapeHtml(product.seoDescription || "")}</p>`;
  const title = displayTitle(product);
  const trail = breadcrumbs([
    { href: "/", label: "Hjem" },
    ...(crumbCollection ? [{ href: `/collections/${crumbCollection.handle}/`, label: crumbCollection.title }] : []),
    { label: title },
  ]);
  const relatedSection = related.length
    ? `<section class="shop-section shop-section--related"><div class="shop-shell"><div class="shop-section-head"><div><p class="shop-kicker">Fortsett å shoppe</p><h2>Du liker kanskje også.</h2></div></div>${productGrid(related)}</div></section>`
    : "";
  const body = `<section class="product-page shop-section--light" data-storefront="product"><div class="shop-shell">${trail}<div class="product-layout">${gallery}<div class="product-info"><p class="product-vendor">${escapeHtml(displayBrand(product))} · Fra Famme</p><h1>${escapeHtml(title)}</h1>${ratingMarkup(product.handle, "product-page-rating")}<div class="product-price" data-product-price aria-live="polite">${formatMoney(selectedVariant?.price ?? firstVariant?.price ?? 0)}</div><p class="product-shipping-note">Fri frakt over ${SHIPPING_THRESHOLD} kr. Frakt beregnes i kassen.</p><form class="product-purchase" data-product-form>${optionPills}<div class="product-buy-row"><label>Antall<span class="quantity-control"><button type="button" data-quantity-minus aria-label="Reduser antall">−</button><input type="number" value="1" min="1" max="20" inputmode="numeric" aria-label="Antall" data-quantity><button type="button" data-quantity-plus aria-label="Øk antall">+</button></span></label><button class="store-button store-button--buy" type="button" data-add-to-cart data-id="${escapeHtml(product.id)}" data-title="${escapeHtml(title)}" data-price="${escapeHtml(selectedVariant?.price ?? firstVariant?.price ?? "")}" data-image="${escapeHtml(imageUrl(image, 320))}" data-handle="${escapeHtml(product.handle)}" data-variant="${escapeHtml(selectedVariant?.id || firstVariant?.id || "")}" data-site-available="${available}"${available ? "" : " disabled"}>${available ? "Legg i handlekurven" : "Utsolgt"}</button></div></form><ul class="product-reassure"><li>Fri frakt over ${SHIPPING_THRESHOLD} kr</li><li>Gratis bytte i 30 dager</li><li>Etikettløs retur</li><li>Vipps, kort og mobilbetaling</li></ul><p class="product-help-links"><a href="/storrelse/">Størrelsesguide</a><a href="/frakt/">Frakt og levering</a><a href="/retur/">Retur og bytte</a></p><section class="product-description" aria-label="Produktinformasjon">${descriptionHtml}</section></div></div></div></section>${lifestyleSection(product.handle)}${reviewSection(product.handle)}${relatedSection}`;
  return documentHtml({
    title: `${product.seoTitle || product.title} | Endorphin`.replace(" | Endorphin | Endorphin", " | Endorphin"),
    description: metaDescription(product.seoDescription || product.description, product.title),
    canonicalPath: `/products/${product.handle}/`,
    active,
    body,
    store,
    schema,
    ogType: "product",
    ogImage: image?.url || `${SITE_ORIGIN}/assets/hero.webp`,
  });
}

export function renderMessagePage(store, { title, heading, text, kicker = "Endorphin" }) {
  const body = `<section class="simple-hero"><div class="shop-shell" style="min-height:60vh;display:flex;flex-direction:column;justify-content:center"><p class="shop-kicker">${escapeHtml(kicker)}</p><h1>${escapeHtml(heading)}</h1><p style="color:#5c5a56">${escapeHtml(text)}</p><p><a class="store-button" href="/">Til forsiden</a></p></div></section>`;
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
    title: "Fant ikke siden | Endorphin",
    heading: "Her var det tomt.",
    text: "Siden finnes ikke, eller har fått en ny adresse.",
    kicker: "404",
  });
}

export function renderUnavailablePage(store) {
  return renderMessagePage(store, {
    title: "Midlertidig utilgjengelig | Endorphin",
    heading: "Utvalget er nede.",
    text: "Vi får ikke hentet produkter akkurat nå. Prøv igjen om litt.",
    kicker: "Prøv igjen",
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
