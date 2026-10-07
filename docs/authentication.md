# Credentials and authentication

Site delivery uses `Authorization: Bearer <site-token>`. Each credential belongs
to one Site; it is not interchangeable with a tenant management API token.
Create it through authorized Site management, copy the plaintext when returned,
and keep it outside version control.

| Scope | Purpose |
| --- | --- |
| `site:read` | Site identity, status and public market configuration |
| `commerce:catalog:read` | Published products, collections and storefront projection |
| `commerce:availability:read` | Separate uncached availability calls |
| `commerce:checkout:create` | Hosted checkout session creation |

Use only scopes required by the integration. The starter needs Site read,
catalog read and checkout creation. The advanced integration also reads live
availability. Credentials may have separate preview/live environments; do not
assume a public preview is harmless when it uses a live credential.

## Runtime binding names

| Integration | Base URL variable | Worker secret |
| --- | --- | --- |
| Beginner starter and exported designs | `REAI_API_BASE_URL` | `REAI_SITE_CREDENTIAL` |
| Advanced shared Worker | `REAI_BASE_URL` | `REAI_SITE_TOKEN` |

For a design in this repository:

```sh
# Set the plaintext through Wrangler's prompt, not a committed config.
npx wrangler secret put REAI_SITE_CREDENTIAL --cwd examples/everyday-store
```

Local `.dev.vars` files are ignored. Production tokens are Cloudflare Worker
secrets. Never put them in HTML, browser scripts, query strings, synthetic
fixtures, screenshots or public issue reports. A read-only frontend still
requires a trusted Worker to keep the credential out of the browser.

## Rotation and access

Management endpoints can list credentials, create them, rotate them and revoke
them. See [management](management.md) for the endpoint families. Coordinate
Worker secret replacement with the credential operation and verify the affected
Site afterward. Revoking a token stops its use; removing a collaborator from Git
alone does not revoke a token they already possessed.

GitHub access, Cloudflare deployment access, ReAI tenant management and Site
credential scopes are separate permissions. Grant each deliberately. A client
may manage their repository without receiving a credential to every other Site.
