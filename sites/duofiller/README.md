# DuoFiller

Bilingual Hugo storefront for Brewket AS, with live commerce rendered by the shared ReAI Cloudflare Worker package.

```bash
../../site.sh build duofiller
../../site.sh dev duofiller
../../site.sh secret duofiller
../../site.sh deploy duofiller
```

English is served from `/` and Norwegian from `/nb/`. Currency is selected separately with `?market=norway|europe|international` (NOK, EUR, USD). English defaults to `international`; `/nb/` defaults to `norway`. Hugo builds static pages and validates their internal links. The Worker renders `/products/*`, `/collections/*`, the locale-prefixed equivalents, Site API proxy routes, and checkout startup at request time.

Static and Worker-owned interface copy is translated in `i18n/en.json` and `i18n/nb.json`. ReAI resolves dynamic product and collection translations for the configured locale and variant prices for the configured market. Do not duplicate catalog translations or prices into Hugo content.

The deployed preview requires one Brewket Site credential with these scopes:

- `site:read`
- `commerce:catalog:read`
- `commerce:availability:read`
- `commerce:checkout:create`

Set its plaintext token with `../../site.sh secret duofiller`. The token identifies both the ReAI Site and Brewket tenant; no tenant ID belongs in Worker configuration.

Checkout is on. Locale comes from the path and market/currency from `?market=`, so Norwegian USD is `/nb/?market=international` and English NOK is `/?market=norway`. Adyen converts non-NOK captures into Brewket's NOK balance account. Set `CHECKOUT_ENABLED` to `false` to restore the email order-request fallback.
