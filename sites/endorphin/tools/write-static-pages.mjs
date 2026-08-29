import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  SHIPPING_THRESHOLD,
  STORE_SCRIPT,
  STORE_STYLE,
  localPicture,
  renderReviewGrid,
} from "../storefront.mjs";

const origin = "https://endorphin.no";
const contactEmail = "post@famme.no";
const year = new Date().getFullYear();
const nav = `<a href="/">Hjem</a><a href="/collections/joggesko/">Joggesko</a><a href="/collections/sokker/">Sokker</a><a href="/collections/all/">Alle</a>`;

const chrome = (activeTitle) => `<a class="skip-link" href="#main">Hopp til innhold</a>
  <aside class="shop-announcement" aria-label="Kjøpsfordeler"><ul class="shop-shell"><li>Gratis bytte &amp; fri frakt over ${SHIPPING_THRESHOLD} kr</li><li>Etikettløs retur</li><li>Vipps, kort og mobilbetaling</li></ul></aside>
  <header class="shop-header"><div class="shop-header-inner shop-shell">
    <a class="shop-logo" href="/" aria-label="Endorphin, forside"><img src="/assets/brand/endorphin-logo.png" alt="Endorphin" width="800" height="95" decoding="async"></a>
    <button class="shop-menu-toggle" type="button" aria-label="Åpne meny" aria-expanded="false" aria-controls="shop-navigation" data-nav-toggle><span></span></button>
    <nav class="shop-nav" id="shop-navigation" aria-label="Hovedmeny" data-nav-links>${nav}</nav>
    <div class="shop-tools"><a href="/sok/" aria-label="Søk">Søk</a><a href="/handlekurv/" aria-label="Handlekurv">Kurv <span class="cart-count" data-cart-count>0</span></a></div>
  </div></header>`;

const footer = `<footer class="shop-footer"><div class="shop-shell shop-footer-grid"><div><a class="shop-logo shop-logo--footer" href="/"><img src="/assets/brand/endorphin-logo.png" alt="Endorphin" width="800" height="95" loading="lazy" decoding="async"></a><p>Joggesko fra Famme med demping til trening, jobb og hverdag. Fri frakt over ${SHIPPING_THRESHOLD} kr.</p></div><div><h2>Handle</h2><a href="/collections/joggesko/">Joggesko</a><a href="/collections/sokker/">Sokker</a><a href="/collections/all/">Alle produkter</a></div><div><h2>Informasjon</h2><a href="/frakt/">Frakt og levering</a><a href="/storrelse/">Størrelsesguide</a><a href="/om/">Om oss</a><a href="/kontakt/">Kontakt</a><a href="/faq/">Ofte stilte spørsmål</a></div><div><h2>Vilkår</h2><a href="/vilkar/">Kjøpsvilkår</a><a href="/retur/">Retur og bytte</a><a href="/personvern/">Personvern</a></div></div><div class="shop-footer-bottom shop-shell"><span>© ${year} Endorphin</span><div><a href="mailto:${contactEmail}">${contactEmail}</a></div></div></footer><div class="cart-toast" role="status" aria-live="polite" data-cart-toast hidden></div>`;

const semanticBreadcrumbs = (body) => body.replace(
  /<nav class="shop-breadcrumbs"><a href="\/">Hjem<\/a><span>\/<\/span><span>([^<]+)<\/span><\/nav>/g,
  '<nav class="shop-breadcrumbs" aria-label="Brødsmulesti"><ol><li><a href="/">Hjem</a></li><li><span aria-current="page">$1</span></li></ol></nav>',
);

const page = ({ title, description, canonical, body, extraHead = "", bodyAttr = "" }) => `<!doctype html><html lang="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${title}</title><meta name="description" content="${description}">${extraHead}<meta name="theme-color" content="#f7f4ef"><link rel="canonical" href="${origin}${canonical}"><link rel="icon" href="/assets/favicon.png" type="image/png"><link rel="preconnect" href="https://app.reai.no" crossorigin><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${origin}${canonical}"><meta property="og:type" content="website"><meta property="og:image" content="${origin}/assets/hero.webp"><meta property="og:locale" content="nb_NO"><meta property="og:site_name" content="Endorphin"><link rel="stylesheet" href="/assets/site.css"><link rel="stylesheet" href="${STORE_STYLE}"><script type="module" src="${STORE_SCRIPT}"></script></head><body${bodyAttr}>${chrome()}<noscript><p class="noscript-banner">JavaScript må være aktivert for handlekurv og utsjekk.</p></noscript><main id="main">${semanticBreadcrumbs(body)}</main>${footer}</body></html>
`;

