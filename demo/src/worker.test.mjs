import test from "node:test";
import assert from "node:assert/strict";
import worker from "./worker.mjs";
const id = "10000000-0000-4000-8000-000000000001";
const env = {
  REAI_SITE_CREDENTIAL: "not-public-secret",
  DEMO_CHECKOUT_ENABLED: "true",
  DEMO_PAYMENT_MODE: "test",
  REAI_API_BASE_URL: "https://app.reai.no",
  ASSETS: { fetch: async () => new Response("asset") },
};
const original = globalThis.fetch;
function request(path, body, extra = {}) {
  return new Request("https://nettbutikk.reai.no" + path, {
    method: "POST",
    headers: {
      Origin: "https://nettbutikk.reai.no",
      "Content-Type": "application/json",
      "Idempotency-Key": id,
      ...extra,
    },
    body: JSON.stringify(body),
  });
}
async function mocked(fn, reply) {
  globalThis.fetch = reply;
  try {
    return await fn();
  } finally {
    globalThis.fetch = original;
  }
}
const site = () =>
  Response.json({
    markets: [
      {
        handle: "default",
        defaultLocale: "nb-NO",
        locales: ["nb-NO", "en"],
        isDefault: true,
      },
    ],
  });
test("static explanatory pages work without credentials and never claim payment succeeded", async () => {
  const r = await worker.fetch(
    new Request("https://nettbutikk.reai.no/checkout/return/"),
    { ASSETS: env.ASSETS },
    {},
  );
  assert.equal(r.status, 200);
  assert.match(await r.text(), /ikke en betalingsbekreftelse/);
  const unavailable = await worker.fetch(
    new Request("https://nettbutikk.reai.no/reai/catalog"),
    { ASSETS: env.ASSETS },
    {},
  );
  assert.equal(unavailable.status, 503);
});
test("checkout requires enabled mode, same origin, JSON and valid bounded lines", async () =>
  mocked(
    async () => {
      const body = { lines: [{ variantId: id, quantity: 1 }] };
      assert.equal(
        (
          await worker.fetch(
            request("/reai/checkout/start", body),
            { ...env, DEMO_CHECKOUT_ENABLED: "false" },
            {},
          )
        ).status,
        403,
      );
      assert.equal(
        (
          await worker.fetch(
            request("/reai/checkout/start", body, {
              Origin: "https://other.invalid",
            }),
            env,
            {},
          )
        ).status,
        403,
      );
      assert.equal(
        (
          await worker.fetch(
            request("/reai/checkout/start", {
              lines: [{ variantId: id, quantity: 21 }],
            }),
            env,
            {},
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await worker.fetch(
            request("/reai/checkout/start", body, { "Idempotency-Key": "" }),
            env,
            {},
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await worker.fetch(
            request("/reai/checkout/start", {
              lines: [{ variantId: id, quantity: 1 }],
              padding: "x".repeat(17000),
            }),
            env,
            {},
          )
        ).status,
        413,
      );
    },
    async () => site(),
  ));
test("checkout delegates only opaque IDs and quantities, uses same-origin return and preserves idempotency", async () =>
  mocked(
    async () => {
      const r = await worker.fetch(
        request("/reai/checkout/start", {
          lines: [{ variantId: id, quantity: 1, price: 0 }],
          returnUrl: "https://other.invalid/",
        }),
        env,
        {},
      );
      assert.equal(r.status, 200);
      assert.doesNotMatch(await r.text(), /not-public-secret/);
    },
    async (input, init) => {
      if (String(input).endsWith("/site")) return site();
      assert.equal(
        init.headers.get("Authorization"),
        "Bearer not-public-secret",
      );
      assert.equal(init.headers.get("Idempotency-Key"), id);
      assert.deepEqual(JSON.parse(init.body), {
        lines: [{ variantId: id, quantity: 1 }],
        returnUrl: "https://nettbutikk.reai.no/checkout/return/",
      });
      return Response.json({
        checkoutUrl: "https://app.reai.no/checkout/session/opaque",
      });
    },
  ));
test("unsafe upstream checkout destination is rejected", async () =>
  mocked(
    async () => {
      assert.equal(
        (
          await worker.fetch(
            request("/reai/checkout/start", {
              lines: [{ variantId: id, quantity: 1 }],
            }),
            env,
            {},
          )
        ).status,
        502,
      );
    },
    async (input) =>
      String(input).endsWith("/site")
        ? site()
        : Response.json({ checkoutUrl: "https://other.invalid/collect" }),
  ));

test("all field-guide pages are credential-free and use the selected language", async () => {
  for (const slug of [
    "payments",
    "abandoned-checkout",
    "merchant-checkout",
    "json-ld",
    "bundles-and-pickup",
    "business",
    "shipping",
    "discounts",
    "catalog",
    "markets",
    "integration",
  ]) {
    for (const lang of ["en", "nb"]) {
      const r = await worker.fetch(
        new Request(`https://nettbutikk.reai.no/learn/${slug}/?lang=${lang}`),
        { ASSETS: env.ASSETS },
        {},
      );
      assert.equal(r.status, 200);
      assert.equal(
        r.headers.get("Content-Language"),
        lang === "en" ? "en" : "nb-NO",
      );
      assert.doesNotMatch(await r.text(), /not-public-secret/);
    }
  }
});

test("merchant checkout and fulfillment lab are exposed with explicit boundaries", async () => {
  const intro = await worker.fetch(new Request("https://nettbutikk.reai.no/checkout/merchant/"), { ASSETS: env.ASSETS }, {});
  assert.equal(intro.status, 200);
  assert.match(await intro.text(), /Merchant checkout/);
  const lab = await worker.fetch(new Request("https://nettbutikk.reai.no/scenarios/fulfillment/?lang=en"), { ASSETS: env.ASSETS }, {});
  assert.equal(lab.status, 200);
  const html = await lab.text();
  assert.match(html, /simulated/i);
  assert.match(html, /pickup/i);
});

test("product pages emit JSON-LD from Site API values", async () =>
  mocked(
    async () => {
      const r = await worker.fetch(new Request("https://nettbutikk.reai.no/products/test-betaling/"), env, {});
      assert.equal(r.status, 200);
      const html = await r.text();
      assert.match(html, /application\/ld\+json/);
      assert.match(html, /"name":"API Product"/);
      assert.match(html, /"price":1/);
      assert.match(html, /"priceCurrency":"NOK"/);
    },
    async (input) => {
      const url = new URL(input);
      if (url.pathname.endsWith("/site")) return site();
      if (url.pathname.endsWith("/storefront")) return Response.json({ locale: "nb-NO", marketHandle: "default", currency: "NOK", products: [], collections: [] });
      if (url.pathname.includes("/products/test-betaling")) return Response.json({ title: "API Product", handle: "test-betaling", description: "From API", brand: "API Brand", images: [], variants: [{ id, sku: "API-1", price: 1, options: [] }] });
      if (url.pathname.endsWith("/availability")) return Response.json({ variants: [{ variantId: id, status: "AVAILABLE" }] });
      throw new Error(`Unexpected upstream ${url.pathname}`);
    },
  ));

test("product-list explorer forwards the selected market/locale through the Site client", async () =>
  mocked(
    async () => {
      const r = await worker.fetch(
        new Request("https://nettbutikk.reai.no/reai/products?lang=en"),
        env,
        {},
      );
      assert.equal(r.status, 200);
      assert.deepEqual(await r.json(), { products: [] });
    },
    async (input, init) => {
      if (String(input).endsWith("/site")) return site();
      const url = new URL(input);
      assert.equal(url.pathname, "/site/v1/commerce/products");
      assert.equal(url.searchParams.get("market"), "default");
      assert.equal(url.searchParams.get("locale"), "en");
      assert.equal(
        init.headers.get("Authorization"),
        "Bearer not-public-secret",
      );
      return Response.json({ products: [] });
    },
  ));

test("collection pages preserve API ordering while resolving lightweight members", async () =>
  mocked(
    async () => {
      const r = await worker.fetch(
        new Request("https://nettbutikk.reai.no/collections/ordered/"),
        env,
        {},
      );
      assert.equal(r.status, 200);
      const html = await r.text();
      assert.ok(
        html.indexOf("/products/second/") < html.indexOf("/products/first/"),
      );
    },
    async (input) => {
      if (String(input).endsWith("/site")) return site();
      if (String(input).includes("/storefront"))
        return Response.json({
          locale: "nb-NO",
          currency: "NOK",
          collections: [],
          products: ["first", "second"].map((handle) => ({
            id: handle,
            handle,
            title: handle,
            images: [],
            variants: [{ price: 100 }],
          })),
        });
      return Response.json({
        handle: "ordered",
        title: "Ordered",
        products: [{ id: "second" }, { id: "first" }],
      });
    },
  ));

test("HTTPS redirect preserves path/query and all responses include hostname-only HSTS", async () => {
  const redirect = await worker.fetch(
    new Request("http://nettbutikk.reai.no/products/demo/?lang=en"),
    env,
    {},
  );
  assert.equal(redirect.status, 308);
  assert.equal(
    redirect.headers.get("Location"),
    "https://nettbutikk.reai.no/products/demo/?lang=en",
  );
  for (const path of ["/", "/health", "/assets/demo.css", "/not-found"]) {
    const r = await worker.fetch(
      new Request("https://nettbutikk.reai.no" + path),
      { ASSETS: env.ASSETS },
      {},
    );
    assert.equal(
      r.headers.get("Strict-Transport-Security"),
      "max-age=31536000",
    );
  }
});
test("scenario lab is static and cannot submit fixture identifiers to live checkout", async () => {
  for (const design of ["studio", "supply"]) {
    const res = await worker.fetch(
      new Request(`https://nettbutikk.reai.no/scenarios/${design}/`),
      { ASSETS: env.ASSETS },
      {},
    );
    assert.equal(res.status, 200);
    assert.match(await res.text(), /UI-laboratorium · simulerte data/);
  }
  await mocked(
    async () => {
      const res = await worker.fetch(
        request("/reai/checkout/start", {
          lines: [{ variantId: "scenario-navy-m", quantity: 1 }],
        }),
        env,
        {},
      );
      assert.equal(res.status, 400);
    },
    async () => site(),
  );
});
test("newsletter rejects missing consent, cross-origin writes and oversized bodies without contacting upstream", async () => {
  await mocked(
    async () => {
      for (const [body, headers, status] of [
        [null, {}, 400],
        [{ email: "test@example.com", consent: false }, {}, 400],
        [
          { email: "test@example.com", consent: true },
          { Origin: "https://evil.invalid" },
          403,
        ],
        [
          {
            email: "test@example.com",
            consent: true,
            padding: "x".repeat(3000),
          },
          {},
          413,
        ],
      ])
        assert.equal(
          (
            await worker.fetch(
              request("/reai/newsletter", body, headers),
              env,
              {},
            )
          ).status,
          status,
        );
    },
    async () => {
      throw new Error("Unexpected upstream request");
    },
  );
});
test("newsletter sends only email and explicit consent, with a non-enumerating receipt", async () => {
  await mocked(
    async () => {
      const res = await worker.fetch(
        request("/reai/newsletter", {
          email: "test@example.com",
          consent: true,
          tenantId: 999,
          customerId: 123,
        }),
        env,
        {},
      );
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), { accepted: true });
    },
    async (input, init) => {
      assert.equal(
        new URL(input).pathname,
        "/site/v1/newsletter/subscriptions",
      );
      assert.equal(
        init.headers.get("Authorization"),
        "Bearer not-public-secret",
      );
      assert.deepEqual(JSON.parse(init.body), {
        email: "test@example.com",
        consent: true,
      });
      return Response.json({ accepted: true });
    },
  );
});
test("newsletter upstream failure is explicit, never a fabricated success", async () => {
  await mocked(
    async () => {
      const res = await worker.fetch(
        request("/reai/newsletter", {
          email: "test@example.com",
          consent: true,
        }),
        env,
        {},
      );
      assert.equal(res.status, 503);
      assert.doesNotMatch(await res.text(), /not-public-secret|accepted/);
    },
    async () => new Response("Private upstream details", { status: 403 }),
  );
});

