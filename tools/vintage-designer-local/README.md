# Explicit local sample preview

These development-only tools are outside the Worker dependency graph. They never configure ReAI, create a credential, deploy, or act as a fallback for an API failure.

Create an ignored sample with **one to six** product handles copied from the client's public site:

```sh
node tools/vintage-designer-local/setup.mjs <public-product-handle> <another-handle>
node tools/vintage-designer-local/server.mjs --fixture sites/vintage-designer/.local/fixture.json --port 8787
```

The importer saves product content, displayed amounts, source availability and at most three images per product under `sites/vintage-designer/.local/`. It preserves supplied alt text and source image dimensions and obtains two width renditions. Do not stage that directory. Site API delivery prices are already gross: the fixture copies displayed gross source amounts directly, without adding VAT. The illustrative `vatRate: 0` is **not** an inference about source tax treatment, a tax mapping or a production price-list import. Collection membership is a small local demonstration derived from product brand/title, not a live published collection.

The loopback-only server invokes the actual site Worker and shared Site client against a separate loopback mock upstream. The only token is the literal `local-fixture-only`; no real credential is read. Product media is served from the ignored directory at `/__local-media/`. The fixture path is required and must be inside the site's `.local/` directory. No fixture environment switch exists in the deployable application.

Wrangler's build command runs `validate-deployment.mjs` on every dry run and deployment. It rejects enabled fixture flags in environment or configuration, local-tool imports, nonproduction entrypoints/assets, and fixture directories or symlinks under public assets. Run the tooling tests with `node --test tools/vintage-designer-local/local.test.mjs` (loopback port access required).

For a cold upstream-failure test, stop the server and restart with the additional `--upstream-error` argument. This returns failures from all mocked upstream routes; it never falls back to sample data. Restart between cold-cache error scenarios.

For live integration later, use the normal site development command with the actual Site credential stored outside Git. Do not run this harness. The real Worker already uses the shared client and proxy boundary. Keep checkout disabled until separately approved.

## Dated local snapshots

The ignored fixture may instead contain a `snapshotAt` ISO timestamp. The local harness displays it on HTML pages with a notice that prices and stock are not live. Keep extraction scripts, raw snapshots, source identifiers and real product data inside `.local/`; they are not deployment assets or public repository documentation.

Normalize legacy net prices to two decimal places and add VAT rounded to two decimals, using verified source VAT treatment. Delivery prices are already gross and the renderer must not add VAT again. Retain unknown inventory separately in the local snapshot. The two-state delivery adapter conservatively exposes it as unavailable; the UI says “Ikke tilgjengelig”, never that the item was sold. Reuse images only after matching source product identity; otherwise retain the missing-image placeholder. Generated local handles and title-based collections are preview conveniences, not existing ReAI publications.
