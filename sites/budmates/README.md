# BudMates storefront

Production storefront for BudMates, served by a Cloudflare Worker. Editorial pages stay static. Homepage merchandising, products, collections, images, prices, availability, sitemap and checkout come from the ReAI Site API at request time.

## Local development

```sh
cp sites/budmates/.dev.vars.example sites/budmates/.dev.vars
npx wrangler dev --cwd sites/budmates
```

Set `REAI_SITE_TOKEN` in the ignored `.dev.vars` file to a preview Site credential. The credential is available only to the Worker and must never be added to browser code or committed.

The current route is `nb-NO` in the `NO` market. Add interface translations under `locales/`, static editorial translations in locale folders and hostname/path mappings in `worker.js`; follow the repository [localization and markets guide](../../docs/localization.md). A market route selects a ReAI Site price list, while its locale selects text and formatting.

The Worker provides these storefront routes:

- `GET /` — homepage from published collections (`bestselgere` and similar)
- `GET /products/{handle}/` — product page from `GET /site/v1/commerce/products/{handle}`
- `GET /collections/{handle}/` and `/collections/all/`
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

`https://budmates.respiro.workers.dev` uses a Site-scoped production credential with scopes `site:read`, `commerce:catalog:read`, `commerce:availability:read` and `commerce:checkout:create`. The Site `activeDomain` and `previewDomain` must be `budmates.respiro.workers.dev` so checkout return URLs are accepted.

Product images are AVIF and come from the catalog image `url` plus its 320/480/640/960/1280/1600/1920 `renditions`. Server-rendered category features, cards and galleries emit `srcset`, `sizes` and intrinsic dimensions, so the browser downloads the smallest useful immutable rendition without layout shifts. The Worker CSP allows `https://app.reai.no` in `img-src`. Shipping is `Standard` at 69 NOK, free from 850 NOK; that line stays as template copy until Site API exposes shipping methods.

Leave `https://budmates.no` on Shopify until the client cutover.

## Checks and deployment

From the repository root:

```sh
./site.sh check budmates
./site.sh deploy budmates
```

The deployment is local-only and publishes to `budmates.respiro.workers.dev`.

Before the first deploy, configure the secret for the Worker:

```sh
printf '%s' "$REAI_SITE_TOKEN" | npx wrangler secret put REAI_SITE_TOKEN --cwd sites/budmates
```
