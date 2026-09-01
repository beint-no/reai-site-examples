export const SITE_ORIGIN = "https://kebabkingtrondheim.no";
export const HANDLE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const EDITORIAL_PATHS = [
  "/",
  "/handlekurv/",
  "/bestilling/fullfort/",
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

const footer = () => `<footer class="site-footer"><div class="shell footer-grid"><div><a class="brand brand-footer" href="/"><span>Kebab</span> King</a><p>Tyrkisk og midtøstens mat i Trondheim sentrum.</p></div><div><h2>Besøk oss</h2><p>Brattørgata 4<br>7010 Trondheim</p><a href="tel:+4747737469">+47 477 37 469</a></div><div><h2>Åpningstider</h2><p>Man–tor og søn: 14:00–23:00<br>Fre–lør: 14:00–03:30</p></div><div><h2>Snarveier</h2><a href="/collections/all/">Hele menyen</a><a href="/#visit">Kontakt og veibeskrivelse</a><a href="/handlekurv/">Handlekurv</a></div></div><div class="shell footer-bottom"><span>Kebab King Trondheim</span></div></footer><div class="cart-toast" role="status" data-cart-toast hidden></div>`;

const documentHtml = ({ title, description, canonicalPath, body, store, schema = "", ogImage = "" }) => {
  const canonical = `${SITE_ORIGIN}${canonicalPath}`;
  return `<!doctype html><html lang="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="theme-color" content="#11100d"><link rel="canonical" href="${escapeHtml(canonical)}"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:type" content="website">${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}">` : ""}<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/store.css?v=1"><script type="module" src="/assets/store.js?v=1"></script>${schema}</head><body>${header(store)}<main id="main">${body}</main>${footer()}</body></html>`;
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
  const collections = publishedCollections(store).slice(0, 6);
  const menuCards = collections.map((collection) => {
    const products = collectionProducts(store, collection).slice(0, 4);
    const image = productByHandle(store, collection.products?.[0]?.handle)?.images?.[0];
    const items = products.map((product) => `<li><a class="dish__name" href="/products/${escapeHtml(product.handle)}/">${escapeHtml(product.title)}</a><span class="dish__dots"></span><span class="dish__price dish__price--full">${priceRange(product.variants)}</span></li>`).join("");
    return `<article class="menu-card"><a class="menu-card__img" href="/collections/${escapeHtml(collection.handle)}/">${responsiveImage(image, { alt: image?.alt || collection.title, preferredWidth: 960, sizes: "(max-width: 560px) 100vw, (max-width: 960px) 50vw, 33vw" })}</a><div class="menu-card__body"><h3><a href="/collections/${escapeHtml(collection.handle)}/">${escapeHtml(collection.title)}</a></h3><ul class="dish">${items}</ul><a class="menu-card__link" href="/collections/${escapeHtml(collection.handle)}/">Se hele kategorien</a></div></article>`;
  }).join("");
  const menu = menuCards || '<div class="menu-empty"><h3>Menyen klargjøres</h3><p>Produktene publiseres fra nettbutikken når menyen er klar.</p></div>';
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Kebab King",
    image: `${SITE_ORIGIN}/assets/durum.jpg`,
    url: `${SITE_ORIGIN}/`,
    telephone: "+4747737469",
    priceRange: "$",
    servesCuisine: ["Turkish", "Middle Eastern", "Kebab"],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Brattørgata 4",
      addressLocality: "Trondheim",
      postalCode: "7010",
      addressCountry: "NO",
    },
    geo: { "@type": "GeoCoordinates", latitude: 63.4340525, longitude: 10.4021883 },
    hasMenu: `${SITE_ORIGIN}/collections/all/`,
    acceptsReservations: false,
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Sunday"], opens: "14:00", closes: "23:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Friday", "Saturday"], opens: "14:00", closes: "23:59" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday", "Sunday"], opens: "00:00", closes: "03:30" },
    ],
    potentialAction: { "@type": "OrderAction", target: `${SITE_ORIGIN}/collections/all/` },
  }).replaceAll("<", "\\u003c");
  return `<!DOCTYPE html><html lang="no"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kebab King Trondheim · Fersk tyrkisk kebab, dürüm &amp; grill</title><meta name="description" content="Kebab King i Brattørgata 4, Trondheim — ekte tyrkiske, midtøsten- og kebabklassikere rett fra grillen. Dürüm, döner, falafel og tallerkener. Bestill levering eller henting på nett, åpent sent hver helg."><meta name="theme-color" content="#14110f"><meta name="author" content="Kebab King"><link rel="canonical" href="${SITE_ORIGIN}/"><meta property="og:type" content="restaurant"><meta property="og:site_name" content="Kebab King"><meta property="og:title" content="Kebab King Trondheim · Fersk tyrkisk kebab &amp; grill"><meta property="og:description" content="Ekte tyrkisk og midtøstens kebab midt i Trondheim sentrum. Dürüm, döner, falafel og tallerkener — levering eller henting."><meta property="og:image" content="${SITE_ORIGIN}/assets/durum.jpg"><meta property="og:url" content="${SITE_ORIGIN}/"><meta property="og:locale" content="nb_NO"><meta property="og:locale:alternate" content="en_NO"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Kebab King Trondheim · Fersk tyrkisk kebab &amp; grill"><meta name="twitter:description" content="Ekte tyrkisk og midtøstens kebab midt i Trondheim sentrum."><meta name="twitter:image" content="${SITE_ORIGIN}/assets/durum.jpg"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/assets/favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&amp;family=Inter:wght@400;500;600;700&amp;family=Poppins:wght@600;700;800&amp;display=swap" rel="stylesheet"><link rel="stylesheet" href="/styles.css?v=2"><script type="application/ld+json">${schema}</script><script src="/script.js?v=2" defer></script><script type="module" src="/assets/store.js?v=2"></script></head><body><a class="skip-link" href="#menu" data-en="Skip to menu">Hopp til meny</a><div class="topbar"><span class="topbar__status" id="status-pill"><span class="dot"></span> <span data-en="Checking hours…">Sjekker åpningstider…</span></span><span class="topbar__msg" data-en="Fresh food in central Trondheim · Open late on weekends">Fersk mat i Trondheim sentrum · Åpent sent i helgene</span><a class="topbar__cta" href="/collections/all/" data-en="See menu and order →">Se meny og bestill →</a></div><header class="nav" id="nav"><div class="nav__inner"><a class="brand" href="#top"><span class="brand__crown"><svg viewBox="0 0 32 24" width="28" height="21"><path d="M2 22h28l-2.4-14-7 6.2L16 2 9.4 14.2 2.4 8 0 22z" fill="currentColor"/></svg></span><span class="brand__text">Kebab&nbsp;King<small>Trondheim</small></span></a><nav class="nav__links"><a href="#menu" data-en="Menu">Meny</a><a href="#about" data-en="About">Om oss</a><a href="#visit" data-en="Visit">Besøk</a><a href="#hours" data-en="Hours">Åpningstider</a></nav><div class="langswitch"><button type="button" class="langswitch__btn is-active" data-lang="no">NO</button><button type="button" class="langswitch__btn" data-lang="en">EN</button></div><a class="nav__cart" href="/handlekurv/">Kurv <span data-cart-count>0</span></a><a class="btn btn--order nav__order" href="/collections/all/" data-en="Order now">Bestill nå</a><button class="nav__toggle" id="nav-toggle" aria-label="Åpne meny" aria-expanded="false"><span></span><span></span><span></span></button></div><nav class="nav__mobile" id="nav-mobile"><a href="#menu" data-en="Menu">Meny</a><a href="#about" data-en="About">Om oss</a><a href="#visit" data-en="Visit">Besøk</a><a href="#hours" data-en="Hours">Åpningstider</a><a href="/handlekurv/">Handlekurv <span data-cart-count>0</span></a><a class="btn btn--order" href="/collections/all/" data-en="See menu and order">Se meny og bestill</a></nav></header><main id="top"><section class="hero"><div class="hero__media"><img src="/assets/hero.jpg" alt="Nygrillet dürüm med falafel og salat" loading="eager"><div class="hero__scrim"></div></div><div class="hero__content"><p class="hero__eyebrow" data-en="Turkish · Middle Eastern · Kebab · Brattørgata 4">Tyrkisk · Midtøsten · Kebab · Brattørgata 4</p><h1 class="hero__title" data-en="The crown of<br/><span>Trondheim kebab</span>">Kongen av<br><span>Trondheim-kebab</span></h1><p class="hero__lead" data-en="Hand-carved döner off the grill, dürüm rolled to order, golden falafel and loaded platters. Made fresh in central Trondheim — delivered hot to your door or ready to pick up.">Håndskåret döner rett fra grillen, dürüm rullet på bestilling, gyllen falafel og fyldige tallerkener. Laget ferskt i Trondheim sentrum — levert varmt hjem til deg eller klart for henting.</p><div class="hero__actions"><a class="btn btn--order btn--lg" href="/collections/all/" data-en="See menu and order">Se meny og bestill</a><a class="btn btn--ghost btn--lg" href="tel:+4747737469" data-en="Call +47 477 37 469">Ring +47 477 37 469</a></div><ul class="hero__badges"><li data-en="<strong>★ 5.0</strong> on Foodora"><strong>★ 5.0</strong> på Foodora</li><li data-en="<strong>Open to 03:30</strong> Fri &amp; Sat"><strong>Åpent til 03:30</strong> fre &amp; lør</li><li data-en="<strong>4&nbsp;km</strong> delivery radius"><strong>4&nbsp;km</strong> leveringsradius</li></ul></div></section><section class="props"><div class="prop"><span class="prop__ico">🔥</span><h3 data-en="Off the grill">Rett fra grillen</h3><p data-en="Döner stacked and roasted in-house, carved fresh for every order — never pre-packed.">Döner spiddet og grillet hos oss, skåret ferskt til hver bestilling — aldri ferdigpakket.</p></div><div class="prop"><span class="prop__ico">🌯</span><h3 data-en="Rolled to order">Rullet på bestilling</h3><p data-en="Dürüm and pita built the moment you order, with crisp salad and our own sauces.">Dürüm og pita lages i det du bestiller, med sprø salat og våre egne sauser.</p></div><div class="prop"><span class="prop__ico">🛵</span><h3 data-en="Fast delivery">Rask levering</h3><p data-en="Hot to your door across central Trondheim, or ready for pickup on Brattørgata.">Varmt hjem til deg i Trondheim sentrum, eller klart for henting i Brattørgata.</p></div><div class="prop"><span class="prop__ico">🌙</span><h3 data-en="Open late">Åpent sent</h3><p data-en="The kitchen runs until 03:30 on Friday and Saturday nights.">Kjøkkenet går til 03:30 natt til lørdag og søndag. Vi har deg.</p></div></section><section class="menu" id="menu"><div class="section-head"><p class="section-head__eyebrow" data-en="The Menu">Menyen</p><h2 data-en="Kebab classics, done right">Kebabklassikere, gjort riktig</h2><p class="section-head__sub" data-en="The live selection, prices and availability come directly from our online menu.">Utvalg, priser og tilgjengelighet hentes direkte fra nettmenyen.</p></div><div class="menu__grid" data-collection-grid>${menu}</div><div class="menu__cta"><a class="btn btn--order btn--lg" href="/collections/all/" data-en="See full menu and order">Se hele menyen og bestill</a></div></section><section class="about" id="about"><div class="about__media"><img src="/assets/mezze.jpg" alt="Ferske mezze, dipp og grillet kjøtt" loading="lazy"></div><div class="about__content"><p class="section-head__eyebrow" data-en="Our Story">Vår historie</p><h2 data-en="A little taste of Istanbul on Brattørgata">En liten smak av Istanbul i Brattørgata</h2><p data-en="Kebab King brings honest Turkish and Middle Eastern street food to the centre of Trondheim. We keep it simple: quality meat seasoned and stacked in-house, bread warmed on the grill, salads chopped fresh and sauces made the way they should be.">Kebab King byr på ekte tyrkisk og midtøstens gatemat midt i Trondheim sentrum. Vi holder det enkelt: kvalitetskjøtt krydret og spiddet hos oss, brød varmet på grillen, salater kuttet ferskt og sauser laget slik de skal være.</p><p data-en="Whether it is a quick lunch on Brattørgata, a family platter to share, or a late-night dürüm after a night out — you will get the same generous, made-to-order plate every time.">Enten det er en rask lunsj i Brattørgata, en familietallerken til deling, eller en sen dürüm etter byen — får du den samme rause, nylagde tallerkenen hver gang. Det er Kongens løfte.</p><ul class="about__list"><li data-en="🥙 Halal kebab meat, prepared fresh daily">🥙 Halal kebabkjøtt, laget ferskt hver dag</li><li data-en="🌱 Vegetarian and halloumi options">🌱 Vegetar- og halloumivalg</li><li data-en="💳 Card, Vipps and online payment">💳 Kort, Vipps og nettbetaling</li><li data-en="📦 Delivery and pickup">📦 Levering og henting</li></ul></div></section><section class="visit" id="visit"><div class="visit__info"><p class="section-head__eyebrow" data-en="Find Us">Finn oss</p><h2 data-en="Visit Kebab King">Besøk Kebab King</h2><p class="visit__addr" data-en="<strong>Brattørgata 4</strong><br/>7010 Trondheim, Norway"><strong>Brattørgata 4</strong><br>7010 Trondheim, Norge</p><p class="visit__row"><span>📞</span> <a href="tel:+4747737469">+47 477 37 469</a></p><p class="visit__row" data-en="<span>🛵</span> Delivery across central Trondheim (≈4&nbsp;km radius)"><span>🛵</span> Levering i Trondheim sentrum (ca. 4&nbsp;km radius)</p><p class="visit__row" data-en="<span>🥡</span> Pickup and takeaway welcome"><span>🥡</span> Henting og takeaway er velkomment</p><div class="visit__actions"><a class="btn btn--dark" href="https://www.google.com/maps/dir/?api=1&amp;destination=Brattørgata+4,+7010+Trondheim" target="_blank" rel="noopener" data-en="Get directions">Veibeskrivelse</a><a class="btn btn--order" href="/collections/all/" data-en="Order delivery">Bestill levering</a></div></div><div class="visit__map"><iframe title="Kart til Kebab King, Brattørgata 4, Trondheim" src="https://www.openstreetmap.org/export/embed.html?bbox=10.3922%2C63.4310%2C10.4122%2C63.4371&amp;layer=mapnik&amp;marker=63.4340525%2C10.4021883" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div></section><section class="hours" id="hours"><div class="section-head"><p class="section-head__eyebrow" data-en="Opening Hours">Åpningstider</p><h2 data-en="When the grill is on">Når grillen er på</h2></div><div class="hours__card"><table class="hours__table" id="hours-table"><tr data-day="1,2,3,4"><th data-en="Monday – Thursday">Mandag – torsdag</th><td>14:00 – 23:00</td></tr><tr data-day="5"><th data-en="Friday">Fredag</th><td>14:00 – 03:30</td></tr><tr data-day="6"><th data-en="Saturday">Lørdag</th><td>14:00 – 03:30</td></tr><tr data-day="0"><th data-en="Sunday">Søndag</th><td>14:00 – 23:00</td></tr></table><p class="hours__foot" id="hours-now" data-en="All times are local (Europe/Oslo).">Alle tider er lokale (Europa/Oslo).</p></div></section><section class="cta-band"><h2 data-en="Hungry yet?">Sulten allerede?</h2><p data-en="Your kebab is minutes away. Order delivery or pickup now.">Kebaben din er minutter unna. Bestill levering eller henting nå.</p><a class="btn btn--order btn--lg" href="/collections/all/" data-en="See menu and order">Se meny og bestill</a></section></main><footer class="footer"><div class="footer__inner"><div class="footer__brand"><span class="brand__crown"><svg viewBox="0 0 32 24" width="24" height="18"><path d="M2 22h28l-2.4-14-7 6.2L16 2 9.4 14.2 2.4 8 0 22z" fill="currentColor"/></svg></span><span>Kebab King · Trondheim</span></div><div class="footer__col"><h4 data-en="Contact">Kontakt</h4><p>Brattørgata 4, 7010 Trondheim</p><p><a href="tel:+4747737469">+47 477 37 469</a></p></div><div class="footer__col"><h4 data-en="Order">Bestill</h4><p><a href="/collections/all/" data-en="See live menu">Se nettmenyen</a></p><p><a href="/handlekurv/" data-en="Shopping cart">Handlekurv</a></p></div><div class="footer__col"><h4 data-en="Hours">Åpningstider</h4><p data-en="Mon–Thu and Sun: 14:00–23:00">Man–tor og søn: 14:00–23:00</p><p data-en="Fri and Sat: 14:00–03:30">Fre og lør: 14:00–03:30</p></div></div><p class="footer__legal" data-en="© <span id=&quot;year&quot;>2026</span> Kebab King, Trondheim. All rights reserved. · Menu, prices and availability update from the online store.">© <span id="year">2026</span> Kebab King, Trondheim. Alle rettigheter reservert. · Meny, priser og tilgjengelighet oppdateres fra nettbutikken.</p></footer><a class="fab" href="/collections/all/" data-en="🛵 Order">🛵 Bestill</a><div class="cart-toast" role="status" data-cart-toast hidden></div></body></html>`;
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
