// Deliberately fictional checkout model. No storage, payment, email or API calls.
export function checkoutTotal(delivery, quantity) {
  if (
    !["shipping", "pickup"].includes(delivery) ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 20
  )
    return null;
  const subtotal = quantity * 100,
    shipping = delivery === "shipping" ? 49 : 0;
  return { subtotal, shipping, total: subtotal + shipping };
}
export function validateCheckout(input) {
  const errors = [];
  if (!input.name?.trim()) errors.push("name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email || ""))
    errors.push("email");
  if (input.business && !/^\d{9}$/.test(input.org || "")) errors.push("org");
  if (input.delivery === "shipping") {
    if (!input.address?.trim()) errors.push("address");
    if (!/^\d{4}$/.test(input.postal || "")) errors.push("postal");
    if (!input.city?.trim()) errors.push("city");
  }
  if (!checkoutTotal(input.delivery, Number(input.quantity)))
    errors.push("quantity");
  return errors;
}
export function checkoutOutcome(outcome, business = false) {
  if (outcome === "failed") return { state: "review", paid: false };
  if (outcome === "invoice" && !business)
    return { state: "review", paid: false };
  if (["paid", "pending", "invoice"].includes(outcome))
    return { state: outcome, paid: outcome === "paid" };
  return { state: "review", paid: false };
}
