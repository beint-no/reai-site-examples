# One demo Worker

The browser, demo Worker and ReAI have separate responsibilities. The browser
stores only its cart and calls same-origin public routes; it never holds a Site
credential. The Worker renders pages and uses the generated delivery client.
ReAI owns published business data and checkout state.

| Directory | Responsibility |
| --- | --- |
| demo/src/worker.mjs | Site/market/locale discovery, API calls, route validation and checkout boundary |
| demo/src/storefront.mjs | Page rendering, responsive image metadata and static explanations |
| demo/public/assets/ | Original design, browser cart, search and API explorer |
| demo/seed/ | Fictional operator seed definitions; not deployed runtime data |
| packages/reai-site-client/ | Native client checked against generated delivery declarations |
| packages/reai-cloudflare-storefront/ | Reusable advanced integration for other private client implementations |
| starter/ and templates/storefront/ | Simple standalone operational template export |

The demo uses one coherent storefront snapshot for home and shop, direct product
and collection detail reads, and uncached batch availability on product pages.
The API playground exercises Site, storefront, catalog, collections, product and
collection detail, single and batch availability. Checkout is demonstrated through
the cart, never as an unsafe arbitrary request in the explorer.

Static feature/about/privacy pages work without ReAI. Missing configuration and
upstream errors stay explicit; the deployed Worker never imports seed fixtures.
The separate Node preview intercepts only a synthetic origin and disables payment.

Checkout requires same-origin JSON, a bounded cart/body, valid UUIDs/quantities and
an idempotency key retained across retries. The server supplies the return URL and
accepts only the configured ReAI HTTPS checkout origin. A return redirect does not
prove payment, so it neither fabricates success nor clears the cart.

For [static versus Site API](concepts.md#static-websites-and-site-api-websites),
start with the concepts guide. For optional reusable cache/renderer integration,
see [the package guide](../packages/reai-cloudflare-storefront/AGENTS.md).
