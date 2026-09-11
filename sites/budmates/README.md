# BudMates storefront

Production storefront for BudMates, served by a Cloudflare Worker. Editorial pages stay static. Homepage merchandising, products, collections, images, prices, availability, sitemap and checkout come from the ReAI Site API at request time.

## Local development

```sh
cp sites/budmates/.dev.vars.example sites/budmates/.dev.vars
npx wrangler dev --cwd sites/budmates
```

Set `REAI_SITE_TOKEN` in the ignored `.dev.vars` file to a preview Site credential. The credential is available only to the Worker and must never be added to browser code or committed.

The Worker provides these storefront routes:

- `GET /` — homepage from published collections (`bestselgere` and similar)
- `GET /products/{handle}` — product page from `GET /site/v1/commerce/products/{handle}`
- `GET /collections/{handle}` and `/collections/all`
- `GET /cart` and `/search?q={query}`
- `GET /pages/om-oss`, `/pages/kontakt-oss`, `/pages/faq`, `/pages/frakt`, `/pages/salgsvilkar`
- `GET /policies/privacy-policy` and `/policies/refund-policy`
- `GET /blogs/news` and `/blogs/news/{handle}`
- `GET /sitemap.xml` — published catalog plus remaining static routes
- `GET /reai/site`
- `GET /reai/catalog`
- `GET /reai/collections`
- `GET /reai/collections/{handle}`
- `GET /reai/products/{handle}`
- `GET /reai/availability/{variantId}`
- `POST /reai/checkout/start`

Checkout validates public variant UUIDs and quantities at the Worker before ReAI creates an immutable checkout snapshot. The cart button posts to `/reai/checkout/start` and redirects the shopper to `https://app.reai.no/checkout/session/{token}` for customer details and payment. The Worker sends `returnUrl` as `{origin}/bestilling/fullfort/`. After a completed payment the shopper lands on that thank-you page, which clears the local cart. Failed payments should remain on `app.reai.no`.

## Production checkout

`https://budmates.respiro.workers.dev` uses a Site-scoped production credential with scopes `site:read`, `commerce:catalog:read`, `commerce:availability:read` and `commerce:checkout:create`. Set Site `activeDomain` to `budmates.no` and `previewDomain` to `budmates.respiro.workers.dev` so checkout return URLs are accepted on both hosts.

Product images are AVIF and come from the catalog image `url` plus its 320/480/640/960/1280/1600/1920 `renditions`. Server-rendered category features, cards and galleries emit `srcset`, `sizes` and intrinsic dimensions, so the browser downloads the smallest useful immutable rendition without layout shifts. The Worker CSP allows `https://app.reai.no` in `img-src`. Shipping is `Standard` at 69 NOK, free from 850 NOK; that line stays as template copy until Site API exposes shipping methods.

The canonical production hostname is `https://budmates.no`; `www.budmates.no` redirects to it. The workers.dev hostname remains available for preview.

## URL compatibility

Public paths match the original Shopify site, without trailing slashes. Static files use Cloudflare's `drop-trailing-slash` HTML handling. `routes.mjs` redirects old Worker bookmarks (`/handlekurv/`, `/sok/`, `/artikler/`, `/om/`, etc.) permanently to their canonical equivalents while preserving query strings. Collection-scoped product links redirect to `/products/{handle}`. Links, canonical metadata, structured data and the dynamic sitemap use the same paths.

The original empty blog and `/pages/blogg-posts` redirect to `/blogs/news`. English `/en/...` links redirect to the Norwegian equivalent; the Worker does not yet offer translated storefront content. `/account/login` explains guest checkout and provides order support; customer authentication and Shopify account history are not implemented. The original privacy request page URLs provide email contact instead of embedding the Shopify privacy app.

The September 8, 2026 comparison of both public sitemaps found all 25 articles and all 94 ReAI-published product handles aligned. Nine additional Shopify product handles return 404 from the ReAI product API. Those require publication in ReAI; routing must not replace them with a committed catalog or a Shopify API fallback. Empty `frontpage` and `ligher` collections remain excluded from navigation and the sitemap.

## Checks and deployment

From the repository root:

```sh
./site.sh check budmates
./site.sh deploy budmates
```

The deployment is local-only and publishes to `budmates.respiro.workers.dev`.

When authenticated through `npx wrangler login`, run the checks above, then `npx wrangler deploy --cwd sites/budmates` from the repository root. The repository deploy wrapper requires API-token environment variables and does not use the OAuth-only workflow.

Before the first deploy, configure the secret for the Worker:

```sh
printf '%s' "$REAI_SITE_TOKEN" | npx wrangler secret put REAI_SITE_TOKEN --cwd sites/budmates
```
