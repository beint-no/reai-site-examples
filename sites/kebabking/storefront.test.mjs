import assert from "node:assert/strict";
import test from "node:test";

import * as storefront from "./storefront.mjs";

const image = {
  url: "https://app.reai.no/media/menu-item.avif",
  alt: "Kebabtallerken med salat",
  width: 1200,
  height: 1200,
  renditions: [
    { url: "https://app.reai.no/media/menu-item-480.avif", width: 480, height: 480 },
    { url: "https://app.reai.no/media/menu-item-960.avif", width: 960, height: 960 },
  ],
};

const product = {
  id: "product-1",
  handle: "kebabtallerken",
  title: "Kebabtallerken",
  brand: "Kebab King",
  description: "Serveres fra grillen.",
  images: [image],
  variants: [{
    id: "123e4567-e89b-42d3-a456-426614174000",
    price: 199,
    options: [],
  }],
};

const store = {
  products: [product],
  collections: [{
    id: "collection-1",
    handle: "kebab",
    title: "Kebab",
    description: "Kebab fra grillen.",
    products: [{ handle: product.handle }],
  }],
};

test("matches dynamic commerce routes", () => {
  assert.deepEqual(storefront.matchRoute("/"), { type: "home" });
  assert.equal(storefront.matchRoute("/products/kebabtallerken/").type, "product");
  assert.equal(storefront.matchRoute("/collections/kebab/").type, "collection");
  assert.equal(storefront.matchRoute("/kontakt/"), null);
});

test("renders Site API collections and products", () => {
  const home = storefront.renderHomePage(store);
  const collection = storefront.renderCollectionPage(store, "kebab");
  const detail = storefront.renderProductPage(store, product, {
    [product.variants[0].id]: true,
  });

  assert.match(home, /Kebabtallerken/);
  assert.match(collection, /data-collection-grid/);
  assert.match(detail, /data-add-to-cart/);
  assert.match(detail, /123e4567-e89b-42d3-a456-426614174000/);
  assert.match(detail, /menu-item-960\.avif 960w/);
  assert.doesNotMatch(`${home}${collection}${detail}`, /shopify/i);
});

test("includes dynamic routes in the sitemap", () => {
  const sitemap = storefront.renderSitemap(store);
  assert.match(sitemap, /\/collections\/kebab\//);
  assert.match(sitemap, /\/products\/kebabtallerken\//);
  assert.match(sitemap, /\/bestilling\/fullfort\//);
});
