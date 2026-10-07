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
    shop: "Butikken",
    features: "Lær ReAI",
    about: "Om demoen",
    cart: "Handlekurv",
    add: "Legg i kurven",
    choose: "Velg variant",
    all: "Alle produkter",
    from: "Fra",
    hero: "Seriøs teknologi.\nUseriøs butikk.",
    intro:
      "En ekte ReAI-integrasjon, med litt mindre alvor. Utforsk produkter, prøv varianter og se hvordan nettbutikk og regnskap henger sammen.",
    browse: "Finn litt kontormagi",
    learn: "Se hva som skjer bak kulissene",
    demo: "DEMO — fiktive produkter. Se betalingsmodus før checkout.",
    empty: "Her blir det snart kontormagi. Katalogen kobles til ReAI.",
    back: "Tilbake til butikken",
    quantity: "Antall",
    variants: "Velg din dose",
    checkout: "Fortsett til ReAI checkout",
    subtotal: "Sum produkter",
    cartEmpty: "Handlekurven trenger litt personlighet.",
    remove: "Fjern",
    live: "Data fra ReAI",
    noToken:
      "Demoen er ikke koblet til ReAI ennå. Statisk innhold virker; katalog og checkout åpnes når oppsettet er klart.",
    wait: "Henter litt kontormagi…",
    pay: "Betalingsmodus",
    disabled: "Checkout er ikke aktivert",
    test: "Adyen testbetaling — ingen ekte trekk",
    livePay: "Ekte betaling — beløpet trekkes",
    gift: "Gavekortet er et demo-produkt, ikke et innløsbart ReAI-gavekort.",
    search: "Finn litt magi",
    results: "Produkter",
    returned: "Tilbake fra checkout",
    returnText:
      "Retur hit er ikke en betalingsbekreftelse. Se betalingsstatus og kvittering i ReAI checkout.",
    api: "Utforsk API-et",
    basket: "Din lille dose kontormagi",
    saved: "Lagt i handlekurven",
    related: "Mer som kan få deg til å smile",
    stock: "Tilgjengelighet sjekkes i ReAI",
    status: "API-status",
  },
  en: {
    shop: "Shop",
    features: "Learn ReAI",
    about: "About the demo",
    cart: "Cart",
    add: "Add to cart",
    choose: "Choose an option",
    all: "All products",
    from: "From",
    hero: "Serious technology.\nUnserious shop.",
    intro:
      "A real ReAI integration with a little less seriousness. Explore products, try variants and see how commerce and accounting fit together.",
    browse: "Find some office magic",
    learn: "See what happens behind the scenes",
    demo: "DEMO — fictional products. Check payment mode before checkout.",
    empty:
      "Office magic is on its way. The catalog is being connected to ReAI.",
    back: "Back to the shop",
    quantity: "Quantity",
    variants: "Choose your dose",
    checkout: "Continue to ReAI checkout",
    subtotal: "Product subtotal",
    cartEmpty: "Your cart could use a little personality.",
    remove: "Remove",
    live: "Data from ReAI",
    noToken:
      "The demo is not connected to ReAI yet. Editorial pages work; catalog and checkout open when setup is ready.",
    wait: "Finding some office magic…",
    pay: "Payment mode",
    disabled: "Checkout is not enabled",
    test: "Adyen test payment — no real charge",
    livePay: "Real payment — you will be charged",
    gift: "This gift card is a demo product, not redeemable for ReAI services.",
    search: "Find some magic",
    results: "Products",
    returned: "Back from checkout",
    returnText:
      "Returning here is not payment confirmation. Check payment status and receipt in ReAI checkout.",
    api: "Explore the API",
    basket: "Your little dose of office magic",
    saved: "Added to cart",
    related: "More reasons to smile",
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
function card(product, store) {
  const t = copy[language(store.locale)],
    v = product.variants || [],
    prices = v.map((x) => Number(x.price)).filter(Number.isFinite),
    min = prices.length ? Math.min(...prices) : null,
    reference = v.find((x) => Number(x.price) === min && Number(x.compareAtPrice) > Number(x.price))?.compareAtPrice;
  return `<article class="product-card"><a class="product-art art-${art(product)}" href="/products/${h(product.handle)}/">${picture(product)}<span class="art-tag">DEMO OBJECT</span><span class="round-arrow" aria-hidden="true">↗</span></a><div class="product-meta"><h3><a href="/products/${h(product.handle)}/">${h(product.title)}</a></h3><span>${min === null ? "" : `${new Set(prices).size > 1 ? t.from + " " : ""}${h(money(min, store))}`}${reference ? ` <s class="reference-price">${h(money(reference, store))}</s>` : ""}</span></div><p class="product-caption">${h(
    String(product.description || "")
      .replace(/<[^>]*>/g, "")
      .split(". ")[0],
  )}</p><a class="small-link" href="/products/${h(product.handle)}/">${v.length > 1 ? t.choose : t.add} <span aria-hidden="true">↗</span></a></article>`;
}
export function documentHtml(title, body, context = {}) {
  const lang = language(context.locale),
    t = copy[lang],
    mode = context.paymentMode || "disabled";
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="En morsom demobutikk som viser ReAI Site API, produkter, varianter og hosted checkout."><meta name="theme-color" content="#f6f5ed"><meta name="robots" content="noindex, nofollow"><title>${h(title)} · ReAI Lekebutikken</title><link rel="icon" href="/assets/mark.svg"><link rel="stylesheet" href="/assets/demo.css"></head><body data-locale="${lang}" data-payment-mode="${h(mode)}" data-checkout-origin="${h(context.checkoutOrigin || "https://app.reai.no")}"><a class="skip" href="#main">Skip to content</a><div class="notice"><span class="dot"></span>${mode === "live" ? (lang === "nb" ? "DEMO — fiktive produkter. Ekte betalinger og fakturaordrer." : "DEMO — fictional products. Real payments and invoice orders.") : t.demo}<a href="/about/">${t.about} ↗</a></div><header class="header shell"><a class="brand" href="/"><img src="/assets/mark.svg" width="36" height="36" alt=""><strong>ReAI<span>Lekebutikken</span></strong></a><nav aria-label="Main"><a href="/shop/">${t.shop}</a><a href="/features/">${t.features}</a><a href="/api/">API</a></nav><div class="header-actions"><a class="language" href="?lang=${lang === "nb" ? "en" : "nb"}" aria-label="${lang === "nb" ? "English" : "Norsk"}">${lang === "nb" ? "EN" : "NO"}</a><a class="cart-pill" href="/cart/" aria-label="${h(t.cart)}"><span>${t.cart}</span><b data-cart-count>0</b></a><button class="menu-toggle" aria-label="Open navigation" aria-expanded="false" type="button">☰</button></div></header><main id="main">${body}</main><footer class="footer shell"><div class="footer-top"><a class="brand" href="/"><img src="/assets/mark.svg" width="36" height="36" alt=""><strong>ReAI<span>Lekebutikken</span></strong></a><p>${lang === "nb" ? "Denne butikken er en lekeplass.\nTeknologien er på jobb." : "The shop is a playground.\nThe technology is hard at work."}</p><a class="pill-link" href="https://reai.no">${lang === "nb" ? "Møt ekte ReAI" : "Meet the real ReAI"} ↗</a></div><div class="footer-bottom"><span>© ${new Date().getUTCFullYear()} ReAI · ${lang === "nb" ? "Laget med litt ekstra pågangsmot." : "Made with a little extra optimism."}</span><div><a href="/features/">${t.features}</a><a href="/about/">${t.about}</a><a href="/privacy/">${lang === "nb" ? "Personvern" : "Privacy"}</a><a href="/api/">Site API ↗</a><a href="https://github.com/beint-no/reai-site-examples">Source ↗</a></div></div></footer><script src="/assets/demo.js" defer></script></body></html>`;
}
export function renderHome(store, context) {
  const t = copy[language(context.locale)];
  return documentHtml(
    language(context.locale) === "nb" ? "Velkommen" : "Welcome",
    `<section class="hero shell"><div class="hero-copy"><span class="eyebrow"><i></i> ${context.configured ? (language(context.locale) === "nb" ? "REAI SITE API, I LEVENDE LIVE" : "REAI SITE API, IN ACTION") : language(context.locale) === "nb" ? "REAI SITE API-DEMO · OPPSETT PÅGÅR" : "REAI SITE API DEMO · SETUP IN PROGRESS"}</span><h1>${t.hero.split("\n")[0]}<br><em>${t.hero.split("\n")[1]}</em></h1><p>${t.intro}</p><div class="hero-actions"><a class="button" href="/shop/">${t.browse} <span>↗</span></a><a class="under-link" href="/features/">${t.learn}</a></div><div class="hero-footnote"><span>✳</span> ${language(context.locale) === "nb" ? "Litt lek. Hele handelsflyten." : "A little play. The whole commerce flow."}</div></div><div class="hero-scene"><div class="orbit-label label-top">100% DEMO / 100% REAI</div><img class="hero-gift" src="/assets/gift.svg" width="640" height="640" alt="Illustrert gavekort"><img class="hero-mug" src="/assets/mug.svg" width="640" height="640" alt="Illustrert motivasjonskopp"><img class="hero-heart" src="/assets/heart.svg" width="640" height="640" alt="Illustrert hjerte"><div class="orbit-label label-bottom">ADD A LITTLE GOOD KARMA ↗</div><span class="scene-spark spark-one">✳</span><span class="scene-spark spark-two">✧</span></div></section><div class="ticker" aria-hidden="true"><div>GOD KARMA <span>✳</span> KONTORMAGI <span>✳</span> MINDRE ROT <span>✳</span> MER REAI <span>✳</span> GOD KARMA <span>✳</span> KONTORMAGI <span>✳</span> MINDRE ROT <span>✳</span> MER REAI <span>✳</span></div></div><section class="shell shop-section"><div class="section-heading"><div><span class="eyebrow">THE GOOD STUFF</span><h2>${language(context.locale) === "nb" ? "Små ting. Store smil." : "Small things. Big smiles."}</h2></div><a class="under-link" href="/shop/">${t.all} ↗</a></div>${renderGrid(store.products || [], store)}<p class="data-caption"><span class="dot"></span>${context.configured ? t.live : t.noToken} · ${language(context.locale) === "nb" ? "Katalog, priser og varianter. Ikke hardkodet magi." : "Catalog, prices and variants. No hardcoded magic."}</p></section><section class="feature-story shell"><div><span class="eyebrow">BEHIND THE MAGIC</span><h2>${language(context.locale) === "nb" ? "En liten butikk.\nEt helt økosystem." : "One little shop.\nAn entire ecosystem."}</h2><a class="button light" href="/features/">${t.features} ↗</a></div><div class="story-steps"><article><b>01</b><div><h3>${language(context.locale) === "nb" ? "Du finner noe gøy" : "Find something fun"}</h3><p>${language(context.locale) === "nb" ? "Produkter, bilder, samlinger og varianter kommer fra ReAI." : "Products, images, collections and variants come from ReAI."}</p></div></article><article><b>02</b><div><h3>${language(context.locale) === "nb" ? "ReAI holder orden" : "ReAI keeps things in order"}</h3><p>${language(context.locale) === "nb" ? "Pris og tilgjengelighet sjekkes der dataene bor." : "Prices and availability are checked where the data lives."}</p></div></article><article><b>03</b><div><h3>${language(context.locale) === "nb" ? "Checkout tar over" : "Checkout takes over"}</h3><p>${language(context.locale) === "nb" ? "Den aktiverte betalingsflyten åpnes i ReAI hosted checkout." : "The configured payment flow opens in ReAI hosted checkout."}</p></div></article></div></section>${learningTeaser(context)}`,
    context,
  );
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
    `<section class="shell inner"><span class="eyebrow">SHOP SOME GOOD ENERGY</span><h1>${h(collection?.title || t.all)}</h1><p class="lead">${h(collection?.description || (lang === "nb" ? "Fiktive ting. Ekte API-kall. Litt ekstra personlighet." : "Fictional things. Real API calls. A little extra personality."))}</p><div class="shop-learning"><p>${lang === "nb" ? "Følg dataene: samlingene og prisene under leveres fra ReAI." : "Follow the data: these collections and prices are delivered by ReAI."}</p><a href="/learn/catalog/">${lang === "nb" ? "Hvordan virker samlinger?" : "How do collections work?"} ↗</a><a href="/learn/discounts/">${lang === "nb" ? "Prøv en rabattkode" : "Try a discount code"} ↗</a></div><div class="shop-toolbar"><div class="collection-filters"><a class="filter ${collection ? "" : "active"}" href="/shop/">${t.all}</a>${(store.collections || []).map((c) => `<a class="filter ${collection?.handle === c.handle ? "active" : ""}" href="/collections/${h(c.handle)}/">${h(c.title)}</a>`).join("")}</div><label class="search"><span class="sr-only">${t.search}</span><input data-search type="search" placeholder="${t.search}"><span aria-hidden="true">⌕</span></label></div>${renderGrid(products, store)}<p data-search-empty hidden>${lang === "nb" ? "Ingen treff. Prøv litt annen magi." : "No matches. Try another kind of magic."}</p></section>`,
    context,
  );
}
export function renderProduct(store, product, availability, context) {
  const lang = language(context.locale),
    t = copy[lang];
  return documentHtml(
    product.title,
    `<section class="shell inner"><a class="breadcrumb" href="/shop/">← ${t.back}</a><div class="product-detail"><div class="detail-art art-${art(product)}">${picture(product, true)}<span class="art-tag">REAI DEMO OBJECT</span></div><div class="detail-copy"><span class="eyebrow">${t.live.toUpperCase()}</span><h1>${h(product.title)}</h1><p class="lead">${h(String(product.description || "").replace(/<[^>]*>/g, ""))}</p>${productCommerceNotes(product, store, context)}<form data-add-to-cart><label for="variant">${t.variants}</label><select id="variant" name="variantId">${(product.variants || []).map((v) => `<option value="${h(v.id)}" ${availability?.variants?.find((a) => a.variantId === v.id)?.status === "OUT_OF_STOCK" ? "disabled" : ""}>${h(v.options?.map((o) => o.value).join(" / ") || v.sku || "Standard")} — ${h(money(v.price, store))}</option>`).join("")}</select><label for="quantity">${t.quantity}</label><input id="quantity" name="quantity" type="number" value="1" min="1" max="20"><button class="button" type="submit" ${(product.variants || []).some((v) => availability?.variants?.find((a) => a.variantId === v.id)?.status === "AVAILABLE") ? "" : "disabled"}>${t.add} <span>+</span></button><p data-add-message role="status"></p></form><div class="product-notes"><p><span class="dot"></span>${t.stock}</p><p>✳ ${lang === "nb" ? "Digitalt demo-produkt. Ingen fysisk levering." : "Digital demo product. No physical delivery."}</p>${product.handle?.includes("gavekort") ? `<p>↗ ${t.gift}</p>` : ""}</div><details class="api-note"><summary>${lang === "nb" ? "Hva viser dette produktet?" : "What does this demonstrate?"}</summary><p>${lang === "nb" ? "Produktdetaljer, bilder og beløpsvarianter kommer fra Site API. Tilgjengelighet hentes separat, og checkout validerer pris og lager på nytt." : "Product detail, images and price variants come from Site API. Availability is fetched separately; checkout revalidates prices and stock."}</p><a href="/api/?product=${h(product.handle)}">${t.api} ↗</a></details></div></div><div class="section-heading"><h2>${t.related}</h2></div>${renderGrid((store.products || []).filter((p) => p.id !== product.id).slice(0, 3), store)}</section>`,
    context,
  );
}
function paymentDisclosure(context) {
  if (context.paymentMode !== "live") return "";
  const nb = language(context.locale) === "nb";
  return `<div class="payment-disclosure"><p><b>${nb ? "Ekte betalinger og fakturaordrer." : "Real payments and invoice orders."}</b></p><p>${nb ? "Betalingen går til" : "Payment goes to"} ${h(context.merchantName)}${context.merchantOrgNumber ? ` (${nb ? "org.nr." : "org. no."} ${h(context.merchantOrgNumber)})` : ""}.</p><p>${nb ? "Du kjøper et digitalt demo-produkt. Ingen varer sendes, og demo-gavekort kan ikke innløses." : "You are buying a digital demo product. Nothing is shipped and demo gift cards cannot be redeemed."}</p><p>${nb ? "Bedrift kan velge faktura i checkout. Sluttknappen oppretter da en ekte, ubetalt ordre; selger utsteder faktura senere." : "Businesses can choose Invoice in checkout. The final button then creates a real, unpaid order; the merchant issues its invoice later."} <a href="/learn/business/">${nb ? "Slik virker B2B og EHF" : "How B2B and EHF work"} ↗</a></p></div>`;
}
export function renderCart(context) {
  const t = copy[language(context.locale)],
    mode = context.paymentMode || "disabled";
  return documentHtml(
    t.cart,
    `<section class="shell inner cart-page"><span class="eyebrow">A LITTLE GOOD ENERGY</span><h1>${t.basket}</h1><div class="cart-layout"><div data-cart-lines><p>${t.wait}</p></div><aside class="cart-summary"><h2>${t.subtotal}</h2><strong data-cart-total>—</strong><p>${t.pay}: <b>${mode === "test" ? t.test : mode === "live" ? t.livePay : t.disabled}</b></p>${paymentDisclosure(context)}<div class="cart-code-tip"><b>REAI-DEMO10</b><p>${language(context.locale) === "nb" ? "Prøv 10 % rabatt ved å skrive koden i ReAI checkout. Rabatten er ikke inkludert i summen over." : "Try 10% off by entering this code in ReAI checkout. The subtotal above does not include the discount."}</p><a href="/learn/discounts/">${language(context.locale) === "nb" ? "Se flere rabattregler" : "See more discount rules"} ↗</a></div><button class="button" data-checkout ${mode === "disabled" ? "disabled" : ""}>${t.checkout} ↗</button><p data-checkout-message role="status"></p><p class="fineprint">${language(context.locale) === "nb" ? "ReAI beregner endelig pris og eventuelle rabatter i checkout." : "ReAI calculates final prices and any discounts at checkout."}</p></aside></div></section>`,
    context,
  );
}
export function renderEditorial(route, context) {
  const lang = language(context.locale),
    t = copy[lang];
  let title, body;
  if (route === "features" || route.startsWith("learn/")) {
    return renderLearning(route === "features" ? null : route.slice(6), context);
  } else if (route === "about") {
    title = t.about;
    body = `<span class="eyebrow">THIS IS A PLAYGROUND</span><h1>${lang === "nb" ? "En butikk med glimt i API-et." : "A shop with a twinkle in its API."}</h1><p class="lead">${lang === "nb" ? "ReAI Lekebutikken er en demonstrasjon, med fiktive produkter og én ReAI Site. Formålet er å vise hele handelsflyten — ikke å selge kaffe, motivasjon eller innløselige gavekort." : "ReAI Lekebutikken is a demonstration with fictional products and one ReAI Site. It demonstrates the commerce flow, not sales of coffee, motivation or redeemable gift cards."}</p><div class="prose"><h2>${t.pay}</h2><p>${context.paymentMode === "test" ? t.test : context.paymentMode === "live" ? t.livePay : t.disabled}.</p><p>${lang === "nb" ? "«Heia, ReAI!» er et testprodukt og ikke en veldedig innsamling. «ReAI gavekort» oppretter ikke et ekte gavekort eller et innløsningsløfte." : "“Go, ReAI!” is a test product, not a charitable fundraiser. “ReAI gift card” creates no real gift card or redemption promise."}</p>${paymentDisclosure(context)}<h2>${lang === "nb" ? "Ekte dataflyt, tydelige grenser" : "Real data flow, clear boundaries"}</h2><p>${lang === "nb" ? "Utseende og forklaringer styres i Git. Publisert katalog, priser og aktiv checkout styres i ReAI. Ingen produktpriser er hardkodet i frontend." : "Design and explanations are maintained in Git. Published catalog, prices and active checkout are managed in ReAI. Frontend product prices are not hardcoded."}</p><a href="https://github.com/beint-no/reai-site-examples">${lang === "nb" ? "Se koden og dokumentasjonen" : "Read the source and documentation"} ↗</a></div>`;
  } else if (route === "return") {
    title = t.returned;
    body = `<div class="return-mark">✳</div><h1>${t.returned}</h1><p class="lead">${t.returnText}</p><a class="button" href="/shop/">${t.back} ↗</a>`;
  } else if (route === "privacy") {
    title = lang === "nb" ? "Personvern" : "Privacy";
    body = `<h1>${title}</h1><div class="prose"><p>${lang === "nb" ? "Handlekurven lagres lokalt i nettleseren. Dette nettstedet bruker ikke analyse- eller markedsføringsskript. Når du åpner ReAI checkout, behandles nødvendige ordre- og betalingsopplysninger der. Hosting og sikkerhet kan bruke tekniske forespørselslogger. Ikke bruk følsomme personopplysninger i demonstrasjonen." : "The cart is stored locally in your browser. This site uses no analytics or marketing scripts. ReAI checkout processes necessary order and payment details. Hosting and security may use technical request logs. Do not enter sensitive personal information in the demonstration."}</p></div>`;
  } else {
    title = t.api;
    body = `<span class="eyebrow">THE API PLAYGROUND</span><h1>${lang === "nb" ? "Se hva butikken ser." : "See what the shop sees."}</h1><p class="lead">${lang === "nb" ? "Alle ti operasjoner i Site-leveringskontrakten: ni lesekall du kan prøve her, og checkout via handlekurven. Site-nøkkelen blir på Worker." : "All ten operations in the Site delivery contract: nine reads to try here, and checkout through the cart. The Site credential stays on the Worker."}</p><div class="api-presets"><a class="filter" href="/api/?endpoint=storefront">Storefront</a><a class="filter" href="/api/?endpoint=product&resource=heia-reai">${lang === "nb" ? "Produkt med varianter" : "Product with variants"}</a><a class="filter" href="/api/?endpoint=availabilities">${lang === "nb" ? "Prøv lagerstatus" : "Try availability"}</a><a class="filter" href="/api/?endpoint=collection&resource=alle-demo-objekter">${lang === "nb" ? "Automatisk samling" : "Automated collection"}</a></div><div class="api-playground"><form data-api-explorer><label for="endpoint">Endpoint</label><select id="endpoint" name="endpoint">${operations.filter((o) => o[1] === "GET").map(([key, , , label]) => `<option value="${h(key)}">${h(label[lang === "nb" ? 0 : 1])}</option>`).join("")}</select><label for="resource">Handle / variant UUID</label><input id="resource" name="resource" placeholder="heia-reai"><p class="fineprint">${lang === "nb" ? "Produkt/samling: handle. Tilgjengelighet: variant-ID fra produktkallet, flere ID-er skilles med komma. Øvrige kall trenger ingen verdi." : "Product/collection: handle. Availability: variant ID from a product response; separate batch IDs with commas. Other requests need no value."}</p><button class="button">${lang === "nb" ? "Hent offentlige data" : "Fetch public data"} ↗</button></form><pre data-api-output tabindex="0">${lang === "nb" ? "Velg et kall og prøv selv." : "Choose a request and try it."}</pre></div><h2>${lang === "nb" ? "Hele leveringskontrakten" : "The complete delivery contract"}</h2>${coverageTable(context)}<p class="fineprint">${lang === "nb" ? "Rabatt, fraktvalg og betalingsstatus håndteres i hosted checkout. Oppsett av regler bruker det separate management-API-et; private bank-/regnskapsdata er ikke del av denne lekeplassen." : "Discounts, shipping selection and payment status are handled in hosted checkout. Rule configuration uses the separate management API; private bank/accounting data is outside this playground."}</p><a class="under-link" href="https://app.reai.no/openapi/site/ui">Delivery OpenAPI ↗</a>`;
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
const localized = (text, context) => text[language(context.locale) === 'nb' ? 0 : 1];
function lessonCards(context) {
  return `<div class="lesson-grid">${lessons.map((lesson, i) => `<a class="lesson-card" href="/learn/${lesson.slug}/"><div class="lesson-card-top"><span>${String(i + 1).padStart(2, '0')}</span><span class="lesson-icon" aria-hidden="true">${h(lesson.icon)}</span></div><span class="eyebrow">${h(localized(lesson.tag, context))}</span><h2>${h(localized(lesson.title, context))}</h2><p>${h(localized(lesson.summary, context))}</p><span class="small-link">${language(context.locale) === 'nb' ? 'Prøv og lær' : 'Try and learn'} ↗</span></a>`).join('')}</div>`;
}
function learningTeaser(context) {
  return `<section class="shell learning-section"><div class="section-heading"><div><span class="eyebrow">A SMALL SHOP. A BIG LESSON.</span><h2>${language(context.locale) === 'nb' ? 'Lær mens du leker.' : 'Learn as you play.'}</h2></div><a class="under-link" href="/features/">${copy[language(context.locale)].features} ↗</a></div>${lessonCards(context)}</section>`;
}
function coverageTable(context) {
  return `<div class="coverage-table" role="region" tabindex="0" aria-label="Site API operations"><table><thead><tr><th>${language(context.locale) === 'nb' ? 'Kall' : 'Request'}</th><th>${language(context.locale) === 'nb' ? 'Hva viser det?' : 'What does it show?'}</th></tr></thead><tbody>${operations.map(([key, method, path, label]) => `<tr><td><span class="method">${method}</span> <code>${h(path)}</code></td><td><a href="${method === 'POST' ? '/cart/' : `/api/?endpoint=${key}${key === 'product' ? '&resource=heia-reai' : key === 'collection' ? '&resource=alle-demo-objekter' : ''}`}">${h(localized(label, context))} ↗</a></td></tr>`).join('')}</tbody></table></div>`;
}
function renderLearning(slug, context) {
  const nb = language(context.locale) === 'nb';
  const lesson = lessons.find((item) => item.slug === slug);
  if (!slug) return documentHtml(copy[language(context.locale)].features, `<section class="shell inner"><div class="learning-hero"><div><span class="eyebrow">THE REAI FIELD GUIDE</span><h1>${nb ? 'Litt lek.<br><em>Mye læring.</em>' : 'A little play.<br><em>A lot to learn.</em>'}</h1><p class="lead">${nb ? 'En fungerende butikk som forklarer teknologien mens du bruker den. Følg produktene fra ReAI til checkout — og se hvem som gjør hva.' : 'A working store that explains the technology as you use it. Follow products from ReAI to checkout — and see who does what.'}</p><a class="button" href="/learn/payments/">${nb ? 'Start med checkout' : 'Start with checkout'} ↗</a></div><div class="learning-map" aria-label="Commerce flow"><div><span>01</span><b>${nb ? 'Nettsiden' : 'The website'}</b><small>Design · Git · Worker</small></div><i aria-hidden="true">↓</i><div><span>02</span><b>ReAI Site API</b><small>${nb ? 'Katalog · priser · samlinger' : 'Catalog · prices · collections'}</small></div><i aria-hidden="true">↓</i><div><span>03</span><b>ReAI checkout</b><small>${nb ? 'Rabatt · levering · Adyen / faktura' : 'Discount · delivery · Adyen / invoice'}</small></div><i aria-hidden="true">↓</i><div><span>04</span><b>${nb ? 'ReAI-plattformen' : 'The ReAI platform'}</b><small>${nb ? 'Ordre · faktura · oppfølging' : 'Orders · invoices · follow-up'}</small></div></div></div>${lessonCards(context)}<div class="learning-boundary"><b>${nb ? 'Dette kan du prøve nå' : 'What you can try now'}</b><p>${nb ? 'Live katalog, varianter, bilder, fire samlinger, norsk/engelsk, tilgjengelighet, rabattkoder, Adyen og B2B-fakturaordre. Selger utsteder faktura og sender EHF senere i ReAI. Frakt og hent selv er konfigurert, men vises bare for fysiske varer. Disse digitale demo-produktene sendes ikke og har ingen lagerpakker.' : 'Live catalog, variants, images, four collections, Norwegian/English, availability, discount codes, Adyen and B2B invoice orders. The merchant issues invoices and sends EHF later in ReAI. Shipping and store pickup are configured but appear only for physical goods. These digital demo products are not shipped and have no inventory bundles.'}</p><a href="/api/">${nb ? 'Prøv alle ni lesekall i API-lekeplassen' : 'Try all nine reads in the API playground'} ↗</a></div></section>`, context);
  if (!lesson) return renderError(404, context);
  const index = lessons.indexOf(lesson);
  const next = lessons[(index + 1) % lessons.length];
  return documentHtml(localized(lesson.title, context), `<section class="shell inner"><a class="breadcrumb" href="/features/">← ${copy[language(context.locale)].features}</a><div class="lesson-layout"><aside class="lesson-nav"><span class="eyebrow">REAI FIELD GUIDE</span><nav aria-label="${nb ? 'Læringskapitler' : 'Learning chapters'}">${lessons.map((item, i) => `<a href="/learn/${item.slug}/" ${item.slug === slug ? 'aria-current="page"' : ''}><span>${String(i + 1).padStart(2, '0')}</span><span class="lesson-full">${h(localized(item.title, context))}</span><span class="lesson-short">${h(localized(item.shortTitle, context))}</span></a>`).join('')}</nav><a class="small-link" href="/api/">API playground ↗</a></aside><article class="lesson-content"><span class="eyebrow">${h(localized(lesson.tag, context))}</span><h1>${h(localized(lesson.title, context))}</h1><p class="lead">${h(localized(lesson.intro, context))}</p>${slug === 'payments' ? paymentDisclosure(context) : ''}<div class="lesson-steps"><h2>${nb ? 'Følg flyten' : 'Follow the flow'}</h2><ol>${lesson.steps.map((step) => `<li>${h(localized(step, context))}</li>`).join('')}</ol></div><div class="lesson-links">${lesson.links.map(([url, label]) => `<a class="pill-link" href="${h(url)}">${h(localized(label, context))} ↗</a>`).join('')}</div><div class="prose">${lesson.sections.map((section) => `<h2>${h(localized(section.title, context))}</h2><p>${h(localized(section.text, context))}</p>`).join('')}</div><figure class="contract-example"><figcaption>${h(localized(lesson.codeLabel, context))}</figcaption><pre tabindex="0"><code>${h(lesson.code)}</code></pre></figure><a class="lesson-next" href="/learn/${next.slug}/"><span>${nb ? 'Neste kapittel' : 'Next chapter'}</span><b>${h(localized(next.title, context))} ↗</b></a></article></div></section>`, context);
}
function productCommerceNotes(product, store, context) {
  const nb = language(context.locale) === 'nb';
  const references = (product.variants || []).filter((v) => Number(v.compareAtPrice) > Number(v.price));
  const bundles = (product.variants || []).filter((v) => v.bundle?.items?.length);
  return `${references.length ? `<div class="reference-note"><span class="eyebrow">${nb ? 'SAMMENLIGNINGSPRIS FRA REAI' : 'REFERENCE PRICE FROM REAI'}</span>${references.map((v) => `<p><strong>${h(money(v.price, store))}</strong> <s>${h(money(v.compareAtPrice, store))}</s></p>`).join('')}<small>${nb ? 'Fiktiv referansepris i demoen, ikke dokumentert tidligere salgspris.' : 'Fictional demo reference price, not an evidenced previous selling price.'}</small><a href="/learn/discounts/">${nb ? 'Lær om pris og rabatt' : 'Learn about prices and discounts'} ↗</a></div>` : ''}${bundles.length ? `<details class="api-note"><summary>${nb ? 'Dette er et pakkeprodukt' : 'This is a bundle'}</summary>${bundles.map((v) => `<ul>${v.bundle.items.map((item) => `<li>${Number(item.quantity)} × ${h(item.title)} ${h(item.options.map((o) => o.value).join(' / '))}</li>`).join('')}</ul>`).join('')}<a href="/learn/catalog/">${nb ? 'Hvordan komponentlager virker' : 'How shared component inventory works'} ↗</a></details>` : ''}`;
}
