import {
  homeContent,
  designGallery,
  designContent,
  scenarioContent,
  newsletter,
  arrow,
} from "./showcase.mjs";
import { lessons, operations } from "../content/education.mjs";
export const escapeHtml = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const HANDLE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const h = escapeHtml;
export const copy = {
  nb: {
    shop: "Live-butikk",
    features: "Lær ReAI",
    about: "Om test-nettbutikken",
    cart: "Handlekurv",
    add: "Legg i kurven",
    choose: "Velg variant",
    all: "Alle produkter",
    from: "Fra",
    demo: "ReAI sin test-nettbutikk · Se betalingsmodus før checkout.",
    empty: "Ingen produkter er publisert i dette markedet ennå.",
    back: "Tilbake til butikken",
    quantity: "Antall",
    variants: "Velg variant",
    checkout: "Fortsett til ReAI checkout",
    subtotal: "Sum produkter",
    cartEmpty: "Handlekurven er tom.",
    remove: "Fjern",
    live: "Data fra ReAI",
    noToken:
      "Test-nettbutikken er ikke koblet til ReAI ennå. Statisk innhold virker; katalog og checkout åpnes når oppsettet er klart.",
    wait: "Henter katalogen…",
    pay: "Betalingsmodus",
    disabled: "Checkout er ikke aktivert",
    test: "Adyen testbetaling — ingen ekte trekk",
    livePay: "Ekte betaling — beløpet trekkes",
    gift: "Kontakt oss for å bruke gavekortet",
    search: "Søk i katalogen",
    results: "Produkter",
    returned: "Tilbake fra checkout",
    returnText:
      "Retur hit er ikke en betalingsbekreftelse. Se betalingsstatus og kvittering i ReAI checkout.",
    api: "Utforsk API-et",
    basket: "Handlekurven din",
    saved: "Lagt i handlekurven",
    related: "Flere produkter",
    stock: "Tilgjengelighet sjekkes i ReAI",
    status: "API-status",
  },
  en: {
    shop: "Shop",
    features: "Learn ReAI",
    about: "About the test store",
    cart: "Cart",
    add: "Add to cart",
    choose: "Choose an option",
    all: "All products",
    from: "From",
    demo: "ReAI test store · Check payment mode before checkout.",
    empty:
      "No products have been published in this market yet.",
    back: "Back to the shop",
    quantity: "Quantity",
    variants: "Choose variant",
    checkout: "Continue to ReAI checkout",
    subtotal: "Product subtotal",
    cartEmpty: "Your cart is empty.",
    remove: "Remove",
    live: "Data from ReAI",
    noToken:
      "The test store is not connected to ReAI yet. Editorial pages work; catalog and checkout open when setup is ready.",
    wait: "Loading the catalog…",
    pay: "Payment mode",
    disabled: "Checkout is not enabled",
    test: "Adyen test payment — no real charge",
    livePay: "Real payment — you will be charged",
    gift: "Contact us to redeem the gift card",
    search: "Search the catalog",
    results: "Products",
    returned: "Back from checkout",
    returnText:
      "Returning here is not payment confirmation. Check payment status and receipt in ReAI checkout.",
    api: "Explore the API",
    basket: "Your cart",
    saved: "Added to cart",
    related: "More products",
    stock: "Availability is checked in ReAI",
    status: "API status",
  },
};
export function language(locale) {
  return String(locale).startsWith("en") ? "en" : "nb";
}
export function money(amount, store) {
  return new Intl.NumberFormat(store.locale || "nb-NO", {
    style: "currency",
    currency: store.currency || "NOK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}
function richDescription(item) {
  return item.descriptionHtml
    ? `<div class="rich-description">${item.descriptionHtml}</div>`
    : `<p class="lead">${h(item.description || "")}</p>`;
}
function art(product) {
  const key = product.handle || "";
  return key.includes("gavekort")
    ? "gift"
    : key.includes("greg")
      ? "mug"
      : key.includes("zen")
        ? "cloud"
        : key.includes("konfetti")
          ? "confetti"
          : key.includes("mandag")
            ? "sun"
            : "heart";
}
export function picture(product, eager = false) {
  const img = product.images?.[0];
  if (img && /^https?:\/\//.test(img.url))
    return `<img src="${h(img.url)}" alt="${h(img.alt || product.title)}" ${img.width ? `width="${Number(img.width)}"` : ""} ${img.height ? `height="${Number(img.height)}"` : ""} ${
      img.renditions?.length
        ? `srcset="${img.renditions
            .filter((x) => /^https?:\/\//.test(x.url) && x.width > 0)
            .map((x) => `${h(x.url)} ${Number(x.width)}w`)
            .join(", ")}" sizes="(max-width: 700px) 90vw, 40vw"`
        : ""
    } loading="${eager ? "eager" : "lazy"}">`;
  return `<img src="/assets/${art(product)}.svg" alt="${h(product.title)}" width="640" height="640" loading="${eager ? "eager" : "lazy"}">`;
}
function variantLabel(variant, store) {
  const price = money(variant.price, store),
    option = variant.options?.map((o) => o.value).join(" / ") || variant.sku || "Standard";
  return option.replace(/\s/g, "") === price.replace(/\s/g, "")
    ? price
    : `${option} — ${price}`;
}
function card(product, store) {
  const t = copy[language(store.locale)],
    v = product.variants || [],
    prices = v.map((x) => Number(x.price)).filter(Number.isFinite),
    min = prices.length ? Math.min(...prices) : null,
    reference = v.find(
      (x) =>
        Number(x.price) === min && Number(x.compareAtPrice) > Number(x.price),
    )?.compareAtPrice;
  return `<article class="product-card"><a class="product-art art-${art(product)}" href="/products/${h(product.handle)}/">${picture(product)}<span class="art-tag">${product.handle === "reai-gavekort" ? (language(store.locale) === "nb" ? "GAVEKORT" : "GIFT CARD") : product.handle === "heia-reai" ? (language(store.locale) === "nb" ? "STØTT REAI" : "SUPPORT REAI") : "TEST PRODUCT"}</span><span class="round-arrow" aria-hidden="true">↗</span></a><div class="product-meta"><h3><a href="/products/${h(product.handle)}/">${h(product.title)}</a></h3><span>${min === null ? "" : `${new Set(prices).size > 1 ? t.from + " " : ""}${h(money(min, store))}`}${reference ? ` <s class="reference-price">${h(money(reference, store))}</s>` : ""}</span></div><p class="product-caption">${h(
    String(product.description || "")
      .replace(/<[^>]*>/g, "")
      .split(". ")[0],
  )}</p><a class="small-link" href="/products/${h(product.handle)}/">${v.length > 1 ? t.choose : t.add} <span aria-hidden="true">↗</span></a></article>`;
}
export function documentHtml(title, body, context = {}) {
  const lang = language(context.locale),
    t = copy[lang],
    mode = context.paymentMode || "disabled",
    nb = lang === "nb",
    storeName = nb ? "ReAI sin test-nettbutikk" : "ReAI test store";
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="ReAI commerce showcase: storefront designs, Site API, checkout, payments, shipping and accounting."><meta name="theme-color" content="#ffffff"><meta name="robots" content="noindex, nofollow"><title>${h(title === storeName ? storeName : `${title} · ${storeName}`)}</title><link rel="icon" href="/assets/mark.svg"><link rel="stylesheet" href="/assets/demo.css"></head><body data-locale="${lang}" data-design="${h(context.design || "")}" data-payment-mode="${h(mode)}" data-checkout-origin="${h(context.checkoutOrigin || "https://app.reai.no")}"><a class="skip" href="#main">${nb ? "Hopp til innhold" : "Skip to content"}</a><div class="notice">${context.preview ? (nb ? "Lokal forhåndsvisning · fiktiv katalog · ingen betaling" : "Local preview · fictional catalog · no payments") : mode === "live" ? (nb ? "ReAI sin test-nettbutikk · Betaling i kassen fungerer, hele flyten kan testes" : "ReAI test store · Checkout payments work; test the full flow") : t.demo}</div><header class="header shell"><a class="brand" href="/"><strong>ReAI</strong><span>/ commerce</span></a><nav aria-label="${nb ? "Hovedmeny" : "Main navigation"}"><a href="/#primitives">${nb ? "Plattform" : "Platform"}</a><a href="/designs/">${nb ? "Butikkdesign" : "Storefront designs"}</a><a href="/features/">${t.features}</a><a href="/api/">API</a></nav><div class="header-actions"><a class="language" href="?lang=${nb ? "en" : "nb"}">${nb ? "EN" : "NO"}</a><button class="cart-pill" ${context.scenario ? "data-scenario-header-open" : "data-cart-open"} type="button" aria-label="${context.scenario ? (nb ? "Testkurv" : "Scenario cart") : t.cart}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l3 12h11l3-9H6M9 20h.01M18 20h.01" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><b ${context.scenario ? "data-scenario-count" : "data-cart-count"}>0</b></button><button class="menu-toggle" aria-label="${nb ? "Åpne meny" : "Open navigation"}" aria-expanded="false" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="1.6"/></svg></button></div></header><main id="main">${body}</main><footer class="footer shell"><div class="footer-top"><a class="brand" href="/"><strong>ReAI</strong><span>/ commerce</span></a><p>${nb ? "Produkter og ordre i ReAI. Design i ditt eget repo." : "Products and orders in ReAI. Design in your own repository."}</p><a href="https://reai.no">${nb ? "Om ReAI" : "About ReAI"} ${arrow}</a></div><div class="footer-bottom"><span>© ${new Date().getUTCFullYear()} ReAI</span><div><a href="/shop/">${nb ? "Test-nettbutikken" : "Test store"}</a><a href="/about/">${t.about}</a><a href="/privacy/">${nb ? "Personvern" : "Privacy"}</a><a href="https://github.com/beint-no/reai-site-examples">${nb ? "Kildekode" : "Source"}</a></div></div></footer><dialog class="cart-drawer" data-cart-drawer aria-label="${t.cart}"><div class="drawer-header"><h2>${t.cart}</h2><button data-cart-close aria-label="${nb ? "Lukk" : "Close"}">×</button></div><div data-drawer-lines></div><div class="drawer-bottom"><p>${nb ? "Live-katalog fra ReAI. Betalingsmodus og mottaker vises før checkout." : "Live catalog from ReAI. Payment mode and recipient are shown before checkout."}</p><a class="button" href="/cart/">${nb ? "Se handlekurven" : "View cart"} ${arrow}</a></div></dialog><script src="/assets/demo.js" defer></script><script src="/assets/showcase.js" defer></script></body></html>`;
}
export function renderHome(store, context) {
  return documentHtml(
    language(context.locale) === "nb" ? "ReAI sin test-nettbutikk" : "ReAI test store",
    homeContent(context),
    context,
  );
}
export function renderDesign(style, store, availability, context) {
  return documentHtml(
    style,
    designContent(
      style,
      store,
      availability,
      context,
      renderGrid(store.products || [], store),
    ),
    { ...context, design: style },
  );
}
export function renderDesigns(context) {
  return documentHtml(
    "Butikkdesign / Storefront designs",
    designGallery(context) + newsletter(context),
    context,
  );
}
export function renderScenario(style, context) {
  return documentHtml("UI lab", scenarioContent(style, context), {
    ...context,
    design: style,
    scenario: true,
  });
}
export function renderGrid(products, store) {
  return products.length
    ? `<div class="product-grid">${products.map((p) => card(p, store)).join("")}</div>`
    : `<div class="empty-state">✳<p>${copy[language(store.locale)].empty}</p></div>`;
}
/** @param {(Omit<import("../../packages/reai-site-client/site-api.d.ts").components["schemas"]["SiteStorefrontCollectionRes"], "products"> & {products: import("../../packages/reai-site-client/site-api.d.ts").components["schemas"]["SiteDeliveryProductRes"][]}) | null} [collection] */
export function renderShop(store, context, collection = null) {
  const lang = language(context.locale),
    t = copy[lang],
    products = collection ? collection.products || [] : store.products || [];
  return documentHtml(
    collection?.title || t.shop,
    `<section class="shell inner"><span class="eyebrow">LIVE / REAI SITE API</span><h1>${h(collection?.title || t.all)}</h1><p class="lead">${h(collection?.description || (lang === "nb" ? "Publisert katalog fra ReAI. Fiktive, digitale testprodukter." : "A published ReAI catalog. Fictional digital test products."))}</p><div class="shop-learning"><p>${lang === "nb" ? "Følg dataene: samlingene og prisene under leveres fra ReAI." : "Follow the data: these collections and prices are delivered by ReAI."}</p><a href="/learn/catalog/">${lang === "nb" ? "Hvordan virker samlinger?" : "How do collections work?"} ↗</a><a href="/learn/discounts/">${lang === "nb" ? "Prøv en rabattkode" : "Try a discount code"} ↗</a></div><div class="shop-toolbar"><div class="collection-filters"><a class="filter ${collection ? "" : "active"}" href="/shop/">${t.all}</a>${(store.collections || []).map((c) => `<a class="filter ${collection?.handle === c.handle ? "active" : ""}" href="/collections/${h(c.handle)}/">${h(c.title)}</a>`).join("")}</div><label class="search"><span class="sr-only">${t.search}</span><input data-search type="search" placeholder="${t.search}"><span aria-hidden="true">⌕</span></label></div>${renderGrid(products, store)}<p data-search-empty hidden>${lang === "nb" ? "Ingen treff. Prøv litt annen magi." : "No matches. Try another kind of magic."}</p></section>`,
    context,
  );
}
export function renderProduct(store, product, availability, context) {
  const lang = language(context.locale),
    t = copy[lang];
  return documentHtml(
    product.title,
    `<section class="shell inner"><a class="breadcrumb" href="/shop/">← ${t.back}</a><div class="product-detail"><div class="detail-art art-${art(product)}">${picture(product, true)}<span class="art-tag">REAI TEST PRODUCT</span></div><div class="detail-copy"><span class="eyebrow">${t.live.toUpperCase()}</span><h1>${h(product.title)}</h1>${richDescription(product)}${productCommerceNotes(product, store, context)}<form data-add-to-cart><label for="variant">${t.variants}</label><select id="variant" name="variantId">${(product.variants || []).map((v) => `<option value="${h(v.id)}" ${availability?.variants?.find((a) => a.variantId === v.id)?.status === "OUT_OF_STOCK" ? "disabled" : ""}>${h(variantLabel(v, store))}</option>`).join("")}</select><label for="quantity">${t.quantity}</label><input id="quantity" name="quantity" type="number" value="1" min="1" max="20"><button class="button" type="submit" ${(product.variants || []).some((v) => availability?.variants?.find((a) => a.variantId === v.id)?.status === "AVAILABLE") ? "" : "disabled"}>${t.add} <span>+</span></button><p data-add-message role="status"></p></form><div class="product-notes"><p><span class="dot"></span>${t.stock}</p><p>✳ ${lang === "nb" ? "Ingen fysisk levering. Se produktbeskrivelsen for hva kjøpet gjelder." : "No physical delivery. Read the description for what this purchase includes."}</p>${product.handle?.includes("gavekort") ? `<p>↗ <a href="mailto:post@reai.no">${t.gift}</a></p>` : ""}</div><details class="api-note"><summary>${lang === "nb" ? "Hva viser dette produktet?" : "What does this demonstrate?"}</summary><p>${lang === "nb" ? "Produktdetaljer, bilder og beløpsvarianter kommer fra Site API. Tilgjengelighet hentes separat, og checkout validerer pris og lager på nytt." : "Product detail, images and price variants come from Site API. Availability is fetched separately; checkout revalidates prices and stock."}</p><a href="/api/?product=${h(product.handle)}">${t.api} ↗</a></details></div></div><div class="section-heading"><h2>${t.related}</h2></div>${renderGrid((store.products || []).filter((p) => p.id !== product.id).slice(0, 3), store)}</section>`,
    context,
  );
}
function paymentDisclosure(context) {
  if (context.paymentMode !== "live") return "";
  const nb = language(context.locale) === "nb";
  return `<div class="payment-disclosure"><p><b>${nb ? "Ekte betalinger og fakturaordrer." : "Real payments and invoice orders."}</b></p><p>${nb ? "Betalingen går til" : "Payment goes to"} ${h(context.merchantName)}${context.merchantOrgNumber ? ` (${nb ? "org.nr." : "org. no."} ${h(context.merchantOrgNumber)})` : ""}.</p><p>${nb ? "Test betaling demonstrerer et kjøp uten levering. Donasjon til ReAI støtter utvikling hos Better Integration. ReAI gavekort kan brukes til ReAI via manuell innløsning: send ordrebekreftelsen til post@reai.no. Ingen fysiske varer sendes." : "Test a payment demonstrates a purchase without delivery. Donations to ReAI support development at Better Integration. ReAI gift cards can be used for ReAI through manual redemption: email your order confirmation to post@reai.no. No physical goods are shipped."}</p><p>${nb ? "Bedrift kan velge faktura i checkout. Sluttknappen oppretter da en ekte, ubetalt ordre; selger utsteder faktura senere." : "Businesses can choose Invoice in checkout. The final button then creates a real, unpaid order; the merchant issues its invoice later."} <a href="/learn/business/">${nb ? "Slik virker B2B og EHF" : "How B2B and EHF work"} ↗</a></p></div>`;
}
export function renderCart(context) {
  const t = copy[language(context.locale)],
    mode = context.paymentMode || "disabled";
  return documentHtml(
    t.cart,
    `<section class="shell inner cart-page"><span class="eyebrow">LIVE / REAI SITE API</span><h1>${t.basket}</h1><div class="cart-layout"><div data-cart-lines><p>${t.wait}</p></div><aside class="cart-summary"><h2>${t.subtotal}</h2><strong data-cart-total>—</strong><p>${t.pay}: <b>${mode === "test" ? t.test : mode === "live" ? t.livePay : t.disabled}</b></p>${paymentDisclosure(context)}<div class="cart-code-tip"><b>REAI-DEMO10</b><p>${language(context.locale) === "nb" ? "Prøv 10 % på «Testkjøp og støtte» i ReAI checkout. Gavekort er ikke omfattet. Summen over er før rabatt." : "Try 10% off “Test payments & support” in ReAI checkout. Gift cards are excluded. The subtotal above is before discounts."}</p><a href="/learn/discounts/">${language(context.locale) === "nb" ? "Se flere rabattregler" : "See more discount rules"} ↗</a></div><button class="button" data-checkout ${mode === "disabled" ? "disabled" : ""}>${t.checkout} ↗</button><p data-checkout-message role="status"></p><p class="fineprint">${language(context.locale) === "nb" ? "ReAI beregner endelig pris og eventuelle rabatter i checkout." : "ReAI calculates final prices and any discounts at checkout."}</p></aside></div></section>`,
    context,
  );
}
export function renderEditorial(route, context) {
  const lang = language(context.locale),
    t = copy[lang];
  let title, body;
  if (route === "features" || route.startsWith("learn/")) {
    return renderLearning(
      route === "features" ? null : route.slice(6),
      context,
    );
  } else if (route === "about") {
    title = t.about;
    body = `<span class="eyebrow">${lang === "nb" ? "OM DENNE NETTBUTIKKEN" : "ABOUT THIS STORE"}</span><h1>${lang === "nb" ? "Slik bruker denne nettbutikken ReAI." : "How this storefront uses ReAI."}</h1><p class="lead">${lang === "nb" ? "Denne nettbutikken viser hvordan publiserte ReAI-data blir til ulike butikkdesign. Prøv variantvalg, lagerstatus, rabatter og checkout fra 1 kr. Du kan også kjøpe et ReAI gavekort eller støtte utviklingen med en donasjon." : "This store shows how published ReAI data becomes different storefront designs. Try variants, availability, discounts and checkout from 1 kr. You can also buy a ReAI gift card or support development with a donation."}</p><div class="prose"><h2>${t.pay}</h2><p>${context.paymentMode === "test" ? t.test : context.paymentMode === "live" ? t.livePay : t.disabled}.</p><p>${lang === "nb" ? "Better Integration er ReAIs ideelle utviklingspartner og publiserer åpen kildekode, blant annet Thim. Betalinger i denne nettbutikken mottas av Better Integration. Donasjoner støtter dette arbeidet. Gavekort brukes til ReAI etter manuell innløsning hos post@reai.no; ingen automatisk saldo eller gavekortkode opprettes." : "Better Integration is ReAI’s nonprofit development partner and publishes open-source software, including Thim. This store’s payments are received by Better Integration. Donations support that work. Gift cards pay for ReAI after manual redemption through post@reai.no; no automatic balance or gift-card code is created."}</p>${paymentDisclosure(context)}<h2>${lang === "nb" ? "Ekte dataflyt, tydelige grenser" : "Real data flow, clear boundaries"}</h2><p>${lang === "nb" ? "Utseende og forklaringer styres i Git. Publisert katalog, priser og aktiv checkout styres i ReAI. Ingen produktpriser er hardkodet i frontend." : "Design and explanations are maintained in Git. Published catalog, prices and active checkout are managed in ReAI. Frontend product prices are not hardcoded."}</p><a href="https://github.com/beint-no/reai-site-examples">${lang === "nb" ? "Se koden og dokumentasjonen" : "Read the source and documentation"} ↗</a></div>`;
  } else if (route === "return") {
    title = t.returned;
    body = `<div class="return-mark">✳</div><h1>${t.returned}</h1><p class="lead">${t.returnText}</p><a class="button" href="/shop/">${t.back} ↗</a>`;
  } else if (route === "privacy") {
    title = lang === "nb" ? "Personvern" : "Privacy";
    body = `<h1>${title}</h1><div class="prose"><p>${lang === "nb" ? "Handlekurven lagres lokalt i nettleseren. Dette nettstedet bruker ikke analyse- eller markedsføringsskript. Når du åpner ReAI checkout, behandles nødvendige ordre- og betalingsopplysninger der. E-postpåmelding lagrer e-post og eksplisitt samtykke hos Better Integration, Site-eieren, og sender ingen e-post automatisk. Trekk samtykket tilbake ved å kontakte post+owner@reai.no. Hosting og sikkerhet kan bruke tekniske forespørselslogger. Ikke bruk følsomme personopplysninger i demonstrasjonen." : "The cart is stored locally in your browser. This site uses no analytics or marketing scripts. ReAI checkout processes necessary order and payment details. Newsletter signup records your email and explicit consent with Better Integration, the Site owner; it does not send an email automatically. To withdraw consent, contact post+owner@reai.no. Hosting and security may use technical request logs. Do not enter sensitive personal information in the demonstration."}</p></div>`;
  } else {
    title = t.api;
    body = `<span class="eyebrow">${lang === "nb" ? "OFFENTLIGE BUTIKKDATA" : "PUBLIC STOREFRONT DATA"}</span><h1>${lang === "nb" ? "Prøv Site API med butikkens egne data." : "Try the Site API with the store’s own data."}</h1><p class="lead">${lang === "nb" ? "Alle elleve operasjoner i Site-leveringskontrakten: ni lesekall du kan prøve her, checkout via handlekurven og e-postpåmelding. Site-nøkkelen blir på Worker." : "All eleven operations in the Site delivery contract: nine reads to try here, checkout through the cart and newsletter signup. The Site credential stays on the Worker."}</p><div class="api-presets"><a class="filter" href="/api/?endpoint=storefront">Storefront</a><a class="filter" href="/api/?endpoint=product&resource=heia-reai">${lang === "nb" ? "Produkt med varianter" : "Product with variants"}</a><a class="filter" href="/api/?endpoint=availabilities">${lang === "nb" ? "Prøv lagerstatus" : "Try availability"}</a><a class="filter" href="/api/?endpoint=collection&resource=alle-demo-objekter">${lang === "nb" ? "Automatisk samling" : "Automated collection"}</a></div><div class="api-playground"><form data-api-explorer><label for="endpoint">Endpoint</label><select id="endpoint" name="endpoint">${operations
      .filter((o) => o[1] === "GET")
      .map(
        ([key, , , label]) =>
          `<option value="${h(key)}">${h(label[lang === "nb" ? 0 : 1])}</option>`,
      )
      .join(
        "",
      )}</select><label for="resource">Handle / variant UUID</label><input id="resource" name="resource" placeholder="heia-reai"><p class="fineprint">${lang === "nb" ? "Produkt/samling: handle. Tilgjengelighet: variant-ID fra produktkallet, flere ID-er skilles med komma. Øvrige kall trenger ingen verdi." : "Product/collection: handle. Availability: variant ID from a product response; separate batch IDs with commas. Other requests need no value."}</p><button class="button">${lang === "nb" ? "Hent offentlige data" : "Fetch public data"} ↗</button></form><pre data-api-output tabindex="0">${lang === "nb" ? "Velg et kall og prøv selv." : "Choose a request and try it."}</pre></div><h2>${lang === "nb" ? "Hele leveringskontrakten" : "The complete delivery contract"}</h2>${coverageTable(context)}<p class="fineprint">${lang === "nb" ? "Rabatt, fraktvalg og betalingsstatus håndteres i hosted checkout. Oppsett av regler bruker det separate management-API-et; private bank-/regnskapsdata er ikke del av denne lekeplassen." : "Discounts, shipping selection and payment status are handled in hosted checkout. Rule configuration uses the separate management API; private bank/accounting data is outside this playground."}</p><a class="under-link" href="https://app.reai.no/openapi/site/ui">Delivery OpenAPI ↗</a>`;
  }
  return documentHtml(
    title,
    `<section class="shell inner editorial">${body}</section>`,
    context,
  );
}
export function renderError(status, context) {
  const t = copy[language(context.locale)];
  return documentHtml(
    String(status),
    `<section class="shell inner"><span class="eyebrow">${status}</span><h1>${status === 404 ? (language(context.locale) === "nb" ? "Denne magien finnes ikke." : "This magic does not exist.") : language(context.locale) === "nb" ? "Litt teknisk motvind." : "A little technical headwind."}</h1><p class="lead">${status === 503 ? t.noToken : language(context.locale) === "nb" ? "Prøv igjen om litt. Vi later ikke som om dataene er live når de ikke er det." : "Try again in a moment. We do not pretend unavailable data is live."}</p><a class="button" href="/">${t.back} ↗</a></section>`,
    context,
  );
}

export const learningRoutes = lessons.map((lesson) => `/learn/${lesson.slug}`);
const localized = (text, context) =>
  text[language(context.locale) === "nb" ? 0 : 1];
function lessonCards(context) {
  return `<div class="lesson-grid">${lessons.map((lesson, i) => `<a class="lesson-card" href="/learn/${lesson.slug}/"><div class="lesson-card-top"><span>${String(i + 1).padStart(2, "0")}</span><span class="lesson-icon" aria-hidden="true">${h(lesson.icon)}</span></div><span class="eyebrow">${h(localized(lesson.tag, context))}</span><h2>${h(localized(lesson.title, context))}</h2><p>${h(localized(lesson.summary, context))}</p><span class="small-link">${language(context.locale) === "nb" ? "Prøv og lær" : "Try and learn"} ↗</span></a>`).join("")}</div>`;
}
function learningTeaser(context) {
  return `<section class="shell learning-section"><div class="section-heading"><div><span class="eyebrow">A SMALL SHOP. A BIG LESSON.</span><h2>${language(context.locale) === "nb" ? "Lær mens du bygger." : "Learn as you build."}</h2></div><a class="under-link" href="/features/">${copy[language(context.locale)].features} ↗</a></div>${lessonCards(context)}</section>`;
}
function coverageTable(context) {
  return `<div class="coverage-table" role="region" tabindex="0" aria-label="Site API operations"><table><thead><tr><th>${language(context.locale) === "nb" ? "Kall" : "Request"}</th><th>${language(context.locale) === "nb" ? "Hva viser det?" : "What does it show?"}</th></tr></thead><tbody>${operations.map(([key, method, path, label]) => `<tr><td><span class="method">${method}</span> <code>${h(path)}</code></td><td><a href="${method === "POST" ? (key === "newsletter" ? "/#newsletter" : "/cart/") : `/api/?endpoint=${key}${key === "product" ? "&resource=heia-reai" : key === "collection" ? "&resource=alle-demo-objekter" : ""}`}">${h(localized(label, context))} ↗</a></td></tr>`).join("")}</tbody></table></div>`;
}
function renderLearning(slug, context) {
  const nb = language(context.locale) === "nb";
  const lesson = lessons.find((item) => item.slug === slug);
  if (!slug)
    return documentHtml(
      copy[language(context.locale)].features,
      `<section class="shell inner"><div class="learning-hero"><div><span class="eyebrow">THE REAI FIELD GUIDE</span><h1>${nb ? "Forstå hele<br>handelsflyten." : "Understand the<br>commerce flow."}</h1><p class="lead">${nb ? "En fungerende butikk som forklarer teknologien mens du bruker den. Følg produktene fra ReAI til checkout — og se hvem som gjør hva." : "A working store that explains the technology as you use it. Follow products from ReAI to checkout — and see who does what."}</p><a class="button" href="/learn/payments/">${nb ? "Start med checkout" : "Start with checkout"} ↗</a></div><div class="learning-map" aria-label="Commerce flow"><div><span>01</span><b>${nb ? "Nettsiden" : "The website"}</b><small>Design · Git · Worker</small></div><i aria-hidden="true">↓</i><div><span>02</span><b>ReAI Site API</b><small>${nb ? "Katalog · priser · samlinger" : "Catalog · prices · collections"}</small></div><i aria-hidden="true">↓</i><div><span>03</span><b>ReAI checkout</b><small>${nb ? "Rabatt · levering · Adyen / faktura" : "Discount · delivery · Adyen / invoice"}</small></div><i aria-hidden="true">↓</i><div><span>04</span><b>${nb ? "ReAI-plattformen" : "The ReAI platform"}</b><small>${nb ? "Ordre · faktura · oppfølging" : "Orders · invoices · follow-up"}</small></div></div></div>${lessonCards(context)}<div class="learning-boundary"><b>${nb ? "Dette kan du prøve nå" : "What you can try now"}</b><p>${nb ? "Live katalog, varianter, bilder, fire samlinger, norsk/engelsk, tilgjengelighet, rabattkoder, Adyen og B2B-fakturaordre. Selger utsteder faktura og sender EHF senere i ReAI. Frakt og hent selv er konfigurert, men vises bare for fysiske varer. Produktene her sendes ikke og har ingen lagerpakker. Gavekort innløses manuelt via post@reai.no." : "Live catalog, variants, images, four collections, Norwegian/English, availability, discount codes, Adyen and B2B invoice orders. The merchant issues invoices and sends EHF later in ReAI. Shipping and store pickup are configured but appear only for physical goods. These products are not shipped and have no inventory bundles. Gift cards are redeemed manually through post@reai.no."}</p><a href="/api/">${nb ? "Prøv alle ni lesekall i API-lekeplassen" : "Try all nine reads in the API playground"} ↗</a></div></section>`,
      context,
    );
  if (!lesson) return renderError(404, context);
  const index = lessons.indexOf(lesson);
  const next = lessons[(index + 1) % lessons.length];
  return documentHtml(
    localized(lesson.title, context),
    `<section class="shell inner"><a class="breadcrumb" href="/features/">← ${copy[language(context.locale)].features}</a><div class="lesson-layout"><aside class="lesson-nav"><span class="eyebrow">REAI FIELD GUIDE</span><nav aria-label="${nb ? "Læringskapitler" : "Learning chapters"}">${lessons.map((item, i) => `<a href="/learn/${item.slug}/" ${item.slug === slug ? 'aria-current="page"' : ""}><span>${String(i + 1).padStart(2, "0")}</span><span class="lesson-full">${h(localized(item.title, context))}</span><span class="lesson-short">${h(localized(item.shortTitle, context))}</span></a>`).join("")}</nav><a class="small-link" href="/api/">API playground ↗</a></aside><article class="lesson-content"><span class="eyebrow">${h(localized(lesson.tag, context))}</span><h1>${h(localized(lesson.title, context))}</h1><p class="lead">${h(localized(lesson.intro, context))}</p>${slug === "payments" ? paymentDisclosure(context) : ""}<div class="lesson-steps"><h2>${nb ? "Følg flyten" : "Follow the flow"}</h2><ol>${lesson.steps.map((step) => `<li>${h(localized(step, context))}</li>`).join("")}</ol></div><div class="lesson-links">${lesson.links.map(([url, label]) => `<a class="pill-link" href="${h(url)}">${h(localized(label, context))} ↗</a>`).join("")}</div><div class="prose">${lesson.sections.map((section) => `<h2>${h(localized(section.title, context))}</h2><p>${h(localized(section.text, context))}</p>`).join("")}</div><figure class="contract-example"><figcaption>${h(localized(lesson.codeLabel, context))}</figcaption><pre tabindex="0"><code>${h(lesson.code)}</code></pre></figure><a class="lesson-next" href="/learn/${next.slug}/"><span>${nb ? "Neste kapittel" : "Next chapter"}</span><b>${h(localized(next.title, context))} ↗</b></a></article></div></section>`,
    context,
  );
}
function productCommerceNotes(product, store, context) {
  const nb = language(context.locale) === "nb";
  const references = (product.variants || []).filter(
    (v) => Number(v.compareAtPrice) > Number(v.price),
  );
  const bundles = (product.variants || []).filter(
    (v) => v.bundle?.items?.length,
  );
  return `${references.length ? `<div class="reference-note"><span class="eyebrow">${nb ? "SAMMENLIGNINGSPRIS FRA REAI" : "REFERENCE PRICE FROM REAI"}</span>${references.map((v) => `<p><strong>${h(money(v.price, store))}</strong> <s>${h(money(v.compareAtPrice, store))}</s></p>`).join("")}<small>${nb ? "Fiktiv referansepris i demoen, ikke dokumentert tidligere salgspris." : "Fictional demo reference price, not an evidenced previous selling price."}</small><a href="/learn/discounts/">${nb ? "Lær om pris og rabatt" : "Learn about prices and discounts"} ↗</a></div>` : ""}${bundles.length ? `<details class="api-note"><summary>${nb ? "Dette er et pakkeprodukt" : "This is a bundle"}</summary>${bundles.map((v) => `<ul>${v.bundle.items.map((item) => `<li>${Number(item.quantity)} × ${h(item.title)} ${h(item.options.map((o) => o.value).join(" / "))}</li>`).join("")}</ul>`).join("")}<a href="/learn/catalog/">${nb ? "Hvordan komponentlager virker" : "How shared component inventory works"} ↗</a></details>` : ""}`;
}
