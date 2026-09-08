import {readFile,writeFile,mkdir,cp,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as render from '../../sites/vintage-designer/storefront.mjs';
import {presentation} from './presentation.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const site=path.join(root,'sites/vintage-designer');
const origin=process.argv[2];
const workers=origin==='https://vintage-designer.respiro.workers.dev';
if(!workers&&!/^https:\/\/[a-z0-9-]+\.pages\.dev$/.test(origin||''))throw Error('Explicit approved demo origin required');
const fixture=JSON.parse(await readFile(path.join(site,'.local/fixture.json')));
const output=path.join(site,'.local/pages-'+Date.now());
await mkdir(output,{recursive:true});
const put=async(name,text)=>{const file=path.join(output,name);await mkdir(path.dirname(file),{recursive:true});await writeFile(file,text);};
// Reconstruct an allowlist; never serialize the raw database/export envelope.
const image=i=>({url:i.url,alt:i.alt,width:i.width,height:i.height,renditions:(i.renditions||[]).map(r=>({url:r.url,width:r.width,height:r.height}))});
const products=fixture.storefront.products.map(p=>({id:p.id,handle:p.handle,title:p.title,brand:p.brand,description:p.description,seoTitle:p.seoTitle,seoDescription:p.seoDescription,images:p.images.map(image),variants:p.variants.map(v=>({id:v.id,price:v.price,vatRate:v.vatRate,options:v.options}))}));
const collections=fixture.storefront.collections.map(c=>({id:c.id,handle:c.handle,title:c.title,products:c.products.map(p=>({id:p.id,handle:p.handle}))}));
const store={products,collections};
await cp(path.join(site,'public/assets'),path.join(output,'assets'),{recursive:true});
const media=new Set();
for(const p of products)for(const i of p.images)for(const r of [i,...i.renditions]){if(!r.url?.startsWith('/__local-media/'))throw Error('Only verified local imagery may be exported');const name=r.url.slice('/__local-media/'.length);if(name!==path.basename(name))throw Error('Invalid image path');media.add(name);r.url='/media/'+name;}
await mkdir(path.join(output,'media'));
for(const name of media)await cp(path.join(site,'.local/media',name),path.join(output,'media',name));
const pages=new Map([['/',render.renderHomePage(store)],['/404/',render.renderNotFoundPage()],['/collections/all/',render.renderCollectionPage(store,'all')]]);
for(const p of products)pages.set('/products/'+p.handle+'/',render.renderProductPage(store,p));
for(const c of collections)pages.set('/collections/'+c.handle+'/',render.renderCollectionPage(store,c.handle));
async function staticPages(dir,relative=''){for(const e of await readdir(dir,{withFileTypes:true})){if(e.isDirectory()&&e.name!=='assets')await staticPages(path.join(dir,e.name),relative+e.name+'/');else if(e.name==='index.html'&&relative){const url='/'+relative;const html=render.renderStaticPage(url);if(html)pages.set(url,html);}}}
await staticPages(path.join(site,'public'));
for(const [url,html]of pages){const clean=presentation(html,origin);if(/forhåndsvisning|datauttrekk|under utvikling|lokal forhånds/i.test(clean.replace(/<[^>]*>/g,'')))throw Error('Unremoved demo copy: '+url);await put(url==='/404/'?'404.html':url.slice(1)+'index.html',clean);}
await put('data/catalog.json',JSON.stringify({products}));
for(const p of products)for(const v of p.variants)await put('data/availability/'+v.id+'.json',JSON.stringify({variantId:v.id,status:fixture.availability[v.id]==='AVAILABLE'?'AVAILABLE':'OUT_OF_STOCK'}));
await put('sitemap.xml',render.renderSitemap(store).replaceAll(render.SITE_ORIGIN,origin));
await put('robots.txt','User-agent: *\nDisallow: /\n');
await cp(new URL('./worker.mjs',import.meta.url),path.join(output,'_worker.js'));
await put('_routes.json',JSON.stringify({version:1,include:['/*'],exclude:[]}));
if(workers){
  await put('.assetsignore','_worker.js\n_routes.json\nwrangler.jsonc\n.wrangler/\n');
  await put('wrangler.jsonc',JSON.stringify({name:'vintage-designer',main:'_worker.js',compatibility_date:'2026-09-04',workers_dev:true,preview_urls:false,assets:{directory:'.',binding:'ASSETS',run_worker_first:true,html_handling:'auto-trailing-slash',not_found_handling:'404-page'},observability:{enabled:true}},null,2));
}
let js=await readFile(path.join(output,'assets/store.js'),'utf8');
js=js.replaceAll('vintage-designer-preview-cart-v1','vintage-designer-cart-v1');
js+='\n document.querySelector("[data-unavailable-checkout]")?.addEventListener("click",async()=>{try{const response=await fetch("/reai/checkout/start",{method:"POST"});const body=await response.json();toast(body.error);}catch{toast("Bestilling og betaling er ikke tilgjengelig.");}});\n';
await put('assets/store.js',js);
console.log(JSON.stringify({output,pages:pages.size,products:products.length,media:media.size}));
