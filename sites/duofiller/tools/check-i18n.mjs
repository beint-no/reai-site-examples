import { readFile } from "node:fs/promises";
import path from "node:path";

const siteRoot = path.resolve(import.meta.dirname, "..");
const locales = await Promise.all(["en", "nb"].map(async (locale) => [
  locale,
  JSON.parse(await readFile(path.join(siteRoot, "i18n", `${locale}.json`), "utf8")),
]));
const expected = Object.keys(locales[0][1]).sort();

for (const [locale, entries] of locales) {
  const keys = Object.keys(entries).sort();
  if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) {
    throw new Error(`${locale} must contain exactly the same translation keys as ${locales[0][0]}`);
  }
  for (const [key, value] of Object.entries(entries)) {
    if (!value || typeof value.other !== "string" || !value.other.trim()) {
      throw new Error(`${locale}.${key}.other must be a non-empty string`);
    }
  }
}

console.log(`Validated ${expected.length} translation keys across ${locales.length} locales.`);
