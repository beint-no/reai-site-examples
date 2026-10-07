# Troubleshooting

| Symptom | Check |
| --- | --- |
| Setup page / 503 | Worker base URL and secret names; use the correct bindings for starter vs advanced integration |
| Delivery denied | Credential Site, scopes, revocation/expiry, Site status and tenant online-store module |
| Empty catalog | Per-Site publication, intended market and market prices; an imported catalog is not automatically published |
| Wrong language/currency | Site default market/default locale in starter; explicit market/locale routing in advanced integration |
| Stale merchandising | Catalog version/ETag and advanced Worker cache; stock uses a different uncached route |
| Checkout return rejected | Site preview/active domains and actual Worker origin |
| Checkout session exists but payment unavailable | Tenant payment onboarding and configured ecommerce payment integration |
| Local demo cannot check out | Expected: its synthetic upstream explicitly rejects checkout |
| Client cannot clone a submodule | Grant that child repository access; the hub grants no child permissions |
| Export refuses destination | Choose a new absolute directory; existing files are never overwritten |

Use the live API explorers to inspect public response contracts. Report status,
request context and operation with credentials removed. Do not paste bearer
tokens or private customer data into public GitHub issues.
