import { fashionStock, editFashionVariant } from "./fashion-cart-model.js";
import { installFashionZoom } from "./fashion-zoom.js";
import { installFashionGuides } from "./fashion-guide.js";
import {
  quantityControl,
  undoControl,
  rememberCartFocus,
  restoreCartFocus,
} from "./cart-controls.js";
// Explicit UI fixture. This script has no order, payment or newsletter mutation.
(async () => {
  const nb = document.body.dataset.locale === "nb",
    text = (a, b) => (nb ? a : b);
  const key = "reai-fashion-fixture-cart-v1";
  const colors = {
    brown: ["Brun", "Brown"],
    black: ["Svart", "Black"],
    grey: ["Grå", "Grey"],
    khaki: ["Khaki", "Khaki"],
  };
  const colorName = (key) => colors[key]?.[nb ? 0 : 1] || key;
  const money = (price) =>
    new Intl.NumberFormat(nb ? "nb-NO" : "en", {
      style: "currency",
      currency: "NOK",
      maximumFractionDigits: 0,
    }).format(price);
  const el = (tag, txt, cls) => {
    const e = document.createElement(tag);
    if (txt !== undefined) e.textContent = txt;
    if (cls) e.className = cls;
    return e;
  };
  let products;
  try {
    const r = await fetch("/assets/famme/catalog.json");
    if (!r.ok) throw new Error();
    const data = await r.json();
    if (data.fixture !== true) throw new Error();
    products = data.products;
  } catch {
    document
      .querySelectorAll("[data-fashion-quick], [data-fashion-add] button")
      .forEach((b) => (b.disabled = true));
    document
      .querySelector("main")
      .prepend(
        el(
          "p",
          text(
            "Testkatalogen kunne ikke lastes. Prøv igjen.",
            "The test catalog could not load. Try again.",
          ),
          "fashion-cart-disclosure",
        ),
      );
    return;
  }
  installFashionGuides(products, nb);
  installFashionZoom(nb);
  const find = (handle) => products.find((p) => p.handle === handle);
  const valid = (line) =>
    find(line.handle)?.colors.some((c) => c.key === line.color) &&
    find(line.handle)?.sizes.includes(line.size) &&
    Number.isInteger(line.quantity) &&
    line.quantity > 0 &&
    line.quantity <= 20;
  let cart = [],
    removed = null,
    cartOpener,
    quickOpener;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    if (Array.isArray(saved)) cart = saved.filter(valid).slice(0, 30);
  } catch {}
  const drawer = document.querySelector("[data-fashion-cart]"),
    quick = document.querySelector("[data-fashion-quick-dialog]");
  function save() {
    try {
      localStorage.setItem(key, JSON.stringify(cart));
    } catch {}
    renderCart();
  }
  const status = fashionStock;
  function renderCart() {
    const box = document.querySelector("[data-fashion-lines]");
    const focus = rememberCartFocus(box);
    box.replaceChildren();
    if (removed)
      box.append(
        undoControl(
          removed.label,
          () => {
            if (
              !cart.some(
                (x) =>
                  x.handle === removed.line.handle &&
                  x.color === removed.line.color &&
                  x.size === removed.line.size,
              )
            )
              cart.splice(removed.index, 0, removed.line);
            removed = null;
            save();
          },
          nb,
        ),
      );
    let total = 0;
    document
      .querySelectorAll("[data-fashion-count]")
      .forEach(
        (e) =>
          (e.textContent = String(cart.reduce((n, x) => n + x.quantity, 0))),
      );
    for (const line of cart) {
      const p = find(line.handle),
        row = el("article", undefined, "fashion-cart-line"),
        img = el("img");
      img.src = `/assets/famme/${p.colors.find((c) => c.key === line.color).image}.avif`;
      img.alt = p.title;
      row.append(img);
      const info = el("div");
      info.append(
        el("b", p.title),
        el(
          "small",
          `${colorName(line.color)} / ${line.size}${status(p, line.color, line.size) === "BACKORDER" ? text(" · Restordre", " · Backorder") : ""}`,
        ),
      );
      const key = line.handle + ":" + line.color + ":" + line.size;
      const removeLine = () => {
        removed = {
          line: { ...line },
          label: p.title,
          index: cart.indexOf(line),
        };
        cart = cart.filter((x) => x !== line);
        save();
      };
      const quantity = quantityControl(
        line.quantity,
        p.title,
        key,
        (n) => {
          if (n === 0) removeLine();
          else {
            line.quantity = n;
            save();
          }
        },
        nb,
      );
      const remove = el("button", text("Fjern", "Remove"), "fashion-remove");
      remove.type = "button";
      remove.dataset.cartFocus = key + ":remove";
      remove.addEventListener("click", removeLine);
      const edit = el('button', text('Endre variant', 'Edit variant'), 'fashion-remove');
      edit.type = 'button'; edit.dataset.cartFocus = key + ':edit';
      edit.setAttribute('aria-label', text('Endre variant for ', 'Edit variant for ') + p.title);
      edit.addEventListener('click', () => { quickOpener = edit; quickAdd(p, line.color, line.size, line); });
      if (status(p, line.color, line.size) === 'OUT_OF_STOCK') info.append(el('p', text('Denne varianten er utsolgt. Endre variant eller fjern varen.', 'This variant is sold out. Edit the variant or remove the item.'), 'fashion-cart-disclosure'));
      const actions = el('div', undefined, 'fashion-cart-actions'); actions.append(edit, remove);
      info.append(quantity, actions);
      row.append(info, el("strong", money(p.price * line.quantity)));
      box.append(row);
      total += p.price * line.quantity;
    }
    if (!cart.length)
      box.append(
        el(
          "p",
          text("Testkurven er tom.", "Your test cart is empty."),
          "cart-empty",
        ),
      );
    document.querySelector("[data-fashion-total]").textContent = money(total);
    restoreCartFocus(box, focus);
  }
  function bindForm(form, p, scope, editingLine) {
    const guide = el("button", text("Størrelsesguide", "Size guide"), "ux-guide-open");
    guide.type = "button"; guide.dataset.sizeGuide = p.handle;
    const sizeSet = form.querySelector("[name=size]").closest("fieldset");
    sizeSet.prepend(guide);
    function sync() {
      const data = new FormData(form),
        color = String(data.get("color")),
        size = String(data.get("size") || "");
      const image = scope.querySelector("[data-fashion-main-image] img");
      if (image) {
        image.src = `/assets/famme/${p.colors.find((c) => c.key === color).image}.avif`;
        image.alt = `${p.title} / ${colorName(color)}`;
      }
      scope
        .querySelectorAll("[data-fashion-image]")
        .forEach((b) =>
          b.setAttribute(
            "aria-pressed",
            String(
              b.dataset.fashionImage ===
                p.colors.find((c) => c.key === color).image,
            ),
          ),
        );
      form.querySelectorAll("[name=size]").forEach((input) => {
        input.disabled = status(p, color, input.value) === "OUT_OF_STOCK";
        if (input.disabled) input.checked = false;
        let statusLabel = input
          .closest("label")
          .querySelector("[data-size-status]");
        if (!statusLabel) {
          statusLabel = el("small");
          statusLabel.dataset.sizeStatus = "";
          input.closest("label").lastElementChild.append(statusLabel);
        }
        statusLabel.textContent = input.disabled
          ? text("Utsolgt", "Sold out")
          : status(p, color, input.value) === "BACKORDER"
            ? text("Restordre", "Backorder")
            : "";
        input.closest("label").title = input.disabled
          ? text("Utsolgt i denne varianten", "Sold out in this variant")
          : status(p, color, input.value) === "BACKORDER"
            ? text("Simulert restordre", "Simulated backorder")
            : "";
      });
      const selected = form.querySelector("[name=size]:checked");
      form.querySelector("button[type=submit]").disabled = !selected;
      form.querySelector("[data-fashion-stock-message]").textContent = !selected
        ? text(
            "Velg størrelse. Utsolgte varianter er deaktivert.",
            "Choose a size. Sold-out variants are disabled.",
          )
        : status(p, color, selected.value) === "BACKORDER"
          ? text(
              "Simulert restordre · kan legges i testkurven.",
              "Simulated backorder · can be added to the test cart.",
            )
          : text(
              "På lager i dette testscenarioet.",
              "In stock in this test scenario.",
            );
    }
    form.addEventListener("change", sync);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form),
        color = String(data.get("color")),
        size = String(data.get("size") || "");
      if (
        !p.sizes.includes(size) ||
        !p.colors.some((c) => c.key === color) ||
        status(p, color, size) === "OUT_OF_STOCK"
      )
        return;
      if (editingLine) {
        const updated = editFashionVariant(cart, cart.indexOf(editingLine), p, color, size);
        if (!updated) {
          form.querySelector('[data-fashion-stock-message]').textContent = text('Kan ikke oppdatere: varianten er utsolgt, eller samlet antall overstiger 20.', 'Cannot update: the variant is sold out or the combined quantity exceeds 20.');
          return;
        }
        cart = updated; removed = null; save(); quick.close();
        quickOpener = [...drawer.querySelectorAll('[data-cart-focus]')].find((b) => b.dataset.cartFocus === p.handle + ':' + color + ':' + size + ':edit');
        quickOpener?.focus();
        return;
      }
      const existing = cart.find(
        (x) => x.handle === p.handle && x.color === color && x.size === size,
      );
      if (existing) existing.quantity = Math.min(20, existing.quantity + 1);
      else if (cart.length < 30)
        cart.push({ handle: p.handle, color, size, quantity: 1 });
      else return;
      save();
      cartOpener = quick.open
        ? quickOpener
        : form.querySelector("button[type=submit]");
      quick.close();
      drawer.showModal();
    });
    sync();
  }
  function quickAdd(p, selectedColor, selectedSize, editingLine) {
    const content = document.querySelector("[data-fashion-quick-content]");
    content.replaceChildren();
    const photo = el("div");
    photo.dataset.fashionMainImage = "";
    const img = el("img");
    img.src = `/assets/famme/${p.colors[0].image}.avif`;
    img.alt = p.title;
    photo.append(img);
    content.append(photo, el("h3", p.title), el("strong", money(p.price)));
    if (editingLine) content.append(el('p', text('Antall beholdes: ', 'Quantity retained: ') + editingLine.quantity));
    const form = el("form");
    form.dataset.fashionAdd = p.handle;
    const colorSet = el("fieldset");
    colorSet.append(el("legend", text("Farge", "Color")));
    const colorBox = el("div", undefined, "fashion-color-options");
    for (const [i, c] of p.colors.entries()) {
      const label = el("label"),
        input = el("input");
      input.type = "radio";
      input.name = "color";
      input.value = c.key;
      input.checked = c.key === (selectedColor || p.colors[0].key);
      label.append(
        input,
        el("span", undefined, `fashion-swatch swatch-${c.key}`),
        el("span", colorName(c.key)),
      );
      colorBox.append(label);
    }
    colorSet.append(colorBox);
    const sizeSet = el("fieldset");
    sizeSet.append(el("legend", text("Størrelse", "Size")));
    const sizeBox = el("div", undefined, "fashion-size-options");
    for (const size of p.sizes) {
      const label = el("label"),
        input = el("input");
      input.type = "radio";
      input.name = "size";
      input.checked = size === selectedSize;
      input.value = size;
      input.required = true;
      label.append(input, el("span", size));
      sizeBox.append(label);
    }
    sizeSet.append(sizeBox);
    const message = el("p");
    message.dataset.fashionStockMessage = "";
    message.setAttribute("role", "status");
    const button = el(
      "button",
      editingLine ? text("Oppdater variant", "Update variant") : text("Legg i testkurven +", "Add to test cart +"),
      "fashion-button",
    );
    button.type = "submit";
    form.append(colorSet, sizeSet, message, button);
    content.append(form);
    bindForm(form, p, content, editingLine);
    quick.showModal();
  }
  const chosenVariant = new URL(location.href).searchParams.get("variant");
  const initialForm = document.querySelector("[data-fashion-add]");
  if (initialForm && chosenVariant) {
    const p = find(initialForm.dataset.fashionAdd);
    for (const color of p.colors)
      for (const size of p.sizes)
        if (chosenVariant === `fashion-${p.handle}-${color.key}-${size}`) {
          initialForm.querySelector(
            `[name=color][value="${color.key}"]`,
          ).checked = true;
          initialForm.querySelector(`[name=size][value="${size}"]`).checked =
            status(p, color.key, size) !== "OUT_OF_STOCK";
        }
  }
  document
    .querySelectorAll("[data-fashion-add]")
    .forEach((form) =>
      bindForm(
        form,
        find(form.dataset.fashionAdd),
        document.querySelector(".fashion-product-layout"),
      ),
    );
  document.querySelectorAll("[data-card-color]").forEach((button) =>
    button.addEventListener("click", () => {
      const card = button.closest("[data-fashion-card]");
      card
        .querySelectorAll("[data-card-color]")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      card.querySelector("img").src =
        `/assets/famme/${button.dataset.cardColor}.avif`;
      card.dataset.selectedColor = button.dataset.colorName;
      for (const link of card.querySelectorAll('a[href*="/products/"]')) {
        const url = new URL(link.href);
        url.searchParams.set(
          "variant",
          `fashion-${card.dataset.productId}-${button.dataset.colorName}-${card.dataset.selectedSize || find(card.dataset.productId).sizes[0]}`,
        );
        link.href = url.pathname + url.search;
      }
    }),
  );
  function syncFilteredCards() {
    document
      .querySelectorAll("[data-fashion-card][data-catalog-variant]")
      .forEach((card) => {
        const p = find(card.dataset.productId);
        const match = p.colors
          .flatMap((color) =>
            p.sizes.map((size) => ({
              color,
              size,
              id: `fashion-${p.handle}-${color.key}-${size}`,
            })),
          )
          .find((variant) => variant.id === card.dataset.catalogVariant);
        card.dataset.selectedSize = match?.size || "";
        card.dataset.selectedColor = match?.color.key || p.colors[0].key;
        const color = match?.color || p.colors[0];
        card.querySelector("img").src = `/assets/famme/${color.image}.avif`;
        card
          .querySelectorAll("[data-card-color]")
          .forEach((button) =>
            button.setAttribute(
              "aria-pressed",
              String(button.dataset.colorName === color.key),
            ),
          );
      });
  }
  document.addEventListener("reai:catalog-render", syncFilteredCards);
  syncFilteredCards();
  document.querySelectorAll("[data-fashion-quick]").forEach((button) =>
    button.addEventListener("click", () => {
      quickOpener = button;
      quickAdd(
        find(button.dataset.fashionQuick),
        button.closest("[data-fashion-card]")?.dataset.selectedColor,
        button.closest("[data-fashion-card]")?.dataset.selectedSize,
      );
    }),
  );
  document
    .querySelector("[data-fashion-cart-open]")
    .addEventListener("click", (e) => {
      cartOpener = e.currentTarget;
      drawer.showModal();
    });
  document
    .querySelector("[data-fashion-cart-close]")
    .addEventListener("click", () => drawer.close());
  document
    .querySelector("[data-fashion-quick-close]")
    .addEventListener("click", () => quick.close());
  drawer.addEventListener("close", () => cartOpener?.focus());
  quick.addEventListener("close", () => {
    quickOpener?.focus();
  });
  for (const dialog of [drawer, quick])
    dialog.addEventListener("click", (e) => {
      if (
        e.target === dialog &&
        e.clientX < dialog.getBoundingClientRect().left
      )
        dialog.close();
    });
  document.querySelectorAll("[data-fashion-image]").forEach((button) =>
    button.addEventListener("click", () => {
      const target = document.querySelector("[data-fashion-main-image] img");
      target.src = `/assets/famme/${button.dataset.fashionImage}.avif`;
      target.alt = button.querySelector("img").alt;
      document
        .querySelectorAll("[data-fashion-image]")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    }),
  );
  renderCart();
})();
