const navToggle = document.querySelector('[data-nav-toggle]');
const navLinks = document.querySelector('[data-nav-links]');

if (navToggle && navLinks) {
  const setNavigationOpen = (open) => {
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
    navLinks.classList.toggle('is-open', open);
  };
  navToggle.addEventListener('click', () => {
    setNavigationOpen(navToggle.getAttribute('aria-expanded') !== 'true');
  });
  navLinks.addEventListener('click', (event) => {
    if (event.target.closest('a')) setNavigationOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      setNavigationOpen(false);
      navToggle.focus();
    }
  });
}

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const VARIANT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRODUCT_PATH = /^\/products\/([^/]+)\/?$/;
const COLLECTION_PATH = /^\/collections\/([^/]+)\/?$/;
const COLLECTION_HANDLE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const formatMoney = (value) => new Intl.NumberFormat('nb-NO', {
  minimumFractionDigits: Number(value) % 1 ? 2 : 0,
  maximumFractionDigits: 2,
}).format(Number(value)) + ' kr';

const fetchJson = async (url, options) => {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
  return response.json();
};

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const imageCandidates = (image) => {
  if (!image) return [];
  const candidates = [...(image.renditions || []), image]
    .filter((candidate) => candidate?.url && Number(candidate.width) > 0);
  const byWidth = new Map(candidates.map((candidate) => [Number(candidate.width), candidate]));
  return [...byWidth.values()].sort((left, right) => Number(left.width) - Number(right.width));
};
const imageUrl = (image, preferredWidth = 960) => {
  const candidates = imageCandidates(image);
  return candidates.find((candidate) => Number(candidate.width) >= preferredWidth)?.url
    || candidates.at(-1)?.url
    || image?.url
    || '';
};
const imageSrcset = (image) => imageCandidates(image)
  .map((candidate) => `${candidate.url} ${candidate.width}w`)
  .join(', ');
const setPictureSource = (element, srcset, sizes) => {
  const source = element?.closest('picture')?.querySelector('[data-responsive-source]');
  if (!source) return;
  if (srcset) source.srcset = srcset; else source.removeAttribute('srcset');
  if (srcset && sizes) source.sizes = sizes; else source.removeAttribute('sizes');
};
const setResponsiveImage = (element, image, preferredWidth, sizes) => {
  if (!element || !image) return;
  const srcset = imageSrcset(image);
  setPictureSource(element, srcset, sizes);
  if (sizes && srcset) element.sizes = sizes; else element.removeAttribute('sizes');
  if (srcset) element.srcset = srcset; else element.removeAttribute('srcset');
  element.src = imageUrl(image, preferredWidth);
  if (Number(image.width) > 0) element.width = Number(image.width); else element.removeAttribute('width');
  if (Number(image.height) > 0) element.height = Number(image.height); else element.removeAttribute('height');
};
const responsiveImageAttributes = (image, preferredWidth, sizes) => {
  const srcset = imageSrcset(image);
  return `src="${escapeHtml(imageUrl(image, preferredWidth))}"${srcset ? ` srcset="${escapeHtml(srcset)}" sizes="${escapeHtml(sizes)}"` : ''}${Number(image?.width) > 0 ? ` width="${Number(image.width)}"` : ''}${Number(image?.height) > 0 ? ` height="${Number(image.height)}"` : ''}`;
};
const responsiveImageMarkup = (image, { alt = '', preferredWidth = 480, sizes = CARD_IMAGE_SIZES, loading = 'lazy' } = {}) => {
  const srcset = imageSrcset(image);
  const source = srcset ? `<source data-responsive-source type="image/avif" srcset="${escapeHtml(srcset)}" sizes="${escapeHtml(sizes)}">` : '';
  return `<picture class="responsive-picture">${source}<img ${responsiveImageAttributes(image, preferredWidth, sizes)} alt="${escapeHtml(alt)}"${loading ? ` loading="${loading}"` : ''} decoding="async"></picture>`;
};
const siteImageUrl = (product, preferredWidth = 480) => imageUrl(product?.images?.[0], preferredWidth);
const CARD_IMAGE_SIZES = '(max-width: 620px) 46vw, (max-width: 1000px) 30vw, 280px';
const PRODUCT_IMAGE_SIZES = '(max-width: 780px) calc(100vw - 36px), 600px';
const priceRange = (variants) => {
  const prices = variants.map((variant) => Number(variant.price));
  const minimum = Math.min(...prices);
  const maximum = Math.max(...prices);
  return minimum === maximum ? formatMoney(minimum) : `${formatMoney(minimum)} – ${formatMoney(maximum)}`;
};

