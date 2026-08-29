const locale = document.documentElement.lang || "en-NO";
const norwegian = locale.startsWith("nb");
const prefix = location.pathname === "/nb" || location.pathname.startsWith("/nb/") ? "/nb" : "";
const apiBase = document.querySelector('meta[name="reai-api-base"]')?.content || `${prefix}/reai`;
const CART_KEY = "duofiller-cart-v2";
const VARIANT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const copy = norwegian ? {
  add: "Legg i handlekurven",
  unavailable: "Ikke tilgjengelig",
  added: "lagt i handlekurven",
  empty: "Handlekurven er tom.",
  browse: "Se alle produkter",
  each: "per stykk",
  remove: "Fjern",
  checkout: "Fortsett til betaling",
  orderRequest: "Send bestillingsforespørsel",
  checkoutBusy: "Åpner sikker betaling …",
  checkoutError: "Kunne ikke starte betalingen. Prøv igjen.",
  requestSubject: "Bestillingsforespørsel fra DuoFiller-nettstedet",
  searchShort: "Skriv inn minst to tegn.",
  searchNone: "Ingen treff",
  searchHits: "treff",
  requiredName: "Skriv inn navnet ditt.",
  requiredEmail: "Skriv inn en gyldig e-postadresse.",
  requiredMessage: "Skriv minst 10 tegn.",
  subject: "Henvendelse fra",
} : {
  add: "Add to cart",
  unavailable: "Unavailable",
  added: "added to cart",
  empty: "Your cart is empty.",
  browse: "Browse all products",
  each: "each",
  remove: "Remove",
  checkout: "Continue to checkout",
  orderRequest: "Send order request",
  checkoutBusy: "Opening secure checkout …",
  checkoutError: "Could not start checkout. Please try again.",
  requestSubject: "Order request from the DuoFiller website",
  searchShort: "Enter at least two characters.",
  searchNone: "No results",
  searchHits: "results",
  requiredName: "Enter your name.",
  requiredEmail: "Enter a valid email address.",
  requiredMessage: "Enter at least 10 characters.",
  subject: "Enquiry from",
};

const productPath = (handle) => `${prefix}/products/${encodeURIComponent(handle)}/`;
const allProductsPath = `${prefix}/collections/all/`;
const staticAssetHandle = (handle) => handle === "duofiller-core-g3" ? "duofiller_core_g3" : handle;
const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");
const formatMoney = (value, currency = "NOK") => new Intl.NumberFormat(locale, {
  style: "currency",
  currency,
  maximumFractionDigits: Number(value) % 1 ? 2 : 0,
}).format(Number(value));

const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
navToggle?.addEventListener("click", () => {
  const open = navToggle.getAttribute("aria-expanded") !== "true";
  navToggle.setAttribute("aria-expanded", String(open));
  nav?.classList.toggle("open", open);
  document.body.classList.toggle("menu-open", open);
});
nav?.addEventListener("click", (event) => {
  if (!event.target.closest("a")) return;
  navToggle?.setAttribute("aria-expanded", "false");
  nav.classList.remove("open");
  document.body.classList.remove("menu-open");
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || navToggle?.getAttribute("aria-expanded") !== "true") return;
  navToggle.setAttribute("aria-expanded", "false");
  nav?.classList.remove("open");
  document.body.classList.remove("menu-open");
  navToggle.focus();
});

const readCart = () => {
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};
const saveCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartCount();
};
const updateCartCount = () => {
  const count = readCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  document.querySelectorAll("[data-cart-count]").forEach((node) => { node.textContent = String(count); });
};
const showToast = (text) => {
  const toast = document.querySelector("[data-toast]");
  if (!toast) return;
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { toast.hidden = true; }, 2800);
};

const quantity = document.querySelector("[data-quantity]");
document.querySelector("[data-quantity-minus]")?.addEventListener("click", () => {
  quantity.value = String(Math.max(1, Number(quantity.value || 1) - 1));
});
document.querySelector("[data-quantity-plus]")?.addEventListener("click", () => {
  quantity.value = String(Math.min(20, Number(quantity.value || 1) + 1));
});

const addButton = document.querySelector("[data-add-to-cart]");
const price = document.querySelector("[data-product-price]");
const variantMap = (() => {
  try { return JSON.parse(document.querySelector("[data-product-variant-map]")?.textContent || "[]"); }
  catch { return []; }
})();
const selectedOptions = Object.fromEntries([...document.querySelectorAll("[data-option-name][aria-pressed=true]")].map((button) => [button.dataset.optionName, button.dataset.optionValue]));

function selectVariant() {
  if (!addButton || !variantMap.length) return;
  const variant = variantMap.find((candidate) => (candidate.options || []).every((option) => selectedOptions[option.name] === option.value));
  const available = variant && variant.available !== false;
  addButton.dataset.variant = variant?.id || "";
  addButton.dataset.price = String(variant?.price || "");
  addButton.disabled = !available || !VARIANT_ID.test(variant?.id || "");
  addButton.textContent = available ? copy.add : copy.unavailable;
  if (variant && price) price.textContent = formatMoney(variant.price, addButton.dataset.currency);
}

