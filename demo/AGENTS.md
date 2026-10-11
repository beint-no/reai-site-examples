# ReAI sin test-nettbutikk

One Worker at nettbutikk.reai.no. The front page explains platform primitives.
Ten distinct designs: Everyday uses the actual exported starter. Studio, Atelier,
Supply, Essential, Index, Launch and
Trade use the published ReAI catalog; Famme and Lookbook share an isolated fashion
fixture with licensed AVIF photos. Launch focuses on one product; Trade uses
inline variant quantities; Index and the main catalog use backend-derived category,
type, attribute and option filters, variant prices and live availability. Filter
choices come from each collection; match every condition on the same variant.
The gallery filters by shopping feature. Learning pages explain collection
membership and the full commerce flow without exposing private administration.
Use white, ink and teal with open ruled feature rows; Atelier uses a warm serif
palette and Supply a dark forest palette. Preserve Norwegian/English and mobile access.

src/worker.mjs owns trusted integration; storefront.mjs owns the document and live
shop; showcase.mjs owns the educational front page, design gallery and isolated
UI scenarios. content/education.mjs covers every delivery operation, checked against
live OpenAPI. public/assets/demo.js owns the real cart and read-only API explorer;
showcase.js owns newsletter signup and the separate scenario cart.
content/ux.mjs owns original research-linked concepts and acceptance tasks;
src/ux.mjs renders /ux/, learning paths and the in-memory printable test plan;
src/ux-labs.mjs renders isolated search and comparison labs. content/ux-extension.mjs
owns added public-research concepts; ux-depth.mjs owns site-specific decisions and regressions. Each design links its applicable
concepts. checkout-lab*.js simulates outcomes in memory without API calls or storage.
src/design-storefronts.mjs owns standalone design shells. fashion.js uses only
assets/famme/catalog.json; its non-UUID product choices never enter checkout.
Famme photo ownership, permission and source URLs are in ASSETS.md and
assets/famme/sources.json. Do not reuse these images as MIT template assets.

Production catalog data comes only from Site API. Static explanations and explicitly
labeled /scenarios/ fixtures work without credentials. Fixture carts have separate
storage keys, non-UUID identifiers and no checkout or fulfillment endpoint; they
never substitute for unavailable live data. Product photographs on design pages
illustrate layouts, not physical goods for sale. seed/catalog.json is operator input.

Newsletter signup requires an unchecked consent box and newsletter:subscribe;
show the Site owner and link privacy. New consent may queue a configured welcome
flow; signup creates no coupon. Back-in-stock signup has separate one-notification
consent and requires an enabled merchant flow. Never promise unconfigured emails.
The offline preview records no consent and accepts no payments.

Live digital test checkout names Better Integration and discloses real payments and
invoice orders before starting. Gift cards are redeemed manually via post@reai.no
after verified payment;
there is no automated balance/code. Donations support Better Integration’s
ReAI/open-source development and grant no goods, services or gift-card credit.
Return URLs do not prove payment or
clear the cart. Shipping/pickup/EHF remain accurately documented configured flows;
digital products create no physical shipments. Test betaling has 1/10/100 kr variants
for small live purchases; /learn/checkout-test/ provides the full checklist.
Scenario stock/backorders are UI tests.

Shared catalog filters use desktop immediate updates and mobile draft/apply/cancel.
cart-controls.js supplies quantity changes and undo to the demo and exported starter.
Keep demo learning content and fixture adapters out of generated client sites.

Run npm run check; verify desktop/mobile, all designs, swatches, cart quantities/undo,
stock scenarios, catalog return context, search suggestions, comparison, sizing, real API reads, newsletter errors and HTTPS redirects before deploy.
Root AGENTS.md owns release policy. Keep operational docs concise and avoid duplicating
field-guide content in Markdown.
