#!/usr/bin/env node

import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] || ".");
const failures = [];
const skipPrefixes = [];

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if ([".git", ".wrangler", "node_modules", "dist"].includes(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(target));
    else files.push(target);
  }
  return files;
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

function isLocal(value) {
  return Boolean(value) && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value);
}

function clean(value) {
  return value.replaceAll("&amp;", "&").split("#")[0].split("?")[0];
}

async function checkReference(file, raw, kind) {
  if (!isLocal(raw)) return;
  const value = clean(raw);
  if (!value) return;
  if (skipPrefixes.some((prefix) => value === prefix.slice(0, -1) || value.startsWith(prefix))) return;

  let target = value.startsWith("/")
    ? path.join(root, value.replace(/^\/+/, ""))
    : path.resolve(path.dirname(file), value);
  if (value.endsWith("/") || (!path.extname(value) && kind === "page")) {
    target = path.join(target, "index.html");
  }
  if (!(await exists(target))) failures.push(`${path.relative(root, file)} -> ${raw}`);
}

async function checkHtml(file) {
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)) {
    await checkReference(file, match[1], "page");
  }
  for (const match of source.matchAll(/<(?:img|script|iframe|video|source)\b[^>]*(?:src|poster)=["']([^"']+)["']/gi)) {
    await checkReference(file, match[1], "asset");
  }
  for (const match of source.matchAll(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
    if (/rel=["'][^"']*(?:stylesheet|icon|preload|manifest)[^"']*["']/i.test(match[0])) {
      await checkReference(file, match[1], "asset");
    }
  }
  for (const match of source.matchAll(/(?:srcset|data-srcset)=["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(",")) {
      await checkReference(file, candidate.trim().split(/\s+/)[0], "asset");
    }
  }
}

async function checkCss(file) {
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(/url\(\s*["']?([^)'"\s]+)["']?\s*\)/gi)) {
    await checkReference(file, match[1], "asset");
  }
}

const files = await filesUnder(root);
if (!(await exists(path.join(root, "index.html")))) failures.push("Missing index.html");
if (!(await exists(path.join(root, "404.html")))) failures.push("Missing 404.html");
if (!(await exists(path.join(root, "products")))) skipPrefixes.push("/products/");
if (!(await exists(path.join(root, "collections")))) skipPrefixes.push("/collections/");

await Promise.all(files.filter(file => file.endsWith(".html")).map(checkHtml));
await Promise.all(files.filter(file => file.endsWith(".css")).map(checkCss));

if (failures.length) {
  console.error(`Static link check failed (${failures.length}):`);
  console.error(failures.slice(0, 100).join("\n"));
  process.exit(1);
}

console.log(`Checked ${files.length} files under ${root}.`);
