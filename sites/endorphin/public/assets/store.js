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
const CONTACT_EMAIL = 'post@famme.no';
const pageLocale = document.documentElement.lang || 'nb-NO';
const siteMarket = document.querySelector('meta[name="reai-market"]')?.content || 'NO';
let siteCurrency = document.querySelector('meta[name="reai-currency"]')?.content || 'NOK';
const reaiApiBase = (document.querySelector('meta[name="reai-api-base"]')?.content || '/reai').replace(/\/$/, '');
const storefrontPrefix = reaiApiBase.endsWith('/reai') ? reaiApiBase.slice(0, -'/reai'.length) : '';
const reaiPath = (path) => `${reaiApiBase}/${String(path).replace(/^\//, '')}`;
const storefrontPath = (path) => `${storefrontPrefix}${path.startsWith('/') ? path : `/${path}`}`;
const currentStorefrontPathname = storefrontPrefix && location.pathname.startsWith(`${storefrontPrefix}/`)
  ? location.pathname.slice(storefrontPrefix.length)
  : location.pathname;

const formatMoney = (value) => new Intl.NumberFormat(pageLocale, {
  style: 'currency',
  currency: siteCurrency,
}).format(Number(value));

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
const deferredHoverImage = (image, sizes) => {
  const src = imageUrl(image, 480);
  if (!src) return '';
  const srcset = imageSrcset(image);
  return `<img class="product-card-hover" data-hover-src="${escapeHtml(src)}"${srcset ? ` data-hover-srcset="${escapeHtml(srcset)}" data-hover-sizes="${escapeHtml(sizes)}"` : ''} alt=""${Number(image?.width) > 0 ? ` width="${Number(image.width)}"` : ''}${Number(image?.height) > 0 ? ` height="${Number(image.height)}"` : ''} loading="lazy" decoding="async">`;
};
const hydrateHoverImages = (root = document) => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  root.querySelectorAll('[data-hover-src]').forEach((image) => {
    if (image.dataset.hoverSrcset) image.srcset = image.dataset.hoverSrcset;
    if (image.dataset.hoverSizes) image.sizes = image.dataset.hoverSizes;
    image.src = image.dataset.hoverSrc;
    image.removeAttribute('data-hover-src');
    image.removeAttribute('data-hover-srcset');
    image.removeAttribute('data-hover-sizes');
  });
};
const siteImageUrl = (product, preferredWidth = 320) => imageUrl(product?.images?.[0], preferredWidth);
const CARD_IMAGE_SIZES = '(max-width: 620px) 46vw, (max-width: 1000px) 30vw, 280px';
const PRODUCT_IMAGE_SIZES = '(max-width: 780px) calc(100vw - 40px), 600px';
const priceRange = (variants) => {
  const prices = variants.map((variant) => Number(variant.price));
  const minimum = Math.min(...prices);
  const maximum = Math.max(...prices);
  return minimum === maximum ? formatMoney(minimum) : `${formatMoney(minimum)} – ${formatMoney(maximum)}`;
};

let siteCatalogPromise;
const getSiteCatalog = () => siteCatalogPromise ||= fetchJson(reaiPath('/catalog')).then((catalog) => {
  if (catalog.currency) siteCurrency = catalog.currency;
  return catalog;
});

function showGalleryImage(gallery, index) {
  const thumbs = [...gallery.querySelectorAll('.product-thumbs [data-gallery-src]')];
  if (!thumbs.length) return;
  const next = (index + thumbs.length) % thumbs.length;
  const button = thumbs[next];
  const image = gallery.querySelector('[data-main-product-image]');
  if (image && button.dataset.gallerySrc) {
    setPictureSource(image, button.dataset.gallerySrcset || '', button.dataset.gallerySizes || '');
    if (button.dataset.gallerySizes && button.dataset.gallerySrcset) image.sizes = button.dataset.gallerySizes;
    else image.removeAttribute('sizes');
    if (button.dataset.gallerySrcset) image.srcset = button.dataset.gallerySrcset;
    else image.removeAttribute('srcset');
    image.src = button.dataset.gallerySrc;
    image.alt = button.dataset.galleryAlt || '';
  }
  thumbs.forEach((item, itemIndex) => {
    const active = itemIndex === next;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-current', String(active));
  });
  gallery.dataset.galleryIndex = String(next);
}

