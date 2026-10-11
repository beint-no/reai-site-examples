import test from "node:test";
import assert from "node:assert/strict";
import {
  catalogFacets,
  matchingVariants,
  facetCounts,
  readFilterState,
  writeFilterState,
} from "../public/assets/catalog-filter-data.js";
import { renderCatalogFilters } from "./catalog-filters.mjs";
const value = (id, label) => ({
  id,
  label,
  colors: [],
  aliases: [],
  taxonomyValues: [],
});
const color = (id, label) => [
  { key: "color", name: "Color", values: [value(id, label)] },
];
const product = {
  id: "p",
  title: "Top",
  brand: "Demo",
  productType: "Clothing",
  category: { id: "aa", name: "Clothing" },
  attributes: [],
  variants: [
    {
      id: "red-s",
      price: 100,
      options: [{ name: "Size", value: "S" }],
      attributes: color("red", "Ruby"),
    },
    {
      id: "blue-m",
      price: 200,
      options: [{ name: "Size", value: "M" }],
      attributes: color("blue", "Ocean"),
    },
  ],
};
test("color, size, price and stock must match the same variant", () => {
  assert.equal(
    matchingVariants(product, {
      selected: { "attribute:color": ["red"], "option:Size": ["M"] },
    }).length,
    0,
  );
  assert.equal(
    matchingVariants(product, {
      selected: { "attribute:color": ["red"] },
      min: 150,
    }).length,
    0,
  );
  assert.deepEqual(
    matchingVariants(product, {
      selected: { "attribute:color": ["blue"] },
      min: 150,
    }).map((v) => v.id),
    ["blue-m"],
  );
  const stock = new Map([
    ["red-s", "AVAILABLE"],
    ["blue-m", "OUT_OF_STOCK"],
  ]);
  assert.equal(
    matchingVariants(
      product,
      { selected: { "attribute:color": ["blue"] }, available: true },
      stock,
    ).length,
    0,
  );
  assert.equal(
    matchingVariants(product, { available: true }, new Map()).length,
    0,
  );
});
test("product attributes apply to every variant and entry UUIDs survive renaming", () => {
  const renamed = {
    ...product,
    attributes: color("gold", "New merchant label"),
  };
  assert.equal(
    matchingVariants(renamed, { selected: { "attribute:color": ["gold"] } })
      .length,
    2,
  );
  assert.equal(
    matchingVariants(renamed, {
      selected: { "attribute:color": ["New merchant label"] },
    }).length,
    0,
  );
});
test("facet counts count products, respect other groups and allow OR within a group", () => {
  const facets = catalogFacets([product]);
  const counts = facetCounts([product], facets, {
    selected: { "option:Size": ["M"] },
  });
  assert.equal(counts.get("attribute:color").get("red"), 0);
  assert.equal(counts.get("attribute:color").get("blue"), 1);
  assert.equal(
    matchingVariants(product, {
      selected: { "attribute:color": ["red", "blue"] },
    }).length,
    2,
  );
  assert.equal(
    facets.some((f) => f.key === "brand"),
    false,
  );
});
test("filter URLs preserve language, reject unknown entries, and round-trip without changing identities", () => {
  const facets = catalogFacets([product]);
  const params = new URLSearchParams(
    "lang=en&min=-2&max=NaN&f.attribute%3Acolor=red&f.attribute%3Acolor=bogus&f.attribute%3Acolor=red&view=list",
  );
  const state = readFilterState(params, facets);
  assert.equal(state.min, null);
  assert.equal(state.max, null);
  assert.deepEqual(state.selected["attribute:color"], ["red"]);
  writeFilterState(params, state);
  assert.equal(params.get("lang"), "en");
  assert.deepEqual(readFilterState(params, facets), state);
});
test("backend labels are escaped in filter controls and embedded data", () => {
  const p = { ...product, productType: '<img src=x onerror="alert(1)">' };
  const html = renderCatalogFilters([p], { currency: "NOK" }, "nb");
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;img/);
});