let siteCatalogPromise;
const getSiteCatalog = () => siteCatalogPromise ||= fetchJson('/reai/catalog');

document.querySelector('.product-gallery')?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-gallery-src]');
  if (!button) return;
  const image = document.querySelector('[data-main-product-image]');
  if (!image) return;
  setPictureSource(image, button.dataset.gallerySrcset || '', button.dataset.gallerySizes || '');
  if (button.dataset.gallerySizes && button.dataset.gallerySrcset) image.sizes = button.dataset.gallerySizes;
  else image.removeAttribute('sizes');
  if (button.dataset.gallerySrcset) image.srcset = button.dataset.gallerySrcset;
  else image.removeAttribute('srcset');
  image.src = button.dataset.gallerySrc;
  image.alt = button.dataset.galleryAlt || '';
  document.querySelectorAll('[data-gallery-src]').forEach((item) => {
    const active = item === button;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-current', String(active));
  });
});

document.querySelector('.product-gallery')?.addEventListener('keydown', (event) => {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  const thumbs = [...document.querySelectorAll('[data-gallery-src]')];
  if (!thumbs.length) return;
  const current = Math.max(0, thumbs.findIndex((item) => item.classList.contains('is-active')));
  event.preventDefault();
  thumbs[(current + (event.key === 'ArrowRight' ? 1 : -1) + thumbs.length) % thumbs.length].click();
});

const productGallery = document.querySelector('.product-gallery');
if (productGallery && !productGallery.hasAttribute('tabindex')) productGallery.tabIndex = 0;

const quantity = document.querySelector('[data-quantity]');
document.querySelector('[data-quantity-minus]')?.addEventListener('click', () => {
  if (quantity) quantity.value = String(Math.max(1, Number(quantity.value || 1) - 1));
});
document.querySelector('[data-quantity-plus]')?.addEventListener('click', () => {
  if (quantity) quantity.value = String(Math.min(20, Number(quantity.value || 1) + 1));
});

const addButton = document.querySelector('[data-add-to-cart]');
const productPrice = document.querySelector('[data-product-price]');
let variantSelect = document.querySelector('[data-product-variant]');
if (addButton) {
  addButton.disabled = true;
  if (!VARIANT_ID.test(addButton.dataset.variant || '')) addButton.dataset.variant = '';
}

const selectCurrentVariant = () => {
  if (!addButton) return;
  const selected = variantSelect?.selectedOptions[0];
  if (selected) {
    addButton.dataset.variant = selected.dataset.siteVariant || selected.value || '';
    addButton.dataset.price = selected.dataset.sitePrice || '';
  }
  const available = selected
    ? selected.dataset.siteAvailable === 'true'
    : addButton.dataset.siteAvailable === 'true';
  addButton.disabled = !available || !VARIANT_ID.test(addButton.dataset.variant || '');
  addButton.textContent = available ? 'Legg i handlekurven' : 'Utsolgt';
  if (productPrice && addButton.dataset.price) productPrice.textContent = formatMoney(addButton.dataset.price);
};
selectCurrentVariant();

variantSelect?.addEventListener('change', selectCurrentVariant);

function applySiteGallery(product) {
  const images = product.images || [];
  const main = document.querySelector('[data-main-product-image]');
  if (main && images[0]) {
    setResponsiveImage(main, images[0], 960, PRODUCT_IMAGE_SIZES);
    main.alt = images[0].alt || product.title;
  }
  const gallery = document.querySelector('.product-gallery');
  if (!gallery || !images.length) return;
  let thumbs = gallery.querySelector('.product-thumbs');
  if (images.length === 1) {
    thumbs?.remove();
    return;
  }
  if (!thumbs) {
    thumbs = document.createElement('div');
    thumbs.className = 'product-thumbs';
    gallery.append(thumbs);
  }
  thumbs.innerHTML = images.map((image, index) => {
    const active = index === 0 ? ' class="is-active"' : '';
    const srcset = imageSrcset(image);
    const alt = image.alt || `${product.title} – produktbilde ${index + 1}`;
    return `<button type="button" data-gallery-src="${escapeHtml(imageUrl(image, 960))}" data-gallery-alt="${escapeHtml(alt)}"${srcset ? ` data-gallery-srcset="${escapeHtml(srcset)}" data-gallery-sizes="${escapeHtml(PRODUCT_IMAGE_SIZES)}"` : ''} aria-label="Vis produktbilde ${index + 1}" aria-current="${index === 0}"${active}>${responsiveImageMarkup(image, { alt: '', preferredWidth: 480, sizes: '96px' })}</button>`;
  }).join('');
}

