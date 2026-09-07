#!/usr/bin/env node
// Explicit local-only harness. Not imported by any deployed site module.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const option = name => args[args.indexOf(name) + 1];
if (!args.includes('--fixture') || !option('--fixture') || option('--fixture').startsWith('--')) throw new Error('Explicit --fixture <ignored fixture.json> is required; live API failures never enable fixtures.');
const root = fileURLToPath(new URL('../../', import.meta.url));
const localRoot = path.join(root, 'sites/vintage-designer/.local');
const fixturePath = path.resolve(option('--fixture'));
if (!fixturePath.startsWith(`${localRoot}${path.sep}`)) throw new Error('Fixture must be inside ignored sites/vintage-designer/.local/');
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
if (fixture.localFixture !== true || !Array.isArray(fixture.storefront?.products) || !fixture.availability) throw new Error('Expected explicit local fixture envelope');
const port = args.includes('--port') ? Number(option('--port')) : 8787;
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Port must be 1024–65535');
const failureMode = args.includes('--upstream-error');
const mime = { '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml' };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
async function fileResponse(directory, relative, fallback = false) {
  const target = path.resolve(directory, `.${relative}`);
  if (!target.startsWith(`${directory}${path.sep}`) && target !== directory) return new Response('Not found', { status: 404 });
  try {
    const file = (await stat(target)).isDirectory() ? path.join(target, 'index.html') : target;
    return new Response(await readFile(file), { headers: { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' } });
  } catch {
    if (fallback) {
      const branded = await fileResponse(directory, '/404.html');
      return new Response(branded.body, { status: 404, headers: branded.headers });
    }
    return new Response('Not found', { status: 404 });
  }
}
const { products, collections, ...context } = fixture.storefront;
function upstream(request) {
  if (failureMode) return json({ error: 'Deliberate local upstream failure' }, 503);
  const url = new URL(request.url);
  if (request.headers.get('Authorization') !== 'Bearer local-fixture-only') return json({ error: 'Missing dummy token' }, 401);
  if (url.pathname === '/site/v1/commerce/storefront') return json(fixture.storefront);
  if (url.pathname === '/site/v1/commerce/catalog') return json({ ...context, products });
  if (url.pathname === '/site/v1/commerce/collections') return json({ ...context, collections });
  if (url.pathname.startsWith('/site/v1/commerce/products/')) {
    const product = products.find(product => product.handle === decodeURIComponent(url.pathname.split('/').at(-1)));
    return product ? json({ ...context, ...product }) : json({ error: 'Not found' }, 404);
  }
  if (url.pathname.startsWith('/site/v1/commerce/collections/')) {
    const collection = collections.find(collection => collection.handle === decodeURIComponent(url.pathname.split('/').at(-1)));
    return collection ? json({ ...context, ...collection }) : json({ error: 'Not found' }, 404);
  }
  if (url.pathname === '/site/v1/commerce/availability') return json({ ...context, variants: url.searchParams.getAll('variantId').map(variantId => ({ variantId, status: fixture.availability[variantId] || 'OUT_OF_STOCK' })) });
  if (url.pathname.startsWith('/site/v1/commerce/availability/')) {
    const variantId = url.pathname.split('/').at(-1);
    return fixture.availability[variantId] ? json({ ...context, variantId, status: fixture.availability[variantId] }) : json({ error: 'Not found' }, 404);
  }
  if (url.pathname === '/site/v1/site') return json({ id: context.marketId, name: 'Vintage Designer — local sample', status: 'enabled', sourceLocale: 'nb-NO', activeDomain: null, markets: [] });
  return json({ error: 'Local upstream endpoint not implemented' }, 404);
}
async function send(response, outgoing, head = false) {
  const headers = new Headers(response.headers);
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (!headers.has('Content-Security-Policy')) headers.set('Content-Security-Policy', "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; script-src 'self'; form-action 'self' mailto:; base-uri 'self'; frame-ancestors 'none'; object-src 'none'");
  outgoing.writeHead(response.status, Object.fromEntries(headers));
  outgoing.end(head ? undefined : Buffer.from(await response.arrayBuffer()));
}
const api = http.createServer(async (incoming, outgoing) => {
  await send(upstream(new Request(`http://127.0.0.1${incoming.url}`, { headers: incoming.headers })), outgoing);
});
await new Promise(resolve => api.listen(0, '127.0.0.1', resolve));
const upstreamPort = api.address().port;
const { default: worker } = await import(pathToFileURL(path.join(root, 'sites/vintage-designer/worker.js')));
const server = http.createServer(async (incoming, outgoing) => {
  try {
    const url = new URL(incoming.url, `http://127.0.0.1:${port}`);
    const chunks = [];
    for await (const chunk of incoming) chunks.push(chunk);
    const request = new Request(url, { method: incoming.method, headers: incoming.headers, ...(!['GET', 'HEAD'].includes(incoming.method) ? { body: Buffer.concat(chunks) } : {}) });
    if (url.pathname.startsWith('/__local-media/')) return send(await fileResponse(path.join(localRoot, 'media'), url.pathname.slice('/__local-media'.length)), outgoing, incoming.method === 'HEAD');
    const response = await worker.fetch(request, { REAI_BASE_URL: `http://127.0.0.1:${upstreamPort}`, REAI_SITE_TOKEN: 'local-fixture-only', CHECKOUT_ENABLED: 'false', ASSETS: { fetch: request => fileResponse(path.join(root, 'sites/vintage-designer/public'), new URL(request.url).pathname, true) } }, { waitUntil: promise => promise.catch(error => console.error(error)) });
    await send(response, outgoing, incoming.method === 'HEAD');
  } catch (error) {
    console.error(error);
    await send(json({ error: 'Local preview failed; inspect terminal output' }, 500), outgoing);
  }
});
await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));
console.log(`LOCAL SAMPLE ONLY: http://127.0.0.1:${port} (${products.length} source-backed samples; ${failureMode ? 'upstream error mode' : 'no real ReAI connection'})`);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { server.close(); api.close(); });
