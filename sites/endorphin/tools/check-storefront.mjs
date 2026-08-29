import { access } from "node:fs/promises";
import path from "node:path";
import {
  EDITORIAL_PATHS,
  HIDDEN_COLLECTION_HANDLES,
  STORE_SCRIPT,
  STORE_STYLE,
  SHIPPING_THRESHOLD,
  collectionImage,
  displayBrand,
  findVariant,
  formatDescription,
  imageSrcset,
  imageUrl,
  legacyRedirectPath,
  legacyRedirectUrl,
  matchRoute,
  navItems,
  optionTypes,
  productCard,
  relatedProducts,
  renderCollectionPage,
  renderHomePage,
  renderOptionPills,
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
  id: "prod-rx1",
  handle: "endorphin-rx1-shoes",
  title: "Endorphin RX1 Shoes",
  description: "Lette løpesko med god demping.Spesifikasjoner Ortholite innleggssåle",
  brand: "Endorphin",
  seoTitle: "Endorphin RX1 Shoes",
  seoDescription: "Joggesko med god demping.",
  images: [{
    url: "https://app.reai.no/media/product-images/rx1-1",
    alt: "Endorphin RX1",
    width: 1200,
    height: 1800,
    renditions: [
      { url: "https://app.reai.no/media/product-images/rx1-1/v1/320.avif", width: 213, height: 320 },
      { url: "https://app.reai.no/media/product-images/rx1-1/v1/480.avif", width: 320, height: 480 },
      { url: "https://app.reai.no/media/product-images/rx1-1/v1/640.avif", width: 427, height: 640 },
      { url: "https://app.reai.no/media/product-images/rx1-1/v1/960.avif", width: 640, height: 960 },
    ],
  }, {
    url: "https://app.reai.no/media/product-images/rx1-2",
    alt: "Endorphin RX1 side",
    width: 1200,
    height: 1800,
    renditions: [
      { url: "https://app.reai.no/media/product-images/rx1-2/v1/320.avif", width: 213, height: 320 },
      { url: "https://app.reai.no/media/product-images/rx1-2/v1/480.avif", width: 320, height: 480 },
      { url: "https://app.reai.no/media/product-images/rx1-2/v1/640.avif", width: 427, height: 640 },
      { url: "https://app.reai.no/media/product-images/rx1-2/v1/960.avif", width: 640, height: 960 },
    ],
  }],
  variants: [
    { id: "a0e6fdae-f4da-4a8e-aa10-0c9d5461d644", options: [{ name: "Color", value: "Beige" }, { name: "Size", value: "39" }], price: 1699, compareAtPrice: null },
    { id: "1b72e480-315d-4e79-8164-9ef6c7515a50", options: [{ name: "Color", value: "Beige" }, { name: "Size", value: "40" }], price: 1699, compareAtPrice: null },
  ],
};

const related = {
  id: "prod-socks",
  handle: "hvite-tennis-sokker",
  title: "1-Pack Hvite Sky Knit Sokker",
  brand: "Endorphin",
  images: [{ url: "https://app.reai.no/media/product-images/socks-1", alt: "Sokker" }],
  variants: [{ id: "11111111-1111-4111-8111-111111111111", options: [], price: 149 }],
};

const store = {
  catalogVersion: 1,
  products: [product, related],
  collections: [
    {
      handle: "joggesko",
      title: "Joggesko",
      description: '<p>Joggesko med god demping. Se <a href="https://endorphin.no/products/endorphin-rx1-shoes">RX1</a>.</p>',
      seoDescription: "Joggesko fra Endorphin.",
      imageUrl: "https://cdn.shopify.com/s/files/sko.png",
      products: [{ handle: product.handle, title: product.title, brand: product.brand, price: 1699 }],
    },
    {
      handle: "sokker",
      title: "Sokker",
      products: [{ handle: related.handle, title: related.title, brand: related.brand, price: 149 }],
    },
    { handle: "frontpage", title: "Home page", products: [] },
  ],
};

