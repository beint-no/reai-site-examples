// @ts-check

import { createReaiStorefrontWorker } from "../../packages/reai-cloudflare-storefront/worker.mjs";
import englishSource from "./i18n/en.json" with { type: "json" };
import norwegianSource from "./i18n/nb.json" with { type: "json" };
import * as storefront from "./storefront.mjs";

function catalog(source) {
  return Object.fromEntries(Object.entries(source).map(([key, entry]) => {
    if (!entry || typeof entry.other !== "string") throw new TypeError(`Invalid translation entry: ${key}`);
    return [key, entry.other];
  }));
}

const english = catalog(englishSource);
const norwegian = catalog(norwegianSource);
const englishKeys = Object.keys(english).sort();
const norwegianKeys = Object.keys(norwegian).sort();
if (englishKeys.length !== norwegianKeys.length || englishKeys.some((key, index) => key !== norwegianKeys[index])) {
  throw new TypeError("DuoFiller locale catalogs must contain identical keys");
}

const MARKET_CURRENCY = Object.freeze({
  norway: "NOK",
  europe: "EUR",
  international: "USD",
});
const MARKETS = Object.freeze(Object.keys(MARKET_CURRENCY));

function workerMessages(messages) {
  return {
    ...messages,
    invalidJson: messages.worker_invalid_json,
    invalidLineCount: messages.worker_invalid_line_count,
    invalidLine: messages.worker_invalid_line,
    notConfigured: messages.worker_not_configured,
    invalidProductHandle: messages.worker_invalid_product_handle,
    invalidCollectionHandle: messages.worker_invalid_collection_handle,
    invalidVariantId: messages.worker_invalid_variant_id,
    routeNotFound: messages.worker_route_not_found,
    methodNotAllowed: messages.worker_method_not_allowed,
    temporarilyUnavailable: messages.worker_temporarily_unavailable,
  };
}

function beforeRequest({ request, env, url, renderContext }) {
  const configPath = renderContext.publicPath("/reai/storefront-config");
  const checkoutPath = renderContext.publicPath("/reai/checkout/start");
  const checkoutEnabled = env.CHECKOUT_ENABLED === "true";
  if (url.pathname === configPath && request.method === "GET") {
    return new Response(JSON.stringify({
      checkoutEnabled,
      market: renderContext.market,
      locale: renderContext.locale,
      currency: MARKET_CURRENCY[renderContext.market],
    }), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Language": renderContext.locale,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
  if (url.pathname === checkoutPath && !checkoutEnabled) {
    return new Response(JSON.stringify({ error: renderContext.messages.checkout_disabled }), {
      status: 503,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Language": renderContext.locale,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
  return null;
}

function createLocaleWorkers(locale, messages, options) {
  return Object.fromEntries(MARKETS.map((market) => [
    market,
    createReaiStorefrontWorker({
      cacheKey: "duofiller-brewket-v1",
      storefront,
      market,
      locale,
      messages: workerMessages(messages),
      beforeRequest,
      ...options,
    }),
  ]));
}

const englishWorkers = createLocaleWorkers("en-NO", english, {
  checkoutReturnPath: "/order/complete/",
  noStorePaths: ["/cart/", "/order/complete/"],
});
const norwegianWorkers = createLocaleWorkers("nb-NO", norwegian, {
  pathPrefix: "/nb",
  checkoutReturnPath: "/bestilling/fullfort/",
  noStorePaths: ["/handlekurv/", "/bestilling/fullfort/"],
});

function isNorwegianPath(pathname) {
  return pathname === "/nb" || pathname.startsWith("/nb/");
}

function requestedMarket(url, locale) {
  const value = url.searchParams.get("market")?.trim().toLowerCase();
  if (value && MARKETS.includes(value)) return value;
  return storefront.defaultMarketForLocale(locale);
}

export default {
  fetch(request, env, context) {
    const url = new URL(request.url);
    const norwegian = isNorwegianPath(url.pathname);
    const locale = norwegian ? "nb-NO" : "en-NO";
    const market = requestedMarket(url, locale);
    const workers = norwegian ? norwegianWorkers : englishWorkers;
    return workers[market].fetch(request, env, context);
  },
};
