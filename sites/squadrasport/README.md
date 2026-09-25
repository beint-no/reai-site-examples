# Squadra Sport storefront

Cloudflare Worker storefront for the Squadra Sport ReAI Site. Commerce data is read from the shared ReAI Site API at request time.

## Local setup

1. Create the Squadra Sport Site and a Site credential in ReAI.
2. Copy `.dev.vars.example` to `.dev.vars` and set `REAI_SITE_TOKEN`.
3. Run `npm ci`, `./site.sh check squadrasport`, and `./site.sh dev squadrasport` from the repository root.

The cart starts ReAI hosted checkout directly, as on BudMates. Adyen payment methods are active, so completing checkout can create a real order and charge.

The privacy, return, and sales-term pages are review drafts. See [LEGAL_REVIEW.md](LEGAL_REVIEW.md) for the merchant decisions and operational facts to confirm with the merchant. The public domain is live at the merchant’s request while these confirmations remain open.

The canonical domain is routed to this Worker through Cloudflare. The original apex DNS record is backed up outside the repository for rollback, and Shopify catalog JSON is available on the shop's `myshopify.com` hostname. Never commit a Site credential.

The logo and two editorial hero photos were downloaded from the current public Squadra Sport Shopify site for this customer's replacement storefront. They are customer assets excluded from the repository's MIT license.

## Hosted review preview

Use Wrangler 4.135.0 or later with Cloudflare access to create an isolated preview. From this site directory:

```sh
wrangler preview --name review
wrangler preview secret put REAI_SITE_TOKEN --name review
```

Enter the tenant Site credential when prompted. Reapply the preview secret after each `wrangler preview` deployment; a deployment can omit previously configured secrets. The local `.dev.vars` file is not uploaded to Cloudflare. Check the preview URL returned by Wrangler before sharing it. Creating a preview does not change the live routes or deploy the production Worker.
