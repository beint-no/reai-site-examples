import assert from "node:assert/strict";
import test from "node:test";

import { createReaiStorefrontWorker } from "./worker.mjs";

const storefront = {
  HANDLE: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  matchRoute: () => null,
};

test("rejects Site API requests when the Worker has no credential", async () => {
  const worker = createReaiStorefrontWorker({
    cacheKey: "missing-token",
    storefront,
    market: "default",
    locale: "en",
  });
  const response = await worker.fetch(new Request("https://shop.example/reai/catalog"), {});

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "The Site API is not configured." });
});

test("validates checkout lines before calling ReAI", async () => {
  const worker = createReaiStorefrontWorker({
    cacheKey: "invalid-checkout",
    storefront,
    market: "default",
    locale: "en",
  });
  const response = await worker.fetch(new Request("https://shop.example/reai/checkout/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lines: [{ variantId: "not-a-uuid", quantity: 1 }] }),
  }), { REAI_SITE_TOKEN: "test-token" });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "The cart contains an invalid variant or quantity." });
});

test("adds a same-origin return URL and idempotency key", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });

  let upstreamRequest;
  globalThis.fetch = async (input, init) => {
    upstreamRequest = { input, init };
    return new Response(JSON.stringify({ checkoutUrl: "https://app.reai.no/checkout/session/example" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  };

  const worker = createReaiStorefrontWorker({
    cacheKey: "checkout",
    storefront,
    market: "default",
    locale: "en",
  });
  const variantId = "018f3c2e-8b1a-4d3e-9c4f-5a6b7c8d9e0f";
  const response = await worker.fetch(new Request("https://shop.example/reai/checkout/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lines: [{ variantId, quantity: 2 }] }),
  }), { REAI_SITE_TOKEN: "test-token" });

  assert.equal(response.status, 201);
  assert.equal(upstreamRequest.input, "https://app.reai.no/site/v1/commerce/checkout-sessions?market=default&locale=en");
  assert.ok(upstreamRequest.init.headers.get("Idempotency-Key"));
  assert.deepEqual(JSON.parse(upstreamRequest.init.body), {
    lines: [{ variantId, quantity: 2 }],
    returnUrl: "https://shop.example/bestilling/fullfort/",
  });
});

test("scopes API routes, checkout returns, and response language to a path-prefixed locale", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });

  const upstreamRequests = [];
  globalThis.fetch = async (input, init) => {
    upstreamRequests.push({ input, init });
    return new Response(JSON.stringify({ checkoutUrl: "https://app.reai.no/checkout/session/example" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  };

  const worker = createReaiStorefrontWorker({
    cacheKey: "localized-checkout",
    storefront,
    locale: "nb-NO",
    market: "norway",
    pathPrefix: "/nb",
    checkoutReturnPath: "/bestilling/fullfort/",
  });
  const variantId = "018f3c2e-8b1a-4d3e-9c4f-5a6b7c8d9e0f";
  const response = await worker.fetch(new Request("https://shop.example/nb/reai/checkout/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lines: [{ variantId, quantity: 1 }] }),
  }), { REAI_SITE_TOKEN: "test-token" });

  assert.equal(response.status, 201);
  assert.equal(response.headers.get("Content-Language"), "nb-NO");
  assert.equal(upstreamRequests[0].input, "https://app.reai.no/site/v1/commerce/checkout-sessions?market=norway&locale=nb-NO");
  assert.equal(JSON.parse(upstreamRequests[0].init.body).returnUrl, "https://shop.example/nb/bestilling/fullfort/");
});

test("sends the configured market and locale on every commerce delivery route", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });

  const inputs = [];
  globalThis.fetch = async (input) => {
    inputs.push(String(input));
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const worker = createReaiStorefrontWorker({
    cacheKey: "market-context",
    storefront,
    locale: "en-NO",
    market: "international",
  });
  const routes = [
    "/reai/catalog",
    "/reai/products/example",
    "/reai/collections",
    "/reai/collections/example",
    "/reai/availability/018f3c2e-8b1a-4d3e-9c4f-5a6b7c8d9e0f",
  ];
  for (const route of routes) {
    const response = await worker.fetch(new Request(`https://shop.example${route}`), {
      REAI_SITE_TOKEN: "test-token",
    });
    assert.equal(response.status, 200);
  }

  assert.equal(inputs.length, routes.length);
  for (const input of inputs) {
    const url = new URL(input);
    assert.equal(url.searchParams.get("market"), "international");
    assert.equal(url.searchParams.get("locale"), "en-NO");
  }
});

test("rejects invalid market handles", () => {
  assert.throws(
    () => createReaiStorefrontWorker({
      cacheKey: "invalid-market",
      storefront,
      market: "Not valid!",
      locale: "en",
    }),
    /Invalid market/,
  );
});

test("requires an explicit ReAI market and locale", () => {
  assert.throws(
    () => createReaiStorefrontWorker({ cacheKey: "missing-market", storefront, locale: "nb-NO" }),
    /market is required/,
  );
  assert.throws(
    () => createReaiStorefrontWorker({ cacheKey: "missing-locale", storefront, market: "default" }),
    /locale is required/,
  );
});

test("strips the locale prefix for commerce matching and preserves it in redirects", async () => {
  let matchedPath;
  const localizedStorefront = {
    ...storefront,
    matchRoute(pathname) {
      matchedPath = pathname;
      return {
        type: "product",
        handle: "example",
        canonicalPath: "/products/example/",
        needsSlash: true,
        valid: true,
      };
    },
  };
  const worker = createReaiStorefrontWorker({
    cacheKey: "localized-route",
    storefront: localizedStorefront,
    locale: "nb-NO",
    market: "norway",
    pathPrefix: "/nb",
  });

  const response = await worker.fetch(new Request("https://shop.example/nb/products/example"), {
    REAI_SITE_TOKEN: "test-token",
  });

  assert.equal(matchedPath, "/products/example");
  assert.equal(response.status, 301);
  assert.equal(response.headers.get("Location"), "https://shop.example/nb/products/example/");
});
