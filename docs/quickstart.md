# Run the demo or export a client starter

## Explore locally

```sh
npm ci
npm run demo
```

Open the printed loopback URL. This explicit offline preview uses the fictional
seed definitions and rejects checkout. It exercises design, routes, variants,
collections, cart and public API exploration without an account or token.

## Connect the Worker

Choose one authorized demo tenant/Site. Follow [management](management.md) to
configure a market, publish the demo products and collections, and issue a scoped
credential. Use the live management OpenAPI for request fields. Keep operator
credentials and internal IDs outside this public source tree.

Create ignored .dev.vars at the repository root:

```text
REAI_SITE_CREDENTIAL=<Site-scoped delivery token>
```

Run npm run dev. wrangler.jsonc selects the backend, market and explicit checkout
mode. The Worker discovers allowed locales from Site metadata. Configure Norwegian
and English in ReAI to demonstrate translated product/collection data.

## Enable checkout deliberately

Verify the actual payment environment and merchant readiness first. A test
company or preview credential does not automatically use Adyen TEST. Use
DEMO_CHECKOUT_ENABLED=true only with a verified DEMO_PAYMENT_MODE=test or live.
The public UI must accurately disclose that mode. Do not run real payment tests
or promise a redeemable gift card without an implemented service.

Register active/preview domains in the Site to permit checkout return URLs.
The Worker sends only public variant IDs and quantities; ReAI validates the final
amount and returns its hosted checkout URL. [Checkout details](checkout.md).

## Export a private starter

```sh
npm run export -- storefront /absolute/path/to/new-private-repo
```

The exporter refuses an existing destination and includes required code/assets,
with no hub dependency or offline fixtures. Create the private client repository,
fill in its AGENTS.md business brief and deployment identity, generate/commit its
lockfile, run its checks and configure its own Site credential. This operation
does not create a tenant, deploy a Worker or grant access.
