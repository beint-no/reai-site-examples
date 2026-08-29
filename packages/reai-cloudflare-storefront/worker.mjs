const STATIC_ASSET = /\.(?:avif|css|eot|gif|ico|jpe?g|js|json|map|mp4|ogg|otf|png|svg|ttf|webm|webp|woff2?)$/i;
const VARIANT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MARKET_HANDLE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

function siteBaseUrl(env) {
  return (env.REAI_BASE_URL || "https://app.reai.no").replace(/\/$/, "");
}

function siteOrigin(env) {
  try {
    return new URL(siteBaseUrl(env)).origin;
  } catch {
    return "https://app.reai.no";
  }
}

function securityHeaders(headers, env) {
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set(
    "Content-Security-Policy",
    `default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: ${siteOrigin(env)}; script-src 'self'; form-action 'self' mailto:; base-uri 'self'; frame-ancestors 'none'; object-src 'none'`,
  );
  return headers;
}

function siteHeaders(env, body) {
  const headers = new Headers({
    Accept: "application/json",
    Authorization: `Bearer ${env.REAI_SITE_TOKEN}`,
  });
  if (body) headers.set("Content-Type", "application/json");
  return headers;
}

function cacheRequest(cacheKey) {
  return new Request(`https://reai-storefront-cache.invalid/${encodeURIComponent(cacheKey)}`);
}

function normalizePathPrefix(pathPrefix = "") {
  const value = String(pathPrefix).trim();
  if (!value || value === "/") return "";
  if (!value.startsWith("/") || value.endsWith("/") || value.includes("//") || value.includes("?") || value.includes("#")) {
    throw new TypeError(`Invalid pathPrefix: ${pathPrefix}`);
  }
  return value;
}

function stripPathPrefix(pathname, pathPrefix) {
  if (!pathPrefix) return pathname;
  if (pathname === pathPrefix) return "/";
  if (!pathname.startsWith(`${pathPrefix}/`)) return null;
  return pathname.slice(pathPrefix.length);
}

