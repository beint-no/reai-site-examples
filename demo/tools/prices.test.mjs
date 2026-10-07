import test from "node:test";
import assert from "node:assert/strict";
import { netPriceForDisplay } from "./prices.mjs";
test("seed contribution amounts remain exact after ReAI adds configured VAT", () => {
  for (const gross of [100, 500, 1000, 49, 149, 250, 79, 129, 99]) {
    const net = netPriceForDisplay(gross, 25);
    assert.equal(Math.round(net * 100) + Math.round(net * 25), gross * 100);
    assert.equal(netPriceForDisplay(gross, 0), gross);
  }
});
test("setup rejects amounts that would silently change at delivery", () => {
  assert.throws(() => netPriceForDisplay(1.02, 25), /exactly/);
  assert.throws(() => netPriceForDisplay(100, NaN), /Invalid/);
});
