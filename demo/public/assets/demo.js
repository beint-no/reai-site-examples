const lang = document.body.dataset.locale,
  nb = lang === "nb",
  key = "reai-demo-cart-v1";
let cart;
try {
  cart = JSON.parse(localStorage.getItem(key) || "[]");
  if (!Array.isArray(cart)) cart = [];
} catch {
  cart = [];
}
cart = cart
  .filter(
    (l) =>
      typeof l.variantId === "string" &&
      Number.isInteger(l.quantity) &&
      l.quantity > 0 &&
      l.quantity <= 20,
  )
  .slice(0, 30);
function save() {
  try {
    localStorage.setItem(key, JSON.stringify(cart));
  } catch {}
  document.dispatchEvent(new CustomEvent("reai:cart-change"));
  document
    .querySelectorAll("[data-cart-count]")
    .forEach(
      (e) => (e.textContent = String(cart.reduce((s, l) => s + l.quantity, 0))),
    );
}
function el(tag, text, cls) {
  const e = document.createElement(tag);
  if (text) e.textContent = text;
  if (cls) e.className = cls;
  return e;
}
const format = (p, c = "NOK") =>
  new Intl.NumberFormat(nb ? "nb-NO" : "en", {
    style: "currency",
    currency: c,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(p);
document.querySelector(".menu-toggle")?.addEventListener("click", (e) => {
  const open = document.querySelector(".header").classList.toggle("menu-open");
  e.currentTarget.setAttribute("aria-expanded", String(open));
});
document.querySelectorAll("[data-add-to-cart]").forEach((form) =>
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form),
      id = String(data.get("variantId")),
      quantity = Number(data.get("quantity"));
    if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 20)
      return;
    const line = cart.find((l) => l.variantId === id);
    if (line) line.quantity = Math.min(20, line.quantity + quantity);
    else if (cart.length < 30) cart.push({ variantId: id, quantity });
    save();
    form.querySelector("[data-add-message]").textContent = nb
      ? "Lagt i handlekurven."
      : "Added to cart.";
    liveDrawer?.showModal();
    refreshDrawer();
  }),
);
document.querySelector("[data-search]")?.addEventListener("input", (e) => {
  const term = e.target.value.toLocaleLowerCase();
  let count = 0;
  document.querySelectorAll(".product-card").forEach((card) => {
    card.hidden = !card.textContent.toLocaleLowerCase().includes(term);
    if (!card.hidden) count++;
  });
  document.querySelector("[data-search-empty]").hidden = count > 0;
});
let catalog;
async function renderCart() {
  const box = document.querySelector("[data-cart-lines]");
  if (!box) return;
  try {
    const response = await fetch("/reai/catalog");
    if (!response.ok) throw new Error();
    catalog = await response.json();
    box.replaceChildren();
    let total = 0;
    for (const line of cart) {
      const product = catalog.products.find((p) =>
        p.variants.some((v) => v.id === line.variantId),
      );
      if (!product) continue;
      const variant = product.variants.find((v) => v.id === line.variantId);
      total += Number(variant.price) * line.quantity;
      const row = el("article", null, "cart-row");
      const img = el("img");
      const handle = product.handle || "",
        art = handle.includes("gavekort")
          ? "gift"
          : handle.includes("greg")
            ? "mug"
            : handle.includes("zen")
              ? "cloud"
              : handle.includes("konfetti")
                ? "confetti"
                : handle.includes("mandag")
                  ? "sun"
                  : "heart";
      img.src = product.images?.[0]?.url || `/assets/${art}.svg`;
      img.alt = product.title;
      row.append(img);
      const details = el("div");
      details.append(
        el("h2", product.title),
        el(
          "p",
          variant.options?.map((o) => o.value).join(" / ") || variant.sku,
        ),
        el("p", format(variant.price, catalog.currency)),
      );
      const remove = el("button", nb ? "Fjern" : "Remove");
      remove.type = "button";
      remove.addEventListener("click", () => {
        cart = cart.filter((l) => l !== line);
        save();
        renderCart();
      });
      details.append(remove);
      row.append(details);
      const quantity = el("input");
      quantity.type = "number";
      quantity.min = "1";
      quantity.max = "20";
      quantity.value = String(line.quantity);
      quantity.setAttribute(
        "aria-label",
        `${nb ? "Antall" : "Quantity"} ${product.title}`,
      );
      quantity.addEventListener("change", () => {
        const n = Number(quantity.value);
        if (Number.isInteger(n) && n > 0 && n <= 20) {
          line.quantity = n;
          save();
          renderCart();
        }
      });
      row.append(quantity);
      box.append(row);
    }
    if (!box.childElementCount)
      box.append(
        el(
          "p",
          nb
            ? "Handlekurven trenger litt personlighet."
            : "Your cart could use a little personality.",
          "cart-empty",
        ),
      );
    document.querySelector("[data-cart-total]").textContent = format(
      total,
      catalog.currency,
    );
    document.querySelector("[data-checkout]").disabled =
      !cart.length || document.body.dataset.paymentMode === "disabled";
  } catch {
    box.replaceChildren(
      el(
        "p",
        nb
          ? "Katalogen er midlertidig utilgjengelig. Prøv igjen om litt."
          : "Catalog temporarily unavailable. Please try again.",
      ),
    );
    document.querySelector("[data-checkout]").disabled = true;
  }
}
let pendingKey = null,
  pendingSignature = null;
