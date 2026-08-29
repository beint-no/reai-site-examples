import assert from "node:assert/strict";
import test from "node:test";

import {
  matchRoute,
  renderProductPage,
  renderSitemap,
  sanitizeHtml,
} from "./storefront.mjs";
import worker from "./worker.js";

const messages = new Proxy({}, { get: (_target, key) => String(key) });
const context = (locale = "en-NO", pathPrefix = "") => ({
  locale,
  pathPrefix,
  messages,
  publicPath: (pathname) => pathPrefix ? `${pathPrefix}${pathname}` : pathname,
});
const product = {
  id: "018f3c2e-8b1a-4d3e-9c4f-5a6b7c8d9e0f",
  handle: "duofiller-core-g3",
  title: "Duofiller Core (G3)",
  description: "<p>Dual can and bottle filler.</p>",
  brand: "DuoFiller",
  images: [],
  variants: [{
    id: "018f3c2e-8b1a-4d3e-9c4f-5a6b7c8d9e10",
    price: 4890,
    options: [{ name: "Plug", value: "EU" }],
  }],
};
const store = { currency: "NOK", products: [product], collections: [] };

test("redirects the legacy Shopify underscore handle to the canonical Site API slug", () => {
  assert.deepEqual(matchRoute("/products/duofiller_core_g3/"), {
    type: "product",
    handle: "duofiller-core-g3",
    canonicalPath: "/products/duofiller-core-g3/",
    needsSlash: true,
    valid: true,
  });
});

test("renders localized product chrome and the preserved local Core image", () => {
  const html = renderProductPage(store, product, { [product.variants[0].id]: true }, context("nb-NO", "/nb"));
  assert.match(html, /<html lang="nb-NO">/);
  assert.match(html, /href="\/nb\/products\/duofiller-core-g3\/"/);
  assert.match(html, /\/assets\/products\/duofiller_core_g3-1\.webp/);
  assert.match(html, /<link rel="canonical" href="https:\/\/duofiller\.respiro\.workers\.dev\/nb\/products\/duofiller-core-g3\/">/);
});

test("prefixes every Norwegian sitemap route", () => {
  const xml = renderSitemap(store, context("nb-NO", "/nb"));
  assert.match(xml, /<loc>https:\/\/duofiller\.respiro\.workers\.dev\/nb\/products\/duofiller-core-g3\/<\/loc>/);
  assert.doesNotMatch(xml, /<loc>https:\/\/duofiller\.respiro\.workers\.dev\/products\//);
});

test("removes executable markup from catalog descriptions", () => {
  assert.equal(sanitizeHtml('<p>Safe</p><script>alert(1)</script><a href="javascript:alert(2)">bad</a>'), "<p>Safe</p><a>bad</a>");
});

test("publishes localized checkout capability without exposing a credential", async () => {
  const response = await worker.fetch(new Request("https://shop.example/nb/reai/storefront-config"), {
    CHECKOUT_ENABLED: "false",
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Content-Language"), "nb-NO");
  assert.deepEqual(await response.json(), { checkoutEnabled: false });
});

test("blocks server checkout while destination-aware shipping is unavailable", async () => {
  const response = await worker.fetch(new Request("https://shop.example/reai/checkout/start", { method: "POST" }), {
    CHECKOUT_ENABLED: "false",
  });
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /not available yet/i);
});
