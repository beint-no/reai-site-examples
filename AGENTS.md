# ReAI Site API examples

This repository contains Cloudflare storefronts powered by the ReAI Site API. Every storefront under `sites/` is independently runnable and deployable.

## Repository contract

- Keep the Site credential server-side in a Worker secret. Never commit it, return it to the browser or place it in browser JavaScript.
- Reuse `packages/reai-cloudflare-storefront/` for authentication, API proxying, checkout validation, caching and common security headers.
- Keep brand-specific rendering, content, behavior and styling inside the relevant site directory.
- Product data, collections, prices, availability, images and checkout come from the Site API. Do not add Shopify or a committed catalog as a second source of truth.
- Render API image alt text, intrinsic dimensions and width-based renditions. Fall back to useful product context when alt text is absent.
- Preserve semantic HTML, keyboard operation, visible focus, reduced-motion support and useful metadata.
- Target Baseline 2025 in current browsers. Use native ES modules and modern CSS
  without legacy bundles, transpilation, polyfills or obsolete-browser support.
- Deployment is local-only. CI may validate, test and perform Wrangler dry runs, but must not contain production credentials or deploy production sites.

## Commands

```sh
npm ci
./site.sh list
./site.sh check all
./site.sh check-workers all
./site.sh dev <site>
./site.sh deploy <site>
```

Each site has an `AGENTS.md` containing public business context and site-specific constraints. Internal tenant migrations, credential operations and customer handoff notes do not belong in this public repository.
