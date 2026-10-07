# Run a design and connect ReAI

## Try the fictional demo

Requires Node.js 26+ and npm 11.19+ for this examples repository.

```sh
npm ci
npm run demo -- everyday-store
# Stop with Ctrl+C before using the same port for another theme.
npm run demo -- studio-store
```

Open `http://127.0.0.1:8787`. Set `DEMO_PORT` to choose another loopback port.
The demo supplies an explicit synthetic catalog, marks responses noindex and
rejects checkout creation. It does not connect to a real tenant, create a Site,
read a production credential or change hosting. Its product illustrations are
abstract SVGs, not merchant photographs.

The demo harness is separate from the deployable Worker. Missing credentials or
ReAI failures in the normal Worker remain setup/error states; they never cause a
silent switch to mock products.

## Connect an actual test Site

1. Create a Site under the intended ReAI tenant and enable commerce if needed.
2. Configure a market and publish products with that market's prices. Importing
   a catalog from another system alone does not publish it to the Site.
3. Create a Site credential with `site:read`, `commerce:catalog:read` and
   `commerce:checkout:create`. Use a test Site appropriate to the work. The
   advanced cached integration additionally requires availability read.
4. Configure the Site preview domain before testing hosted checkout return URLs.

```sh
cp examples/everyday-store/.dev.vars.example examples/everyday-store/.dev.vars
# Edit the ignored file; never put its contents into Git.
npm run dev -- everyday-store
```

Use `REAI_API_BASE_URL=https://app.reai.no` and put your server-side credential in
`REAI_SITE_CREDENTIAL`. The starter selects the Site's default market and its
configured default locale. English and Norwegian UI are included. These simple
examples do not include a shopper-facing market selector.

Catalog responses can be explored in [the delivery API explorer](https://app.reai.no/openapi/site/ui).
For local hosted checkout, use a public HTTPS test hostname configured on the
Site; a loopback hostname is not a substitute for the Site's approved domains.

## Adapt for a client

```sh
npm run export -- studio-store /absolute/path/to/new-private-repo
cd /absolute/path/to/new-private-repo
npm install
npm run check
```

Export requires a new directory and refuses to overwrite an existing checkout.
It includes the Worker, browser assets, chosen CSS, generated Site client and
local instructions. It excludes the offline catalog and demo harness. Commit
the resulting package-lock.json after the first install; use npm ci afterward.

Initialize a **private** repository for the client. Replace the test Worker
identifier, configure approved merchant copy, policies and production domains,
and install the secret before publishing. See [repository ownership](repositories.md).

Run `npm run check` in this repository before changing the shared examples. It
checks runtime behavior, contract types, source boundaries, documentation links,
export behavior, dependency security and both Worker dry-run bundles.
