// Small original fixtures, separate from the live ReAI catalog.
export const discoveryProducts = [
  { id: "nord-home", title: "Nord Hjem", type: "Termokopp", aliases: ["insulated mug", "travel cup", "termokopp", "leakproof", "lekkasjesikker"], price: 199, variants: [
    { sku: "NORD-01-B", values: ["blue", "blå", "350", "ml"] },
    { sku: "NORD-01-G", values: ["green", "grønn", "350", "ml"] }] },
  { id: "nord-trail", title: "Nord Tur", type: "Termokopp", aliases: ["insulated mug", "travel cup", "termokopp", "leakproof", "lekkasjesikker"], price: 249, variants: [
    { sku: "NORD-02", values: ["blue", "blå", "500", "ml"] },
    { sku: "NORD-03", values: ["green", "grønn", "350", "ml"] }] },
  { id: "daily-bottle", title: "Dag Flaske", type: "Drikkeflaske", aliases: ["bottle", "flaske", "drikkeflaske"], price: 99, variants: [
    { sku: "DAG-01", values: ["blue", "blå", "500", "ml"] }] },
];
export const discoveryHelp = [
  { title: ["Retur og bytte", "Returns and exchanges"], query: ["retur", "returns"], aliases: ["retur", "returns", "return policy", "bytte", "exchange"], href: "/ux/product-sections/", body: ["Et hjelpesøk skal gi et innholdssvar. I en ekte butikk peker denne lenken til selgerens returvilkår.", "A help search should return content. In a real store this link leads to the merchant’s return policy."] },
  { title: ["Levering og henting", "Delivery and pickup"], query: ["levering", "delivery"], aliases: ["frakt", "shipping", "delivery", "levering", "henting", "pickup"], href: "/ux/delivery-dates/", body: ["Her går du til leveringskonseptet og checkout-laben. Det finnes ingen virkelig frakttjeneste for disse testproduktene.", "This leads to the delivery concept and checkout lab. These fixture products have no actual shipping service."] },
];
export const normalizedQuery = (s) => String(s || "").slice(0, 120).trim().normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
const words = (s) => normalizedQuery(s).split(/\s+/).filter(Boolean);
export function searchDiscovery(query) {
  const tokens = words(query);
  const products = discoveryProducts.flatMap((p) => {
    const base = [p.title, p.type, ...p.aliases].join(" ");
    const variants = p.variants.filter((v) => {
      const text = normalizedQuery([base, v.sku, ...v.values].join(" "));
      return tokens.every((token) => text.includes(token));
    });
    return variants.length ? [{ ...p, variants }] : [];
  });
  const help = tokens.length ? discoveryHelp.filter((item) => {
    const text = normalizedQuery(item.aliases.join(" "));
    return tokens.every((token) => text.includes(token));
  }) : [];
  return { products, help };
}
export function discoverySuggestions(query, locale = "nb") {
  const q = normalizedQuery(query);
  if (!q) return [];
  return [...new Set([
    ...discoveryProducts.map((p) => p.title),
    ...discoveryProducts.map((p) => p.type),
    ...discoveryHelp.map((item) => item.query[locale === "nb" ? 0 : 1]),
  ])].filter((s) => normalizedQuery(s).includes(q)).slice(0, 6);
}
export const packs = [
  { id: "pack-4", title: ["4 kopper", "4 mugs"], price: 120, count: 4 },
  { id: "pack-8", title: ["8 kopper", "8 mugs"], price: 216, count: 8 },
  { id: "pack-12", title: ["12 kopper", "12 mugs"], price: 300, count: 12 },
];
export function unitPrice(price, count) {
  return Number.isFinite(price) && price >= 0 && Number.isFinite(count) && count > 0 ? price / count : null;
}
export const machines = [
  { id: "mini", name: "Kvern Mini", price: 1290, power: 120, capacity: 150, weight: 1.2, voltage: 230 },
  { id: "home", name: "Kvern Hjem", price: 1790, power: 180, capacity: 250, weight: 1.8, voltage: 230 },
  { id: "pro", name: "Kvern Pro", price: 2990, power: 250, capacity: 400, weight: null, voltage: 230 },
];
export const specRows = [
  { key: "price", label: ["Pris (NOK)", "Price (NOK)"], unit: "" },
  { key: "power", label: ["Effekt", "Power"], unit: "W" },
  { key: "capacity", label: ["Beholder", "Hopper"], unit: "g" },
  { key: "weight", label: ["Vekt", "Weight"], unit: "kg" },
  { key: "voltage", label: ["Spenning", "Voltage"], unit: "V" },
];
export function comparisonRows(selected, differencesOnly = false) {
  return specRows.filter((row) => !differencesOnly || row.key === "price" || new Set(selected.map((p) => p[row.key])).size > 1);
}
