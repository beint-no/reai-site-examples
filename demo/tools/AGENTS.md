# Demo tenant setup tooling

setup.mjs uses the authenticated management API, outside the deployable Worker.
Run without --apply to print the plan. Apply requires an explicit tenant ID,
authorized management token and approved VAT code. It only creates/reuses the
named demo Site, price list, REAI-DEMO-* products, seeded collections and
namespaced demo-market discount codes. SKU/publication conflicts
stop setup; unrelated Sites/products must never be overwritten or deleted.

Original SVG art is rasterized with librsvg and uploaded as product media with
a stable source fingerprint for safe retries.
ReAI owns runtime products, prices, translations, images and collections. Keep
private IDs, raster scratch files and the one-time Site token under ignored .local/.
Never print raw credentials. Repeat runs reuse the demo catalog; credential
creation is explicit and refuses an existing token output. Partial API failure
can leave completed setup steps in place; rerun after fixing the cause.

This command never changes Adyen, enables Worker checkout, deploys or changes DNS.
Preview/live Site credential environments do not establish payment-provider mode.

commerce-options.mjs separately enables Site-specific company/invoice checkout
and free demo-only store pickup, with explicit flags and --apply. It preflights
Site/domains/market and pickup conflicts, preserves carrier methods and safely
reuses existing configuration. It never creates orders, issues invoices or sends
EHF. Pickup is hidden for digital-only carts. Commands live in docs/demo-setup.md.
