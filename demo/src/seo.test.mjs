import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.mjs';
import { educationalPaths, pageMetadata, educationalSitemap, applyPageMetadata } from './seo.mjs';
import { uxTopics, uxGroups } from '../content/ux.mjs';
import { decisionTotals, fitsNeed } from '../public/assets/product-lab-model.js';
const env={ASSETS:{}},ctx={};
test('every concept belongs to exactly one task group and all group links resolve',()=>{
  const ids=uxGroups.flatMap(g=>g.topics);assert.equal(ids.length,uxTopics.length);assert.equal(new Set(ids).size,ids.length);
  for(const t of uxTopics)assert.ok(ids.includes(t.slug),t.slug);
});
test('every educational page has unique bilingual titles, descriptions and clean language canonicals',()=>{
  for(const locale of ['nb','en']){const titles=[],descriptions=[];for(const path of educationalPaths){
    const m=pageMetadata(new URL('https://nettbutikk.reai.no'+path+'?lang='+locale+'&utm_source=test'),{locale});
    assert.equal(m.indexable,true,path);assert.ok(m.description.length>30,path);assert.ok(m.title.length>10,path);
    assert.equal(m.canonical,'https://nettbutikk.reai.no'+(path==='/'?'/':path+'/')+(locale==='en'?'?lang=en':''));
    titles.push(m.title);descriptions.push(m.description);
  }assert.equal(new Set(titles).size,titles.length);assert.equal(new Set(descriptions).size,descriptions.length);}
});
test('fictional, interactive, API, cart and filtered product routes stay noindex',()=>{
  for(const path of ['/designs/famme/products/softy-straight-leg/','/designs/starter/','/shop/?f.type=gift','/ux/lab/product/','/ux/worksheet/?topic=filters','/ux/test-plan/','/checkout/return/','/api/','/cart/','/reai/checkout/start'])assert.equal(pageMetadata(new URL('https://nettbutikk.reai.no'+path),{locale:'nb'}).robots,'noindex, follow',path);
  assert.equal(pageMetadata(new URL('http://127.0.0.1:8791/ux/'),{locale:'en'}).indexable,false);
  assert.equal(pageMetadata(new URL('https://nettbutikk.reai.no/ux/'),{preview:true}).indexable,false);
});
test('sitemap contains only curated canonical learning URLs and reciprocal locales',()=>{
  const xml=educationalSitemap();assert.equal((xml.match(/<loc>/g)||[]).length,educationalPaths.length*2);
  assert.match(xml,/<xhtml:link rel="alternate" hreflang="nb"/);assert.match(xml,/<xhtml:link rel="alternate" hreflang="en"/);
  for (const [,loc] of xml.matchAll(/<loc>([^<]*)<\/loc>/g)) assert.ok(educationalPaths.includes(new URL(loc).pathname.replace(/\/$/, "") || "/"));
});
test('public educational responses agree in head and headers, deterministically ignoring old language cookies',async()=>{
  for(const lang of ['nb','en']){const r=await worker.fetch(new Request('https://nettbutikk.reai.no/ux/group/choose-products/?lang='+lang,{headers:{Cookie:'reai-demo-lang=en'}}),env,ctx),html=await r.text();
    assert.equal(r.headers.get('X-Robots-Tag'),'index, follow');assert.match(html,/<meta name="robots" content="index, follow">/);
    assert.equal((html.match(/<title>/g)||[]).length,1);assert.equal((html.match(/name="description"/g)||[]).length,1);assert.match(html,/<link rel="canonical"/);
    for(const locale of ['nb','en','x-default'])assert.ok(html.includes('hreflang="'+locale+'"'));
    assert.match(html,new RegExp('<html lang="'+lang+'"'));assert.doesNotMatch(html,/AggregateRating|"@type":"Product"/);
  }
  const r=await worker.fetch(new Request('https://nettbutikk.reai.no/ux/',{headers:{Cookie:'reai-demo-lang=en'}}),env,ctx);assert.match(await r.text(),/<html lang="nb"/);
});
test('public labs and unknown routes remain excluded, HEAD metadata matches GET',async()=>{
  const lab=await worker.fetch(new Request('https://nettbutikk.reai.no/ux/lab/product/'),env,ctx);assert.equal(lab.headers.get('X-Robots-Tag'),'noindex, follow');assert.match(await lab.text(),/<meta name="robots" content="noindex, follow">/);
  const head=await worker.fetch(new Request('https://nettbutikk.reai.no/ux/seo/?lang=en',{method:'HEAD'}),env,ctx);assert.equal(head.headers.get('X-Robots-Tag'),'index, follow');assert.equal(await head.text(),'');
  const missing=await worker.fetch(new Request('https://nettbutikk.reai.no/ux/missing/'),env,ctx);assert.notEqual(missing.status,200);assert.equal(missing.headers.get('X-Robots-Tag'),'noindex, follow');
  const robots=await worker.fetch(new Request('https://nettbutikk.reai.no/robots.txt'),env,ctx);assert.match(await robots.text(),/Allow: \/\nSitemap: https:\/\/nettbutikk.reai.no\/sitemap.xml/);
});
test('server locale links preserve filters, anchors and starter locale, and do not rewrite external sources',()=>{
  const html=applyPageMetadata('<head><title>Example</title></head><a href="/shop/?sort=asc&amp;f.type=gift#product-one">A</a><a href="/designs/starter/">B</a><a href="https://baymard.com/research">C</a>',new URL('https://nettbutikk.reai.no/ux/'),{locale:'en'});
  assert.match(html,/href="\/shop\/\?sort=asc&amp;f.type=gift&amp;lang=en#product-one"/);assert.match(html,/href="\/designs\/starter\/\?locale=en"/);assert.match(html,/href="https:\/\/baymard.com\/research"/);
});
test('product lab discounts only mugs and never invalid codes or accessories',()=>{
  const lines=[{id:'home',quantity:2},{id:'strap',quantity:1}];
  assert.deepEqual(decisionTotals(lines,' lab10 '),{subtotal:280,eligible:240,discount:24,total:256,codeState:'valid'});
  assert.equal(decisionTotals(lines,'wrong').total,280);assert.equal(decisionTotals([{id:'strap',quantity:2}],'LAB10').discount,0);
  assert.equal(decisionTotals([{id:'home',quantity:1000}],'').subtotal,2400);
  assert.equal(decisionTotals([{id:'unknown',quantity:2},{id:'home',quantity:-1},{id:'home',quantity:1.5}]).subtotal,0);
});
test('use-case suitability is honest and isolated',()=>{
  assert.equal(fitsNeed('home','bag'),false);assert.equal(fitsNeed('trail','bag'),true);assert.equal(fitsNeed('home','desk'),true);assert.equal(fitsNeed('unknown','bag'),false);
});

test('language toggles preserve worksheet context and distinct starter language choices',()=>{
  const html=applyPageMetadata('<head><title>Example</title></head><a class="language" href="?lang=en">EN</a><a href="/designs/starter/?locale=en" data-language-link>EN</a>',new URL('https://nettbutikk.reai.no/ux/worksheet/?topic=returns&lang=nb'),{locale:'nb'});
  assert.match(html,/href="\/ux\/worksheet\/\?topic=returns&amp;lang=en"/);assert.match(html,/href="\/designs\/starter\/\?locale=en" data-language-link/);
});
