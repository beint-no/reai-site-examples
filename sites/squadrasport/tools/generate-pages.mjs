import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderHomePage, renderNotFoundPage, renderStaticPage } from "../storefront.mjs";

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pages = new Map([
  ["index.html", renderHomePage(null)],
  ["404.html", renderNotFoundPage(null)],
  ["cart/index.html", renderStaticPage("cart")],
  ["search/index.html", renderStaticPage("search")],
  ["pages/contact/index.html", renderStaticPage("contact")],
  ["order/complete/index.html", renderStaticPage("complete")],
  ["policies/privacy-policy/index.html", renderStaticPage("privacy")],
  ["policies/refund-policy/index.html", renderStaticPage("refund")],
  ["pages/terms/index.html", renderStaticPage("terms")],
]);

for (const [relativePath, html] of pages) {
  const target = path.join(siteRoot, "public", relativePath);
  if (process.argv.includes("--check")) {
    if (await readFile(target, "utf8") !== html) {
      throw new Error(`Static page is out of date: ${relativePath}`);
    }
  } else {
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, html);
  }
}
