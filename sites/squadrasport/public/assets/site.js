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
const galleryStage = gallery?.querySelector(".main-image");
const galleryStatus = gallery?.querySelector("[data-gallery-status]");
let displayedImage = gallery?.querySelector("[data-main-product-image]");
const thumbnails = [...(gallery?.querySelectorAll("[data-image-src]") || [])];
let activeImage = 0;
let displayedIndex = 0;
let imageRequest = 0;
let pendingImageEntry;
let galleryAnimations = [];
const preloadedImages = new Map();

const setGalleryStatus = (message) => {
  if (!galleryStatus) return;
  galleryStatus.textContent = message;
  galleryStatus.hidden = !message;
};

const cancelImageEntry = (entry) => {
  if (!entry || entry.ready || entry.canceled) return;
  entry.canceled = true;
  entry.image.removeAttribute("srcset");
  entry.image.removeAttribute("src");
};

const createImageEntry = (index, priority) => {
  const thumbnail = thumbnails[index];
  const thumbnailImage = thumbnail.querySelector("img");
  const image = document.createElement("img");
  image.alt = thumbnail.dataset.imageAlt || "";
  image.decoding = "async";
  image.fetchPriority = priority;
  if (thumbnailImage?.srcset) {
    image.srcset = thumbnailImage.srcset;
    image.sizes = "(max-width: 800px) 95vw, 48vw";
  }
  if (thumbnailImage?.width) image.width = thumbnailImage.width;
  if (thumbnailImage?.height) image.height = thumbnailImage.height;
  image.src = thumbnail.dataset.imageSrc;
  const entry = { image, ready: false, canceled: false };
  entry.promise = image.decode().then(
    () => {
      if (entry.canceled) return false;
      entry.ready = true;
      return true;
    },
    () => false,
  ).then((loaded) => {
    if (!loaded && preloadedImages.get(index) === entry) preloadedImages.delete(index);
    return loaded;
  });
  return entry;
};

const prepareNextImages = (index) => {
  if (thumbnails.length < 2) return;
  const nextIndices = Array.from(
    { length: Math.min(2, thumbnails.length - 1) },
    (_, offset) => (index + offset + 1) % thumbnails.length,
  );
  for (const [cachedIndex, entry] of preloadedImages) {
    if (nextIndices.includes(cachedIndex)) continue;
    cancelImageEntry(entry);
    preloadedImages.delete(cachedIndex);
  }
  const request = imageRequest;
  const preload = async () => {
    for (const nextIndex of nextIndices) {
      if (request !== imageRequest) return;
      let entry = preloadedImages.get(nextIndex);
      if (!entry) {
        entry = createImageEntry(nextIndex, "low");
        preloadedImages.set(nextIndex, entry);
      }
      await entry.promise;
    }
  };
  preload();
};

