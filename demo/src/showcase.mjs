// Presentation content only. Scenario fixtures never enter the live catalog or checkout.
const h = (v = "") =>
  String(v).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const nb = (c) => !String(c.locale).startsWith("en");
const pick = (c, a, b) => (nb(c) ? a : b);
export const arrow =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
export const designs = [
  {
    slug: "studio",
    name: "Studio",
    title: ["Skuffer & fargevalg", "Drawers & swatches"],
    text: [
      "Et rent produktfokus med fargevalg og en handlekurv som blir på siden.",
      "A clean product focus with swatches and a cart that stays on the page.",
    ],
  },
  {
    slug: "atelier",
    name: "Atelier",
    title: ["Redaksjonell butikk", "Editorial commerce"],
    text: [
      "Mer plass til historien. Samlinger, gaver og et roligere uttrykk.",
      "Room for the story. Collections, gifts and a quieter expression.",
    ],
  },
  {
    slug: "supply",
    name: "Supply",
    title: ["Lager & varianter", "Stock & variants"],
    text: [
      "En funksjonell butikk med synlig tilgjengelighet for hver variant.",
      "A functional store with visible availability for every variant.",
    ],
  },
];
const primitives = [
  [
    "integration",
    "Kassasystem",
    "Point of sale",
    "Salg i butikk og på nett, samlet med regnskapet i ReAI.",
    "In-store and online sales, together with accounting in ReAI.",
    "ReAI",
  ],
  [
    "catalog",
    "Katalog & varianter",
    "Catalog & variants",
    "Produkter, bilder, beskrivelser, varianter, pakker og samlinger.",
    "Products, images, descriptions, variants, bundles and collections.",
    "Site API",
  ],
  [
    "discounts",
    "Priser & rabatter",
    "Prices & discounts",
    "Bruttopriser, sammenligningspris og rabattkoder med regler.",
    "Gross prices, compare-at prices and discount codes with rules.",
    "Site API + checkout",
  ],
  [
    "catalog",
    "Lager & tilgjengelighet",
    "Stock & availability",
    "Tilgjengelighet per variant. Checkout validerer lager på nytt.",
    "Per-variant availability. Checkout validates stock again.",
    "Site API",
  ],
  [
    "payments",
    "Checkout & betaling",
    "Checkout & payments",
    "Adyen, kort og lommebøker. Tilgjengelige metoder avhenger av oppsett.",
    "Adyen, cards and wallets. Available methods depend on configuration.",
    "Hosted checkout",
  ],
  [
    "shipping",
    "Frakt & henting",
    "Shipping & pickup",
    "Bring, PostNord, hentested og lokal henting for fysiske varer.",
    "Bring, PostNord, pickup points and local collection for physical goods.",
    "Hosted checkout",
  ],
  [
    "business",
    "B2B & EHF",
    "B2B & EHF",
    "Firmasøk og fakturaordre. Selger utsteder faktura og sender EHF senere.",
    "Company search and invoice orders. The merchant issues invoices and sends EHF later.",
    "Checkout + ReAI",
  ],
  [
    "newsletter",
    "Kunder & samtykke",
    "Customers & consent",
    "E-postpåmelding med eksplisitt samtykke, lagret hos Site-eieren.",
    "Email signup with explicit consent, recorded for the Site owner.",
    "Site API",
  ],
  [
    "markets",
    "Markeder & språk",
    "Markets & languages",
    "Marked, valuta og lokaliserte tekster fra samme datakilde.",
    "Markets, currency and localized content from one source.",
    "Site API",
  ],
  [
    "integration",
    "Ordre & oppfølging",
    "Orders & operations",
    "Ordre, fraktetiketter, delvis refusjon og regnskap håndteres i ReAI.",
    "Orders, shipping labels, partial refunds and accounting are handled in ReAI.",
    "ReAI admin",
  ],
];
export function featureMatrix(c) {
  return `<section class="shell primitive-section" id="primitives"><div class="section-heading"><h2>${pick(c, "Dette håndterer ReAI.", "What ReAI handles.")}</h2><p>${pick(c, "Åpne en funksjon for å se dataene, oppsettet og hvordan du kan prøve den.", "Open a feature to see its data, configuration and how to try it.")}</p></div><div class="primitive-rows">${primitives.map(([slug, a, b, x, y, scope], i) => `<a class="primitive-row" href="/learn/${slug}/"><span class="row-number">${String(i + 1).padStart(2, "0")}</span><h3>${pick(c, a, b)}</h3><p>${pick(c, x, y)}</p><span class="scope">${scope}</span><span class="row-arrow">${arrow}</span></a>`).join("")}</div></section>`;
}
export function designGallery(c) {
  return `<section class="shell designs-section" id="designs"><div class="section-heading"><div><h2>${pick(c, "Tre design med samme katalog.", "Three designs using the same catalog.")}</h2><p>${pick(c, "Sammenlign fargevalg, handlekurv og produktvisning. Produkter og priser hentes fra ReAI i alle tre designene.", "Compare swatches, carts and product layouts. All three designs fetch products and prices from ReAI.")}</p></div></div><div class="design-grid">${designs.map((d) => `<a class="design-card" href="/designs/${d.slug}/"><div class="design-preview preview-${d.slug}"><div class="preview-header"><b>${d.name.toUpperCase()}</b><span>${pick(c, "Kolleksjon", "Collection")} ${arrow}</span></div><img src="/assets/${d.slug}.jpg" width="840" height="1050" loading="lazy" alt="${h(d.name)} ${pick(c, "designillustrasjon", "design illustration")}"><div class="preview-overlay"><span>${d.title[nb(c) ? 0 : 1]}</span>${d.slug === "studio" ? '<div class="swatch-preview"><i></i><i></i><i></i></div>' : ""}</div></div><div class="design-card-caption"><h3>${d.name} <span>— ${d.title[nb(c) ? 0 : 1]}</span></h3>${arrow}</div><p>${d.text[nb(c) ? 0 : 1]}</p></a>`).join("")}</div><p class="fineprint">${pick(c, "Fotografiene illustrerer designene. Produktene under hentes fra den publiserte ReAI-katalogen, med testkjøp, gavekort og støtte til utvikling.", "Photography illustrates the designs. Products come from the published ReAI catalog: test purchases, gift cards and development support.")}</p></section>`;
}
export function newsletter(c) {
  return `<section class="shell" id="newsletter"><div class="newsletter-band"><div><h2>${pick(c, "Prøv også e-postpåmelding.", "Try email signup, too.")}</h2><p>${pick(c, "Et ekte Site API-kall med eksplisitt samtykke. Ingen e-post sendes automatisk.", "A real Site API request with explicit consent. No email is sent automatically.")}</p><a href="/learn/newsletter/">${pick(c, "Slik virker samtykke", "How consent works")} ${arrow}</a></div><form data-newsletter><label class="sr-only" for="signup-email">${pick(c, "E-postadresse", "Email address")}</label><div class="newsletter-input"><input id="signup-email" name="email" type="email" autocomplete="email" maxlength="254" required placeholder="${pick(c, "din@epost.no", "you@example.com")}"><button class="button" type="submit">${pick(c, "Meld meg på", "Subscribe")}</button></div><label class="consent"><input type="checkbox" name="consent" required> <span>${pick(c, "Jeg vil motta nyheter fra", "I want to receive news from")} ${h(c.merchantName || "Better Integration")}. <a href="/privacy/">${pick(c, "Personvern", "Privacy")}</a></span></label><input class="honeypot" name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true"><p data-newsletter-message role="status"></p></form></div></section>`;
}
export function platformExplanation(c) {
  const layers = [
    ["01", "Butikkdesignet", "Storefront design", "HTML · CSS · JavaScript", "Velg typografi, bilder, fargevalg og handlekurv. Studio, Atelier og Supply viser tre løsninger med den samme katalogen.", "Choose typography, photography, swatches and a cart. Studio, Atelier and Supply show three approaches using the same catalog.", "/#designs", "Se designene", "Compare the designs"],
    ["02", "Produkter fra Site API", "Products from Site API", "Katalog → varianter → tilgjengelighet", "Publiser produkter, priser, samlinger og oversettelser i ReAI. Nettsiden henter dataene og presenterer dem i sitt eget design.", "Publish products, prices, collections and translations in ReAI. The website fetches those records and presents them in its own design.", "/api/", "Se dataene butikken bruker", "Inspect the store’s data"],
    ["03", "Checkout og regnskap", "Checkout and accounting", "Handlekurv → betaling → ordre", "Send variant-ID og antall til checkout. ReAI beregner pris og rabatt, tar imot betalingen og følger ordren videre i plattformen.", "Send variant IDs and quantities to checkout. ReAI calculates prices and discounts, takes payment and tracks the order in the platform.", "/learn/checkout-test/", "Følg hele kjøpsflyten", "Follow the purchase flow"],
  ];
  return `<section class="shell architecture-section" id="how-it-works"><div class="section-heading"><div><span class="eyebrow">${pick(c, "SLIK ER DENNE BUTIKKEN BYGGET", "HOW THIS STORE IS BUILT")}</span><h2>${pick(c, "Design på nettsiden.<br>Handelsdata i ReAI.", "Design on the website.<br>Commerce data in ReAI.")}</h2></div><p>${pick(c, "Du trenger ikke et bestemt tema eller rammeverk. API-et leverer publiserte data; nettsiden bestemmer hvordan de vises.", "No particular theme or framework is required. The API supplies published data; the website decides how to display it.")}</p></div><div class="architecture-grid">${layers.map(([n, a, b, detail, x, y, url, linkNb, linkEn]) => `<article><span class="row-number">${n}</span><h3>${pick(c, a, b)}</h3><p>${pick(c, x, y)}</p><code>${n === "02" ? pick(c, detail, "Catalog → variants → availability") : n === "03" ? pick(c, detail, "Cart → payment → order") : detail}</code><a class="under-link" href="${url}">${pick(c, linkNb, linkEn)} ${arrow}</a></article>`).join("")}</div><div class="architecture-note"><b>${pick(c, "Raskt uten en tung frontend", "Fast without a heavy frontend")}</b><p>${pick(c, "Disse sidene kommer som ferdig HTML fra en Cloudflare Worker. CSS og bilder bygger designet; JavaScript brukes til kurv, fargevalg og skjemaer. Katalogen kan mellomlagres med ETag, mens lagerstatus må hentes fersk og valideres igjen i checkout.", "These pages arrive as HTML from a Cloudflare Worker. CSS and images build the design; JavaScript handles the cart, swatches and forms. Catalogs support ETag caching, while availability needs fresh reads and validation again at checkout.")}</p><a href="/learn/integration/">${pick(c, "Lær om rendering, ytelse og API-tilgang", "Learn about rendering, performance and API access")} ${arrow}</a></div></section>`;
}
export function checkoutTest(c) {
  return `<section class="checkout-test-band"><div class="shell checkout-test"><div><span class="eyebrow">${pick(c, "PRØV DEN FAKTISKE KJØPSFLYTEN", "TRY THE ACTUAL PURCHASE FLOW")}</span><h2>${pick(c, "Fra 1 kr til<br>betaling og ordre.", "From 1 kr to<br>payment and order.")}</h2><p>${pick(c, "Velg 1, 10 eller 100 kr. Legg produktet i kurven, åpne ReAI checkout og følg hva som skjer med betaling, ordre og kvittering.", "Choose 1, 10 or 100 kr. Add the product to your cart, open ReAI checkout and follow payment, order and receipt.")}</p><div class="hero-actions"><a class="button" href="/products/test-betaling/">${pick(c, "Velg testbeløp", "Choose a test amount")} ${arrow}</a><a class="under-link" href="/learn/checkout-test/">${pick(c, "Se hele sjekklisten", "See the complete checklist")} ${arrow}</a></div><p class="fineprint">${c.preview || c.paymentMode !== "live" ? pick(c, "Se betalingsmodus i handlekurven. Lokal forhåndsvisning tar ikke betaling.", "Check the payment mode in the cart. Local preview takes no payments.") : pick(c, "Fullført betaling trekker beløpet og går til", "Completing payment charges the amount and pays")} ${!c.preview && c.paymentMode === "live" ? `${h(c.merchantName)}. ${pick(c, "Ingen varer eller tjenester leveres for testproduktet.", "No goods or services are delivered for the test product.")}` : ""}</p></div><ol class="checkout-test-steps">${[
    ["Handlekurv", "Cart", "Velg variant og antall. Prisen kommer fra ReAI.", "Choose a variant and quantity. Prices come from ReAI."],
    ["Checkout", "Checkout", "Prøv rabattkode og en tilgjengelig betalingsmåte.", "Try a discount code and an available payment method."],
    ["Betalingsresultat", "Payment result", "Bekreftet betaling er fasiten, ikke retur til nettsiden.", "Confirmed payment is authoritative, not a return to the website."],
    ["Ordre i ReAI", "Order in ReAI", "Selger ser ordre, betaling og videre oppfølging.", "The merchant sees the order, payment and subsequent operations."],
  ].map(([a, b, x, y], i) => `<li><span>${String(i + 1).padStart(2, "0")}</span><div><h3>${pick(c, a, b)}</h3><p>${pick(c, x, y)}</p></div></li>`).join("")}</ol></div></section>`;
}
export function homeContent(c) {
  return `<section class="hero shell"><div class="hero-copy"><h1>${pick(c, "<span class=\"platform-products\">Nettbutikk + Kassasystem + Regnskap</span><span class=\"platform-promise\">Alt i en plattform</span>", "<span class=\"platform-products\">Online store + Point of sale + Accounting</span><span class=\"platform-promise\">All in one platform</span>")}</h1><p>${pick(c, "Publiser produkter i ReAI. Hent dem til et butikkdesign du styrer selv. Bruk samme plattform til checkout, kassasystem, ordre og regnskap, uten dyre integrasjoner mellom disse systemene.", "Publish products in ReAI. Fetch them into a storefront design you control. Use the same platform for checkout, point of sale, orders and accounting, without expensive integrations between those systems.")}</p><div class="hero-actions"><a class="button" href="#primitives">${pick(c, "Utforsk funksjonene", "Explore the features")} ${arrow}</a><a class="under-link" href="#designs">${pick(c, "Prøv butikkdesign", "Try storefront designs")} ${arrow}</a></div><a class="under-link" href="/products/test-betaling/">${pick(c, "Test hele kjøpsflyten fra 1 kr", "Test the full purchase flow from 1 kr")} ${arrow}</a></div><div class="platform-preview"><a class="mini-store" href="/scenarios/studio/"><div class="window-chrome"><i></i><i></i><i></i><span>STUDIO / UI scenario</span></div><div class="mini-product"><img src="/assets/studio.jpg" width="840" height="1050" alt="${pick(c, "Illustrasjon av et butikkdesign med en marineblå genser", "Illustrative storefront design with a navy sweatshirt")}" fetchpriority="high"><div><b>Studio / Essential</b><strong>349 kr</strong><small>${pick(c, "Simulert produkt & lager", "Simulated product & stock")}</small><p>${pick(c, "Farge", "Color")}</p><div class="swatch-preview"><i></i><i></i><i></i></div><p>${pick(c, "Størrelse", "Size")}</p><div class="size-preview"><span>S</span><span class="selected">M</span><s>L</s><span>XL</span></div><span class="mini-button">${pick(c, "Prøv variantvalg", "Try variant selection")}</span></div></div></a><div class="platform-nodes">${[
    ["Katalog", "Catalog", "Produkter · varianter"],
    ["Checkout", "Checkout", "Betaling · faktura"],
    ["Regnskap", "Accounting", "Ordre · oppfølging"],
  ]
    .map(
      ([a, b, desc]) =>
        `<div><b>${pick(c, a, b)}</b><small>${nb(c) ? desc : a === "Katalog" ? "Products · variants" : a === "Checkout" ? "Payment · invoice" : "Orders · operations"}</small></div>`,
    )
    .join(
      "",
    )}</div></div></section>${featureMatrix(c)}${platformExplanation(c)}<section class="workflow-band"><div class="shell workflow"><h2>${pick(c, "Fra handlekurv<br>til regnskap.", "From cart<br>to accounting.")}</h2><ol>${[
    ["Butikken", "The storefront", "Design & Site API"],
    ["ReAI checkout", "ReAI checkout", "Adyen / B2B"],
    ["Ordre & levering", "Orders & delivery", "ReAI"],
    ["Regnskap", "Accounting", "ReAI"],
  ]
    .map(
      ([a, b, x]) =>
        `<li><span>${pick(c, a, b)}</span><small>${x}</small>${arrow}</li>`,
    )
    .join(
      "",
    )}</ol></div></section>${designGallery(c)}${checkoutTest(c)}<section class="shell lab-teaser"><div><h2>${pick(c, "Test også det som ikke går som planlagt.", "Test what happens when things go wrong.")}</h2><p>${pick(c, "Utsolgte varianter, tomt lager, restordre, endret tilgjengelighet og handlekurv i skuff. Et avgrenset UI-laboratorium med tydelig merkede testdata.", "Sold-out variants, empty inventory, backorders, changed availability and a cart drawer. A focused UI lab with clearly marked test data.")}</p></div><a class="button light" href="/scenarios/studio/">${pick(c, "Åpne testlaboratoriet", "Open the scenario lab")} ${arrow}</a></section>${newsletter(c)}`;
}
export function scenarioContent(style, c) {
  const supply = style === "supply";
  return `<section class="shell inner scenario-page" data-scenario="${style}"><a class="breadcrumb" href="/#designs">${pick(c, "Til ReAI showcase", "Back to ReAI showcase")} ${arrow}</a><div class="scenario-banner"><b>${pick(c, "UI-laboratorium · simulerte data", "UI lab · simulated data")}</b><p>${pick(c, "Denne katalogen demonstrerer butikkdesign. Den er separat fra Site API, og kan ikke opprette ordre, trekke betaling eller bestille frakt.", "This catalog demonstrates storefront design. It is separate from the Site API and cannot create orders, take payment or book shipping.")}</p></div><div class="scenario-toolbar"><strong>${supply ? "SUPPLY" : "STUDIO"}</strong><label>${pick(c, "Testscenario", "Scenario")}<select data-scenario-state><option value="mixed">${pick(c, "Noen varianter utsolgt", "Some variants sold out")}</option><option value="available">${pick(c, "Alle på lager", "All available")}</option><option value="soldout">${pick(c, "Alt utsolgt", "Everything sold out")}</option><option value="backorder">${pick(c, "Fortsett ved utsolgt", "Continue when sold out")}</option><option value="changed">${pick(c, "Utsolgt etter lagt i kurven", "Sold out after adding to cart")}</option></select></label><button class="button light" type="button" data-scenario-cart-open>${pick(c, "Testkurv", "Scenario cart")} <span data-scenario-count>0</span></button></div><div class="scenario-product"><div class="scenario-image"><img src="/assets/${supply ? "supply" : "studio"}.jpg" width="840" height="1050" alt="${supply ? "Field pack" : "Essential crewneck"}"></div><div class="scenario-copy"><h1>${supply ? "Field pack 25L" : "Essential crewneck"}</h1><p class="lead">${pick(c, "Et illustrativt produkt for å teste en god kjøpsopplevelse.", "An illustrative product for testing a great shopping experience.")}</p><strong class="scenario-price">${supply ? "1 299" : "349"} kr</strong><form data-scenario-add><fieldset><legend>${pick(c, "Farge", "Color")}</legend><div class="scenario-colors">${(supply ? ["Forest", "Black", "Sand"] : ["Navy", "Cream", "Green"]).map((color, i) => `<label class="swatch-option"><input type="radio" name="color" value="${color}" ${i === 0 ? "checked" : ""}><span class="color-dot color-${color.toLowerCase()}"></span><span>${color}</span></label>`).join("")}</div></fieldset><fieldset><legend>${pick(c, "Størrelse", "Size")}</legend><div class="scenario-sizes">${(supply ? ["25L", "35L", "45L"] : ["S", "M", "L", "XL"]).map((size, i) => `<label class="size-option"><input type="radio" name="size" value="${size}" ${i === 1 ? "checked" : ""}><span>${size}</span><small data-size-status="${size}"></small></label>`).join("")}</div></fieldset><p class="availability-status" data-scenario-availability role="status"></p><label class="quantity">${pick(c, "Antall", "Quantity")} <input type="number" name="quantity" min="1" max="20" value="1"></label><button class="button" data-scenario-submit>${pick(c, "Legg i testkurven", "Add to scenario cart")} ${arrow}</button><p data-scenario-message role="status"></p></form><details class="api-note" open><summary>${pick(c, "Hva tester dette?", "What does this test?")}</summary><p>${pick(c, "Variantkombinasjoner, fargevalg, utsolgte størrelser, restordre og validering før checkout. I en ekte butikk kommer variant-ID og tilgjengelighet fra Site API; ReAI kontrollerer pris og lager på nytt når en checkout opprettes.", "Variant combinations, swatches, sold-out sizes, backorders and validation before checkout. In a real store, variant IDs and availability come from the Site API; ReAI checks price and stock again when checkout is created.")}</p><a href="/api/?endpoint=availabilities">${pick(c, "Sammenlign med det ekte API-et", "Compare with the real API")} ${arrow}</a></details></div></div><div class="scenario-related"><a href="/scenarios/${supply ? "studio" : "supply"}/">${pick(c, "Prøv det andre designet", "Try the other design")} ${arrow}</a><a href="/designs/${style}/">${pick(c, "Se designet med live-katalog", "See the design with a live catalog")} ${arrow}</a></div></section><dialog class="cart-drawer" data-scenario-drawer aria-label="${pick(c, "Testkurv", "Scenario cart")}"><div class="drawer-header"><h2>${pick(c, "Testkurv", "Scenario cart")}</h2><button data-scenario-cart-close aria-label="${pick(c, "Lukk", "Close")}">×</button></div><p class="scenario-banner">${pick(c, "Simulerte data. Ingen ordre eller betaling.", "Simulated data. No orders or payments.")}</p><div data-scenario-lines></div><div class="drawer-bottom"><b>${pick(c, "Delsum", "Subtotal")} <span data-scenario-total>0 kr</span></b><button class="button" data-scenario-validate>${pick(c, "Test validering", "Test validation")} ${arrow}</button><p data-scenario-validation role="status"></p></div></dialog>`;
}
export function designContent(style, store, availability, c, grid) {
  const d = designs.find((x) => x.slug === style),
    products = store.products || [],
    selected =
      products.find((p) => p.handle === "kvitteringskonfetti") || products[0];
  const status = (id) =>
    availability?.variants?.find((v) => v.variantId === id)?.status ||
    "UNKNOWN";
  return `<section class="shell inner design-page"><a class="breadcrumb" href="/#designs">${pick(c, "Alle butikkdesign", "All storefront designs")} ${arrow}</a><div class="design-intro"><h1>${d.name.toUpperCase()}</h1><p>${d.text[nb(c) ? 0 : 1]}</p></div><div class="design-layout"><div class="design-photo"><img src="/assets/${style}.jpg" width="840" height="1050" alt="${d.name} ${pick(c, "designillustrasjon", "design illustration")}"><span>${pick(c, "Designillustrasjon — ikke et produkt til salgs", "Design illustration — not a product for sale")}</span></div><div class="design-details"><h2>${style === "atelier" ? pick(c, "Samlinger og produktfortelling.", "Collections and product storytelling.") : style === "supply" ? pick(c, "Lagerstatus for hver variant.", "Availability for each variant.") : pick(c, "Fargevalg og kurv på samme side.", "Swatches and cart on the same page.")}</h2><p>${pick(c, "Den samme publiserte katalogen, i et annet uttrykk. Produkter, priser og tilgjengelighet under kommer fra ReAI.", "The same published catalog in a different expression. The products, prices and availability below come from ReAI.")}</p>${style === "studio" && selected ? `<div class="live-option-demo"><b>${h(selected.title)}</b><small>${pick(c, "Fargevalg fra produktets varianter", "Swatches from the product’s variants")}</small><form data-add-to-cart><fieldset><legend>${pick(c, "Velg variant", "Choose variant")}</legend><div class="live-swatches">${selected.variants.map((v, i) => `<label class="live-swatch"><input type="radio" name="variantId" value="${h(v.id)}" ${status(v.id) !== "AVAILABLE" ? "disabled" : ""} ${i === 0 && status(v.id) === "AVAILABLE" ? "checked" : ""}><span class="color-dot ${v.options.some((o) => /gul|yellow/i.test(o.value)) ? "color-yellow" : "color-blue"}"></span><span>${h(v.options.map((o) => o.value).join(" / "))}<br><small>${h(new Intl.NumberFormat(c.locale, { style: "currency", currency: store.currency }).format(v.price))}</small></span></label>`).join("")}</div></fieldset><input type="hidden" name="quantity" value="1"><button class="button" ${selected.variants.some((v) => status(v.id) === "AVAILABLE") ? "" : "disabled"}>${pick(c, "Legg i kurven", "Add to cart")} ${arrow}</button><p data-add-message role="status"></p></form></div>` : ""}${
    style === "supply"
      ? `<div class="stock-matrix">${products
          .slice(0, 4)
          .flatMap((p) =>
            p.variants
              .slice(0, 2)
              .map(
                (v) =>
                  `<div><span><b>${h(p.title)}</b><small>${h(v.options.map((o) => o.value).join(" / "))}</small></span><span class="stock-${status(v.id).toLowerCase()}">${status(v.id)}</span></div>`,
              ),
          )
          .join("")}</div>`
      : ""
  }<div class="design-links"><a class="button" href="${style === "atelier" ? "/collections/smarte-gaver/" : "#live-products"}">${pick(c, "Utforsk live-produkter", "Explore live products")} ${arrow}</a><a class="under-link" href="/scenarios/${style === "supply" ? "supply" : "studio"}/">${pick(c, "Prøv utsolgt & restordre", "Try sold out & backorders")} ${arrow}</a></div><p class="fineprint">${pick(c, "Digitale testprodukter. Ingen fysisk levering. Betalingsmodus vises i kurven.", "Digital test products. No physical delivery. Payment mode is shown in the cart.")}</p></div></div><section id="live-products" class="design-products"><div class="section-heading"><h2>${pick(c, "Katalogen fra ReAI.", "The ReAI catalog.")}</h2><a href="/api/?endpoint=storefront">${pick(c, "Se datakilden", "See the data source")} ${arrow}</a></div>${grid}</section></section>`;
}
