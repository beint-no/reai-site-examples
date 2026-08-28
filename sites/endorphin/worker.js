import { createReaiStorefrontWorker } from "../../packages/reai-cloudflare-storefront/worker.mjs";
import nbNO from "./locales/nb-NO.mjs";
import * as storefront from "./storefront.mjs";

export default createReaiStorefrontWorker({
  cacheKey: "endorphin-famme-v1",
  storefront,
  localeCatalogs: { "nb-NO": nbNO },
  localeRoutes: [{
    hostnames: ["*"],
    locale: "nb-NO",
    market: "NO",
    canonicalOrigin: storefront.SITE_ORIGIN,
  }],
  beforeRequest({ request, url }) {
    if (url.hostname === "www.endorphin.no") {
      url.hostname = "endorphin.no";
      return Response.redirect(url, 301);
    }
    const legacyTarget = storefront.legacyRedirectUrl(url);
    if (legacyTarget && (request.method === "GET" || request.method === "HEAD")) {
      return Response.redirect(legacyTarget, 301);
    }
    return null;
  },
});
