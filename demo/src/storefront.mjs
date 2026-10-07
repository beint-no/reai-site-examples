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
    features: "Slik virker det",
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
    features: "How it works",
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
    min = prices.length ? Math.min(...prices) : null;
  return `<article class="product-card"><a class="product-art art-${art(product)}" href="/products/${h(product.handle)}/">${picture(product)}<span class="art-tag">DEMO OBJECT</span><span class="round-arrow" aria-hidden="true">↗</span></a><div class="product-meta"><h3><a href="/products/${h(product.handle)}/">${h(product.title)}</a></h3><span>${min === null ? "" : `${new Set(prices).size > 1 ? t.from + " " : ""}${h(money(min, store))}`}</span></div><p class="product-caption">${h(
    String(product.description || "")
      .replace(/<[^>]*>/g, "")
      .split(". ")[0],
  )}</p><a class="small-link" href="/products/${h(product.handle)}/">${v.length > 1 ? t.choose : t.add} <span aria-hidden="true">↗</span></a></article>`;
}
export function documentHtml(title, body, context = {}) {
  const lang = language(context.locale),
    t = copy[lang],
    mode = context.paymentMode || "disabled";
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="En morsom demobutikk som viser ReAI Site API, produkter, varianter og hosted checkout."><meta name="theme-color" content="#f6f5ed"><meta name="robots" content="noindex, nofollow"><title>${h(title)} · ReAI Lekebutikken</title><link rel="icon" href="/assets/mark.svg"><link rel="stylesheet" href="/assets/demo.css"></head><body data-locale="${lang}" data-payment-mode="${h(mode)}" data-checkout-origin="${h(context.checkoutOrigin || "https://app.reai.no")}"><a class="skip" href="#main">Skip to content</a><div class="notice"><span class="dot"></span>${t.demo}<a href="/about/">${t.about} ↗</a></div><header class="header shell"><a class="brand" href="/"><img src="/assets/mark.svg" width="36" height="36" alt=""><strong>ReAI<span>Lekebutikken</span></strong></a><nav aria-label="Main"><a href="/shop/">${t.shop}</a><a href="/features/">${t.features}</a><a href="/about/">${t.about}</a></nav><div class="header-actions"><a class="language" href="?lang=${lang === "nb" ? "en" : "nb"}" aria-label="${lang === "nb" ? "English" : "Norsk"}">${lang === "nb" ? "EN" : "NO"}</a><a class="cart-pill" href="/cart/"><span>${t.cart}</span><b data-cart-count>0</b></a><button class="menu-toggle" aria-label="Open navigation" aria-expanded="false" type="button">☰</button></div></header><main id="main">${body}</main><footer class="footer shell"><div class="footer-top"><a class="brand" href="/"><img src="/assets/mark.svg" width="36" height="36" alt=""><strong>ReAI<span>Lekebutikken</span></strong></a><p>${lang === "nb" ? "Denne butikken er en lekeplass.\nTeknologien er på jobb." : "The shop is a playground.\nThe technology is hard at work."}</p><a class="pill-link" href="https://reai.no">${lang === "nb" ? "Møt ekte ReAI" : "Meet the real ReAI"} ↗</a></div><div class="footer-bottom"><span>© ${new Date().getUTCFullYear()} ReAI · ${lang === "nb" ? "Laget med litt ekstra pågangsmot." : "Made with a little extra optimism."}</span><div><a href="/about/">${t.about}</a><a href="/privacy/">${lang === "nb" ? "Personvern" : "Privacy"}</a><a href="/api/">Site API ↗</a><a href="https://github.com/beint-no/reai-site-examples">Source ↗</a></div></div></footer><script src="/assets/demo.js" defer></script></body></html>`;
}
export function renderHome(store, context) {
  const t = copy[language(context.locale)];
  return documentHtml(
    language(context.locale) === "nb" ? "Velkommen" : "Welcome",
    `<section class="hero shell"><div class="hero-copy"><span class="eyebrow"><i></i> ${context.configured ? (language(context.locale) === "nb" ? "REAI SITE API, I LEVENDE LIVE" : "REAI SITE API, IN ACTION") : language(context.locale) === "nb" ? "REAI SITE API-DEMO · OPPSETT PÅGÅR" : "REAI SITE API DEMO · SETUP IN PROGRESS"}</span><h1>${t.hero.split("\n")[0]}<br><em>${t.hero.split("\n")[1]}</em></h1><p>${t.intro}</p><div class="hero-actions"><a class="button" href="/shop/">${t.browse} <span>↗</span></a><a class="under-link" href="/features/">${t.learn}</a></div><div class="hero-footnote"><span>✳</span> ${language(context.locale) === "nb" ? "Litt lek. Hele handelsflyten." : "A little play. The whole commerce flow."}</div></div><div class="hero-scene"><div class="orbit-label label-top">100% DEMO / 100% REAI</div><img class="hero-gift" src="/assets/gift.svg" width="640" height="640" alt="Illustrert gavekort"><img class="hero-mug" src="/assets/mug.svg" width="640" height="640" alt="Illustrert motivasjonskopp"><img class="hero-heart" src="/assets/heart.svg" width="640" height="640" alt="Illustrert hjerte"><div class="orbit-label label-bottom">ADD A LITTLE GOOD KARMA ↗</div><span class="scene-spark spark-one">✳</span><span class="scene-spark spark-two">✧</span></div></section><div class="ticker" aria-hidden="true"><div>GOD KARMA <span>✳</span> KONTORMAGI <span>✳</span> MINDRE ROT <span>✳</span> MER REAI <span>✳</span> GOD KARMA <span>✳</span> KONTORMAGI <span>✳</span> MINDRE ROT <span>✳</span> MER REAI <span>✳</span></div></div><section class="shell shop-section"><div class="section-heading"><div><span class="eyebrow">THE GOOD STUFF</span><h2>${language(context.locale) === "nb" ? "Små ting. Store smil." : "Small things. Big smiles."}</h2></div><a class="under-link" href="/shop/">${t.all} ↗</a></div>${renderGrid(store.products || [], store)}<p class="data-caption"><span class="dot"></span>${context.configured ? t.live : t.noToken} · ${language(context.locale) === "nb" ? "Katalog, priser og varianter. Ikke hardkodet magi." : "Catalog, prices and variants. No hardcoded magic."}</p></section><section class="feature-story shell"><div><span class="eyebrow">BEHIND THE MAGIC</span><h2>${language(context.locale) === "nb" ? "En liten butikk.\nEt helt økosystem." : "One little shop.\nAn entire ecosystem."}</h2><a class="button light" href="/features/">${t.features} ↗</a></div><div class="story-steps"><article><b>01</b><div><h3>${language(context.locale) === "nb" ? "Du finner noe gøy" : "Find something fun"}</h3><p>${language(context.locale) === "nb" ? "Produkter, bilder, samlinger og varianter kommer fra ReAI." : "Products, images, collections and variants come from ReAI."}</p></div></article><article><b>02</b><div><h3>${language(context.locale) === "nb" ? "ReAI holder orden" : "ReAI keeps things in order"}</h3><p>${language(context.locale) === "nb" ? "Pris og tilgjengelighet sjekkes der dataene bor." : "Prices and availability are checked where the data lives."}</p></div></article><article><b>03</b><div><h3>${language(context.locale) === "nb" ? "Checkout tar over" : "Checkout takes over"}</h3><p>${language(context.locale) === "nb" ? "Den aktiverte betalingsflyten åpnes i ReAI hosted checkout." : "The configured payment flow opens in ReAI hosted checkout."}</p></div></article></div></section>`,
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
    `<section class="shell inner"><span class="eyebrow">SHOP SOME GOOD ENERGY</span><h1>${h(collection?.title || t.all)}</h1><p class="lead">${h(collection?.description || (lang === "nb" ? "Fiktive ting. Ekte API-kall. Litt ekstra personlighet." : "Fictional things. Real API calls. A little extra personality."))}</p><div class="shop-toolbar"><div class="collection-filters"><a class="filter ${collection ? "" : "active"}" href="/shop/">${t.all}</a>${(store.collections || []).map((c) => `<a class="filter ${collection?.handle === c.handle ? "active" : ""}" href="/collections/${h(c.handle)}/">${h(c.title)}</a>`).join("")}</div><label class="search"><span class="sr-only">${t.search}</span><input data-search type="search" placeholder="${t.search}"><span aria-hidden="true">⌕</span></label></div>${renderGrid(products, store)}<p data-search-empty hidden>${lang === "nb" ? "Ingen treff. Prøv litt annen magi." : "No matches. Try another kind of magic."}</p></section>`,
    context,
  );
}
export function renderProduct(store, product, availability, context) {
  const lang = language(context.locale),
    t = copy[lang];
  return documentHtml(
    product.title,
    `<section class="shell inner"><a class="breadcrumb" href="/shop/">← ${t.back}</a><div class="product-detail"><div class="detail-art art-${art(product)}">${picture(product, true)}<span class="art-tag">REAI DEMO OBJECT</span></div><div class="detail-copy"><span class="eyebrow">${t.live.toUpperCase()}</span><h1>${h(product.title)}</h1><p class="lead">${h(String(product.description || "").replace(/<[^>]*>/g, ""))}</p><form data-add-to-cart><label for="variant">${t.variants}</label><select id="variant" name="variantId">${(product.variants || []).map((v) => `<option value="${h(v.id)}" ${availability?.variants?.find((a) => a.variantId === v.id)?.status === "OUT_OF_STOCK" ? "disabled" : ""}>${h(v.options?.map((o) => o.value).join(" / ") || v.sku || "Standard")} — ${h(money(v.price, store))}</option>`).join("")}</select><label for="quantity">${t.quantity}</label><input id="quantity" name="quantity" type="number" value="1" min="1" max="20"><button class="button" type="submit" ${(product.variants || []).some((v) => availability?.variants?.find((a) => a.variantId === v.id)?.status === "AVAILABLE") ? "" : "disabled"}>${t.add} <span>+</span></button><p data-add-message role="status"></p></form><div class="product-notes"><p><span class="dot"></span>${t.stock}</p><p>✳ ${lang === "nb" ? "Digitalt demo-produkt. Ingen fysisk levering." : "Digital demo product. No physical delivery."}</p>${product.handle?.includes("gavekort") ? `<p>↗ ${t.gift}</p>` : ""}</div><details class="api-note"><summary>${lang === "nb" ? "Hva viser dette produktet?" : "What does this demonstrate?"}</summary><p>${lang === "nb" ? "Produktdetaljer, bilder og beløpsvarianter kommer fra Site API. Tilgjengelighet hentes separat, og checkout validerer pris og lager på nytt." : "Product detail, images and price variants come from Site API. Availability is fetched separately; checkout revalidates prices and stock."}</p><a href="/api/?product=${h(product.handle)}">${t.api} ↗</a></details></div></div><div class="section-heading"><h2>${t.related}</h2></div>${renderGrid((store.products || []).filter((p) => p.id !== product.id).slice(0, 3), store)}</section>`,
    context,
  );
}
export function renderCart(context) {
  const t = copy[language(context.locale)],
    mode = context.paymentMode || "disabled";
  return documentHtml(
    t.cart,
    `<section class="shell inner cart-page"><span class="eyebrow">A LITTLE GOOD ENERGY</span><h1>${t.basket}</h1><div class="cart-layout"><div data-cart-lines><p>${t.wait}</p></div><aside class="cart-summary"><h2>${t.subtotal}</h2><strong data-cart-total>—</strong><p>${t.pay}: <b>${mode === "test" ? t.test : mode === "live" ? t.livePay : t.disabled}</b></p><button class="button" data-checkout ${mode === "disabled" ? "disabled" : ""}>${t.checkout} ↗</button><p data-checkout-message role="status"></p><p class="fineprint">${language(context.locale) === "nb" ? "ReAI beregner endelig pris og eventuelle rabatter i checkout." : "ReAI calculates final prices and any discounts at checkout."}</p></aside></div></section>`,
    context,
  );
}
export function renderEditorial(route, context) {
  const lang = language(context.locale),
    t = copy[lang];
  let title, body;
  if (route === "features") {
    title = t.features;
    body = `<span class="eyebrow">ONE STORE. ALL THE IMPORTANT BITS.</span><h1>${lang === "nb" ? "Magien har et system." : "The magic has a system."}</h1><p class="lead">${lang === "nb" ? "Demoen viser hvordan en selvstendig nettside bruker ReAI som datakilde. Ingen ny produktdatabase. Ingen hemmeligheter i nettleseren." : "See how an independent website uses ReAI as its data source. No second product database. No secrets in the browser."}</p><div class="feature-list">${[
      [
        "01",
        "Publisert katalog / Published catalog",
        "Produkter og priser styres i ReAI. / Products and prices are managed in ReAI.",
      ],
      [
        "02",
        "Samlinger / Collections",
        "Ulike grupper fra samme katalog. / Different groups from the same catalog.",
      ],
      [
        "03",
        "Varianter / Variants",
        "Én idé, flere beløp og alternativer. / One idea, multiple amounts and options.",
      ],
      [
        "04",
        "Tilgjengelighet / Availability",
        "Egen sjekk før checkout. / A separate check before checkout.",
      ],
      [
        "05",
        "Marked og språk / Markets and language",
        "Samme butikk med riktig språk og kontekst. / One store with the right language and context.",
      ],
      [
        "06",
        "Hosted checkout",
        "ReAI tar imot kurven og håndterer betalingsflyten. / ReAI receives the cart and handles the payment flow.",
      ],
      [
        "07",
        "Bilder / Images",
        "Responsive bilder levert fra ReAI. / Responsive images delivered from ReAI.",
      ],
      [
        "08",
        "Statisk innhold / Static content",
        "Design og forklaringer ligger i nettstedets repo. / Design and explanations live in the website repo.",
      ],
    ]
      .map(
        ([n, a, b]) =>
          `<article><b>${n}</b><h2>${h(a.split(" / ")[lang === "nb" ? 0 : 1] || a)}</h2><p>${h(b.split(" / ")[lang === "nb" ? 0 : 1] || b)}</p></article>`,
      )
      .join("")}</div><a class="button" href="/api/">${t.api} ↗</a>`;
  } else if (route === "about") {
    title = t.about;
    body = `<span class="eyebrow">THIS IS A PLAYGROUND</span><h1>${lang === "nb" ? "En butikk med glimt i API-et." : "A shop with a twinkle in its API."}</h1><p class="lead">${lang === "nb" ? "ReAI Lekebutikken er en demonstrasjon, med fiktive produkter og én ReAI Site. Formålet er å vise hele handelsflyten — ikke å selge kaffe, motivasjon eller innløselige gavekort." : "ReAI Lekebutikken is a demonstration with fictional products and one ReAI Site. It demonstrates the commerce flow, not sales of coffee, motivation or redeemable gift cards."}</p><div class="prose"><h2>${t.pay}</h2><p>${context.paymentMode === "test" ? t.test : context.paymentMode === "live" ? t.livePay : t.disabled}.</p><p>${lang === "nb" ? "«Heia, ReAI!» er et testprodukt og ikke en veldedig innsamling. «ReAI gavekort» oppretter ikke et ekte gavekort eller et innløsningsløfte." : "“Go, ReAI!” is a test product, not a charitable fundraiser. “ReAI gift card” creates no real gift card or redemption promise."}</p><h2>${lang === "nb" ? "Ekte dataflyt, tydelige grenser" : "Real data flow, clear boundaries"}</h2><p>${lang === "nb" ? "Utseende og forklaringer styres i Git. Publisert katalog, priser og aktiv checkout styres i ReAI. Ingen produktpriser er hardkodet i frontend." : "Design and explanations are maintained in Git. Published catalog, prices and active checkout are managed in ReAI. Frontend product prices are not hardcoded."}</p><a href="https://github.com/beint-no/reai-site-examples">${lang === "nb" ? "Se koden og dokumentasjonen" : "Read the source and documentation"} ↗</a></div>`;
  } else if (route === "return") {
    title = t.returned;
    body = `<div class="return-mark">✳</div><h1>${t.returned}</h1><p class="lead">${t.returnText}</p><a class="button" href="/shop/">${t.back} ↗</a>`;
  } else if (route === "privacy") {
    title = lang === "nb" ? "Personvern" : "Privacy";
    body = `<h1>${title}</h1><div class="prose"><p>${lang === "nb" ? "Handlekurven lagres lokalt i nettleseren. Dette nettstedet bruker ikke analyse- eller markedsføringsskript. Når du åpner ReAI checkout, behandles nødvendige ordre- og betalingsopplysninger der. Hosting og sikkerhet kan bruke tekniske forespørselslogger. Ikke bruk følsomme personopplysninger i demonstrasjonen." : "The cart is stored locally in your browser. This site uses no analytics or marketing scripts. ReAI checkout processes necessary order and payment details. Hosting and security may use technical request logs. Do not enter sensitive personal information in the demonstration."}</p></div>`;
  } else {
    title = t.api;
    body = `<span class="eyebrow">THE API PLAYGROUND</span><h1>${lang === "nb" ? "Se hva butikken ser." : "See what the shop sees."}</h1><p class="lead">${lang === "nb" ? "Utforsk offentlige leveringsdata via nettstedets server. Site-nøkkelen blir på serveren. Ingen interne tenant- eller lagerdata vises." : "Explore public delivery data through the website server. The Site credential stays on the server. Internal tenant and warehouse data remain private."}</p><div class="api-playground"><form data-api-explorer><label for="endpoint">Endpoint</label><select id="endpoint" name="endpoint"><option value="site">Site identity / markets</option><option value="storefront">Coherent storefront snapshot</option><option value="catalog">Catalog</option><option value="collections">Collections</option><option value="product">Product detail</option><option value="collection">Collection detail</option><option value="availability">Single availability</option><option value="availabilities">Batch availability</option></select><label for="resource">Handle / variant UUID</label><input id="resource" name="resource" placeholder="heia-reai"><button class="button">${lang === "nb" ? "Hent offentlige data" : "Fetch public data"} ↗</button></form><pre data-api-output tabindex="0">${lang === "nb" ? "Velg et kall og prøv selv." : "Choose a call and try it."}</pre></div><a class="under-link" href="https://app.reai.no/openapi/site/ui">Delivery OpenAPI ↗</a>`;
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
