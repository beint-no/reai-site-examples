# Architecture

The browser, Cloudflare Worker and ReAI have intentionally separate responsibilities.

```text
Browser
  ├── static HTML, CSS, JavaScript and locale-specific editorial assets
  └── same-origin [locale-prefix]/reai/* requests
          │
Cloudflare Worker
  ├── owns the secret Site credential
  ├── maps explicit host/path routes to locale and market
  ├── server-renders catalog routes
  ├── validates checkout line shape
  ├── caches published catalog projections briefly
  └── proxies the small browser-facing API surface
          │ Authorization: Bearer <site-token>
ReAI Site API
  ├── localized published products and collections
  ├── Site-selected price list and currency
  ├── immutable responsive image URLs
  ├── live variant availability
  └── immutable hosted checkout sessions
```

The shared Worker module owns the security boundary and common API behavior. Each site owns rendering, navigation, copy, styling and any client-specific redirects.

Catalog pages are server-rendered for resilient navigation, metadata and search discovery. Browser JavaScript adds product options, cart persistence, gallery controls and checkout. Editorial pages remain static because they do not require an API request.

The Worker cache is short-lived and keyed per storefront, market and locale. Prices, translations and catalog publication can update without a deployment. Availability is fetched separately and is never placed in the storefront catalog cache.

See [localization and markets](localization.md) for the boundary between source-controlled copy and API-owned catalog translations, plus folder and domain routing examples.
