// @ts-check

import {
  createReaiStorefrontWorker,
  norwegianMessages,
} from "../../packages/reai-cloudflare-storefront/worker.mjs";
import * as storefront from "./storefront.mjs";

export default createReaiStorefrontWorker({
  cacheKey: "kebabking-trondheim-v1",
  storefront,
  market: "default",
  locale: "nb-NO",
  messages: norwegianMessages,
});
