import { pathToFileURL } from 'node:url';

export const demoPickup = {
  name: 'Hent selv · kun demo / demo only',
  pickupDetails: 'Kun demonstrasjon. Ingen fysisk vare eller hentested tilbys i Lekebutikken. / Demonstration only. This store offers no physical goods or collection location.',
};

// Preflight both requested changes before writing. Existing carrier methods stay intact.
export async function configureDemoCommerce(management, options) {
  const sites = (await management('/api/sites')).filter((site) => site.name === 'ReAI Lekebutikken');
  if (sites.length !== 1) throw new Error('Expected exactly one dedicated demo Site; run catalog setup first.');
  const site = sites[0];
  if (site.status !== 'enabled' || site.activeDomain !== 'demosite.reai.no' ||
      site.previewDomain !== 'reai-demo-store.respiro.workers.dev')
    throw new Error('Demo Site status/domains differ; review configuration before applying.');
  const base = `/api/sites/${site.id}/commerce`;
  const commerce = await management(base);
  const markets = await management(`${base}/markets`);
  const defaults = markets.filter((market) => market.handle === 'default' && market.enabled && market.isDefault);
  if (defaults.length !== 1 || !defaults[0].countries.includes('NO'))
    throw new Error('Expected the enabled Norwegian default demo market.');
  const market = defaults[0];
  const methods = commerce.markets.find((item) => item.id === market.id)?.shippingMethods;
  if (!methods) throw new Error('Demo market shipping configuration is missing.');
  const pickupMatches = methods.filter((method) => method.name === demoPickup.name);
  if (options.pickup && (pickupMatches.length > 1 || pickupMatches.some((method) =>
    method.pickupDetails !== demoPickup.pickupDetails || Number(method.amount) !== 0 ||
    method.carrier != null || method.deliveryMethod != null || method.freeFromAmount != null)))
    throw new Error('Demo pickup configuration conflicts with the reviewed definition.');

  const changes = [];
  if (options.business && !commerce.businessSalesEnabled) {
    await management(`${base}/business-sales`, 'PUT', { enabled: true });
    changes.push('company checkout / invoice orders enabled');
  }
  if (options.pickup && !pickupMatches.length) {
    await management(`${base}/markets/${market.id}/shipping-methods/pickup`, 'POST', demoPickup);
    changes.push('free demo-only store pickup added');
  }
  const after = await management(base);
  const afterMethods = after.markets.find((item) => item.id === market.id)?.shippingMethods || [];
  if (options.business && !after.businessSalesEnabled) throw new Error('Business-sales verification failed.');
  if (options.pickup && afterMethods.filter((method) => method.name === demoPickup.name &&
      method.pickupDetails === demoPickup.pickupDetails && Number(method.amount) === 0).length !== 1)
    throw new Error('Pickup verification failed.');
  if (methods.some((before) => !afterMethods.some((item) => JSON.stringify(item) === JSON.stringify(before))))
    throw new Error('Existing shipping configuration changed; review before proceeding.');
  return { changes, businessSalesEnabled: after.businessSalesEnabled, shippingMethodCount: afterMethods.length };
}

async function main() {
  const args = process.argv.slice(2);
  const options = { business: args.includes('--enable-business-sales'), pickup: args.includes('--demo-pickup') };
  const tenantId = args[args.indexOf('--tenant-id') + 1];
  const api = new URL(process.env.REAI_API_BASE_URL || 'https://app.reai.no');
  if (!args.includes('--apply')) {
    console.log(JSON.stringify({ mode: 'plan', api: api.origin,
      tenantId: args.includes('--tenant-id') ? tenantId : 'required for apply',
      site: 'ReAI Lekebutikken', market: 'default',
      enableBusinessSales: options.business, pickup: options.pickup ? demoPickup : 'unchanged',
      effect: 'Company checkout accepts real unpaid orders. Pickup is demo-only and appears only for physical goods. No invoices, EHF messages or payments are sent.' }, null, 2));
    return;
  }
  if (!args.includes('--tenant-id') || !/^\d+$/.test(tenantId || '')) throw new Error('Supply an authorized --tenant-id.');
  if (!options.business && !options.pickup) throw new Error('Select --enable-business-sales and/or --demo-pickup explicitly.');
  if (api.protocol !== 'https:' || !['app.reai.no', 'app-test.reai.no'].includes(api.hostname) || api.username || api.password)
    throw new Error('Use an approved ReAI HTTPS API origin.');
  const token = process.env.REAI_USER_API_TOKEN;
  if (!token) throw new Error('Set REAI_USER_API_TOKEN in the environment, never as a CLI argument.');
  async function management(route, method = 'GET', body) {
    const response = await fetch(new URL(route, api.origin), {
      method, headers: { Authorization: `Bearer ${token}`, 'X-Tenant-Id': tenantId,
        ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`${method} ${route}: HTTP ${response.status}; private response omitted.`);
    return response.status === 204 ? null : response.json();
  }
  console.log(JSON.stringify(await configureDemoCommerce(management, options), null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
