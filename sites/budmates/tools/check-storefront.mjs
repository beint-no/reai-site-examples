import { access } from "node:fs/promises";
import path from "node:path";
import {
  EDITORIAL_PATHS,
  HIDDEN_COLLECTION_HANDLES,
  STORE_SCRIPT,
  STORE_STYLE,
  collectionImage,
  formatDescription,
  imageSrcset,
  imageUrl,
  matchRoute,
  navItems,
  productCard,
  relatedProducts,
  renderCollectionPage,
  renderHomePage,
  renderProductPage,
  renderSitemap,
  sanitizeHtml,
} from "../storefront.mjs";

const root = path.resolve(import.meta.dirname, "..");
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const product = {
  id: "prod-mason",
  handle: "raw-mason-jar-glassoppbevaring",
  title: "RAW Mason Jar – Glassoppbevaring",
  description: "RAW Mason Jar er et klassisk glass-oppbevaringsglass.Det lufttette lokket stenger ute luft og fukt.Spesifikasjoner Glass med lufttett metallokk RAW-design",
  brand: "RAW",
  seoTitle: "RAW Mason Jar – Glassoppbevaring",
  seoDescription: "RAW Mason Jar med lufttett lokk.",
  images: [
    {
      url: "https://app.reai.no/media/product-images/mason-1",
      alt: "RAW Mason Jar",
      width: 1600,
      height: 1600,
      renditions: [
        { url: "https://app.reai.no/media/product-images/mason-1/320.avif", width: 320, height: 320 },
        { url: "https://app.reai.no/media/product-images/mason-1/480.avif", width: 480, height: 480 },
        { url: "https://app.reai.no/media/product-images/mason-1/640.avif", width: 640, height: 640 },
        { url: "https://app.reai.no/media/product-images/mason-1/960.avif", width: 960, height: 960 },
        { url: "https://app.reai.no/media/product-images/mason-1/1280.avif", width: 1280, height: 1280 },
      ],
    },
    {
      url: "https://app.reai.no/media/product-images/mason-2",
      alt: "RAW Mason Jar med lokk",
      width: 1024,
      height: 1024,
      renditions: [
        { url: "https://app.reai.no/media/product-images/mason-2/480.avif", width: 480, height: 480 },
        { url: "https://app.reai.no/media/product-images/mason-2/960.avif", width: 960, height: 960 },
      ],
    },
  ],
  variants: [
    { id: "a0e6fdae-f4da-4a8e-aa10-0c9d5461d644", options: [{ name: "Størrelse", value: "6oz (177ml)" }], price: 99, compareAtPrice: null },
    { id: "1b72e480-315d-4e79-8164-9ef6c7515a50", options: [{ name: "Størrelse", value: "10oz (296ml)" }], price: 129, compareAtPrice: null },
  ],
};

const related = {
  id: "prod-cards",
  handle: "raw-playing-cards-kortstokk",
  title: "RAW Playing Cards – Kortstokk",
  brand: "RAW",
  images: [{ url: "https://app.reai.no/media/product-images/cards-1", alt: "RAW kortstokk" }],
  variants: [{ id: "11111111-1111-4111-8111-111111111111", options: [], price: 49 }],
};

const store = {
  catalogVersion: 115,
  products: [product, related],
  collections: [
    {
      handle: "raw",
      title: "RAW",
      description: '<p>RAW papes. Les <a href="/blogs/news/den-ultimate-guiden-til-rullepapir">guiden</a>.</p>',
      seoDescription: "RAW rullepapir hos BudMates.",
      imageUrl: "https://cdn.shopify.com/s/files/raw.png",
      products: [
        { handle: product.handle, title: product.title, brand: product.brand, price: 99 },
        { handle: related.handle, title: related.title, brand: related.brand, price: 49 },
      ],
    },
    {
      handle: "bestselgere",
      title: "Bestselgere",
      products: [{ handle: product.handle, title: product.title, brand: product.brand, price: 99 }],
    },
    { handle: "frontpage", title: "Home page", products: [] },
    { handle: "ligher", title: "Ligher", products: [] },
    { handle: "papes", title: "Papes og rullepapir", products: [{ handle: product.handle, title: product.title, brand: "RAW", price: 99 }] },
  ],
};

assert(matchRoute("/products/raw-mason-jar-glassoppbevaring").type === "product", "product route");
assert(matchRoute("/products/raw-mason-jar-glassoppbevaring").needsSlash, "product trailing slash");
assert(matchRoute("/collections/all/").handle === "all", "all collection route");
assert(matchRoute("/sitemap.xml").type === "sitemap", "sitemap route");
assert(!matchRoute("/artikler/"), "editorial routes stay static");

const description = formatDescription(product.description);
assert(description.includes("<p>"), "description uses paragraphs");
assert(description.includes("<h2>Spesifikasjoner</h2>"), "description restores specifications heading");
assert(description.includes("Det lufttette lokket"), "description splits glued sentences");
assert(!description.includes("mulig.Det"), "description inserts missing spaces");