function bindProductGallery() {
  const gallery = document.querySelector('.product-gallery');
  if (!gallery || gallery.dataset.galleryBound === 'true') return;
  gallery.dataset.galleryBound = 'true';
  if (!gallery.hasAttribute('tabindex')) gallery.tabIndex = 0;
  gallery.addEventListener('click', (event) => {
    if (event.target.closest('[data-gallery-prev]')) {
      showGalleryImage(gallery, Number(gallery.dataset.galleryIndex || 0) - 1);
      return;
    }
    if (event.target.closest('[data-gallery-next]')) {
      showGalleryImage(gallery, Number(gallery.dataset.galleryIndex || 0) + 1);
      return;
    }
    const button = event.target.closest('.product-thumbs [data-gallery-src]');
    if (!button) return;
    const thumbs = [...gallery.querySelectorAll('.product-thumbs [data-gallery-src]')];
    showGalleryImage(gallery, thumbs.indexOf(button));
  });
  gallery.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showGalleryImage(gallery, Number(gallery.dataset.galleryIndex || 0) - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showGalleryImage(gallery, Number(gallery.dataset.galleryIndex || 0) + 1);
    }
  });
}

const quantity = document.querySelector('[data-quantity]');
document.querySelector('[data-quantity-minus]')?.addEventListener('click', () => {
  if (quantity) quantity.value = String(Math.max(1, Number(quantity.value || 1) - 1));
});
document.querySelector('[data-quantity-plus]')?.addEventListener('click', () => {
  if (quantity) quantity.value = String(Math.min(20, Number(quantity.value || 1) + 1));
});

const addButton = document.querySelector('[data-add-to-cart]');
const productPrice = document.querySelector('[data-product-price]');
if (addButton && !VARIANT_ID.test(addButton.dataset.variant || '')) {
  addButton.disabled = true;
  addButton.dataset.variant = '';
}

const OPTION_LABELS = { Color: 'Farge', Size: 'Størrelse', 'Shoe size': 'Størrelse' };
const OPTION_VALUE_LABELS = {
  White: 'Hvit',
  Black: 'Sort',
  Hvit: 'Hvit',
  Svart: 'Sort',
  Beige: 'Beige',
  Blå: 'Blå',
  Blue: 'Blå',
  'Mørk Grå': 'Mørk grå',
  'Triple Black': 'Triple Black',
  'White/Blue': 'Hvit / Blå',
  'Black/White': 'Sort / Hvit',
  'Beige / Green': 'Beige / Grønn',
  'White / Mauve': 'Hvit / Mauve',
};
const PRODUCT_TITLES = {
  'endorphin-rx1-shoes': 'Endorphin RX1',
  'endorphin-rx2-shoes': 'Endorphin RX2',
  'airstep-shoes': 'AirStep',
  '90s-trainers': '90S Trainers',
  'hvite-tennis-sokker': 'Sky Knit tennissokker',
  '3-pack-sky-knit-socks': 'Sky Knit sokker 3-pack',
};
const optionValueLabel = (value) => OPTION_VALUE_LABELS[value] || value;
const displayTitle = (product) => PRODUCT_TITLES[product?.handle] || String(product?.title || '').replace(/ Shoes$/i, '');
const displayBrand = () => 'Endorphin';
const COLOR_SWATCHES = {
  White: '#f3efe6',
  Hvit: '#f3efe6',
  Black: '#161616',
  Svart: '#161616',
  Beige: '#d7c4a3',
  Blå: '#4e6f9c',
  Blue: '#4e6f9c',
  Green: '#7a8f4a',
  Grønn: '#7a8f4a',
  Mauve: '#c9a0b4',
  'Mørk Grå': '#5d5f63',
  'Triple Black': '#111111',
  'White/Blue': 'linear-gradient(135deg,#f3efe6 50%,#4e6f9c 50%)',
  'Black/White': 'linear-gradient(135deg,#161616 50%,#f3efe6 50%)',
  'Beige / Green': 'linear-gradient(135deg,#d7c4a3 50%,#7a8f4a 50%)',
  'White / Mauve': 'linear-gradient(135deg,#f3efe6 50%,#c9a0b4 50%)',
};
let optionProduct = null;
let optionAvailability = new Map();
const selectedOptions = {};

