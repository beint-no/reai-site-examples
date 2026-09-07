#!/usr/bin/env node
import { readFile, readdir, realpath } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

export function validateConfiguration(config, environment = {}) {
  const fixtureFlag = key => /(?:fixture|local_sample|sample_data)/i.test(key);
  const enabled = value => value != null && !['', '0', 'false', 'off'].includes(String(value).toLowerCase());
  for (const [key, value] of Object.entries(environment)) {
    if (fixtureFlag(key) && enabled(value)) throw new Error(`Deployment rejected: local fixture environment variable ${key} is enabled.`);
  }
  const configurations = [config, ...Object.values(config.env || {})];
  for (const candidate of configurations) {
    for (const [key, value] of Object.entries(candidate.vars || {})) {
      if (fixtureFlag(key) && enabled(value)) throw new Error(`Deployment rejected: fixture variable ${key} in Worker configuration.`);
    }
    if (candidate.main && candidate.main !== 'worker.js') throw new Error('Deployment rejected: entrypoint must be worker.js.');
    if (candidate.assets?.directory && candidate.assets.directory !== './public') throw new Error('Deployment rejected: only ./public assets may be uploaded.');
  }
  if (config.main !== 'worker.js' || config.assets?.directory !== './public') throw new Error('Deployment rejected: expected worker.js and ./public.');
}

export async function validateDeployment(siteDirectory, environment = process.env) {
  const config = JSON.parse(await readFile(path.join(siteDirectory, 'wrangler.jsonc'), 'utf8'));
  validateConfiguration(config, environment);
  const publicDirectory = path.join(siteDirectory, 'public');
  async function checkAssets(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) throw new Error('Deployment rejected: symlinks in public assets are not allowed.');
      if (/^(?:\.local|fixtures?|fixture\.json)$/i.test(entry.name)) throw new Error('Deployment rejected: local fixture found in public assets.');
      if (entry.isDirectory()) await checkAssets(path.join(directory, entry.name));
    }
  }
  await checkAssets(publicDirectory);
  const visited = new Set();
  async function checkImports(filename) {
    filename = await realpath(filename);
    if (visited.has(filename)) return;
    visited.add(filename);
    const text = await readFile(filename, 'utf8');
    for (const match of text.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)["']([^"']+)["']/g)) {
      const specifier = match[1];
      if (/\.local|vintage-designer-local|fixture|^node:/i.test(specifier)) throw new Error(`Deployment rejected: local tooling import ${specifier}.`);
      if (specifier.startsWith('.')) await checkImports(path.resolve(path.dirname(filename), specifier));
    }
  }
  await checkImports(path.join(siteDirectory, 'worker.js'));
  return true;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await validateDeployment(fileURLToPath(new URL('../../sites/vintage-designer/', import.meta.url)));
  console.log('Deployment boundary verified: no enabled fixture mode, local imports or uploaded fixture directory.');
}
