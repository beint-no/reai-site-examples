const root = document.querySelector("[data-merchant-checkout]");
if (root) {
  const id = root.dataset.checkoutId;
  const state = { revision: Number(root.dataset.revision || 0), customer: {} };
  const form = root.querySelector("[data-merchant-form]");
  const delivery = root.querySelector("[data-merchant-delivery]");
  const error = root.querySelector("[data-merchant-error]");
  const nb = document.body.dataset.locale === "nb";
  const message = (en, no) => (nb ? no : en);
  const renderOptions = (payload) => {
    const options = payload.options || [];
    if (!options.length) {
      delivery.innerHTML = `<p>${message("No physical delivery option is configured for this cart.", "Denne handlekurven har ingen fysisk leveringsmåte konfigurert.")}</p>`;
      return;
    }
    delivery.innerHTML = options.map((option) => `<label class="merchant-option"><input type="radio" name="optionToken" value="${option.token}"><span><b>${option.name}</b><small>${option.description} · ${option.gross} NOK</small></span></label>`).join("");
    delivery.querySelectorAll("input").forEach((input) => input.addEventListener("change", () => loadPickup(input.value)));
  };
  const loadPickup = async (optionToken) => {
    try {
      const response = await fetch(`/reai/checkout/merchant/options?checkout=${encodeURIComponent(id)}&optionToken=${encodeURIComponent(optionToken)}`, { headers: { Accept: "application/json" } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Delivery options unavailable");
      renderOptions(payload);
    } catch (e) { error.textContent = e.message; }
  };
  const loadOptions = async () => {
    if (!state.customer.email) return;
    const response = await fetch("/reai/checkout/merchant/options", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ checkout: id, revision: state.revision, customer: state.customer }) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Delivery options unavailable");
    state.revision = payload.revision ?? state.revision;
    renderOptions(payload);
  };
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); error.textContent = "";
    state.customer = Object.fromEntries(new FormData(form).entries());
    try { await loadOptions(); } catch (e) { error.textContent = e.message; }
  });
  root.querySelector("[data-merchant-prepare]")?.addEventListener("click", async () => {
    error.textContent = "";
    try {
      const response = await fetch("/reai/checkout/merchant/prepare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ checkout: id, revision: state.revision }) });
      const payload = await response.json();
      if (!response.ok || !payload.paymentUrl) throw new Error(payload.error || "Payment could not be prepared");
      location.href = payload.paymentUrl;
    } catch (e) { error.textContent = e.message; }
  });
}
