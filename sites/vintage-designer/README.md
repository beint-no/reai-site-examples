# Vintage Designer storefront

Norwegian, product-first storefront using the shared ReAI Worker and Site client. A separately approved snapshot demonstration is published at https://vintage-designer.respiro.workers.dev using the [hosted export tooling](../../tools/vintage-designer-pages/README.md). ReAI configuration and live integration remain deferred. Checkout is disabled, including direct endpoint calls. Every response is marked noindex/nofollow.

## Local review

From the repository root, run `npm ci`, then follow [local fixture tooling](../../tools/vintage-designer-local/README.md). The explicit local server runs this same Worker against a local API fixture. Source-backed sample products and images live only in the ignored `.local/` directory, never under `public/` or in Git. Missing fixtures fail startup. API errors are not replaced with samples.

The standard `./site.sh dev vintage-designer` uses the live-client configuration and will show unavailable catalog states until a Site credential is configured. Do not deploy this live-client configuration until integration is separately approved; the hosted snapshot uses a separate explicit export.

## Verification

`./site.sh check vintage-designer`, `npm run typecheck`, `npm test`, `npm run check:client-boundary` and `./site.sh check-workers vintage-designer`.

After editing renderer-owned static content, run `node sites/vintage-designer/build-static.mjs` from the repository root. Site checks detect stale generated pages. Guides are concise source-backed excerpts linking to the original articles; policies link to the current authoritative terms. This is not a full legal-content migration.

## Later live integration

Configure the Site, Norway market, NOK prices, publications and collections through authenticated management APIs in a separately approved task. Install the read-only Site token as a Worker secret, never in source or browser code. Remove the local fixture server from the workflow; no renderer change should be needed. Verify live prices, VAT, availability and image renditions before deployment. Checkout remains unconditionally disabled until separately implemented and reviewed.

## Brand assets

The selected design adds a Speedy/Keepall image switcher, handbag/travel-bag shortcuts, authentication and review links, fuller galleries with native image dialogs, and source-backed condition/accessory details. Review links do not assert an independently verified rating. Missing images remain explicit; product details are never inferred from photographs. Feather icons are bundled with their MIT licence under `public/assets/icons/`.

Logo and fonts are the existing public assets from vintagedesigner.no, retrieved 2026-09-07. Product photographs are not shipped with the app. Editorial pages are concise preview content with links to the client's authoritative policies, not new commercial terms.
