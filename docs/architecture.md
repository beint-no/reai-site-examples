# Architecture

The browser, Cloudflare Worker and ReAI have intentionally separate responsibilities.

```text
Browser
  ├── static HTML, CSS, JavaScript and editorial assets
  └── same-origin /reai/* requests
          │
Cloudflare Worker
  ├── owns the secret Site credential
  ├── server-renders catalog routes
  ├── validates checkout line shape
  ├── caches published catalog projections briefly
  └── proxies the small browser-facing API surface
          │ Authorization: Bearer <site-token>
ReAI Site API
  ├── published products and collections
  ├── immutable responsive image URLs
  ├── live variant availability
  └── immutable hosted checkout sessions
```

The shared Worker module owns the security boundary and common API behavior. Each site owns rendering, navigation, copy, styling and any client-specific redirects.

Catalog pages are server-rendered for resilient navigation, metadata and search discovery. Browser JavaScript adds product options, cart persistence, gallery controls and checkout. Editorial pages remain static because they do not require an API request.

A storefront may keep authored HTML directly in `public/`, or use Hugo when the editorial layer benefits from translations, content files, localized permalinks, page relationships and build-time link validation. `./site.sh build`, `dev`, `check` and `deploy` build Hugo-backed sites automatically. The generated `public/` directory is disposable and is not committed.

Hugo and the Worker have distinct localization responsibilities. Hugo owns static pages and static navigation. The Worker owns request-time API errors, cart and product-page chrome, locale-aware formatting, locale path prefixes and checkout return paths. Translation catalogs may be shared as source data, but catalog product titles and descriptions come from ReAI. The current Site API exposes one published catalog language per Site; a storefront must not invent a locale query parameter or imply that product data is translated when it is not.

The Worker cache is short-lived and keyed per storefront. Prices and catalog publication can update without a deployment. Availability is fetched separately and is never placed in the storefront catalog cache.
