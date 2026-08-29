// @ts-check

import {
  createReaiStorefrontWorker,
  norwegianMessages,
} from "../../packages/reai-cloudflare-storefront/worker.mjs";
import * as storefront from "./storefront.mjs";

export default createReaiStorefrontWorker({
  cacheKey: "endorphin-famme-v1",
  storefront,
  market: "default",
  locale: "nb-NO",
  messages: norwegianMessages,
  beforeRequest({ request, url }) {
    if (url.hostname === "www.endorphin.no") {
      url.hostname = "endorphin.no";
      return Response.redirect(url.href, 301);
    }
    const legacyTarget = storefront.legacyRedirectUrl(url);
    if (legacyTarget && (request.method === "GET" || request.method === "HEAD")) {
      return Response.redirect(legacyTarget, 301);
    }
    return null;
  },
});
