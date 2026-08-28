# ReAI Site API storefronts

Cloudflare storefront implementations for the [ReAI Site API](https://app.reai.no/openapi/site/ui), built with semantic HTML, modern CSS and small browser-side JavaScript.

The repository keeps the reusable API and Cloudflare integration separate from each storefront's rendering, content and visual system. Adding a storefront does not require changing the shared Worker or the validation workflow.

## Repository layout

- `packages/reai-cloudflare-storefront/` — authentication, API routing, checkout validation, caching, security headers and static asset fallback
- `sites/` — independently runnable and deployable storefronts
- `docs/` — integration and deployment guides

## What the repository covers

- Server-rendered products, collections and sitemap content
- Site-scoped bearer credentials that never reach browser code
- Live availability and hosted checkout
- Responsive AVIF image renditions, intrinsic dimensions and API-provided alt text
- Static editorial pages alongside dynamic commerce routes
- Worker caching, security headers, canonical redirects and static asset delivery

## Run locally

Requirements: Node.js 26 or newer, npm 11 or newer, a ReAI Site credential and a Cloudflare account for deployment.

```sh
npm ci
./site.sh list

# Select a storefront from the list.
storefront_name=your-storefront
cp "sites/$storefront_name/.dev.vars.example" "sites/$storefront_name/.dev.vars"
# Add a Site credential to the ignored .dev.vars file.
./site.sh dev "$storefront_name"
```

## Check and deploy

```sh
./site.sh list
./site.sh check all
./site.sh check-workers all
./site.sh deploy storefront-name
```

Deployment is local. GitHub Actions validates the repository but does not hold production credentials or deploy storefronts.

Start with [the quickstart](docs/quickstart.md), then read the [architecture](docs/architecture.md), [authentication](docs/authentication.md), [catalog and image](docs/catalog-and-images.md), [checkout](docs/checkout.md) and [Cloudflare deployment](docs/cloudflare-deployment.md) guides.

## Licensing

Reusable source code is MIT licensed. Customer names, trademarks, logos, photography, product data and editorial content are not granted for reuse; see [ASSETS.md](ASSETS.md).
