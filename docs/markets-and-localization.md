# Markets, currency and localization

Commerce delivery requests select `market=<handle>` and `locale=<locale>`.
A market supplies currency and delivery context. A locale supplies language.
They are independent: English text does not inherently mean USD, and Norwegian
text does not inherently mean NOK.

`GET /site/v1/site` describes available markets, their currencies, default
locales, supported locales and countries. The beginner starter selects the
market marked `isDefault`, falling back to the first configured market, and
uses that market's default locale. If there is no market, it renders an
unavailable state.

For a storefront with selectors, map the chosen market/locale explicitly and
preserve that context through product pages, cart, availability and checkout.
The advanced Worker accepts an explicit context and keeps its cached catalog
separate for each market/locale pair.

The market's prices are authoritative. Format amounts with the returned
currency and locale; do not compute cross-currency prices in browser code or
infer VAT treatment from a locale. Delivery prices are shopper-facing prices;
never add VAT a second time just because an accounting source has net amounts.

Product and collection content is resolved by ReAI for the requested locale.
Translate website interface copy and authored pages separately. The starter
includes Norwegian and English UI. Add translation content and selection logic
before promising broader language support.

A multilingual static generator can own editorial routes while a Worker owns
commerce routes. Keep the route-to-context mapping explicit, and use the same
locale and market when creating hosted checkout sessions.
