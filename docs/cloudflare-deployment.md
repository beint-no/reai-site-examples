# Host a ReAI storefront on Cloudflare

Each example has a Worker entrypoint, a Wrangler configuration and generated
Static Assets. The Worker reads ReAI through the server-side Site client and
serves its own HTML/CSS/JavaScript. Product photos normally use ReAI image URLs.

For a real client, export the selected design into a private standalone repo
first. Its Worker identifier and publishing permissions belong to that client.
The public examples repository contains test Worker names and no production
routes or credentials.

## Configure and publish

1. Install dependencies and run the exported repository's checks.
2. Replace the test Worker name with the intended unique identifier.
3. Set `REAI_API_BASE_URL` to the intended ReAI deployment.
4. Configure the Site's preview domain for the expected workers.dev hostname.
5. Store the Site-scoped secret through Wrangler.
6. Deploy with Cloudflare credentials for the correct account.

```sh
npm ci
npm run check
npx wrangler secret put REAI_SITE_CREDENTIAL
# Authorized operator only, from the private client checkout:
npm run deploy
```

Wrangler can use the operator's configured authentication. For token-based
publishing, supply CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID through the
operator environment. Never commit them or include them in browser code.

## Custom domains

Add the approved hostname to the client's Wrangler routes and coordinate its
Cloudflare custom-domain setup and Site activeDomain. Preserve mail records,
verification records and any unrelated hosts. Moving a repository or updating
a submodule pointer does not require a DNS change.

Workers hosting and an origin-server A/AAAA configuration are different hosting
models. Follow the client's actual deployment instructions; do not replace
Worker custom domains with an unrelated origin merely to copy an example.

## Verify the published version

Check HTTPS, canonical redirects, authored pages, catalog rendering, option
selection, responsive images and relevant availability behavior. Verify the
registered checkout return path and payment setup through the appropriate test
flow. Review recent Worker errors. Preview and production credentials must be
selected intentionally.

This public repo's CI validates both example bundles with Wrangler dry runs. It
has no production credentials and does not deploy. An individual client may
use an approved independent CI publishing workflow; repository admin access and
production publishing permission remain separate decisions.
