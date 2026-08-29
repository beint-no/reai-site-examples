import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const publicRoot = path.resolve(import.meta.dirname, "..", "public");
const articleDimensions = new Map([
  ["den-ultimate-guiden-til-rullepapir.webp", [1536, 1024]],
  ["hva-er-cones-og-bor-du-bruke-det.webp", [1536, 1024]],
  ["hva-er-forskjellen-pa-tynne-og-tykke-papes.webp", [1200, 630]],
  ["hva-er-ocb-alt-du-trenger-a-vite-om-den-franske-merkevaren.webp", [800, 800]],
  ["hvilke-papes-er-best-guide-for-nybegynnere.webp", [1024, 1024]],
  ["hvilken-storrelse-pa-papes-bor-du-velge.webp", [1275, 825]],
  ["hvordan-rulle-royk-her-er-vare-gode-tips.webp", [1536, 1024]],
  ["hvordan-vaske-bong.webp", [1024, 1024]],
  ["hvordan-vaske-en-grinder-her-er-vaere-gode-tips.webp", [1536, 1024]],
  ["hvorfor-brenner-rullepapiret-ujevnt-5-vanlige-arsaker.webp", [1065, 696]],
  ["raw-eller-ocb-hvilket-merke-er-best-for-dine-papes.webp", [1536, 1024]],
  ["rullepapir-med-filter-fordeler-og-beste-valg.webp", [1536, 1024]],
  ["ubleket-vs-bleket-rullepapir-hva-er-best-og-hvorfor.webp", [1024, 1024]],
]);

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(target));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(target);
  }
  return files;
}

function modernize(html) {
  let result = html
    .replace(/<meta name="color-scheme" content="dark light">/g, "")
    .replace(/<link rel="preconnect" href="https:\/\/app\.reai\.no" crossorigin>/g, "")
    .replace('<meta name="viewport" content="width=device-width,initial-scale=1">', '<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark light">')
    .replace('<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">', '<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="preconnect" href="https://app.reai.no" crossorigin>')
    .replace(/<link rel="stylesheet" href="\/assets\/store\.css(?:\?v=\d+)?">/g, '<link rel="stylesheet" href="/assets/store.css?v=2">')
    .replace(/<script(?: type="module")? src="\/assets\/store\.js\?v=\d+"(?: defer)?><\/script>/g, '<script type="module" src="/assets/store.js?v=9"></script>')
    .replace('<div class="shop-announcement"><div class="shop-shell"><span>Betal med Vipps</span><span>Fri frakt over 850 kr</span><span>69 kr under 850 kr</span><span>Diskré pakking</span></div></div>', '<aside class="shop-announcement" aria-label="Kjøpsfordeler"><ul class="shop-shell"><li>Betal med Vipps</li><li>Fri frakt over 850 kr</li><li>69 kr under 850 kr</li><li>Diskré pakking</li></ul></aside>')
    .replaceAll('<img src="/assets/brand/budmates-logo.png" alt="BudMates">', '<img src="/assets/brand/budmates-logo.png" alt="BudMates" width="200" height="64" decoding="async">')
    .replace('<button class="shop-menu-toggle" type="button" aria-label="Åpne meny" aria-expanded="false" data-nav-toggle>', '<button class="shop-menu-toggle" type="button" aria-label="Åpne meny" aria-expanded="false" aria-controls="shop-navigation" data-nav-toggle>')
    .replace('<nav class="shop-nav" aria-label="Hovedmeny" data-nav-links>', '<nav class="shop-nav" id="shop-navigation" aria-label="Hovedmeny" data-nav-links>')
    .replace(/<nav class="shop-breadcrumbs"><a href="\/">Hjem<\/a><span>\/<\/span><a href="\/artikler\/">Artikler<\/a><span>\/<\/span><span>([^<]+)<\/span><\/nav>/g, '<nav class="shop-breadcrumbs" aria-label="Brødsmulesti"><ol><li><a href="/">Hjem</a></li><li><a href="/artikler/">Artikler</a></li><li><span aria-current="page">$1</span></li></ol></nav>')
    .replace(/<nav class="shop-breadcrumbs"><a href="\/">Hjem<\/a><span>\/<\/span><span>([^<]+)<\/span><\/nav>/g, '<nav class="shop-breadcrumbs" aria-label="Brødsmulesti"><ol><li><a href="/">Hjem</a></li><li><span aria-current="page">$1</span></li></ol></nav>');

  if (!result.includes('class="noscript-banner"')) {
    result = result.replace('<main id="main">', '<noscript><p class="noscript-banner">JavaScript må være aktivert for handlekurv og utsjekk.</p></noscript><main id="main">');
  }

  for (const [file, [width, height]] of articleDimensions) {
    const source = `/assets/articles/${file}`;
    const pattern = new RegExp(`<img src="${source.replaceAll(".", "\\.")}"(?![^>]*\\bwidth=)`, "g");
    result = result.replace(
      pattern,
      `<img src="${source}" width="${width}" height="${height}" decoding="async"`,
    );
  }
  return result;
}

const files = await htmlFiles(publicRoot);
for (const file of files) {
  const before = await readFile(file, "utf8");
  const after = modernize(before);
  if (after !== before) await writeFile(file, after);
}

console.log(`Modernized ${files.length} BudMates HTML files.`);
