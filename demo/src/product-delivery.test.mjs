import test from 'node:test';
import assert from 'node:assert/strict';
import { productDelivery } from '../public/assets/product-delivery-model.js';
import { workedExamples } from '../content/ux-worked-examples.mjs';
import { uxTopics } from '../content/ux.mjs';
import { selectArticles } from './ux-directory.mjs';
import worker from './worker.mjs';

test('delivery eligibility uses discounted merchandise, including optional accessories', () => {
  const lines = [{id:'trail',quantity:1},{id:'coaster',quantity:2}];
  const original = structuredClone(lines);
  const before = productDelivery(lines);
  assert.equal(before.merchandise,300); assert.equal(before.shipping,0); assert.equal(before.total,300);
  const discounted = productDelivery(lines,'LAB10');
  assert.equal(discounted.discount,24); assert.equal(discounted.merchandise,276);
  assert.equal(discounted.remaining,24); assert.equal(discounted.shipping,49); assert.equal(discounted.total,325);
  assert.equal(productDelivery(lines,'WRONG').total,300);
  assert.equal(productDelivery([{id:'home',quantity:1}]).total,169);
  assert.deepEqual(lines,original);
});
test('a missing delivery service remains unknown, even above the free-shipping threshold', () => {
  for (const destination of ['uncovered','unexpected']) {
    const quote=productDelivery([{id:'trail',quantity:4}],'',destination,'pickup');
    assert.equal(quote.covered,false); assert.equal(quote.pickupAvailable,false);
    assert.equal(quote.qualifies,false); assert.equal(quote.shipping,null);
    assert.equal(quote.total,null); assert.equal(quote.remaining,null);
  }
});
test('pickup changes with coverage; empty and invalid baskets do not acquire shipping charges', () => {
  const lines=[{id:'home',quantity:1}];
  assert.equal(productDelivery(lines,'','oslo','pickup').total,120);
  const elsewhere=productDelivery(lines,'','mainland','pickup');
  assert.equal(elsewhere.selectedMethod,'shipping');assert.equal(elsewhere.total,169);
  assert.equal(productDelivery([]).shipping,0);
  assert.equal(productDelivery([{id:'unknown',quantity:3}]).hasItems,false);
});
test('worked articles render bilingual tasks and direct example links with language and hash intact', async () => {
  for (const [slug,worked] of Object.entries(workedExamples)) {
    assert.ok(uxTopics.some(t=>t.slug===slug));
    for (const lang of ['nb','en']) {
      const response=await worker.fetch(new Request('https://nettbutikk.reai.no/ux/'+slug+'/?lang='+lang),{ASSETS:{}},{});
      const html=await response.text();assert.equal(response.status,200);
      assert.match(html,/id="worked-example"/);
      assert.ok(html.includes(worked.scenario[lang==='en'?1:0]));
      const url=new URL(worked.example[0],'https://nettbutikk.reai.no');url.searchParams.set('lang',lang);
      assert.ok(html.includes((url.pathname+url.search+url.hash).replace(/&/g,'&amp;')),slug);
    }
  }
});
test('Lookbook references only its demonstrated cart deep dives', () => {
  const articles=selectArticles(new URLSearchParams('design=lookbook&edition=library')).matches;
  assert.deepEqual(articles.map(t=>t.slug),['cart-edit-variants','cart-stock-recheck']);
  assert.ok(articles.every(t=>t.examples.some(([,url])=>url==='/designs/lookbook/#outfit')));
});
