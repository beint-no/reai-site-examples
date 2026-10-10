# Commerce showcase

[nettbutikk.reai.no](https://nettbutikk.reai.no) is one educational site on the
existing reai-demo-store Worker. The former demosite.reai.no host redirects here,
preserving paths and queries. Old-host mutation requests return 409 rather than
forwarding checkout or newsletter writes across origins.

| Surface | Data and purpose |
| --- | --- |
| / | Platform primitives, ownership boundaries, design gallery and consent signup |
| /designs/studio/ | Live catalog, API-backed color choices and a cart drawer |
| /designs/atelier/ | Same live catalog in an editorial design |
| /designs/supply/ | Same live catalog with per-variant availability |
| /scenarios/studio/ and /scenarios/supply/ | Isolated physical-product UI fixtures: mixed stock, all available, sold out, backorders and availability changes |
| /shop/, /products/, /collections/, /cart/ | Live digital demo commerce and bounded hosted-checkout startup |
| /features/ and /learn/ | Payments, B2B/EHF, shipping/pickup, discounts, catalog, markets, integration and newsletter consent |
| /api/ | All nine delivery reads; checkout and newsletter have their own forms |

Scenario carts use separate storage keys and non-UUID choices. They never call
checkout or create fulfillment. Live unavailable data produces an error. Design
photographs are original AI-generated illustrations, not physical inventory.
Digital demo gift cards have no redemption balance. The live checkout remains with
Better Integration and explicitly identifies real payments and invoice orders.

Newsletter signup forwards only email and explicit consent through newsletter:subscribe.
No campaign email, discount or customer-existence disclosure is produced. An offline
preview cannot record consent. The merchant handles consent withdrawal.

Run npm run demo for the offline catalog, or npm run dev with an ignored .dev.vars
Site credential for real reads. Run npm run check before release. Check mobile and
desktop, swatches, both drawers, all stock scenarios, newsletter validation/failure,
API reads and redirects; stop before actual payment or invoice submission.
