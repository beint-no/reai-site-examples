# Localization and markets

Storefront language and commerce market are separate choices:

| Concern | Selected by | Source of truth |
| --- | --- | --- |
| Interface and editorial language | locale route | source-controlled locale catalogs and static locale folders |
| Product and collection text | locale route | localized ReAI Site API responses |
| Prices and currency | market route | the price list selected by that route's ReAI Site credential |

A locale never implies a currency. English pages can use NOK in Norway and SEK in Sweden, and Norwegian and English pages can share the same NOK market. Do not convert prices in the Worker or browser.

## Source-controlled text

Use canonical BCP 47 tags such as `nb-NO`, `en-GB` and `sv-SE` for catalog filenames and keys. Keep Worker and renderer interface strings in dependency-free ESM catalogs under the site:

```text
sites/example/locales/nb-NO.mjs
sites/example/locales/en-GB.mjs
```

Create every catalog with `defineLocaleCatalog`. Worker startup validates that every locale has exactly the same leaf keys and that every leaf is a string. The selected catalog is available to renderers as `renderContext.messages`.

Keep substantial editorial pages as built HTML rather than putting article bodies into a message dictionary. The recommended layout is:

```text
public/                 # default-language URLs
public/en/              # /en/* English URLs
public/__locales/sv/    # Swedish assets served at a Swedish domain root
```

The locale source may be ESM data, Markdown or another repository-native format, but the checked-in deployment output remains static HTML. Generate every locale from the same page schema so missing pages and fields can be checked during the build.

Product titles, descriptions, SEO text, options, option values, image alt text and collection text do not belong in this repository. Request them from ReAI with the route locale. ReAI applies exact-locale, language and source-text fallback.

Give each canonical public version a distinct locale tag. For example, use `en-NO` and `en-SE` when English pages exist in two country markets; duplicate `hreflang` values would be ambiguous.

Use `Intl.NumberFormat`, `Intl.DateTimeFormat` and the other standard `Intl` formatters with the active locale. Never assemble currency labels or translated sentences by concatenating fragments.

## Explicit locale routes

Configure locale routes in the site Worker. This example combines a language folder with a separate Swedish domain:

```js
export default createReaiStorefrontWorker({
  cacheKey: "example-v1",
  storefront,
  localeCatalogs: {
    "nb-NO": nbNO,
    "en-GB": enGB,
    "sv-SE": svSE,
  },
  localeRoutes: [
    {
      hostnames: ["shop.example"],
      locale: "nb-NO",
      market: "NO",
      canonicalOrigin: "https://shop.example",
      siteTokenBinding: "REAI_SITE_TOKEN_NO",
    },
    {
      hostnames: ["shop.example"],
      pathPrefix: "/en",
      locale: "en-GB",
      market: "NO",
      canonicalOrigin: "https://shop.example",
      siteTokenBinding: "REAI_SITE_TOKEN_NO",
    },
    {
      hostnames: ["shop.se"],
      assetPathPrefix: "/__locales/sv",
      locale: "sv-SE",
      market: "SE",
      canonicalOrigin: "https://shop.se",
      siteTokenBinding: "REAI_SITE_TOKEN_SE",
    },
  ],
});
```

`pathPrefix` is public and remains in browser URLs. `assetPathPrefix` is private: it lets a root domain serve a locale-specific static folder without exposing that folder in the URL. It defaults to `pathPrefix`.

Routes are resolved by exact hostname before wildcard hostname, then by the longest matching path prefix. The Worker:

- appends the canonical locale to every Site API and checkout request;
- scopes catalog caches by market and locale;
- selects the configured Site secret and therefore its price list;
- keeps browser carts separate per market while allowing languages in one market to share a cart;
- sets `Content-Language` and document `lang`;
- emits locale-aware canonical and `hreflang` links for rendered and static HTML;
- keeps locale prefixes in navigation, browser API calls and checkout return URLs.

Add every public hostname as a Cloudflare Worker custom domain and provision every named Site-token binding as a Worker secret.

## Routing policy

Every language version must have a stable, crawlable URL. Render a visible language switcher from the same route list and include all alternates in the sitemap.

Do not vary page content on `Accept-Language`, cookies, IP geolocation or browser state. Those signals may inform a dismissible suggestion, but never an automatic redirect. Users, crawlers and caches must receive the locale encoded by the hostname and path.

The approach follows the guidance for [localized URLs and `hreflang`](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites), [Unicode locale identifiers](https://unicode.org/reports/tr35/), [JavaScript `Intl`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Internationalization), [Cloudflare custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) and [Cloudflare cache keys](https://developers.cloudflare.com/cache/how-to/cache-keys/).
