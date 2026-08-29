# ReAI Cloudflare storefront integration

This dependency-free ES module provides the shared server-side path for ReAI storefronts. It handles Site authentication, market-and-locale commerce routing, checkout input validation, catalog caching, security headers and Cloudflare static asset fallback.

The storefront supplies its own routing and rendering functions:

```js
import {
  createReaiStorefrontWorker,
  norwegianMessages,
} from "../../packages/reai-cloudflare-storefront/worker.mjs";
import * as storefront from "./storefront.mjs";

export default createReaiStorefrontWorker({
  cacheKey: "my-store-v1",
  storefront,
  market: "norway",
  locale: "nb-NO",
  messages: norwegianMessages,
});
```

`storefront` must export `HANDLE`, `matchRoute`, `collectionByHandle`, `productByHandle`, the page renderers and the sitemap renderer. `market` defaults to the ReAI Site market handle `default`; `locale` defaults to `en`. Every commerce delivery call, including availability and checkout, sends both values and isolates cached catalogs by the same pair. `beforeRequest` can implement canonical-domain or legacy-path redirects without forking the shared integration.

The module is deliberately kept dependency-free and in source form so the complete security boundary remains easy to audit.

## Compact legal footer

The optional footer helper keeps the final line consistent without embedding merchant details or policy text:

```js
import { renderCompactLegalFooter } from "../../packages/reai-cloudflare-storefront/footer.mjs";

const footer = renderCompactLegalFooter({
  owner: "Example Store",
  locale: "en",
  refundHref: "/refund/",
  privacyHref: "/privacy/",
  termsHref: "/terms/",
  className: "footer-bottom shell",
});
```

It renders the current copyright year, a localized link to ReAI, and refund, privacy and terms links. The storefront supplies every merchant-specific value and owns the linked policy pages.

```css
.compact-legal-footer {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: .35rem 1rem;
  padding-block: 12px;
  font-size: .75rem;
}

.compact-legal-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.compact-legal-links a {
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  color: inherit;
  text-decoration: none;
  white-space: nowrap;
}

.compact-legal-links a + a::before {
  content: "·";
  margin-inline: .55rem;
  opacity: .55;
}
```
