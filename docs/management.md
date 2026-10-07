# Configure a Site in ReAI

Management operations belong to the [public management API](https://app.reai.no/openapi/public/ui).
They use authorized tenant authentication and the intended tenant context, not
the public Site delivery token. Use the live OpenAPI request schemas when making
writes; this guide lists responsibilities rather than duplicating those schemas.

## Site identity and domains

| Endpoint family | Responsibility |
| --- | --- |
| `GET/POST /api/sites` | List Sites or create a Site |
| `GET/PATCH /api/sites/{siteId}` | Read/update Site identity and configured domains/status |
| `GET/POST /api/sites/{siteId}/credentials` | List/create Site delivery credentials |
| `POST /api/sites/{siteId}/credentials/{credentialId}/rotate` | Rotate a credential |
| `POST /api/sites/{siteId}/credentials/{credentialId}/revoke` | Revoke a credential |

A Site belongs to one tenant. Its source locale establishes the underlying
content language. Its active and preview domains define accepted storefront
origins for hosted checkout returns. A domain setting in ReAI does not register
a domain or configure Cloudflare DNS; hosting and Site configuration must agree.

## Commerce setup

| Endpoint family | Responsibility |
| --- | --- |
| `/api/sites/{siteId}/commerce` | Read/configure commerce |
| `/api/sites/{siteId}/commerce/markets` | Configure market currency, locale/country context and market price selection |
| `/api/sites/{siteId}/products` | Publish catalog products to this Site |
| `/api/sites/{siteId}/commerce/collections` | Ordered merchandising collections |
| `/api/sites/{siteId}/commerce/collections/{handle}/products` | Collection membership |
| `/api/sites/{siteId}/commerce/collections/{handle}/translations` | Collection translations |
| `/api/sites/{siteId}/commerce/markets/{marketId}/shipping-methods` | Site/market delivery options |
| `/api/sites/{siteId}/commerce/markets/{marketId}/discounts` | Site/market discount configuration |
| `/api/sites/{siteId}/commerce/parcel` | Parcel configuration for physical delivery |
| `/api/sites/{siteId}/commerce/support-contact` | Shopper support contact |
| `/api/sites/{siteId}/commerce/business-sales` | Business sales configuration |

These are endpoint families; available verbs differ by operation. Check the
explorer before calling a specific method.

## Publication sequence

1. Create the Site under the correct tenant.
2. Enable/configure commerce if the website sells products.
3. Configure market currency, default locale, allowed locales and countries, and
   the prices used for that market.
4. Publish selected existing catalog products to the Site with public handles.
5. Organize published products into ordered collections and add translations.
6. Configure shipping, parcels, support contact and payment prerequisites.
7. Create a scoped credential, configure preview/active domains and connect the
   independently hosted storefront.

Products remain the tenant's catalog. Site publication is a per-Site projection;
never introduce a second catalog in the website repository. Collection membership
is materialized for delivery. The storefront does not evaluate collection rules
or infer membership from tags at request time.

Shopify/WooCommerce imports can populate the tenant catalog, but importing alone
is not Site publication, market pricing, payment setup or DNS cutover.

## Several Sites under one tenant

Sites can share underlying catalog data while exposing different public
publications, handles, collections and markets. Credentials stay per Site.
Shipping methods belong to Site commerce, not a shared tenant-wide website
setting. Group source repositories only if their collaborator access boundaries
match; a shared tenant does not automatically justify shared Git access.
