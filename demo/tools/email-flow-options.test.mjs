import assert from "node:assert/strict";
import test from "node:test";
import { configureAbandonedCheckout } from "./email-flow-options.mjs";

test("plans and enables the single demo abandoned-checkout flow", async () => {
  const calls = [];
  const management = async (route, method = "GET", body) => {
    calls.push({ route, method, body });
    if (route === "/api/sites") return [{ id: "site-id", name: "ReAI sin test-nettbutikk", status: "enabled", activeDomain: "nettbutikk.reai.no" }];
    if (route === "/api/email-marketing/flows") return [{ id: 7, siteId: "site-id", kind: "abandoned_checkout", enabled: false, subject: null, headline: null, body: null, buttonLabel: null }];
    if (method === "PUT") return { id: 7, siteId: "site-id", kind: "abandoned_checkout", enabled: true, activatedAt: "2026-10-16T00:00:00Z" };
    throw new Error(`Unexpected ${route}`);
  };
  assert.equal((await configureAbandonedCheckout(management)).enabled, false);
  const result = await configureAbandonedCheckout(management, { apply: true });
  assert.equal(result.enabled, true);
  assert.equal(calls.at(-1).route, "/api/email-marketing/flows/7");
});

test("rejects duplicate or mismatched flows", async () => {
  const management = async (route) => route === "/api/sites" ? [{ id: "site-id", name: "ReAI sin test-nettbutikk", status: "enabled", activeDomain: "nettbutikk.reai.no" }] : [{ id: 7, siteId: "site-id", kind: "abandoned_checkout" }, { id: 8, siteId: "site-id", kind: "abandoned_checkout" }];
  await assert.rejects(() => configureAbandonedCheckout(management), /exactly one/);
});
