import { designLearning } from "./ux.mjs";
import {
  escapeHtml as h,
  language,
  money,
  picture,
  renderGrid,
} from "./storefront.mjs";
import {
  renderCatalogFilters,
  renderCatalogTools,
} from "./catalog-filters.mjs";
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
  const name = {
    famme: "FAMME",
    essential: "ESSENTIAL",
    index: "INDEX",
    launch: "LAUNCH",
    lookbook: "LOOKBOOK",
    trade: "TRADE",
  }[theme];
  const root =
    theme === "index" ? "/designs/collections/" : `/designs/${theme}/`;
  const nav =
    theme === "lookbook"
      ? [
          ["#stories", pick(c, "Historier", "Stories")],
          ["#collections", pick(c, "Kolleksjoner", "Collections")],
        ]
      : theme === "launch"
        ? [
            ["#gift", pick(c, "Gavekort", "Gift card")],
            ["#flow", pick(c, "Slik fungerer det", "How it works")],
          ]
        : theme === "trade"
          ? [
              ["#products", pick(c, "Bestill", "Order")],
              ["#invoice", pick(c, "Faktura & EHF", "Invoice & EHF")],
            ]
          : fixture
            ? [
                [
                  `${base}/collections/all/`,
                  pick(c, "Nyheter", "New arrivals"),
                ],
                [
                  `${base}/#collections`,
                  pick(c, "Kolleksjoner", "Collections"),
                ],
                [`${base}/collections/jeans/`, "Jeans"],
                [`${base}/collections/softy/`, "Softy"],
              ]
            : theme === "essential"
              ? [
                  ["#products", pick(c, "Produktene", "Products")],
                  ["#flow", pick(c, "Slik virker det", "How it works")],
                ]
              : [
                  [
                    "/designs/collections/",
                    pick(c, "Kolleksjoner", "Collections"),
                  ],
                  ["/shop/", pick(c, "Alle produkter", "All products")],
                  [
                    "/learn/catalog/",
                    pick(c, "Slik virker det", "How it works"),
                  ],
                ];
  return `<!doctype html><html lang="${language(c.locale)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="description" content="${h(pick(c, "ReAI butikkdesign med samlinger, variantvalg og handlekurv i skuff.", "ReAI storefront designs with collections, variants and a cart drawer."))}"><title>${h(title)} · ReAI ${pick(c, "butikkdesign", "storefront design")}</title><link rel="icon" href="/assets/mark.svg"><link rel="stylesheet" href="/assets/demo.css"><link rel="stylesheet" href="/assets/designs.css"><link rel="stylesheet" href="/assets/ux-notes.css"></head><body data-locale="${language(c.locale)}" data-store-theme="${theme}" data-checkout-origin="${h(c.checkoutOrigin || "https://app.reai.no")}" data-payment-mode="${fixture ? "disabled" : h(c.paymentMode || "disabled")}" ${fixture ? "data-fashion-store" : "data-live-store"}><a class="skip" href="#main">${pick(c, "Hopp til innhold", "Skip to content")}</a><div class="design-notice"><a href="/designs/">← ${pick(c, "Alle butikkdesign", "All storefront designs")}</a><span>${fixture ? pick(c, "Design-test · Famme-bilder · ingen salg av klær", "Design test · Famme photography · no clothing for sale") : c.preview ? pick(c, "Lokal forhåndsvisning · ingen betaling", "Local preview · no payments") : pick(c, "ReAI sin test-nettbutikk · Mottaker: ", "ReAI test store · Recipient: ") + h(c.merchantName || "Better Integration")}</span><a class="language" href="?lang=${language(c.locale) === "nb" ? "en" : "nb"}">${pick(c, "EN", "NO")}</a></div><header class="design-header"><a class="design-brand" href="${root}">${name}<small>/ REAI ${fixture ? "DESIGN TEST" : "SITE API"}</small></a><nav aria-label="${pick(c, "Butikkmeny", "Store navigation")}">${nav.map(([url, label]) => `<a href="${url}">${label}</a>`).join("")}</nav><div class="design-header-actions">${fixture ? `<a href="${base}/collections/all/#filter" aria-label="${pick(c, "Søk produkter", "Search products")}">${search}</a>` : ""}<button type="button" ${fixture ? "data-fashion-cart-open" : "data-cart-open"} aria-label="${pick(c, fixture ? "Testkurv" : "Handlekurv", fixture ? "Test cart" : "Cart")}">${bag}<span ${fixture ? "data-fashion-count" : "data-cart-count"}>0</span></button><button class="design-menu" aria-label="${pick(c, "Åpne meny", "Open navigation")}" aria-expanded="false">☰</button></div></header><main id="main">${body}${designLearning(theme === "index" ? "collections" : theme, c)}</main><footer class="design-footer"><a class="design-brand" href="/designs/">${name}<small>/ REAI</small></a><p>${fixture ? pick(c, "Famme-fotografier brukt med tillatelse. Fiktiv katalog og separat testkurv.", "Famme photography used with permission. Fictional catalog and separate test cart.") : pick(c, "Design i Git. Produkter, priser og ordre i ReAI.", "Design in Git. Products, prices and orders in ReAI.")}</p><a href="/learn/catalog/">${pick(c, "Lær om Site API", "Learn about the Site API")} ${arrow}</a></footer>${fixture ? fashionDialogs(c) : liveDrawer(c)}<script type="module" src="/assets/catalog-context.js"></script><script type="module" src="/assets/catalog-filters.js"></script><script src="/assets/${fixture ? "fashion" : "demo"}.js" type="module"></script><script src="/assets/designs.js" defer></script></body></html>`;
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
    `<section class="design-shell index-intro"><div><h1>${h(selected?.title || pick(c, "Finn din samling.", "Find your collection."))}</h1><p>${h(selected?.description || pick(c, "Bla etter formål. Samlingene, produktene og prisene hentes fra ReAI.", "Browse by purpose. Collections, products and prices come from ReAI."))}</p></div><a href="/learn/collections/#filtering">${pick(c, "Fra produktdata til filtre", "From product data to filters")} ${arrow}</a></section><div class="design-shell index-layout" data-catalog><aside><h2>${pick(c, "Kolleksjoner", "Collections")}</h2><details class="catalog-collection-menu"><summary>${h(selected?.title || pick(c, "Alle produkter", "All products"))} <span aria-hidden="true">⌄</span></summary><nav aria-label="${pick(c, "Velg samling", "Select a collection")}"><a href="/designs/collections/" ${selected ? "" : 'aria-current="page"'}>${pick(c, "Alle produkter", "All products")} <span>${store.products.length}</span></a>${(store.collections || []).map((col) => `<a href="/designs/collections/${h(col.handle)}/" ${selected?.handle === col.handle ? 'aria-current="page"' : ""}>${h(col.title)} ${arrow}</a>`).join("")}</nav></details>${renderCatalogFilters(products, store, language(c.locale))}</aside><section>${renderCatalogTools(products, language(c.locale))}${renderGrid(products, store)}<p data-catalog-empty hidden></p></section></div>`,
    c,
    "index",
  );
}
function image(name, alt = "", eager = false) {
  return `<img src="/assets/famme/${name}.avif" width="800" height="1200" alt="${h(alt)}" loading="${eager ? "eager" : "lazy"}">`;
}
function fashionCard(p, c) {
  return `<article class="fashion-card product-card" data-product-id="${h(p.handle)}" data-fashion-card data-title="${h(p.title)}" data-price="${p.price}" data-collection="${p.collection}"><a class="fashion-card-image" href="${base}/products/${p.handle}/">${image(p.colors[0].image, p.title)}</a><div class="fashion-card-heading"><h3><a href="${base}/products/${p.handle}/">${h(p.title)}</a></h3><span data-product-price>${p.price.toLocaleString(language(c.locale))} kr</span></div><div class="fashion-card-swatches">${p.colors.map((color, i) => `<button type="button" class="fashion-swatch swatch-${color.key}" data-card-color="${color.image}" data-color-name="${color.key}" aria-label="${h(p.title)} ${colorName(color.key, c)}" aria-pressed="${i === 0}"></button>`).join("")}</div><button class="fashion-quick-add" data-fashion-quick="${p.handle}" type="button">${pick(c, "Velg størrelse", "Choose size")} <span>+</span></button></article>`;
}
export function colorName(key, c) {
  return pick(
    c,
    { brown: "Brun", black: "Svart", grey: "Grå", khaki: "Khaki" }[key] || key,
    { brown: "Brown", black: "Black", grey: "Grey", khaki: "Khaki" }[key] ||
      key,
  );
}
export function fashionFilterProducts(products, c) {
  return products.map((p) => ({
    id: p.handle,
    title: p.title,
    description: p.description[language(c.locale)],
    productType: p.collection,
    attributes: [],
    variants: p.colors.flatMap((color) =>
      p.sizes.map((size) => ({
        id: `fashion-${p.handle}-${color.key}-${size}`,
        price: p.price,
        options: [{ name: "Size", value: size }],
        attributes: [
          {
            key: "color",
            name: pick(c, "Farge", "Color"),
            values: [
              {
                id: color.key,
                label: colorName(color.key, c),
                aliases: [color.key],
                taxonomyValues: [],
                colors: [],
              },
            ],
          },
        ],
      })),
    ),
  }));
}
export function fashionAvailability(products) {
  return products.flatMap((p) =>
    p.colors.flatMap((color) =>
      p.sizes.map((size) => [
        `fashion-${p.handle}-${color.key}-${size}`,
        p.soldOut[color.key]?.includes(size)
          ? "OUT_OF_STOCK"
          : p.backorder[color.key]?.includes(size)
            ? "BACKORDER"
            : "AVAILABLE",
      ]),
    ),
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
    body = `<section class="design-shell fashion-catalog"><a class="under-link" href="${base}/">← ${pick(c, "Startside", "Home")}</a><div class="fashion-section-heading"><h1>${title}</h1><span>${products.length} ${products.length === 1 ? pick(c, "produkt", "product") : pick(c, "produkter", "products")}</span></div><nav class="fashion-tabs" aria-label="${pick(c, "Kolleksjoner", "Collections")}">${Object.entries(
      collectionLabels,
    )
      .map(
        ([k, label]) =>
          `<a href="${base}/collections/${k}/" ${k === key ? 'aria-current="page"' : ""}>${pick(c, ...label)}</a>`,
      )
      .join(
        "",
      )}</nav><div class="index-layout" data-catalog id="filter"><aside>${renderCatalogFilters(fashionFilterProducts(products, c), { currency: "NOK" }, language(c.locale), { explain: false, availability: fashionAvailability(products) })}</aside><div>${renderCatalogTools(products, language(c.locale))}<div class="fashion-products-grid product-grid" data-fashion-grid>${products.map((p) => fashionCard(p, c)).join("")}</div><p data-catalog-empty hidden></p></div></div></section>`;
  } else if (route.startsWith("products/")) {
    const p = fashion.products.find((p) => p.handle === route.slice(9));
    if (!p) return null;
    title = p.title;
    body = `<section class="design-shell fashion-product-page"><nav class="ux-product-nav"><a href="${base}/">${pick(c,"Startside","Home")}</a><span>/</span><a href="${base}/collections/${p.collection}/">${pick(c, ...collectionLabels[p.collection])}</a><a class="ux-return-list" data-catalog-return hidden>← ${pick(c,"Tilbake til resultatlisten","Back to results")}</a></nav><div class="fashion-product-layout"><div class="fashion-product-gallery"><div data-fashion-main-image>${image(p.colors[0].image, p.title, true)}</div><button type="button" class="ux-image-open" data-fashion-zoom>${pick(c, "Se bilde og zoom", "View image and zoom")} ↗</button><div class="fashion-thumbnails" aria-label="${pick(c, "Produktbilder", "Product images")}">${[...new Set([...p.colors.map((x) => x.image), ...(p.gallery || [])])].map((name, i) => `<button type="button" data-fashion-image="${h(name)}" aria-label="${pick(c, "Se bilde", "View image")} ${i + 1}" aria-pressed="${i === 0}">${image(name, p.title)}</button>`).join("")}</div></div><div class="fashion-product-copy"><h1>${h(p.title)}</h1><strong class="fashion-detail-price">${p.price.toLocaleString(language(c.locale))} kr</strong><p>${h(p.description[language(c.locale)])}</p>${fashionForm(p, c)}<section class="ux-product-sections"><details open><summary>${pick(c,"Materiale og passform","Material and fit")}</summary><p>${pick(c,"Dette er en design-test. Ingen verifisert materialsammensetning er publisert. En ekte butikk må vise produktspesifikke, godkjente materialer og måldata; de skal ikke utledes fra bildene.","This is a design test. No verified composition is published. A real store must show approved product-specific materials and measurement data; do not infer them from photos.")}</p></details><details><summary>${pick(c,"Levering og retur i dette eksemplet","Delivery and returns in this example")}</summary><p>${pick(c,"Klærne kan ikke kjøpes og blir ikke levert. I en virkelig butikk vises kostnad, estimert dato, returfrist, kostnader og unntak fra selgerens vilkår nær kjøpsvalget.","The clothing cannot be purchased or delivered. A real store displays costs, estimated arrival, return window, fees and exceptions from merchant terms near the purchase choice.")}</p><a href="/ux/delivery-dates/">${pick(c,"Test levering i checkout-laben","Test delivery in the checkout lab")} ↗</a></details></section><details><summary>${pick(c, "Hvordan dette kobles til ReAI", "How this connects to ReAI")}</summary><p>${pick(c, "I en ekte butikk brukes publiserte variant-ID-er og priser fra Site API. Tilgjengelighet leses separat, og checkout validerer lager og pris på nytt. Her er pris, lager og produkt-ID-er lokale testdata.", "A real store uses published variant IDs and prices from the Site API. Availability is read separately; checkout revalidates stock and prices. Here prices, stock and IDs are local test data.")}</p><a href="/api/?endpoint=availabilities">${pick(c, "Prøv tilgjengelighets-API-et", "Try the availability API")} ${arrow}</a></details></div></div></section>`;
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
  return `<form data-fashion-add="${p.handle}"><fieldset><legend>${pick(c, "Farge", "Color")}</legend><div class="fashion-color-options">${p.colors.map((x, i) => `<label><input type="radio" name="color" value="${x.key}" ${i === 0 ? "checked" : ""}><span class="fashion-swatch swatch-${x.key}"></span><span>${colorName(x.key, c)}</span></label>`).join("")}</div></fieldset><fieldset><legend>${pick(c, "Størrelse", "Size")}</legend><div class="fashion-size-options">${p.sizes.map((s) => `<label><input type="radio" name="size" value="${s}" required ${p.soldOut[p.colors[0].key]?.includes(s) ? "disabled" : ""}><span>${s}<small data-size-status>${p.soldOut[p.colors[0].key]?.includes(s) ? pick(c, "Utsolgt", "Sold out") : ""}</small></span></label>`).join("")}</div></fieldset><p data-fashion-stock-message role="status">${pick(c, "Velg størrelse. Utsolgte varianter er deaktivert.", "Choose a size. Sold-out variants are disabled.")}</p><button class="fashion-button" type="submit" disabled>${pick(c, "Legg i testkurven", "Add to test cart")} +</button></form>`;
}
function fashionDialogs(c) {
  return `<dialog class="cart-drawer fashion-quick-dialog" data-fashion-quick-dialog aria-label="${pick(c, "Velg variant", "Choose variant")}"><div class="drawer-header"><h2>${pick(c, "Velg variant", "Choose variant")}</h2><button data-fashion-quick-close aria-label="${pick(c, "Lukk variantvalg", "Close variant selection")}">×</button></div><div data-fashion-quick-content></div></dialog><dialog class="cart-drawer fashion-cart" data-fashion-cart aria-label="${pick(c, "Testkurv", "Test cart")}"><div class="drawer-header"><h2>${pick(c, "Testkurven din", "Your test cart")}</h2><button data-fashion-cart-close aria-label="${pick(c, "Lukk testkurv", "Close test cart")}">×</button></div><p class="fashion-cart-disclosure">${pick(c, "Simulert kurv. Ingen betaling, ordre eller levering.", "Simulated cart. No payment, order or delivery.")}</p><div data-fashion-lines></div><div class="drawer-bottom"><div class="drawer-subtotal"><b>${pick(c, "Delsum", "Subtotal")}</b><strong data-fashion-total>0 kr</strong></div><a class="fashion-button" href="/products/test-betaling/">${pick(c, "Prøv ekte checkout fra 1 kr", "Try real checkout from 1 kr")} ${arrow}</a><p>${pick(c, "Dette åpner et separat digitalt testprodukt. Klærne følger ikke med til checkout.", "This opens a separate digital test product. Clothing is not carried into checkout.")}</p></div></dialog>`;
}
function amountForm(p, store, availability, c) {
  const statuses = new Map(
    (availability.variants || []).map((v) => [v.variantId, v.status]),
  );
  const selected = p.variants.find((v) => statuses.get(v.id) === "AVAILABLE");
  return `<form data-add-to-cart data-amount-form><fieldset><legend>${pick(c, "Velg beløp", "Choose amount")}</legend><div class="amount-options">${p.variants.map((v) => `<label><input type="radio" name="variantId" value="${h(v.id)}" data-amount="${h(money(v.price, store))}" ${v.id === selected?.id ? "checked" : ""} ${statuses.get(v.id) === "AVAILABLE" ? "" : "disabled"}><span>${h(money(v.price, store))}</span></label>`).join("")}</div></fieldset><span class="sr-only" data-selected-amount>${selected ? h(money(selected.price, store)) : pick(c, "Utilgjengelig", "Unavailable")}</span><input type="hidden" name="quantity" value="1"><button class="button" ${selected ? "" : "disabled"}>${pick(c, "Legg i kurven", "Add to cart")} ${arrow}</button><p data-add-message role="status"></p></form>`;
}
export function renderLaunch(store, availability, c) {
  const gift = store.products.find((p) => p.handle === "reai-gavekort");
  return frame(
    "Launch",
    `<section class="launch-hero" id="gift"><div class="design-shell launch-layout"><div><h1>${pick(c, "Gi et gavekort<br>til ReAI.", "Give a gift card<br>for ReAI.")}</h1><p>${pick(c, "Velg beløp. Gavekortet håndteres manuelt via post@reai.no.", "Choose an amount. Gift cards are handled manually through post@reai.no.")}</p>${gift ? amountForm(gift, store, availability, c) : `<p>${pick(c, "Gavekortet er ikke publisert i dette markedet.", "The gift card is not published in this market.")}</p>`}</div><div class="launch-art"><img src="/assets/gift.svg" width="640" height="640" alt="${pick(c, "Illustrert ReAI gavekort", "Illustrated ReAI gift card")}" fetchpriority="high"></div></div></section><section class="design-shell launch-flow" id="flow"><h2>${pick(c, "Én vare. Hele kjøpsflyten.", "One product. The complete purchase flow.")}</h2><div class="launch-steps">${[
      [
        "Velg beløp",
        "Choose an amount",
        "Beløpene er publiserte varianter i ReAI. Pris og tilgjengelighet leses fra API-et.",
        "Amounts are published ReAI variants. Prices and availability come from the API.",
      ],
      [
        "Betal i ReAI",
        "Pay in ReAI",
        "Gå fra kurven til checkout. Mottaker og betalingsmodus vises før du åpner kassen.",
        "Go from the cart to checkout. The recipient and payment mode are shown before opening checkout.",
      ],
      [
        "Innløs manuelt",
        "Redeem manually",
        "Etter bekreftet betaling, send ordrebekreftelsen til post@reai.no for bruk til ReAI.",
        "After confirmed payment, email the order confirmation to post@reai.no for use with ReAI.",
      ],
    ]
      .map(
        ([a, b, x, y], i) =>
          `<article><span>${i + 1}</span><div><h3>${pick(c, a, b)}</h3><p>${pick(c, x, y)}</p></div></article>`,
      )
      .join(
        "",
      )}</div><div class="launch-note"><p>${pick(c, "Digitalt gavekort, uten automatisk kode eller saldo. Mottaker: ", "Digital gift card, without an automatic code or balance. Recipient: ")}${h(c.merchantName || "Better Integration")}.</p><a href="/learn/checkout-test/">${pick(c, "Se hele sjekklisten", "See the complete checklist")} ${arrow}</a></div></section>`,
    c,
    "launch",
  );
}
export function renderLookbook(c) {
  const clothes = ["half-zip", "straight-sweatpants"].map((handle) =>
    fashion.products.find((p) => p.handle === handle),
  );
  const rows = clothes
    .map(
      (p) =>
        `<article class="lookbook-row" data-fashion-card><div><h3>${h(p.title)}</h3><p>${h(p.description[language(c.locale)])}</p><span>${p.price.toLocaleString(language(c.locale))} kr · ${pick(c, "testpris", "test price")}</span></div><div class="lookbook-row-images">${p.colors.map((color) => image(color.image, p.title + " " + colorName(color.key, c))).join("")}</div><div class="lookbook-row-action"><p>${pick(c, "Farger og størrelser velges i skuffen. Enkelte varianter er utsolgt.", "Choose colors and sizes in the drawer. Some variants are sold out.")}</p><button type="button" class="fashion-button" data-fashion-quick="${p.handle}">${pick(c, "Velg størrelse", "Choose size")} ${arrow}</button><a href="${base}/products/${p.handle}/">${pick(c, "Se produktet", "View product")}</a></div></article>`,
    )
    .join("");
  return frame(
    "Lookbook",
    `<section class="lookbook-hero" id="stories"><div class="lookbook-copy"><h1>${pick(c, "Et antrekk.<br>Flere valg.", "One outfit.<br>More choices.")}</h1><p>${pick(c, "Se hvordan bilder kan åpne produktvalg, uten å forlate historien.", "See how photographs can open product choices without leaving the story.")}</p><a class="under-link" href="#outfit">${pick(c, "Utforsk antrekket", "Explore the outfit")} ${arrow}</a></div><div class="lookbook-image">${image("editorial", pick(c, "Brunt Famme antrekk", "Brown Famme outfit"), true)}<button class="lookbook-pin pin-top" type="button" data-fashion-quick="half-zip" aria-label="${pick(c, "Velg Half Zip Sweater i bildet", "Choose Half Zip Sweater in the photo")}">+</button><button class="lookbook-pin pin-bottom" type="button" data-fashion-quick="straight-sweatpants" aria-label="${pick(c, "Velg Straight Sweatpants i bildet", "Choose Straight Sweatpants in the photo")}">+</button><span class="lookbook-caption">${pick(c, "Velg plagg i bildet", "Choose a piece in the photo")}</span></div></section><section class="design-shell lookbook-outfit" id="outfit"><div class="lookbook-heading"><h2>${pick(c, "Velg plaggene.", "Choose the pieces.")}</h2><span></span></div>${rows}</section><section class="lookbook-collection" id="collections">${image("collection-jeans", "Famme jeans")}<div><h2>${pick(c, "Bilder viser uttrykket.<br>Kolleksjoner samler varene.", "Images show the style.<br>Collections bring products together.")}</h2><nav aria-label="${pick(c, "Kolleksjoner", "Collections")}">${["jeans", "softy", "layers"].map((key) => `<a class="under-link" href="${base}/collections/${key}/">${pick(c, ...collectionLabels[key])} ${arrow}</a>`).join("")}</nav></div>${image("jeans-detail", "Famme jeans detail")}</section><div class="design-shell lookbook-disclosure"><p>${pick(c, "Illustrerende produktdata og separat testkurv. Ingen klær sendes til checkout. Famme-bilder brukes med tillatelse.", "Illustrative product data and a separate test cart. No clothing is carried into checkout. Famme photography is used with permission.")}</p><a href="/learn/collections/">${pick(c, "Fra produktdata til kolleksjonsdesign", "From product data to collection design")} ${arrow}</a></div>`,
    c,
    "lookbook",
    true,
  );
}
export function renderTrade(store, availability, c) {
  const statuses = new Map(
    (availability.variants || []).map((v) => [v.variantId, v.status]),
  );
  const items = ["test-betaling", "reai-gavekort", "heia-reai"].flatMap(
    (handle) => store.products.filter((p) => p.handle === handle),
  );
  const groups = items
    .map(
      (p) =>
        `<section class="trade-group"><div class="trade-group-heading"><h2><a href="/products/${h(p.handle)}/">${h(p.title)}</a></h2><p>${pick(c, ...productCopy[p.handle])}</p></div><div class="trade-columns" aria-hidden="true"><span>${pick(c, "Variant", "Variant")}</span><span>${pick(c, "Pris inkl. MVA", "Price incl. VAT")}</span><span>${pick(c, "Antall", "Quantity")}</span><span></span></div>${p.variants
          .map((v) => {
            const available = statuses.get(v.id) === "AVAILABLE",
              label =
                v.options?.map((o) => o.value).join(" / ") || v.sku || p.title;
            return `<form class="trade-row" data-add-to-cart data-add-inline><div><b>${h(label)}</b><small>${available ? pick(c, "Tilgjengelig", "Available") : pick(c, "Utilgjengelig", "Unavailable")}</small></div><strong>${h(money(v.price, store))}</strong><label><span class="sr-only">${pick(c, "Antall", "Quantity")} ${h(p.title)} ${h(label)}</span><input name="quantity" type="number" min="1" max="20" value="1" required ${available ? "" : "disabled"}></label><input type="hidden" name="variantId" value="${h(v.id)}"><button class="button" ${available ? "" : "disabled"} aria-label="${pick(c, "Legg til", "Add")} ${h(p.title)} ${h(label)}">${pick(c, "Legg til", "Add")}</button><p class="sr-only" data-add-message role="status"></p></form>`;
          })
          .join("")}</section>`,
    )
    .join("");
  return frame(
    "Trade",
    `<section class="design-shell trade-main" id="products"><h1>${pick(c, "Bestill flere varianter. På én side.", "Order several variants. On one page.")}</h1><p class="trade-intro">${pick(c, "En kompakt bestillingsliste med priser, antall og tilgjengelighet fra ReAI.", "A compact ordering list with prices, quantities and availability from ReAI.")}</p><p class="trade-cart-feedback" data-trade-feedback role="status" aria-live="polite"></p>${groups || `<p>${pick(c, "Ingen produkter er publisert her.", "No products are published here.")}</p>`}<div class="trade-cart-link"><button class="button" type="button" data-cart-open>${pick(c, "Se bestillingen", "Review order")} ${arrow}</button></div><section class="trade-invoice" id="invoice"><h2>${pick(c, "Nettordre er ikke alltid forskuddsbetalt.", "Online orders are not always prepaid.")}</h2><div><article><h3>${pick(c, "Betal nå", "Pay now")}</h3><p>${pick(c, "ReAI checkout bruker Adyen og betalingsmåtene som er konfigurert for butikken. En retur til nettsiden er ikke bevis på bekreftet betaling.", "ReAI checkout uses Adyen and the payment methods configured for the store. Returning to the website does not prove a confirmed payment.")}</p><a href="/learn/payments/">${pick(c, "Se betalingsflyten", "See the payment flow")} ${arrow}</a></article><article><h3>${pick(c, "Kjøp på faktura", "Buy on invoice")}</h3><p>${pick(c, "Firmasøk og fakturaordre brukes når butikken tillater det. Ordren er ubetalt; fakturautstedelse og EHF skjer senere i ReAI.", "Company search and invoice orders are available when enabled for the store. The order is unpaid; invoice issuance and EHF delivery happen later in ReAI.")}</p><a href="/learn/business/">${pick(c, "Se B2B-flyten", "See the B2B flow")} ${arrow}</a></article></div><p class="trade-disclosure">${pick(c, "Dette er digitale testprodukter. Ingen fysisk levering. Fakturakjøp oppretter en ekte ubetalt ordre; ikke fullfør bare for å prøve grensesnittet.", "These are digital test products. No physical delivery. Invoice checkout creates a real unpaid order; do not submit merely to try the interface.")}</p></section></section>`,
    c,
    "trade",
  );
}
