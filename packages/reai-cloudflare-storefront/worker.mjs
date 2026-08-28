import {
  createLocaleRouting,
  defineLocaleCatalog,
  formatCurrency,
} from "./locale-routing.mjs";

const STATIC_ASSET = /\.(?:avif|css|eot|gif|ico|jpe?g|js|json|map|mp4|ogg|otf|png|svg|ttf|webm|webp|woff2?)$/i;
const VARIANT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const defaultMessages = {
  invalidJson: "Invalid JSON.",
  invalidLineCount: "The cart must contain between 1 and 100 lines.",
  invalidLine: "The cart contains an invalid variant or quantity.",
  notConfigured: "The Site API is not configured.",
  invalidProductHandle: "Invalid product handle.",
  invalidCollectionHandle: "Invalid collection handle.",
  invalidVariantId: "Invalid variant ID.",
  routeNotFound: "API route not found.",
  methodNotAllowed: "Method not allowed.",
  temporarilyUnavailable: "The Site API is temporarily unavailable.",
};

export const norwegianMessages = {
  invalidJson: "Ugyldig JSON.",
  invalidLineCount: "Handlekurven må inneholde mellom 1 og 100 linjer.",
  invalidLine: "Handlekurven inneholder en ugyldig variant eller et ugyldig antall.",
  notConfigured: "Site API er ikke konfigurert.",
  invalidProductHandle: "Ugyldig produkthåndtak.",
  invalidCollectionHandle: "Ugyldig samlingshåndtak.",
  invalidVariantId: "Ugyldig variant-ID.",
  routeNotFound: "Fant ikke API-ruten.",
  methodNotAllowed: "Metoden er ikke tillatt.",
  temporarilyUnavailable: "Site API er midlertidig utilgjengelig.",
};

function siteBaseUrl(env, localeRoute) {
  const configured = env[localeRoute.siteBaseUrlBinding] || env.REAI_BASE_URL || "https://app.reai.no";
  return configured.replace(/\/$/, "");
}

function siteOrigin(env, localeRoute) {
  try {
    return new URL(siteBaseUrl(env, localeRoute)).origin;
  } catch {
    return "https://app.reai.no";
  }
}

function securityHeaders(headers, env, localeRoute) {
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set(
    "Content-Security-Policy",
    `default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: ${siteOrigin(env, localeRoute)}; script-src 'self'; form-action 'self' mailto:; base-uri 'self'; frame-ancestors 'none'; object-src 'none'`,
  );
  return headers;
}

function siteToken(env, localeRoute) {
  return env[localeRoute.siteTokenBinding];
}

function siteHeaders(env, localeRoute, body) {
  const headers = new Headers({
    Accept: "application/json",
    Authorization: `Bearer ${siteToken(env, localeRoute)}`,
  });
  if (body) headers.set("Content-Type", "application/json");
  return headers;
}

function cacheRequest(cacheKey, localeRoute) {
  const scopedKey = `${cacheKey}:${localeRoute.siteTokenBinding}:${localeRoute.market}:${localeRoute.locale}`;
  return new Request(`https://reai-storefront-cache.invalid/${encodeURIComponent(scopedKey)}`);
}

function localizedUpstreamPath(path, locale) {
  const url = new URL(path, "https://site-api.invalid");
  url.searchParams.set("locale", locale);
  return `${url.pathname}${url.search}`;
}

