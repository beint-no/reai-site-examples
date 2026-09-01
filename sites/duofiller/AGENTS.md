# DuoFiller

- Brand: DuoFiller
- Legal company: Brewket AS
- Organization number: 924 622 806
- Contact: post@brewket.no
- Address: Dalavikvegen 93, 5574 Skjold, Norway
- Preview: https://duofiller.respiro.workers.dev/
- ReAI tenant: Brewket AS (`tenant_id=1567`)
- ReAI Site: DuoFiller (`d6d9b484-c474-4f15-9b19-952f67ea7eb9`)

DuoFiller develops compact open can and bottle fillers, connections, and replacement parts for home brewers and small beverage producers. Do not describe the machine as a counter-pressure filler. Purge-gas pressure must never be presented above 3 psi / 0.2 bar.

English lives at `/` and Norwegian lives under `/nb/`. Currency is independent: `?market=norway|europe|international` selects NOK, EUR, or USD. Defaults are `international` on English routes and `norway` on `/nb/`. Hugo owns translated static and editorial pages; the Cloudflare Worker owns live product, collection, availability, cart API, and checkout routes. Both layers read UI text from `i18n/*.json`.

Product titles, prices, variants, availability, collections, and API product images come from the Brewket Site in ReAI. The product files under `static/assets/products` are presentation assets and temporary image fallbacks, not a second catalog. Never add a committed product-price catalog.

Online checkout is enabled. English `/` creates an `international` USD session; Norwegian `/nb/` creates a `norway` NOK session. Adyen keeps Brewket's NOK balance account and converts other shopper currencies. The Worker secret must include `commerce:checkout:create`. Keep `CHECKOUT_ENABLED` as the kill switch; the cart falls back to email if it is false.

Keep the Site credential only in the Cloudflare secret `REAI_SITE_TOKEN`. Never put it in Git, Hugo configuration, HTML, client JavaScript, or Wrangler variables.
