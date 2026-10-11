import {
  checkoutTotal,
  validateCheckout,
  checkoutOutcome,
} from "./checkout-lab-model.js";
const root = document.querySelector("[data-checkout-lab]");
if (root) {
  const nb = document.body.dataset.locale === "nb",
    t = (a, b) => (nb ? a : b);
  const form = root.querySelector("[data-lab-form]"),
    review = root.querySelector("[data-lab-review]"),
    confirmation = root.querySelector("[data-lab-confirmation]");
  const input = () => {
    const v = Object.fromEntries(new FormData(form));
    return { ...v, business: form.elements.business.checked };
  };
  const amount = (n) =>
    new Intl.NumberFormat(nb ? "nb-NO" : "en", {
      style: "currency",
      currency: "NOK",
      maximumFractionDigits: 0,
    }).format(n);
  function refresh() {
    const v = input(),
      totals = checkoutTotal(v.delivery, Number(v.quantity));
    root.querySelector("[data-lab-address]").hidden = v.delivery === "pickup";
    root.querySelector("[data-lab-business]").hidden = !v.business;
    root.querySelector("[data-lab-invoice]").hidden = !v.business;
    if (
      !v.business &&
      root.querySelector("[name=outcome]:checked").value === "invoice"
    )
      root.querySelector("[name=outcome][value=paid]").checked = true;
    for (const key of ["subtotal", "shipping", "total"])
      root.querySelector(`[data-lab-${key}]`).textContent = totals
        ? amount(totals[key])
        : "—";
  }
  form.addEventListener("input", refresh);
  form.addEventListener("change", refresh);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const v = input(),
      errors = validateCheckout(v),
      box = root.querySelector("[data-lab-errors]");
    const messages = {
      name: t("Oppgi et navn.", "Enter a name."),
      email: t(
        "Oppgi en gyldig e-postadresse, for eksempel demo@example.invalid.",
        "Enter a valid email address, for example demo@example.invalid.",
      ),
      org: t(
        "Organisasjonsnummeret må ha 9 sifre.",
        "The organization number must contain 9 digits.",
      ),
      address: t(
        "Oppgi en gateadresse for levering.",
        "Enter a street address for delivery.",
      ),
      postal: t(
        "Oppgi et norsk postnummer med 4 sifre.",
        "Enter a Norwegian postal code with 4 digits.",
      ),
      city: t("Oppgi poststed.", "Enter a city."),
      quantity: t(
        "Velg et helt antall fra 1 til 20.",
        "Choose a whole quantity from 1 to 20.",
      ),
    };
    box.replaceChildren();
    box.hidden = !errors.length;
    for (const field of form.querySelectorAll("[data-field-error]")) {
      field.textContent = "";
      form.elements[field.dataset.fieldError].removeAttribute("aria-invalid");
    }
    for (const name of errors) {
      const field = form.elements[name],
        error = form.querySelector(`[data-field-error=${name}]`),
        label = field.closest("label").firstChild.textContent;
      error.textContent = messages[name];
      field.setAttribute("aria-invalid", "true");
      const link = document.createElement("a");
      link.href = "#" + (field.id || "");
      link.textContent = label;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        field.focus();
      });
      box.append(link);
    }
    if (errors.length) {
      box.focus();
      return;
    }
    root.querySelector("[data-lab-payment-error]").textContent = "";
    root.querySelector("[data-lab-review-text]").textContent =
      `${v.name} · ${v.email} · ${v.delivery === "pickup" ? t("Henting i Testgata 1, Oslo", "Pickup at Testgata 1, Oslo") : `${v.address}, ${v.postal} ${v.city}`} · ${v.quantity} × ${t("testprodukt", "test product")}`;
    form.hidden = true;
    review.hidden = false;
    review.focus();
  });
  root.querySelector("[data-lab-edit]").addEventListener("click", () => {
    review.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
  root.querySelector("[data-lab-pay]").addEventListener("click", () => {
    const outcome = root.querySelector("[name=outcome]:checked").value,
      state = checkoutOutcome(outcome, input().business).state;
    const error = root.querySelector("[data-lab-payment-error]");
    error.textContent = "";
    if (state === "review") {
      error.textContent = t(
        "Simulert betalingsfeil. Ingen betaling er gjort. Velg et annet utfall og prøv igjen.",
        "Simulated payment failure. No payment was made. Choose another outcome and retry.",
      );
      return;
    }
    const title = {
      paid: t("Betaling bekreftet (simulert)", "Payment confirmed (simulated)"),
      pending: t("Betaling avventer (simulert)", "Payment pending (simulated)"),
      invoice: t(
        "Fakturaordre · ubetalt (simulert)",
        "Invoice order · unpaid (simulated)",
      ),
    }[state];
    const note = {
      paid: t(
        "Neste steg: ordrebekreftelse og klargjøring.",
        "Next: order confirmation and preparation.",
      ),
      pending: t(
        "Ikke prøv å betale igjen før status er kontrollert. Ingen betalt ordre er bekreftet.",
        "Do not retry payment until status is checked. No paid order is confirmed.",
      ),
      invoice: t(
        "Neste steg: virksomheten behandler kredittordren og fakturerer. EHF krever eget oppsett.",
        "Next: the merchant processes the credit order and invoices. EHF requires separate configuration.",
      ),
    }[state];
    root.querySelector("[data-lab-confirm-title]").textContent = title;
    root.querySelector("[data-lab-confirm-text]").textContent = note;
    root.querySelector("[data-lab-confirm-details]").textContent =
      root.querySelector("[data-lab-review-text]").textContent;
    review.hidden = true;
    confirmation.hidden = false;
    confirmation.focus();
  });
  root.querySelector("[data-lab-reset]").addEventListener("click", () => {
    confirmation.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
  refresh();
}
