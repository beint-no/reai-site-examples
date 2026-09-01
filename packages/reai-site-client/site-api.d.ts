/**
 * This file was generated from the ReAI Site OpenAPI document.
 * Run npm run generate:site-api instead of editing it.
 */

export interface paths {
    "/site/v1/commerce/products": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List published products */
        get: operations["products"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/site/v1/site": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get the authenticated site */
        get: operations["site"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/site/v1/commerce/products/{handle}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a published product */
        get: operations["product"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/site/v1/commerce/storefront": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get the complete published storefront snapshot */
        get: operations["storefront"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/site/v1/commerce/availability": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get coarse availability for up to 100 published variants */
        get: operations["availabilities"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/site/v1/commerce/collections": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List published collections */
        get: operations["collections"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/site/v1/commerce/availability/{variantId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get coarse availability for a published variant */
        get: operations["availability"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/site/v1/commerce/collections/{handle}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a published collection with ordered published products */
        get: operations["collection"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/site/v1/commerce/checkout-sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create an immutable checkout snapshot
         * @description Call this from a trusted backend or Worker with a Site credential and Idempotency-Key. The request supplies the frozen checkout lines and optional returnUrl. Keep the Site credential server-side; never send it to the browser. Open the returned checkoutUrl in the shopper's browser to complete contact, shipping, and payment.
         */
        post: operations["createCheckoutSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/site/v1/commerce/catalog": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get the published catalog */
        get: operations["catalog"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        SiteDeliveryCollectionProductRes: {
            handle: string;
            /** Format: uuid */
            id: string;
            title: string;
            brand?: string | null;
            price: number;
        };
        SiteDeliveryCollectionsRes: {
            marketHandle: string;
            currency: components["schemas"]["CurrencyCode"];
            /** Format: int32 */
            catalogVersion: number;
            /** Format: uuid */
            marketId: string;
            collections: components["schemas"]["SiteDeliveryCollectionRes"][];
            locale: string;
        };
        SiteAvailabilityRes: {
            marketHandle: string;
            /** @enum {string} */
            status: "AVAILABLE" | "OUT_OF_STOCK";
            currency: components["schemas"]["CurrencyCode"];
            /** Format: uuid */
            marketId: string;
            /** Format: uuid */
            variantId: string;
            locale: string;
        };
        SiteCheckoutTotalRes: {
            net: number;
            gross: number;
            vat: number;
        };
        SiteDeliveryOptionRes: {
            value: string;
            name: string;
        };
        FieldError: {
            /** @example lines */
            field?: string;
            /** @example must not be empty */
            message?: string;
        };
        /** @description RFC 9457 problem response */
        ProblemDetail: {
            /** @example variantId is not published on this site */
            error?: string | null;
            /** @example Invalid request */
            title?: string | null;
            type?: string | null;
            /**
             * Format: int32
             * @example 400
             */
            status?: number;
            /** @example /site/v1/commerce/checkout-sessions */
            instance?: string | null;
            /** @example variantId is not published on this site */
            detail?: string | null;
            fieldErrors?: components["schemas"]["FieldError"][];
        };
        /** @description Checkout lines already selected by the store or application. Create this request from a trusted backend or Worker, never from the shopper's browser. */
        SiteCheckoutSessionReq: {
            lines: components["schemas"]["SiteCheckoutLineReq"][];
            returnUrl?: string | null;
        };
        SiteDeliveryMarketRes: {
            countries: string[];
            isDefault: boolean;
            handle: string;
            locales: string[];
            /** Format: uuid */
            id: string;
            name: string;
            defaultLocale: string;
            currency: string;
        };
        /** @description Created checkout session. Open checkoutUrl in the shopper's browser. Do not expose the Site credential to the browser. */
        SiteCheckoutSessionRes: {
            marketHandle: string;
            total: components["schemas"]["SiteCheckoutTotalRes"];
            /** Format: uuid */
            marketId: string;
            /** Format: date-time */
            expiresAt: string;
            checkoutUrl: string;
            locale: string;
            id: string;
            currency: components["schemas"]["CurrencyCode"];
        };
        /**
         * @description ISO 4217 three-letter currency code.
         * @example NOK
         */
        CurrencyCode: string;
        ProductImageRendition: {
            url: string;
            /** Format: int32 */
            width: number;
            /** Format: int32 */
            height: number;
        };
        /** @description Public product image. Fetch bytes from url; catalog JSON never includes image data. */
        ProductImage: {
            /**
             * Format: int32
             * @example 1200
             */
            width?: number;
            /**
             * Format: int32
             * @example 1200
             */
            height?: number;
            /** @example https://app.reai.no/media/product-images/018f3c2e-8b1a-7d3e-9c4f-5a6b7c8d9e0f/macbook-air-13-inch.avif */
            url?: string;
            /** @example RAW Classic rolling papers */
            alt?: string | null;
            renditions?: components["schemas"]["ProductImageRendition"][];
        };
        SiteDeliveryVariantRes: {
            options: components["schemas"]["SiteDeliveryOptionRes"][];
            /** Format: uuid */
            id: string;
            sku: string;
            price: number;
            vatRate: number;
            compareAtPrice?: number | null;
        };
        SiteCatalogRes: {
            marketHandle: string;
            products: components["schemas"]["SiteDeliveryProductRes"][];
            currency: components["schemas"]["CurrencyCode"];
            /** Format: int32 */
            catalogVersion: number;
            /** Format: uuid */
            marketId: string;
            locale: string;
        };
        SiteDeliveryProductRes: {
            title: string;
            /** Format: uuid */
            id: string;
            variants: components["schemas"]["SiteDeliveryVariantRes"][];
            seoTitle: string;
            seoDescription?: string | null;
            brand?: string | null;
            handle: string;
            description?: string | null;
            images: components["schemas"]["ProductImage"][];
        };
        SiteStorefrontCollectionRes: {
            imageUrl?: string | null;
            products: components["schemas"]["SiteDeliveryCollectionProductRes"][];
            handle: string;
            title: string;
            /** Format: uuid */
            id: string;
            description?: string | null;
            seoTitle: string;
            seoDescription?: string | null;
        };
        SiteDeliveryProductDetailRes: {
            title: string;
            /** Format: uuid */
            marketId: string;
            marketHandle: string;
            currency: components["schemas"]["CurrencyCode"];
            handle: string;
            seoDescription?: string | null;
            description?: string | null;
            variants: components["schemas"]["SiteDeliveryVariantRes"][];
            seoTitle: string;
            /** Format: uuid */
            id: string;
            brand?: string | null;
            images: components["schemas"]["ProductImage"][];
            locale: string;
            /** Format: int32 */
            catalogVersion: number;
        };
        SiteVariantAvailabilityRes: {
            /** @enum {string} */
            status: "AVAILABLE" | "OUT_OF_STOCK";
            /** Format: uuid */
            variantId: string;
        };
        SiteDeliveryCollectionRes: {
            seoTitle: string;
            title: string;
            /** Format: uuid */
            id: string;
            imageUrl?: string | null;
            handle: string;
            seoDescription?: string | null;
            description?: string | null;
        };
        SiteCheckoutLineReq: {
            /** Format: int32 */
            quantity: number;
            /** Format: uuid */
            variantId: string;
        };
        SiteDeliveryRes: {
            name: string;
            sourceLocale: string;
            activeDomain?: string | null;
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            status: "enabled" | "disabled";
            markets: components["schemas"]["SiteDeliveryMarketRes"][];
        };
        SiteDeliveryCollectionDetailRes: {
            seoTitle: string;
            seoDescription?: string | null;
            marketHandle: string;
            title: string;
            handle: string;
            /** Format: int32 */
            catalogVersion: number;
            description?: string | null;
            imageUrl?: string | null;
            products: components["schemas"]["SiteDeliveryCollectionProductRes"][];
            /** Format: uuid */
            marketId: string;
            /** Format: uuid */
            id: string;
            locale: string;
            currency: components["schemas"]["CurrencyCode"];
        };
        SiteStorefrontRes: {
            collections: components["schemas"]["SiteStorefrontCollectionRes"][];
            products: components["schemas"]["SiteDeliveryProductRes"][];
            /** Format: uuid */
            marketId: string;
            marketHandle: string;
            currency: components["schemas"]["CurrencyCode"];
            locale: string;
            /** Format: int32 */
            catalogVersion: number;
        };
        SiteAvailabilitiesRes: {
            /** Format: uuid */
            marketId: string;
            marketHandle: string;
            locale: string;
            variants: components["schemas"]["SiteVariantAvailabilityRes"][];
            currency: components["schemas"]["CurrencyCode"];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    products: {
        parameters: {
            query?: {
                /**
                 * @description Market handle. Omit to use the default market.
                 * @example international
                 */
                market?: string | null;
                /**
                 * @description Canonical BCP 47 locale enabled for the selected market.
                 * @example en
                 */
                locale?: string | null;
            };
            header?: {
                /** @description ETag from an earlier response for the same URL. A match returns 304 without a response body. */
                "If-None-Match"?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SiteCatalogRes"];
                };
            };
            /** @description Products unchanged for the supplied If-None-Match validator */
            304: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
        };
    };
    site: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SiteDeliveryRes"];
                };
            };
            /** @description Bad request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
        };
    };
    product: {
        parameters: {
            query?: {
                /**
                 * @description Market handle. Omit to use the default market.
                 * @example international
                 */
                market?: string | null;
                /**
                 * @description Canonical BCP 47 locale enabled for the selected market.
                 * @example en
                 */
                locale?: string | null;
            };
            header?: {
                /** @description ETag from an earlier response for the same URL. A match returns 304 without a response body. */
                "If-None-Match"?: string | null;
            };
            path: {
                handle: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SiteDeliveryProductDetailRes"];
                };
            };
            /** @description Product unchanged for the supplied If-None-Match validator */
            304: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
        };
    };
    storefront: {
        parameters: {
            query?: {
                /**
                 * @description Market handle. Omit to use the default market.
                 * @example international
                 */
                market?: string | null;
                /**
                 * @description Canonical BCP 47 locale enabled for the selected market.
                 * @example en
                 */
                locale?: string | null;
            };
            header?: {
                /** @description ETag from an earlier response for the same URL. A match returns 304 without a response body. */
                "If-None-Match"?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SiteStorefrontRes"];
                };
            };
            /** @description Storefront snapshot unchanged for the supplied If-None-Match validator */
            304: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
        };
    };
    availabilities: {
        parameters: {
            query: {
                /** @example  */
                variantId: string[];
                /**
                 * @description Market handle. Omit to use the default market.
                 * @example international
                 */
                market?: string | null;
                /**
                 * @description Canonical BCP 47 locale enabled for the selected market.
                 * @example en
                 */
                locale?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SiteAvailabilitiesRes"];
                };
            };
            /** @description Bad request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
        };
    };
    collections: {
        parameters: {
            query?: {
                /**
                 * @description Market handle. Omit to use the default market.
                 * @example international
                 */
                market?: string | null;
                /**
                 * @description Canonical BCP 47 locale enabled for the selected market.
                 * @example en
                 */
                locale?: string | null;
            };
            header?: {
                /** @description ETag from an earlier response for the same URL. A match returns 304 without a response body. */
                "If-None-Match"?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SiteDeliveryCollectionsRes"];
                };
            };
            /** @description Collections unchanged for the supplied If-None-Match validator */
            304: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
        };
    };
    availability: {
        parameters: {
            query?: {
                /**
                 * @description Market handle. Omit to use the default market.
                 * @example international
                 */
                market?: string | null;
                /**
                 * @description Canonical BCP 47 locale enabled for the selected market.
                 * @example en
                 */
                locale?: string | null;
            };
            header?: never;
            path: {
                variantId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SiteAvailabilityRes"];
                };
            };
            /** @description Bad request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
        };
    };
    collection: {
        parameters: {
            query?: {
                /**
                 * @description Market handle. Omit to use the default market.
                 * @example international
                 */
                market?: string | null;
                /**
                 * @description Canonical BCP 47 locale enabled for the selected market.
                 * @example en
                 */
                locale?: string | null;
            };
            header?: {
                /** @description ETag from an earlier response for the same URL. A match returns 304 without a response body. */
                "If-None-Match"?: string | null;
            };
            path: {
                handle: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SiteDeliveryCollectionDetailRes"];
                };
            };
            /** @description Collection unchanged for the supplied If-None-Match validator */
            304: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
        };
    };
    createCheckoutSession: {
        parameters: {
            query?: {
                /**
                 * @description Market handle. Omit to use the default market.
                 * @example international
                 */
                market?: string | null;
                /**
                 * @description Canonical BCP 47 locale enabled for the selected market.
                 * @example en
                 */
                locale?: string | null;
            };
            header: {
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SiteCheckoutSessionReq"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SiteCheckoutSessionRes"];
                };
            };
            /** @description Bad request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
        };
    };
    catalog: {
        parameters: {
            query?: {
                /**
                 * @description Market handle. Omit to use the default market.
                 * @example international
                 */
                market?: string | null;
                /**
                 * @description Canonical BCP 47 locale enabled for the selected market.
                 * @example en
                 */
                locale?: string | null;
            };
            header?: {
                /** @description ETag from an earlier response for the same URL. A match returns 304 without a response body. */
                "If-None-Match"?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SiteCatalogRes"];
                };
            };
            /** @description Catalog unchanged for the supplied If-None-Match validator */
            304: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ProblemDetail"];
                };
            };
        };
    };
}