assert(matchRoute("/products/endorphin-rx1-shoes").type === "product", "product route");
assert(matchRoute("/products/endorphin-rx1-shoes").needsSlash, "product trailing slash");
assert(matchRoute("/collections/all/").handle === "all", "all collection route");
assert(matchRoute("/sitemap.xml").type === "sitemap", "sitemap route");
assert(!matchRoute("/om/"), "editorial routes stay static");
for (const [legacy, rebuilt] of [
  ["/pages/contact", "/kontakt/"],
  ["/pages/frakt", "/frakt/"],
  ["/pages/retur-og-bytte", "/retur/"],
  ["/pages/storrelsesguide", "/storrelse/"],
  ["/pages/om-oss", "/om/"],
  ["/policies/terms-of-service", "/vilkar/"],
  ["/policies/privacy-policy", "/personvern/"],
  ["/policies/refund-policy", "/retur/"],
  ["/policies/shipping-policy", "/frakt/"],
  ["/search", "/sok/"],
  ["/cart", "/handlekurv/"],
  ["/products/2-pack-cotton-no-show-socks", "/products/3-pack-sky-knit-socks/"],
]) {
  assert(legacyRedirectPath(legacy) === rebuilt, `${legacy} redirects to ${rebuilt}`);
}
assert(legacyRedirectPath("/pages/storrelsesguide/") === "/storrelse/", "legacy page redirects accept a trailing slash");
assert(!legacyRedirectPath("/blogs/treningssko"), "blog routes are intentionally not recreated");
assert(
  legacyRedirectUrl(new URL("https://endorphin.example/pages/contact?fra=shopify")) === "https://endorphin.example/kontakt/?fra=shopify",
  "legacy redirects preserve query parameters",
);

const description = formatDescription(product.description);
assert(description.includes("<p>"), "description uses paragraphs");
assert(description.includes("<h2>Spesifikasjoner</h2>"), "description restores specifications heading");

const rewritten = sanitizeHtml(store.collections[0].description);
assert(rewritten.includes('href="/products/endorphin-rx1-shoes/"'), "collection HTML rewrites product links");
assert(!rewritten.includes("endorphin.no/products"), "collection HTML drops Shopify product hosts");

assert(!navItems(store).some((item) => HIDDEN_COLLECTION_HANDLES.has(item.handle)), "nav omits empty frontpage");
assert(navItems(store).some((item) => item.handle === "joggesko"), "nav keeps published curated collections");
assert(collectionImage(store.collections[0], store)?.url === product.images[0].url, "collection cards use catalog images, not Shopify CDN");
assert(relatedProducts(store, product)[0]?.handle === related.handle, "related products come from another collection after exhausting the current one");
assert(imageUrl(product.images[0], 480).endsWith("/v1/960.avif"), "image helper selects by actual rendition width");
assert(imageUrl(product.images[0], 300).endsWith("/v1/480.avif"), "image helper selects the smallest sufficient rendition");
assert(imageSrcset(product.images[0]).includes("/v1/640.avif 427w"), "image helper emits width-based srcset candidates");

