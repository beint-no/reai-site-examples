# Catalog, collections, images and availability

Use the [delivery OpenAPI document](https://app.reai.no/openapi/site) as the
canonical contract. The generated JS client in this repository owns upstream
paths and parameter names.

| Delivery endpoint | Use |
| --- | --- |
| `GET /site/v1/site` | Site identity, status and market configuration |
| `GET /site/v1/commerce/storefront` | Coherent cacheable product and collection projection |
| `GET /site/v1/commerce/catalog` | Published catalog projection |
| `GET /site/v1/commerce/products` | Published products |
| `GET /site/v1/commerce/products/{handle}` | Published product detail |
| `GET /site/v1/commerce/collections` | Collection summaries |
| `GET /site/v1/commerce/collections/{handle}` | Ordered collection membership |
| `GET /site/v1/commerce/availability` | Uncached availability batch; repeat variantId, up to 100 variants |
| `GET /site/v1/commerce/availability/{variantId}` | One variant's availability |

Commerce delivery requires the selected market and locale. Product handles are
public URLs within a Site; variant UUIDs identify checkout choices. Do not send
internal numeric product IDs to checkout.

## One coherent snapshot

The storefront projection reads products and collection membership together.
Use it to render a catalog without one request per product or collection. Its
catalogVersion and HTTP ETag support revalidation. Availability is separate:
a cached catalog is not proof that inventory is currently available.

The demo renders from the storefront snapshot and batches availability for
product pages. Checkout validates stock again. There is no Shopify or WooCommerce
runtime dependency.

Delivery prices already include VAT. Management product price lists store net
amounts; never add VAT again to delivered prices in the storefront.

## Collection filtering

The delivered product has category, merchant productType and structured attributes.
Variants carry option-linked attributes. Index and the main catalog derive facet
choices from the current collection, using entry UUIDs for attribute identity,
category IDs for taxonomy, merchant labels for display and provided colors for swatches.
They do not infer attributes from titles or images. Taxonomy names and aliases can
support search while retaining the original entry identity.

Choices within a facet are OR; facets combine with AND. Option, attribute, price
and availability constraints must match one variant. Product-wide attributes apply
to every variant. Counts represent matching products; prices and product links use
matching variants. Missing metadata creates no invented choice. Selected filters,
sort and layout are shareable URL parameters. Featured restores delivery order.

Available-only filtering separately requests uncached variant status in batches
of up to 100. Failure reports an error and removes that constraint. Checkout still
revalidates stock. The browser filters the complete delivered collection; if delivery
later becomes paginated, facets/counts will need a complete server-side projection.
See the published [filtering lesson](https://nettbutikk.reai.no/learn/collections/#filtering).

## Images

Public product images include `url`, `alt`, `width`, `height` and width-specific
`renditions`. Use API-provided URLs, intrinsic dimensions, alt text and srcset.
Choose `sizes` for the actual layout. Do not reconstruct private media paths or
proxy image bytes through the Site delivery API.

A missing image should have a useful placeholder. Never substitute another
product's image or infer product condition from a photograph. Decorative
illustrations and hero assets remain website assets; they are not catalog data.

## Availability, bundles and overselling

Availability reports public availability states rather than warehouse quantities.
Use the uncached API when showing stock. Checkout remains authoritative even
when a product page recently reported available.

Bundle variants can include public component titles, options, SKUs and
quantities. Submit the bundle variant's public UUID and bundle quantity, not
separate component lines invented by the website. ReAI validates overlapping
component demand across the cart.

Overselling is configured on the product variant and applies across Sites where
it is published. It is not a storefront CSS or cart setting. Checkout snapshots
preserve the accepted configuration; later edits do not rewrite already-created
sessions.