document.querySelector("[data-product-options]")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-option-name]");
  if (!button) return;
  selectedOptions[button.dataset.optionName] = button.dataset.optionValue;
  document.querySelectorAll(`[data-option-name="${CSS.escape(button.dataset.optionName)}"]`).forEach((candidate) => {
    candidate.setAttribute("aria-pressed", String(candidate === button));
  });
  selectVariant();
});
selectVariant();

addButton?.addEventListener("click", () => {
  const variant = addButton.dataset.variant;
  if (!VARIANT_ID.test(variant || "")) return;
  const items = readCart();
  const amount = Math.max(1, Math.min(20, Number(quantity?.value || 1)));
  const existing = items.find((item) => item.variant === variant);
  if (existing) existing.quantity = Math.min(20, existing.quantity + amount);
  else items.push({
    id: addButton.dataset.id,
    variant,
    title: addButton.dataset.title,
    price: Number(addButton.dataset.price),
    currency: addButton.dataset.currency || "NOK",
    image: addButton.dataset.image,
    handle: addButton.dataset.handle,
    quantity: amount,
  });
  saveCart(items);
  showToast(`${amount} × ${addButton.dataset.title} ${copy.added}.`);
});

const gallery = document.querySelector("[data-product-gallery]");
if (gallery) {
  let images = [];
  try { images = JSON.parse(gallery.textContent); } catch {}
  document.querySelector(".product-thumbs")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-gallery-index]");
    const image = images[Number(button?.dataset.galleryIndex)];
    if (!button || !image) return;
    const candidates = [...(image.renditions || []), image].filter((candidate) => candidate.url && candidate.width).sort((a, b) => a.width - b.width);
    const srcset = candidates.map((candidate) => `${candidate.url} ${candidate.width}w`).join(", ");
    document.querySelector("[data-gallery-main]").innerHTML = `<picture class="responsive-picture">${srcset ? `<source type="image/avif" srcset="${escapeHtml(srcset)}" sizes="(max-width:780px) 92vw, 54vw">` : ""}<img src="${escapeHtml(candidates.find((candidate) => candidate.width >= 960)?.url || candidates.at(-1)?.url || image.url)}" alt="${escapeHtml(image.alt || addButton?.dataset.title || "")}" width="${Number(image.width) || 800}" height="${Number(image.height) || 800}" decoding="async"></picture>`;
    document.querySelectorAll("[data-gallery-index]").forEach((candidate) => candidate.setAttribute("aria-current", String(candidate === button)));
  });
}

const cartRoot = document.querySelector("[data-cart-root]");
const cartLines = document.querySelector("[data-cart-lines]");
const cartTotal = document.querySelector("[data-cart-total]");
const checkoutButton = document.querySelector("[data-cart-checkout]");
const cartError = document.querySelector("[data-cart-error]");
const storefrontConfig = fetch(`${apiBase}/storefront-config`, { headers: { Accept: "application/json" } })
  .then((response) => response.ok ? response.json() : { checkoutEnabled: false })
  .catch(() => ({ checkoutEnabled: false }));

function renderCart() {
  if (!cartRoot || !cartLines || !cartTotal) return;
  const items = readCart();
  if (!items.length) {
    cartLines.innerHTML = `<div class="empty-state"><h2>${copy.empty}</h2><p><a class="button button-dark" href="${allProductsPath}">${copy.browse}</a></p></div>`;
    cartTotal.textContent = formatMoney(0);
    checkoutButton.disabled = true;
    return;
  }
  cartLines.innerHTML = items.map((item, index) => `<article class="cart-line"><a href="${productPath(item.handle)}"><img src="${escapeHtml(item.image)}" alt="" width="120" height="120" loading="lazy" decoding="async"></a><div><h2><a href="${productPath(item.handle)}">${escapeHtml(item.title)}</a></h2><p>${formatMoney(item.price, item.currency)} ${copy.each}</p><div class="cart-controls"><button type="button" data-cart-action="minus" data-index="${index}" aria-label="−">−</button><strong>${item.quantity}</strong><button type="button" data-cart-action="plus" data-index="${index}" aria-label="+">+</button></div></div><div><strong>${formatMoney(item.price * item.quantity, item.currency)}</strong><button class="cart-remove" type="button" data-cart-action="remove" data-index="${index}">${copy.remove}</button></div></article>`).join("");
  cartTotal.textContent = formatMoney(items.reduce((sum, item) => sum + item.price * item.quantity, 0), items[0]?.currency);
  checkoutButton.disabled = false;
  storefrontConfig.then(({ checkoutEnabled }) => {
    checkoutButton.textContent = checkoutEnabled ? copy.checkout : copy.orderRequest;
  });
}

