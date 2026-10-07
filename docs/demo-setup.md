# Connect the single demo store

Use a dedicated demo Site in an authorized test tenant. Other Sites in the same tenant
must stay separate. A tenant named test is not necessarily an Adyen test environment:
verify the backend's provider configuration before enabling public checkout.

The management token must actually have access to the selected tenant. Configure
it as REAI_USER_API_TOKEN in the local environment, never a CLI argument or Git
file. REAI_API_BASE_URL defaults to https://app.reai.no. Site delivery requires
the separate Site token, not this management token.

## Prepare and apply

The public seed describes fictional products: contribution variants 100/500/1,000
kr, Motivation for Greg, a non-redeemable demo gift card and other digital items.
It is setup input and an explicit offline preview fixture, never production fallback.
Review the plan first:

```sh
node demo/tools/setup.mjs --tenant-id <authorized-demo-tenant-id>
```

Apply with ImageMagick installed and REAI_DEMO_VAT_CODE set to the accounting
owner's approved code for the test catalog:

```sh
node demo/tools/setup.mjs --tenant-id <authorized-demo-tenant-id> --apply --write-credential
```

If the tenant's online store module is disabled, explicitly enable it in ReAI or
add --enable-online-store. Setup creates/reuses the named demo Site and NOK price
list, digital product variants, product images/metadata, English translations,
publication and three collections. Seed amounts are the displayed gross prices;
setup derives net price-list entries from the approved VAT code and tenant VAT
registration, and rejects amounts that cannot round-trip exactly. The browser
uses delivered prices directly. It does not alter unrelated Sites, existing
merchant products, payment configuration or hosting. Repeat runs reuse products;
conflicting SKUs/publications stop. Changes completed before an error persist.

The one-time credential goes to ignored .local/demo-site-token with mode 0600;
its value is never printed. It includes Site/catalog/availability/checkout scopes.
The credential environment is live for the configured active domain; that setting
is independent of the backend's Adyen TEST/LIVE environment.

## Connect and publish

Configure the dedicated Site domains to match demosite.reai.no and the actual
Worker preview hostname. Install the token without putting it in an argument:

```sh
npx wrangler secret put REAI_SITE_CREDENTIAL < .local/demo-site-token
```

Keep checkout disabled while verifying live delivery: Site identity/markets,
storefront, catalog, product/collection detail, responsive images and availability.
Enable checkout only after the backend payment mode and merchant disclosures are
confirmed. Set DEMO_CHECKOUT_ENABLED=true and DEMO_PAYMENT_MODE=test or live in the
reviewed Worker configuration; the label must agree with the actual provider.
Merely setting test in this Worker does not switch Adyen into TEST.

Follow [Cloudflare publishing](cloudflare-deployment.md) for the custom domain and
release. Verify a hosted session from the registered hostname. Returning to the
store never proves payment success; the store retains its cart and directs the
shopper to checkout's authoritative status/receipt. No real payment is required
for code validation.
