import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderStaticPage, renderUnavailablePage, renderNotFoundPage } from './storefront.mjs';

// Editorial output and the unavailable shell contain no catalogue data.
const pages = ['sok', 'handlekurv', 'bestilling/fullfort', 'pages/var-autentisering', 'pages/om-oss', 'pages/contact', 'pages/retur', 'pages/personvernerklaering', 'pages/kjopsvilkar', 'pages/sokeoppdrag', 'blogs/blog', 'blogs/blog/louis-vuitton-speedy-30-vs-35-hvilken-storrelse-passer-deg', 'blogs/blog/slik-pleier-og-oppbevarer-du-en-vintage-skinnveske'];
const outputs = [['index.html', renderUnavailablePage(null,{},'/')], ['404.html',renderNotFoundPage(null,{},'/404/')], ...pages.map((path) => [`${path}/index.html`,renderStaticPage(`/${path}/`)])];
for (const [path,html] of outputs) {
  const target = fileURLToPath(new URL(`./public/${path}`,import.meta.url));
  if (process.argv.includes('--check')) {
    if (await readFile(target, 'utf8') !== html+'\n') throw new Error(`Stale static page: ${path}. Run node sites/vintage-designer/build-static.mjs`);
    continue;
  }
  await mkdir(dirname(target),{recursive:true});
  await writeFile(target,html+'\n');
}
