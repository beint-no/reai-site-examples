import { readFile, mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
const root = new URL("../../", import.meta.url);
const metadata = JSON.parse(
  await readFile(new URL("demo/seed/filter-metadata.json", root), "utf8"),
);
const args = process.argv.slice(2),
  value = (flag) => args[args.indexOf(flag) + 1];
const tenant = value("--tenant-id"),
  site = value("--site-id");
if (!args.includes("--apply")) {
  console.log(
    JSON.stringify(
      {
        action:
          "Add demo product types, gift-card category and illustration color attributes",
        products: metadata.products,
        values: metadata.values,
        preserves: [
          "prices",
          "tax",
          "inventory",
          "variant identities",
          "all other products",
        ],
        apply:
          "Requires --apply --tenant-id ID --site-id UUID; SSH ax42 postgres",
      },
      null,
      2,
    ),
  );
  process.exit(0);
}
if (
  !args.includes("--tenant-id") ||
  !/^\d+$/.test(tenant || "") ||
  !args.includes("--site-id") ||
  !/^[0-9a-f-]{36}$/i.test(site || "")
)
  throw new Error("Supply explicit demo tenant and Site IDs.");
const quote = (s) => "'" + String(s).replaceAll("'", "''") + "'";
const specs = Object.entries(metadata.products)
  .map(
    ([handle, p]) =>
      `(${quote(handle)},${quote(p.productType)},${p.category ? quote(p.category.id) : "NULL"})`,
  )
  .join(",");
const entries = Object.entries(metadata.values)
  .map(
    ([key, v]) =>
      `(${quote(key)},${quote(v.key)},${quote(v.label)},ARRAY[${v.taxonomyValues.map((t) => quote(t.id)).join(",")}],ARRAY[${v.colors.map(quote).join(",")}])`,
  )
  .join(",");
const assignments = Object.entries(metadata.products)
  .flatMap(([handle, p]) =>
    p.attributes.map(
      (a) =>
        `(${quote(handle)},${quote(a.value)},${a.option ? quote(a.option.name) : "NULL"},${a.option ? quote(a.option.value) : "NULL"})`,
    ),
  )
  .join(",");
// This metadata currently has no public management write API. Keep this one-time
// operator seed bounded to the named digital demo publications and source.
const sql = `BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
CREATE TEMP TABLE specs(handle text, product_type text, category text) ON COMMIT DROP;
INSERT INTO specs VALUES ${specs};
CREATE TEMP TABLE demo ON COMMIT DROP AS
SELECT p.id, p.tenant_id, scp.site_id, specs.* FROM specs
JOIN site_commerce_products scp USING(handle) JOIN sites s ON s.id=scp.site_id
JOIN products p ON p.id=scp.product_id AND p.tenant_id=s.tenant_id
WHERE s.public_id=${quote(site)}::uuid AND s.tenant_id=${tenant} AND s.name='ReAI sin test-nettbutikk'
AND p.brand='ReAI Demo' AND NOT p.is_stock_item
AND NOT EXISTS(SELECT 1 FROM product_variants pv WHERE pv.product_id=p.id AND pv.tenant_id=p.tenant_id AND (pv.sku IS NULL OR pv.sku NOT LIKE 'REAI-DEMO-'||specs.handle||'-%'));
SELECT p.id FROM products p JOIN demo d ON d.id=p.id FOR UPDATE OF p;
DO $$ BEGIN
IF (SELECT count(*) FROM demo) <> ${Object.keys(metadata.products).length} THEN RAISE EXCEPTION 'Demo publication/SKU guard failed'; END IF;
IF EXISTS(SELECT 1 FROM products p JOIN demo d ON d.id=p.id WHERE (p.product_type IS NOT NULL AND p.product_type<>d.product_type) OR (d.category IS NOT NULL AND p.taxonomy_category_id IS NOT NULL AND p.taxonomy_category_id<>d.category)) THEN RAISE EXCEPTION 'Existing classification differs; review before replacing'; END IF;
END $$;
CREATE TEMP TABLE entry_specs(external_id text, key text, label text, taxonomy_ids text[], colors text[]) ON COMMIT DROP;
INSERT INTO entry_specs VALUES ${entries};
CREATE TEMP TABLE assignment_specs(handle text, external_id text, option_name text, option_value text) ON COMMIT DROP;
INSERT INTO assignment_specs VALUES ${assignments};
DO $$ BEGIN
IF EXISTS(SELECT 1 FROM product_attribute_assignments a JOIN demo d ON d.id=a.product_id AND d.tenant_id=a.tenant_id JOIN product_attribute_values v ON v.id=a.value_id WHERE v.attribute_key IN(SELECT key FROM entry_specs) AND v.source<>'reai-site-examples') THEN RAISE EXCEPTION 'Attribute belongs to another source'; END IF;
IF EXISTS(SELECT 1 FROM assignment_specs a JOIN demo d USING(handle) WHERE a.option_name IS NOT NULL AND NOT EXISTS(SELECT 1 FROM product_options po JOIN product_option_values pov ON pov.product_option_id=po.id AND pov.tenant_id=po.tenant_id WHERE po.product_id=d.id AND po.tenant_id=d.tenant_id AND po.name=a.option_name AND pov.value=a.option_value)) THEN RAISE EXCEPTION 'Missing linked option'; END IF;
END $$;
SELECT jsonb_build_object('backup',jsonb_build_object('products',(SELECT jsonb_agg(jsonb_build_object('id',p.id,'productType',p.product_type,'category',p.taxonomy_category_id)) FROM products p JOIN demo d ON d.id=p.id),'assignments',(SELECT jsonb_agg(to_jsonb(a)) FROM product_attribute_assignments a JOIN demo d ON d.id=a.product_id AND d.tenant_id=a.tenant_id),'values',(SELECT jsonb_agg(to_jsonb(v)) FROM product_attribute_values v WHERE v.tenant_id=${tenant} AND v.source='reai-site-examples')));
UPDATE products p SET product_type=d.product_type, taxonomy_category_id=COALESCE(d.category,p.taxonomy_category_id),updated_at=now() FROM demo d WHERE p.id=d.id AND p.tenant_id=d.tenant_id AND (p.product_type IS DISTINCT FROM d.product_type OR (d.category IS NOT NULL AND p.taxonomy_category_id IS DISTINCT FROM d.category));
INSERT INTO product_attribute_values(tenant_id,attribute_key,source,external_id,label,taxonomy_value_ids,colors)
SELECT ${tenant},key,'reai-site-examples',external_id,label,taxonomy_ids,colors FROM entry_specs
ON CONFLICT(tenant_id,source,attribute_key,external_id) DO UPDATE SET label=excluded.label,taxonomy_value_ids=excluded.taxonomy_value_ids,colors=excluded.colors;
INSERT INTO product_attribute_assignments(tenant_id,product_id,value_id,product_option_id,product_option_value_id)
SELECT d.tenant_id,d.id,v.id,po.id,pov.id FROM assignment_specs a JOIN demo d USING(handle)
JOIN product_attribute_values v ON v.tenant_id=d.tenant_id AND v.source='reai-site-examples' AND v.external_id=a.external_id
LEFT JOIN product_options po ON po.product_id=d.id AND po.tenant_id=d.tenant_id AND po.name=a.option_name
LEFT JOIN product_option_values pov ON pov.product_option_id=po.id AND pov.tenant_id=d.tenant_id AND pov.value=a.option_value
ON CONFLICT DO NOTHING;
UPDATE site_commerce_settings SET catalog_version=catalog_version+1 WHERE site_id IN(SELECT DISTINCT scp.site_id FROM site_commerce_products scp JOIN demo d ON d.id=scp.product_id);
COMMIT;
SELECT jsonb_build_object('updatedProducts',${Object.keys(metadata.products).length},'source','reai-site-examples');`;
const run = spawnSync(
  "ssh",
  ["ax42", "sudo -u postgres psql -X -qAt -v ON_ERROR_STOP=1 -d reai"],
  { input: sql, encoding: "utf8", maxBuffer: 1024 * 1024 },
);
if (run.status !== 0) throw new Error(run.stderr || "Metadata seed failed");
const rows = run.stdout
  .split("\n")
  .filter((s) => s.startsWith("{"))
  .map((s) => JSON.parse(s));
const backup = rows.find((r) => r.backup)?.backup;
if (backup) {
  const dir = new URL(".local/", root);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  await writeFile(
    new URL(`metadata-before-${Date.now()}.json`, dir),
    JSON.stringify(backup, null, 2),
    { mode: 0o600 },
  );
}
console.log(JSON.stringify(rows.find((r) => r.updatedProducts)));
