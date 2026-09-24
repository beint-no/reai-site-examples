const CART_KEY = "squadrasport-cart-v1";
const VARIANT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HANDLE = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const money = (value) => new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
}).format(Number(value));

const menuButton = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-main-nav]");
menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  menu?.classList.toggle("is-open", open);
});
menu?.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menu.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu?.classList.contains("is-open")) {
    menu.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.focus();
  }
});

const readCart = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(stored) ? stored.filter((item) =>
      VARIANT_ID.test(item.variant) && Number.isInteger(item.quantity) && item.quantity > 0
      && item.quantity <= 20 && HANDLE.test(item.handle)) : [];
  } catch {
    return [];
  }
};

const updateCartCount = () => {
  const total = readCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = String(total);
  });
};

const saveCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartCount();
  renderCart();
};

let toastTimeout;
const toast = (message) => {
  const node = document.querySelector("[data-cart-toast]");
  if (!node) return;
  node.textContent = message;
  node.hidden = false;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { node.hidden = true; }, 2800);
};

const gallery = document.querySelector("[data-product-gallery]");
const galleryImage = gallery?.querySelector("[data-main-product-image]");
const thumbnails = [...(gallery?.querySelectorAll("[data-image-src]") || [])];
let activeImage = 0;

const showImage = (index) => {
  if (!galleryImage || !thumbnails.length) return;
  activeImage = (index + thumbnails.length) % thumbnails.length;
  const thumbnail = thumbnails[activeImage];
  galleryImage.src = thumbnail.dataset.imageSrc;
  galleryImage.alt = thumbnail.dataset.imageAlt || "";
  galleryImage.removeAttribute("srcset");
  galleryImage.removeAttribute("sizes");
  thumbnails.forEach((item) => item.setAttribute("aria-pressed", String(item === thumbnail)));
  gallery.querySelector("[data-gallery-count]").textContent = `${activeImage + 1} / ${thumbnails.length}`;
  const strip = gallery.querySelector(".image-thumbnails");
  const stripBounds = strip.getBoundingClientRect();
  const thumbnailBounds = thumbnail.getBoundingClientRect();
  strip.scrollBy({
    left: thumbnailBounds.left - stripBounds.left - (stripBounds.width - thumbnailBounds.width) / 2,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  });
};

thumbnails.forEach((button) => button.addEventListener("click", () => showImage(thumbnails.indexOf(button))));
gallery?.querySelectorAll("[data-gallery-step]").forEach((button) => {
  button.addEventListener("click", () => showImage(activeImage + Number(button.dataset.galleryStep)));
});
gallery?.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  showImage(activeImage + (event.key === "ArrowRight" ? 1 : -1));
});

let touchStart;
gallery?.querySelector(".main-image")?.addEventListener("touchstart", (event) => {
  touchStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
}, { passive: true });
gallery?.querySelector(".main-image")?.addEventListener("touchend", (event) => {
  if (!touchStart) return;
  const distanceX = event.changedTouches[0].clientX - touchStart.x;
  const distanceY = event.changedTouches[0].clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(distanceX) > 50 && Math.abs(distanceX) > Math.abs(distanceY) * 1.25) {
    showImage(activeImage + (distanceX < 0 ? 1 : -1));
  }
}, { passive: true });
gallery?.querySelector(".main-image")?.addEventListener("touchcancel", () => { touchStart = null; });

const addButton = document.querySelector("[data-add-to-cart]");
const variantSelect = document.querySelector("[data-variant-select]");
const optionSelects = [...document.querySelectorAll("[data-option-select]")];
const productPrice = document.querySelector("[data-product-price]");
const syncVariant = () => {
  if (!addButton) return;
  const option = variantSelect?.selectedOptions[0];
  if (option) {
    addButton.dataset.variant = option.value;
    addButton.dataset.price = option.dataset.price;
  }
  const available = option ? option.dataset.available === "true" : !variantSelect && addButton.dataset.available === "true";
  addButton.disabled = !available || !VARIANT_ID.test(addButton.dataset.variant || "");
  addButton.textContent = !option && variantSelect ? "Kombinasjonen finnes ikke" : available ? "Legg i handlekurv" : "Ikke tilgjengelig";
  if (productPrice) productPrice.textContent = option || !variantSelect ? money(addButton.dataset.price) : "";
};
variantSelect?.addEventListener("change", syncVariant);
optionSelects.forEach((select) => select.addEventListener("change", () => {
  const match = [...variantSelect.options].find((option) => {
    const values = JSON.parse(option.dataset.options || "{}");
    return optionSelects.every((item) => values[item.dataset.optionName] === selected[item.dataset.optionName]);
  });
  variantSelect.value = match?.value || "";
  syncVariant();
}));
syncVariant();

addButton?.addEventListener("click", () => {
  if (addButton.disabled) return;
  const variant = addButton.dataset.variant;
  if (!VARIANT_ID.test(variant || "")) return;
  const quantity = Math.min(20, Math.max(1, Number(document.querySelector("[data-quantity]")?.value || 1)));
  if (!Number.isInteger(quantity)) return;
  const items = readCart();
  const existing = items.find((item) => item.variant === variant);
  if (existing) existing.quantity = Math.min(20, existing.quantity + quantity);
  else items.push({
    variant,
    title: addButton.dataset.title,
    handle: addButton.dataset.handle,
    image: addButton.dataset.image,
    price: Number(addButton.dataset.price),
    quantity,
  });
  saveCart(items);
  toast(`${quantity} × ${addButton.dataset.title} er lagt i handlekurven.`);
});

