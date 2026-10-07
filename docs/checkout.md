# Hosted checkout, shipping and payment

The browser owns cart selection: public variant UUIDs and positive quantities.
The trusted Worker validates the input and creates a ReAI session. It must not
accept browser-supplied totals, discounts, shipping prices or private IDs as
pricing authority.

```json
{"lines":[{"variantId":"00000000-0000-4000-8000-000000000001","quantity":1}]}
```

The starter accepts same-origin JSON POSTs to `/checkout/start`, limits the
request to 16 KiB, accepts 1–100 lines and 1–20 units per line, and passes an
Idempotency-Key to `POST /site/v1/commerce/checkout-sessions`. These are starter
boundary limits; use the API contract for the authoritative backend rules.

ReAI validates current publication, market price and availability and creates
an immutable checkout snapshot. The Worker returns only `checkoutUrl`. The
shopper opens that URL on ReAI's hosted checkout to provide contact, delivery
and payment information. The website does not need to collect card details.

## Domains and return paths

The Worker supplies a return URL under its own origin. ReAI validates that
origin against the Site's preview/active domains. Configure them before testing
on a new hostname. A new Cloudflare preview URL does not automatically become
an allowed checkout return origin.

The starter returns to `/checkout/complete`. Its browser script clears the cart
when the return page is reached after the browser started a checkout. That
client-side marker is a UX signal, not proof of payment. Do not use a success
page visit to issue goods or mark an order paid; ReAI's order/payment state is
that authority. Failed and abandoned checkouts must not be treated as orders
merely because a user navigates to a return page manually.

## Shipping

Shipping methods and prices are configured for Site commerce/market context.
Physical goods need eligible shipping; digital-only carts may not. Configure
product weights, parcel dimensions, pickup/address rules and actual merchant
prices before launch. Do not copy an example's shipping rates into a client
configuration without approval.

Customer checkout uses configured shipping prices and eligibility. It is not a
promise that the carrier will later accept a booked shipment, and it is not a
live carrier-cost quote. Pickup locations are discovered and validated for the
selected option. The order preserves accepted delivery snapshots even if future
shipping configuration changes.

Store pickup is separate from carrier pickup points/lockers. Configure it through
`POST /api/sites/{siteId}/commerce/markets/{marketId}/shipping-methods/pickup`
with name and pickupDetails. It is free, preserves merchant collection instructions
on the order, needs no delivery address and creates no carrier booking. Digital-only
carts show neither carrier shipping nor store pickup.

## B2B invoice orders and EHF

Enable company checkout per Site with
`PUT /api/sites/{siteId}/commerce/business-sales` and `{"enabled":true}`.
Hosted checkout then offers company search and invoice ordering alongside the
payment flow. Site session creation stays the same: variant IDs, quantities and
return URL. Do not add company, invoice or bank data to delivery-API responses.

Submitting the invoice option creates a real unpaid order and sends an order
confirmation; it does not issue an invoice or charge through Adyen. The merchant
issues the invoice from the order in ReAI. Payment terms and receiving account
come from invoice configuration. Positive bank-transfer invoices require an
active account with receiving details before issuance.

ReAI supports Norwegian EHF invoices and credit notes through Peppol. For eligible
Norwegian companies with a valid organization number, orders normally select EHF.
On invoice issuance, ReAI attempts EHF when selected and supported; successful
delivery requires a registered recipient. Configured invoice email is the fallback
when EHF cannot be delivered. Invoice delivery history and payment state are separate.
A company lookup, tenant EHF registration or return redirect proves none of them.
See [DFØ's EHF guide](https://www.anskaffelser.no/kategorispesifik-veiledning/fagsystemer-digitale-anskaffelser/elektronisk-handelsformat-ehf).

Validate setup and checkout choices without submitting real orders or sending
invoices as a test. The demo's [setup command](demo-setup.md) changes only Site
checkout/pickup configuration; it never performs those financial actions.

## Payment prerequisites

A catalog and checkout session can exist before a merchant can accept payment.
Payment requires the tenant's payment setup, including an active Adyen ecommerce
store and configured ReAI Adyen integration. Treat onboarding and supported
payment methods as separate launch work. Never test payment with a live
credential assuming that a workers.dev URL prevents real charges.

Session creation checks availability. Stock reservation occurs during payment
initiation, including bundle components; the browser cannot reserve inventory
by adding items to localStorage. Public checkout conflicts may describe the
maximum purchasable quantity without exposing warehouse details.

The offline design demo rejects all checkout creation and never talks to a
payment provider.
