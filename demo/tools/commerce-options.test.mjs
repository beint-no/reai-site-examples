import test from 'node:test';
import assert from 'node:assert/strict';
import { configureDemoCommerce, demoPickup } from './commerce-options.mjs';

function fixture(methods = [{ id: 'carrier', name: 'Bring', amount: 69, carrier: 'bring' }]) {
  const writes = [];
  const commerce = { businessSalesEnabled: false, markets: [{ id: 'market', shippingMethods: methods }] };
  const management = async (route, method = 'GET', body) => {
    if (method !== 'GET') {
      writes.push({ route, method, body });
      if (method === 'PUT') commerce.businessSalesEnabled = body.enabled;
      else commerce.markets[0].shippingMethods.push({ id: 'pickup', ...body, amount: 0, carrier: null, deliveryMethod: null, freeFromAmount: null });
      return structuredClone(commerce);
    }
    if (route === '/api/sites') return [{ id: 'site', name: 'ReAI Commerce Showcase', status: 'enabled', activeDomain: 'nettbutikk.reai.no', previewDomain: 'reai-demo-store.respiro.workers.dev' }];
    if (route.endsWith('/markets')) return [{ id: 'market', handle: 'default', enabled: true, isDefault: true, countries: ['NO'] }];
    return structuredClone(commerce);
  };
  return { management, writes, commerce };
}

test('commerce setup preserves carrier methods and a retry performs no writes', async () => {
  const f = fixture();
  await configureDemoCommerce(f.management, { business: true, pickup: true });
  assert.equal(f.writes.length, 2);
  assert.equal(f.commerce.markets[0].shippingMethods[0].id, 'carrier');
  f.writes.length = 0;
  const retry = await configureDemoCommerce(f.management, { business: true, pickup: true });
  assert.equal(f.writes.length, 0);
  assert.deepEqual(retry.changes, []);
});

test('conflicting pickup fails preflight before enabling invoice orders', async () => {
  const f = fixture([{ id: 'conflict', ...demoPickup, pickupDetails: 'Changed by operator', amount: 0 }]);
  await assert.rejects(configureDemoCommerce(f.management, { business: true, pickup: true }), /conflicts/);
  assert.equal(f.writes.length, 0);
  assert.equal(f.commerce.businessSalesEnabled, false);
});
