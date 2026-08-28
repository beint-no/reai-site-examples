import assert from "node:assert/strict";
import test from "node:test";

import {
  createLocaleRouting,
  defineLocaleCatalog,
  formatCurrency,
} from "./locale-routing.mjs";
import { createReaiStorefrontWorker } from "./worker.mjs";

const storefront = {
  HANDLE: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  matchRoute: () => null,
};

test("rejects Site API requests when the Worker has no credential", async () => {
  const worker = createReaiStorefrontWorker({ cacheKey: "missing-token", storefront });
  const response = await worker.fetch(new Request("https://shop.example/reai/catalog"), {});

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "The Site API is not configured." });
});

test("validates checkout lines before calling ReAI", async () => {
  const worker = createReaiStorefrontWorker({ cacheKey: "invalid-checkout", storefront });
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

  const worker = createReaiStorefrontWorker({ cacheKey: "checkout", storefront });
  const variantId = "018f3c2e-8b1a-4d3e-9c4f-5a6b7c8d9e0f";
  const response = await worker.fetch(new Request("https://shop.example/reai/checkout/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lines: [{ variantId, quantity: 2 }] }),
  }), { REAI_SITE_TOKEN: "test-token" });

  assert.equal(response.status, 201);
  assert.equal(upstreamRequest.input, "https://app.reai.no/site/v1/commerce/checkout-sessions?locale=en");
  assert.ok(upstreamRequest.init.headers.get("Idempotency-Key"));
  assert.deepEqual(JSON.parse(upstreamRequest.init.body), {
    lines: [{ variantId, quantity: 2 }],
    returnUrl: "https://shop.example/bestilling/fullfort/",
  });
});

test("requires every locale catalog to have identical string message keys", () => {
  const english = defineLocaleCatalog("en-GB", { worker: { unavailable: "Unavailable" } });
  const norwegian = defineLocaleCatalog("nb-NO", { worker: { unavailable: "Utilgjengelig", retry: "Prøv igjen" } });

  assert.throws(() => createLocaleRouting({
    catalogs: { "en-GB": english, "nb-NO": norwegian },
    routes: [{ locale: "en-GB" }],
  }), /exactly the same message keys/);
  assert.throws(() => defineLocaleCatalog("en", { worker: { unavailable: 503 } }), /must be a string/);
});

test("routes locale folders and domains to explicit Site markets", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });

  const requests = [];
  globalThis.fetch = async (input, init) => {
    requests.push({ input, init });
    return Response.json({ currency: input.includes("locale=sv-SE") ? "SEK" : "NOK", products: [] });
  };

  const workerMessages = { temporarilyUnavailable: "Unavailable" };
  const english = defineLocaleCatalog("en-GB", { worker: workerMessages });
  const norwegian = defineLocaleCatalog("nb-NO", { worker: { ...workerMessages } });
  const swedish = defineLocaleCatalog("sv-SE", { worker: { ...workerMessages } });
  const worker = createReaiStorefrontWorker({
    cacheKey: "locale-markets",
    storefront,
    localeCatalogs: { "en-GB": english, "nb-NO": norwegian, "sv-SE": swedish },
    localeRoutes: [
      {
        hostnames: ["shop.example"],
        locale: "nb-NO",
        market: "NO",
        canonicalOrigin: "https://shop.example",
        siteTokenBinding: "REAI_SITE_TOKEN_NO",
      },
      {
        hostnames: ["shop.example"],
        pathPrefix: "/en",
        locale: "en-GB",
        market: "NO",
        canonicalOrigin: "https://shop.example",
        siteTokenBinding: "REAI_SITE_TOKEN_NO",
      },
      {
        hostnames: ["shop.se"],
        locale: "sv-SE",
        market: "SE",
        canonicalOrigin: "https://shop.se",
        siteTokenBinding: "REAI_SITE_TOKEN_SE",
      },
    ],
  });
  const env = { REAI_SITE_TOKEN_NO: "no-token", REAI_SITE_TOKEN_SE: "se-token" };

  const englishResponse = await worker.fetch(new Request("https://shop.example/en/reai/catalog"), env);
  const swedishResponse = await worker.fetch(new Request("https://shop.se/reai/catalog"), env);
  const checkoutResponse = await worker.fetch(new Request("https://shop.example/en/reai/checkout/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lines: [{ variantId: "018f3c2e-8b1a-4d3e-9c4f-5a6b7c8d9e0f", quantity: 1 }],
    }),
  }), env);

  assert.equal(englishResponse.headers.get("Content-Language"), "en-GB");
  assert.equal(swedishResponse.headers.get("Content-Language"), "sv-SE");
  assert.equal(checkoutResponse.status, 200);
  assert.equal(requests[0].input, "https://app.reai.no/site/v1/commerce/catalog?locale=en-GB");
  assert.equal(requests[0].init.headers.get("Authorization"), "Bearer no-token");
  assert.equal(requests[1].input, "https://app.reai.no/site/v1/commerce/catalog?locale=sv-SE");
  assert.equal(requests[1].init.headers.get("Authorization"), "Bearer se-token");
  assert.equal(requests[2].input, "https://app.reai.no/site/v1/commerce/checkout-sessions?locale=en-GB");
  assert.deepEqual(JSON.parse(requests[2].init.body), {
    lines: [{ variantId: "018f3c2e-8b1a-4d3e-9c4f-5a6b7c8d9e0f", quantity: 1 }],
    returnUrl: "https://shop.example/en/bestilling/fullfort/",
  });
});

