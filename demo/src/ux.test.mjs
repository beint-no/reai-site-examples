import test from "node:test";
import assert from "node:assert/strict";
import worker from "./worker.mjs";
import { uxTopics, uxRoutes, designTopics } from "../content/ux.mjs";
import {
  checkoutTotal,
  validateCheckout,
  checkoutOutcome,
} from "../public/assets/checkout-lab-model.js";
import {
  fashionCatalog,
  fashionFilterProducts,
  fashionAvailability,
} from "./design-storefronts.mjs";
import {
  matchingVariants,
  catalogFacets,
  facetCounts,
} from "../public/assets/catalog-filter-data.js";
const input = {
  name: "Test",
  email: "test@example.invalid",
  delivery: "shipping",
  address: "Testgata 1",
  postal: "0001",
  city: "Test",
  quantity: 1,
  business: false,
};
for (const [name, change, errors] of [
  ["valid shipping", {}, []],
  [
    "pickup needs no address",
    { delivery: "pickup", address: "", postal: "", city: "" },
    [],
  ],
  [
    "shipping rejects blank address",
    { address: "", postal: "abc", city: "" },
    ["address", "postal", "city"],
  ],
  ["no forced account", {}, []],
  [
    "business requires organization number",
    { business: true, org: "" },
    ["org"],
  ],
  ["business invoice data", { business: true, org: "123456789" }, []],
  ["email feedback", { email: "bad" }, ["email"]],
  ["quantity is bounded", { quantity: 21 }, ["quantity"]],
  ["fractional quantity is rejected", { quantity: 1.5 }, ["quantity"]],
  ["zero quantity is not a checkout order", { quantity: 0 }, ["quantity"]],
])
  test("checkout lab: " + name, () =>
    assert.deepEqual(validateCheckout({ ...input, ...change }), errors),
  );
test("switching shipping → pickup → shipping recalculates totals without mutating input", () => {
  assert.deepEqual(checkoutTotal("shipping", 3), {
    subtotal: 300,
    shipping: 49,
    total: 349,
  });
  assert.deepEqual(checkoutTotal("pickup", 3), {
    subtotal: 300,
    shipping: 0,
    total: 300,
  });
  assert.deepEqual(checkoutTotal("shipping", 3), {
    subtotal: 300,
    shipping: 49,
    total: 349,
  });
  assert.equal(input.address, "Testgata 1");
});
for (const [outcome, business, state, paid] of [
  ["paid", false, "paid", true],
  ["pending", false, "pending", false],
  ["failed", false, "review", false],
  ["invoice", false, "review", false],
  ["invoice", true, "invoice", false],
  ["unknown", true, "review", false],
])
  test("checkout lab outcome: " + outcome + "/" + business, () =>
    assert.deepEqual(checkoutOutcome(outcome, business), { state, paid }),
  );
test("fashion color, size and stock cannot combine different variants into a false match", () => {
  const products = fashionFilterProducts(fashionCatalog.products, {
      locale: "en",
    }),
    stock = new Map(fashionAvailability(fashionCatalog.products));
  const softy = products.find((p) => p.id === "softy-straight-leg");
  assert.equal(
    matchingVariants(
      softy,
      {
        selected: { "attribute:color": ["brown"], "option:Size": ["L"] },
        available: true,
      },
      stock,
    ).length,
    0,
  );
  assert.ok(
    matchingVariants(
      softy,
      {
        selected: { "attribute:color": ["black"], "option:Size": ["L"] },
        available: true,
      },
      stock,
    ).length,
  );
  assert.equal(
    matchingVariants(
      softy,
      {
        selected: { "attribute:color": ["black"], "option:Size": ["XL"] },
        available: true,
      },
      stock,
    ).length,
    0,
  );
  assert.ok(
    matchingVariants(
      softy,
      { selected: { "attribute:color": ["black"], "option:Size": ["XL"] } },
      stock,
    ).length,
  );
  const facets = catalogFacets(products, "en");
  const norwegian = fashionFilterProducts(fashionCatalog.products, { locale: "nb" });
  const nbFacets = catalogFacets(norwegian, "nb");
  assert.equal(nbFacets.find((f) => f.name === "Størrelse").key, "option:Size");
  assert.equal(facets.find((f) => f.name === "Size").key, "option:Size");
  assert.equal(
    facetCounts(
      [softy],
      facets,
      { selected: { "option:Size": ["L"] }, available: true },
      stock,
    )
      .get("attribute:color")
      .get("brown"),
    0,
  );
});
test("all learning routes are bilingual, static and never call commerce or imply certification", async (context) => {
  context.mock.method(globalThis, "fetch", () => {
    throw Error("Learning must work without upstream");
  });
  for (const path of uxRoutes)
    for (const lang of ["nb", "en"]) {
      const r = await worker.fetch(
        new Request("https://nettbutikk.reai.no" + path + "/?lang=" + lang),
        { ASSETS: {} },
        {},
      );
      assert.equal(r.status, 200, path);
      const html = await r.text();
      assert.match(html, new RegExp(`<html lang="${lang}"`));
      assert.doesNotMatch(
        html,
        /data-checkout(?:[ =>])|data-start-checkout|data-add-to-cart|name="password"/,
      );
      assert.match(html, /<h1>/);
    }
  assert.equal(Object.keys(designTopics).length, 10);
  assert.equal(uxTopics.flatMap((t) => t.cases).length, 137);
  assert.equal(new Set(uxTopics.map((t) => t.slug)).size, uxTopics.length);
  for (const ids of Object.values(designTopics))
    assert.ok(ids.every((id) => uxTopics.some((t) => t.slug === id)));
});