function ensureVariantSelect(product) {
  if (product.variants.length <= 1) return variantSelect;
  if (variantSelect) return variantSelect;
  const buyRow = document.querySelector('.product-buy-row');
  if (!buyRow) return null;
  const label = document.createElement('label');
  label.className = 'product-option';
  const optionName = product.variants[0]?.options?.[0]?.name || 'Variant';
  label.append(document.createTextNode(optionName));
  const select = document.createElement('select');
  select.setAttribute('data-product-variant', '');
  label.append(select);
  buyRow.before(label);
  select.addEventListener('change', selectCurrentVariant);
  variantSelect = select;
  return select;
}

async function connectProductToSiteApi() {
  const handle = addButton?.dataset.handle || location.pathname.match(PRODUCT_PATH)?.[1];
  if (!addButton || !handle) return;
  if (!VARIANT_ID.test(addButton.dataset.variant || '')) {
    addButton.disabled = true;
    addButton.textContent = 'Sjekker lager …';
  }

  try {
    const product = await fetchJson(`/reai/products/${encodeURIComponent(handle)}`);
    const availability = await Promise.all(product.variants.map((variant) =>
      fetchJson(`/reai/availability/${variant.id}`),
    ));
    const availabilityByVariant = new Map(availability.map((entry) => [entry.variantId, entry.status === 'AVAILABLE']));
    applySiteGallery(product);
    addButton.dataset.id = product.id;
    addButton.dataset.title = product.title;
    addButton.dataset.handle = product.handle;
    addButton.dataset.image = siteImageUrl(product, 480);
    const vendor = document.querySelector('.product-vendor');
    if (vendor && product.brand) vendor.textContent = product.brand;
    const heading = document.querySelector('.product-info h1');
    if (heading) heading.textContent = product.title;

    const select = ensureVariantSelect(product);
    if (select) {
      select.innerHTML = product.variants.map((variant) => {
        const optionName = variant.options.map((entry) => entry.value).join(' / ') || product.title;
        const available = availabilityByVariant.get(variant.id) === true;
        return `<option value="${escapeHtml(variant.id)}" data-site-variant="${escapeHtml(variant.id)}" data-site-price="${escapeHtml(variant.price)}" data-site-available="${available}">${escapeHtml(optionName)} · ${formatMoney(variant.price)}</option>`;
      }).join('');
      if (productPrice) productPrice.textContent = priceRange(product.variants);
      selectCurrentVariant();
    } else {
      const siteVariant = product.variants[0];
      if (!siteVariant) throw new Error('Variant mapping is missing');
      addButton.dataset.variant = siteVariant.id;
      addButton.dataset.price = siteVariant.price;
      addButton.dataset.siteAvailable = String(availabilityByVariant.get(siteVariant.id) === true);
      if (productPrice) productPrice.textContent = formatMoney(siteVariant.price);
      selectCurrentVariant();
    }
  } catch {
    addButton.disabled = true;
    addButton.textContent = 'Midlertidig utilgjengelig';
  }
}

const CART_KEY = 'budmates-cart-v3';
const readCart = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
};
const saveCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartCounts();
};
const updateCartCounts = () => {
  const count = readCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('[data-cart-count]').forEach((node) => { node.textContent = String(count); });
};
const showToast = (message) => {
  const toast = document.querySelector('[data-cart-toast]');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { toast.hidden = true; }, 2800);
};

