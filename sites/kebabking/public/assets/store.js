const menuButton = document.querySelector('[data-menu-button]');
const mainNav = document.querySelector('[data-main-nav]');

menuButton?.addEventListener('click', () => {
  mainNav?.classList.toggle('is-open');
});

mainNav?.addEventListener('click', (event) => {
  if (event.target.closest('a')) mainNav.classList.remove('is-open');
});

const VARIANT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CART_KEY = 'kebabking-cart-v1';

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const formatMoney = (value) => new Intl.NumberFormat('nb-NO', {
  minimumFractionDigits: Number(value) % 1 ? 2 : 0,
  maximumFractionDigits: 2,
}).format(Number(value)) + ' kr';

const readCart = () => {
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const updateCartCounts = () => {
  const count = readCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  document.querySelectorAll('[data-cart-count]').forEach((node) => {
    node.textContent = String(count);
  });
};

const saveCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartCounts();
};

const showToast = (message) => {
  const toast = document.querySelector('[data-cart-toast]');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.hidden = true;
  }, 2600);
};

const variantSelect = document.querySelector('[data-product-variant]');
const addButton = document.querySelector('[data-add-to-cart]');
const productPrice = document.querySelector('[data-product-price]');
const quantityInput = document.querySelector('[data-quantity]');

const syncSelectedVariant = () => {
  if (!addButton) return;
  const selected = variantSelect?.selectedOptions[0];
  if (selected) {
    addButton.dataset.variant = selected.value;
    addButton.dataset.price = selected.dataset.price || '';
    addButton.dataset.available = selected.dataset.available || 'false';
  }
  const available = addButton.dataset.available === 'true' && VARIANT_ID.test(addButton.dataset.variant || '');
  addButton.disabled = !available;
  addButton.textContent = available ? 'Legg i handlekurven' : 'Utsolgt';
  if (productPrice && addButton.dataset.price) productPrice.textContent = formatMoney(addButton.dataset.price);
};

variantSelect?.addEventListener('change', syncSelectedVariant);
syncSelectedVariant();

document.querySelector('.product-gallery')?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-gallery-image]');
  const image = document.querySelector('.main-product-image img');
  if (!button || !image) return;
  image.src = button.dataset.galleryImage;
  image.removeAttribute('srcset');
  image.removeAttribute('sizes');
  image.alt = button.dataset.galleryAlt || '';
});

addButton?.addEventListener('click', () => {
  const variant = addButton.dataset.variant;
  if (!VARIANT_ID.test(variant || '') || addButton.dataset.available !== 'true') return;
  const quantity = Math.min(20, Math.max(1, Number(quantityInput?.value || 1)));
  const items = readCart();
  const existing = items.find((item) => item.variant === variant);
  if (existing) {
    existing.quantity = Math.min(20, Number(existing.quantity || 0) + quantity);
  } else {
    items.push({
      id: addButton.dataset.id,
      variant,
      title: addButton.dataset.title,
      handle: addButton.dataset.handle,
      image: addButton.dataset.image,
      price: Number(addButton.dataset.price),
      quantity,
    });
  }
  saveCart(items);
  showToast(`${quantity} × ${addButton.dataset.title} er lagt i handlekurven.`);
});

const cartRoot = document.querySelector('[data-cart-root]');
const checkoutButton = document.querySelector('[data-checkout-start]');
const checkoutError = document.querySelector('[data-checkout-error]');

const checkoutLines = (items) => items
  .filter((item) => VARIANT_ID.test(item.variant || '') && Number(item.quantity) > 0)
  .map((item) => ({ variantId: item.variant, quantity: Number(item.quantity) }));

const setCheckoutError = (message) => {
  if (!checkoutError) return;
  checkoutError.textContent = message;
  checkoutError.hidden = !message;
};

const syncCheckoutButton = (items) => {
  if (!checkoutButton) return;
  const ready = checkoutLines(items).length > 0;
  checkoutButton.disabled = !ready;
  checkoutButton.textContent = ready ? 'Gå til kassen' : 'Handlekurven er tom';
};

function renderCart() {
  if (!cartRoot) return;
  const items = readCart();
  const itemsNode = cartRoot.querySelector('[data-cart-items]');
  const subtotalNode = cartRoot.querySelector('[data-cart-subtotal]');
  syncCheckoutButton(items);
  setCheckoutError('');
  if (!items.length) {
    itemsNode.innerHTML = '<div class="empty-state"><h2>Handlekurven er tom.</h2><p>Finn noe du liker i menyen.</p><a class="button" href="/collections/all/">Se hele menyen</a></div>';
    subtotalNode.textContent = '0 kr';
    return;
  }
  itemsNode.innerHTML = items.map((item, index) => `<article class="cart-item">${item.image ? `<a href="/products/${escapeHtml(item.handle)}/"><img src="${escapeHtml(item.image)}" alt="" width="100" height="100" loading="lazy"></a>` : '<span class="image-fallback">KK</span>'}<div><h2><a href="/products/${escapeHtml(item.handle)}/">${escapeHtml(item.title)}</a></h2><p>${formatMoney(item.price)} per stykk</p><div class="cart-actions"><button type="button" data-cart-action="minus" data-index="${index}">−</button><strong>${item.quantity}</strong><button type="button" data-cart-action="plus" data-index="${index}">+</button><button type="button" data-cart-action="remove" data-index="${index}">Fjern</button></div></div><strong class="cart-item-price">${formatMoney(item.price * item.quantity)}</strong></article>`).join('');
  subtotalNode.textContent = formatMoney(items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0));
}

cartRoot?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-cart-action]');
  if (!button) return;
  const items = readCart();
  const index = Number(button.dataset.index);
  if (!Number.isInteger(index) || !items[index]) return;
  if (button.dataset.cartAction === 'plus') items[index].quantity = Math.min(20, Number(items[index].quantity) + 1);
  if (button.dataset.cartAction === 'minus') items[index].quantity = Math.max(1, Number(items[index].quantity) - 1);
  if (button.dataset.cartAction === 'remove') items.splice(index, 1);
  saveCart(items);
  renderCart();
});

checkoutButton?.addEventListener('click', async () => {
  const lines = checkoutLines(readCart());
  if (!lines.length) return;
  checkoutButton.disabled = true;
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
    if (!response.ok || !payload.checkoutUrl) {
      throw new Error(payload.detail || payload.error || 'Kunne ikke starte kassen.');
    }
    location.assign(payload.checkoutUrl);
  } catch (error) {
    setCheckoutError(error.message || 'Kunne ikke starte kassen. Prøv igjen.');
    syncCheckoutButton(readCart());
  }
});

if (document.querySelector('[data-order-complete]')) {
  try {
    localStorage.removeItem(CART_KEY);
  } catch {}
}

updateCartCounts();
renderCart();
