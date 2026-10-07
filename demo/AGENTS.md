# ReAI Lekebutikken

One deliberately playful demonstration of a full ReAI Site integration, in
Norwegian and English. Preserve the warm paper background, cobalt/lime palette,
original illustrated objects, clear demo labels and accessible mobile layouts.
Do not add unrelated example Workers or copy real client brands/data here.

src/worker.mjs owns upstream integration and trusted checkout startup;
src/storefront.mjs owns HTML/editorial copy. public/assets/demo.js owns the local
cart, filters and read-only API explorer; demo.css owns presentation. seed/catalog.json
contains fictional product definitions, not a runtime/live catalog.

Static explanations render without a credential. Commerce fails explicitly when
unconfigured/unavailable. Production product data comes only from the selected
ReAI Site. The offline preview intercepts a synthetic origin only and has no payment.

Keep donation levels and Motivation to Greg lighthearted and clearly demonstrative.
The gift card is a test product, never an unimplemented redemption promise.
Checkout requires explicit verified payment configuration; the return page does
not clear the cart or claim payment was completed from a URL parameter alone.

Run npm run check and inspect desktop/mobile, navigation, variants, cart and errors
before publishing. Root AGENTS.md owns commands and deployment policy.