const showImage = async (index, direction = index >= activeImage ? 1 : -1) => {
  if (!displayedImage || !thumbnails.length) return;
  const nextIndex = (index + thumbnails.length) % thumbnails.length;
  activeImage = nextIndex;
  const request = ++imageRequest;
  const preparedImage = preloadedImages.get(nextIndex);
  preloadedImages.delete(nextIndex);
  if (pendingImageEntry !== preparedImage) cancelImageEntry(pendingImageEntry);
  pendingImageEntry = null;
  const keepNearbyPreloads = nextIndex === displayedIndex || preparedImage?.ready;
  const nearbyIndices = new Set([1, 2].map((step) => (nextIndex + step) % thumbnails.length));
  for (const [cachedIndex, entry] of preloadedImages) {
    if (entry.ready || (keepNearbyPreloads && nearbyIndices.has(cachedIndex))) continue;
    cancelImageEntry(entry);
    preloadedImages.delete(cachedIndex);
  }
  const thumbnail = thumbnails[nextIndex];
  thumbnails.forEach((item) => item.setAttribute("aria-pressed", String(item === thumbnail)));
  gallery.querySelector("[data-gallery-count]").textContent = `${nextIndex + 1} / ${thumbnails.length}`;
  const strip = gallery.querySelector(".image-thumbnails");
  const stripBounds = strip.getBoundingClientRect();
  const thumbnailBounds = thumbnail.getBoundingClientRect();
  strip.scrollBy({
    left: thumbnailBounds.left - stripBounds.left - (stripBounds.width - thumbnailBounds.width) / 2,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  });
  if (nextIndex === displayedIndex) {
    cancelImageEntry(preparedImage);
    setGalleryStatus("");
    prepareNextImages(nextIndex);
    return;
  }
  const imageEntry = preparedImage || createImageEntry(nextIndex, "high");
  imageEntry.image.fetchPriority = "high";
  pendingImageEntry = imageEntry;
  setGalleryStatus(imageEntry.ready ? "" : "Laster bilde …");
  const loaded = await imageEntry.promise;
  if (request !== imageRequest) return;
  pendingImageEntry = null;
  if (!loaded) {
    setGalleryStatus("Kunne ikke laste bildet. Velg et annet eller prøv igjen.");
    return;
  }
  setGalleryStatus("");

  galleryAnimations.forEach((animation) => animation.cancel());
  galleryStage.querySelectorAll("img").forEach((image) => {
    if (image !== displayedImage) image.remove();
  });
  const outgoingImage = displayedImage;
  outgoingImage.removeAttribute("data-main-product-image");
  outgoingImage.setAttribute("aria-hidden", "true");
  imageEntry.image.setAttribute("data-main-product-image", "");
  galleryStage.append(imageEntry.image);
  displayedImage = imageEntry.image;
  displayedIndex = nextIndex;

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    outgoingImage.remove();
    galleryAnimations = [];
  } else {
    const offset = direction >= 0 ? -100 : 100;
    const options = { duration: 260, easing: "cubic-bezier(.22,.61,.36,1)" };
    const animations = [
      outgoingImage.animate([{ transform: "translateX(0)" }, { transform: `translateX(${offset}%)` }], options),
      imageEntry.image.animate([{ transform: `translateX(${-offset}%)` }, { transform: "translateX(0)" }], options),
    ];
    galleryAnimations = animations;
    Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (galleryAnimations !== animations) return;
      outgoingImage.remove();
      galleryAnimations = [];
    });
  }
  prepareNextImages(nextIndex);
};

displayedImage?.decode().then(() => {
  if (imageRequest === 0) prepareNextImages(displayedIndex);
}).catch(() => {});

thumbnails.forEach((button) => button.addEventListener("click", () => showImage(thumbnails.indexOf(button))));
gallery?.querySelectorAll("[data-gallery-step]").forEach((button) => {
  button.addEventListener("click", () => {
    const step = Number(button.dataset.galleryStep);
    showImage(activeImage + step, step);
  });
});
gallery?.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  const step = event.key === "ArrowRight" ? 1 : -1;
  showImage(activeImage + step, step);
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
    const step = distanceX < 0 ? 1 : -1;
    showImage(activeImage + step, step);
  }
}, { passive: true });
gallery?.querySelector(".main-image")?.addEventListener("touchcancel", () => { touchStart = null; });

