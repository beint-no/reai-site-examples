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

Apply with librsvg (rsvg-convert) installed and REAI_DEMO_VAT_CODE set to the accounting
owner's approved code for the test catalog:

```sh
node demo/tools/setup.mjs --tenant-id <authorized-demo-tenant-id> --apply --write-credential
```

If the tenant's online store module is disabled, explicitly enable it in ReAI or
add --enable-online-store. Setup creates/reuses the named demo Site and NOK price
list, digital product variants, product images/metadata, English translations,
publication, three manual collections and one brand-based automated collection.
It also seeds an illustrative compare-at price and three market-scoped demo codes:
REAI-DEMO10 (10% catalog-wide), REAI-MAGI20 (20% on Kontormagi with 100 NOK
eligible undiscounted gross minimum), and REAI-FRAKT (free shipping only).
Customers enter codes in hosted checkout; session creation does not accept a code.
Free shipping has no effect on this digital catalog. Existing conflicting rules
stop setup rather than silently overwrite an operator change. Seed amounts are the displayed gross prices;
Image uploads use a content fingerprint for idempotent retries and librsvg to
preserve the original gradients and SVG filters.
setup derives net price-list entries from the approved VAT code and tenant VAT
registration, and rejects amounts that cannot round-trip exactly. The browser
uses delivered prices directly. It does not alter unrelated Sites, existing
merchant products, payment configuration or hosting. Repeat runs reuse products;
conflicting SKUs/publications stop. Changes completed before an error persist.

The one-time credential goes to ignored .local/demo-site-token with mode 0600;
its value is never printed. It includes Site/catalog/availability/checkout and newsletter:subscribe scopes.
The credential environment is live for the configured active domain; that setting
is independent of the backend's Adyen TEST/LIVE environment.

## B2B invoice orders and local pickup

Configure these separately from catalog seeding, using an authorized management
token with Site write access. Preview the plan, then repeat with --apply:

```sh
node demo/tools/commerce-options.mjs --tenant-id <authorized-demo-tenant-id> --enable-business-sales --demo-pickup
node demo/tools/commerce-options.mjs --tenant-id <authorized-demo-tenant-id> --enable-business-sales --demo-pickup --apply
```

The command verifies the named Site/domains and Norwegian default market before
writing. It enables company checkout for this Site and adds one free, explicitly
demo-only pickup method; repeat runs do not duplicate it or change carrier methods.
Conflicting pickup instructions stop before either change. Completed writes persist
if a later request fails. It never issues invoices, sends EHF or changes payments.

Invoice checkout creates a real unpaid order; the merchant issues its invoice
later in ReAI. Verify receiving-account details and invoice settings before a
merchant starts invoicing. EHF uses recipient eligibility/Peppol registration and
the order's delivery setting; email is the configured fallback. Tenant EHF
registration alone does not prove outgoing delivery. See the [checkout guide](checkout.md).

Pickup appears only for physical goods. These digital demo products show no
shipping choices. A real merchant must supply real collection instructions;
the demo-only method offers no physical fulfillment or collection location.

## Connect and publish

Configure the dedicated Site domains to match nettbutikk.reai.no and the actual
Worker preview hostname. Install the token without putting it in an argument:

```sh
npx wrangler secret put REAI_SITE_CREDENTIAL < .local/demo-site-token
```

Keep checkout disabled while verifying live delivery: Site identity/markets,
storefront, catalog, product/collection detail, responsive images and availability.
Enable checkout only after the backend payment mode and merchant disclosures are
confirmed. Set DEMO_CHECKOUT_ENABLED=true and DEMO_PAYMENT_MODE=test or live in the
reviewed Worker configuration; the label must agree with the actual provider.
For live payments, set DEMO_MERCHANT_NAME and DEMO_MERCHANT_ORG_NUMBER to the
verified recipient. Missing merchant name disables live checkout. The published
demo uses production Adyen LIVE and identifies its recipient before checkout;
the offline preview remains payment-free.
Merely setting test in this Worker does not switch Adyen into TEST.

Follow [Cloudflare publishing](cloudflare-deployment.md) for the custom domain and
release. Verify a hosted session from the registered hostname. Returning to the
store never proves payment success; the store retains its cart and directs the
shopper to checkout's authoritative status/receipt. No real payment is required
for code validation.
