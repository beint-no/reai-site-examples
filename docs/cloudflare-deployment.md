# Cloudflare deployment

Every directory under `sites/` contains its own `wrangler.jsonc`, Worker entry point and static asset bundle. The repository installs one pinned Wrangler version and deploys only from a local checkout.

## Required environment

```sh
export CLOUDFLARE_ACCOUNT_ID=...
export CLOUDFLARE_API_TOKEN=...
export REAI_SITE_TOKEN=...
```

Store the ReAI token for one Worker:

```sh
printf '%s' "$REAI_SITE_TOKEN" | npx wrangler secret put REAI_SITE_TOKEN --cwd sites/budmates
```

Validate and deploy:

```sh
./site.sh check budmates
./site.sh deploy budmates
```

Custom domains belong in that site's Wrangler configuration. Coordinate DNS cutover separately and preserve unrelated mail and verification records. The Worker configuration contains only the public ReAI base URL; the Site credential is always a secret.

## Production verification

After deployment, check:

1. Worker and custom-domain TLS responses.
2. Canonical redirects and static editorial pages.
3. Catalog, product and collection rendering.
4. Responsive image URLs, dimensions and alt text.
5. Variant availability and option selection.
6. Checkout creation, hosted checkout and the success return URL.
7. Recent Cloudflare Worker errors.

GitHub Actions performs validation and a Wrangler dry run only. It does not deploy or hold production credentials.