const collectionToolbar = document.querySelector("[data-collection-toolbar]");
const collectionGrid = document.querySelector("[data-collection-products] .product-grid");
const collectionCards = [...(collectionGrid?.querySelectorAll(".product-card") || [])];
if (collectionToolbar && collectionCards.length) {
  collectionToolbar.hidden = false;
  const priceFilter = collectionToolbar.querySelector("[data-price-filter]");
  const priceForm = collectionToolbar.querySelector("[data-price-form]");
  const minimumInput = priceForm.elements.min_price;
  const maximumInput = priceForm.elements.max_price;
  const priceError = collectionToolbar.querySelector("[data-price-error]");
  const priceSummary = collectionToolbar.querySelector("[data-price-summary]");
  const sortSelect = collectionToolbar.querySelector("[data-product-sort]");
  const productCount = collectionToolbar.querySelector("[data-product-count]");
  const filterEmpty = document.querySelector("[data-filter-empty]");
  const originalOrder = new Map(collectionCards.map((card, index) => [card, index]));
  const priceOf = (card) => card.hasAttribute("data-product-price") ? Number(card.dataset.productPrice) : null;
  const parsePrice = (value) => value !== null && value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0
    ? Number(value) : null;
  const initialUrl = new URL(location.href);
  let minimum = parsePrice(initialUrl.searchParams.get("min_price"));
  let maximum = parsePrice(initialUrl.searchParams.get("max_price"));
  if (minimum !== null && maximum !== null && minimum > maximum) {
    minimum = null;
    maximum = null;
  }
  minimumInput.value = minimum === null ? "" : String(minimum);
  maximumInput.value = maximum === null ? "" : String(maximum);
  if (![...sortSelect.options].some((option) => option.value === initialUrl.searchParams.get("sort_by"))) {
    sortSelect.value = "default";
  } else {
    sortSelect.value = initialUrl.searchParams.get("sort_by");
  }

  const updateCollection = () => {
    const sort = sortSelect.value;
    const sorted = [...collectionCards].sort((left, right) => {
      if (sort === "default") return originalOrder.get(left) - originalOrder.get(right);
      if (sort === "name-asc") {
        return left.querySelector("h3").textContent.localeCompare(right.querySelector("h3").textContent, "nb-NO");
      }
      const leftPrice = priceOf(left);
      const rightPrice = priceOf(right);
      if (leftPrice === null) return rightPrice === null ? originalOrder.get(left) - originalOrder.get(right) : 1;
      if (rightPrice === null) return -1;
      return (sort === "price-asc" ? leftPrice - rightPrice : rightPrice - leftPrice)
        || originalOrder.get(left) - originalOrder.get(right);
    });
    collectionGrid.replaceChildren(...sorted);
    let visible = 0;
    for (const card of collectionCards) {
      const price = priceOf(card);
      card.hidden = (minimum !== null || maximum !== null)
        && (price === null || minimum !== null && price < minimum || maximum !== null && price > maximum);
      if (!card.hidden) visible += 1;
    }
    productCount.textContent = `${visible} ${visible === 1 ? "produkt" : "produkter"}`;
    filterEmpty.hidden = visible !== 0;
    priceSummary.textContent = minimum !== null && maximum !== null ? `: ${money(minimum)}–${money(maximum)}`
      : minimum !== null ? `: fra ${money(minimum)}`
        : maximum !== null ? `: til ${money(maximum)}` : "";
    const url = new URL(location.href);
    if (minimum === null) url.searchParams.delete("min_price");
    else url.searchParams.set("min_price", String(minimum));
    if (maximum === null) url.searchParams.delete("max_price");
    else url.searchParams.set("max_price", String(maximum));
    if (sort === "default") url.searchParams.delete("sort_by");
    else url.searchParams.set("sort_by", sort);
    history.replaceState(null, "", url);
  };

  priceForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const nextMinimum = parsePrice(minimumInput.value);
    const nextMaximum = parsePrice(maximumInput.value);
    if (nextMinimum !== null && nextMaximum !== null && nextMinimum > nextMaximum) {
      priceError.textContent = "Fra-prisen må være lavere enn til-prisen.";
      priceError.hidden = false;
      return;
    }
    priceError.hidden = true;
    minimum = nextMinimum;
    maximum = nextMaximum;
    priceFilter.open = false;
    updateCollection();
  });
  collectionToolbar.querySelector("[data-price-reset]").addEventListener("click", () => {
    minimumInput.value = "";
    maximumInput.value = "";
    minimum = null;
    maximum = null;
    priceError.hidden = true;
    priceFilter.open = false;
    updateCollection();
  });
  sortSelect.addEventListener("change", updateCollection);
  updateCollection();
}

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
  const selected = Object.fromEntries(optionSelects.map((item) => [item.dataset.optionName, item.value]));
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
    checkoutButton.disabled = !items.length || checkoutPending;
    checkoutButton.textContent = "Gå til kassen";
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

checkoutButton?.addEventListener("click", async () => {
  if (checkoutPending) return;
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
