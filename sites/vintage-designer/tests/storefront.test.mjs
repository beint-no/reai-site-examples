import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.js';
import * as render from '../storefront.mjs';

const product = { id:'11111111-1111-4111-8111-111111111111', handle:'synthetic-bag', title:'Testveske <script>', seoTitle:'Testveske', brand:'Testmerke', description:'<p>Tilstand: God</p><p>Mål: 20 × 15 cm</p><script>alert(1)</script>', variants:[{id:'22222222-2222-4222-8222-222222222222',price:100,vatRate:25,sku:'TEST',options:[]}],images:[{url:'https://app.reai.no/test.webp',width:800,height:1000,alt:null,renditions:[{url:'https://app.reai.no/test-small.webp',width:400,height:500}]}]};
const store = {products:[product],collections:[],locale:'nb-NO',currency:'NOK',marketHandle:'norway',catalogVersion:1,marketId:'33333333-3333-4333-8333-333333333333'};
const env = {ASSETS:{fetch:async()=>new Response(render.renderNotFoundPage(null,{},'/missing/'),{status:404,headers:{'content-type':'text/html'}})}};
const ctx = {waitUntil() {}};

test('delivery prices already include VAT and must not be taxed twice',()=>{
 assert.equal(render.grossPrice(product.variants[0]),100);
});

test('checkout is denied without any upstream request, even with an enabling variable', async()=>{
 const original = globalThis.fetch; let calls=0;
 globalThis.fetch = async()=>{calls++;throw new Error('must not call upstream');};
 try { for(const path of ['/reai/checkout/start','/reai/checkout/start/']) {
 const response = await worker.fetch(new Request(`https://preview.test${path}`,{method:'POST',body:'{}'}),{...env,CHECKOUT_ENABLED:'true',REAI_SITE_TOKEN:'synthetic'},ctx);
 assert.equal(response.status,403); assert.equal((await response.json()).code,'CHECKOUT_DISABLED'); assert.equal(response.headers.get('X-Robots-Tag'),'noindex, nofollow');
 } assert.equal(calls,0); } finally {globalThis.fetch=original;}
});
test('static pages and unknown routes carry indexing and security protection',async()=>{
 for(const path of ['/sok/','/handlekurv/','/pages/contact/','/missing/']) {
 const response=await worker.fetch(new Request(`https://preview.test${path}`),env,ctx);
 assert.equal(response.status,path==='/missing/'?404:200);
 assert.match(response.headers.get('Content-Security-Policy'),/frame-ancestors 'none'/);
 assert.equal(response.headers.get('X-Robots-Tag'),'noindex, nofollow');
 assert.match(await response.text(),/noindex, nofollow/);
 }
});
test('HEAD has no body; canonical static redirects retain search',async()=>{
 const head=await worker.fetch(new Request('https://preview.test/sok/',{method:'HEAD'}),env,ctx); assert.equal(await head.text(),'');
 const redirect=await worker.fetch(new Request('https://preview.test/sok?q=test'),env,ctx);assert.equal(redirect.status,308);assert.equal(redirect.headers.get('location'),'https://preview.test/sok/?q=test');
});
test('missing API configuration is explicit, not a sample catalog',async()=>{
 const response=await worker.fetch(new Request('https://preview.test/reai/catalog'),env,ctx);assert.equal(response.status,503);assert.doesNotMatch(await response.text(),/synthetic-bag/);
});
test('product content is escaped and images retain source metadata and useful fallback',()=>{
 const html=render.renderProductPage(store,product,{});
 assert.match(html,/Testveske &lt;script&gt;/);assert.doesNotMatch(html,/<script>alert/);
 assert.match(html,/width="800"/);assert.match(html,/height="1000"/);assert.match(html,/400w/);assert.match(html,/Tilstand/);assert.match(html,/20 × 15 cm/);
 assert.match(render.imageMarkup({},'Test'),/Bilde kommer/);
 assert.doesNotMatch(render.imageMarkup({url:'javascript:alert(1)'},'Test'),/javascript:/);
});
test('routes and empty collections are safe',()=>{
 assert.equal(render.matchRoute('/products/test/').valid,true);assert.equal(render.matchRoute('/products/%3Cscript%3E/').valid,false);
 assert.equal(render.productByHandle(store,'missing'),null);
 assert.match(render.renderCollectionPage({...store,products:[]},'all'),/0 vesker/);
 assert.match(render.renderSitemap(store),/synthetic-bag/);
});