function routePublicPath(route, pathname) {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return route.pathPrefix ? `${route.pathPrefix}${path === "/" ? "/" : path}` : path;
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function uniqueAlternateRoutes(routes) {
  const unique = new Map();
  for (const route of routes) {
    if (!route.canonicalOrigin) continue;
    unique.set(`${route.locale}\n${route.canonicalOrigin}\n${route.pathPrefix}`, route);
  }
  return [...unique.values()];
}

function createRenderContext(localeRoute, localeRouting, requestUrl) {
  const alternateRoutes = uniqueAlternateRoutes(localeRouting.routes);
  return Object.freeze({
    locale: localeRoute.locale,
    market: localeRoute.market,
    messages: localeRoute.catalog.messages,
    pathPrefix: localeRoute.pathPrefix,
    publicPath: localeRoute.publicPath,
    formatCurrency: (value, currency) => formatCurrency(value, currency, localeRoute.locale),
    canonicalUrl(pathname) {
      const origin = localeRoute.canonicalOrigin || requestUrl.origin;
      return new URL(localeRoute.publicPath(pathname), origin).href;
    },
    alternateLinks(pathname) {
      return alternateRoutes.map((route) => ({
        locale: route.locale,
        url: new URL(routePublicPath(route, pathname), route.canonicalOrigin).href,
      }));
    },
  });
}

function localizeStaticHtml(html, context) {
  const canonicalPath = context.localeRoute.storefrontPath;
  const canonicalUrl = context.render.canonicalUrl(canonicalPath);
  const alternateLinks = context.render.alternateLinks(canonicalPath)
    .map((alternate) => `<link rel="alternate" hreflang="${escapeAttribute(alternate.locale)}" href="${escapeAttribute(alternate.url)}">`)
    .join("");
  const headMetadata = `<meta name="reai-api-base" content="${escapeAttribute(context.localeRoute.publicPath("/reai"))}"><meta name="reai-market" content="${escapeAttribute(context.localeRoute.market)}">`;
  let localized = html
    .replace(/<link\s+rel="alternate"\s+hreflang="[^"]+"\s+href="[^"]+">/g, "")
    .replace(/(href|action)="(\/(?!\/|assets\/)[^"]*)"/g, (_, attribute, path) => `${attribute}="${escapeAttribute(context.localeRoute.publicPath(path))}"`);
  localized = /<html\b[^>]*\blang="[^"]*"/i.test(localized)
    ? localized.replace(/(<html\b[^>]*\blang=")[^"]*(")/i, `$1${escapeAttribute(context.localeRoute.locale)}$2`)
    : localized.replace(/<html\b/i, `<html lang="${escapeAttribute(context.localeRoute.locale)}"`);
  localized = /<link\s+rel="canonical"\s+href="[^"]*">/i.test(localized)
    ? localized.replace(/<link\s+rel="canonical"\s+href="[^"]*">/i, `<link rel="canonical" href="${escapeAttribute(canonicalUrl)}">${alternateLinks}`)
    : localized.replace(/<head>/i, `<head><link rel="canonical" href="${escapeAttribute(canonicalUrl)}">${alternateLinks}`);
  return localized.replace(/<head>/i, `<head>${headMetadata}`);
}

function backwardCompatibleLocaleRouting(messages) {
  const catalog = defineLocaleCatalog("en", { worker: messages });
  return createLocaleRouting({
    catalogs: { en: catalog },
    routes: [{ locale: "en" }],
  });
}

