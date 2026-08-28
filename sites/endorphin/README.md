# Endorphin storefront

Endorphin storefront on Cloudflare Workers, backed by a Site-scoped ReAI production credential for Famme AS. Editorial pages stay static. Homepage merchandising, products, collections, images, prices, availability, sitemap and checkout come from ReAI at request time.

The production storefront is `https://endorphin.no`, served as a Cloudflare Worker Custom Domain. `https://www.endorphin.no` redirects to the apex. `https://endorphin.respiro.workers.dev` stays as the Site preview host, and Shopify remains on `endorphin-shoes.myshopify.com` for rollback.

## Local development

```sh
cp sites/endorphin/.dev.vars.example sites/endorphin/.dev.vars
npx wrangler dev --cwd sites/endorphin
```

Set `REAI_SITE_TOKEN` in the ignored `.dev.vars` file to a live Site credential. The credential is available only to the Worker and must never be added to browser code or committed.

The Worker provides these storefront routes:

- `GET /` — homepage from published collections (`joggesko`, `sokker`)
- `GET /products/{handle}/`
- `GET /collections/{handle}/` and `/collections/all/`
- `GET /sitemap.xml`
- `GET /reai/site`
- `GET /reai/catalog`
- `GET /reai/collections`
- `GET /reai/collections/{handle}`
- `GET /reai/products/{handle}`
- `GET /reai/availability/{variantId}`
- `POST /reai/checkout/start`

The live Shopify content pages are rebuilt at `/kontakt/`, `/frakt/`,
`/retur/`, `/storrelse/` and `/om/`. The old `/pages/*` URLs, Shopify policy
URLs, `/search` and `/cart` redirect permanently to their rebuilt equivalents
so existing links keep working after cutover. Blog indexes and articles are
intentionally not recreated. Contact links and the local mail-app form use
`post@famme.no`.

Checkout validates public variant UUIDs and quantities at the Worker before ReAI creates an immutable checkout snapshot. The cart button posts to `/reai/checkout/start` and redirects the shopper to `https://app.reai.no/checkout/session/{token}`. The Worker sends `returnUrl` as `{origin}/bestilling/fullfort/`.

## Production

The Worker secret `REAI_SITE_TOKEN` must be a live Site credential from Famme's **Endorphin** Site with scopes `site:read`, `commerce:catalog:read`, `commerce:availability:read` and `commerce:checkout:create`. Site `previewDomain` is `endorphin.respiro.workers.dev`. Site `activeDomain` is `endorphin.no` so checkout return URLs on the live hostname are accepted.

Product images are AVIF and come from each catalog image's immutable master URL plus its 320/480/640/960/1280/1600/1920 rendition metadata. Server-rendered category cards, product cards and galleries emit width-based `srcset`, accurate `sizes` and intrinsic dimensions, so browsers choose the smallest useful file and avoid layout shifts. Shipping is HeltHjem 69 NOK, free over 899 NOK, aligned with the current Famme policy. The storefront also mirrors Famme's 30-day return, free-exchange and label-free-return promises.

## Checks and deployment

From the repository root:

```sh
./site.sh check endorphin
npx wrangler deploy --cwd sites/endorphin
printf '%s' "$REAI_SITE_TOKEN" | npx wrangler secret put REAI_SITE_TOKEN --cwd sites/endorphin
```

Before the first Custom Domain deployment, remove only the Shopify web-origin records for the apex A/AAAA and the `www` CNAME. Preserve all MX and TXT records. Wrangler then creates the Worker-managed DNS records and TLS certificates for both hostnames.
