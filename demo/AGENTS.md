# ReAI sin test-nettbutikk

One Worker at nettbutikk.reai.no; demosite.reai.no redirects here. The front page
explains platform primitives. Three designs use the same published ReAI catalog:
Studio (swatches/cart drawer), Atelier (editorial) and Supply (variant availability).
Use white, ink and teal with open ruled feature rows; Atelier uses a warm serif
palette and Supply a dark forest palette. Preserve Norwegian/English and mobile access.

src/worker.mjs owns trusted integration; storefront.mjs owns the document and live
shop; showcase.mjs owns the educational front page, design gallery and isolated
UI scenarios. content/education.mjs covers every delivery operation, checked against
live OpenAPI. public/assets/demo.js owns the real cart and read-only API explorer;
showcase.js owns newsletter signup and the separate scenario cart.

Production catalog data comes only from Site API. Static explanations and explicitly
labeled /scenarios/ fixtures work without credentials. Fixture carts have separate
storage keys, non-UUID identifiers and no checkout or fulfillment endpoint; they
never substitute for unavailable live data. Product photographs on design pages
illustrate layouts, not physical goods for sale. seed/catalog.json is operator input.

Newsletter signup requires an unchecked consent box and newsletter:subscribe;
show the Site owner and link privacy. Never claim it sends a welcome email or coupon.
The offline preview records no consent and accepts no payments.

Live digital test checkout names Better Integration and discloses real payments and
invoice orders before starting. Demo gift cards have no redemption balance, and
contributions are not charitable donations. Return URLs do not prove payment or
clear the cart. Shipping/pickup/EHF remain accurately documented configured flows;
digital products create no physical shipments. Test betaling has 1/10/100 kr variants
for small live purchases. Scenario stock/backorders are UI tests.

Run npm run check; verify desktop/mobile, all designs, swatches, both cart drawers,
stock scenarios, real API reads, newsletter errors and canonical redirects before deploy.
Root AGENTS.md owns release policy. Keep operational docs concise and avoid duplicating
field-guide content in Markdown.
