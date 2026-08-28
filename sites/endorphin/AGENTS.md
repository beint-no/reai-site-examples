# Endorphin

## Client

- Brand: Endorphin (joggesko and socks).
- Live storefront: https://endorphin.no (Cloudflare Worker). Shopify rollback remains at `endorphin-shoes.myshopify.com`.
- Contact e-mail for this rebuild: post@famme.no.
- Customer service hours stated on the live store: Monday–Friday 09.00–15.00.
- Famme AS (org.nr. 913 300 319), Rosenbergveien 15, 0963 Oslo, is the live merchant of record for this Worker storefront.

## This deployment

- Cloudflare Worker `endorphin` on `https://endorphin.no` and `https://endorphin.respiro.workers.dev`.
- A Site-scoped ReAI production credential connects the storefront to Famme's Endorphin Site, catalog and checkout.
- `endorphin.no` and `www.endorphin.no` are Worker Custom Domains. `www` redirects permanently to the apex. ReAI `previewDomain` is `endorphin.respiro.workers.dev`; `activeDomain` is `endorphin.no`.

## Site direction

- The current storefront route is `nb-NO` in market `NO`. Keep source-owned translations under `locales/` or locale-specific static folders and catalog translations in ReAI; follow `docs/localization.md` for new folder, domain or currency-market routes. Keep the light cream chrome, dark Endorphin wordmark and coral accent distinct from Budmates.
- Catalog, images, prices, availability, collections, sitemap and checkout come from the ReAI Site API at request time.
- Product image masters and 320/480/640/960/1280/1600/1920 AVIF renditions come from each catalog image's `url` and `renditions` fields. Render width-based `srcset`/`sizes` with intrinsic dimensions; do not reconstruct media URLs or send masters to thumbnail slots.
- Editorial pages stay static: `om/`, `kontakt/`, `frakt/`, `retur/`, `storrelse/`, `faq/`, `vilkar/`, `personvern/`.
- Cart state is scoped by market. Checkout posts variant UUIDs to the locale route's `/reai/checkout/start` and redirects to ReAI hosted checkout. Success return is the localized `/bestilling/fullfort/`.
- Contact form opens the visitor's mail app to `post@famme.no`. It does not collect data.
- The Site reuses Famme's existing products. The storefront must treat API prices, variants and availability as authoritative.

## Catalog on this Site

Partial catalog on the Endorphin Site only:

- Joggesko from Famme's shoe lineup: RX1 (endorphin.no), plus RX2, AirStep and 90S Trainers from famme.no.
- Accessories are the existing 1-pack and 3-pack Sky Knit socks from Famme, kept out of the shoe grid.
- Color and size are independent pill buttons, never a `<select>` of every variant. Same pattern as famme.no / Dawn-style shops.

## Handoff

- The five non-blog content pages in the live Shopify sitemap are recreated as
  static pages. Their legacy `/pages/*` URLs, the Shopify policy URLs, `/search`
  and `/cart` redirect permanently to the corresponding rebuilt pages. Blog
  indexes and articles are intentionally not recreated.
- Keep the Worker secret scoped to the Famme Endorphin Site.
- Site API does not yet expose shipping methods to the storefront. Keep ReAI checkout and all storefront copy aligned with Famme's current promise: HeltHjem 69 kr, free over 899 kr; 30-day return, free exchange and label-free return.
- Product ratings and review excerpts are curated from the corresponding live Famme.no shoe pages. Keep the source links, counts and excerpts factual when updating them.
- Lifestyle photography in `public/assets/lifestyle/` comes from the corresponding Famme product media. Do not show one model's photography on a different product page.
- Do not invent Famme opening hours beyond the contact-page hours already on endorphin.no, or Rdnt legal entity details not confirmed in ReAI.
