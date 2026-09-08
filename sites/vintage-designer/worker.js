// @ts-check
import { createReaiStorefrontWorker, norwegianMessages } from "../../packages/reai-cloudflare-storefront/worker.mjs";
import * as storefront from "./storefront.mjs";

const shared = createReaiStorefrontWorker({
  cacheKey: "vintage-designer-norway-nb-v1",
  storefront,
  locale: "nb-NO",
  market: "norway",
  messages: norwegianMessages,
  beforeRequest({ request, url }) {
    // This preview cannot create a checkout, even with a privileged future token.
    if (url.pathname.replace(/\/$/, "") === "/reai/checkout/start") {
      return Response.json({ error: "Betaling er ikke tilgjengelig i denne forhåndsvisningen.", code: "CHECKOUT_DISABLED" }, { status: 403 });
    }
    if (!["GET", "HEAD"].includes(request.method) && !url.pathname.startsWith("/reai/")) {
      return new Response("Metoden er ikke tillatt.", { status: 405, headers: { Allow: "GET, HEAD" } });
    }
    const normalized = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
    const html = storefront.renderStaticPage(normalized);
    if (html) {
      if (normalized !== url.pathname) return Response.redirect(new URL(normalized + url.search, url).href, 308);
      return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
    return null;
  },
});

export default {
  /** @param {Request} request @param {import("../../packages/reai-cloudflare-storefront/worker.mjs").WorkerEnv} env @param {ExecutionContext} ctx */
  async fetch(request, env, ctx) {
    const response = await shared.fetch(request, env, ctx);
    const headers = new Headers(response.headers);
    headers.set("X-Robots-Tag", "noindex, nofollow");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    if (!headers.has("Content-Security-Policy")) headers.set("Content-Security-Policy", "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://app.reai.no; script-src 'self'; form-action 'self' mailto:; base-uri 'self'; frame-ancestors 'none'; object-src 'none'");
    if (new URL(request.url).pathname.startsWith("/reai/checkout") || headers.get("Content-Type")?.includes("text/html")) headers.set("Cache-Control", "no-store");
    return new Response(request.method === "HEAD" ? null : response.body, { status: response.status, headers });
  },
};
