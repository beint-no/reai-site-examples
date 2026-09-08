import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.mjs';
import {presentation} from './presentation.mjs';
import {renderHomePage,renderStaticPage} from '../../sites/vintage-designer/storefront.mjs';
test('demo removes visible development notices but retains indexing protection',()=>{
 for(const html of [renderHomePage({products:[]}),renderStaticPage('/handlekurv/'),renderStaticPage('/pages/contact/'),renderStaticPage('/pages/var-autentisering/')]){
  const result=presentation(html,'https://test.pages.dev');
  assert.doesNotMatch(result.replace(/<[^>]*>/g,''),/forhåndsvisning|under utvikling/i);
  assert.match(result,/noindex, nofollow/);
 }
 assert.match(presentation(renderStaticPage('/handlekurv/'),'https://test.pages.dev'),/data-unavailable-checkout>Gå til kassen/);
});
test('checkout always refuses without accessing assets or any external service',async()=>{
 for(const method of ['GET','POST','PUT','HEAD']){const r=await worker.fetch(new Request('https://test.pages.dev/reai/checkout/start/',{method}),{ASSETS:{fetch(){throw Error('Must not fetch');}}});assert.equal(r.status,403);assert.equal(r.headers.get('x-robots-tag'),'noindex, nofollow');}
});
test('only allowlisted read endpoints expose snapshot assets',async()=>{
 const calls=[];const env={ASSETS:{fetch:async r=>{calls.push(new URL(r.url).pathname);return Response.json({products:[]});}}};
 assert.equal((await worker.fetch(new Request('https://test.pages.dev/reai/catalog'),env)).status,200);
 assert.deepEqual(calls,['/data/catalog.json']);
 assert.equal((await worker.fetch(new Request('https://test.pages.dev/data/catalog.json'),env)).status,404);
 assert.equal((await worker.fetch(new Request('https://test.pages.dev/reai/catalog',{method:'POST'}),env)).status,405);
 assert.equal(calls.length,1);
});
