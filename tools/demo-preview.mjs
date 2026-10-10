import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import worker from "../demo/src/worker.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  port = Number(process.env.DEMO_PORT || 8787),
  origin = `http://127.0.0.1:${port}`;
const blueprint = JSON.parse(
  await readFile(path.join(root, "demo/seed/catalog.json"), "utf8"),
);
const uuid = (n) => `10000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
let next = 100;
const products = blueprint.products.map((p, i) => ({
  id: uuid(i + 1),
  handle: p.handle,
  title: p.title,
  description: p.description,
  brand: "ReAI Demo",
  seoTitle: p.title,
  images: [],
  variants: p.variants.map((v, index) => ({
    id: uuid(next++),
    price: v.price,
    compareAtPrice: v.compareAtPrice ?? null,
    sku: `REAI-DEMO-${p.handle}-${index + 1}`,
    options: [{ name: "Dose", value: v.title }],
    vatRate: 25,
  })),
}));
const collections = blueprint.collections.map((c, i) => ({
  handle: c.handle,
  title: c.title,
  description: c.description,
  seoTitle: c.title,
  id: uuid(50 + i),
  products: products.filter(
    (p) =>
      c.type === "automated" || blueprint.products.find((x) => x.handle === p.handle).collection ===
      c.handle,
  ),
}));
const store = {
  catalogVersion: 1,
  marketId: uuid(9002),
  marketHandle: "default",
  locale: "nb-NO",
  currency: "NOK",
  products,
  collections,
};
const upstream = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(input);
  if (url.origin !== "http://demo-api.invalid") return upstream(input, init);
  const locale = url.searchParams.get("locale") || "nb-NO",
    context = {
      marketId: uuid(9002),
      marketHandle: "default",
      locale,
      currency: "NOK",
    };
  if (url.pathname.endsWith("/site"))
    return Response.json({
      id: uuid(9001),
      name: blueprint.name,
      sourceLocale: "nb-NO",
      status: "enabled",
      markets: [
        {
          id: uuid(9002),
          name: "Demo Norge",
          countries: ["NO"],
          handle: "default",
          locales: ["nb-NO", "en"],
          defaultLocale: "nb-NO",
          isDefault: true,
          currency: "NOK",
        },
      ],
    });
  const translatedProducts = locale.startsWith("en")
    ? products.map((p, i) => ({ ...p, ...blueprint.products[i].en }))
    : products;
  const translatedCollections = locale.startsWith("en")
    ? collections.map((c, i) => ({ ...c, ...blueprint.collections[i].en }))
    : collections;
  const collectionDetails = translatedCollections.map((c) => ({
    ...c,
    products: c.products.map((p) => {
      const item = translatedProducts.find((x) => x.id === p.id);
      return {
        id: item.id,
        handle: item.handle,
        title: item.title,
        brand: item.brand,
        price: item.variants[0].price,
      };
    }),
  }));
  if (url.pathname.endsWith("/storefront"))
    return Response.json({
      ...store,
      locale,
      products: translatedProducts,
      collections: collectionDetails,
    });
  if (url.pathname.endsWith("/products"))
    return Response.json({ ...context, catalogVersion: 1, products: translatedProducts });
  if (url.pathname.endsWith("/catalog"))
    return Response.json({
      ...store,
      locale,
      products: translatedProducts,
      collections: undefined,
    });
  if (url.pathname.endsWith("/collections"))
    return Response.json({
      ...context,
      catalogVersion: 1,
      collections: collectionDetails.map(({ products, ...summary }) => summary),
    });
  if (url.pathname.includes("/products/")) {
    const product = translatedProducts.find(
      (p) => p.handle === url.pathname.split("/").pop(),
    );
    return product
      ? Response.json({ ...product, ...context, catalogVersion: 1 })
      : Response.json({}, { status: 404 });
  }
  if (url.pathname.includes("/collections/")) {
    const c = collectionDetails.find(
      (c) => c.handle === url.pathname.split("/").pop(),
    );
    return c
      ? Response.json({ ...c, ...context, catalogVersion: 1 })
      : Response.json({}, { status: 404 });
  }
  if (url.pathname.endsWith("/availability"))
    return Response.json({
      ...context,
      variants: url.searchParams
        .getAll("variantId")
        .map((variantId) => ({ variantId, status: "AVAILABLE" })),
    });
  if (url.pathname.includes("/availability/"))
    return Response.json({
      ...context,
      variantId: url.pathname.split("/").pop(),
      status: "AVAILABLE",
    });
  return Response.json(
    { error: "Offline preview has no checkout" },
    { status: 403 },
  );
};
const types = {
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
          ".jpg": "image/jpeg",
};
const env = {
  REAI_API_BASE_URL: "http://demo-api.invalid",
  REAI_SITE_CREDENTIAL: "offline-fixture-only",
  DEMO_PREVIEW: "true",
  DEMO_CHECKOUT_ENABLED: "false",
  ASSETS: {
    async fetch(request) {
      const target = path.resolve(
        root,
        "demo/public",
        "." + new URL(request.url).pathname,
      );
      if (!target.startsWith(path.join(root, "demo/public") + path.sep))
        return new Response("Not found", { status: 404 });
      try {
        return new Response(await readFile(target), {
          headers: {
            "Content-Type":
              types[path.extname(target)] || "application/octet-stream",
          },
        });
      } catch {
        return new Response("Not found", { status: 404 });
      }
    },
  },
};
const server = http.createServer(async (req, res) => {
  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const response = await worker.fetch(
      new Request(new URL(req.url, origin), {
        method: req.method,
        headers: req.headers,
        ...(!["GET", "HEAD"].includes(req.method)
          ? { body: Buffer.concat(chunks) }
          : {}),
      }),
      env,
      {},
    );
    res.writeHead(response.status, Object.fromEntries(response.headers));
    const isHtml = response.headers
      .get("Content-Type")
      ?.startsWith("text/html");
    let body = Buffer.from(await response.arrayBuffer());
    if (isHtml) {
      body = Buffer.from(
        body
          .toString()
          .replace(
            "DEMO — fiktive produkter. Se betalingsmodus før checkout.",
            "LOKAL FORHÅNDSVISNING — fiktiv katalog, ingen betaling.",
          )
          .replace(
            "DEMO — fictional products. Check payment mode before checkout.",
            "LOCAL PREVIEW — fictional catalog, no payments.",
          )
          .replace(
            "REAI SITE API, I LEVENDE LIVE",
            "LOKAL VISNING · API-FIKSTUR",
          )
          .replace("REAI SITE API, IN ACTION", "LOCAL PREVIEW · API FIXTURE")
          .replace(
            "Data fra ReAI · Katalog, priser og varianter. Ikke hardkodet magi.",
            "Fiktiv lokal testkatalog · Produksjonen leser data fra ReAI.",
          )
          .replace(
            "Data from ReAI · Catalog, prices and variants. No hardcoded magic.",
            "Fictional local catalog · Production reads data from ReAI.",
          ),
      );
    }
    res.end(body);
  } catch {
    res.writeHead(500);
    res.end("Preview error");
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Offline demo preview (fictional seed, no payments): ${origin}`),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close(() => process.exit(0)));
