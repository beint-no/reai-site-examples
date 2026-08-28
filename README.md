# ReAI Site API storefronts

Production e-commerce storefronts built with semantic HTML, modern CSS, small browser-side JavaScript, Cloudflare Workers and the [ReAI Site API](https://app.reai.no/openapi/site/ui).

These are real stores rather than disposable demos:

| Storefront | Live site | Character |
| --- | --- | --- |
| [Budmates](sites/budmates/) | [budmates.respiro.workers.dev](https://budmates.respiro.workers.dev) | Product-rich Norwegian specialist retailer |
| [Endorphin](sites/endorphin/) | [endorphin.no](https://endorphin.no) | Editorial footwear storefront |

Both sites use the shared [`reai-cloudflare-storefront`](packages/reai-cloudflare-storefront/) Worker integration. Their renderers, content and visual systems remain separate to show that the API does not impose a storefront theme.

## What the examples cover

- Server-rendered products, collections and sitemap content
- Site-scoped bearer credentials that never reach browser code
- Live availability and hosted checkout
- Responsive AVIF image renditions, intrinsic dimensions and API-provided alt text
- Static editorial pages alongside dynamic commerce routes
- Worker caching, security headers, canonical redirects and static asset delivery

## Run locally

Requirements: Node.js 20 or newer, a ReAI Site credential and a Cloudflare account for deployment.

```sh
npm ci
cp sites/budmates/.dev.vars.example sites/budmates/.dev.vars
# Add a preview Site credential to the ignored .dev.vars file.
npx wrangler dev --cwd sites/budmates
```

Use `sites/endorphin` instead to run the other storefront.

## Check and deploy

```sh
./site.sh list
./site.sh check all
./site.sh deploy budmates
```

Deployment is intentionally local. GitHub Actions validates the examples but does not hold production credentials or deploy either store.

Start with [the quickstart](docs/quickstart.md), then read the [architecture](docs/architecture.md), [authentication](docs/authentication.md), [catalog and image](docs/catalog-and-images.md), [checkout](docs/checkout.md) and [Cloudflare deployment](docs/cloudflare-deployment.md) guides.

## Licensing

Reusable source code is MIT licensed. Customer names, trademarks, logos, photography, product data and editorial content are not granted for reuse; see [ASSETS.md](ASSETS.md).
Production Cloudflare storefronts built with the ReAI Site API
