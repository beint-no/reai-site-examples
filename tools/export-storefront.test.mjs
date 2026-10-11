import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { exportStorefront } from "./export-storefront.mjs";

test("exports a standalone site without a parent dependency or demo catalog", async () => {
  const parent = await mkdtemp(path.join(os.tmpdir(), "reai-export-"));
  try {
    const destination = path.join(parent, "client");
    await exportStorefront("storefront", destination);
    const worker = await readFile(
      path.join(destination, "src/worker.js"),
      "utf8",
    );
    assert.match(worker, /\.\.\/packages\/reai-site-client\/client\.mjs/);
    assert.doesNotMatch(worker, /\.\.\/\.\.\/packages/);
    assert.match(worker, /\.\/catalog-filters\.mjs/);
    assert.doesNotMatch(worker, /\.\.\/\.\.\/demo/);
    const filters = await readFile(
      path.join(destination, "src/catalog-filters.mjs"),
      "utf8",
    );
    assert.match(filters, /\.\.\/public\/assets\/catalog-filter-data\.js/);
    for (const asset of ["catalog-filters.js", "catalog-filter-data.js", "cart-controls.js"]) {
      assert.equal(
        await readFile(path.join(destination, "public/assets", asset), "utf8"),
        await readFile(
          new URL(`../demo/public/assets/${asset}`, import.meta.url),
          "utf8",
        ),
      );
    }
    await assert.rejects(readdir(path.join(destination, "demo")));
    await assert.rejects(
      readdir(path.join(destination, "public/assets/famme")),
    );
    const assets = await readdir(path.join(destination, "public/assets"));
    assert.ok(!assets.some((name) => /checkout-lab|ux-notes|fashion/.test(name)));
    assert.match(worker, /newsletter\/subscribe/);
    assert.match(worker, /stock\/subscribe/);
    assert.ok(
      (
        await readdir(path.join(destination, "packages/reai-site-client"))
      ).includes("client.mjs"),
    );
    await assert.rejects(readdir(path.join(destination, "examples")));
    const styles = await readFile(
      path.join(destination, "public/styles.css"),
      "utf8",
    );
    assert.ok(styles.length > 0);
    await assert.rejects(exportStorefront("storefront", destination), {
      code: "EEXIST",
    });
    assert.equal(
      await readFile(path.join(destination, "public/styles.css"), "utf8"),
      styles,
    );
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});
