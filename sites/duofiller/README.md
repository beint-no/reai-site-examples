# DuoFiller

Bilingual Hugo storefront for Brewket AS, with live commerce rendered by the shared ReAI Cloudflare Worker package.

```bash
../../site.sh build duofiller
../../site.sh dev duofiller
../../site.sh secret duofiller
../../site.sh deploy duofiller
```

English is served from `/`; Norwegian is served from `/nb/`. Hugo builds static pages and validates their internal links. The Worker renders `/products/*`, `/collections/*`, the locale-prefixed equivalents, Site API proxy routes, and checkout startup at request time.

Static and Worker-owned interface copy is translated in `i18n/en.json` and `i18n/nb.json`. ReAI currently publishes one content language per Site, so product and collection fields use the Brewket catalog's English source copy in both route trees. Do not add an unsupported `locale` query parameter or duplicate prices into Hugo content.

The deployed preview requires one Brewket Site credential with these scopes:

- `site:read`
- `commerce:catalog:read`
- `commerce:availability:read`

Set its plaintext token with `../../site.sh secret duofiller`. The token identifies both the ReAI Site and Brewket tenant; no tenant ID belongs in Worker configuration.

Checkout support is implemented but `CHECKOUT_ENABLED` remains `false` while ReAI only has global flat-rate shipping and Brewket's rates vary by destination. The cart opens an order email in this state. To enable payment, configure suitable Site shipping methods, create a replacement credential that also has `commerce:checkout:create`, store it in Cloudflare, and set `CHECKOUT_ENABLED` to `true`.
