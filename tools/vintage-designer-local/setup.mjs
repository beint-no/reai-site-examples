#!/usr/bin/env node
// One-shot development data import. This file is never imported by the Worker.
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const destination = path.join(root, 'sites/vintage-designer/.local');
const handles = process.argv.slice(2);
if (!handles.length || handles.length > 6 || handles.some(handle => !/^[a-z0-9-]+$/.test(handle))) {
  throw new Error('Pass one to six public Vintage Designer product handles. Nothing is imported implicitly.');
}
const id = value => {
  const hex = createHash('sha256').update(String(value)).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};
const get = async url => {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Public source returned ${response.status}: ${url}`);
  return response;
};
await mkdir(path.join(destination, 'media'), { recursive: true });
const products = [];
const availability = {};
const sources = [];
for (const handle of handles) {
  const source = `https://vintagedesigner.no/products/${handle}`;
  const product = await (await get(`${source}.js`)).json();
  const images = [];
  for (const [index, media] of (product.media || []).filter(item => item.media_type === 'image').slice(0, 3).entries()) {
    const url = new URL(media.src.startsWith('//') ? `https:${media.src}` : media.src);
    if (!['cdn.shopify.com', 'vintagedesigner.no'].includes(url.hostname)) throw new Error('Unexpected source image host');
    const extension = path.extname(url.pathname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(extension)) throw new Error('Unexpected image format');
    const renditions = [];
    for (const width of [...new Set([Math.min(480, media.width), Math.min(960, media.width)])]) {
      url.searchParams.set('width', String(width));
      const filename = `${handle}-${index}-${width}${extension}`;
      const response = await get(url);
      await writeFile(path.join(destination, 'media', filename), new Uint8Array(await response.arrayBuffer()));
      renditions.push({ url: `/__local-media/${filename}`, width, height: Math.round(media.height * width / media.width) });
    }
    images.push({ url: renditions.at(-1).url, width: renditions.at(-1).width, height: renditions.at(-1).height, alt: media.alt ?? null, renditions });
  }
  const variants = product.variants.map(variant => {
    const variantId = id(`variant:${variant.id}`);
    availability[variantId] = variant.available ? 'AVAILABLE' : 'OUT_OF_STOCK';
    // API delivery prices are already gross. Retain the displayed source amount;
    // illustrative vatRate: 0 makes no tax-treatment claim and is not an import mapping.
    return { id: variantId, sku: variant.sku || '', options: [], price: variant.price / 100, vatRate: 0, compareAtPrice: variant.compare_at_price ? variant.compare_at_price / 100 : null };
  });
  // The public vendor is the shop itself. Only extract a designer explicitly
  // named at the start of the source title; do not treat the shop as a designer.
  const brand = product.title.match(/^(Louis Vuitton|Gucci|Dior|Herm[eè]s|Chanel|Prada|Fendi|Celine)\b/i)?.[1] || null;
  products.push({ id: id(`product:${product.id}`), title: product.title, seoTitle: product.title, handle: product.handle, description: product.description, brand, images, variants });
  sources.push({ url: source, importedAt: new Date().toISOString() });
  console.log(`Local sample: ${product.title} (${product.available ? 'available' : 'sold'})`);
}
const collection = (handle, title, selected) => ({ id: id(`collection:${handle}`), handle, title, seoTitle: title, products: selected.map(product => ({ id: product.id, title: product.title, handle: product.handle, price: product.variants[0].price, brand: product.brand })) });
const collections = [collection('nyheter', 'Nyheter', products)];
for (const brand of new Set(products.map(product => product.brand).filter(Boolean))) {
  collections.push(collection(brand.toLowerCase().replace(/[^a-z0-9]+/g, '-'), brand, products.filter(product => product.brand === brand)));
}
for (const title of ['Speedy', 'Keepall']) {
  const selected = products.filter(product => product.title.toLowerCase().includes(title.toLowerCase()));
  if (selected.length) collections.push(collection(title.toLowerCase(), title, selected));
}
const context = { marketId: id('local-norway'), marketHandle: 'norway', locale: 'nb-NO', currency: 'NOK', catalogVersion: 1 };
await writeFile(path.join(destination, 'fixture.json'), JSON.stringify({ localFixture: true, sources, notes: 'Local display sample only; prices are displayed gross amounts. Illustrative vatRate: 0 makes no tax-treatment claim. Not a live pricing or inventory source.', storefront: { ...context, products, collections }, availability }, null, 2));
console.log(`Saved ${products.length} products and at most three images each to ignored ${destination}.`);
