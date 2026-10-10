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
  const find = (handle) => products.find((p) => p.handle === handle);
  const valid = (line) =>
    find(line.handle)?.colors.some((c) => c.key === line.color) &&
    find(line.handle)?.sizes.includes(line.size) &&
    Number.isInteger(line.quantity) &&
    line.quantity > 0 &&
    line.quantity <= 20;
  let cart = [];
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
  function status(p, color, size) {
    return p.backorder[color]?.includes(size)
      ? "BACKORDER"
      : p.soldOut[color]?.includes(size)
        ? "OUT_OF_STOCK"
        : "AVAILABLE";
  }
  function renderCart() {
    const box = document.querySelector("[data-fashion-lines]");
    box.replaceChildren();
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
      const quantity = el("div", undefined, "cart-quantity");
      for (const [delta, label] of [
        [-1, "−"],
        [1, "+"],
      ]) {
        const b = el("button", label);
        b.type = "button";
        b.setAttribute(
          "aria-label",
          `${delta < 0 ? text("Reduser", "Decrease") : text("Øk", "Increase")} ${p.title}`,
        );
        b.disabled = delta < 0 ? line.quantity <= 1 : line.quantity >= 20;
        b.addEventListener("click", () => {
          line.quantity += delta;
          save();
        });
        quantity.append(b);
        if (delta === -1) quantity.append(el("span", String(line.quantity)));
      }
      const remove = el("button", text("Fjern", "Remove"), "fashion-remove");
      remove.type = "button";
      remove.setAttribute(
        "aria-label",
        `${text("Fjern", "Remove")} ${p.title}`,
      );
      remove.addEventListener("click", () => {
        cart = cart.filter((x) => x !== line);
        save();
      });
      info.append(quantity, remove);
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
  }
  function bindForm(form, p, scope) {
    function sync() {
      const data = new FormData(form),
        color = String(data.get("color")),
        size = String(data.get("size") || "");
      const image = scope.querySelector("[data-fashion-main-image] img");
      if (image) {
        image.src = `/assets/famme/${p.colors.find((c) => c.key === color).image}.avif`;
        image.alt = `${p.title} / ${colorName(color)}`;
      }
      form.querySelectorAll("[name=size]").forEach((input) => {
        input.disabled = status(p, color, input.value) === "OUT_OF_STOCK";
        if (input.disabled) input.checked = false;
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
      const existing = cart.find(
        (x) => x.handle === p.handle && x.color === color && x.size === size,
      );
      if (existing) existing.quantity = Math.min(20, existing.quantity + 1);
      else if (cart.length < 30)
        cart.push({ handle: p.handle, color, size, quantity: 1 });
      else return;
      save();
      quick.close();
      drawer.showModal();
    });
    sync();
  }
  function quickAdd(p, selectedColor) {
    const content = document.querySelector("[data-fashion-quick-content]");
    content.replaceChildren();
    const photo = el("div");
    photo.dataset.fashionMainImage = "";
    const img = el("img");
    img.src = `/assets/famme/${p.colors[0].image}.avif`;
    img.alt = p.title;
    photo.append(img);
    content.append(photo, el("h3", p.title), el("strong", money(p.price)));
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
      text("Legg i testkurven +", "Add to test cart +"),
      "fashion-button",
    );
    button.type = "submit";
    form.append(colorSet, sizeSet, message, button);
    content.append(form);
    bindForm(form, p, content);
    quick.showModal();
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
    }),
  );
  document
    .querySelectorAll("[data-fashion-quick]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        quickAdd(
          find(button.dataset.fashionQuick),
          button.closest("[data-fashion-card]").dataset.selectedColor,
        ),
      ),
    );
  document
    .querySelector("[data-fashion-cart-open]")
    .addEventListener("click", () => drawer.showModal());
  document
    .querySelector("[data-fashion-cart-close]")
    .addEventListener("click", () => drawer.close());
  document
    .querySelector("[data-fashion-quick-close]")
    .addEventListener("click", () => quick.close());
  for (const dialog of [drawer, quick])
    dialog.addEventListener("click", (e) => {
      if (
        e.target === dialog &&
        e.clientX < dialog.getBoundingClientRect().left
      )
        dialog.close();
    });
  const grid = document.querySelector("[data-fashion-grid]");
  if (grid) {
    const search = document.querySelector("[data-fashion-search]"),
      stock = document.querySelector("[data-fashion-stock]"),
      sort = document.querySelector("[data-fashion-sort]"),
      cards = Array.from(grid.children);
    function filter() {
      let count = 0;
      for (const card of cards) {
        const p = find(
          card.querySelector("[data-fashion-quick]").dataset.fashionQuick,
        );
        card.hidden =
          !p.title.toLowerCase().includes(search.value.trim().toLowerCase()) ||
          (stock.value !== "all" &&
            !p.colors.some(
              (c) => status(p, c.key, stock.value) !== "OUT_OF_STOCK",
            ));
        if (!card.hidden) count++;
      }
      const ordered =
        sort.value === "featured"
          ? cards
          : [...cards].sort((a, b) =>
              sort.value === "asc"
                ? Number(a.dataset.price) - Number(b.dataset.price)
                : Number(b.dataset.price) - Number(a.dataset.price),
            );
      ordered.forEach((card) => grid.append(card));
      document.querySelector("[data-fashion-empty]").hidden = count > 0;
      document.querySelector("[data-fashion-results]").textContent =
        `${count} ${count === 1 ? text("produkt vist", "product shown") : text("produkter vist", "products shown")}`;
    }
    search.addEventListener("input", filter);
    stock.addEventListener("change", filter);
    sort.addEventListener("change", filter);
    filter();
  }
  renderCart();
})();
