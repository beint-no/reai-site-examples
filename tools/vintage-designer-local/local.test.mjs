import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validateConfiguration, validateDeployment } from './validate-deployment.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const site = path.join(root, 'sites/vintage-designer');
const good = { main: 'worker.js', assets: { directory: './public' }, vars: { CHECKOUT_ENABLED: 'false' } };
test('deployment rejects fixture flags and non-production entrypoints/assets', () => {
  assert.doesNotThrow(() => validateConfiguration(good, {}));
  for (const key of ['LOCAL_FIXTURE', 'FIXTURE_MODE', 'LOCAL_SAMPLE', 'SAMPLE_DATA']) {
    assert.throws(() => validateConfiguration(good, { [key]: 'true' }), /Deployment rejected/);
    assert.throws(() => validateConfiguration({ ...good, vars: { [key]: 'true' } }, {}), /Deployment rejected/);
  }
  assert.throws(() => validateConfiguration({ ...good, env: { preview: { vars: { FIXTURE_MODE: 'true' } } } }, {}), /Deployment rejected/);
  assert.throws(() => validateConfiguration({ ...good, main: '../../tools/vintage-designer-local/server.mjs' }, {}), /Deployment rejected/);
  assert.throws(() => validateConfiguration({ ...good, assets: { directory: './.local' } }, {}), /Deployment rejected/);
});
test('actual Worker import and public asset boundaries pass', async () => {
  assert.equal(await validateDeployment(site, {}), true);
});
test('local server refuses implicit fixture or a fixture outside ignored directory', () => {
  const server = path.join(root, 'tools/vintage-designer-local/server.mjs');
  const implicit = spawnSync(process.execPath, [server], { encoding: 'utf8' });
  assert.notEqual(implicit.status, 0);
  assert.match(implicit.stderr, /Explicit --fixture/);
  const external = spawnSync(process.execPath, [server, '--fixture', '/tmp/not-a-local-fixture.json'], { encoding: 'utf8' });
  assert.notEqual(external.status, 0);
  assert.match(external.stderr, /inside ignored/);
});
test('actual Worker and shared client serve explicit synthetic fixture; checkout stays disabled', async () => {
  const fixturePath = path.join(site, '.local', `synthetic-test-${process.pid}.json`);
  const variantId = '00000000-0000-4000-8000-000000000002';
  const unknownId = '00000000-0000-4000-8000-000000000004';
  const product = { id: '00000000-0000-4000-8000-000000000001', title: 'Synthetic test bag', seoTitle: 'Synthetic test bag', handle: 'synthetic-test-bag', images: [], variants: [{ id: variantId, sku: 'TEST', options: [], price: 100, vatRate: 0 }] };
  await mkdir(path.dirname(fixturePath), { recursive: true });
  await writeFile(fixturePath, JSON.stringify({ localFixture: true, snapshotAt: "2026-09-07T06:44:00Z", storefront: { products: [product], collections: [], catalogVersion: 1, marketHandle: 'norway', marketId: '00000000-0000-4000-8000-000000000003', locale: 'nb-NO', currency: 'NOK' }, availability: { [variantId]: 'AVAILABLE', [unknownId]: 'UNKNOWN' } }));
  const port = 20000 + Math.floor(Math.random() * 20000);
  const child = spawn(process.execPath, [path.join(root, 'tools/vintage-designer-local/server.mjs'), '--fixture', fixturePath, '--port', String(port)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  let stderr = '';
  child.stderr.on('data', chunk => { stderr += chunk; });
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Preview start timed out: ${stderr}`)), 10000);
      child.once('exit', code => { clearTimeout(timer); reject(new Error(`Preview exited ${code}: ${stderr}`)); });
      child.stdout.on('data', chunk => { if (String(chunk).includes('LOCAL SAMPLE ONLY')) { clearTimeout(timer); resolve(); } });
    });
    const origin = `http://127.0.0.1:${port}`;
    const catalog = await fetch(`${origin}/reai/catalog`);
    assert.equal(catalog.status, 200);
    assert.equal(catalog.headers.get('Cache-Control'), 'no-store');
    assert.equal((await catalog.json()).products[0].handle, product.handle);
    const availability = await fetch(`${origin}/reai/availability/${variantId}`);
    assert.equal((await availability.json()).status, 'AVAILABLE');
    const unknown = await fetch(`${origin}/reai/availability/${unknownId}`);
    assert.equal((await unknown.json()).status, 'OUT_OF_STOCK');
    const page = await fetch(`${origin}/products/${product.handle}/`);
    assert.equal(page.status, 200);
    const html = await page.text();
    assert.match(html, /Synthetic test bag/);
    assert.match(html, /Datauttrekk 2026-09-07 06:44 UTC/);
    assert.match(html, /Priser og lager er ikke live/);
    assert.match(html, /store\.js\?preview=\d+/);
    assert.equal(page.headers.get("Cache-Control"), "no-store");
    assert.match(page.headers.get('X-Robots-Tag'), /noindex/);
    const missing = await fetch(`${origin}/unknown-local-test-route/`);
    assert.equal(missing.status, 404);
    assert.match(await missing.text(), /Vintage Designer/);
    const missingMedia = await fetch(`${origin}/__local-media/unknown.jpg`);
    assert.equal(missingMedia.status, 404);
    assert.match(missingMedia.headers.get('X-Robots-Tag'), /noindex/);
    assert.equal(missingMedia.headers.get('X-Content-Type-Options'), 'nosniff');
    const checkout = await fetch(`${origin}/reai/checkout/start`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(checkout.status, 403);
  } finally {
    child.kill('SIGTERM');
    await unlink(fixturePath);
  }
});
