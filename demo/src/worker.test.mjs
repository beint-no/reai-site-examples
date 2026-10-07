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
  return new Request("https://demosite.reai.no" + path, {
    method: "POST",
    headers: {
      Origin: "https://demosite.reai.no",
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
    new Request("https://demosite.reai.no/checkout/return/"),
    { ASSETS: env.ASSETS },
    {},
  );
  assert.equal(r.status, 200);
  assert.match(await r.text(), /ikke en betalingsbekreftelse/);
  const unavailable = await worker.fetch(
    new Request("https://demosite.reai.no/reai/catalog"),
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
        returnUrl: "https://demosite.reai.no/checkout/return/",
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
