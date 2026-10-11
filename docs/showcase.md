# Commerce showcase

[nettbutikk.reai.no](https://nettbutikk.reai.no) is one educational site on the
existing reai-demo-store Worker. nettbutikk.reai.no is the only custom domain;
the old demo hostname has been retired. HTTP redirects to HTTPS, and HSTS
instructs browsers to keep using HTTPS for this hostname.

| Surface | Data and purpose |
| --- | --- |
| / | Platform primitives, ownership boundaries, design gallery and consent signup |
| /designs/studio/ | Live catalog, API-backed color choices and a cart drawer |
| /designs/atelier/ | Same live catalog in an editorial design |
| /designs/supply/ | Same live catalog with per-variant availability |
| /designs/launch/ | One live gift card, inline amount choices and editable cart drawer |
| /designs/trade/ | Live variant order list with inline quantities and B2B/EHF education |
| /designs/lookbook/ | Editorial fashion, clickable outfit choices and the isolated Famme test cart |
| /designs/essential/ | Three live products, inline amount choices and editable cart drawer |
| /designs/collections/ and /designs/collections/<handle>/ | Live collection membership, search, price sorting and list/grid layouts |
| /designs/famme/ | Famme-inspired responsive AVIF banners, collection photography and quick-add |
| /designs/famme/collections/<handle>/ and /designs/famme/products/<handle>/ | Illustrative clothing, search/sort, size availability, swatches and isolated cart |
| /scenarios/studio/ and /scenarios/supply/ | Isolated physical-product UI fixtures: mixed stock, all available, sold out, backorders and availability changes |
| /shop/, /products/, /collections/, /cart/ | Live catalog, manual ReAI gift cards, development support and hosted checkout |
| /features/ and /learn/ | Payments, checkout test checklist, B2B/EHF, shipping/pickup, discounts, catalog, markets, integration, collection membership, full commerce flow and newsletter consent |
| /api/ | All nine delivery reads; checkout and newsletter have their own forms |

Scenario carts use separate storage keys and non-UUID choices. They never call
checkout or create fulfillment. Live unavailable data produces an error. Studio/Atelier/Supply
photographs are original AI-generated illustrations. Famme photography is used
with explicit permission, converted to AVIF and excluded from the MIT asset
license (see ASSETS.md). No photographs represent physical inventory for sale.
The Famme cart uses its own storage key and non-UUID choices. It has no checkout
mutation; its checkout link opens the separate live 1-kr test product.
Launch, Trade and Essential select existing product handles without hardcoding prices or variant
IDs; unpublished products are omitted. Index collection membership comes from
the delivery collection response. All live cart drawers support quantity changes,
removal and a subtotal.
ReAI gift cards are manually redeemed via post@reai.no after verified payment;
there is no automated balance or code. Donations support Better Integration’s
ReAI/open-source development. Checkout identifies Better Integration as recipient,
real payments and unpaid invoice orders.

Newsletter signup forwards only email and explicit consent through newsletter:subscribe.
No campaign email, discount or customer-existence disclosure is produced. An offline
preview cannot record consent. The merchant handles consent withdrawal.

Run npm run demo for the offline catalog, or npm run dev with an ignored .dev.vars
Site credential for real reads. Run npm run check before release. Check mobile and
desktop, swatches, live/fixture drawers, quick-add, collections/search/sort, all stock scenarios, gallery filters, commerce explanation panels, newsletter validation/failure,
API reads and redirects; stop before actual payment or invoice submission.
