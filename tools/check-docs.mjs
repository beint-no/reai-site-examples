import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
async function markdown(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'public', '.wrangler'].includes(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await markdown(file));
    else if (entry.name.endsWith('.md')) result.push(file);
  }
  return result;
}
const files = await markdown(root);
for (const file of files) {
  const text = await readFile(file, 'utf8');
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    const link = match[1].split('#')[0];
    if (!link || /^https?:\/\//.test(link)) continue;
    await access(path.resolve(path.dirname(file), link));
  }
}
console.log(`Validated local Markdown links in ${files.length} documents.`);
