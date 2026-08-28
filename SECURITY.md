# Security

Report a suspected vulnerability privately to security@reai.no. Do not open a public issue containing credentials, personal data or exploit details.

Site credentials authenticate one Site and belong only in Cloudflare Worker secrets or an ignored local `.dev.vars` file. Browser code calls same-origin Worker routes; it never calls the authenticated Site API directly.

Use the smallest scopes needed by the storefront:

- `site:read`
- `commerce:catalog:read`
- `commerce:availability:read`
- `commerce:checkout:create`

Rotate a credential immediately if it appears in source, logs, screenshots or browser-delivered content.
