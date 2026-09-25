// @ts-check

import {
  createReaiStorefrontWorker,
  norwegianMessages,
} from "../../packages/reai-cloudflare-storefront/worker.mjs";
import * as storefront from "./storefront.mjs";

function beforeRequest({ request, url }) {
  if (url.hostname === "www.squadrasport.no") {
    const destination = new URL(url);
    destination.hostname = "squadrasport.no";
    return Response.redirect(destination.href, 308);
  }
  if (["GET", "HEAD"].includes(request.method)) {
    const nestedProduct = url.pathname.match(/^\/collections\/[^/]+\/products\/([^/]+)\/?$/);
    if (nestedProduct) {
      const destination = new URL(url);
      destination.pathname = `/products/${nestedProduct[1]}`;
      return Response.redirect(destination.href, 301);
    }
  }
  return null;
}

export default createReaiStorefrontWorker({
  cacheKey: "squadrasport-v1",
  storefront,
  market: "default",
  locale: "nb-NO",
  messages: norwegianMessages,
  checkoutReturnPath: "/order/complete/",
  noStorePaths: ["/cart/", "/search/", "/order/complete/"],
  beforeRequest,
});
