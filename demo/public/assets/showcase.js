(() => {
  const nb = document.body.dataset.locale === "nb";
  const text = (a, b) => (nb ? a : b);
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  document
    .querySelector("[data-newsletter]")
    ?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget,
        button = form.querySelector("button"),
        message = form.querySelector("[data-newsletter-message]");
      if (!form.reportValidity()) return;
      button.disabled = true;
      message.textContent = text("Lagrer samtykket…", "Recording consent…");
      const fields = new FormData(form);
      try {
        const response = await fetch("/reai/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: fields.get("email"),
            consent: fields.get("consent") === "on",
            website: fields.get("website"),
          }),
        });
        const result = await response.json();
        if (!response.ok || result.accepted !== true) throw new Error();
        message.textContent = text(
          "Takk! Samtykket er registrert hos Better Integration. Ingen e-post sendes automatisk.",
          "Thank you! Consent is recorded with Better Integration. No email is sent automatically.",
        );
        form.reset();
      } catch {
        message.textContent = text(
          "Påmeldingen kunne ikke lagres. Prøv igjen senere. Lokal forhåndsvisning lagrer ikke samtykke.",
          "Signup could not be recorded. Try again later. Offline preview does not record consent.",
        );
      } finally {
        button.disabled = false;
      }
    });
  const page = document.querySelector("[data-scenario]");
  if (!page) return;
  const style = page.dataset.scenario,
    supply = style === "supply",
    form = page.querySelector("[data-scenario-add]"),
    state = page.querySelector("[data-scenario-state]"),
    drawer = document.querySelector("[data-scenario-drawer]");
  const key = `reai-ui-scenario-${style}-v1`,
    sizes = supply ? ["25L", "35L", "45L"] : ["S", "M", "L", "XL"],
    colors = supply ? ["Forest", "Black", "Sand"] : ["Navy", "Cream", "Green"],
    price = supply ? 1299 : 349;
  let cart = [];
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    if (Array.isArray(saved))
      cart = saved
        .filter(
          (x) =>
            colors.includes(x.color) &&
            sizes.includes(x.size) &&
            Number.isInteger(x.quantity) &&
            x.quantity > 0 &&
            x.quantity <= 20,
        )
        .slice(0, 30);
  } catch {}
  function selected() {
    const fields = new FormData(form);
    return {
      color: String(fields.get("color") || colors[0]),
      size: String(fields.get("size") || ""),
      quantity: Number(fields.get("quantity")),
    };
  }
  function status(item, validation = false) {
    if (state.value === "soldout" || (state.value === "changed" && validation))
      return "OUT_OF_STOCK";
    if (
      ["mixed", "backorder"].includes(state.value) &&
      ((supply && item.color === "Sand") ||
        item.size === (supply ? "35L" : "L"))
    )
      return "OUT_OF_STOCK";
    return "AVAILABLE";
  }
  function canBuy(item, validation = false) {
    return (
      status(item, validation) === "AVAILABLE" || state.value === "backorder"
    );
  }
  function sync() {
    let item = selected();
    form.querySelectorAll("[name=size]").forEach((input) => {
      const available = canBuy({ ...item, size: input.value });
      input.disabled = !available;
      form.querySelector(`[data-size-status="${input.value}"]`).textContent =
        !available
          ? text("Utsolgt", "Sold out")
          : state.value === "backorder" &&
              status({ ...item, size: input.value }) === "OUT_OF_STOCK"
            ? text("Restordre", "Backorder")
            : "";
    });
    const checked = form.querySelector("[name=size]:checked");
    if (!checked || checked.disabled) {
      if (checked) checked.checked = false;
      const first = form.querySelector("[name=size]:not(:disabled)");
      if (first) first.checked = true;
    }
    item = selected();
    const image = page.querySelector(".scenario-image img");
    const suffix =
      { Cream: "-cream", Green: "-green", Black: "-black", Sand: "-sand" }[
        item.color
      ] || "";
    image.src = `/assets/${style}${suffix}.jpg`;
    image.alt = `${supply ? "Field pack" : "Essential crewneck"} / ${item.color}`;

    page.querySelector("[data-scenario-availability]").textContent = !item.size
      ? text("Ingen varianter tilgjengelig.", "No variants available.")
      : status(item) === "OUT_OF_STOCK"
        ? text(
            "Restordre — fortsett ved utsolgt er aktivert i dette scenarioet.",
            "Backorder — continue when sold out is enabled in this scenario.",
          )
        : text(
            "På lager i dette testscenarioet.",
            "Available in this test scenario.",
          );
    page.querySelector("[data-scenario-submit]").disabled = !item.size;
    page.querySelector("[data-scenario-message]").textContent = "";
    document.querySelector("[data-scenario-validation]").textContent = "";
  }
  function save() {
    try {
      localStorage.setItem(key, JSON.stringify(cart));
    } catch {}
    document.querySelectorAll("[data-scenario-count]").forEach((element) => {
      element.textContent = String(cart.reduce((n, x) => n + x.quantity, 0));
    });
    document.querySelector("[data-scenario-lines]").innerHTML = cart.length
      ? cart
          .map(
            (x, i) =>
              `<article class="drawer-line"><div><b>${supply ? "Field pack 25L" : "Essential crewneck"}</b><small>${escape(x.color)} / ${escape(x.size)} · ${x.quantity} ${text("stk.", "items")}</small><button data-scenario-remove="${i}">${text("Fjern", "Remove")}</button></div><strong>${new Intl.NumberFormat(nb ? "nb-NO" : "en", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(price * x.quantity)}</strong></article>`,
          )
          .join("")
      : text("Testkurven er tom.", "The scenario cart is empty.");
    document.querySelectorAll("[data-scenario-remove]").forEach((button) =>
      button.addEventListener("click", () => {
        cart.splice(Number(button.dataset.scenarioRemove), 1);
        save();
        document.querySelector("[data-scenario-validation]").textContent = "";
      }),
    );
    document.querySelector("[data-scenario-total]").textContent =
      new Intl.NumberFormat(nb ? "nb-NO" : "en", {
        style: "currency",
        currency: "NOK",
        maximumFractionDigits: 0,
      }).format(cart.reduce((n, x) => n + x.quantity * price, 0));
    document.querySelector("[data-scenario-validate]").disabled = !cart.length;
  }
  form.addEventListener("change", sync);
  state.addEventListener("change", sync);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const item = selected();
    if (
      !item.size ||
      !canBuy(item) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 20
    )
      return;
    const existing = cart.find(
      (x) => x.color === item.color && x.size === item.size,
    );
    if (existing)
      existing.quantity = Math.min(20, existing.quantity + item.quantity);
    else cart.push(item);
    save();
    drawer.showModal();
  });
  document
    .querySelector("[data-scenario-header-open]")
    ?.addEventListener("click", () => drawer.showModal());
  page
    .querySelector("[data-scenario-cart-open]")
    .addEventListener("click", () => drawer.showModal());
  document
    .querySelector("[data-scenario-cart-close]")
    .addEventListener("click", () => drawer.close());
  document
    .querySelector("[data-scenario-validate]")
    .addEventListener("click", () => {
      const invalid = cart.some((item) => !canBuy(item, true));
      document.querySelector("[data-scenario-validation]").textContent = invalid
        ? text(
            "409 / En variant er nå utsolgt. Kurven beholdes; fjern eller endre varen før et nytt forsøk.",
            "409 / A variant is now sold out. Your cart is retained; remove or change the item before retrying.",
          )
        : text(
            "200 / Testkurven er gyldig. I en ekte butikk ville ReAI opprettet en checkout. Her opprettes ingen ordre eller betaling.",
            "200 / The scenario cart is valid. A real store would create a ReAI checkout. No order or payment is created here.",
          );
    });
  drawer.addEventListener("click", (e) => {
    if (e.target === drawer && e.clientX < drawer.getBoundingClientRect().left)
      drawer.close();
  });
  sync();
  save();
})();
