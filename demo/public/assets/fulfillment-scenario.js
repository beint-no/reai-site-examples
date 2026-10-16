const root = document.querySelector("[data-fulfillment-lab]");
if (root) {
  const nb = document.body.dataset.locale === "nb";
  const pickup = root.querySelector("[value=pickup]");
  const details = root.querySelector("[data-pickup-details]");
  const message = root.querySelector("[data-fulfillment-message]");
  pickup?.addEventListener("change", () => { details.hidden = !pickup.checked; });
  root.querySelector("[data-bundle-add]")?.addEventListener("click", () => {
    const quantity = Number(root.querySelector("[data-bundle-quantity]").value || 1);
    message.textContent = quantity > 4
      ? (nb ? "Bare 4 pakker er tilgjengelige i dette simulerte komponentlageret." : "Only 4 bundles are available in this simulated component inventory.")
      : (nb ? `${quantity} pakke(r) lagt i testkurven. Ingen ordre er opprettet.` : `${quantity} bundle(s) added to the test cart. No order was created.`);
  });
}