const rewritten = sanitizeHtml(store.collections[0].description);
assert(rewritten.includes('href="/artikler/den-ultimate-guiden-til-rullepapir/"'), "collection HTML rewrites article links");
assert(!rewritten.includes("/blogs/news/"), "collection HTML drops Shopify blog paths");

assert(!navItems(store).some((item) => HIDDEN_COLLECTION_HANDLES.has(item.handle)), "nav omits empty frontpage/ligher");
assert(navItems(store).some((item) => item.handle === "papes"), "nav keeps published curated collections");
assert(collectionImage(store.collections[0], store)?.url === product.images[0].url, "collection cards use catalog images, not Shopify CDN");
assert(relatedProducts(store, product)[0]?.handle === related.handle, "related products come from the same collection");
assert(imageUrl(product.images[0], 480).endsWith("/480.avif"), "image helper selects the smallest sufficient rendition");
assert(imageUrl(product.images[0], 600).endsWith("/640.avif"), "image helper selects the next sufficient rendition");
assert(imageSrcset(product.images[0]).includes("/480.avif 480w"), "image helper emits width-based srcset candidates");

const home = renderHomePage(store);
assert(home.includes("https://app.reai.no/media/product-images/mason-1"), "homepage uses ReAI images");
assert(!home.includes("/assets/products/"), "homepage does not use local product photos");
assert(!home.includes("/data/catalog.json"), "homepage does not read catalog.json");
assert(home.includes('data-storefront="home"'), "homepage is marked as server-rendered");
assert(home.includes(STORE_SCRIPT), "homepage loads store.js");
assert(home.includes(STORE_STYLE), "homepage loads versioned store CSS");
assert(home.includes('srcset="'), "homepage category images advertise responsive renditions");
assert(home.includes('<picture class="responsive-picture">'), "homepage uses the shared picture component");
assert(home.includes('type="image/avif"'), "homepage advertises AVIF sources");
assert(home.includes('sizes="(max-width: 560px) calc(100vw - 28px)'), "homepage category images declare their layout width");
assert(home.includes('width="1600" height="1600"'), "homepage category images reserve their aspect ratio");
assert(!home.includes("/collections/ligher/"), "homepage chrome omits the ligher collection");
assert(!home.includes("/collections/frontpage/"), "homepage chrome omits the empty frontpage collection");
assert(home.includes("/assets/discreet-delivery-1200.avif"), "homepage includes a responsive delivery story");
assert(home.includes('width="200" height="64"'), "homepage logo reserves its intrinsic aspect ratio");

const collection = renderCollectionPage(store, "raw");
assert(collection.includes("https://app.reai.no/media/product-images/mason-1"), "collection page joins catalog images");
assert(collection.includes('data-server-rendered="true"'), "collection grid is server-rendered");
assert(!collection.includes("https://cdn.shopify.com/"), "collection page does not emit Shopify CDN images");

const all = renderCollectionPage(store, "all");
assert(all.includes(product.handle) && all.includes(related.handle), "all collection lists the catalog");

const page = renderProductPage(store, product, { [product.variants[0].id]: true, [product.variants[1].id]: false });
assert(page.includes('data-add-to-cart'), "product page has add-to-cart");
assert(page.includes(product.variants[0].id), "product page uses ReAI variant UUIDs");
assert(page.includes("https://app.reai.no/media/product-images/mason-1"), "product gallery uses ReAI images");
assert(!page.includes("/assets/products/"), "product page does not use local product photos");
assert(page.includes("application/ld+json"), "product page includes JSON-LD");
assert(page.includes("https://schema.org/InStock"), "JSON-LD reflects availability");
assert(page.includes(related.handle), "product page shows related products");
assert(productCard(product).includes("https://app.reai.no/media/product-images/mason-1"), "cards use ReAI image URLs");
assert(productCard(product).includes('srcset="'), "cards advertise responsive renditions");
assert(productCard(product).includes('sizes="'), "cards tell browsers their rendered width");
assert(page.includes('data-gallery-srcset="'), "product gallery keeps responsive sources when switching images");
assert(page.includes('data-responsive-source'), "product gallery keeps its picture source in sync");
assert(page.includes('aria-label="Brødsmulesti"') && page.includes("<ol>"), "product breadcrumbs use an ordered semantic trail");

const sitemap = renderSitemap(store);
assert(sitemap.includes("/products/raw-mason-jar-glassoppbevaring/"), "sitemap lists products");
assert(sitemap.includes("/collections/raw/"), "sitemap lists collections");
assert(sitemap.includes("/artikler/bong-guide-komplett/"), "sitemap keeps editorial routes");
assert(!sitemap.includes("/collections/frontpage/"), "sitemap omits empty frontpage");
assert(!sitemap.includes("/collections/ligher/"), "sitemap omits empty ligher");

for (const route of EDITORIAL_PATHS) {
  if (route === "/") {
    assert(await access(path.join(root, "public/index.html")).then(() => true, () => false), "missing public/index.html");
    continue;
  }
  const file = path.join(root, "public", route.replace(/^\/+/, ""), "index.html");
  assert(await access(file).then(() => true, () => false), `missing editorial page ${route}`);
}

if (failures.length) {
  console.error(`Storefront checks failed (${failures.length}):`);
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("BudMates storefront renderer checks passed.");
