import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { netPriceForDisplay } from "./prices.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const seed = JSON.parse(
  await readFile(path.join(root, "demo/seed/catalog.json"), "utf8"),
);
const args = process.argv.slice(2);
const apply = args.includes("--apply");
const value = (flag) => {
  const i = args.indexOf(flag);
  return i < 0 ? undefined : args[i + 1];
};
const tenantId = value("--tenant-id");
const api = new URL(process.env.REAI_API_BASE_URL || "https://app.reai.no");
const siteName = "ReAI Lekebutikken";
const priceName = "ReAI demo NOK";
const skus = (p) => p.variants.map((_, i) => `REAI-DEMO-${p.handle}-${i + 1}`);

if (!apply) {
  console.log(
    JSON.stringify(
      {
        mode: "plan",
        api: api.origin,
        tenantId: tenantId || "required for apply",
        site: siteName,
        priceList: priceName,
        currency: "NOK",
        products: seed.products.map((p) => ({
          handle: p.handle,
          prices: p.variants.map((v) => v.price),
          stockItem: false,
        })),
        collections: seed.collections.map((c) => c.handle),
        checkout: "unchanged; disabled in Worker by default",
      },
      null,
      2,
    ),
  );
  process.exit(0);
}
if (!/^\d+$/.test(tenantId || ""))
  throw new Error("--tenant-id must identify the authorized demo tenant.");
if (
  api.protocol !== "https:" ||
  !["app.reai.no", "app-test.reai.no"].includes(api.hostname)
)
  throw new Error("Use an approved ReAI HTTPS API origin.");
const token = process.env.REAI_USER_API_TOKEN;
if (!token)
  throw new Error(
    "Set REAI_USER_API_TOKEN locally; do not pass it as a command argument.",
  );
const vatCode = process.env.REAI_DEMO_VAT_CODE;
if (!vatCode)
  throw new Error(
    "Set REAI_DEMO_VAT_CODE to the VAT code approved for this test catalog.",
  );