const isColorOption = (name) => /^(color|colour|farge)$/i.test(String(name || '').trim());
const isSizeOption = (name) => /size|størrelse|storrelse/i.test(String(name || ''));
const swatchBackground = (value) => {
  if (COLOR_SWATCHES[value]) return COLOR_SWATCHES[value];
  const parts = String(value).split(/[/,]/).map((part) => part.trim()).filter(Boolean);
  if (parts.length > 1 && parts.every((part) => COLOR_SWATCHES[part])) {
    return `linear-gradient(135deg,${COLOR_SWATCHES[parts[0]]} 50%,${COLOR_SWATCHES[parts[1]]} 50%)`;
  }
  let hash = 2166136261;
  for (const char of String(value)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return `hsl(${hash % 360} 24% 58%)`;
};

const optionTypesFrom = (variants) => {
  const names = [];
  for (const variant of variants || []) {
    for (const option of variant.options || []) {
      if (option.name && !names.includes(option.name)) names.push(option.name);
    }
  }
  return names.sort((left, right) => {
    const rank = (name) => (isColorOption(name) ? 0 : isSizeOption(name) ? 1 : 2);
    return rank(left) - rank(right) || left.localeCompare(right, 'nb');
  });
};

const optionValuesFrom = (variants, name) => {
  const values = [];
  for (const variant of variants || []) {
    const value = variant.options?.find((option) => option.name === name)?.value;
    if (value && !values.includes(value)) values.push(value);
  }
  return values;
};

const matchVariant = (variants, selected) => (variants || []).find((variant) =>
  (variant.options || []).every((option) => selected[option.name] === option.value),
);

const readVariantMap = () => {
  const node = document.querySelector('[data-product-variant-map]');
  if (!node) return [];
  try { return JSON.parse(node.textContent); } catch { return []; }
};

const seedAvailability = (variants) => {
  for (const variant of variants || []) {
    if (variant.available === true || variant.available === false) {
      optionAvailability.set(variant.id, variant.available);
    }
  }
};

const applyMatchedVariant = (variant) => {
  if (!addButton) return;
  if (!variant) {
    addButton.dataset.variant = '';
    addButton.disabled = true;
    addButton.textContent = Object.keys(selectedOptions).length
      ? 'Kombinasjonen er ikke tilgjengelig'
      : 'Velg farge og størrelse';
    return;
  }
  const known = optionAvailability.has(variant.id);
  const available = !known || optionAvailability.get(variant.id) === true;
  addButton.dataset.variant = variant.id;
  addButton.dataset.price = variant.price;
  addButton.dataset.siteAvailable = String(available);
  addButton.disabled = !available;
  addButton.textContent = available ? 'Legg i handlekurven' : 'Utsolgt';
  if (productPrice) productPrice.textContent = formatMoney(variant.price);
};

const renderOptionPills = (product) => {
  const variants = product.variants || [];
  const types = optionTypesFrom(variants);
  let root = document.querySelector('[data-product-options]');
  if (!root && types.length && variants.length > 1) {
    root = document.createElement('div');
    root.className = 'product-options';
    root.setAttribute('data-product-options', '');
    document.querySelector('.product-buy-row')?.before(root);
  }
  if (!root || variants.length <= 1 || !types.length) {
    if (variants.length === 1) applyMatchedVariant(variants[0]);
    return;
  }
  if (!Object.keys(selectedOptions).length) {
    const preferred = variants.find((variant) => optionAvailability.get(variant.id) === true) || variants[0];
    for (const option of preferred?.options || []) selectedOptions[option.name] = option.value;
  }
  const focused = document.activeElement;
  const focusName = focused?.dataset?.optionName;
  const focusValue = focused?.dataset?.optionValue;
  root.innerHTML = types.map((name) => {
    const label = OPTION_LABELS[name] || name;
    const current = selectedOptions[name];
    const color = isColorOption(name);
    const pills = optionValuesFrom(variants, name).map((value) => {
      const trial = { ...selectedOptions, [name]: value };
      const match = matchVariant(variants, trial);
      const selected = selectedOptions[name] === value;
      const unavailable = !match || optionAvailability.get(match.id) === false;
      const classes = ['option-pill', color ? 'option-pill--color' : 'option-pill--size'];
      if (selected) classes.push('is-selected');
      if (unavailable) classes.push('is-unavailable');
      const style = color ? ` style="--option-swatch: ${escapeHtml(swatchBackground(value))}"` : '';
      const swatch = color ? '<span class="option-swatch" aria-hidden="true"></span>' : '';
      const shown = optionValueLabel(value);
      return `<button type="button" class="${classes.join(' ')}"${style} data-option-name="${escapeHtml(name)}" data-option-value="${escapeHtml(value)}" aria-pressed="${selected}" aria-label="${escapeHtml(`${label}: ${shown}`)}">${swatch}<span class="option-pill-text">${escapeHtml(shown)}</span></button>`;
    }).join('');
    const guide = isSizeOption(name) ? '<a class="option-guide-link" href="/storrelse/">Størrelsesguide</a>' : '';
    return `<fieldset class="option-group option-group--${color ? 'color' : 'size'}"><legend><span class="option-group-label">${escapeHtml(label)}</span>${current ? `<span class="option-group-value">${escapeHtml(optionValueLabel(current))}</span>` : ''}</legend><div class="option-pills option-pills--${color ? 'color' : 'size'}" role="group" aria-label="${escapeHtml(label)}">${pills}</div>${guide}</fieldset>`;
  }).join('');
  if (focusName) {
    root.querySelector(`[data-option-name="${CSS.escape(focusName)}"][data-option-value="${CSS.escape(focusValue)}"]`)?.focus();
  }
  applyMatchedVariant(matchVariant(variants, selectedOptions));
};

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-product-options] [data-option-name]');
  if (!button || !optionProduct) return;
  const name = button.dataset.optionName;
  const value = button.dataset.optionValue;
  if (!name) return;
  selectedOptions[name] = value;
  renderOptionPills(optionProduct);
});