addButton?.addEventListener('click', () => {
  const items = readCart();
  const variant = addButton.dataset.variant;
  if (!VARIANT_ID.test(variant || '')) return;
  const amount = Math.max(1, Number(quantity?.value || 1));
  const existing = items.find((item) => item.variant === variant);
  if (existing) existing.quantity = Math.min(20, existing.quantity + amount);
  else items.push({
    id: addButton.dataset.id,
    variant,
    title: addButton.dataset.title,
    price: Number(addButton.dataset.price),
    image: addButton.dataset.image,
    handle: addButton.dataset.handle,
    quantity: amount,
  });
  saveCart(items);
  showToast(`${amount} × ${addButton.dataset.title} er lagt i handlekurven.`);
});

const cartRoot = document.querySelector('[data-cart-root]');
const checkoutButton = document.querySelector('[data-checkout-start]');
const checkoutError = document.querySelector('[data-checkout-error]');
const checkoutLines = (items) => items
  .filter((item) => VARIANT_ID.test(item.variant || '') && item.quantity > 0)
  .map((item) => ({ variantId: item.variant, quantity: item.quantity }));
const setCheckoutError = (message) => {
  if (!checkoutError) return;
  checkoutError.textContent = message;
  checkoutError.hidden = !message;
};
const syncCheckoutButton = (items) => {
  if (!checkoutButton) return;
  const ready = checkoutLines(items).length > 0;
  checkoutButton.setAttribute('aria-busy', 'false');
  checkoutButton.disabled = !ready;
  checkoutButton.textContent = ready ? 'Gå til kassen' : 'Handlekurven er tom';
};

async function startCheckout() {
  if (!checkoutButton || checkoutButton.disabled) return;
  const lines = checkoutLines(readCart());
  if (!lines.length) {
    setCheckoutError('Handlekurven er tom.');
    syncCheckoutButton([]);
    return;
  }
  checkoutButton.disabled = true;
  checkoutButton.setAttribute('aria-busy', 'true');
  checkoutButton.textContent = 'Sender til kassen …';
  setCheckoutError('');
  try {
    const response = await fetch('/reai/checkout/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({ lines }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.detail || payload.error || 'Kunne ikke starte kassen.');
    }
    if (!payload.checkoutUrl) throw new Error('Kunne ikke starte kassen.');
    location.assign(payload.checkoutUrl);
  } catch (error) {
    setCheckoutError(error.message || 'Kunne ikke starte kassen. Prøv igjen.');
    syncCheckoutButton(readCart());
  }
}

function renderCart() {
  if (!cartRoot) return;
  const itemsNode = cartRoot.querySelector('[data-cart-items]');
  const subtotalNode = cartRoot.querySelector('[data-cart-subtotal]');
  const items = readCart();
  setCheckoutError('');
  syncCheckoutButton(items);
  if (!items.length) {
    itemsNode.innerHTML = '<div class="cart-empty"><h2>Handlekurven er tom.</h2><p>Finn noe du liker i hele utvalget.</p><a class="store-button" href="/collections/all/">Se alle produkter</a></div>';
    subtotalNode.textContent = '0 kr';
    return;
  }
  itemsNode.innerHTML = items.map((item, index) => `<article class="cart-item">
    ${item.image ? `<a href="/products/${item.handle}/"><img src="${escapeHtml(item.image)}" alt="" width="120" height="120" loading="lazy" decoding="async"></a>` : ''}
    <div><h2><a href="/products/${item.handle}/">${escapeHtml(item.title)}</a></h2><p>${formatMoney(item.price)} per stykk</p><div class="cart-item-actions"><button type="button" data-cart-action="minus" data-index="${index}" aria-label="Reduser antall">−</button><strong>${item.quantity}</strong><button type="button" data-cart-action="plus" data-index="${index}" aria-label="Øk antall">+</button><button type="button" data-cart-action="remove" data-index="${index}">Fjern</button></div></div>
    <div class="cart-item-price">${formatMoney(item.price * item.quantity)}</div>
  </article>`).join('');
  subtotalNode.textContent = formatMoney(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
}

checkoutButton?.addEventListener('click', startCheckout);

cartRoot?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-cart-action]');
  if (!button) return;
  const items = readCart();
  const index = Number(button.dataset.index);
  if (!items[index]) return;
  if (button.dataset.cartAction === 'plus') items[index].quantity = Math.min(20, items[index].quantity + 1);
  if (button.dataset.cartAction === 'minus') items[index].quantity = Math.max(1, items[index].quantity - 1);
  if (button.dataset.cartAction === 'remove') items.splice(index, 1);
  saveCart(items);
  renderCart();
});