const local = path.join(root, ".local");
const credentialPath = path.join(local, "demo-site-token");
if (args.includes("--write-credential")) {
  try {
    await access(credentialPath);
    throw new Error(
      "Credential output exists; do not create or rotate a token implicitly.",
    );
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
if (spawnSync("magick", ["-version"], { stdio: "ignore" }).status !== 0)
  throw new Error(
    "ImageMagick is required to prepare the original demo illustrations.",
  );

async function management(route, method = "GET", body) {
  const multipart = body instanceof FormData;
  const response = await fetch(new URL(route, api), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Tenant-Id": tenantId,
      ...(!multipart && body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? (multipart ? body : JSON.stringify(body)) : undefined,
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok)
    throw new Error(
      `${method} ${route} returned HTTP ${response.status}; response details are omitted to avoid exposing private data.`,
    );
  return response.status === 204 ? null : response.json();
}

// Authorization and module status must be checked before any catalog mutation.
let settings = await management("/api/company-settings");
const vatCodes = await management("/api/vat-codes?usage=customer-invoice");
const selectedVat = vatCodes.find((v) => v.code === vatCode);
if (!selectedVat)
  throw new Error(
    "The approved VAT code is not supported for customer invoices.",
  );
const rate = settings.vatRegistered ? Number(selectedVat.rate) : 0;
for (const p of seed.products)
  for (const v of p.variants) netPriceForDisplay(v.price, rate);
if (!settings.modules?.onlineStore) {
  if (!args.includes("--enable-online-store"))
    throw new Error(
      "Online store module is disabled. Enable it explicitly or rerun with --enable-online-store.",
    );
  settings = await management("/api/company-settings", "PATCH", {
    modules: { onlineStore: true },
  });
}
const sites = await management("/api/sites");
const matches = sites.filter((s) => s.name === siteName);
if (matches.length > 1)
  throw new Error(
    "Multiple demo Sites exist; resolve them before applying setup.",
  );
let site = matches[0];
if (!site)
  site = await management("/api/sites", "POST", {
    name: siteName,
    locale: "nb-NO",
    activeDomain: "demosite.reai.no",
    previewDomain: "reai-demo-store.respiro.workers.dev",
  });
if (
  site.activeDomain !== "demosite.reai.no" ||
  site.previewDomain !== "reai-demo-store.respiro.workers.dev"
)
  throw new Error(
    "The existing demo Site has different domains; review the intended Site before setup.",
  );
if (site.status !== "enabled")
  throw new Error(
    "The dedicated demo Site is disabled; review its status explicitly.",
  );
const base = `/api/sites/${site.id}`;
const lists = await management("/api/product-price-lists");
const namedLists = lists.filter((l) => l.name === priceName);
if (namedLists.length > 1 || namedLists.some((l) => l.currency !== "NOK"))
  throw new Error("Demo price-list name/currency conflict.");
const priceList =
  namedLists[0] ||
  (await management("/api/product-price-lists", "POST", {
    name: priceName,
    currency: "NOK",
  }));
await management(`${base}/commerce`, "PUT", { priceListId: priceList.id });
const markets = await management(`${base}/commerce/markets`);
const market = markets.find((m) => m.handle === "default");
const marketBody = {
  handle: "default",
  name: "Demo Norge",
  priceListId: priceList.id,
  defaultLocale: "nb-NO",
  locales: ["nb-NO", "en"],
  countries: ["NO"],
  enabled: true,
  isDefault: true,
};
await management(
  `${base}/commerce/markets${market ? "/" + market.id : ""}`,
  market ? "PUT" : "POST",
  marketBody,
);
const products = await management("/api/products");
const publications = await management(`${base}/products`);
await mkdir(local, { recursive: true, mode: 0o700 });
const result = { siteId: site.id, priceListId: priceList.id, products: [] };
for (const definition of seed.products) {
  const ownSkus = skus(definition);
  const matches = products.filter((p) =>
    p.variants.some((v) => ownSkus.includes(v.sku)),
  );
  if (
    matches.length > 1 ||
    matches.some(
      (p) =>
        p.brand !== "ReAI Demo" ||
        p.archived ||
        p.variants.length !== ownSkus.length ||
        !p.variants.every((v) => ownSkus.includes(v.sku)),
    )
  )
    throw new Error(
      `SKU conflict for ${definition.handle}; no unrelated product will be overwritten.`,
    );
  let product = matches[0];
  if (!product)
    product = await management("/api/products", "POST", {
      title: definition.title,
      description: definition.description,
      brand: "ReAI Demo",
      stockItem: false,
      vatCode,
      variantOptionTypes: ["Dose"],
      variants: definition.variants.map((v, i) => ({
        sku: ownSkus[i],
        sellingPrice: netPriceForDisplay(v.price, rate),
        options: { Dose: v.title },
      })),
    });
  if (product.vatCode !== vatCode)
    throw new Error(
      `${definition.handle} has a different approved VAT code; do not change its tax configuration implicitly.`,
    );
  if (product.stockItem)
    throw new Error(
      `${definition.handle} is stock-managed; digital seed cannot reuse it.`,
    );
  for (let i = 0; i < ownSkus.length; i++) {
    const variant = product.variants.find((v) => v.sku === ownSkus[i]);
    await management(
      `/api/product-price-lists/${priceList.id}/prices/${variant.productVariantId}`,
      "PUT",
      { sellingPrice: netPriceForDisplay(definition.variants[i].price, rate) },
    );
  }
  if (!product.images.length) {
    const png = path.join(local, `${definition.art}.png`);
    const converted = spawnSync(
      "magick",
      [
        "-background",
        "none",
        path.join(root, `demo/public/assets/${definition.art}.svg`),
        png,
      ],
      { stdio: "ignore" },
    );
    if (converted.status !== 0)
      throw new Error(`Could not prepare ${definition.art} illustration.`);
    const form = new FormData();
    form.append(
      "file",
      new Blob([await readFile(png)], { type: "image/png" }),
      `${definition.handle}.png`,
    );
    const image = await management(
      `/api/products/${product.id}/images`,
      "POST",
      form,
    );
    await management(
      `/api/products/${product.id}/images/${image.id}/metadata`,
      "PUT",
      { filename: `${definition.handle}.avif`, altText: definition.title },
    );
  }
  if (definition.en)
    await management(
      `/api/products/${product.id}/translations/en`,
      "PUT",
      definition.en,
    );
  const publication = publications.find((p) => p.handle === definition.handle);
  if (publication && publication.productId !== product.id)
    throw new Error(`Publication conflict for ${definition.handle}.`);
  if (!publication)
    await management(`${base}/products`, "POST", {
      productId: product.id,
      handle: definition.handle,
    });
  result.products.push({ handle: definition.handle, productId: product.id });
}
const collections = await management(`${base}/commerce/collections`);
for (const [i, c] of seed.collections.entries()) {
  const productHandles = seed.products
    .filter((p) => p.collection === c.handle)
    .map((p) => p.handle);
  const body = {
    handle: c.handle,
    title: c.title,
    description: c.description,
    productHandles,
    published: true,
    type: "manual",
    sort: "manual",
    sortOrder: i,
  };
  if (!collections.some((x) => x.handle === c.handle))
    await management(`${base}/commerce/collections`, "POST", body);
  else
    await management(
      `${base}/commerce/collections/${c.handle}/products`,
      "PUT",
      { productHandles },
    );
  if (c.en)
    await management(
      `${base}/commerce/collections/${c.handle}/translations/en`,
      "PUT",
      c.en,
    );
}
if (args.includes("--write-credential")) {
  const credential = await management(`${base}/credentials`, "POST", {
    name: "ReAI demo Worker",
    environment: "live",
    scopes: [
      "site:read",
      "commerce:catalog:read",
      "commerce:availability:read",
      "commerce:checkout:create",
    ],
  });
  if (!credential.token)
    throw new Error("The created credential did not return a plaintext token.");
  await writeFile(credentialPath, credential.token, {
    flag: "wx",
    mode: 0o600,
  });
  console.log(
    "Site credential saved to ignored .local/demo-site-token; its value was not printed.",
  );
}
await writeFile(
  path.join(local, "demo-setup.json"),
  JSON.stringify(result, null, 2) + "\n",
  { mode: 0o600 },
);
console.log(
  "Demo catalog configured. Private IDs saved under ignored .local/. Checkout and payment-provider settings were not changed.",
);
