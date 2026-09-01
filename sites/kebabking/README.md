# Kebab King Trondheim storefront

Cloudflare storefront shell for Kebab King Trondheim. Homepage merchandising,
collections, products, images, prices, availability, sitemap, and checkout are
rendered from the ReAI Site API at request time.

The current production website remains unchanged. This site is a separate
preview target until catalog configuration, customer review, and domain cutover
are approved.

## Local development

```sh
cp sites/kebabking/.dev.vars.example sites/kebabking/.dev.vars
npx wrangler dev --cwd sites/kebabking
```

Set `REAI_SITE_TOKEN` to a Site-scoped preview credential. Never commit the
credential or expose it to browser code.

## Routes

- `GET /`
- `GET /products/{handle}/`
- `GET /collections/{handle}/` and `/collections/all/`
- `GET /sitemap.xml`
- `GET /reai/site`, `/reai/catalog`, `/reai/collections`
- `GET /reai/products/{handle}` and `/reai/availability/{variantId}`
- `POST /reai/checkout/start`

Checkout redirects to the ReAI-hosted checkout and returns successful orders to
`/bestilling/fullfort/`.

## Checks

```sh
./site.sh check kebabking
./site.sh check-workers kebabking
```
