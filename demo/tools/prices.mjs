export function netPriceForDisplay(gross, rate) {
  if (
    !Number.isFinite(gross) ||
    gross <= 0 ||
    !Number.isFinite(rate) ||
    rate < 0 ||
    rate > 100
  )
    throw new Error("Invalid demo amount or VAT rate.");
  const grossCents = Math.round(gross * 100);
  const netCents = Math.round(grossCents / (1 + rate / 100));
  const vatCents = Math.round((netCents * rate) / 100);
  if (netCents + vatCents !== grossCents)
    throw new Error(
      "The requested displayed amount cannot be represented exactly at this VAT rate.",
    );
  return netCents / 100;
}