const searchForm = document.querySelector('[data-search-form]');
const searchInput = document.querySelector('[data-search-input]');
const searchResults = document.querySelector('[data-search-results]');
const searchStatus = document.querySelector('[data-search-status]');

function collectionProductCard({ handle, title, vendor, price, image, available }) {
  const media = image
    ? responsiveImageMarkup(image, { alt: title, preferredWidth: 480, sizes: CARD_IMAGE_SIZES })
    : '<span class="product-image-fallback">BM</span>';
  const soldOut = available === false ? '<span>Utsolgt</span>' : '';
  return `<article class="product-card"><a class="product-card-media" href="/products/${handle}/">${media}</a><div class="product-card-copy"><p>${escapeHtml(vendor)}</p><h3><a href="/products/${handle}/">${escapeHtml(title)}</a></h3><div class="product-card-price"><strong>${formatMoney(price)}</strong>${soldOut}</div></div></article>`;
}

async function runSearch() {
  if (!searchInput || !searchResults || !searchStatus) return;
  const query = searchInput.value.trim().toLocaleLowerCase('nb-NO');
  const url = new URL(location.href);
  if (query) url.searchParams.set('q', query); else url.searchParams.delete('q');
  history.replaceState(null, '', url);
  if (query.length < 2) {
    searchResults.innerHTML = '';
    searchStatus.textContent = 'Skriv inn minst to tegn.';
    return;
  }
  const { products } = await getSiteCatalog();
  const matches = products.filter((product) => [product.title, product.brand, product.description].filter(Boolean).join(' ').toLocaleLowerCase('nb-NO').includes(query));
  searchStatus.textContent = matches.length ? `${matches.length} treff på «${searchInput.value.trim()}»` : `Ingen treff på «${searchInput.value.trim()}»`;
  searchResults.innerHTML = matches.map((product) => collectionProductCard({
    handle: product.handle,
    title: product.title,
    vendor: product.brand || 'BudMates',
    price: Math.min(...product.variants.map((variant) => Number(variant.price))),
    image: product.images?.[0],
  })).join('');
}

searchForm?.addEventListener('submit', (event) => { event.preventDefault(); runSearch(); });
document.querySelector('[data-product-form]')?.addEventListener('submit', (event) => event.preventDefault());
searchInput?.addEventListener('input', () => { clearTimeout(searchInput.timer); searchInput.timer = setTimeout(runSearch, 180); });
if (searchInput) {
  const initialQuery = new URLSearchParams(location.search).get('q') || '';
  searchInput.value = initialQuery;
  if (initialQuery) runSearch();
}

async function hydrateCatalogSurfaces() {
  const cards = document.querySelectorAll('.product-card, .hero-product');
  if (!cards.length) return;
  try {
    const catalog = await getSiteCatalog();
    const productsByHandle = new Map(catalog.products.map((product) => [product.handle, product]));
    document.querySelectorAll('a[href^="/products/"]').forEach((link) => {
      const handle = link.getAttribute('href')?.match(/^\/products\/([^/]+)\/?$/)?.[1];
      const product = productsByHandle.get(handle);
      if (!product) return;
      const primaryImage = product.images?.[0];
      const image = link.querySelector('img');
      if (image && primaryImage) {
        const isHero = link.classList.contains('hero-product');
        setResponsiveImage(image, primaryImage, 480, isHero
          ? '(max-width: 620px) 175px, (max-width: 900px) 225px, 310px'
          : CARD_IMAGE_SIZES);
        image.alt = primaryImage.alt || product.title;
      }
      const card = link.closest('.product-card');
      if (card) {
        const price = card.querySelector('.product-card-price strong');
        if (price && product.variants?.length) price.textContent = priceRange(product.variants);
        const title = card.querySelector('h3 a') || card.querySelector('h3');
        if (title && product.title) title.textContent = product.title;
        const vendor = card.querySelector('.product-card-copy > p');
        if (vendor) vendor.textContent = product.brand || 'BudMates';
      }
      if (link.classList.contains('hero-product')) {
        const title = link.querySelector('strong');
        if (title && product.title) title.textContent = product.title;
      }
    });
  } catch {
    return;
  }
}

