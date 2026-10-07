# Public ReAI Sites examples

This is the canonical public source for generic designs, Site integration and
documentation. Real customer sites and customer-specific demos belong in
separate private repos, tracked by the private customer-sites submodule hub.

Never add customer brands, tenant identifiers, handoff notes, customer catalogs
or credentials here. Use only fictional fixtures and reusable original assets.
Keep demo data in the explicit local demo harness; the production Worker must
never fall back to fictional data on errors.

Upstream calls go through packages/reai-site-client, generated from /openapi/site.
Management is /api/sites in the separate public API contract. Site credentials
stay server-side. Preserve bounded same-origin checkout, public IDs and hosted
checkout; do not invent payment, shipping or merchant policy facts.

Run npm ci and npm run check. Examples build into ignored public directories.
Use npm run export for standalone private client adaptations; the private
operational template is refreshed from that exporter. Do not edit it as a
second design source.

Keep primary checkouts on main and use dedicated worktrees under ~/.r-worktrees.
Use PRs and squash merges after the fresh-history bootstrap. CI validates only;
this public repo must never deploy production or hold production secrets.
Use semantic HTML, visible focus and modern native browser code.
