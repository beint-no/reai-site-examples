import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import {
  matchRoute,
  productByHandle,
  renderCollectionPage,
  renderHomePage,
  renderNotFoundPage,
  renderProductPage,
} from "../storefront.mjs";

const port = Number(process.env.PORT || 4199);
const publicRoot = path.resolve(import.meta.dirname, "..", "public");
const liveOrigin = "https://budmates.respiro.workers.dev";

const json = async (pathname) => {
  const response = await fetch(`${liveOrigin}${pathname}`);
  if (!response.ok) throw new Error(`${pathname}: ${response.status}`);
  return response.json();
};

const catalog = await json("/reai/catalog");
const collectionList = await json("/reai/collections");
const collections = await Promise.all((collectionList.collections || []).map((collection) =>
  json(`/reai/collections/${collection.handle}`).catch(() => ({ ...collection, products: [] })),
));
const store = { ...catalog, collections };

const types = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

async function staticResponse(pathname) {
  const clean = pathname.replace(/^\/+/, "");
  const candidate = path.resolve(publicRoot, clean || "index.html");
  if (!candidate.startsWith(`${publicRoot}${path.sep}`) && candidate !== publicRoot) return null;
  let file = candidate;
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    const body = await readFile(file);
    return new Response(body, { headers: { "Content-Type": types[path.extname(file)] || "application/octet-stream" } });
  } catch {
    return null;
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://127.0.0.1:${port}`);
  if (request.method === "GET" && url.pathname.startsWith("/reai/")) {
    const upstream = await fetch(`${liveOrigin}${url.pathname}${url.search}`);
    response.writeHead(upstream.status, { "Content-Type": upstream.headers.get("Content-Type") || "application/json; charset=utf-8" });
    response.end(Buffer.from(await upstream.arrayBuffer()));
    return;
  }
  let rendered = null;
  const route = matchRoute(url.pathname);
  if (route?.type === "home") rendered = renderHomePage(store);
  if (route?.type === "collection") rendered = renderCollectionPage(store, route.handle);
  if (route?.type === "product") {
    const product = productByHandle(store, route.handle);
    if (product) rendered = renderProductPage(store, product, Object.fromEntries(product.variants.map((variant) => [variant.id, true])));
  }
  const result = rendered
    ? new Response(rendered, { headers: { "Content-Type": "text/html; charset=utf-8" } })
    : await staticResponse(url.pathname) || new Response(renderNotFoundPage(store), { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } });
  response.writeHead(result.status, Object.fromEntries(result.headers));
  response.end(Buffer.from(await result.arrayBuffer()));
});

server.listen(port, "127.0.0.1", () => {
  console.log(`BudMates preview: http://127.0.0.1:${port}`);
});
