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
