# Catalog, collections and images

The canonical contract is the [Site API OpenAPI document](https://app.reai.no/openapi/site), with a human-readable [API explorer](https://app.reai.no/openapi/site/ui).

The examples use these delivery endpoints:

| Endpoint | Use |
| --- | --- |
| `GET /site/v1/site` | Site identity and configuration |
| `GET /site/v1/commerce/catalog` | Published product projections |
| `GET /site/v1/commerce/products/{handle}` | One published product |
| `GET /site/v1/commerce/collections` | Published collection summaries |
| `GET /site/v1/commerce/collections/{handle}` | Ordered collection membership |
| `GET /site/v1/commerce/availability/{variantId}` | Current variant availability |

Products and collection membership come from ReAI at request time. Product handles and variant IDs are public opaque identifiers; internal tenant IDs, warehouse quantities, cost and margin are not part of the delivery contract.

## Responsive product images

Each image includes:

- `url`: immutable master image URL
- `alt`: author-provided alternative text when available
- `width` and `height`: master intrinsic dimensions
- `renditions`: immutable width-specific alternatives

Render the master or an appropriate rendition in `src`, all useful alternatives in `srcset`, an accurate `sizes` expression and intrinsic dimensions on the `<img>`. Use API-provided `alt` text and fall back to the product title plus image position when it is absent.

Gallery thumbnail images use empty alt text because the containing buttons have accessible labels. When a shopper selects another image, update the main image's `src`, `srcset`, `sizes` and `alt` together.
