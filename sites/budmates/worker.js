// @ts-check

import {
  createReaiStorefrontWorker,
  norwegianMessages,
} from "../../packages/reai-cloudflare-storefront/worker.mjs";
import * as storefront from "./storefront.mjs";
import { redirectStorefrontRequest } from "./routes.mjs";

export default createReaiStorefrontWorker({
  cacheKey: "budmates-v1",
  storefront,
  market: "default",
  locale: "nb-NO",
  messages: norwegianMessages,
  beforeRequest: redirectStorefrontRequest,
  noStorePaths: ["/cart/", "/account/login/", "/bestilling/fullfort/"],
});
