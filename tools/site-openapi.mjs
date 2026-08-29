import openapiTS, { astToString } from "openapi-typescript";

export const documentUrl = process.env.REAI_SITE_OPENAPI_URL || "https://app.reai.no/openapi/site";
export const generatedTypesUrl = new URL("../packages/reai-site-client/site-api.d.ts", import.meta.url);

const generatedHeader = `/**
 * This file was generated from the ReAI Site OpenAPI document.
 * Run npm run generate:site-api instead of editing it.
 */

`;

export async function readSiteOpenApi() {
  const response = await fetch(documentUrl, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Could not read ${documentUrl}: HTTP ${response.status}`);
  return response.json();
}

export async function generateSiteApiTypes(document) {
  return `${generatedHeader}${astToString(await openapiTS(document))}`;
}