function bootstrapProductOptions() {
  const mapped = readVariantMap();
  if (!mapped.length && !addButton) return;
  const product = {
    id: addButton?.dataset.id,
    title: addButton?.dataset.title,
    handle: addButton?.dataset.handle,
    variants: mapped,
  };
  seedAvailability(mapped);
  document.querySelectorAll('[data-product-options] [data-option-name].is-selected').forEach((button) => {
    selectedOptions[button.dataset.optionName] = button.dataset.optionValue;
  });
  if (mapped.length) optionProduct = product;
  if (mapped.length > 1) renderOptionPills(product);
  else if (mapped.length === 1) applyMatchedVariant(mapped[0]);
}

function applySiteGallery(product) {
  const images = product.images || [];
  const main = document.querySelector('[data-main-product-image]');
  if (main && images[0]) {
    setResponsiveImage(main, images[0], 960, PRODUCT_IMAGE_SIZES);
    main.alt = images[0].alt || product.title;
  }
  const gallery = document.querySelector('.product-gallery');
  if (!gallery || !images.length) return;
  gallery.dataset.galleryIndex = '0';
  let thumbs = gallery.querySelector('.product-thumbs');
  if (images.length === 1) {
    thumbs?.remove();
    gallery.querySelectorAll('[data-gallery-prev], [data-gallery-next]').forEach((node) => node.remove());
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
    const alt = image.alt || `${displayTitle(product)} – produktbilde ${index + 1}`;
    return `<button type="button" data-gallery-src="${escapeHtml(imageUrl(image, 960))}" data-gallery-alt="${escapeHtml(alt)}"${srcset ? ` data-gallery-srcset="${escapeHtml(srcset)}" data-gallery-sizes="${escapeHtml(PRODUCT_IMAGE_SIZES)}"` : ''} aria-label="Vis produktbilde ${index + 1}" aria-current="${index === 0}"${active}>${responsiveImageMarkup(image, { alt: '', preferredWidth: 320, sizes: '96px' })}</button>`;
  }).join('');
  bindProductGallery();
}

