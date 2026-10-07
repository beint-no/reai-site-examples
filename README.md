# ReAI Sites: examples and integration guide

ReAI Sites support independently hosted websites. Some websites serve approved
static content; others use ReAI's Site API for business data and, when enabled,
hosted checkout. These examples demonstrate the Site API storefront model.
This public repository contains generic designs, reusable integration code and
a detailed guide. Real client sites live in separate private repositories.

## Try the examples

| Example | Design |
| --- | --- |
| [Everyday store](examples/everyday-store/README.md) | Green, warm neutrals, approachable three-column commerce |
| [Studio store](examples/studio-store/README.md) | Indigo, editorial serif headings, spacious two-column commerce |

```sh
npm ci
npm run demo -- everyday-store
# Or: npm run demo -- studio-store
```

Open http://127.0.0.1:8787. These explicit local demos use fictional products
and reject checkout. No ReAI or Cloudflare account is needed to explore them.

To connect a real test Site or export a standalone private client repo, follow
the [quickstart](docs/quickstart.md).

## Understand ReAI Sites

1. [Static versus Site API websites, Site identities and the request flow](docs/concepts.md)
2. [Configure Sites, publication, collections and credentials](docs/management.md)
3. [Market pricing, currency and localization](docs/markets-and-localization.md)
4. [Delivery credentials and server-side authentication](docs/authentication.md)
5. [Catalog, responsive images, bundles and availability](docs/catalog-and-images.md)
6. [Hosted checkout, shipping and payment](docs/checkout.md)
7. [Beginner and advanced integration architecture](docs/architecture.md)
8. [Cloudflare hosting and publishing](docs/cloudflare-deployment.md)
9. [Client repository ownership and the private operator hub](docs/repositories.md)
10. [Troubleshooting](docs/troubleshooting.md)

Canonical contracts: [delivery OpenAPI](https://app.reai.no/openapi/site) /
[explorer](https://app.reai.no/openapi/site/ui), and
[management OpenAPI](https://app.reai.no/openapi/public) /
[explorer](https://app.reai.no/openapi/public/ui).

## Development

Requires Node.js 26+ and npm 11.19+.

```sh
npm run check
npm run dev -- everyday-store
npm run export -- studio-store /absolute/path/to/new-private-repo
```

The Site credential belongs in an ignored .dev.vars file or a Worker secret;
it never belongs in browser code. Exported sites contain their required code
and do not depend on a parent repository at runtime.

The beginner starter is deliberately small. The optional advanced package
adds catalog caching, batch availability and richer market/locale integration.
The public repo has no production routes or credentials, and CI only validates.

## License

MIT for reusable source and original generic example assets. See [asset provenance](ASSETS.md).
