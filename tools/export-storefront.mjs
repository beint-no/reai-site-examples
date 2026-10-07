import { cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { build, root } from './examples.mjs';

export async function exportStorefront(name, destination) {
  if (!destination || !path.isAbsolute(destination)) throw new Error('Destination must be an absolute path to a new directory.');
  const example = await build(name);
  // mkdir without recursive prevents overwriting any existing checkout or files.
  await mkdir(destination);
  try {
    await cp(path.join(root, 'starter/src'), path.join(destination, 'src'), { recursive: true });
    await cp(path.join(example, 'public'), path.join(destination, 'public'), { recursive: true });
    await rm(path.join(destination, 'public/assets/demo'), { recursive: true, force: true });
    await mkdir(path.join(destination, 'packages'));
    await cp(path.join(root, 'packages/reai-site-client'), path.join(destination, 'packages/reai-site-client'), { recursive: true });
    const entrypoint = path.join(destination, 'src/worker.js');
    const worker = await readFile(entrypoint, 'utf8');
    await writeFile(entrypoint, worker.replace('../../packages/reai-site-client/client.mjs', '../packages/reai-site-client/client.mjs'));
    await cp(path.join(root, 'starter/.dev.vars.example'), path.join(destination, '.dev.vars.example'));
    await cp(path.join(root, 'LICENSE'), path.join(destination, 'LICENSE'));
    await writeFile(path.join(destination, '.gitignore'), 'node_modules/\n.dev.vars\n.wrangler/\n.DS_Store\n');
    await writeFile(path.join(destination, 'package.json'), JSON.stringify({
      name: 'private-reai-storefront', private: true, type: 'module', engines: { node: '>=22' },
      scripts: { dev: 'wrangler dev', check: 'node --check src/worker.js && node --check public/store.js && node --test src/*.test.js', deploy: 'wrangler deploy' },
      devDependencies: { wrangler: '4.148.0' },
      overrides: { sharp: '0.35.5' },
    }, null, 2) + '\n');
    await writeFile(path.join(destination, 'wrangler.jsonc'), JSON.stringify({
      $schema: 'https://unpkg.com/wrangler/config-schema.json', name: `test-reai-${name}`,
      main: './src/worker.js', compatibility_date: '2026-09-28', workers_dev: true,
      assets: { directory: './public', binding: 'ASSETS', run_worker_first: true },
      vars: { REAI_API_BASE_URL: 'https://app.reai.no' },
    }, null, 2) + '\n');
    await writeFile(path.join(destination, 'AGENTS.md'), `# Private ReAI storefront\n\nExported from the public ${name} design. This is a standalone source tree; no hub or public repository checkout is required at runtime.\n\nRun npm install once and commit package-lock.json; subsequent installs use npm ci. Run npm run check before changes are published. Copy .dev.vars.example to the ignored .dev.vars for local Worker development. Keep REAI_SITE_CREDENTIAL server-side and put it in a Cloudflare Worker secret for deployment.\n\nReplace the test Worker name, configure the Site preview/active domains, and fill in approved merchant details and policies in src/store-content.js before launch. Deploy only with authorized account credentials. Catalog, collections and prices come from ReAI at request time.\n\nKeep the operator primary checkout on main, work in a dedicated worktree, and use pull requests and squash merges. Record approved business facts, content rules and launch constraints here; do not create a duplicate README.\n\nIntegration guide: https://github.com/beint-no/reai-site-examples\n`);
    return destination;
  } catch (error) {
    // Only clean up the new directory created by this invocation.
    await rm(destination, { recursive: true, force: true });
    throw error;
  }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [name, destination] = process.argv.slice(2);
  console.log(await exportStorefront(name, destination));
}
