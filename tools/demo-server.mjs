import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { build, root } from './examples.mjs';
import worker from '../starter/src/worker.js';

const name = process.argv[2] || 'everyday-store';
const port = Number(process.env.DEMO_PORT || 8787);
const directory = await build(name);
const origin = `http://127.0.0.1:${port}`;
const catalog = JSON.parse(await readFile(path.join(root, 'examples/demo-data/catalog.json'), 'utf8'));
for (const product of catalog.products) {
  for (const image of product.images) image.url = new URL(image.url, origin).href;
}
const upstreamFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(input);
  if (url.origin !== 'http://reai-demo.invalid') return upstreamFetch(input, init);
  if (url.pathname.endsWith('/site')) return Response.json({
    name: name === 'studio-store' ? 'Example Studio' : 'Everyday Objects',
    markets: [{ handle: 'default', defaultLocale: 'en', isDefault: true }],
  });
  if (url.pathname.endsWith('/storefront')) return Response.json(catalog);
  return Response.json({ detail: 'This synthetic demo cannot create orders or accept payments.' }, { status: 403 });
};
const types = { '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.avif': 'image/avif' };
const env = {
  REAI_API_BASE_URL: 'http://reai-demo.invalid',
  REAI_SITE_CREDENTIAL: 'synthetic-demo-only',
  ASSETS: { async fetch(request) {
    const pathname = new URL(request.url).pathname;
    const target = path.resolve(directory, 'public', '.' + pathname);
    const allowedRoot = path.join(directory, 'public') + path.sep;
    if (!target.startsWith(allowedRoot)) return new Response('Not found', { status: 404 });
    try { return new Response(await readFile(target), { headers: { 'content-type': types[path.extname(target)] || 'application/octet-stream' } }); }
    catch { return new Response('Not found', { status: 404 }); }
  } },
};
const server = http.createServer(async (incoming, outgoing) => {
  try {
    const chunks = [];
    for await (const chunk of incoming) chunks.push(chunk);
    const request = new Request(new URL(incoming.url, origin), {
      method: incoming.method, headers: incoming.headers,
      ...(!['GET', 'HEAD'].includes(incoming.method) ? { body: Buffer.concat(chunks) } : {}),
    });
    const response = await worker.fetch(request, env);
    const headers = Object.fromEntries(response.headers);
    headers['x-robots-tag'] = 'noindex, nofollow';
    let content = Buffer.from(await response.arrayBuffer());
    if (headers['content-type']?.includes('text/html')) {
      content = Buffer.from(content.toString().replace('<body>', '<body><aside class="demo-notice">Fictional design demo — products and prices are synthetic. Checkout is disabled.</aside>'));
    }
    outgoing.writeHead(response.status, headers);
    outgoing.end(incoming.method === 'HEAD' ? undefined : content);
  } catch {
    outgoing.writeHead(500); outgoing.end('Demo server error');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Synthetic ${name} demo: ${origin}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
