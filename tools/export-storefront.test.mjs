import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { exportStorefront } from './export-storefront.mjs';

test('exports a standalone site without a parent dependency or demo catalog', async () => {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'reai-export-'));
  try {
    const destination = path.join(parent, 'client');
    await exportStorefront('studio-store', destination);
    const worker = await readFile(path.join(destination, 'src/worker.js'), 'utf8');
    assert.match(worker, /\.\.\/packages\/reai-site-client\/client\.mjs/);
    assert.doesNotMatch(worker, /\.\.\/\.\.\/packages/);
    assert.ok((await readdir(path.join(destination, 'packages/reai-site-client'))).includes('client.mjs'));
    await assert.rejects(readdir(path.join(destination, 'examples')));
    assert.match(await readFile(path.join(destination, 'public/styles.css'), 'utf8'), /Studio: editorial/);
    await assert.rejects(exportStorefront('everyday-store', destination), { code: 'EEXIST' });
    assert.match(await readFile(path.join(destination, 'public/styles.css'), 'utf8'), /Studio: editorial/);
  } finally { await rm(parent, { recursive: true, force: true }); }
});
