# Kebab King Trondheim storefront

Migration of the Kebab King Trondheim production website from
`customer-sites/live-production-sites/kebabking`. The original design, public
business content, images, language switch, opening-status behavior, contact
details, and opening hours are retained. Homepage menu content, collections,
products, prices, availability, sitemap, cart, and checkout are rendered from
the ReAI Site API.

The existing `customer-sites` deployment remains active until catalog setup,
customer review, checkout verification, and production cutover are approved.
Merging this directory does not deploy it or remove the existing Worker.

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

The Wrangler configuration preserves the existing Worker name and production
domains for the eventual coordinated cutover. Do not deploy this site while the
current production Worker is still authoritative unless the cutover is approved.
