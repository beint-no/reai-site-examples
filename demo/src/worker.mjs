// @ts-check
/** @typedef {{ REAI_SITE_CREDENTIAL?: string, REAI_API_BASE_URL?: string, DEMO_MARKET?: string, DEMO_CHECKOUT_ENABLED?: string, DEMO_PAYMENT_MODE?: string, DEMO_MERCHANT_NAME?: string, DEMO_MERCHANT_ORG_NUMBER?: string, DEMO_PREVIEW?: string, ASSETS: Fetcher }} DemoEnv */
import { ReaiSiteClient } from "../../packages/reai-site-client/client.mjs";
import {
  HANDLE,
  learningRoutes,
  renderHome,
  renderDesign,
  renderDesigns,
  renderScenario,
  renderShop,
  renderProduct,
  renderCart,
  renderEditorial,
  renderError,
} from "./storefront.mjs";
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const headers = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Robots-Tag": "noindex, nofollow",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' https://app.reai.no https://app-test.reai.no data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
};
function response(body, status = 200, json = false) {
  return new Response(json ? JSON.stringify(body) : body, {
    status,
    headers: {
      ...headers,
      "Content-Type": json
        ? "application/json; charset=utf-8"
        : "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
/** @template T @param {Promise<import("../../packages/reai-site-client/client.mjs").SiteApiResponse<T>>} result @returns {Promise<T>} */
async function data(result) {
  const r = (await result).response;
  if (!r.ok)
    throw Object.assign(new Error("Upstream unavailable"), {
      status: r.status === 404 ? 404 : 502,
    });
  return r.json();
}
export default {
  /** @param {Request} request @param {DemoEnv} env @param {ExecutionContext} ctx */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.hostname === "demosite.reai.no") {
      if (!["GET", "HEAD"].includes(request.method))
        return response(
          { error: "Use https://nettbutikk.reai.no for new requests" },
          409,
          true,
        );
      url.protocol = "https:";
      url.hostname = "nettbutikk.reai.no";
      return Response.redirect(url.href, 308);
    }
    if (url.protocol === "http:" && url.hostname === "nettbutikk.reai.no") {
      url.protocol = "https:";
      return Response.redirect(url.href, 308);
    }
    let locale =
      url.searchParams.get("lang") === "en"
        ? "en"
        : url.searchParams.get("lang") === "nb"
          ? "nb-NO"
          : request.headers.get("Cookie")?.includes("reai-demo-lang=en")
            ? "en"
            : "nb-NO";
    const paymentMode =
      ["test", "live"].includes(env.DEMO_PAYMENT_MODE || "") &&
      env.DEMO_CHECKOUT_ENABLED === "true" &&
      (env.DEMO_PAYMENT_MODE !== "live" || !!env.DEMO_MERCHANT_NAME?.trim())
        ? env.DEMO_PAYMENT_MODE
        : "disabled";
    let context = {
      locale,
      preview: env.DEMO_PREVIEW === "true",
      paymentMode,
      configured: !!env.REAI_SITE_CREDENTIAL,
      merchantName: env.DEMO_MERCHANT_NAME?.trim(),
      merchantOrgNumber: env.DEMO_MERCHANT_ORG_NUMBER?.trim(),
      checkoutOrigin: new URL(env.REAI_API_BASE_URL || "https://app.reai.no")
        .origin,
    };
    if (url.pathname.startsWith("/assets/")) return env.ASSETS.fetch(request);
    if (url.pathname === "/health")
      return response(
        {
          ok: true,
          configured: !!env.REAI_SITE_CREDENTIAL,
          checkoutEnabled: paymentMode !== "disabled",
        },
        200,
        true,
      );
    if (url.pathname === "/robots.txt")
      return new Response("User-agent: *\nDisallow: /\n", {
        headers: { ...headers, "Content-Type": "text/plain" },
      });
    const path = url.pathname.replace(/\/$/, "") || "/";
    try {
      if (!["GET", "HEAD", "POST"].includes(request.method))
        return response({ error: "Method not allowed" }, 405, true);
      if (
        request.method === "POST" &&
        !["/reai/checkout/start", "/reai/newsletter"].includes(path)
      )
        return response({ error: "Not found" }, 404, true);
      if (request.method !== "POST" && path === "/")
        return finish(renderHome({}, context), context);
      if (request.method !== "POST" && path === "/designs")
        return finish(renderDesigns(context), context);
      if (
        request.method !== "POST" &&
        ["/scenarios/studio", "/scenarios/supply"].includes(path)
      )
        return finish(renderScenario(path.split("/")[2], context), context);
      if (
        request.method !== "POST" &&
        [
          "/features",
          "/about",
          "/privacy",
          "/api",
          "/checkout/return",
          "/cart",
          ...learningRoutes,
        ].includes(path)
      ) {
        const html =
          path === "/cart"
            ? renderCart(context)
            : renderEditorial(
                path === "/checkout/return" ? "return" : path.slice(1),
                context,
              );
        return finish(html, context);
      }
      if (!env.REAI_SITE_CREDENTIAL) {
        if (path === "/")
          return finish(
            renderHome(
              { products: [], collections: [], locale, currency: "NOK" },
              context,
            ),
            context,
          );
        return response(
          path.startsWith("/reai/")
            ? { error: "Site integration not configured" }
            : renderError(503, context),
          503,
          path.startsWith("/reai/"),
        );
      }
      const client = new ReaiSiteClient({
        baseUrl: env.REAI_API_BASE_URL || "https://app.reai.no",
        token: env.REAI_SITE_CREDENTIAL,
        fetch: (input, init) =>
          fetch(input, { ...init, signal: AbortSignal.timeout(10000) }),
      });
      if (path === "/reai/newsletter") {
        if (request.method !== "POST")
          return response({ error: "Method not allowed" }, 405, true);
        if (
          request.headers.get("Origin") !== url.origin ||
          !request.headers.get("Content-Type")?.startsWith("application/json")
        )
          return response({ error: "Same-origin JSON required" }, 403, true);
        let body;
        try {
          body = await readBoundedJson(request, 2048);
        } catch (e) {
          return response({ error: "Invalid signup" }, e.status || 400, true);
        }
        if (
          typeof body.email !== "string" ||
          body.email.length > 254 ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) ||
          body.consent !== true
        )
          return response(
            { error: "Valid email and explicit consent required" },
            400,
            true,
          );
        if (body.website) return response({ accepted: true }, 200, true);
        if (env.DEMO_PREVIEW === "true")
          return response(
            { error: "Signup is unavailable in offline preview" },
            503,
            true,
          );
        const result = await client.subscribeNewsletter({
          email: body.email.trim(),
          consent: true,
        });
        if (!result.response.ok)
          return response(
            { error: "Signup is temporarily unavailable" },
            result.response.status === 400 ? 400 : 503,
            true,
          );
        return response({ accepted: true }, 200, true);
      }
      const site = await data(client.site());
      const selected =
        site.markets?.find((m) => m.handle === env.DEMO_MARKET) ||
        site.markets?.find((m) => m.isDefault) ||
        site.markets?.[0];
      if (!selected)
        throw Object.assign(new Error("Market not configured"), {
          status: 503,
        });
      const requestedLanguage = locale.startsWith("en") ? "en" : "nb";
      locale =
        selected.locales?.find((l) => l.startsWith(requestedLanguage)) ||
        selected.defaultLocale;
      context = { ...context, locale };
      const delivery = { market: selected.handle, locale };
      if (path === "/reai/checkout/start") {
        if (request.method !== "POST")
          return response({ error: "Method not allowed" }, 405, true);
        if (paymentMode === "disabled")
          return response({ error: "Checkout is not enabled" }, 403, true);
        if (
          request.headers.get("Origin") !== url.origin ||
          !request.headers.get("Content-Type")?.startsWith("application/json")
        )
          return response({ error: "Same-origin JSON required" }, 403, true);
        const reader = request.body?.getReader();
        let bytes = 0,
          chunks = [];
        if (!reader) return response({ error: "Invalid JSON" }, 400, true);
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          bytes += chunk.value.byteLength;
          if (bytes > 16384) {
            await reader.cancel();
            return response({ error: "Cart too large" }, 413, true);
          }
          chunks.push(chunk.value);
        }
        const combined = new Uint8Array(bytes);
        let offset = 0;
        for (const chunk of chunks) {
          combined.set(chunk, offset);
          offset += chunk.byteLength;
        }
        const raw = new TextDecoder().decode(combined);
        let body;
        try {
          body = JSON.parse(raw);
        } catch {
          return response({ error: "Invalid JSON" }, 400, true);
        }
        if (
          !Array.isArray(body?.lines) ||
          body.lines.length < 1 ||
          body.lines.length > 30 ||
          body.lines.some(
            (l) =>
              !UUID.test(l?.variantId) ||
              !Number.isInteger(l.quantity) ||
              l.quantity < 1 ||
              l.quantity > 20,
          )
        )
          return response({ error: "Invalid cart" }, 400, true);
        const key = request.headers.get("Idempotency-Key");
        if (!key || !UUID.test(key))
          return response(
            { error: "Valid idempotency key required" },
            400,
            true,
          );
        const result = await client.createCheckoutSession(
          {
            lines: body.lines.map((l) => ({
              variantId: l.variantId,
              quantity: l.quantity,
            })),
            returnUrl: new URL("/checkout/return/", url).href,
          },
          delivery,
          key,
        );
        const upstream = result.response;
        if (!upstream.ok) {
          let detail = { error: "Checkout could not be started" };
          if (upstream.status === 409) detail = await upstream.json();
          return response(detail, upstream.status === 409 ? 409 : 502, true);
        }
        const checkout = await result.json();
        const destination = new URL(checkout.checkoutUrl);
        if (
          destination.protocol !== "https:" ||
          destination.origin !==
            new URL(env.REAI_API_BASE_URL || "https://app.reai.no").origin
        )
          throw new Error("Unexpected checkout destination");
        return response(checkout, 200, true);
      }
      if (request.method === "POST")
        return response({ error: "Method not allowed" }, 405, true);
      if (path.startsWith("/reai/")) {
        const endpoint = path.slice(6),
          resource = url.searchParams.get("resource") || "";
        let result;
        if (endpoint === "site") return response(site, 200, true);
        if (endpoint === "storefront") result = client.storefront(delivery);
        else if (endpoint === "catalog") result = client.catalog(delivery);
        else if (endpoint === "products") result = client.products(delivery);
        else if (endpoint === "collections")
          result = client.collections(delivery);
        else if (
          ["product", "collection"].includes(endpoint) &&
          HANDLE.test(resource)
        )
          result =
            endpoint === "product"
              ? client.product(resource, delivery)
              : client.collection(resource, delivery);
        else if (endpoint === "availability" && UUID.test(resource))
          result = client.availability(resource, delivery);
        else if (endpoint === "availabilities") {
          const ids = resource.split(",");
          if (
            !ids.length ||
            ids.length > 100 ||
            ids.some((id) => !UUID.test(id))
          )
            return response(
              { error: "Supply up to 100 variant UUIDs" },
              400,
              true,
            );
          result = client.availabilities(ids, delivery);
        } else
          return response(
            { error: "Unknown route or invalid resource" },
            400,
            true,
          );
        return response(await data(result), 200, true);
      }
      const store = await data(client.storefront(delivery));
      if (path === "/") return finish(renderHome(store, context), context);
      if (
        ["/designs/studio", "/designs/atelier", "/designs/supply"].includes(
          path,
        )
      ) {
        const ids = store.products.flatMap((p) => p.variants.map((v) => v.id));
        const availability = ids.length
          ? await data(client.availabilities(ids.slice(0, 100), delivery))
          : { variants: [] };
        return finish(
          renderDesign(path.split("/")[2], store, availability, context),
          context,
        );
      }
      if (path === "/shop") return finish(renderShop(store, context), context);
      if (path.startsWith("/collections/")) {
        const handle = path.slice(13);
        if (!HANDLE.test(handle))
          return response(renderError(404, context), 404);
        const collection = await data(client.collection(handle, delivery));
        const byId = new Map(store.products.map((p) => [p.id, p]));
        return finish(
          renderShop(store, context, {
            ...collection,
            products: collection.products.flatMap((p) => {
              const full = byId.get(p.id);
              return full ? [full] : [];
            }),
          }),
          context,
        );
      }
      if (path.startsWith("/products/")) {
        const handle = path.slice(10);
        if (!HANDLE.test(handle))
          return response(renderError(404, context), 404);
        const product = await data(client.product(handle, delivery));
        const available = await data(
          client.availabilities(
            product.variants.map((v) => v.id),
            delivery,
          ),
        );
        return finish(
          renderProduct(store, product, available, context),
          context,
        );
      }
      return response(renderError(404, context), 404);
    } catch (error) {
      const status = error.status || 502;
      return response(
        path.startsWith("/reai/")
          ? {
              error:
                status === 404
                  ? "Not found"
                  : "ReAI is temporarily unavailable",
            }
          : renderError(status, context),
        status,
        path.startsWith("/reai/"),
      );
    }
    function finish(html, context) {
      const result = response(request.method === "HEAD" ? null : html);
      result.headers.set("Content-Language", context.locale);
      if (url.searchParams.has("lang"))
        result.headers.set(
          "Set-Cookie",
          `reai-demo-lang=${context.locale.startsWith("en") ? "en" : "nb"}; Path=/; SameSite=Lax; Max-Age=31536000; ${url.protocol === "https:" ? "Secure; " : ""}HttpOnly`,
        );
      return result;
    }
  },
};

async function readBoundedJson(request, limit) {
  const reader = request.body?.getReader();
  if (!reader) throw Object.assign(new Error("Empty body"), { status: 400 });
  const chunks = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > limit) {
      await reader.cancel();
      throw Object.assign(new Error("Body too large"), { status: 413 });
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}
