import { uxTopics, uxGroups } from '../content/ux.mjs';
import { designs } from './showcase.mjs';
import { lessons } from '../content/education.mjs';
export const publicOrigin = 'https://nettbutikk.reai.no';
const h = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pick = (pair,locale) => pair[String(locale).startsWith('en')?1:0];
const pages = new Map([
  ['/', {title:['Nettbutikk, kassasystem og regnskap i ReAI','Online store, POS and accounting with ReAI'],description:['Lær hvordan ReAI kobler produkter, checkout, kassasystem og regnskap. Prøv ti butikkdesign og praktiske UX-eksempler.','Learn how ReAI connects products, checkout, POS and accounting. Explore ten storefront designs and practical UX examples.']}],
  ['/designs',{title:['10 butikkdesign: kolleksjoner, varianter og handlekurv','10 storefront designs: collections, variants and carts'],description:['Velg butikkdesign etter kjøpsoppgave: få produkter, mote, kolleksjoner eller B2B. Prøv filtre, fargevalg, størrelser og kurv i skuff.','Choose by shopping task: small catalogs, fashion, collections or B2B. Try filters, swatches, sizing and cart drawers.']}],
  ['/features',{title:['ReAI for nettbutikk: katalog, checkout og regnskap','ReAI commerce: catalog, checkout and accounting'],description:['Forstå Site API, produktdata, nyhetsbrev, Adyen, rabatter, levering, B2B og EHF. Se hvilke deler ReAI håndterer og hva nettstedet styrer.','Understand Site API, product data, newsletters, Adyen, discounts, delivery, B2B and EHF. Learn what ReAI handles and what the site controls.']}],
  ['/about',{title:['Om ReAI sin test-nettbutikk','About the ReAI test store'],description:['En test-nettbutikk og læringsressurs for ReAI. Forstå ekte betalinger, Better Integration, manuell gavekortinnløsning og fiktive design-eksempler.','A ReAI test store and learning resource. Understand real payments, Better Integration, manual gift-card redemption and fictional design examples.']}],
  ['/ux',{title:['Nettbutikk UX, SEO og CRO: konsepter og eksempler','E-commerce UX, SEO and CRO: concepts and examples'],description:['Finn riktig mønster for søk, produktvalg, checkout og oppfølging. Kildebaserte forklaringer, konkrete testoppgaver og originale ReAI-eksempler.','Find patterns for search, product choice, checkout and follow-up. Source-linked explanations, concrete test tasks and original ReAI examples.']}],
  ...lessons.map(l=>['/learn/'+l.slug,{title:l.title.map(v=>v.replace(/\.$/,'')),description:l.summary}]),
  ...uxTopics.map(t=>['/ux/'+t.slug,{title:t.title,description:t.principle}]),
  ...uxGroups.map(g=>['/ux/group/'+g.slug,{title:g.title,description:g.summary}]),
]);
const designPages = new Map(designs.map(d=>['/designs/'+d.slug,{title:d.title.map(title=>d.name+' · '+title),description:d.text}]));
const labTitles = {
  '/ux/lab/product':['Produktlab: informasjon, tilbehør og rabatt','Product lab: information, accessories and discounts'],
  '/ux/lab/discovery':['Søkelab: SKU, varianter og hjelpesøk','Search lab: SKUs, variants and help'],
  '/ux/lab/compare':['Sammenligningslab: pakkepris og spesifikasjoner','Comparison lab: pack prices and specifications'],
  '/ux/lab/checkout':['Checkout-lab: levering, feil og betalingsstatus','Checkout lab: delivery, errors and payment status'],
  '/ux/worksheet':['CRO-arbeidsark: lag en målbar hypotese','CRO worksheet: build a measurable hypothesis'],
  '/ux/test-plan':['Testplan for nettbutikkens kjøpsoppgaver','E-commerce shopping task test plan'],
};
export const educationalPaths = [...pages.keys()];
export const normalizedPath = pathname => pathname.replace(/\/+$/,'') || '/';
const pageUrl = (path,locale) => publicOrigin+(path==='/'?'/':path+'/')+(String(locale).startsWith('en')?'?lang=en':'');
export function pageMetadata(url,context={}) {
  const path=normalizedPath(url.pathname), page=pages.get(path)||designPages.get(path), locale=context.locale||'nb-NO';
  // Preview hosts and fictional/transactional routes are never search landing pages.
  const indexable=pages.has(path) && !context.preview && url.origin===publicOrigin;
  return {path,indexable,robots:indexable?'index, follow':'noindex, follow',canonical:pageUrl(path,locale),
    title:page?pick(page.title,locale):labTitles[path]?pick(labTitles[path],locale):null,
    description:page?pick(page.description,locale):pick(['Eksempel i ReAI sin test-nettbutikk. Bruk læringssenteret for forklaringer, testoppgaver og avgrensninger.','ReAI test-store example. Use the learning hub for explanations, test tasks and boundaries.'],locale)};
}
export function applyPageMetadata(html,url,context={}) {
  const meta=pageMetadata(url,context), brand='ReAI';
  const title=meta.title?`${meta.title} | ${brand}`:null;
  // Render locale into navigational links on the server; crawlers and no-JS users
  // get the same language as the page. A language toggle stays independently selectable.
  html=html.replace(/<a\b[^>]*>/g,tag=>{
    const href=tag.match(/\bhref="([^"<>]*)"/)?.[1];
    if(!href)return tag;
    const switcher=/\bclass="[^"]*\blanguage\b|\bdata-language-link/.test(tag);
    if(switcher && href.startsWith('?')) {
      const target=new URL(url), choice=new URL(href.replace(/&amp;/g,'&'),url);
      for(const [key,value] of choice.searchParams)target.searchParams.set(key,value);
      return tag.replace(href,h(target.pathname+target.search+target.hash));
    }
    // Explicit locale choices in starter language menus must not be overwritten.
    if(switcher || !href.startsWith('/') || href.startsWith('//'))return tag;
    const target=new URL(href.replace(/&amp;/g,'&'),publicOrigin);
    if(target.pathname.startsWith('/assets/')||target.pathname.startsWith('/reai/'))return tag;
    target.searchParams.set(target.pathname.startsWith('/designs/starter')?'locale':'lang',String(context.locale).startsWith('en')?'en':'nb');
    return tag.replace(href,h(target.pathname+target.search+target.hash));
  });
  html=html.replace(/<meta\b[^>]*\bname="(?:description|robots)"[^>]*>/gi,'');
  if(title)html=html.replace(/<title>[^<]*<\/title>/i,`<title>${h(title)}</title>`);
  const actualTitle=title||(html.match(/<title>([^<]*)<\/title>/i)?.[1]||'ReAI test store');
  const alternates=meta.indexable?['nb','en','x-default'].map(lang=>`<link rel="alternate" hreflang="${lang}" href="${h(pageUrl(meta.path,lang==='en'?'en':'nb'))}">`).join(''):'';
  const tags=`<meta name="description" content="${h(meta.description)}"><meta name="robots" content="${meta.robots}"><link rel="canonical" href="${h(meta.canonical)}">${alternates}<meta property="og:type" content="website"><meta property="og:site_name" content="ReAI"><meta property="og:title" content="${title?h(title):actualTitle}"><meta property="og:description" content="${h(meta.description)}"><meta property="og:url" content="${h(meta.canonical)}"><meta property="og:locale" content="${String(context.locale).startsWith('en')?'en_GB':'nb_NO'}">`;
  return html.replace('</head>',tags+'</head>');
}
export function educationalSitemap() {
  const entries=educationalPaths.flatMap(path=>['nb','en'].map(locale=>`<url><loc>${h(pageUrl(path,locale))}</loc>${['nb','en','x-default'].map(lang=>`<xhtml:link rel="alternate" hreflang="${lang}" href="${h(pageUrl(path,lang==='en'?'en':'nb'))}"/>`).join('')}</url>`));
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.join('')}</urlset>`;
}
