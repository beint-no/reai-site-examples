import { createReaiStorefrontWorker } from "../../packages/reai-cloudflare-storefront/worker.mjs";
import nbNO from "./locales/nb-NO.mjs";
import * as storefront from "./storefront.mjs";

export default createReaiStorefrontWorker({
  cacheKey: "budmates-v1",
  storefront,
  localeCatalogs: { "nb-NO": nbNO },
  localeRoutes: [{
    hostnames: ["*"],
    locale: "nb-NO",
    market: "NO",
    canonicalOrigin: storefront.SITE_ORIGIN,
  }],
});
