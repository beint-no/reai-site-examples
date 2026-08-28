# Quickstart

## 1. Create a Site and credential

Create a Site in ReAI, publish at least one product and create a Site credential with the scopes listed in [authentication](authentication.md). Copy the token when it is created; it is not browser configuration.

## 2. Choose a production example

Budmates is a compact, product-dense implementation. Endorphin demonstrates richer product options, lifestyle media and legacy redirects. Copy the closer starting point, then replace all brand assets and customer content as required by [ASSETS.md](../ASSETS.md).

## 3. Configure local development

From the repository root:

```sh
npm ci
cp sites/budmates/.dev.vars.example sites/budmates/.dev.vars
```

Put the preview Site token in the ignored file:

```dotenv
REAI_SITE_TOKEN=replace-with-your-site-credential
```

Then run the Worker:

```sh
npx wrangler dev --cwd sites/budmates
```

The Worker reads catalog content from ReAI and serves static files from the site's `public/` directory.

## 4. Configure the Site domains

Set the Site preview domain to the expected `workers.dev` hostname. Before custom-domain cutover, set the active domain to the canonical production hostname. ReAI validates checkout return URLs against these domains.

## 5. Deploy

Store the Site credential as a Cloudflare secret and deploy locally:

```sh
printf '%s' "$REAI_SITE_TOKEN" | npx wrangler secret put REAI_SITE_TOKEN --cwd sites/budmates
./site.sh deploy budmates
```

Verify the homepage, a collection, a product with multiple variants, availability, cart, hosted checkout and successful return path.