export function createReaiStorefrontWorker({
  cacheKey,
  storefront,
  checkoutReturnPath = "/bestilling/fullfort/",
  noStorePaths = ["/handlekurv/", checkoutReturnPath],
  messages: messageOverrides = {},
  locale,
  market,
  pathPrefix: configuredPathPrefix = "",
  beforeRequest,
}) {
  if (!cacheKey) throw new TypeError("cacheKey is required");
  if (!storefront?.HANDLE || !storefront?.matchRoute) throw new TypeError("storefront helpers are required");
  if (typeof locale !== "string" || !locale.trim()) throw new TypeError("locale is required");
  if (typeof market !== "string" || !market.trim()) throw new TypeError("market is required");

  const messages = { ...defaultMessages, ...messageOverrides };
  const pathPrefix = normalizePathPrefix(configuredPathPrefix);
  let canonicalLocale;
  try {
    [canonicalLocale] = Intl.getCanonicalLocales(locale.trim());
  } catch {
    throw new TypeError(`Invalid locale: ${locale}`);
  }
  const canonicalMarket = String(market).trim().toLowerCase();
  if (!MARKET_HANDLE.test(canonicalMarket)) throw new TypeError(`Invalid market: ${market}`);
  const storefrontCache = cacheRequest(`${cacheKey}:${canonicalMarket}:${canonicalLocale}`);
  const commercePath = (pathname) => {
    const url = new URL(pathname, "https://reai-site.invalid");
    url.searchParams.set("market", canonicalMarket);
    url.searchParams.set("locale", canonicalLocale);
    return `${url.pathname}${url.search}`;
  };
  const publicPath = (pathname) => {
    const value = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return pathPrefix ? `${pathPrefix}${value === "/" ? "/" : value}` : value;
  };
  const renderContext = Object.freeze({
    locale: canonicalLocale,
    market: canonicalMarket,
    pathPrefix,
    messages: Object.freeze(messages),
    publicPath,
  });

  const jsonResponse = (body, status, env) => new Response(JSON.stringify(body), {
    status,
    headers: securityHeaders(new Headers({
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Language": canonicalLocale,
    }), env),
  });

  const htmlResponse = (html, env, status = 200, cacheControl = "public, max-age=60, stale-while-revalidate=300") => new Response(html, {
    status,
    headers: securityHeaders(new Headers({
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": status === 200 ? cacheControl : "no-store",
      "Content-Language": canonicalLocale,
    }), env),
  });

  const xmlResponse = (xml, env) => new Response(xml, {
    headers: securityHeaders(new Headers({
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      "Content-Language": canonicalLocale,
    }), env),
  });

  async function checkoutRequest(request, url, env) {
    let body;
    try {
      body = await request.json();
    } catch {
      return { error: jsonResponse({ error: messages.invalidJson }, 400, env) };
    }

    if (!Array.isArray(body.lines) || body.lines.length < 1 || body.lines.length > 100) {
      return { error: jsonResponse({ error: messages.invalidLineCount }, 400, env) };
    }

    const lines = body.lines.map((line) => ({
      variantId: line?.variantId,
      quantity: line?.quantity,
    }));
    if (lines.some((line) => !VARIANT_ID.test(line.variantId) || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 20)) {
      return { error: jsonResponse({ error: messages.invalidLine }, 400, env) };
    }

    return {
      body: JSON.stringify({
        lines,
        returnUrl: new URL(publicPath(checkoutReturnPath), url.origin).href,
      }),
    };
  }

  async function siteJson(env, path) {
    if (!env.REAI_SITE_TOKEN) {
      const error = new Error(messages.notConfigured);
      error.status = 503;
      throw error;
    }
    const response = await fetch(`${siteBaseUrl(env)}${path}`, { headers: siteHeaders(env) });
    if (!response.ok) {
      const error = new Error(`Site API ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return response.json();
  }

  async function buildStorefront(env) {
    const [catalog, list] = await Promise.all([
      siteJson(env, commercePath("/site/v1/commerce/catalog")),
      siteJson(env, commercePath("/site/v1/commerce/collections")),
    ]);
    const collections = await Promise.all((list.collections || []).map(async (collection) => {
      if (!storefront.HANDLE.test(collection.handle)) return { ...collection, products: [] };
      try {
        return await siteJson(env, commercePath(`/site/v1/commerce/collections/${encodeURIComponent(collection.handle)}`));
      } catch {
        return { ...collection, products: [] };
      }
    }));
    return {
      catalogVersion: catalog.catalogVersion,
      currency: catalog.currency,
      products: catalog.products || [],
      collections,
    };
  }

  async function getStorefront(env) {
    try {
      const cached = await caches.default.match(storefrontCache);
      if (cached) return cached.json();
    } catch {}
    const store = await buildStorefront(env);
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

  async function variantAvailability(env, variants) {
    const entries = await Promise.all((variants || []).map(async (variant) => {
      try {
        const payload = await siteJson(env, commercePath(`/site/v1/commerce/availability/${variant.id}`));
        return [variant.id, payload.status === "AVAILABLE"];
      } catch {
        return [variant.id, null];
      }
    }));
    return Object.fromEntries(entries);
  }

  async function siteApiResponse(request, env, url) {
    if (!env.REAI_SITE_TOKEN) return jsonResponse({ error: messages.notConfigured }, 503, env);

    const route = stripPathPrefix(url.pathname, pathPrefix);
    if (route == null) return jsonResponse({ error: messages.routeNotFound }, 404, env);
    let upstreamPath;
    let cacheControl = "public, max-age=60, stale-while-revalidate=300";
    let body;

    if (request.method === "GET" && route === "/reai/site") {
      upstreamPath = "/site/v1/site";
    } else if (request.method === "GET" && route === "/reai/catalog") {
      upstreamPath = commercePath("/site/v1/commerce/catalog");
    } else if (request.method === "GET" && route.startsWith("/reai/products/")) {
      const handle = route.slice("/reai/products/".length);
      if (!handle || handle.includes("/")) return jsonResponse({ error: messages.invalidProductHandle }, 400, env);
      upstreamPath = commercePath(`/site/v1/commerce/products/${encodeURIComponent(handle)}`);
    } else if (request.method === "GET" && route === "/reai/collections") {
      upstreamPath = commercePath("/site/v1/commerce/collections");
    } else if (request.method === "GET" && route.startsWith("/reai/collections/")) {
      const handle = route.slice("/reai/collections/".length);
      if (!handle || handle.includes("/") || !storefront.HANDLE.test(handle)) {
        return jsonResponse({ error: messages.invalidCollectionHandle }, 400, env);
      }
      upstreamPath = commercePath(`/site/v1/commerce/collections/${encodeURIComponent(handle)}`);
    } else if (request.method === "GET" && route.startsWith("/reai/availability/")) {
      const variantId = route.slice("/reai/availability/".length);
      if (!VARIANT_ID.test(variantId)) return jsonResponse({ error: messages.invalidVariantId }, 400, env);
      upstreamPath = commercePath(`/site/v1/commerce/availability/${variantId}`);
      cacheControl = "no-store";
    } else if (request.method === "POST" && route === "/reai/checkout/start") {
      const checkout = await checkoutRequest(request, url, env);
      if (checkout.error) return checkout.error;
      upstreamPath = commercePath("/site/v1/commerce/checkout-sessions");
      body = checkout.body;
      cacheControl = "no-store";
    } else if (["GET", "POST"].includes(request.method)) {
      return jsonResponse({ error: messages.routeNotFound }, 404, env);
    } else {
      return jsonResponse({ error: messages.methodNotAllowed }, 405, env);
    }

    const headers = siteHeaders(env, body);
    if (body) headers.set("Idempotency-Key", request.headers.get("Idempotency-Key") || crypto.randomUUID());

    try {
      const upstream = await fetch(`${siteBaseUrl(env)}${upstreamPath}`, {
        method: request.method,
        headers,
        body,
      });
      const responseHeaders = securityHeaders(new Headers(), env);
      responseHeaders.set("Content-Type", upstream.headers.get("Content-Type") || "application/json; charset=utf-8");
      responseHeaders.set("Cache-Control", upstream.ok ? cacheControl : "no-store");
      responseHeaders.set("Content-Language", canonicalLocale);
      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
      });
    } catch {
      return jsonResponse({ error: messages.temporarilyUnavailable }, 502, env);
    }
  }

  async function renderCommerce(request, env, url) {
    const storefrontPath = stripPathPrefix(url.pathname, pathPrefix);
    if (storefrontPath == null) return null;
    const route = storefront.matchRoute(storefrontPath);
    if (!route) return null;
    if (request.method !== "GET" && request.method !== "HEAD") {
      return jsonResponse({ error: messages.methodNotAllowed }, 405, env);
    }
    if (route.needsSlash) return Response.redirect(`${url.origin}${publicPath(route.canonicalPath)}`, 301);

    let store;
    try {
      store = await getStorefront(env);
    } catch {
      if (route.type === "home") return null;
      if (route.type === "sitemap") return jsonResponse({ error: messages.temporarilyUnavailable }, 502, env);
      return htmlResponse(storefront.renderUnavailablePage(null, renderContext), env, 502);
    }

    if (route.type === "home") return htmlResponse(storefront.renderHomePage(store, renderContext), env);
    if (route.type === "sitemap") return xmlResponse(storefront.renderSitemap(store, renderContext), env);

    if (route.type === "collection") {
      if (!route.valid) return htmlResponse(storefront.renderNotFoundPage(store, renderContext), env, 404);
      if (route.handle !== "all" && !storefront.collectionByHandle(store, route.handle)) {
        try {
          const detail = await siteJson(env, commercePath(`/site/v1/commerce/collections/${encodeURIComponent(route.handle)}`));
          store = { ...store, collections: [...store.collections, detail] };
        } catch (error) {
          return htmlResponse(storefront.renderNotFoundPage(store, renderContext), env, error.status === 404 ? 404 : 502);
        }
      }
      return htmlResponse(storefront.renderCollectionPage(store, route.handle, renderContext), env);
    }

    if (route.type === "product") {
      if (!route.valid) return htmlResponse(storefront.renderNotFoundPage(store, renderContext), env, 404);
      let product = storefront.productByHandle(store, route.handle);
      if (!product) {
        try {
          product = await siteJson(env, commercePath(`/site/v1/commerce/products/${encodeURIComponent(route.handle)}`));
        } catch (error) {
          return htmlResponse(storefront.renderNotFoundPage(store, renderContext), env, error.status === 404 ? 404 : 502);
        }
      }
      const availability = await variantAvailability(env, product.variants);
      return htmlResponse(storefront.renderProductPage(store, product, availability, renderContext), env);
    }

    return null;
  }

  return {
    async fetch(request, env) {
      const url = new URL(request.url);
      const earlyResponse = await beforeRequest?.({ request, env, url, renderContext });
      if (earlyResponse) return earlyResponse;
      const storefrontPath = stripPathPrefix(url.pathname, pathPrefix);
      if (storefrontPath?.startsWith("/reai/")) return siteApiResponse(request, env, url);

      const rendered = await renderCommerce(request, env, url);
      if (rendered) {
        if (request.method === "HEAD") return new Response(null, { status: rendered.status, headers: rendered.headers });
        return rendered;
      }

      const response = await env.ASSETS.fetch(request);
      const headers = securityHeaders(new Headers(response.headers), env);
      const localPath = storefrontPath || url.pathname;
      const path = localPath.endsWith("/") ? localPath : `${localPath}/`;
      headers.set("Content-Language", canonicalLocale);
      headers.set(
        "Cache-Control",
        noStorePaths.includes(path)
          ? "no-store"
          : STATIC_ASSET.test(url.pathname)
            ? "public, max-age=3600, stale-while-revalidate=86400"
            : "public, max-age=300, stale-while-revalidate=3600",
      );

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    },
  };
}