async function connectProductToSiteApi() {
  const handle = addButton?.dataset.handle || currentStorefrontPathname.match(PRODUCT_PATH)?.[1];
  if (!addButton || !handle) return;
  if (!optionProduct && !VARIANT_ID.test(addButton.dataset.variant || '')) {
    addButton.disabled = true;
    addButton.textContent = 'Sjekker lager …';
  }

  try {
    const product = await fetchJson(reaiPath(`/products/${encodeURIComponent(handle)}`));
    optionProduct = product;
    applySiteGallery(product);
    addButton.dataset.id = product.id;
    addButton.dataset.title = displayTitle(product);
    addButton.dataset.handle = product.handle;
    addButton.dataset.image = siteImageUrl(product);
    const vendor = document.querySelector('.product-vendor');
    if (vendor) vendor.textContent = `${displayBrand(product)} · Fra Famme`;
    const heading = document.querySelector('.product-info h1');
    if (heading) heading.textContent = displayTitle(product);
    renderOptionPills(product);
    const availability = await Promise.all((product.variants || []).map(async (variant) => {
      try {
        const entry = await fetchJson(reaiPath(`/availability/${variant.id}`));
        return [entry.variantId || variant.id, entry.status === 'AVAILABLE'];
      } catch {
        return [variant.id, null];
      }
    }));
    for (const [variantId, available] of availability) {
      if (available === true || available === false) optionAvailability.set(variantId, available);
    }
    renderOptionPills(product);
  } catch {
    if (!optionProduct) {
      addButton.disabled = true;
      addButton.textContent = 'Midlertidig utilgjengelig';
    }
  }
}