cartLines?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cart-action]");
  if (!button) return;
  const items = readCart();
  const item = items[Number(button.dataset.index)];
  if (!item) return;
  if (button.dataset.cartAction === "plus") item.quantity = Math.min(20, item.quantity + 1);
  if (button.dataset.cartAction === "minus") item.quantity = Math.max(1, item.quantity - 1);
  if (button.dataset.cartAction === "remove") items.splice(Number(button.dataset.index), 1);
  saveCart(items);
  renderCart();
});

checkoutButton?.addEventListener("click", async () => {
  const cart = readCart();
  const lines = cart.filter((item) => VARIANT_ID.test(item.variant)).map((item) => ({ variantId: item.variant, quantity: item.quantity }));
  if (!lines.length) return;
  const { checkoutEnabled } = await storefrontConfig;
  if (!checkoutEnabled) {
    const body = cart.map((item) => `${item.quantity} × ${item.title} — ${formatMoney(item.price * item.quantity, item.currency)}`).join("\n");
    location.href = `mailto:post@brewket.no?subject=${encodeURIComponent(copy.requestSubject)}&body=${encodeURIComponent(body)}`;
    return;
  }
  checkoutButton.disabled = true;
  checkoutButton.textContent = copy.checkoutBusy;
  if (cartError) cartError.textContent = "";
  try {
    const response = await fetch(`${apiBase}/checkout/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ lines }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.checkoutUrl) throw new Error(payload.detail || payload.error || copy.checkoutError);
    location.assign(payload.checkoutUrl);
  } catch (error) {
    if (cartError) cartError.textContent = error.message || copy.checkoutError;
    checkoutButton.disabled = false;
    checkoutButton.textContent = copy.checkout;
  }
});

const searchInput = document.querySelector("[data-search-input]");
const searchResults = document.querySelector("[data-search-results]");
const searchCount = document.querySelector("[data-search-count]");
let catalogPromise;
const getCatalog = () => catalogPromise ||= fetch(`${apiBase}/catalog`).then((response) => {
  if (!response.ok) throw new Error();
  return response.json();
});
const searchCard = (product, currency) => {
  const image = product.images?.[0];
  const media = image?.url
    ? `<img src="${escapeHtml(image.renditions?.find((item) => item.width >= 480)?.url || image.url)}" alt="${escapeHtml(image.alt || product.title)}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async">`
    : `<img src="/assets/products/${escapeHtml(staticAssetHandle(product.handle))}-1.webp" alt="${escapeHtml(product.title)}" width="800" height="800" loading="lazy" decoding="async">`;
  const minimum = Math.min(...product.variants.map((variant) => Number(variant.price)));
  return `<article class="product-card"><a class="product-card-media" href="${productPath(product.handle)}">${media}</a><div class="product-card-body"><p>${escapeHtml(product.brand || "DuoFiller")}</p><h3><a href="${productPath(product.handle)}">${escapeHtml(product.title)}</a></h3><div class="product-card-price"><strong>${formatMoney(minimum, currency)}</strong></div></div></article>`;
};

async function runSearch() {
  if (!searchInput || !searchResults || !searchCount) return;
  const query = searchInput.value.trim().toLocaleLowerCase(locale);
  if (query.length < 2) {
    searchResults.innerHTML = "";
    searchCount.textContent = copy.searchShort;
    return;
  }
  try {
    const catalog = await getCatalog();
    const matches = catalog.products.filter((product) => [product.title, product.brand, product.description].filter(Boolean).join(" ").toLocaleLowerCase(locale).includes(query));
    searchCount.textContent = matches.length ? `${matches.length} ${copy.searchHits}` : copy.searchNone;
    searchResults.innerHTML = matches.map((product) => searchCard(product, catalog.currency)).join("");
  } catch {
    searchCount.textContent = copy.checkoutError;
  }
}
searchInput?.addEventListener("input", () => {
  clearTimeout(searchInput.timer);
  searchInput.timer = setTimeout(runSearch, 160);
});

document.querySelector("[data-contact-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const question = String(data.get("message") || "").trim();
  const errors = {
    name: name ? "" : copy.requiredName,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : copy.requiredEmail,
    message: question.length >= 10 ? "" : copy.requiredMessage,
  };
  for (const [field, text] of Object.entries(errors)) form.querySelector(`[data-error="${field}"]`).textContent = text;
  if (Object.values(errors).some(Boolean)) return;
  const body = [...data.entries()].filter(([, value]) => String(value).trim()).map(([key, value]) => `${key}: ${value}`).join("\n");
  location.href = `mailto:post@brewket.no?subject=${encodeURIComponent(`${copy.subject} ${name}`)}&body=${encodeURIComponent(body)}`;
});

if (location.pathname.endsWith("/order/complete/") || location.pathname.endsWith("/bestilling/fullfort/")) localStorage.removeItem(CART_KEY);
updateCartCount();
renderCart();
