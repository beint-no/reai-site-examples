# Separate hosted demonstration

The current hosted target is `https://vintage-designer.respiro.workers.dev`. Build with that exact origin to generate an ignored `wrangler.jsonc` alongside the artifact, then deploy with `wrangler deploy --config <artifact>/wrangler.jsonc`. The assets binding runs the guard Worker first on every request; the Worker/config files are excluded from static uploads. The former Pages project is retired. The directory name is retained for the shared snapshot-export tooling.

Explicitly approved snapshot export for Cloudflare Pages. This is separate from the normal ReAI Worker; its strict local-fixture deployment guard is unchanged. No ReAI credential or live backend is used.

Run `node tools/vintage-designer-pages/build.mjs https://YOUR-PROJECT.pages.dev`. The build reconstructs an allowlisted storefront payload from the ignored local fixture and copies only referenced verified media into a fresh ignored `.local/pages-TIMESTAMP/` artifact. Never commit that artifact or the input catalog. Review it before manually uploading the exact path with Wrangler Pages.

The hosted presentation removes visible development notices, retains noindex/nofollow headers and metadata, and reports checkout unavailable on interaction. Every direct checkout request is rejected. Data is a snapshot, not a live inventory or pricing feed; communicate that limitation to recipients when sharing. The hosted URL must not replace the existing merchant domain.

Checks: `node --test tools/vintage-designer-pages/demo.test.mjs`, local Pages runtime verification, then published route/header/catalog/image/checkout and browser checks. No merge or automatic deployment workflow is configured.