test("localizes static folder pages without varying on request headers", async () => {
  const messages = { worker: { temporarilyUnavailable: "Unavailable" } };
  const english = defineLocaleCatalog("en-GB", messages);
  const norwegian = defineLocaleCatalog("nb-NO", messages);
  const swedish = defineLocaleCatalog("sv-SE", messages);
  const worker = createReaiStorefrontWorker({
    cacheKey: "static-locales",
    storefront,
    localeCatalogs: { "en-GB": english, "nb-NO": norwegian, "sv-SE": swedish },
    localeRoutes: [
      { hostnames: ["shop.example"], locale: "nb-NO", market: "NO", canonicalOrigin: "https://shop.example" },
      { hostnames: ["shop.example"], pathPrefix: "/en", locale: "en-GB", market: "NO", canonicalOrigin: "https://shop.example" },
      { hostnames: ["shop.se"], assetPathPrefix: "/sv", locale: "sv-SE", market: "SE", canonicalOrigin: "https://shop.se" },
    ],
  });
  const assetRequests = [];
  const env = {
    ASSETS: {
      fetch: async (request) => {
        assetRequests.push(request.url);
        return new Response('<!doctype html><html lang="nb-NO"><head><link rel="canonical" href="https://shop.example/about/"></head><body><a href="/contact/">Contact</a><img src="/assets/logo.svg"></body></html>', {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      },
    },
  };

  const response = await worker.fetch(new Request("https://shop.example/en/about/", {
    headers: { "Accept-Language": "nb-NO" },
  }), env);
  const html = await response.text();
  const swedishResponse = await worker.fetch(new Request("https://shop.se/about/"), env);
  const swedishHtml = await swedishResponse.text();

  assert.equal(response.headers.get("Content-Language"), "en-GB");
  assert.deepEqual(assetRequests, ["https://shop.example/en/about/", "https://shop.se/sv/about/"]);
  assert.match(html, /<html lang="en-GB">/);
  assert.match(html, /name="reai-api-base" content="\/en\/reai"/);
  assert.match(html, /name="reai-market" content="NO"/);
  assert.match(html, /rel="canonical" href="https:\/\/shop\.example\/en\/about\/"/);
  assert.match(html, /hreflang="nb-NO" href="https:\/\/shop\.example\/about\/"/);
  assert.match(html, /href="\/en\/contact\/"/);
  assert.match(html, /src="\/assets\/logo\.svg"/);
  assert.equal(swedishResponse.headers.get("Content-Language"), "sv-SE");
  assert.match(swedishHtml, /<html lang="sv-SE">/);
  assert.match(swedishHtml, /rel="canonical" href="https:\/\/shop\.se\/about\/"/);
  assert.match(swedishHtml, /href="\/contact\/"/);
});

test("formats prices with standard locale and currency data", () => {
  assert.match(formatCurrency(12.5, "EUR", "en-IE"), /€12\.50/);
  assert.match(formatCurrency(199, "NOK", "nb-NO"), /199/);
});
