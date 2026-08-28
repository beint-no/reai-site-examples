# ReAI Site API examples

This public repository contains production Cloudflare storefronts powered by the ReAI Site API. Every storefront under `sites/` is independently deployable and is also maintained as readable reference code.

## Repository contract

- Keep the Site credential server-side in a Worker secret. Never commit it, return it to the browser or place it in browser JavaScript.
- Reuse `packages/reai-cloudflare-storefront/` for authentication, API proxying, checkout validation, caching and common security headers.
- Keep brand-specific rendering, content, behavior and styling inside the relevant site directory.
- Product data, collections, prices, availability, images and checkout come from the Site API. Do not add Shopify or a committed catalog as a second source of truth.
- Render API image alt text, intrinsic dimensions and width-based renditions. Fall back to useful product context when alt text is absent.
- Preserve semantic HTML, keyboard operation, visible focus, reduced-motion support and useful metadata.
- Deployment is local-only. CI may validate, test and perform Wrangler dry runs, but must not contain production credentials or deploy production sites.

## Commands

```sh
npm ci
./site.sh list
./site.sh check all
./site.sh deploy <site>
```

Each site has an `AGENTS.md` containing public business context and site-specific constraints. Internal tenant migrations, credential operations and customer handoff notes do not belong in this public repository.
