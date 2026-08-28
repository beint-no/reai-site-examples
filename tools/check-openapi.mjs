#!/usr/bin/env node

const documentUrl = process.env.REAI_SITE_OPENAPI_URL || "https://app.reai.no/openapi/site";
const response = await fetch(documentUrl, { headers: { Accept: "application/json" } });
if (!response.ok) throw new Error(`Could not read ${documentUrl}: HTTP ${response.status}`);

const document = await response.json();
const requiredPaths = [
  "/site/v1/site",
  "/site/v1/commerce/catalog",
  "/site/v1/commerce/products/{handle}",
  "/site/v1/commerce/collections",
  "/site/v1/commerce/collections/{handle}",
  "/site/v1/commerce/availability/{variantId}",
  "/site/v1/commerce/checkout-sessions",
];

const missingPaths = requiredPaths.filter((path) => !document.paths?.[path]);
if (missingPaths.length) throw new Error(`Site API OpenAPI is missing paths: ${missingPaths.join(", ")}`);

const imageProperties = document.components?.schemas?.ProductImage?.properties || {};
const missingImageProperties = ["url", "alt", "width", "height", "renditions"].filter((name) => !imageProperties[name]);
if (missingImageProperties.length) {
  throw new Error(`ProductImage is missing properties: ${missingImageProperties.join(", ")}`);
}

console.log(`Validated ${document.info?.title || "Site API"} ${document.info?.version || ""} at ${documentUrl}.`);
