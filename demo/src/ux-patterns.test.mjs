import test from 'node:test';
import assert from 'node:assert/strict';
import { searchDiscovery, discoverySuggestions, packs, unitPrice, machines, comparisonRows } from '../public/assets/discovery-model.js';
import { catalogReturn } from '../public/assets/catalog-context.js';
import { deliveryWindow } from '../public/assets/checkout-lab-model.js';
import { measurement } from '../public/assets/fashion-guide.js';
import { uxTopics, learningPaths, acceptanceCount } from '../content/ux.mjs';
import { matchingVariants } from '../public/assets/catalog-filter-data.js';
import { renderCatalogFilters } from './catalog-filters.mjs';
for(const [query,ids] of [
  ['NORD-02',['nord-trail']], ['termokopp',['nord-home','nord-trail']],
  ['LEKKASJESIKKER',['nord-home','nord-trail']], ['BLÅ 500',['nord-trail','daily-bottle']],
  ['green 500',[]], ['ukjentvare',[]], ['  Nord Tur blue  ',['nord-trail']],
]) test('discovery query: '+query,()=>assert.deepEqual(searchDiscovery(query).products.map(p=>p.id),ids));
test('help queries return help without irrelevant products',()=>{
  const result=searchDiscovery('return policy');assert.equal(result.products.length,0);assert.equal(result.help.length,1);
  assert.match(result.help[0].href,/^\/ux\//);
});
test('an exact SKU matches its variant rather than another product option',()=>assert.deepEqual(searchDiscovery('NORD-02').products[0].variants.map(v=>v.sku),['NORD-02']));
test('suggestions are bounded, unique, editable strings and locale-aware',()=>{
  assert.deepEqual(discoverySuggestions('nord'),['Nord Hjem','Nord Tur']);
  assert.deepEqual(discoverySuggestions(''),[]);assert.deepEqual(discoverySuggestions('ret','nb'),['retur']);
  assert.deepEqual(discoverySuggestions('ret','en'),['returns']);assert.ok(discoverySuggestions('r').length<=6);
});
test('unit prices preserve actual totals and do not invent unknown pack sizes',()=>{
  assert.equal(unitPrice(120,4),30);assert.equal(unitPrice(300,12),25);
  for(const count of [0,-1,null,undefined,Infinity])assert.equal(unitPrice(120,count),null);
  for(const price of [NaN,Infinity,-1])assert.equal(unitPrice(price,4),null);
  const order=[...packs].sort((a,b)=>unitPrice(a.price,a.count)-unitPrice(b.price,b.count));assert.equal(order[0].id,'pack-12');
});
test('comparison keeps unknown values and removes only genuinely equal specs',()=>{
  const rows=comparisonRows(machines,true).map(r=>r.key);assert.ok(!rows.includes('voltage'));assert.ok(rows.includes('weight'));
  assert.equal(machines[2].weight,null);assert.ok(comparisonRows(machines,false).some(r=>r.key==='voltage'));
});
for(const invalid of ['https://evil.invalid/shop/','//evil.invalid/shop/','/\\evil.invalid/shop/','/shop/\n','/checkout/','/shop/%2f%2fevil','/designs/famme/collections/unknown/'])
  test('reject unsafe or unrelated return route: '+JSON.stringify(invalid),()=>assert.equal(catalogReturn(invalid),null));
test('catalog return preserves filters, language, sort and product anchor, dropping unrelated parameters',()=>{
  const path='/designs/famme/collections/all/?lang=en&sort=desc&f.option%3ASize=M&return=bad#product-softy-straight-leg';
  assert.equal(catalogReturn(path),'/designs/famme/collections/all/?lang=en&sort=desc&f.option%3ASize=M#product-softy-straight-leg');
  assert.equal(catalogReturn('/collections/all?locale=en'),'/collections/all?locale=en');
  assert.equal(catalogReturn('/designs/starter/collections/all?locale=en'),'/designs/starter/collections/all?locale=en');
  assert.equal(catalogReturn('/shop/#bad'),'/shop/');
});
test('simulated delivery skips weekends without claiming carrier or holiday support',()=>{
  assert.deepEqual(deliveryWindow('2026-10-09','shipping'),{from:'2026-10-13',to:'2026-10-15'});
  assert.deepEqual(deliveryWindow('2026-10-09','pickup'),{from:'2026-10-12',to:'2026-10-12'});
  assert.deepEqual(deliveryWindow('2026-12-31','shipping'),{from:'2027-01-04',to:'2027-01-06'});
  assert.equal(deliveryWindow('2026-02-30','pickup'),null);assert.equal(deliveryWindow('invalid','pickup'),null);assert.equal(deliveryWindow('2026-10-09','bad'),null);
});
test('sizing measurements convert units instead of just relabeling',()=>{
  assert.equal(measurement(72,'inch','en'),'28.3');assert.equal(measurement(72,'inch','nb'),'28,3');assert.equal(measurement(72,'cm','nb'),'72');
});
test('every concept states applicability, integration boundary and executable tasks',()=>{
  assert.equal(uxTopics.length,33);assert.equal(acceptanceCount,137);
  for(const t of uxTopics){for(const pair of [t.challenge,t.when,t.data,t.boundary])assert.ok(pair.length===2&&pair.every(v=>v.length>20),t.slug);assert.ok(["baymard.com","developers.google.com","exp-platform.com","web.dev"].includes(new URL(t.source[1]).hostname),t.slug);}
  for(const p of learningPaths)for(const id of p.topics)assert.ok(uxTopics.some(t=>t.slug===id));
});
test('generic search respects same-variant tokens and public SKU',()=>{
  const p={id:'p',title:'Cup',variants:[{id:'blue-500',sku:'NORD-02',price:10,options:[{name:'Color',value:'blue'},{name:'Volume',value:'500'}]},{id:'green-350',sku:'NORD-03',price:10,options:[{name:'Color',value:'green'},{name:'Volume',value:'350'}]}]};
  assert.equal(matchingVariants(p,{query:'green 500'}).length,0);
  assert.deepEqual(matchingVariants(p,{query:'NORD-02'}).map(v=>v.id),['blue-500']);
  assert.match(renderCatalogFilters([p],{currency:'NOK'},'en'),/NORD-02/);
});
