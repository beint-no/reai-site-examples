/**
 * This file was generated from the ReAI Site OpenAPI document.
 * Run npm run generate:site-api instead of editing it.
 */

export interface paths {
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
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        SiteCatalogRes: {
            products: components["schemas"]["SiteDeliveryProductRes"][];
            marketHandle: string;
            locale: string;
            /** Format: uuid */
            marketId: string;
            /** Format: int32 */
            catalogVersion: number;
            currency: components["schemas"]["CurrencyCode"];
        };
        SiteDeliveryVariantRes: {
            /** Format: uuid */
            id: string;
            options: components["schemas"]["SiteDeliveryOptionRes"][];
            compareAtPrice?: number | null;
            vatRate: number;
            price: number;
            sku: string;
        };
        /** @description Public product image. Fetch bytes from url; catalog JSON never includes image data. */
        ProductImage: {
            /**
             * Format: int32
             * @example 1200
             */
            height?: number;
            /**
             * Format: int32
             * @example 1200
             */
            width?: number;
            renditions?: components["schemas"]["ProductImageRendition"][];
            /** @example RAW Classic rolling papers */
            alt?: string | null;
            /** @example https://app.reai.no/media/product-images/018f3c2e-8b1a-7d3e-9c4f-5a6b7c8d9e0f/macbook-air-13-inch.avif */
            url?: string;
        };
        ProductImageRendition: {
            url: string;
            /** Format: int32 */
            height: number;
            /** Format: int32 */
            width: number;
        };
        /**
         * @description ISO 4217 three-letter currency code.
         * @example NOK
         */
        CurrencyCode: string;
        /** @description Created checkout session. Open checkoutUrl in the shopper's browser. Do not expose the Site credential to the browser. */
        SiteCheckoutSessionRes: {
            id: string;
            locale: string;
            checkoutUrl: string;
            /** Format: date-time */
            expiresAt: string;
            /** Format: uuid */
            marketId: string;
            total: components["schemas"]["SiteCheckoutTotalRes"];
            marketHandle: string;
            currency: components["schemas"]["CurrencyCode"];
        };
        SiteDeliveryMarketRes: {
            /** Format: uuid */
            id: string;
            locales: string[];
            handle: string;
            isDefault: boolean;
            countries: string[];
            currency: string;
            defaultLocale: string;
            name: string;
        };
        /** @description Checkout lines already selected by the store or application. Create this request from a trusted backend or Worker, never from the shopper's browser. */
        SiteCheckoutSessionReq: {
            returnUrl?: string | null;
            lines: components["schemas"]["SiteCheckoutLineReq"][];
        };
        /** @description RFC 9457 problem response */
        ProblemDetail: {
            type?: string | null;
            /** @example Invalid request */
            title?: string | null;
            /** @example variantId is not published on this site */
            error?: string | null;
            fieldErrors?: components["schemas"]["FieldError"][];
            /** @example variantId is not published on this site */
            detail?: string | null;
            /** @example /site/v1/commerce/checkout-sessions */
            instance?: string | null;
            /**
             * Format: int32
             * @example 400
             */
            status?: number;
        };
        FieldError: {
            /** @example lines */
            field?: string;
            /** @example must not be empty */
            message?: string;
        };
        SiteDeliveryOptionRes: {
            value: string;
            name: string;
        };
        SiteCheckoutTotalRes: {
            net: number;
            vat: number;
            gross: number;
        };
        SiteAvailabilityRes: {
            /** @enum {string} */
            status: "AVAILABLE" | "OUT_OF_STOCK";
            marketHandle: string;
            locale: string;
            /** Format: uuid */
            variantId: string;
            /** Format: uuid */
            marketId: string;
            currency: components["schemas"]["CurrencyCode"];
        };
        SiteDeliveryCollectionsRes: {
            marketHandle: string;
            locale: string;
            collections: components["schemas"]["SiteDeliveryCollectionRes"][];
            /** Format: uuid */
            marketId: string;
            /** Format: int32 */
            catalogVersion: number;
            currency: components["schemas"]["CurrencyCode"];
        };
        SiteDeliveryCollectionProductRes: {
            title: string;
            /** Format: uuid */
            id: string;
            handle: string;
            price: number;
            brand?: string | null;
        };
        SiteAvailabilitiesRes: {
            /** Format: uuid */
            marketId: string;
            currency: components["schemas"]["CurrencyCode"];
            variants: components["schemas"]["SiteVariantAvailabilityRes"][];
            locale: string;
            marketHandle: string;
        };
        SiteStorefrontRes: {
            products: components["schemas"]["SiteDeliveryProductRes"][];
            collections: components["schemas"]["SiteStorefrontCollectionRes"][];
            /** Format: int32 */
            catalogVersion: number;
            locale: string;
            currency: components["schemas"]["CurrencyCode"];
            marketHandle: string;
            /** Format: uuid */
            marketId: string;
        };
        SiteDeliveryCollectionDetailRes: {
            imageUrl?: string | null;
            description?: string | null;
            /** Format: int32 */
            catalogVersion: number;
            handle: string;
            title: string;
            marketHandle: string;
            seoDescription?: string | null;
            seoTitle: string;
            currency: components["schemas"]["CurrencyCode"];
            locale: string;
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            marketId: string;
            products: components["schemas"]["SiteDeliveryCollectionProductRes"][];
        };
        SiteDeliveryRes: {
            /** @enum {string} */
            status: "enabled" | "disabled";
            /** Format: uuid */
            id: string;
            activeDomain?: string | null;
            sourceLocale: string;
            name: string;
            markets: components["schemas"]["SiteDeliveryMarketRes"][];
        };
        SiteCheckoutLineReq: {
            /** Format: uuid */
            variantId: string;
            /** Format: int32 */
            quantity: number;
        };
        SiteDeliveryCollectionRes: {
            imageUrl?: string | null;
            /** Format: uuid */
            id: string;
            title: string;
            seoTitle: string;
            description?: string | null;
            seoDescription?: string | null;
            handle: string;
        };
        SiteVariantAvailabilityRes: {
            /** @enum {string} */
            status: "AVAILABLE" | "OUT_OF_STOCK";
            /** Format: uuid */
            variantId: string;
        };
        SiteDeliveryProductDetailRes: {
            seoTitle: string;
            variants: components["schemas"]["SiteDeliveryVariantRes"][];
            description?: string | null;
            seoDescription?: string | null;
            handle: string;
            currency: components["schemas"]["CurrencyCode"];
            marketHandle: string;
            /** Format: uuid */
            marketId: string;
            title: string;
            /** Format: int32 */
            catalogVersion: number;
            locale: string;
            images: components["schemas"]["ProductImage"][];
            brand?: string | null;
            /** Format: uuid */
            id: string;
        };
        SiteStorefrontCollectionRes: {
            /** Format: uuid */
            id: string;
            title: string;
            handle: string;
            products: components["schemas"]["SiteDeliveryCollectionProductRes"][];
            imageUrl?: string | null;
            seoDescription?: string | null;
            seoTitle: string;
            description?: string | null;
        };
        SiteDeliveryProductRes: {
            seoDescription?: string | null;
            seoTitle: string;
            variants: components["schemas"]["SiteDeliveryVariantRes"][];
            /** Format: uuid */
            id: string;
            title: string;
            images: components["schemas"]["ProductImage"][];
            description?: string | null;
            handle: string;
            brand?: string | null;
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
}