document
  .querySelector("[data-checkout]")
  ?.addEventListener("click", async (e) => {
    const button = e.currentTarget,
      message = document.querySelector("[data-checkout-message]");
    button.disabled = true;
    message.textContent = nb
      ? "Åpner ReAI checkout…"
      : "Opening ReAI checkout…";
    const signature = JSON.stringify(cart);
    if (signature !== pendingSignature) {
      pendingSignature = signature;
      pendingKey = crypto.randomUUID();
    }
    try {
      const response = await fetch("/reai/checkout/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": pendingKey,
        },
        body: JSON.stringify({ lines: cart }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          response.status === 409
            ? nb
              ? "En variant er ikke tilgjengelig. Endre kurven og prøv igjen."
              : "An item is unavailable. Update your cart and try again."
            : data.error ||
                (nb
                  ? "Checkout kunne ikke åpnes."
                  : "Checkout could not be opened."),
        );
      const destination = new URL(data.checkoutUrl);
      if (
        destination.protocol !== "https:" ||
        destination.origin !==
          (document.body.dataset.checkoutOrigin || "https://app.reai.no")
      )
        throw new Error("Unexpected checkout destination");
      window.location.assign(destination.href);
    } catch (error) {
      message.textContent = error.message;
      button.disabled = false;
    }
  });
document
  .querySelector("[data-api-explorer]")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    await populateApiSample(form);
    const data = new FormData(form),
      endpoint = data.get("endpoint"),
      resource = String(data.get("resource") || ""),
      output = document.querySelector("[data-api-output]");
    output.textContent = "Loading…";
    try {
      const response = await fetch(
        `/reai/${encodeURIComponent(endpoint)}?resource=${encodeURIComponent(resource)}`,
      );
      output.textContent = `HTTP ${response.status}\n\n${JSON.stringify(await response.json(), null, 2)}`;
    } catch {
      output.textContent = "Temporarily unavailable";
    }
  });
save();
renderCart();

const apiForm = document.querySelector("[data-api-explorer]");
if (apiForm) {
  const params = new URL(location.href).searchParams;
  const product = params.get("product");
  const endpoint = product ? "product" : params.get("endpoint");
  const resource = product || params.get("resource") || "";
  const select = apiForm.querySelector('[name="endpoint"]');
  if (Array.from(select.options).some((option) => option.value === endpoint)) {
    select.value = endpoint;
    apiForm.querySelector('[name="resource"]').value = resource.slice(0, 4000);
  }
}

async function populateApiSample(form) {
  const endpoint = form.querySelector('[name="endpoint"]').value;
  const resource = form.querySelector('[name="resource"]');
  if (resource.value.trim()) return;
  if (endpoint === "product") resource.value = "heia-reai";
  if (endpoint === "collection") resource.value = "alle-demo-objekter";
  if (["availability", "availabilities"].includes(endpoint)) {
    try {
      const response = await fetch("/reai/products");
      if (!response.ok) return;
      const data = await response.json();
      const variants = data.products.flatMap((p) =>
        p.variants.map((v) => v.id),
      );
      resource.value =
        endpoint === "availability"
          ? variants[0] || ""
          : variants.slice(0, 2).join(",");
    } catch {
      /* The explorer displays the resulting HTTP error if sample lookup fails. */
    }
  }
}