async function hydrateCollectionImages() {
  try {
    const payload = await fetchJson('/reai/collections');
    const collections = new Map((payload.collections || []).map((collection) => [collection.handle, collection]));
    document.querySelectorAll('a[href^="/collections/"]').forEach((link) => {
      const handle = link.getAttribute('href')?.match(/^\/collections\/([^/]+)\/?$/)?.[1];
      const collection = collections.get(handle);
      if (!collection?.imageUrl?.startsWith('https://app.reai.no/')) return;
      const image = link.querySelector('img');
      if (image) image.src = collection.imageUrl;
    });
  } catch {
    return;
  }
}

async function renderCollectionFromSiteApi() {
  const match = location.pathname.match(COLLECTION_PATH);
  const grid = document.querySelector('.product-grid');
  if (!match || !grid || grid.dataset.serverRendered === 'true') return false;
  const handle = match[1];
  if (!COLLECTION_HANDLE.test(handle)) return false;
  const siteCatalog = await getSiteCatalog();
  const siteByHandle = new Map((siteCatalog.products || []).map((product) => [product.handle, product]));
  const members = handle === 'all'
    ? (siteCatalog.products || []).map((product) => ({
        handle: product.handle,
        title: product.title,
        brand: product.brand,
        price: Math.min(...product.variants.map((variant) => Number(variant.price))),
      }))
    : ((await fetchJson(`/reai/collections/${encodeURIComponent(handle)}`)).products || []);
  grid.innerHTML = members.length ? members.map((member) => {
    const site = siteByHandle.get(member.handle);
    const variantPrices = (site?.variants || []).map((variant) => Number(variant.price));
    const price = member.price ?? (variantPrices.length ? Math.min(...variantPrices) : 0);
    return collectionProductCard({
      handle: member.handle,
      title: member.title || site?.title || member.handle,
      vendor: member.brand || site?.brand || 'BudMates',
      price,
      image: site?.images?.[0],
    });
  }).join('') : '<p>Ingen produkter i denne samlingen.</p>';
  const countLabel = `${members.length} produkter`;
  const kicker = document.querySelector('.collection-hero .shop-kicker');
  const toolbar = document.querySelector('.catalog-toolbar strong');
  if (kicker) kicker.textContent = countLabel;
  if (toolbar) toolbar.textContent = countLabel;
  return true;
}

const contactForm = document.querySelector('[data-contact-form]');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();
    const errors = { name: name ? '' : 'Skriv inn navnet ditt.', email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Skriv inn en gyldig e-postadresse.', message: message.length >= 10 ? '' : 'Skriv minst 10 tegn.' };
    Object.entries(errors).forEach(([field, text]) => { const node = contactForm.querySelector(`[data-error="${field}"]`); if (node) node.textContent = text; });
    if (Object.values(errors).some(Boolean)) return;
    location.href = `mailto:post@budmates.no?subject=${encodeURIComponent(`Henvendelse fra ${name}`)}&body=${encodeURIComponent(`Navn: ${name}\nE-post: ${email}\n\n${message}`)}`;
  });
}

if (document.querySelector('[data-order-complete]') || /^\/bestilling\/fullfort\/?$/.test(location.pathname)) {
  try { localStorage.removeItem(CART_KEY); } catch {}
}

const staleCartImages = readCart().some((item) => item.image && !String(item.image).startsWith('https://app.reai.no/'));
if (document.querySelector('[data-catalog-count]') || staleCartImages) {
  getSiteCatalog().then((catalog) => {
    document.querySelectorAll('[data-catalog-count]').forEach((node) => {
      node.textContent = `${catalog.products.length} produkter`;
    });
    const items = readCart();
    const productsByHandle = new Map((catalog.products || []).map((product) => [product.handle, product]));
    let changed = false;
    items.forEach((item) => {
      const image = siteImageUrl(productsByHandle.get(item.handle));
      if (image && item.image !== image) {
        item.image = image;
        changed = true;
      }
    });
    if (changed) {
      saveCart(items);
      renderCart();
    }
  }).catch(() => {});
}

updateCartCounts();
renderCart();
connectProductToSiteApi();
renderCollectionFromSiteApi()
  .catch(() => false)
  .then((replaced) => {
    if (!replaced && !document.querySelector('[data-storefront]')) {
      hydrateCatalogSurfaces();
      hydrateCollectionImages();
    }
  });