const home = renderHomePage(store);
assert(home.includes("https://app.reai.no/media/product-images/rx1-1"), "homepage uses ReAI images");
assert(!home.includes("/assets/products/"), "homepage does not use local product photos");
assert(!home.includes("/data/catalog.json"), "homepage does not read catalog.json");
assert(home.includes('data-storefront="home"'), "homepage is marked as server-rendered");
assert(home.includes(STORE_SCRIPT), "homepage loads store.js");
assert(home.includes("https://endorphin.no/"), "homepage canonical uses the live domain");
assert(home.includes(STORE_STYLE), "homepage loads versioned store CSS");
assert(!home.includes("/collections/frontpage/"), "homepage chrome omits the empty frontpage collection");
assert(home.includes(">Drevet av ReAI</a>"), "homepage credits the storefront platform");
assert(!home.includes("Kasse hos"), "homepage does not mention the checkout backend");
assert(home.includes("Endorphin by Famme"), "homepage explains the Famme relationship");
assert(home.includes("Finn dine sko"), "homepage has a clear shop CTA");
assert(home.includes("hero-photo"), "homepage shows a product hero image");
assert(home.includes('srcset="'), "homepage product and category images advertise responsive renditions");
assert(home.includes('<picture class="responsive-picture">'), "homepage uses the shared picture component");
assert(home.includes('type="image/avif"'), "homepage advertises AVIF sources");
assert(home.includes('sizes="(max-width: 560px) calc(100vw - 40px)'), "homepage category images declare their layout width");
assert(home.includes('width="1200" height="1800"'), "homepage catalog images reserve their aspect ratio");
assert(home.includes("/assets/lifestyle/rx2-city.webp"), "homepage uses local optimized lifestyle photography");
assert(home.includes("/assets/lifestyle/rx2-city-800.avif"), "homepage gives lifestyle photography responsive AVIF renditions");
assert(home.includes('width="800" height="95"'), "homepage logo reserves its intrinsic aspect ratio");
assert(home.includes("Verifisert kjøper"), "homepage includes verified review proof");
assert(home.includes(`Fri frakt over ${SHIPPING_THRESHOLD} kr`), "homepage uses the current free-shipping threshold");
assert(home.includes("Vipps, kort og mobilbetaling"), "homepage names the enabled payment families");
assert(!home.includes("Klarna"), "homepage does not advertise an unavailable payment method");
assert(!home.includes("over 400 kr") && !home.includes("100 dag"), "homepage drops outdated shipping and return promises");
assert(!home.includes("Mer å se."), "homepage does not repeat leftover products");
assert(!home.includes("trust-strip"), "homepage uses a single announcement bar");

const collection = renderCollectionPage(store, "joggesko");
assert(collection.includes("https://app.reai.no/media/product-images/rx1-1"), "collection page joins catalog images");
assert(collection.includes('data-server-rendered="true"'), "collection grid is server-rendered");
assert(!collection.includes("https://cdn.shopify.com/"), "collection page does not emit Shopify CDN images");
assert(collection.includes("/assets/lifestyle/rx1-black.webp"), "shoe collection has a lifestyle campaign hero");
assert(collection.includes("Komfort, bekreftet."), "shoe collection includes social proof");

const all = renderCollectionPage(store, "all");
assert(all.includes(product.handle) && all.includes(related.handle), "all collection lists the catalog");

