// BudMates public URLs follow the original Shopify storefront. These aliases
// retain bookmarks from the first Worker version without duplicating pages.
export const LEGACY_PATHS = new Map([
  ["/handlekurv", "/cart"],
  ["/sok", "/search"],
  ["/om", "/pages/om-oss"],
  ["/kontakt", "/pages/kontakt-oss"],
  ["/faq", "/pages/faq"],
  ["/levering", "/pages/frakt"],
  ["/vilkar", "/pages/salgsvilkar"],
  ["/personvern", "/policies/privacy-policy"],
  ["/artikler", "/blogs/news"],
  ["/pages/blogg-posts", "/blogs/news"],
  ["/blogs/den-ultimate-guiden-til-papes", "/blogs/news"],
  ["/policies/terms-of-service", "/pages/salgsvilkar"],
  ["/policies/shipping-policy", "/pages/frakt"],
  ["/account", "/account/login"],
  ["/account/register", "/account/login"],
  ["/account/recover", "/account/login"],
]);

export function canonicalPath(pathname) {
  let path = pathname.replace(/\/index\.html$/, "/").replace(/\/$/, "") || "/";
  // The Worker currently serves Norwegian. Keep English inbound links usable
  // without claiming that untranslated content is an English storefront.
  if (path === "/en") path = "/";
  else if (path.startsWith("/en/")) path = path.slice(3);
  if (path.startsWith("/artikler/")) path = path.replace("/artikler/", "/blogs/news/");
  // Shopify also links products through their collection context.
  const product = path.match(/^\/collections\/[^/]+\/products\/([^/]+)$/);
  if (product) path = `/products/${product[1]}`;
  return LEGACY_PATHS.get(path) || path;
}

export function redirectStorefrontRequest({ request, url }) {
  if (!["GET", "HEAD"].includes(request.method) || url.pathname.startsWith("/reai/")) return null;
  const target = canonicalPath(url.pathname);
  if (target === url.pathname) return null;
  const destination = new URL(url.href);
  destination.pathname = target;
  return new Response(null, {
    status: 301,
    headers: { Location: destination.href, "Cache-Control": "public, max-age=3600" },
  });
}
