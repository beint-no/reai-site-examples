import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import worker from "../worker.js";
import { LEGACY_PATHS, canonicalPath } from "../routes.mjs";
import { EDITORIAL_PATHS, SITE_ORIGIN, sanitizeHtml } from "../storefront.mjs";

const publicRoot = path.resolve(import.meta.dirname, "../public");
const env = {
  REAI_SITE_TOKEN: "test-only-placeholder",
  ASSETS: {
    async fetch(request) {
      const pathname = new URL(request.url).pathname;
      try {
        const body = await readFile(path.join(publicRoot, pathname, "index.html"), "utf8");
        return new Response(request.method === "HEAD" ? null : body, { headers: { "Content-Type": "text/html" } });
      } catch {
        return new Response("Not found", { status: 404 });
      }
    },
  },
};
const get = (route, method = "GET") => worker.fetch(new Request(`${SITE_ORIGIN}${route}`, { method }), env, {});

test("old Worker paths redirect directly to Shopify URLs, preserving query strings", async () => {
  const cases = [...LEGACY_PATHS, ["/artikler/hvordan-vaske-bong", "/blogs/news/hvordan-vaske-bong"],
    ["/collections/raw/products/raw-mason-jar-glassoppbevaring", "/products/raw-mason-jar-glassoppbevaring"],
    ["/en/pages/om-oss", "/pages/om-oss"]];
  for (const [from, to] of cases) {
    for (const suffix of ["", "/", "/index.html"]) {
      const response = await get(`${from}${suffix}?q=RAW&variant=123`, "HEAD");
      assert.equal(response.status, 301, from + suffix);
      assert.equal(response.headers.get("Location"), `${SITE_ORIGIN}${to}?q=RAW&variant=123`);
      assert.equal(canonicalPath(to), to, "redirect must not chain");
    }
  }
});

test("Shopify static URLs serve the matching page with security headers", async () => {
  for (const route of [...EDITORIAL_PATHS.filter(p => p !== "/"), "/cart", "/search", "/account/login"]) {
    const response = await get(route);
    assert.equal(response.status, 200, route);
    assert.match(await response.text(), new RegExp(`rel="canonical" href="${SITE_ORIGIN}${route}"`));
    assert.ok(response.headers.get("Content-Security-Policy"));
    assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
  }
});

test("cart stays private and distinct from the order completion page", async () => {
  const cart = await get("/cart");
  assert.equal(cart.headers.get("Cache-Control"), "no-store");
  const html = await cart.text();
  assert.match(html, /data-cart-root/);
  assert.match(html, /data-checkout-start/);
  assert.doesNotMatch(html, /data-order-complete/);
  const complete = await get("/bestilling/fullfort");
  assert.equal(complete.headers.get("Cache-Control"), "no-store");
  assert.match(await complete.text(), /data-order-complete/);
  const head = await get("/cart", "HEAD");
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
});

test("all static page links and metadata use canonical paths", async () => {
  for (const entry of await readdir(publicRoot, { recursive: true })) {
    if (!entry.endsWith(".html")) continue;
    const html = await readFile(path.join(publicRoot, entry), "utf8");
    for (const match of html.matchAll(/(?:href|action)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
      assert.equal(canonicalPath(match[1]), match[1], `${entry}: ${match[1]}`);
    }
    assert.doesNotMatch(html, /https:\/\/budmates\.respiro\.workers\.dev\/(?:blogs|products|collections|pages|policies)\//, entry);
  }
});

test("API content keeps Shopify links on the Worker with query and fragment intact", () => {
  assert.match(sanitizeHtml('<a href="https://budmates.no/blogs/news/hvordan-vaske-bong?ref=raw#tips">Guide</a>'),
    /href="\/blogs\/news\/hvordan-vaske-bong\?ref=raw#tips"/);
  assert.match(sanitizeHtml('<a href="https://budmates.no/pages/om-oss">Om</a>'), /href="\/pages\/om-oss"/);
  assert.match(sanitizeHtml('<a href="/artikler/hvordan-vaske-bong/">Guide</a>'), /href="\/blogs\/news\/hvordan-vaske-bong"/);
});

test("unknown routes return 404 and checkout POST validation still runs", async () => {
  assert.equal((await get("/pages/not-a-real-page")).status, 404);
  const response = await worker.fetch(new Request(`${SITE_ORIGIN}/reai/checkout/start`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lines: [] }),
  }), env, {});
  assert.equal(response.status, 400);
});
