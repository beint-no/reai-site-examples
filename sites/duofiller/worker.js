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
    return new Response(JSON.stringify({ checkoutEnabled }), {
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

const englishWorker = createReaiStorefrontWorker({
  cacheKey: "duofiller-brewket-v1",
  storefront,
  market: "international",
  locale: "en-NO",
  messages: workerMessages(english),
  checkoutReturnPath: "/order/complete/",
  noStorePaths: ["/cart/", "/order/complete/"],
  beforeRequest,
});

const norwegianWorker = createReaiStorefrontWorker({
  cacheKey: "duofiller-brewket-v1",
  storefront,
  market: "norway",
  locale: "nb-NO",
  pathPrefix: "/nb",
  messages: workerMessages(norwegian),
  checkoutReturnPath: "/bestilling/fullfort/",
  noStorePaths: ["/handlekurv/", "/bestilling/fullfort/"],
  beforeRequest,
});

export default {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    return pathname === "/nb" || pathname.startsWith("/nb/")
      ? norwegianWorker.fetch(request, env, context)
      : englishWorker.fetch(request, env, context);
  },
};
