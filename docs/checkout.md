# Hosted checkout

The browser stores cart lines locally as opaque variant IDs and quantities. It posts them to the storefront Worker, not directly to ReAI.

```json
{
  "lines": [
    {
      "variantId": "00000000-0000-4000-8000-000000000000",
      "quantity": 1
    }
  ]
}
```

The shared Worker accepts between 1 and 100 lines, validates UUID shape and limits each quantity to 1–20. It adds a return URL on the current storefront origin and creates the checkout through:

```http
POST /site/v1/commerce/checkout-sessions
Idempotency-Key: <unique request key>
```

ReAI resolves publication, price, tax, discounts, shipping and availability again when it creates the immutable checkout snapshot. The browser then opens the returned `checkoutUrl` on `app.reai.no`, where customer and payment details are collected.

Only clear the local cart after ReAI returns the shopper to the configured success page. A failed or abandoned checkout must not appear successful merely because the shopper revisits the cart.

The Site's configured preview and active domains restrict accepted return origins. Configure them before testing checkout on a new hostname.