test("starter design uses the real implementation, prefixes its paths and disables writes in offline preview", async () =>
  mocked(
    async () => {
      const r = await worker.fetch(
        new Request("https://nettbutikk.reai.no/designs/starter/"),
        env,
        {},
      );
      assert.equal(r.status, 200);
      const html = await r.text();
      assert.match(html, /data-newsletter/);
      assert.match(html, /data-cart-dialog/);
      assert.match(html, /src="\/designs\/starter\/store.js"/);
      assert.match(html, /Mottaker: Better Integration/);
      assert.doesNotMatch(html, /not-public-secret/);
      const preview = {
        ...env,
        DEMO_PREVIEW: "true",
        DEMO_CHECKOUT_ENABLED: "false",
      };
      assert.equal(
        (
          await worker.fetch(
            request("/designs/starter/newsletter/subscribe", {
              email: "qa@example.test",
              consent: true,
            }),
            preview,
            {},
          )
        ).status,
        503,
      );
      assert.equal(
        (
          await worker.fetch(
            request("/designs/starter/checkout/start", {
              lines: [{ variantId: id, quantity: 1 }],
            }),
            preview,
            {},
          )
        ).status,
        503,
      );
    },
    async (input) =>
      String(input).endsWith("/site")
        ? Response.json({
            name: "Demo",
            markets: [
              {
                handle: "default",
                defaultLocale: "nb-NO",
                locales: ["nb-NO"],
                isDefault: true,
              },
            ],
          })
        : Response.json({
            locale: "nb-NO",
            currency: "NOK",
            products: [],
            collections: [],
          }),
  ));
