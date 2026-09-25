# Squadra Sport storefront

Cloudflare Worker storefront for the Squadra Sport ReAI Site. Commerce data is read from the shared ReAI Site API at request time.

## Local setup

1. Create the Squadra Sport Site and a Site credential in ReAI.
2. Copy `.dev.vars.example` to `.dev.vars` and set `REAI_SITE_TOKEN`.
3. Run `npm ci`, `./site.sh check squadrasport`, and `./site.sh dev squadrasport` from the repository root.

The Worker is deliberately configured with `CHECKOUT_ENABLED=false`. Enable checkout only after merchant onboarding, shipping and legal terms are approved, and a complete order has passed testing.

The privacy, return, and sales-term pages are review drafts. See [LEGAL_REVIEW.md](LEGAL_REVIEW.md) for the merchant decisions and operational facts to confirm before enabling checkout.

The canonical domain remains on Shopify until the catalog, checkout, and preview are reviewed. Configure the ReAI Site preview domain before testing hosted checkout. Never commit a Site credential.

The logo and two editorial hero photos were downloaded from the current public Squadra Sport Shopify site for this customer's replacement storefront. They are customer assets excluded from the repository's MIT license.