const cartRoot = document.querySelector("[data-cart-root]");
const checkoutButton = document.querySelector("[data-checkout-start]");
const checkoutError = document.querySelector("[data-checkout-error]");
let checkoutEnabled = false;
let checkoutPending = false;

function renderCart() {
  if (!cartRoot) return;
  const items = readCart();
  const list = cartRoot.querySelector("[data-cart-items]");
  const subtotal = cartRoot.querySelector("[data-cart-subtotal]");
  list.innerHTML = items.length
    ? items.map((item, index) => `<article class="cart-item">${item.image?.startsWith("https://app.reai.no/") ? `<img src="${escapeHtml(item.image)}" alt="" width="100" height="100" loading="lazy">` : '<span class="image-placeholder">SQUADRA</span>'}<div><h2><a href="/products/${escapeHtml(item.handle)}">${escapeHtml(item.title)}</a></h2><p>${money(item.price)} per stk.</p><div class="cart-item-actions"><button type="button" data-cart-action="minus" data-index="${index}" aria-label="Reduser antall">−</button><span>${item.quantity}</span><button type="button" data-cart-action="plus" data-index="${index}" aria-label="Øk antall">+</button><button type="button" data-cart-action="remove" data-index="${index}">Fjern</button></div></div><strong>${money(item.price * item.quantity)}</strong></article>`).join("")
    : '<div class="empty-state"><h2>Handlekurven er tom</h2><p>Finn noe du liker i butikken.</p><p><a href="/collections/all">Se alle produkter</a></p></div>';
  subtotal.textContent = money(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  if (checkoutButton) {
    checkoutButton.disabled = !checkoutEnabled || !items.length || checkoutPending;
    checkoutButton.textContent = checkoutEnabled ? "Gå til kassen" : "Kassen åpner ved lansering";
  }
}

cartRoot?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cart-action]");
  if (!button) return;
  const index = Number(button.dataset.index);
  const items = readCart();
  if (!Number.isInteger(index) || !items[index]) return;
  if (button.dataset.cartAction === "remove") items.splice(index, 1);
  if (button.dataset.cartAction === "minus") {
    items[index].quantity -= 1;
    if (items[index].quantity < 1) items.splice(index, 1);
  }
  if (button.dataset.cartAction === "plus") items[index].quantity = Math.min(20, items[index].quantity + 1);
  saveCart(items);
});

if (cartRoot) {
  fetch("/reai/storefront-config")
    .then((response) => response.ok ? response.json() : Promise.reject())
    .then((config) => { checkoutEnabled = config.checkoutEnabled === true; renderCart(); })
    .catch(() => { checkoutEnabled = false; renderCart(); });
}

checkoutButton?.addEventListener("click", async () => {
  if (!checkoutEnabled || checkoutPending) return;
  const lines = readCart().map((item) => ({ variantId: item.variant, quantity: item.quantity }));
  if (!lines.length) return;
  checkoutPending = true;
  renderCart();
  checkoutError.hidden = true;
  try {
    const response = await fetch("/reai/checkout/start", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ lines }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.detail || result.error || "Kunne ikke starte kassen.");
    if (!result.checkoutUrl) throw new Error("Kassen svarte ikke med en adresse.");
    location.assign(result.checkoutUrl);
  } catch (error) {
    checkoutError.textContent = error.message || "Kunne ikke starte kassen.";
    checkoutError.hidden = false;
  } finally {
    checkoutPending = false;
    renderCart();
  }
});

const searchForm = document.querySelector("[data-search-form]");
const searchInput = document.querySelector("[data-search-query]");
const searchStatus = document.querySelector("[data-search-status]");
const searchResults = document.querySelector("[data-search-results]");
const searchProducts = async (query) => {
  if (!searchResults || !searchStatus) return;
  searchResults.innerHTML = "";
  if (query.length < 2) {
    searchStatus.textContent = "Skriv inn minst to tegn.";
    return;
  }
  searchStatus.textContent = "Søker …";
  try {
    const response = await fetch("/reai/catalog");
    if (!response.ok) throw new Error();
    const catalog = await response.json();
    const products = (catalog.products || []).filter((product) =>
      `${product.title || ""} ${product.brand || ""}`.toLocaleLowerCase("nb-NO")
        .includes(query.toLocaleLowerCase("nb-NO")));
    searchStatus.textContent = products.length ? `${products.length} treff` : "Ingen produkter funnet.";
    searchResults.innerHTML = products.map((product) => {
      const image = product.images?.[0];
      const prices = (product.variants || []).map((variant) => Number(variant.price));
      return `<article class="product-card"><a class="product-card-image" href="/products/${escapeHtml(product.handle)}">${image?.url ? `<img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt || product.title)}" loading="lazy">` : '<span class="image-placeholder">SQUADRA</span>'}</a><div class="product-card-copy"><h3><a href="/products/${escapeHtml(product.handle)}">${escapeHtml(product.title)}</a></h3>${prices.length ? `<strong>${money(Math.min(...prices))}</strong>` : ""}</div></article>`;
    }).join("");
  } catch {
    searchStatus.textContent = "Søket er midlertidig utilgjengelig.";
  }
};

if (searchInput) {
  const initial = new URL(location.href).searchParams.get("q") || "";
  searchInput.value = initial;
  if (initial) searchProducts(initial.trim());
}
searchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  const url = new URL(location.href);
  if (query) url.searchParams.set("q", query);
  else url.searchParams.delete("q");
  history.replaceState(null, "", url);
  searchProducts(query);
});

if (document.querySelector("[data-order-complete]")) {
  localStorage.removeItem(CART_KEY);
}
updateCartCount();
renderCart();
