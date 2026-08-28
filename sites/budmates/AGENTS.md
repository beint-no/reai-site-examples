# BudMates

## Client

- Company: BudMates AS
- Organisation number: 929 151 291
- Address: Skilferveien 5 C, 9801 Vadsø, Norway
- Email: post@budmates.no
- Phone: +47 469 43 027
- Current domain: https://budmates.no
- Instagram: https://www.instagram.com/budmates.no
- Snapchat: https://www.snapchat.com/add/budmates.no

## Business

BudMates is a Norwegian online retailer of age-restricted smoking accessories and related equipment. Orders are fulfilled from Norway. The client emphasises discreet packaging and accessible Norwegian customer service.

## Site direction

- Norwegian-language storefront on Cloudflare Workers.
- Keep the recognisable BudMates character: black background, bright green accents, the original logo, product-led navigation and direct Norwegian copy.
- Make the execution cleaner than the original Shopify theme: stronger hierarchy, consistent spacing, useful product galleries and excellent mobile layouts.
- There is no age-confirmation popup.
- `https://budmates.respiro.workers.dev` is a fully dynamic store. Homepage merchandising, product pages, collection pages, nav membership, galleries, prices and `sitemap.xml` are rendered from the ReAI Site API at request time. Do not add runtime Shopify, local `catalog.json`, local product HTML, or local product-photo dependencies.
- Editorial pages stay static: `artikler/`, `kunnskap/`, `om/`, `faq/`, `kontakt/`, `levering/`, `vilkar/` and `personvern/`. Brand chrome, cart, thank-you and 404 stay Worker-owned templates or static shells.
- Collection membership on `/collections/{handle}/` comes from `/site/v1/commerce/collections/{handle}`. `/collections/all/` lists the published catalog. Product image masters and 320/480/640/960/1280/1600/1920 AVIF renditions come from each catalog image's `url` and `renditions` fields. Render width-based `srcset`/`sizes` with intrinsic dimensions; do not reconstruct media URLs or fetch each product to build collection grids.
- Build the main nav from a curated subset of published collections. Do not use empty `frontpage` or the typo collection `ligher`.
- Cart state lives in browser storage. Checkout posts opaque variant IDs and quantities to `/reai/checkout/start`, then redirects to ReAI hosted checkout. After a successful payment, ReAI returns the shopper to `/bestilling/fullfort/` on the Worker origin; that page clears `budmates-cart-v3`. Failed payments must stay on `app.reai.no`. Do not treat `/handlekurv/` as a success return or clear the cart there.
- The contact form opens the visitor's email application; it does not collect data.
- `https://budmates.respiro.workers.dev` uses a Site-scoped ReAI production credential. Keep Site `activeDomain` and `previewDomain` on that host. Do not cut over `budmates.no` until the client is ready.

## Catalog source

Published products, collections, images, prices, availability and checkout come only from the ReAI Site API. New products appear on `/products/{handle}/` without a deploy. Do not restore `tools/sync-shopify.mjs` or bake product/collection HTML.
