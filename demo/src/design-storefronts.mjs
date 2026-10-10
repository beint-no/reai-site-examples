import {
  escapeHtml as h,
  language,
  money,
  picture,
  renderGrid,
} from "./storefront.mjs";
import fashion from "../public/assets/famme/catalog.json" with { type: "json" };
const pick = (c, a, b) => (language(c.locale) === "nb" ? a : b);
const arrow =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
const bag =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Zm3 0V5a4 4 0 0 1 8 0v2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
const search =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m15 15 6 6" stroke="currentColor" stroke-width="1.5"/></svg>';
const base = "/designs/famme";
const collectionLabels = {
  jeans: ["Jeans", "Jeans"],
  softy: ["Softy", "Softy"],
  layers: ["Hverdagslag", "Everyday layers"],
  all: ["Alle produkter", "All products"],
};
export const fashionCatalog = fashion;
function liveDrawer(c) {
  return `<dialog class="cart-drawer" data-cart-drawer aria-label="${pick(c, "Handlekurv", "Cart")}"><div class="drawer-header"><h2>${pick(c, "Handlekurven din", "Your cart")}</h2><button data-cart-close aria-label="${pick(c, "Lukk", "Close")}">×</button></div><div data-drawer-lines></div><div class="drawer-bottom"><div class="drawer-subtotal"><b>${pick(c, "Sum produkter", "Product subtotal")}</b><strong data-drawer-total>—</strong></div><p>${pick(c, "Produkter og priser fra ReAI. Betalingsmodus og mottaker vises før checkout.", "Products and prices from ReAI. Payment mode and recipient are shown before checkout.")}</p><a class="button" href="/cart/">${pick(c, "Se handlekurven", "View cart")} ${arrow}</a></div></dialog>`;
}
function frame(title, body, c, theme, fixture = false) {
  const name =
    theme === "famme" ? "FAMME" : theme === "essential" ? "ESSENTIAL" : "INDEX";
  const nav = fixture
    ? [
        [`${base}/collections/all/`, pick(c, "Nyheter", "New arrivals")],
        [`${base}/#collections`, pick(c, "Kolleksjoner", "Collections")],
        [`${base}/collections/jeans/`, "Jeans"],
        [`${base}/collections/softy/`, "Softy"],
      ]
    : theme === "essential"
      ? [
          ["#products", pick(c, "Produktene", "Products")],
          ["#flow", pick(c, "Slik virker det", "How it works")],
        ]
      : [
          ["/designs/collections/", pick(c, "Kolleksjoner", "Collections")],
          ["/shop/", pick(c, "Alle produkter", "All products")],
          ["/learn/catalog/", pick(c, "Slik virker det", "How it works")],
        ];
  return `<!doctype html><html lang="${language(c.locale)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="description" content="${h(pick(c, "ReAI butikkdesign med samlinger, variantvalg og handlekurv i skuff.", "ReAI storefront designs with collections, variants and a cart drawer."))}"><title>${h(title)} · ReAI ${pick(c, "butikkdesign", "storefront design")}</title><link rel="icon" href="/assets/mark.svg"><link rel="stylesheet" href="/assets/demo.css"><link rel="stylesheet" href="/assets/designs.css"></head><body data-locale="${language(c.locale)}" data-store-theme="${theme}" data-checkout-origin="${h(c.checkoutOrigin || "https://app.reai.no")}" data-payment-mode="${fixture ? "disabled" : h(c.paymentMode || "disabled")}" ${fixture ? "data-fashion-store" : "data-live-store"}><a class="skip" href="#main">${pick(c, "Hopp til innhold", "Skip to content")}</a><div class="design-notice"><a href="/designs/">← ${pick(c, "Alle butikkdesign", "All storefront designs")}</a><span>${fixture ? pick(c, "Design-test · Famme-bilder · ingen salg av klær", "Design test · Famme photography · no clothing for sale") : c.preview ? pick(c, "Lokal forhåndsvisning · ingen betaling", "Local preview · no payments") : pick(c, "ReAI sin test-nettbutikk · Mottaker: ", "ReAI test store · Recipient: ") + h(c.merchantName || "Better Integration")}</span><a href="?lang=${language(c.locale) === "nb" ? "en" : "nb"}">${pick(c, "EN", "NO")}</a></div><header class="design-header"><a class="design-brand" href="${fixture ? base + "/" : theme === "essential" ? "/designs/essential/" : "/designs/collections/"}">${name}<small>/ REAI ${fixture ? "DESIGN TEST" : "SITE API"}</small></a><nav aria-label="${pick(c, "Butikkmeny", "Store navigation")}">${nav.map(([url, label]) => `<a href="${url}">${label}</a>`).join("")}</nav><div class="design-header-actions">${fixture ? `<a href="${base}/collections/all/#filter" aria-label="${pick(c, "Søk produkter", "Search products")}">${search}</a>` : ""}<button type="button" ${fixture ? "data-fashion-cart-open" : "data-cart-open"} aria-label="${pick(c, fixture ? "Testkurv" : "Handlekurv", fixture ? "Test cart" : "Cart")}">${bag}<span ${fixture ? "data-fashion-count" : "data-cart-count"}>0</span></button><button class="design-menu" aria-label="${pick(c, "Åpne meny", "Open navigation")}" aria-expanded="false">☰</button></div></header><main id="main">${body}</main><footer class="design-footer"><a class="design-brand" href="/designs/">${name}<small>/ REAI</small></a><p>${fixture ? pick(c, "Famme-fotografier brukt med tillatelse. Fiktiv katalog og separat testkurv.", "Famme photography used with permission. Fictional catalog and separate test cart.") : pick(c, "Design i Git. Produkter, priser og ordre i ReAI.", "Design in Git. Products, prices and orders in ReAI.")}</p><a href="/learn/catalog/">${pick(c, "Lær om Site API", "Learn about the Site API")} ${arrow}</a></footer>${fixture ? fashionDialogs(c) : liveDrawer(c)}<script src="/assets/${fixture ? "fashion" : "demo"}.js" defer></script><script src="/assets/designs.js" defer></script></body></html>`;
}
const productCopy = {
  "test-betaling": [
    "Velg 1, 10 eller 100 kr for å prøve betalingsflyten. Ingen vare eller tjeneste leveres.",
    "Choose 1, 10 or 100 kr to try the payment flow. No goods or services are delivered.",
  ],
  "reai-gavekort": [
    "Gavekort til ReAI. Innløses manuelt ved å sende ordrebekreftelsen til post@reai.no.",
    "A gift card for ReAI. Redeem manually by emailing the order confirmation to post@reai.no.",
  ],
  "heia-reai": [
    "Frivillig støtte til Better Integrations utvikling av ReAI og åpen kildekode.",
    "Voluntary support for Better Integration’s development of ReAI and open-source software.",
  ],
};
export function renderEssential(store, availability, c) {
  const status = new Map(
    (availability.variants || []).map((v) => [v.variantId, v.status]),
  );
  const products = ["test-betaling", "reai-gavekort", "heia-reai"].flatMap(
    (handle) => store.products.filter((p) => p.handle === handle),
  );
  const modules = products
    .map((p) => {
      const v = p.variants || [],
        available = v.find((x) => status.get(x.id) === "AVAILABLE");
      return `<article class="essential-product"><a class="essential-art" href="/products/${h(p.handle)}/">${picture(p)}</a><h2><a href="/products/${h(p.handle)}/">${h(p.title)}</a></h2><p>${pick(c, ...productCopy[p.handle])}</p><form data-add-to-cart data-amount-form><fieldset><legend class="sr-only">${pick(c, "Velg beløp", "Choose amount")} ${h(p.title)}</legend><div class="amount-options">${v.map((x) => `<label><input type="radio" name="variantId" value="${h(x.id)}" data-amount="${h(money(x.price, store))}" ${x.id === available?.id ? "checked" : ""} ${status.get(x.id) !== "AVAILABLE" ? "disabled" : ""}><span>${h(money(x.price, store))}</span></label>`).join("")}</div></fieldset><strong class="selected-amount" data-selected-amount>${available ? h(money(available.price, store)) : pick(c, "Utilgjengelig", "Unavailable")}</strong><input type="hidden" name="quantity" value="1"><button class="button" ${available ? "" : "disabled"}>${pick(c, "Legg i kurven", "Add to cart")} +</button><p class="add-message" data-add-message role="status"></p></form></article>`;
    })
    .join("");
  return frame(
    "Essential",
    `<section class="essential-hero design-shell"><div><h1>${pick(c, "Tre produkter.<br>Én enkel butikk.", "Three products.<br>One simple shop.")}</h1><p>${pick(c, "Test en betaling, støtt utviklingen eller kjøp et ReAI gavekort.", "Test a payment, support development or buy a ReAI gift card.")}</p><a class="under-link" href="#products">${pick(c, "Se produktene", "Explore the products")} ↓</a></div><div class="essential-hero-art"><img src="/assets/gift.svg" width="640" height="640" alt="${pick(c, "Illustrert gavekort", "Illustrated gift card")}"><img src="/assets/heart.svg" width="640" height="640" alt=""></div></section><section class="design-shell essential-products" id="products">${modules || `<p>${pick(c, "Ingen av de tre produktene er publisert i dette markedet.", "None of the three products are published in this market.")}</p>`}</section><section class="design-shell essential-flow" id="flow"><h2>${pick(c, "Fra valg til ordre.", "From choice to order.")}</h2><div class="essential-steps">${[
      [
        "Du velger variant",
        "You choose a variant",
        "Beløpsknappene velger en publisert variant-ID, uten et nytt sidebesøk.",
        "Amount buttons select a published variant ID without another page visit.",
      ],
      [
        "Site API leverer pris",
        "The Site API supplies prices",
        "Pris og tilgjengelighet hentes fra ReAI. Butikkdesignet bestemmer presentasjonen.",
        "Prices and availability come from ReAI. The storefront controls their presentation.",
      ],
      [
        "ReAI håndterer checkout",
        "ReAI handles checkout",
        "ReAI validerer pris og tilgjengelighet igjen. Betalingsstatus avgjør utfallet.",
        "ReAI revalidates prices and availability. Payment status determines the outcome.",
      ],
    ]
      .map(
        ([a, b, x, y], i) =>
          `<article><span>0${i + 1}</span><h3>${pick(c, a, b)}</h3><p>${pick(c, x, y)}</p></article>`,
      )
      .join(
        "",
      )}</div><div class="essential-disclosure"><p>${pick(c, "Digitale produkter. Fullført betaling går til", "Digital products. Completed payments go to")} ${h(c.merchantName || "Better Integration")}. ${pick(c, "Gavekort håndteres manuelt; donasjoner gir ingen varer eller kreditt.", "Gift cards are handled manually; donations grant no goods or credit.")}</p><a href="/learn/checkout-test/">${pick(c, "Følg hele kjøpsflyten", "Follow the complete purchase flow")} ${arrow}</a></div></section>`,
    c,
    "essential",
  );
}
/** @param {any} [selected] */
export function renderCollections(store, c, selected = null) {
  const products = selected ? selected.products : store.products;
  return frame(
    "Index",
    `<section class="design-shell index-intro"><div><h1>${h(selected?.title || pick(c, "Finn din samling.", "Find your collection."))}</h1><p>${h(selected?.description || pick(c, "Bla etter formål. Samlingene, produktene og prisene hentes fra ReAI.", "Browse by purpose. Collections, products and prices come from ReAI."))}</p></div><a href="/learn/catalog/">${pick(c, "Slik virker samlinger", "How collections work")} ${arrow}</a></section><div class="design-shell index-layout"><aside><h2>${pick(c, "Kolleksjoner", "Collections")}</h2><nav aria-label="${pick(c, "Velg samling", "Select a collection")}"><a href="/designs/collections/" ${selected ? "" : 'aria-current="page"'}>${pick(c, "Alle produkter", "All products")} <span>${store.products.length}</span></a>${(store.collections || []).map((col) => `<a href="/designs/collections/${h(col.handle)}/" ${selected?.handle === col.handle ? 'aria-current="page"' : ""}>${h(col.title)} ${arrow}</a>`).join("")}</nav><p>${pick(c, "Samlinger kan vedlikeholdes manuelt eller med regler i ReAI.", "Collections can be managed manually or with rules in ReAI.")}</p><a class="under-link" href="/api/?endpoint=collections">${pick(c, "Se API-data", "Inspect API data")} ${arrow}</a></aside><section><div class="index-toolbar"><b>${products.length} ${pick(c, "produkter", "products")}</b><label class="search"><span class="sr-only">${pick(c, "Søk i denne samlingen", "Search this collection")}</span><input data-search type="search" placeholder="${pick(c, "Søk i denne samlingen", "Search this collection")}"></label></div>${renderGrid(products, store)}<p data-search-empty hidden>${pick(c, "Ingen produkter passer søket.", "No products match your search.")}</p></section></div>`,
    c,
    "index",
  );
}
function image(name, alt = "", eager = false) {
  return `<img src="/assets/famme/${name}.avif" width="800" height="1200" alt="${h(alt)}" loading="${eager ? "eager" : "lazy"}">`;
}
function fashionCard(p, c) {
  return `<article class="fashion-card" data-fashion-card data-title="${h(p.title)}" data-price="${p.price}" data-collection="${p.collection}"><a class="fashion-card-image" href="${base}/products/${p.handle}/">${image(p.colors[0].image, p.title)}</a><div class="fashion-card-heading"><h3><a href="${base}/products/${p.handle}/">${h(p.title)}</a></h3><span>${p.price.toLocaleString(language(c.locale))} kr</span></div><div class="fashion-card-swatches">${p.colors.map((color, i) => `<button type="button" class="fashion-swatch swatch-${color.key}" data-card-color="${color.image}" data-color-name="${color.key}" aria-label="${h(p.title)} ${colorName(color.key, c)}" aria-pressed="${i === 0}"></button>`).join("")}</div><button class="fashion-quick-add" data-fashion-quick="${p.handle}" type="button">${pick(c, "Velg størrelse", "Choose size")} <span>+</span></button></article>`;
}
export function colorName(key, c) {
  return pick(
    c,
    { brown: "Brun", black: "Svart", grey: "Grå", khaki: "Khaki" }[key] || key,
    { brown: "Brown", black: "Black", grey: "Grey", khaki: "Khaki" }[key] ||
      key,
  );
}
function collections(c) {
  return `<section class="design-shell fashion-collections" id="collections"><div class="fashion-section-heading"><h2>${pick(c, "Utforsk våre kolleksjoner.", "Explore our collections.")}</h2><a href="${base}/collections/all/">${pick(c, "Se alle produkter", "See all products")} ${arrow}</a></div><div class="fashion-collection-grid">${["jeans", "softy", "layers"].map((key) => `<a href="${base}/collections/${key}/">${image("collection-" + key, pick(c, ...collectionLabels[key]))}<span>${pick(c, ...collectionLabels[key])} ${arrow}</span></a>`).join("")}</div></section>`;
}
export function renderFashion(route, c) {
  let body,
    title = "Famme / Design test";
  if (route === "") {
    body = `<section class="fashion-hero"><picture><source media="(max-width: 700px)" srcset="/assets/famme/hero-mobile.avif"><img src="/assets/famme/hero-desktop.avif" width="1920" height="627" alt="${pick(c, "Famme høstkolleksjon i brunt og plomme", "Famme autumn collection in brown and plum")}" fetchpriority="high"></picture><div><h1>${pick(c, "Høstens favoritter.", "Autumn favorites.")}</h1><a class="fashion-button light" href="${base}/collections/layers/">${pick(c, "Se kolleksjonen", "Explore the collection")} ${arrow}</a></div></section>${collections(c)}<section class="design-shell fashion-featured"><div class="fashion-section-heading"><h2>${pick(c, "Velg din favoritt.", "Choose your favorite.")}</h2><a href="${base}/collections/all/">${pick(c, "Se alle", "See all")} ${arrow}</a></div><div class="fashion-products-grid">${fashion.products
      .slice(0, 4)
      .map((p) => fashionCard(p, c))
      .join(
        "",
      )}</div></section><section class="fashion-editorial"><div><h2>${pick(c, "Softy, fra topp til tå.", "Softy, from head to toe.")}</h2><p>${pick(c, "En kolleksjon samler produktene. Produktkortet viser fargevalg; hurtigkjøp lar deg velge størrelse uten å forlate siden.", "A collection brings products together. Cards show color choices; quick-add lets you choose a size without leaving the page.")}</p><a class="fashion-button" href="${base}/collections/softy/">${pick(c, "Utforsk Softy", "Explore Softy")} ${arrow}</a></div>${image("editorial", pick(c, "Brunt Famme sett", "Brown Famme outfit"))}</section>`;
  } else if (route.startsWith("collections/")) {
    const key = route.slice(12);
    if (!Object.hasOwn(collectionLabels, key)) return null;
    const products = fashion.products.filter(
      (p) => key === "all" || p.collection === key,
    );
    title = pick(c, ...collectionLabels[key]);
    body = `<section class="design-shell fashion-catalog"><a class="under-link" href="${base}/">← ${pick(c, "Startside", "Home")}</a><div class="fashion-section-heading"><h1>${title}</h1><span>${products.length} ${pick(c, "produkter", "products")}</span></div><nav class="fashion-tabs" aria-label="${pick(c, "Kolleksjoner", "Collections")}">${Object.entries(
      collectionLabels,
    )
      .map(
        ([k, label]) =>
          `<a href="${base}/collections/${k}/" ${k === key ? 'aria-current="page"' : ""}>${pick(c, ...label)}</a>`,
      )
      .join(
        "",
      )}</nav><form class="fashion-filters" id="filter"><label>${pick(c, "Søk produkter", "Search products")}<input type="search" data-fashion-search placeholder="${pick(c, "Navn på produkt", "Product name")}"></label><label>${pick(c, "Tilgjengelighet", "Availability")}<select data-fashion-stock><option value="all">${pick(c, "Alle størrelser", "All sizes")}</option>${["XS", "S", "M", "L", "XL"].map((s) => `<option>${s}</option>`).join("")}</select></label><label>${pick(c, "Sorter", "Sort")}<select data-fashion-sort><option value="featured">${pick(c, "Utvalgt", "Featured")}</option><option value="asc">${pick(c, "Pris: lav til høy", "Price: low to high")}</option><option value="desc">${pick(c, "Pris: høy til lav", "Price: high to low")}</option></select></label></form><div class="fashion-products-grid" data-fashion-grid>${products.map((p) => fashionCard(p, c)).join("")}</div><p data-fashion-empty hidden>${pick(c, "Ingen produkter passer valgene.", "No products match your selection.")}</p><p class="fashion-result-count" data-fashion-results role="status"></p></section>`;
  } else if (route.startsWith("products/")) {
    const p = fashion.products.find((p) => p.handle === route.slice(9));
    if (!p) return null;
    title = p.title;
    body = `<section class="design-shell fashion-product-page"><a class="under-link" href="${base}/collections/${p.collection}/">← ${pick(c, ...collectionLabels[p.collection])}</a><div class="fashion-product-layout"><div class="fashion-product-gallery"><div data-fashion-main-image>${image(p.colors[0].image, p.title, true)}</div>${(p.gallery || []).map((name) => image(name, p.title)).join("")}</div><div class="fashion-product-copy"><h1>${h(p.title)}</h1><strong class="fashion-detail-price">${p.price.toLocaleString(language(c.locale))} kr</strong><p>${h(p.description[language(c.locale)])}</p>${fashionForm(p, c)}<details><summary>${pick(c, "Hvordan dette kobles til ReAI", "How this connects to ReAI")}</summary><p>${pick(c, "I en ekte butikk brukes publiserte variant-ID-er og priser fra Site API. Tilgjengelighet leses separat, og checkout validerer lager og pris på nytt. Her er pris, lager og produkt-ID-er lokale testdata.", "A real store uses published variant IDs and prices from the Site API. Availability is read separately; checkout revalidates stock and prices. Here prices, stock and IDs are local test data.")}</p><a href="/api/?endpoint=availabilities">${pick(c, "Prøv tilgjengelighets-API-et", "Try the availability API")} ${arrow}</a></details></div></div></section>`;
  } else return null;
  return frame(
    title,
    body +
      `<section class="design-shell fashion-learning"><b>${pick(c, "Dette designet kan du teste. Klærne kan du ikke kjøpe her.", "You can test this design. You cannot buy the clothing here.")}</b><p>${pick(c, "Bilder fra Famme brukes med tillatelse. Pris, kolleksjoner og lager er lokale testdata. Kurven har egen lagring og sender aldri en ordre til ReAI.", "Famme images are used with permission. Prices, collections and stock are local test data. The cart has separate storage and never submits an order to ReAI.")}</p><a href="/learn/catalog/">${pick(c, "Se hvordan en ekte katalog leveres fra ReAI", "See how ReAI delivers a real catalog")} ${arrow}</a></section>`,
    c,
    "famme",
    true,
  );
}
function fashionForm(p, c) {
  return `<form data-fashion-add="${p.handle}"><fieldset><legend>${pick(c, "Farge", "Color")}</legend><div class="fashion-color-options">${p.colors.map((x, i) => `<label><input type="radio" name="color" value="${x.key}" ${i === 0 ? "checked" : ""}><span class="fashion-swatch swatch-${x.key}"></span><span>${colorName(x.key, c)}</span></label>`).join("")}</div></fieldset><fieldset><legend>${pick(c, "Størrelse", "Size")}</legend><div class="fashion-size-options">${p.sizes.map((s) => `<label><input type="radio" name="size" value="${s}" required ${p.soldOut[p.colors[0].key]?.includes(s) ? "disabled" : ""}><span>${s}</span></label>`).join("")}</div></fieldset><p data-fashion-stock-message role="status">${pick(c, "Velg størrelse. Utsolgte varianter er deaktivert.", "Choose a size. Sold-out variants are disabled.")}</p><button class="fashion-button" type="submit" disabled>${pick(c, "Legg i testkurven", "Add to test cart")} +</button></form>`;
}
function fashionDialogs(c) {
  return `<dialog class="cart-drawer fashion-quick-dialog" data-fashion-quick-dialog aria-label="${pick(c, "Velg variant", "Choose variant")}"><div class="drawer-header"><h2>${pick(c, "Velg variant", "Choose variant")}</h2><button data-fashion-quick-close aria-label="${pick(c, "Lukk variantvalg", "Close variant selection")}">×</button></div><div data-fashion-quick-content></div></dialog><dialog class="cart-drawer fashion-cart" data-fashion-cart aria-label="${pick(c, "Testkurv", "Test cart")}"><div class="drawer-header"><h2>${pick(c, "Testkurven din", "Your test cart")}</h2><button data-fashion-cart-close aria-label="${pick(c, "Lukk testkurv", "Close test cart")}">×</button></div><p class="fashion-cart-disclosure">${pick(c, "Simulert kurv. Ingen betaling, ordre eller levering.", "Simulated cart. No payment, order or delivery.")}</p><div data-fashion-lines></div><div class="drawer-bottom"><div class="drawer-subtotal"><b>${pick(c, "Delsum", "Subtotal")}</b><strong data-fashion-total>0 kr</strong></div><a class="fashion-button" href="/products/test-betaling/">${pick(c, "Prøv ekte checkout fra 1 kr", "Try real checkout from 1 kr")} ${arrow}</a><p>${pick(c, "Dette åpner et separat digitalt testprodukt. Klærne følger ikke med til checkout.", "This opens a separate digital test product. Clothing is not carried into checkout.")}</p></div></dialog>`;
}