const LEGACY_CART_KEY = 'endorphin-cart-v1';
const CART_KEY = `${LEGACY_CART_KEY}:${siteMarket}`;
const readCart = () => {
  try {
    const stored = localStorage.getItem(CART_KEY) || (siteMarket === 'NO' ? localStorage.getItem(LEGACY_CART_KEY) : null);
    return JSON.parse(stored || '[]');
  } catch { return []; }
};
const saveCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  if (siteMarket === 'NO') localStorage.removeItem(LEGACY_CART_KEY);
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
    const response = await fetch(reaiPath('/checkout/start'), {
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
    itemsNode.innerHTML = `<div class="cart-empty"><h2>Handlekurven er tom.</h2><p>Finn noe du liker i hele utvalget.</p><a class="store-button" href="${storefrontPath('/collections/all/')}">Se alle produkter</a></div>`;
    subtotalNode.textContent = formatMoney(0);
    return;
  }
  itemsNode.innerHTML = items.map((item, index) => `<article class="cart-item">
    ${item.image ? `<a href="${storefrontPath(`/products/${item.handle}/`)}"><img src="${escapeHtml(item.image)}" alt="" width="120" height="120" loading="lazy" decoding="async"></a>` : ''}
    <div><h2><a href="${storefrontPath(`/products/${item.handle}/`)}">${escapeHtml(item.title)}</a></h2><p>${formatMoney(item.price)} per stykk</p><div class="cart-item-actions"><button type="button" data-cart-action="minus" data-index="${index}" aria-label="Reduser antall">−</button><strong>${item.quantity}</strong><button type="button" data-cart-action="plus" data-index="${index}" aria-label="Øk antall">+</button><button type="button" data-cart-action="remove" data-index="${index}">Fjern</button></div></div>
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

function collectionProductCard({ handle, title, vendor, price, image, hover, available }) {
  const shown = displayTitle({ handle, title });
  const media = image
    ? `${responsiveImageMarkup(image, { alt: shown, preferredWidth: 480, sizes: CARD_IMAGE_SIZES })}${hover ? deferredHoverImage(hover, CARD_IMAGE_SIZES) : ''}`
    : '<span class="product-image-fallback">E</span>';
  const soldOut = available === false ? '<span>Utsolgt</span>' : '';
  return `<article class="product-card"><a class="product-card-media" href="${storefrontPath(`/products/${handle}/`)}">${media}</a><div class="product-card-copy"><p>${escapeHtml(vendor)}</p><h3><a href="${storefrontPath(`/products/${handle}/`)}">${escapeHtml(shown)}</a></h3><div class="product-card-price"><strong>${formatMoney(price)}</strong>${soldOut}</div></div></article>`;
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
    vendor: displayBrand(product),
    price: Math.min(...product.variants.map((variant) => Number(variant.price))),
    image: product.images?.[0],
    hover: product.images?.[1],
  })).join('');
  hydrateHoverImages(searchResults);
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
        setResponsiveImage(image, primaryImage, 480, CARD_IMAGE_SIZES);
        image.alt = primaryImage.alt || product.title;
      }
      const card = link.closest('.product-card');
      if (card) {
        const price = card.querySelector('.product-card-price strong');
        if (price && product.variants?.length) price.textContent = priceRange(product.variants);
        const title = card.querySelector('h3 a') || card.querySelector('h3');
        if (title && product.title) title.textContent = displayTitle(product);
        const vendor = card.querySelector('.product-card-copy > p');
        if (vendor) vendor.textContent = displayBrand(product);
      }
      if (link.classList.contains('hero-product')) {
        const title = link.querySelector('strong');
        if (title && product.title) title.textContent = displayTitle(product);
      }
    });
  } catch {
    return;
  }
}

async function hydrateCollectionImages() {
  try {
    const payload = await fetchJson(reaiPath('/collections'));
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
  const match = currentStorefrontPathname.match(COLLECTION_PATH);
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
    : ((await fetchJson(reaiPath(`/collections/${encodeURIComponent(handle)}`))).products || []);
  grid.innerHTML = members.length ? members.map((member) => {
    const site = siteByHandle.get(member.handle);
    const variantPrices = (site?.variants || []).map((variant) => Number(variant.price));
    const price = member.price ?? (variantPrices.length ? Math.min(...variantPrices) : 0);
    return collectionProductCard({
      handle: member.handle,
      title: member.title || site?.title || member.handle,
      vendor: displayBrand(site || member),
      price,
      image: site?.images?.[0],
      hover: site?.images?.[1],
    });
  }).join('') : '<p>Ingen produkter i denne samlingen.</p>';
  hydrateHoverImages(grid);
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
    location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Henvendelse fra ${name}`)}&body=${encodeURIComponent(`Navn: ${name}\nE-post: ${email}\n\n${message}`)}`;
  });
}

if (document.querySelector('[data-order-complete]') || /^\/bestilling\/fullfort\/?$/.test(currentStorefrontPathname)) {
  try {
    localStorage.removeItem(CART_KEY);
    if (siteMarket === 'NO') localStorage.removeItem(LEGACY_CART_KEY);
  } catch {}
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
if (cartRoot) getSiteCatalog().then(renderCart).catch(() => {});
hydrateHoverImages();
bindProductGallery();
bootstrapProductOptions();
connectProductToSiteApi();
renderCollectionFromSiteApi()
  .catch(() => false)
  .then((replaced) => {
    if (!replaced && !document.querySelector('[data-storefront]')) {
      hydrateCatalogSurfaces();
      hydrateCollectionImages();
    }
  });
