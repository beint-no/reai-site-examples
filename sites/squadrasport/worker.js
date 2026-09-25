// @ts-check

import {
  createReaiStorefrontWorker,
  norwegianMessages,
} from "../../packages/reai-cloudflare-storefront/worker.mjs";
import * as storefront from "./storefront.mjs";

async function reviewAccessToken(accessCode) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`squadrasport-review:${accessCode}`));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function checkoutAllowed(request, env) {
  if (env.CHECKOUT_ENABLED !== "true" || !env.CHECKOUT_ACCESS_CODE) return false;
  const cookie = request.headers.get("Cookie")?.split(";").map((part) => part.trim())
    .find((part) => part.startsWith("squadra-review-checkout="))?.split("=")[1];
  return cookie === await reviewAccessToken(env.CHECKOUT_ACCESS_CODE);
}

async function beforeRequest({ request, env, url }) {
  if (url.hostname === "www.squadrasport.no") {
    const destination = new URL(url);
    destination.hostname = "squadrasport.no";
    return Response.redirect(destination.href, 308);
  }
  if (["GET", "HEAD"].includes(request.method)) {
    const nestedProduct = url.pathname.match(/^\/collections\/[^/]+\/products\/([^/]+)\/?$/);
    if (nestedProduct) {
      const destination = new URL(url);
      destination.pathname = `/products/${nestedProduct[1]}`;
      return Response.redirect(destination.href, 301);
    }
  }
  if (url.pathname === "/review/checkout-access") {
    if (env.CHECKOUT_ENABLED !== "true" || !env.CHECKOUT_ACCESS_CODE) {
      return new Response("Review checkout is unavailable.", { status: 404 });
    }
    if (request.method === "GET") {
      return new Response('<!doctype html><html lang="no"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Test kassen | Squadra Sport</title><main><h1>Test kassen</h1><form method="post"><label>Tilgangskode <input name="code" type="password" required autocomplete="off"></label><button type="submit">Åpne kassen</button></form></main></html>', {
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Content-Security-Policy": "default-src 'none'; form-action 'self'; base-uri 'none'" },
      });
    }
    if (request.method === "POST") {
      const code = String((await request.formData()).get("code") || "");
      if (code !== env.CHECKOUT_ACCESS_CODE) return new Response("Ugyldig tilgangskode.", { status: 403 });
      const accessToken = await reviewAccessToken(code);
      return new Response(null, {
        status: 303,
        headers: {
          Location: "/cart",
          "Cache-Control": "no-store",
          "Set-Cookie": `squadra-review-checkout=${accessToken}; Max-Age=3600; Path=/; HttpOnly; Secure; SameSite=Strict`,
        },
      });
    }
    return new Response(null, { status: 405 });
  }
  if (url.pathname === "/reai/storefront-config" && request.method === "GET") {
    return new Response(JSON.stringify({ checkoutEnabled: await checkoutAllowed(request, env) }), {
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
  if (url.pathname === "/reai/checkout/start" && !await checkoutAllowed(request, env)) {
    return new Response(JSON.stringify({ error: "Kassen åpner når butikken er klar." }), {
      status: 503,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
  return null;
}

export default createReaiStorefrontWorker({
  cacheKey: "squadrasport-v1",
  storefront,
  market: "default",
  locale: "nb-NO",
  messages: norwegianMessages,
  checkoutReturnPath: "/order/complete/",
  noStorePaths: ["/cart/", "/search/", "/order/complete/"],
  beforeRequest,
});