export function createReaiStorefrontWorker({
  cacheKey,
  storefront,
  checkoutReturnPath = "/bestilling/fullfort/",
  noStorePaths = ["/handlekurv/", checkoutReturnPath],
  messages: messageOverrides = {},
  localeCatalogs,
  localeRoutes,
  beforeRequest,
}) {
  if (!cacheKey) throw new TypeError("cacheKey is required");
  if (!storefront?.HANDLE || !storefront?.matchRoute) throw new TypeError("storefront helpers are required");
  if (Boolean(localeCatalogs) !== Boolean(localeRoutes)) {
    throw new TypeError("localeCatalogs and localeRoutes must be configured together");
  }

  const localeRouting = localeCatalogs
    ? createLocaleRouting({ catalogs: localeCatalogs, routes: localeRoutes })
    : backwardCompatibleLocaleRouting({ ...defaultMessages, ...messageOverrides });

  function requestContext(url) {
    const localeRoute = localeRouting.resolve(url);
    if (!localeRoute) return null;
    const messages = {
      ...defaultMessages,
      ...messageOverrides,
      ...(localeRoute.catalog.messages.worker || {}),
    };
    return {
      localeRoute,
      messages,
      render: createRenderContext(localeRoute, localeRouting, url),
    };
  }

  const jsonResponse = (body, status, env, context) => new Response(JSON.stringify(body), {
    status,
    headers: securityHeaders(new Headers({
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Language": context.localeRoute.locale,
    }), env, context.localeRoute),
  });

  const htmlResponse = (
    html,
    env,
    context,
    status = 200,
    cacheControl = "public, max-age=60, stale-while-revalidate=300",
  ) => new Response(html, {
    status,
    headers: securityHeaders(new Headers({
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": status === 200 ? cacheControl : "no-store",
      "Content-Language": context.localeRoute.locale,
    }), env, context.localeRoute),
  });

  const xmlResponse = (xml, env, context) => new Response(xml, {
    headers: securityHeaders(new Headers({
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      "Content-Language": context.localeRoute.locale,
    }), env, context.localeRoute),
  });

  async function checkoutRequest(request, url, env, context) {
    let body;
    try {
      body = await request.json();
    } catch {
      return { error: jsonResponse({ error: context.messages.invalidJson }, 400, env, context) };
    }

    if (!Array.isArray(body.lines) || body.lines.length < 1 || body.lines.length > 100) {
      return { error: jsonResponse({ error: context.messages.invalidLineCount }, 400, env, context) };
    }

    const lines = body.lines.map((line) => ({
      variantId: line?.variantId,
      quantity: line?.quantity,
    }));
    if (lines.some((line) => !VARIANT_ID.test(line.variantId) || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 20)) {
      return { error: jsonResponse({ error: context.messages.invalidLine }, 400, env, context) };
    }

    const returnOrigin = context.localeRoute.canonicalOrigin || url.origin;
    return {
      body: JSON.stringify({
        lines,
        returnUrl: new URL(context.localeRoute.publicPath(checkoutReturnPath), returnOrigin).href,
      }),
    };
  }

  async function siteJson(env, context, path) {
    if (!siteToken(env, context.localeRoute)) {
      const error = new Error(context.messages.notConfigured);
      error.status = 503;
      throw error;
    }
    const upstreamPath = localizedUpstreamPath(path, context.localeRoute.locale);
    const response = await fetch(`${siteBaseUrl(env, context.localeRoute)}${upstreamPath}`, {
      headers: siteHeaders(env, context.localeRoute),
    });
    if (!response.ok) {
      const error = new Error(`Site API ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return response.json();
  }

  async function buildStorefront(env, context) {
    const [catalog, list] = await Promise.all([
      siteJson(env, context, "/site/v1/commerce/catalog"),
      siteJson(env, context, "/site/v1/commerce/collections"),
    ]);
    const collections = await Promise.all((list.collections || []).map(async (collection) => {
      if (!storefront.HANDLE.test(collection.handle)) return { ...collection, products: [] };
      try {
        return await siteJson(env, context, `/site/v1/commerce/collections/${encodeURIComponent(collection.handle)}`);
      } catch {
        return { ...collection, products: [] };
      }
    }));
    return {
      catalogVersion: catalog.catalogVersion,
      locale: context.localeRoute.locale,
      market: context.localeRoute.market,
      currency: catalog.currency,
      products: catalog.products || [],
      collections,
    };
  }

  async function getStorefront(env, context) {
    const storefrontCache = cacheRequest(cacheKey, context.localeRoute);
    try {
      const cached = await caches.default.match(storefrontCache);
      if (cached) return cached.json();
    } catch {}
    const store = await buildStorefront(env, context);
    try {
      await caches.default.put(storefrontCache, new Response(JSON.stringify(store), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, max-age=60",
        },
      }));
    } catch {}
    return store;
  }

  async function variantAvailability(env, context, variants) {
    const entries = await Promise.all((variants || []).map(async (variant) => {
      try {
        const payload = await siteJson(env, context, `/site/v1/commerce/availability/${variant.id}`);
        return [variant.id, payload.status === "AVAILABLE"];
      } catch {
        return [variant.id, null];
      }
    }));
    return Object.fromEntries(entries);
  }

  async function siteApiResponse(request, env, url, context) {
    if (!siteToken(env, context.localeRoute)) {
      return jsonResponse({ error: context.messages.notConfigured }, 503, env, context);
    }

    const route = context.localeRoute.storefrontPath;
    let upstreamPath;
    let cacheControl = "public, max-age=60, stale-while-revalidate=300";
    let body;

    if (request.method === "GET" && route === "/reai/site") {
      upstreamPath = "/site/v1/site";
    } else if (request.method === "GET" && route === "/reai/catalog") {
      upstreamPath = "/site/v1/commerce/catalog";
    } else if (request.method === "GET" && route.startsWith("/reai/products/")) {
      const handle = route.slice("/reai/products/".length);
      if (!handle || handle.includes("/")) {
        return jsonResponse({ error: context.messages.invalidProductHandle }, 400, env, context);
      }
      upstreamPath = `/site/v1/commerce/products/${encodeURIComponent(handle)}`;
    } else if (request.method === "GET" && route === "/reai/collections") {
      upstreamPath = "/site/v1/commerce/collections";
    } else if (request.method === "GET" && route.startsWith("/reai/collections/")) {
      const handle = route.slice("/reai/collections/".length);
      if (!handle || handle.includes("/") || !storefront.HANDLE.test(handle)) {
        return jsonResponse({ error: context.messages.invalidCollectionHandle }, 400, env, context);
      }
      upstreamPath = `/site/v1/commerce/collections/${encodeURIComponent(handle)}`;
    } else if (request.method === "GET" && route.startsWith("/reai/availability/")) {
      const variantId = route.slice("/reai/availability/".length);
      if (!VARIANT_ID.test(variantId)) {
        return jsonResponse({ error: context.messages.invalidVariantId }, 400, env, context);
      }
      upstreamPath = `/site/v1/commerce/availability/${variantId}`;
      cacheControl = "no-store";
    } else if (request.method === "POST" && route === "/reai/checkout/start") {
      const checkout = await checkoutRequest(request, url, env, context);
      if (checkout.error) return checkout.error;
      upstreamPath = "/site/v1/commerce/checkout-sessions";
      body = checkout.body;
      cacheControl = "no-store";
    } else if (["GET", "POST"].includes(request.method)) {
      return jsonResponse({ error: context.messages.routeNotFound }, 404, env, context);
    } else {
      return jsonResponse({ error: context.messages.methodNotAllowed }, 405, env, context);
    }

    const headers = siteHeaders(env, context.localeRoute, body);
    if (body) headers.set("Idempotency-Key", request.headers.get("Idempotency-Key") || crypto.randomUUID());

    try {
      const localizedPath = localizedUpstreamPath(upstreamPath, context.localeRoute.locale);
      const upstream = await fetch(`${siteBaseUrl(env, context.localeRoute)}${localizedPath}`, {
        method: request.method,
        headers,
        body,
      });
      const responseHeaders = securityHeaders(new Headers(), env, context.localeRoute);
      responseHeaders.set("Content-Type", upstream.headers.get("Content-Type") || "application/json; charset=utf-8");
      responseHeaders.set("Cache-Control", upstream.ok ? cacheControl : "no-store");
      responseHeaders.set("Content-Language", context.localeRoute.locale);
      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
      });
    } catch {
      return jsonResponse({ error: context.messages.temporarilyUnavailable }, 502, env, context);
    }
  }

  async function renderCommerce(request, env, url, context) {
    const route = storefront.matchRoute(context.localeRoute.storefrontPath);
    if (!route) return null;
    if (request.method !== "GET" && request.method !== "HEAD") {
      return jsonResponse({ error: context.messages.methodNotAllowed }, 405, env, context);
    }
    if (route.needsSlash) {
      const redirectOrigin = context.localeRoute.canonicalOrigin || url.origin;
      return Response.redirect(new URL(context.localeRoute.publicPath(route.canonicalPath), redirectOrigin), 301);
    }

    let store;
    try {
      store = await getStorefront(env, context);
    } catch {
      if (route.type === "home") return null;
      if (route.type === "sitemap") {
        return jsonResponse({ error: context.messages.temporarilyUnavailable }, 502, env, context);
      }
      return htmlResponse(storefront.renderUnavailablePage(null, context.render), env, context, 502);
    }

    if (route.type === "home") return htmlResponse(storefront.renderHomePage(store, context.render), env, context);
    if (route.type === "sitemap") return xmlResponse(storefront.renderSitemap(store, context.render), env, context);

    if (route.type === "collection") {
      if (!route.valid) return htmlResponse(storefront.renderNotFoundPage(store, context.render), env, context, 404);
      if (route.handle !== "all" && !storefront.collectionByHandle(store, route.handle)) {
        try {
          const detail = await siteJson(
            env,
            context,
            `/site/v1/commerce/collections/${encodeURIComponent(route.handle)}`,
          );
          store = { ...store, collections: [...store.collections, detail] };
        } catch (error) {
          return htmlResponse(
            storefront.renderNotFoundPage(store, context.render),
            env,
            context,
            error.status === 404 ? 404 : 502,
          );
        }
      }
      return htmlResponse(storefront.renderCollectionPage(store, route.handle, context.render), env, context);
    }

    if (route.type === "product") {
      if (!route.valid) return htmlResponse(storefront.renderNotFoundPage(store, context.render), env, context, 404);
      let product = storefront.productByHandle(store, route.handle);
      if (!product) {
        try {
          product = await siteJson(env, context, `/site/v1/commerce/products/${encodeURIComponent(route.handle)}`);
        } catch (error) {
          return htmlResponse(
            storefront.renderNotFoundPage(store, context.render),
            env,
            context,
            error.status === 404 ? 404 : 502,
          );
        }
      }
      const availability = await variantAvailability(env, context, product.variants);
      return htmlResponse(storefront.renderProductPage(store, product, availability, context.render), env, context);
    }

    return null;
  }

  return {
    async fetch(request, env) {
      const url = new URL(request.url);
      const earlyResponse = await beforeRequest?.({ request, env, url });
      if (earlyResponse) return earlyResponse;
      const context = requestContext(url);
      if (!context) return new Response("Not Found", { status: 404 });
      if (context.localeRoute.storefrontPath.startsWith("/reai/")) {
        return siteApiResponse(request, env, url, context);
      }

      const rendered = await renderCommerce(request, env, url, context);
      if (rendered) {
        if (request.method === "HEAD") return new Response(null, { status: rendered.status, headers: rendered.headers });
        return rendered;
      }

      const assetUrl = new URL(request.url);
      assetUrl.pathname = context.localeRoute.assetPathPrefix
        ? `${context.localeRoute.assetPathPrefix}${context.localeRoute.storefrontPath === "/" ? "/" : context.localeRoute.storefrontPath}`
        : context.localeRoute.storefrontPath;
      const response = await env.ASSETS.fetch(new Request(assetUrl, request));
      const headers = securityHeaders(new Headers(response.headers), env, context.localeRoute);
      const path = context.localeRoute.storefrontPath.endsWith("/")
        ? context.localeRoute.storefrontPath
        : `${context.localeRoute.storefrontPath}/`;
      headers.set("Content-Language", context.localeRoute.locale);
      headers.set(
        "Cache-Control",
        noStorePaths.includes(path)
          ? "no-store"
          : STATIC_ASSET.test(url.pathname)
            ? "public, max-age=3600, stale-while-revalidate=86400"
            : "public, max-age=300, stale-while-revalidate=3600",
      );

      let body = response.body;
      if (request.method !== "HEAD" && headers.get("Content-Type")?.includes("text/html")) {
        body = localizeStaticHtml(await response.text(), context);
        headers.delete("Content-Length");
      }

      return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    },
  };
}