const pages = {
  "index.html": page({
    title: "Endorphin — Joggesko med god demping",
    description: `Joggesko fra Famme til trening og hverdag. Fri frakt over ${SHIPPING_THRESHOLD} kr, gratis bytte og betaling med Vipps, kort eller mobilbetaling.`,
    canonical: "/",
    body: `<section class="store-hero store-hero--lifestyle" data-storefront="home"><div class="shop-shell store-hero-grid"><div class="store-hero-copy"><p class="shop-kicker">Endorphin by Famme</p><h1>Demping du<br><span>merker.</span></h1><p>Lette sko utviklet for løpeturen, arbeidsdagen og alt imellom. Finn modellen som passer steget ditt.</p><div class="store-actions"><a class="store-button" href="/collections/joggesko/">Finn dine sko</a><a class="store-button store-button--ghost" href="/storrelse/">Størrelsesguide</a></div><ul class="hero-trust"><li>Fri frakt over ${SHIPPING_THRESHOLD} kr</li><li>Gratis bytte i 30 dager</li><li>Vipps, kort og mobilbetaling</li></ul></div><a class="hero-photo hero-photo--lifestyle" href="/collections/joggesko/">${localPicture("/assets/lifestyle/rx2-city.webp", { alt: "Løper som knyter hvite Endorphin RX2 utendørs", sizes: "(max-width: 760px) calc(100vw - 28px), 500px", fetchPriority: "high" })}<span class="hero-photo-caption"><strong>Endorphin RX2</strong><small>Responsiv demping · hver eneste kilometer</small></span></a></div></section>
<section class="service-band" aria-label="Kjøpsfordeler"><ul class="shop-shell"><li><strong>Fri frakt</strong><span>På ordre over ${SHIPPING_THRESHOLD} kr</span></li><li><strong>Gratis bytte</strong><span>Innen 30 dager</span></li><li><strong>Etikettløs retur</strong><span>Enkelt og oversiktlig</span></li><li><strong>Trygg betaling</strong><span>Vipps, kort og mobilbetaling</span></li></ul></section><section class="reviews-section reviews-section--home"><div class="shop-shell"><div class="reviews-heading"><div><p class="shop-kicker">Prøvd i hverdagen</p><h2>Kunder som kjenner forskjellen.</h2></div><div class="reviews-intro"><p>Verifiserte omtaler hentet fra Endorphin-skoene på Famme.no.</p></div></div>${renderReviewGrid(["endorphin-rx2-shoes", "endorphin-rx1-shoes", "airstep-shoes"])}</div></section>`,
  }),
  "404.html": page({
    title: "Fant ikke siden | Endorphin",
    description: "Siden finnes ikke.",
    canonical: "/404.html",
    body: `<section class="simple-hero"><div class="shop-shell" style="min-height:60vh;display:flex;flex-direction:column;justify-content:center"><p class="shop-kicker">404</p><h1>Her var det tomt.</h1><p style="color:#5c5a56">Siden finnes ikke, eller har fått en ny adresse.</p><p><a class="store-button" href="/">Til forsiden</a></p></div></section>`,
  }),
  "om/index.html": page({
    title: "Om Endorphin | Joggesko til trening og hverdag",
    description: "Endorphin er en norsk merkevare som lager joggesko til trening, jobb og hverdag.",
    canonical: "/om/",
    body: `<header class="simple-hero"><div class="shop-shell"><nav class="shop-breadcrumbs"><a href="/">Hjem</a><span>/</span><span>Om oss</span></nav><p class="shop-kicker">Merkevaren</p><h1>Om oss.</h1></div></header><section class="shop-section shop-section--light"><div class="shop-shell legal-prose"><p>Endorphin er en norsk merkevare som produserer joggesko og andre typer sko til trening for herre og dame. Visjonen er stilfulle og komfortable sko du kan bruke både til trening og hverdags, til en fornuftig pris.</p><p>Skoene er laget for løping, jobb og hverdag, med god demping og en passform som passer både brede og smale føtter.</p></div></section>`,
  }),
  "kontakt/index.html": page({
    title: "Kontakt Endorphin",
    description: "Kontakt Endorphin på e-post. Svartid mandag til fredag 09–15.",
    canonical: "/kontakt/",
    body: `<header class="simple-hero"><div class="shop-shell"><nav class="shop-breadcrumbs"><a href="/">Hjem</a><span>/</span><span>Kontakt</span></nav><p class="shop-kicker">Kundeservice</p><h1>Kontakt oss.</h1></div></header><section class="shop-section shop-section--light"><div class="shop-shell contact-layout"><div><h2 class="subhead">Direkte kontakt</h2><ul class="contact-list"><li><small>E-post</small><a href="mailto:${contactEmail}">${contactEmail}</a></li><li><small>Svartid</small>Mandag–fredag 09.00–15.00</li></ul><p>Vi svarer mandag–fredag 09.00–15.00. Ta med ordrenummer hvis henvendelsen gjelder en bestilling.</p></div><form class="contact-form" data-contact-form novalidate><p class="shop-kicker">Skriv til oss</p><h2 class="subhead">Åpne en ferdig e-post</h2><p class="form-note">Skjemaet åpner e-postprogrammet ditt. Meldingen sendes først når du selv sender den derfra.</p><div class="field"><label for="name">Navn</label><input id="name" name="name" autocomplete="name" required><p class="field-error" data-error="name" aria-live="polite"></p></div><div class="field"><label for="email">E-post</label><input id="email" name="email" type="email" autocomplete="email" required><p class="field-error" data-error="email" aria-live="polite"></p></div><div class="field"><label for="message">Hva gjelder det?</label><textarea id="message" name="message" required placeholder="Ta med ordrenummer hvis det gjelder en bestilling."></textarea><p class="field-error" data-error="message" aria-live="polite"></p></div><button class="store-button" type="submit">Fortsett til e-post</button></form></div></section>`,
  }),
  "frakt/index.html": page({
    title: "Frakt og levering | Endorphin",
    description: `Fri frakt med HeltHjem over ${SHIPPING_THRESHOLD} kr. Standardlevering 1–4 dager.`,
    canonical: "/frakt/",
    body: `<header class="simple-hero"><div class="shop-shell"><nav class="shop-breadcrumbs"><a href="/">Hjem</a><span>/</span><span>Frakt</span></nav><p class="shop-kicker">Levering</p><h1>Frakt.</h1></div></header><section class="shop-section shop-section--light"><div class="shop-shell legal-prose"><p>Du får fri frakt med HeltHjem på bestillinger over ${SHIPPING_THRESHOLD} kr. For ordre under grensen vises fraktprisen i kassen.</p><p>Standardlevering er normalt 1–4 virkedager. Frakt beregnes og bekreftes før betaling.</p><p>Du betaler trygt med Vipps, Visa, Mastercard, Apple Pay eller Google Pay.</p></div></section>`,
  }),
  "retur/index.html": page({
    title: "Retur og bytte | Endorphin",
    description: "30 dagers retur, gratis bytte og etikettløs retur hos Endorphin.",
    canonical: "/retur/",
    body: `<header class="simple-hero"><div class="shop-shell"><nav class="shop-breadcrumbs"><a href="/">Hjem</a><span>/</span><span>Retur</span></nav><p class="shop-kicker">Enkel retur</p><h1>Retur og bytte.</h1></div></header><section class="shop-section shop-section--light"><div class="shop-shell legal-prose"><p>Du har 30 dagers returfrist fra du mottar varen. Bytte til en annen størrelse eller farge er gratis.</p><p>Kontakt oss på <a href="mailto:${contactEmail}">${contactEmail}</a> for etikettløs retur eller bytte. Ta med ordrenummer, så hjelper vi deg videre.</p></div></section>`,
  }),
  "storrelse/index.html": page({
    title: "Størrelsesguide | Endorphin",
    description: "Indre lengde og fotlengde for Endorphin-sko i størrelse 35–42.",
    canonical: "/storrelse/",
    body: `<header class="simple-hero"><div class="shop-shell"><nav class="shop-breadcrumbs"><a href="/">Hjem</a><span>/</span><span>Størrelse</span></nav><p class="shop-kicker">Sko</p><h1>Størrelsesguide.</h1></div></header><section class="shop-section shop-section--light"><div class="shop-shell legal-prose"><p>Endorphin-skoene er tilpasset det norske markedet og passer både brede og smale føtter. Gå opp en størrelse hvis du ligger mellom to størrelser.</p><table class="size-table"><thead><tr><th>Str</th><th>Innerlengde (cm)</th><th>Fotlengde (cm)</th></tr></thead><tbody><tr><td>35</td><td>22,8–23,4</td><td>21,3–21,9</td></tr><tr><td>36</td><td>22,9–23,6</td><td>21,9–22,6</td></tr><tr><td>37</td><td>23,6–24,3</td><td>22,6–23,3</td></tr><tr><td>38</td><td>24,3–24,9</td><td>23,3–23,9</td></tr><tr><td>39</td><td>24,9–25,6</td><td>23,9–24,6</td></tr><tr><td>40</td><td>25,6–26,3</td><td>24,6–25,3</td></tr><tr><td>41</td><td>26,3–26,9</td><td>25,3–25,9</td></tr><tr><td>42</td><td>26,9–27,6</td><td>25,9–26,6</td></tr></tbody></table></div></section>`,
  }),
  "faq/index.html": page({
    title: "Ofte stilte spørsmål | Endorphin",
    description: "Svar om frakt, retur, vask og betaling.",
    canonical: "/faq/",
    body: `<header class="simple-hero"><div class="shop-shell"><nav class="shop-breadcrumbs"><a href="/">Hjem</a><span>/</span><span>FAQ</span></nav><p class="shop-kicker">Spørsmål</p><h1>Ofte stilte.</h1></div></header><section class="shop-section shop-section--light"><div class="shop-shell faq faq--store"><details><summary>Hva koster frakt?</summary><p>Du får fri frakt med HeltHjem over ${SHIPPING_THRESHOLD} kr. For mindre ordre vises fraktprisen i kassen.</p></details><details><summary>Hvor lang er leveringstiden?</summary><p>Standardlevering er normalt 1–4 virkedager.</p></details><details><summary>Hvordan bytter jeg størrelse?</summary><p>Du har 30 dager på å returnere, og bytte til en annen størrelse eller farge er gratis. Kontakt kundeservice med ordrenummeret ditt.</p></details><details><summary>Kan jeg vaske skoene?</summary><p>Ja. Ta ut lisser og innleggssåle og vask på 30 grader med lav sentrifugering.</p></details><details><summary>Hvilke betalinger finnes?</summary><p>Vipps, Visa, Mastercard, Apple Pay og Google Pay. Det som vises i kassen avhenger av enheten din.</p></details></div></section>`,
  }),
  "personvern/index.html": page({
    title: "Personvern | Endorphin",
    description: "Hvordan Endorphin behandler opplysninger i handlekurv og kasse.",
    canonical: "/personvern/",
    body: `<header class="simple-hero"><div class="shop-shell"><nav class="shop-breadcrumbs"><a href="/">Hjem</a><span>/</span><span>Personvern</span></nav><p class="shop-kicker">Personvern</p><h1>Personvern.</h1></div></header><section class="shop-section shop-section--light"><div class="shop-shell legal-prose"><p>Handlekurven lagres i nettleseren din. Vi samler ikke inn skjemaopplysninger på denne siden; kontaktskjemaet åpner e-postprogrammet ditt, og meldingen sendes først når du selv sender den derfra.</p><p>Når du går til kassen, oppgir du navn, adresse og betaling for å fullføre kjøpet. Ta kontakt på <a href="mailto:${contactEmail}">${contactEmail}</a> hvis du har spørsmål om personvern.</p></div></section>`,
  }),
  "vilkar/index.html": page({
    title: "Kjøpsvilkår | Endorphin",
    description: "Kjøpsvilkår for Endorphin-butikken.",
    canonical: "/vilkar/",
    body: `<header class="simple-hero"><div class="shop-shell"><nav class="shop-breadcrumbs"><a href="/">Hjem</a><span>/</span><span>Vilkår</span></nav><p class="shop-kicker">Kjøp</p><h1>Kjøpsvilkår.</h1></div></header><section class="shop-section shop-section--light"><div class="shop-shell legal-prose"><p>Priser vises i norske kroner. Frakt beregnes i kassen, med fri frakt over ${SHIPPING_THRESHOLD} kr.</p><p>Du har 30 dagers returfrist og gratis bytte. Spørsmål om ordre og betaling sendes til <a href="mailto:${contactEmail}">${contactEmail}</a>.</p></div></section>`,
  }),
  "sok/index.html": page({
    title: "Søk i butikken | Endorphin",
    description: "Søk i joggesko og sokker hos Endorphin.",
    canonical: "/sok/",
    body: `<header class="simple-hero"><div class="shop-shell"><nav class="shop-breadcrumbs"><a href="/">Hjem</a><span>/</span><span>Søk</span></nav><p class="shop-kicker" data-catalog-count>Hele utvalget</p><h1>Hva leter du etter?</h1><form class="search-form" role="search" data-search-form><label class="sr-only" for="catalog-search">Søk i produkter</label><input id="catalog-search" type="search" placeholder="Søk etter RX1, sokker …" autocomplete="off" data-search-input><button type="submit">Søk</button></form></div></header><section class="shop-section shop-section--light"><div class="shop-shell"><p class="search-status" data-search-status>Skriv inn minst to tegn.</p><div class="product-grid" data-search-results></div></div></section>`,
  }),
  "handlekurv/index.html": page({
    title: "Handlekurv | Endorphin",
    description: "Se produktene i handlekurven din.",
    canonical: "/handlekurv/",
    extraHead: `<meta name="robots" content="noindex, nofollow">`,
    body: `<header class="simple-hero"><div class="shop-shell"><nav class="shop-breadcrumbs"><a href="/">Hjem</a><span>/</span><span>Handlekurv</span></nav><p class="shop-kicker">Din bestilling</p><h1>Handlekurv.</h1></div></header><section class="shop-section shop-section--light"><div class="shop-shell cart-layout" data-cart-root><div data-cart-items></div><aside class="cart-summary"><div><span>Delsum</span><strong data-cart-subtotal>0 kr</strong></div><p>Frakt beregnes i kassen. Fri frakt over ${SHIPPING_THRESHOLD} kr.</p><p data-checkout-error hidden></p><button class="store-button store-button--buy" type="button" data-checkout-start disabled>Gå til kassen</button><a href="/collections/all/">Fortsett å handle</a></aside></div></section>`,
  }),
  "bestilling/fullfort/index.html": page({
    title: "Takk for bestillingen | Endorphin",
    description: "Bestillingen er betalt. En ordrebekreftelse er på vei på e-post.",
    canonical: "/bestilling/fullfort/",
    extraHead: `<meta name="robots" content="noindex, nofollow">`,
    bodyAttr: ` data-order-complete`,
    body: `<header class="simple-hero"><div class="shop-shell"><nav class="shop-breadcrumbs"><a href="/">Hjem</a><span>/</span><span>Takk</span></nav><p class="shop-kicker">Ordren er betalt</p><h1>Takk.</h1></div></header><section class="shop-section shop-section--light"><div class="shop-shell order-complete"><p class="shop-kicker">Hva skjer nå</p><h2 class="headline">Bekreftelsen er på vei.</h2><p class="lede lede-dark">Betalingen er gjennomført. En ordrebekreftelse sendes til e-postadressen du oppga i kassen.</p><p class="lede lede-dark">Handlekurven er tømt. Neste vare du legger i blir en ny bestilling.</p><div class="store-actions"><a class="store-button" href="/collections/all/">Fortsett å handle</a><a class="store-button store-button--ghost" href="/kontakt/">Kontakt oss</a></div></div></section>`,
  }),
};

const root = path.resolve(import.meta.dirname, "..", "public");
for (const [file, html] of Object.entries(pages)) {
  const target = path.join(root, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html);
}
await writeFile(path.join(root, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Wrote ${Object.keys(pages).length} static pages.`);
