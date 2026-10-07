import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const names = ['storefront'];
export async function build(name) {
  if (!names.includes(name)) throw new Error(`Choose a template: ${names.join(', ')}`);
  const directory = path.join(root, 'templates', name);
  await mkdir(path.join(directory, 'public'), { recursive: true });
  await cp(path.join(root, 'starter/public'), path.join(directory, 'public'), { recursive: true });
  const styles = await readFile(path.join(root, 'starter/public/styles.css'), 'utf8');
  const theme = await readFile(path.join(directory, 'theme.css'), 'utf8');
  await writeFile(path.join(directory, 'public/styles.css'), styles + '\n' + theme);
  return directory;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [command, selected] = process.argv.slice(2);
  const targets = selected === 'all' ? names : [selected];
  for (const name of targets) {
    const cwd = await build(name);
    if (command === 'build') continue;
    if (!['dev', 'check'].includes(command)) throw new Error('Usage: examples.mjs build|dev|check <template|all>');
    const args = command === 'dev' ? ['dev'] : ['deploy', '--dry-run'];
    const result = spawnSync(path.join(root, 'node_modules/.bin/wrangler'), args, { cwd, stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status || 1);
  }
}