const page = renderProductPage(store, product, { [product.variants[0].id]: true, [product.variants[1].id]: false });
assert(page.includes("data-add-to-cart"), "product page has add-to-cart");
assert(page.includes("option-pill"), "product options are pills");
assert(page.includes("data-option-name=\"Color\""), "color is an independent option");
assert(page.includes("data-option-name=\"Size\""), "size is an independent option");
assert(page.includes("option-pill--color"), "color options render as labeled color pills");
assert(page.includes("option-pill-text\">Beige"), "color pills show the color name");
assert(page.indexOf("data-option-name=\"Color\"") < page.indexOf("data-option-name=\"Size\""), "color pills render before size");
assert(!page.includes("<select"), "product page does not use a variant select");
assert(!page.includes(" disabled>"), "option pills stay clickable when a combination is missing");
assert(page.includes(product.variants[0].id), "product page uses ReAI variant UUIDs");
assert(page.includes("https://app.reai.no/media/product-images/rx1-1"), "product gallery uses ReAI images");
assert(page.includes("data-gallery-prev"), "product gallery has a previous-image arrow");
assert(page.includes("data-gallery-next"), "product gallery has a next-image arrow");
assert(page.includes('data-gallery-srcset="'), "product gallery keeps responsive sources when switching images");
assert(page.includes('data-responsive-source'), "product gallery keeps its picture source in sync");
assert(page.includes('aria-label="Brødsmulesti"') && page.includes("<ol>"), "product breadcrumbs use an ordered semantic trail");
assert(page.includes('fetchpriority="high"'), "product gallery prioritizes its first visible image");
assert(page.includes('width="1200"'), "product images keep their width for aspect ratio");
assert(page.includes('height="1800"'), "product images keep their height for aspect ratio");
assert(!page.includes("/assets/products/"), "product page does not use local product photos");
assert(page.includes("application/ld+json"), "product page includes JSON-LD");
assert(page.includes("https://schema.org/InStock"), "JSON-LD reflects availability");
assert(page.includes(related.handle), "product page shows related products");
assert(!page.includes("Rdnt"), "product page does not mention Rdnt");
assert(page.includes(">Drevet av ReAI</a>"), "product page credits the storefront platform");
assert(page.includes("Vipps, kort og mobilbetaling"), "product trust names real payment methods");
assert(!page.includes("Klarna"), "product page does not advertise an unavailable payment method");
assert(page.includes("/storrelse/"), "product page links the size guide");
assert(page.includes("Endorphin RX1"), "product page uses a shop-ready title");
assert(page.includes("/assets/lifestyle/rx1-white.webp"), "product page uses model-specific lifestyle photography");
assert(page.includes('id="omtaler"'), "product page has a dedicated review section");
assert(page.includes("4,9") && page.includes("73 omtaler"), "product page displays sourced rating proof");
assert(page.includes("Etikettløs retur"), "product page includes the aligned return USP");
assert(!page.includes("over 400 kr") && !page.includes("100 dag"), "product page drops outdated policy copy");
assert(productCard(product).includes("https://app.reai.no/media/product-images/rx1-1"), "cards use ReAI image URLs");
assert(productCard(product).includes('srcset="'), "cards advertise responsive renditions");
assert(productCard(product).includes('sizes="'), "cards tell browsers their rendered width");
assert(productCard(product).includes('data-hover-srcset="'), "hover images defer responsive candidates until a hover-capable device is detected");
assert(!productCard(product).includes('class="product-card-hover" src="'), "hover images do not download on touch-only devices");
assert(productCard(product).includes("product-card-rating"), "shoe cards display review ratings");
assert(displayBrand({ brand: "FAMME" }) === "Endorphin", "catalog products use the public Endorphin storefront brand");

const sizeFirstVariants = [
  { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1", options: [{ name: "Shoe size", value: "35" }, { name: "Color", value: "White" }], price: 1199 },
  { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2", options: [{ name: "Shoe size", value: "40" }, { name: "Color", value: "Black" }], price: 1199 },
];
assert(optionTypes(sizeFirstVariants)[0] === "Color", "color is ordered before shoe size even when variants list size first");
const rx2Pills = renderOptionPills(sizeFirstVariants, { [sizeFirstVariants[0].id]: true });
assert(rx2Pills.indexOf("data-option-name=\"Color\"") < rx2Pills.indexOf("data-option-name=\"Shoe size\""), "RX2-style options still put color first");
assert(rx2Pills.includes("option-pill--color"), "RX2-style colors use labeled color pills");
assert(rx2Pills.includes("option-pill-text\">Hvit"), "RX2-style color pills show Hvit");
assert(rx2Pills.includes("option-pill-text\">Sort"), "RX2-style color pills show Sort");
assert(rx2Pills.includes("\"available\":true"), "variant map includes SSR availability");
assert(!findVariant(sizeFirstVariants, { "Shoe size": "35", Color: "Black" }), "missing color/size combinations stay unmatched");
assert(!!findVariant(sizeFirstVariants, { "Shoe size": "35", Color: "White" }), "complete color/size combinations match by name");

const sitemap = renderSitemap(store);
assert(sitemap.includes("/products/endorphin-rx1-shoes/"), "sitemap lists products");
assert(sitemap.includes("/collections/joggesko/"), "sitemap lists collections");
assert(sitemap.includes("/om/"), "sitemap keeps editorial routes");
assert(!sitemap.includes("/collections/frontpage/"), "sitemap omits empty frontpage");

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

console.log("Endorphin storefront renderer checks passed.");
