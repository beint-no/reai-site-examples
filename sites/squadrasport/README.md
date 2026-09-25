# Squadra Sport storefront

Cloudflare Worker storefront for the Squadra Sport ReAI Site. Commerce data is read from the shared ReAI Site API at request time.

## Local setup

1. Create the Squadra Sport Site and a Site credential in ReAI.
2. Copy `.dev.vars.example` to `.dev.vars` and set `REAI_SITE_TOKEN`.
3. Run `npm ci`, `./site.sh check squadrasport`, and `./site.sh dev squadrasport` from the repository root.

The production Worker keeps `CHECKOUT_ENABLED=false`. The review preview permits checkout only after a reviewer enters the access code at `/review/checkout-access`; the code is stored as the preview-only `CHECKOUT_ACCESS_CODE` secret. Access expires after one hour. Do not use the review checkout for customer orders while shipping and legal terms are still under review.

The privacy, return, and sales-term pages are review drafts. See [LEGAL_REVIEW.md](LEGAL_REVIEW.md) for the merchant decisions and operational facts to confirm before enabling checkout.

The canonical domain remains on Shopify until the catalog, checkout, and preview are reviewed. Configure the ReAI Site preview domain before testing hosted checkout. Never commit a Site credential.

The logo and two editorial hero photos were downloaded from the current public Squadra Sport Shopify site for this customer's replacement storefront. They are customer assets excluded from the repository's MIT license.

## Hosted review preview

Use Wrangler 4.135.0 or later with Cloudflare access to create an isolated preview. From this site directory:

```sh
wrangler preview --name review
wrangler preview secret put REAI_SITE_TOKEN --name review
wrangler preview secret put CHECKOUT_ACCESS_CODE --name review
```

Enter the tenant Site credential and a long random reviewer code when prompted. Reapply both preview secrets after each `wrangler preview` deployment; a deployment can omit previously configured secrets. The local `.dev.vars` file is not uploaded to Cloudflare. Check the preview URL returned by Wrangler before sharing it. Without the reviewer code, checkout stays disabled. Creating a preview does not change the Shopify domain or deploy the production Worker.
