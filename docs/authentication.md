# Authentication

Every credential is scoped to one ReAI Site. Requests use:

```http
Authorization: Bearer <site-token>
```

The token must remain in the Worker. Store it with `wrangler secret put` in production and in an ignored `.dev.vars` file during local development.

The storefront examples require:

| Scope | Purpose |
| --- | --- |
| `site:read` | Read Site identity and public configuration |
| `commerce:catalog:read` | Read published products and collections |
| `commerce:availability:read` | Read current variant availability |
| `commerce:checkout:create` | Create hosted checkout sessions |

Do not put the token in `wrangler.jsonc`, static HTML, browser JavaScript, query parameters or committed fixtures. Do not reuse a tenant-wide API token: Site credentials provide the narrower security boundary intended for storefront delivery.

The examples expose selected same-origin `/reai/*` routes without exposing the upstream credential. Public catalog responses are expected to be readable by shoppers; the Worker still controls allowed paths, methods, checkout validation and caching.
