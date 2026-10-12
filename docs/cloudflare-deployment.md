# Publish the demo on Cloudflare

The repository has one deploy target: reai-demo-store in root wrangler.jsonc.
The custom domain is nettbutikk.reai.no. Cloudflare Workers host this site
independently from the AX42 application server; do not point this hostname at AX42.

Use the intended Cloudflare account and scoped environment credentials. Configure
the Site's active/preview domains to match hosting, then install its scoped token:

```sh
npx wrangler secret put REAI_SITE_CREDENTIAL
npm run deploy
```

Enter the token through stdin/prompt; never commit it or supply it in a command
argument. Root .dev.vars is ignored and is not uploaded by deployment.

The routes entry in wrangler.jsonc creates the Worker custom domain, DNS and TLS
certificate during deployment. Removing an old route also requires verifying its custom-domain, DNS and certificate cleanup. Do not add a separate DNS record or change
sibling client domains. HTTP redirects to HTTPS. If a valid certificate reports “not yet valid”, compare the client clock with network time before changing certificates. HSTS is hostname-only; sibling domains are unaffected. Verify TLS, homepage, static pages, public API
routes, variants, cart, hosted checkout return behavior and recent Worker logs.
Confirm the displayed payment mode agrees with the actual backend provider.
New hostnames can remain negatively cached by recursive DNS resolvers; compare
authoritative/public DNS and the workers.dev URL before treating that as a Worker fault.

CI validates source; it holds no production credential and does not deploy.
Changing the public repo or private template does not redeploy client sites.

PR builds and preview publishing run on standard hosted GitHub Actions. The central
preview publisher is the reviewed default-branch workflow in this public repository.
Its deployment credentials are encrypted Actions secrets, not source files. ReAI
retains the deployment target registry and checks the exact signed workflow identity.
Customer previews do not depend on private ReAI Actions billing.
