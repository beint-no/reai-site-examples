const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const storageKey = 'vintage-designer-preview-cart-v1';
let memoryCart = [];
const readCart = () => { try { const parsed = JSON.parse(localStorage.getItem(storageKey) || '[]'); return Array.isArray(parsed) ? [...new Set(parsed.filter((id) => typeof id === 'string' && id.length < 100))].slice(0,30) : []; } catch { return memoryCart; } };
const writeCart = (cart) => { memoryCart = cart; try { localStorage.setItem(storageKey,JSON.stringify(cart)); } catch { toast('Handlekurven lagres bare så lenge denne siden er åpen.'); } updateCount(); };
const updateCount = () => $$('[data-cart-count]').forEach((node) => { node.textContent = String(readCart().length); });
const toast = (message) => { const node = $('.toast'); if (!node) return; node.textContent = message; node.hidden = false; window.clearTimeout(toast.timer); toast.timer = window.setTimeout(() => { node.hidden = true; },5000); };
const request = async (path) => { const response = await fetch(path,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(10000)}); if (!response.ok) throw new Error('Kunne ikke hente data'); return response.json(); };
let catalogPromise;
const catalog = () => catalogPromise ||= request('/reai/catalog').then((data) => data.products || []).catch((error) => { catalogPromise = undefined; throw error; });
const availabilityCache = new Map();
const availability = (id) => { if (!availabilityCache.has(id)) availabilityCache.set(id,request(`/reai/availability/${encodeURIComponent(id)}`).then((data) => data.status === 'AVAILABLE' ? 'available' : data.status === 'OUT_OF_STOCK' ? 'sold':'unknown').catch(() => 'unknown')); return availabilityCache.get(id); };
const productAvailability = async (ids) => { const statuses = await Promise.all(ids.map(availability)); return statuses.includes('available') ? 'available' : statuses.length && statuses.every((status) => status === 'sold') ? 'sold':'unknown'; };
const escape = (value = '') => String(value).replace(/[&<>"']/g,(char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const imageUrl = (url) => /^(https?:\/\/|\/(?!\/))/.test(String(url || '')) ? String(url) : '';
const gross = (variant) => Number.isFinite(variant?.price) ? variant.price : null;
const price = (product) => { const values = (product.variants || []).map(gross).filter(Number.isFinite); return values.length ? Math.min(...values) : null; };
const money = (value) => value === null ? 'Pris ikke tilgjengelig' : new Intl.NumberFormat('nb-NO',{style:'currency',currency:'NOK',minimumFractionDigits:0,maximumFractionDigits:2}).format(value);
function image(image, title) {
  const url = imageUrl(image?.url);
  if (!url) return '<div class="image-missing" role="img" aria-label="Produktbilde mangler">Bilde kommer</div>';
  const renditions = [...(image.renditions || []),image].filter((item) => imageUrl(item.url) && Number.isFinite(item.width) && item.width > 0);
  const srcset = [...new Map(renditions.map((item) => [item.width,item])).values()].sort((a,b) => a.width-b.width).map((item) => `${escape(imageUrl(item.url))} ${item.width}w`).join(', ');
  return `<img src="${escape(url)}" alt="${escape(image.alt?.trim() || title)}"${image.width>0 ? ` width="${Number(image.width)}"`:''}${image.height>0 ? ` height="${Number(image.height)}"`:''}${srcset ? ` srcset="${srcset}" sizes="(max-width: 650px) 45vw, 30vw"`:''} loading="lazy" decoding="async">`;
}
function card(product) {
  const handle = escape(encodeURIComponent(product.handle));
  return `<article class="product-card" data-product="${escape(product.handle)}" data-brand="${escape(product.brand || '')}" data-price="${price(product) ?? ''}" data-title="${escape(product.title)}" data-variants="${escape(JSON.stringify((product.variants || []).map((variant) => variant.id)))}" data-availability="unknown"><a class="product-image" href="/products/${handle}/">${image(product.images?.[0],product.title)}<span class="stock-tag" data-stock-label hidden></span></a><div class="card-meta"><span class="eyebrow">${escape(product.brand || 'Vintage Designer')}</span><h3><a href="/products/${handle}/">${escape(product.title)}</a></h3><p>${escape(money(price(product)))}</p></div></article>`;
}
const dialog = $('#search-dialog');
$$('[data-open-search]').forEach((button) => button.addEventListener('click',() => { dialog.showModal(); $('#overlay-query').focus(); }));
$('[data-close-search]')?.addEventListener('click',() => dialog.close());
dialog?.addEventListener('click',(event) => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
$('[data-menu]')?.addEventListener('click',(event) => { const open = event.currentTarget.getAttribute('aria-expanded') !== 'true'; event.currentTarget.setAttribute('aria-expanded',String(open)); $('#navigation').classList.toggle('is-open',open); });
updateCount();
window.addEventListener('storage',updateCount);

const grid = $('[data-catalog-grid]');
const filterForm = $('[data-filters]');
const cards = grid ? $$('[data-product]',grid) : [];
cards.forEach((node,index) => { node.dataset.order = index; });
function syncFiltersFromUrl() {
  if (!filterForm) return;
  const params = new URLSearchParams(location.search);
  $$('select',filterForm).forEach((select) => { const value = params.get(select.name); select.value = [...select.options].some((option) => option.value === value) ? value : select.options[0].value; });
}
function applyFilters() {
  if (!grid) return;
  const data = filterForm ? new FormData(filterForm) : null;
  const selectedAvailability = data?.get('availability') || 'all';
  const brand = data?.get('brand') || 'all';
  const sort = data?.get('sort') || 'featured';
  const rank = {available:0,unknown:1,sold:2};
  const ordered = [...cards].sort((a,b) => {
    const status = rank[a.dataset.availability]-rank[b.dataset.availability];
    if (status) return status;
    if (sort === 'name') return a.dataset.title.localeCompare(b.dataset.title,'nb');
    if (sort.startsWith('price-')) { const ap = a.dataset.price === '' ? Infinity : Number(a.dataset.price); const bp = b.dataset.price === '' ? Infinity : Number(b.dataset.price); if (!Number.isFinite(ap) || !Number.isFinite(bp)) return Number.isFinite(ap) ? -1 : Number.isFinite(bp) ? 1 : 0; return sort === 'price-asc' ? ap-bp : bp-ap; }
    return Number(a.dataset.order)-Number(b.dataset.order);
  });
  $$('.sold-divider',grid).forEach((node) => node.remove());
  let count = 0; let soldHeading = false;
  ordered.forEach((node) => {
    node.hidden = (brand !== 'all' && node.dataset.brand !== brand) || (selectedAvailability !== 'all' && node.dataset.availability !== selectedAvailability);
    if (!node.hidden) {
      count++;
      if (node.dataset.availability === 'sold' && !soldHeading) { const divider = document.createElement('div'); divider.className = 'sold-divider'; divider.innerHTML = '<h2>Fra det solgte arkivet</h2><p>Disse veskene har funnet et nytt hjem.</p>'; grid.append(divider); soldHeading = true; }
    }
    grid.append(node);
  });
  if ($('[data-result-count]')) $('[data-result-count]').textContent = `${count} ${count === 1 ? 'veske':'vesker'}`;
  if ($('[data-empty]')) $('[data-empty]').hidden = count > 0;
}
syncFiltersFromUrl();
applyFilters();
filterForm?.addEventListener('change',() => { const params = new URLSearchParams(location.search); for (const [name,value] of new FormData(filterForm)) { if (value === 'all' || value === 'featured') params.delete(name); else params.set(name,value); } const query = params.toString(); history.pushState(null,'',`${location.pathname}${query ? `?${query}`:''}`); applyFilters(); });
window.addEventListener('popstate',() => { syncFiltersFromUrl(); applyFilters(); });
async function hydrateCards(nodes) {
  // Bound concurrency so a large catalogue does not flood the availability route.
  let next = 0;
  await Promise.all(Array.from({length:Math.min(5,nodes.length)},async () => { while (next < nodes.length) { const node = nodes[next++]; let ids=[]; try { ids=JSON.parse(node.dataset.variants); } catch {} const status = await productAvailability(ids); node.dataset.availability=status; const label=$('[data-stock-label]',node); label.hidden=false; label.textContent=status === 'sold' ? 'Solgt' : status === 'available' ? 'Tilgjengelig':'Status utilgjengelig'; } }));
}
if (grid) hydrateCards(cards).then(() => { applyFilters(); $$('[data-availability-note]').forEach((node) => { node.textContent = cards.some((card) => card.dataset.availability === 'unknown') ? 'Noe lagerstatus kunne ikke hentes. Prøv igjen senere.' : 'Tilgjengelige vesker vises først.'; }); });

$$('[data-gallery-index]').forEach((button) => button.addEventListener('click',() => { try { const selected=JSON.parse(button.dataset.image); const replacement=document.createElement('div'); replacement.innerHTML=image(selected,`${$('h1').textContent} – bilde ${Number(button.dataset.galleryIndex)+1}`); const selectedImage=replacement.querySelector('img'); if (selectedImage) selectedImage.sizes='(max-width: 650px) 92vw, 45vw'; const main=$('.gallery-main'); main.replaceChildren(...replacement.childNodes); $$('[data-gallery-index]').forEach((node) => node.setAttribute('aria-pressed',String(node===button))); } catch { toast('Bildet kunne ikke vises.'); } }));
const detail = $('[data-product-detail]');
if (detail) {
  const form = $('[data-add-form]'); const select = $('#variant'); const button = $('.add-button'); const statusNode = $('[data-product-availability]');
  async function updateVariant() { button.disabled=true; statusNode.textContent='Sjekker tilgjengelighet …'; const selected=select.value; try { const [status,products]=await Promise.all([availability(selected),catalog()]); if (select.value !== selected) return; const variant=products.find((product) => product.handle === detail.dataset.productDetail)?.variants?.find((variant) => variant.id === selected); $('.product-price').textContent=money(gross(variant)); button.disabled=status !== 'available' || gross(variant) === null; statusNode.textContent=status === 'available' ? 'Tilgjengelig – klar for et nytt kapittel' : status === 'sold' ? 'Solgt – denne vesken er en del av arkivet' : 'Tilgjengelighet kunne ikke hentes. Prøv igjen senere.'; } catch { if (select.value === selected) statusNode.textContent='Pris og tilgjengelighet kunne ikke hentes. Prøv igjen senere.'; } }
  select.addEventListener('change',updateVariant); updateVariant();
  form.addEventListener('submit',async (event) => { event.preventDefault(); if (button.disabled) return; const id=select.value; availabilityCache.delete(id); button.disabled=true; if (await availability(id) !== 'available') { await updateVariant(); return; } const cart=readCart(); if (!cart.includes(id)) cart.push(id); writeCart(cart); toast('Vesken er lagt i handlekurven. Kjøp er ikke aktivert.'); button.disabled=false; });
}

if ($('[data-search-results]')) {
  const params=new URLSearchParams(location.search); const query=(params.get('q') || '').trim().slice(0,120); $('#query').value=query;
  const status=$('[data-search-status]');
  if (query) { status.textContent='Søker i utvalget …'; catalog().then(async (products) => { const terms=query.toLocaleLowerCase('nb').split(/\s+/); const matches=products.filter((product) => { const text=`${product.title} ${product.brand || ''}`.toLocaleLowerCase('nb'); return terms.every((term) => text.includes(term)); }); const root=$('[data-search-results]'); root.innerHTML=matches.map(card).join(''); status.textContent=matches.length ? `${matches.length} treff for «${query}»` : `Ingen treff for «${query}». Prøv et merke eller en annen modell.`; await hydrateCards($$('[data-product]',root)); const rank={available:0,unknown:1,sold:2}; $$('[data-product]',root).sort((a,b) => rank[a.dataset.availability]-rank[b.dataset.availability]).forEach((node) => root.append(node)); }).catch(() => { status.textContent='Søket kunne ikke fullføres. Last siden på nytt for å prøve igjen.'; }); }
}

async function renderCart() {
  const root=$('[data-cart-items]'); if (!root) return;
  const cart=readCart(); const summary=$('[data-cart-summary]'); summary.hidden=true;
  if (!cart.length) { root.innerHTML='<div class="empty-state"><h2>Plass til en ny favoritt.</h2><p>Handlekurven er tom. Ta en titt i utvalget og finn en veske du vil bli bedre kjent med.</p><a class="button" href="/collections/all/">Utforsk veskene ↗</a></div>'; return; }
  try {
    const products=await catalog(); let total=0; let complete=true;
    const entries=await Promise.all(cart.map(async (id) => { const product=products.find((product) => product.variants?.some((variant) => variant.id===id)); if (!product) { complete=false; return {id,missing:true}; } const variant=product.variants.find((variant) => variant.id===id); const state=await availability(id); const value=gross(variant); if (state !== 'available' || value === null) complete=false; else total+=value; return {id,product,state,value}; }));
    root.innerHTML=entries.map(({id,product,state,value,missing}) => `<article class="cart-row">${missing ? '<div class="image-missing">—</div>' : image(product.images?.[0],product.title)}<div><h2>${missing ? 'Vesken er ikke lenger i utvalget' : `<a href="/products/${escape(encodeURIComponent(product.handle))}/">${escape(product.title)}</a>`}</h2><p>${missing ? 'Fjern vesken fra handlekurven.' : `${escape(money(value))} · ${state === 'available' ? 'Tilgjengelig':state === 'sold' ? 'Solgt – ikke tilgjengelig':'Lagerstatus utilgjengelig'}`}</p></div><button type="button" data-remove="${escape(id)}" aria-label="Fjern ${escape(product?.title || 'vesken')} fra handlekurven">Fjern</button></article>`).join('');
    $$('[data-remove]',root).forEach((button) => button.addEventListener('click',() => { writeCart(readCart().filter((id) => id !== button.dataset.remove)); renderCart(); }));
    $('[data-cart-total]').textContent=complete ? money(total) : 'Kan ikke beregnes'; summary.hidden=false;
  } catch { root.innerHTML='<div class="empty-state"><h2>Handlekurven kunne ikke oppdateres.</h2><p>Veskene er fortsatt lagret. Last siden på nytt for å hente priser og tilgjengelighet igjen.</p><a class="text-link" href="/handlekurv/">Prøv igjen →</a></div>'; }
}
renderCart();
