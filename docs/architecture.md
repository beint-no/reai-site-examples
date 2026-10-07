# Storefront architecture

This guide describes the Site API storefront examples. For static websites and
content/data ownership, start with [website kinds](concepts.md#static-websites-and-site-api-websites).

The browser, Worker and ReAI have separate responsibilities. The browser never
holds the Site credential. The Worker owns page rendering and the integration
boundary; ReAI owns publication, market prices, availability and checkout state.

## Source layout

| Directory | Purpose |
| --- | --- |
| `starter/src/` | Shared beginner storefront rendering, editable information copy and browser-facing checkout boundary |
| `starter/public/` | Generic CSS, browser cart script, reusable mark and generated editorial hero |
| `examples/<design>/` | Theme override, Worker entrypoint and independent Wrangler configuration |
| `examples/demo-data/` | Explicit fictional fixtures used only by the local offline demo |
| `packages/reai-site-client/` | Native JS client and generated delivery OpenAPI declarations |
| `packages/reai-cloudflare-storefront/` | Optional advanced cache, availability, localization and proxy integration |
| `tools/` | Build, offline demo, standalone export and validation |

`npm run build` combines the base assets with each theme under its ignored
`examples/<design>/public/` directory. Each design's Worker imports the same
starter renderer. Theme differences do not fork authentication or checkout.

## Beginner integration

The starter obtains Site identity and the selected default market, then reads
one coherent `commerce/storefront` projection. It renders homepage, collections,
product pages, cart and editable information pages. Requests go through the
contract-checked Site client. There is no runtime Shopify/WooCommerce request
and no committed live catalog.

The browser stores variant UUIDs and quantities in its cart. `/catalog.json`
exposes public products for cart labels and estimated totals. `/checkout/start`
validates same-origin JSON requests, bounds request size, validates line shapes
and delegates checkout session creation to ReAI.

The beginner renderer deliberately has no shared Cache API layer and no separate
live availability UI. Prices and stock are authoritatively validated by ReAI at
checkout. It is a starting point; use the advanced integration when the storefront
needs batch stock checks, richer market/locale routing or caching.

## Advanced integration

`packages/reai-cloudflare-storefront` provides a generated-client-backed server
boundary with configurable renderers, same-origin `/reai/*` routes, market/locale
contexts and batch availability. Its [package guide](../packages/reai-cloudflare-storefront/README.md)
documents the renderer exports and hooks.

Its storefront cache is fresh for 60 seconds, may serve stale data while
revalidating for the following five minutes, and retains a last snapshot for a
day for transient upstream errors. It keys data by market and locale and uses
ETags for revalidation. Availability is separate and uncached. Do not equate a
Worker application cache hit with a `Cf-Cache-Status: HIT` response.

## Errors and credentials

Missing runtime bindings render a setup state. Upstream failures render a generic
unavailable state. Checkout errors can retain public stock conflict information;
credentials and private tenant records must never enter browser responses.

The offline demo is an explicit Node process that intercepts only its synthetic
upstream origin. It never changes the production Worker's behavior. Exports
include neither that server nor its catalog fixtures.
