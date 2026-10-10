# ReAI test store and Site API guide

One public source repository and one deployed demo Worker. Real client sites live
in independent private repositories. The operator hub checks this repo out under
resources/ for convenience; clients have no runtime dependency on either repo.

## What lives here

- demo/content/: bilingual educational lessons and delivery-operation coverage.
- demo/src/: server-rendered demo storefront, static explanations, public API
  explorer and bounded same-origin hosted checkout startup.
- demo/public/: original reusable design, CSS, browser-local cart and illustrations.
- demo/seed/: fictional product definitions for explicit operator-managed seeding.
- packages/: generated Site client and reusable advanced Cloudflare integration.
- starter/ and templates/storefront/: the simple standalone export used to refresh
  the separate private reai-storefront-starter provisioning repository.
- docs/: focused API/integration guides. Each directory's AGENTS.md is for humans
  and agents alike; keep one document per directory instead of parallel READMEs.

## Work locally

Use Node/npm versions in package.json. Work in a dedicated Git worktree under
~/.r-worktrees, keep the primary checkout on main, and use reviewed squash PRs.

```sh
npm ci
npm run demo       # explicit fictional offline preview; checkout disabled
npm run dev        # real Worker, with ignored .dev.vars / Site credential
npm run check      # types, security boundaries, tests, docs, bundle and contract
npm run export -- storefront /absolute/path/to/new-private-repo
```

The exporter refuses existing destinations and excludes the demo catalog/server.
Edit generic exported designs here, then refresh and validate the private template.
Existing client repositories do not change when either source/template changes.

## Data and publishing

Products, prices, translations, images, collections and availability belong in
ReAI. Deployed code never falls back to fictional fixtures on upstream errors.
Requests use packages/reai-site-client; keep delivery credentials server-side.
Never commit tokens, private customer data, or raw tenant/catalog exports.

wrangler.jsonc targets only reai-demo-store at https://nettbutikk.reai.no.
npm run deploy checks and deploys locally; CI validates only.
Set REAI_SITE_CREDENTIAL as a Worker secret. The published field guide at /features/
explains payments, B2B/EHF, shipping/pickup, discounts, catalog, markets and
integration; /api/ exercises all nine delivery reads, checkout and newsletter signup.
Shipping and inventory bundles are documented capabilities, not fulfillment
promises for this digital catalog. The published demo uses Adyen LIVE
and clearly labels real payments and the configured recipient. Offline preview
always disables checkout. Checkout requires an explicit enabled binding, a
verified payment mode and a named merchant for live payments. A preview, Site
credential environment or test tenant name does not prove Adyen is in TEST mode.
Never claim a return redirect proves payment; never charge a real card as a test.
Invoice checkout creates real unpaid orders; merchant invoice issuance and EHF
delivery happen later. Do not submit orders or send invoices just to test the UI.
Demo donation products are not charitable claims. Demo gift cards create no real
balance or redemption right unless such a service is deliberately implemented.

## Guides

- [Start and configure the demo](docs/quickstart.md)
- [Static sites, Site API and data flow](docs/concepts.md)
- [Management/publication](docs/management.md)
- [Authentication](docs/authentication.md)
- [Market and language](docs/markets-and-localization.md)
- [Catalog/images/availability](docs/catalog-and-images.md)
- [Checkout](docs/checkout.md)
- [Architecture](docs/architecture.md)
- [Demo tenant setup](docs/demo-setup.md): catalog, credentials and explicit B2B/pickup setup.
- [Cloudflare deployment](docs/cloudflare-deployment.md)
- [Client repos and provisioning](docs/repositories.md)
- [Troubleshooting](docs/troubleshooting.md)

Canonical contracts: [delivery](https://app.reai.no/openapi/site/ui) and
[management](https://app.reai.no/openapi/public/ui). Source/original generic assets
are MIT; see ASSETS.md. Customer assets must never be added to this public repo.
