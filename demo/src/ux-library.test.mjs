import test from 'node:test';
import assert from 'node:assert/strict';
import { libraryTopics } from '../content/ux-library.mjs';
import { uxTopics } from '../content/ux.mjs';
import { selectArticles } from './ux-directory.mjs';
import { pageMetadata } from './seo.mjs';
import { discoveryCorrection, searchDiscovery } from '../public/assets/discovery-model.js';
import { editFashionVariant, fashionStock } from '../public/assets/fashion-cart-model.js';
import worker from './worker.mjs';

test('54 additional decisions have bilingual guidance, boundaries, tasks and valid related articles', () => {
  assert.equal(libraryTopics.length, 54);
  assert.equal(new Set(uxTopics.map((t) => t.slug)).size, uxTopics.length);
  for (const topic of libraryTopics) {
    for (const key of ['title','principle','challenge','when','data','boundary']) {
      assert.equal(topic[key].length, 2, topic.slug + ':' + key);
      for (const value of topic[key]) assert.ok(value.length > 20, topic.slug + ':' + key);
    }
    assert.equal(new URL(topic.source[1]).protocol, 'https:');
    assert.ok(topic.cases.length >= 3, topic.slug);
    for (const pair of topic.cases) assert.ok(pair.length === 2 && pair.every((value) => value.length > 20), topic.slug);
    for (const id of topic.related) assert.ok(uxTopics.some((t) => t.slug === id), topic.slug + ' → ' + id);
  }
});
test('library queries combine tokens, groups, designs and editions without modifying content', () => {
  const params = (s) => new URLSearchParams(s);
  assert.equal(selectArticles().matches.length, 87);
  assert.equal(selectArticles(params('edition=library')).matches.length, 54);
  assert.ok(selectArticles(params('q=sok&group=find-products')).matches.length > 0);
  assert.ok(selectArticles(params('q=variants+cart')).matches.some((t) => t.slug === 'cart-edit-variants'));
  const fashion = selectArticles(params('design=famme&edition=library')).matches;
  assert.ok(fashion.some((t) => t.slug === 'image-zoom-mobile'));
  assert.ok(fashion.every((t) => t.examples.some(([, href]) => href.startsWith('/designs/famme/'))));
  assert.equal(selectArticles(params('q=qqq-no-article')).matches.length, 0);
  assert.equal(selectArticles(params('group=unknown&design=__proto__&edition=wrong')).matches.length, 87);
});
test('filtered directory is useful without JavaScript, escapes input and excludes filter permutations from indexing', async () => {
  const url = 'https://nettbutikk.reai.no/ux/library/?lang=en&edition=library&group=cart-checkout';
  const response = await worker.fetch(new Request(url), { ASSETS:{} }, {}), html = await response.text();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, follow');
  assert.match(html, /href="\/ux\/cart-edit-variants\/\?lang=en"/);
  assert.match(html, /method="get"/);
  assert.match(html, /value="cart-checkout" selected/);
  assert.equal(pageMetadata(new URL('https://nettbutikk.reai.no/ux/library/?lang=en'), {locale:'en'}).indexable, true);
  assert.equal(pageMetadata(new URL(url), {locale:'en'}).canonical, 'https://nettbutikk.reai.no/ux/library/?lang=en');
  const empty = await worker.fetch(new Request('https://nettbutikk.reai.no/ux/library/?q=%3Cscript%3E'), {ASSETS:{}}, {});
  const body = await empty.text(); assert.match(body, /&lt;script&gt;/); assert.doesNotMatch(body, /value="<script>/);
  assert.match(body, /Ingen artikler/);
});
test('known typos offer explicit corrections; exact identifiers and scope boundaries remain intact', () => {
  assert.equal(discoveryCorrection(' Termokop '), 'termokopp');
  assert.equal(discoveryCorrection('NORD-002'), null);
  assert.equal(searchDiscovery('insulatd mug').products.length, 0);
  assert.equal(searchDiscovery(discoveryCorrection('termokop')).products.length, 2);
  assert.equal(searchDiscovery('returns', 'products').help.length, 0);
  assert.equal(searchDiscovery('returns', 'all').help.length, 1);
  assert.equal(searchDiscovery('NORD-02', 'help').products.length, 0);
  assert.equal(searchDiscovery('green 500').products.length, 0);
});
const product = {handle:'softy', colors:[{key:'black'},{key:'brown'}], sizes:['S','M','L'], soldOut:{black:['L']}, backorder:{brown:['L']}};
test('editing variants preserves quantities, merges matching lines and leaves original state unchanged', () => {
  const cart = [{handle:'softy',color:'black',size:'S',quantity:3},{handle:'softy',color:'brown',size:'M',quantity:2}];
  const original = structuredClone(cart);
  assert.deepEqual(editFashionVariant(cart,0,product,'brown','M'), [{handle:'softy',color:'brown',size:'M',quantity:5}]);
  assert.equal(editFashionVariant(cart,0,product,'brown','S')[0].quantity,3);
  assert.deepEqual(cart, original);
  assert.equal(editFashionVariant(cart,0,product,'black','L'),null);
  assert.equal(editFashionVariant(cart,0,product,'unknown','S'),null);
  assert.equal(editFashionVariant(cart,-1,product,'black','S'),null);
  assert.equal(fashionStock(product,'brown','L'),'BACKORDER');
  assert.equal(editFashionVariant(cart,0,product,'brown','L')[0].quantity,3);
  cart[1].quantity=20; assert.equal(editFashionVariant(cart,0,product,'brown','M'),null);
});
