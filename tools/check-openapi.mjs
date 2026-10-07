#!/usr/bin/env node

import { operations } from "../demo/content/education.mjs";

import { readFile } from "node:fs/promises";

import {
  documentUrl,
  generateSiteApiTypes,
  generatedTypesUrl,
  readSiteOpenApi,
} from "./site-openapi.mjs";

const document = await readSiteOpenApi();
const requiredPaths = [
  "/site/v1/site",
  "/site/v1/commerce/storefront",
  "/site/v1/commerce/catalog",
  "/site/v1/commerce/products",
  "/site/v1/commerce/products/{handle}",
  "/site/v1/commerce/collections",
  "/site/v1/commerce/collections/{handle}",
  "/site/v1/commerce/availability",
  "/site/v1/commerce/availability/{variantId}",
  "/site/v1/commerce/checkout-sessions",
];

const missingPaths = requiredPaths.filter((path) => !document.paths?.[path]);
if (missingPaths.length) throw new Error(`Site API OpenAPI is missing paths: ${missingPaths.join(", ")}`);

const contractOperations = Object.entries(document.paths).flatMap(([path, methods]) =>
  Object.keys(methods).filter((method) => ["get", "post", "put", "patch", "delete"].includes(method))
    .map((method) => `${method.toUpperCase()} ${path}`));
const documentedOperations = operations.map(([, method, path]) => `${method} ${path}`);
if (JSON.stringify([...contractOperations].sort()) !== JSON.stringify([...documentedOperations].sort()))
  throw new Error("Demo educational operation coverage differs from the live Site contract.");

const imageProperties = document.components?.schemas?.ProductImage?.properties || {};
const missingImageProperties = ["url", "alt", "width", "height", "renditions"].filter((name) => !imageProperties[name]);
if (missingImageProperties.length) {
  throw new Error(`ProductImage is missing properties: ${missingImageProperties.join(", ")}`);
}

const expectedTypes = await generateSiteApiTypes(document);
const generatedTypes = await readFile(generatedTypesUrl, "utf8").catch(() => "");
if (generatedTypes !== expectedTypes) {
  throw new Error("Generated Site API declarations are stale; run npm run generate:site-api");
}

console.log(`Validated ${document.info?.title || "Site API"} ${document.info?.version || ""} at ${documentUrl}.`);
