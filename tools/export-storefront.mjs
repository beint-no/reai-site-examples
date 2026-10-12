import { cp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { build, root } from "./examples.mjs";

export async function exportStorefront(name, destination) {
  if (!destination || !path.isAbsolute(destination))
    throw new Error("Destination must be an absolute path to a new directory.");
  const example = await build(name);
  // mkdir without recursive prevents overwriting any existing checkout or files.
  await mkdir(destination);
  try {
    await cp(path.join(root, "starter/src"), path.join(destination, "src"), {
      recursive: true,
    });
    const filters = await readFile(
      path.join(root, "demo/src/catalog-filters.mjs"),
      "utf8",
    );
    await writeFile(path.join(destination, "src/catalog-filters.mjs"), filters);
    await cp(path.join(example, "public"), path.join(destination, "public"), {
      recursive: true,
    });
    await rm(path.join(destination, "public/assets/demo"), {
      recursive: true,
      force: true,
    });
    await mkdir(path.join(destination, "packages"));
    await cp(
      path.join(root, "packages/reai-site-client"),
      path.join(destination, "packages/reai-site-client"),
      { recursive: true },
    );
    const entrypoint = path.join(destination, "src/worker.js");
    const worker = await readFile(entrypoint, "utf8");
    await writeFile(
      entrypoint,
      worker
        .replace(
          "../../packages/reai-site-client/client.mjs",
          "../packages/reai-site-client/client.mjs",
        )
        .replace("../../demo/src/catalog-filters.mjs", "./catalog-filters.mjs"),
    );
    await cp(
      path.join(root, "starter/.dev.vars.example"),
      path.join(destination, ".dev.vars.example"),
    );
    await cp(path.join(root, "LICENSE"), path.join(destination, "LICENSE"));
    await mkdir(path.join(destination, "tools"));
    await cp(path.join(root, "starter/github/worker.mjs"), path.join(destination, "tools/worker.mjs"));
    await writeFile(path.join(destination, "tools/worker-sites.json"), JSON.stringify([{ id: "storefront", config: "wrangler.jsonc", credentialBinding: "REAI_SITE_CREDENTIAL", checks: ["check"] }], null, 2) + "\n");
    await mkdir(path.join(destination, ".github/workflows"), { recursive: true });
    await mkdir(path.join(destination, ".github/preview"), { recursive: true });
    await cp(path.join(root, "starter/github/preview.yml"), path.join(destination, ".github/workflows/preview.yml"));
    await cp(path.join(root, "starter/github/preview.mjs"), path.join(destination, ".github/preview/preview.mjs"));
    await writeFile(
      path.join(destination, ".gitignore"),
      "node_modules/\n.dev.vars\n.wrangler/\n.preview/\n.DS_Store\n",
    );
    await writeFile(
      path.join(destination, "package.json"),
      JSON.stringify(
        {
          name: "private-reai-storefront",
          private: true,
          type: "module",
          engines: { node: ">=22" },
          scripts: {
            dev: "wrangler dev",
            check:
              "node --check src/worker.js && node --check public/store.js && node --check public/assets/catalog-filters.js && node --check public/assets/catalog-context.js && node --check public/assets/cart-controls.js && node --test src/*.test.js",
            deploy: "npm run check && wrangler deploy",
            "deploy:local": "npm exec --yes --package=wrangler@4.149.0 -- node tools/worker.mjs deploy",
            "preview:deploy": "npm exec --yes --package=wrangler@4.149.0 -- node tools/worker.mjs preview",
            "preview:remove": "npm exec --yes --package=wrangler@4.149.0 -- node tools/worker.mjs remove",
          },
          devDependencies: { wrangler: "4.148.0" },
          overrides: { sharp: "0.35.5" },
        },
        null,
        2,
      ) + "\n",
    );
    await writeFile(
      path.join(destination, "wrangler.jsonc"),
      JSON.stringify(
        {
          $schema: "https://unpkg.com/wrangler/config-schema.json",
          name: `test-reai-${name}`,
          main: "./src/worker.js",
          compatibility_date: "2026-09-28",
          workers_dev: true,
          assets: {
            directory: "./public",
            binding: "ASSETS",
            run_worker_first: true,
          },
          vars: { REAI_API_BASE_URL: "https://app.reai.no" },
          previews: { vars: { REAI_API_BASE_URL: "https://app.reai.no", REAI_MANAGED_PREVIEWS: "true", REAI_PREVIEW_API_BASE_URL: "https://app.reai.no" } },
        },
        null,
        2,
      ) + "\n",
    );
    await writeFile(
      path.join(destination, "AGENTS.md"),
      `# Private ReAI storefront\n\nExported from the public ${name} design. This is a standalone source tree; no hub or public repository checkout is required at runtime.\n\nRun npm install once and commit package-lock.json; subsequent installs use npm ci. Run npm run check before changes are published. Copy .dev.vars.example to the ignored .dev.vars for local Worker development. Keep REAI_SITE_CREDENTIAL server-side and put it in a Cloudflare Worker secret for deployment.\n\nReplace the test Worker name, configure the Site preview/active domains, and fill in approved merchant details and policies in src/store-content.js before launch. Deploy only with authorized account credentials. Catalog, collection membership, filter attributes/options, variant prices, images and availability come from ReAI. The starter includes search/filter/sort, variant selection, a cart drawer plus a cart page, hosted checkout, newsletter consent and practical information pages. Mobile filters support apply/cancel; cart quantities update automatically with undo after removal. It preserves the Site market/language. A return redirect does not confirm payment or clear the cart.\n\nNewsletter signup is enabled by default and records explicit consent; a welcome email requires a configured ReAI flow. Optional stockNotificationsEnabled defaults to false: enable only with an active ReAI back-in-stock flow and approved privacy text. Stock alerts use separate consent and do not subscribe someone to the newsletter. Browser bundles never contain the Site credential.\n\nOpen PRs automatically get a stable Cloudflare Preview URL, updated on pushes and removed on close. The preview build runs without deployment credentials; the deploy job uses reviewed default-branch tooling. Signed GitHub Actions OIDC requests the trusted preview workflow in beint-no/reai-site-examples; customer repositories never receive Cloudflare credentials. The server supplies a PREVIEW credential with only site:read, commerce:catalog:read and commerce:availability:read. New module-created repositories are recognized automatically; independently created repositories must be registered for previews. Previews are noindex and reject orders, payments and form submissions. Manually dispatch PR previews with a pull request number to preview a PR opened before this workflow was installed.\n\nKeep the operator primary checkout on main, work in a dedicated worktree, and use pull requests and squash merges. Record approved business facts, content rules and launch constraints here; do not create a duplicate README.\n\nDirect Cloudflare access: npm run deploy:local, npm run preview:deploy -- design, and npm run preview:remove -- design work without GitHub Actions. Use --dry-run to validate without publishing. Authenticate with Wrangler login or CLOUDFLARE_API_TOKEN; set CLOUDFLARE_ACCOUNT_ID for previews. For catalog previews, set REAI_PREVIEW_CREDENTIAL_FILE to a token outside Git with only site:read, commerce:catalog:read and commerce:availability:read. Local previews use a local- namespace and cannot replace automatic PR previews.\n\nIntegration guide: https://github.com/beint-no/reai-site-examples\n`,
    );
    return destination;
  } catch (error) {
    // Only clean up the new directory created by this invocation.
    await rm(destination, { recursive: true, force: true });
    throw error;
  }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [name, destination] = process.argv.slice(2);
  console.log(await exportStorefront(name, destination));
}
