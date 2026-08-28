# ReAI Cloudflare storefront integration

This dependency-free ES module provides the shared server-side path for ReAI storefronts. It handles Site authentication, commerce API routing, checkout input validation, catalog caching, security headers and Cloudflare static asset fallback.

The storefront supplies its own routing and rendering functions:

```js
import { createReaiStorefrontWorker } from "../../packages/reai-cloudflare-storefront/worker.mjs";
import nbNO from "./locales/nb-NO.mjs";
import * as storefront from "./storefront.mjs";

export default createReaiStorefrontWorker({
  cacheKey: "my-store-v1",
  storefront,
  localeCatalogs: { "nb-NO": nbNO },
  localeRoutes: [{
    hostnames: ["*"],
    locale: "nb-NO",
    market: "NO",
    canonicalOrigin: storefront.SITE_ORIGIN,
  }],
});
```

`storefront` must export `HANDLE`, `matchRoute`, `collectionByHandle`, `productByHandle`, the page renderers and the sitemap renderer. `beforeRequest` can implement canonical-domain or legacy-path redirects without forking the shared integration.

The module is deliberately kept dependency-free and in source form so the complete security boundary remains easy to audit. See [localization and markets](../../docs/localization.md) before adding a language, domain or currency market.