const liveDrawer = document.querySelector("[data-cart-drawer]");
let drawerRequest = 0;
async function refreshDrawer() {
  if (!liveDrawer?.open) return;
  const version = ++drawerRequest;
  const target = document.querySelector("[data-drawer-lines]");
  target.textContent = nb ? "Henter katalogen…" : "Loading catalog…";
  const totalBox = document.querySelector("[data-drawer-total]");
  if (totalBox) totalBox.textContent = cart.length ? "—" : format(0);
  if (!cart.length) {
    target.textContent = nb ? "Handlekurven er tom." : "Your cart is empty.";
    return;
  }
  try {
    const result = await fetch("/reai/catalog");
    if (!result.ok) throw new Error();
    const catalog = await result.json();
    if (version !== drawerRequest) return;
    let total = 0;
    let totalKnown = true;
    target.innerHTML = cart
      .map((line) => {
        const product = catalog.products.find((p) =>
          p.variants.some((v) => v.id === line.variantId),
        );
        const variant = product?.variants.find((v) => v.id === line.variantId);
        if (variant) total += Number(variant.price) * line.quantity;
        else totalKnown = false;
        return `<article class="drawer-line"><div><b>${esc(product?.title || (nb ? "Utilgjengelig produkt" : "Unavailable product"))}</b><small>${esc(variant?.options?.map((o) => o.value).join(" / ") || "")}</small><div class="cart-quantity"><button data-drawer-quantity="${esc(line.variantId)}" data-delta="-1" aria-label="${nb ? "Reduser" : "Decrease"} ${esc(product?.title || "")}" ${line.quantity <= 1 ? "disabled" : ""}>−</button><span>${line.quantity}</span><button data-drawer-quantity="${esc(line.variantId)}" data-delta="1" aria-label="${nb ? "Øk" : "Increase"} ${esc(product?.title || "")}" ${line.quantity >= 20 ? "disabled" : ""}>+</button></div><button data-drawer-remove="${esc(line.variantId)}">${nb ? "Fjern" : "Remove"}</button></div><span>${variant ? esc(format(Number(variant.price) * line.quantity, catalog.currency)) : ""}</span></article>`;
      })
      .join("");
    if (totalBox)
      totalBox.textContent = totalKnown ? format(total, catalog.currency) : "—";
    target.querySelectorAll("[data-drawer-quantity]").forEach((button) =>
      button.addEventListener("click", () => {
        const line = cart.find(
          (line) => line.variantId === button.dataset.drawerQuantity,
        );
        if (!line) return;
        line.quantity = Math.max(
          1,
          Math.min(20, line.quantity + Number(button.dataset.delta)),
        );
        save();
        renderCart();
      }),
    );
    target.querySelectorAll("[data-drawer-remove]").forEach((button) =>
      button.addEventListener("click", () => {
        cart = cart.filter(
          (line) => line.variantId !== button.dataset.drawerRemove,
        );
        save();
        renderCart();
      }),
    );
  } catch {
    target.textContent = nb
      ? "Katalogen er midlertidig utilgjengelig. Prøv igjen."
      : "The catalog is temporarily unavailable. Try again.";
  }
}
document.querySelector("[data-cart-open]")?.addEventListener("click", () => {
  liveDrawer.showModal();
  refreshDrawer();
});
document
  .querySelector("[data-cart-close]")
  ?.addEventListener("click", () => liveDrawer.close());
document.addEventListener("reai:cart-change", refreshDrawer);
liveDrawer?.addEventListener("click", (e) => {
  if (
    e.target === liveDrawer &&
    e.clientX < liveDrawer.getBoundingClientRect().left
  )
    liveDrawer.close();
});

function esc(value) {
  return String(value).replace(
    /[&<>"\']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "\'": "&#39;",
      })[c],
  );
}

document.querySelector(".header nav")?.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    document.querySelector(".header").classList.remove("menu-open");
    document
      .querySelector(".menu-toggle")
      .setAttribute("aria-expanded", "false");
  }
});
