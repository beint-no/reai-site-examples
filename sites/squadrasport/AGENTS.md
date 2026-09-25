# Squadra Sport

Squadra Sport is a Norwegian sportswear and equipment retailer. The current public shop is at https://squadrasport.no.

- Use Norwegian storefront copy and NOK prices.
- Preserve public Shopify product and collection paths when the ReAI catalog arrives.
- Products, collections, prices, images, availability, and checkout come from the ReAI Site API. Do not commit a catalog or read Shopify at runtime.
- Keep the Site credential in the Worker secret. Never expose it in HTML, browser JavaScript, or Git.
- The visible store currently advertises kit and volume discounts. Do not promise those discounts in the new checkout until their rules are confirmed and configured.
- Checkout follows the BudMates flow: the cart starts a hosted ReAI checkout session directly. Adyen payment methods are active; completing checkout can create a real order and charge.
- Do not move the production domain from Shopify as part of storefront development.
