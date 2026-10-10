import test from "node:test";
import assert from "node:assert/strict";
import worker from "./worker.mjs";
const assets = { fetch: async () => new Response("asset") };
const request = (path) => new Request("https://nettbutikk.reai.no" + path);
const env = {
  REAI_SITE_CREDENTIAL: "server-only",
  REAI_API_BASE_URL: "https://app.reai.no",
  ASSETS: assets,
};
const original = globalThis.fetch;
async function mocked(fn, reply) {
  globalThis.fetch = reply;
  try {
    await fn();
  } finally {
    globalThis.fetch = original;
  }
}
test("fashion fixture works without credentials, rejects unknown nested routes and never reads commerce", async () =>
  mocked(
    async () => {
      for (const path of [
        "/designs/famme/",
        "/designs/famme/collections/softy/",
        "/designs/famme/products/softy-straight-leg/",
      ]) {
        const r = await worker.fetch(request(path), { ASSETS: assets }, {});
        assert.equal(r.status, 200);
        const html = await r.text();
        assert.match(html, /data-fashion-store/);
        assert.match(html, /data-payment-mode="disabled"/);
        assert.doesNotMatch(
          html,
          /data-add-to-cart|data-checkout(?:[ =])|server-only/,
        );
      }
      for (const path of [
        "/designs/famme/collections/missing/",
        "/designs/famme/products/missing/",
        "/designs/famme/checkout/",
      ])
        assert.equal(
          (await worker.fetch(request(path), { ASSETS: assets }, {})).status,
          404,
        );
    },
    async () => {
      throw new Error("Fixture must not call ReAI");
    },
  ));
test("new live designs fail closed without credentials instead of showing fashion fixtures", async () => {
  for (const path of [
    "/designs/essential/",
    "/designs/collections/",
    "/designs/collections/softy/",
  ])
    assert.equal(
      (await worker.fetch(request(path), { ASSETS: assets }, {})).status,
      503,
    );
});
test("Essential uses published variant price and availability; Index respects collection membership", async () =>
  mocked(
    async () => {
      const essential = await worker.fetch(
        request("/designs/essential/?lang=en"),
        env,
        {},
      );
      assert.equal(essential.status, 200);
      const html = await essential.text();
      assert.match(html, /value="live-variant-available"/);
      assert.match(html, /NOK\s*42/);
      assert.match(html, /value="live-variant-soldout"[^>]*disabled/);
      assert.doesNotMatch(
        html,
        /value="fashion-|server-only|value="extra-variant"/,
      );
      const index = await worker.fetch(
        request("/designs/collections/test-collection/?lang=en"),
        env,
        {},
      );
      assert.equal(index.status, 200);
      const collection = await index.text();
      assert.match(collection, /Chosen product/);
      assert.doesNotMatch(collection, /Unchosen product/);
    },
    async (input) => {
      const path = new URL(input).pathname;
      if (path.endsWith("/site"))
        return Response.json({
          markets: [
            {
              handle: "default",
              defaultLocale: "en",
              locales: ["en"],
              isDefault: true,
            },
          ],
        });
      if (path.endsWith("/availability"))
        return Response.json({
          variants: [
            { variantId: "live-variant-available", status: "AVAILABLE" },
            { variantId: "live-variant-soldout", status: "OUT_OF_STOCK" },
          ],
        });
      if (path.endsWith("/collections/test-collection"))
        return Response.json({
          handle: "test-collection",
          title: "A real collection",
          products: [{ id: "chosen" }],
        });
      if (path.endsWith("/storefront"))
        return Response.json({
          locale: "en",
          currency: "NOK",
          collections: [
            { handle: "test-collection", title: "A real collection" },
          ],
          products: [
            {
              id: "chosen",
              handle: "test-betaling",
              title: "Chosen product",
              description: "Chosen description",
              variants: [
                { id: "live-variant-available", price: 42, options: [] },
                { id: "live-variant-soldout", price: 43, options: [] },
              ],
            },
            {
              id: "extra",
              handle: "extra-product",
              title: "Unchosen product",
              variants: [{ id: "extra-variant", price: 8, options: [] }],
            },
          ],
        });
      throw new Error("Unexpected request " + path);
    },
  ));
