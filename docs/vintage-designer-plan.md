# Vintage Designer storefront plan

Status: storefront implemented and verified locally with explicit ignored sample data. ReAI setup and Cloudflare deployment are deferred. Checkout remains disabled. See `sites/vintage-designer/README.md` and `docs/vintage-designer-verification.md` for local review and test evidence.

## Direction

Build a Norwegian storefront under `sites/vintage-designer/` using the shared
Cloudflare storefront package and ReAI Site client. Preserve the recognizable
identity of https://vintagedesigner.no/: its logo, monochrome palette, generous
whitespace, product photography, Bricolage Grotesque headings and Inter body text.
Use restrained green accents for authentication information.

## Planned experience

- Render products, collections, prices, images and availability from the Site API.
- Improve search, collection counts, brand and availability filters, and price/name
  sorting. Preserve filter state in shareable URLs and prioritize available items.
- Present consistent product images without cropping away condition details.
- Present condition, dimensions, era and included accessories only when supplied
  by the source product content. Preserve the original description.
- Provide Norwegian navigation, search and cart states, useful error messages,
  and responsive layouts without horizontal overflow.
- Recreate public guides, authentication, about, contact and policy content using
  verified source material. Use direct email links; omit unsupported account and
  submission features.
- Keep preview checkout disabled at the Worker boundary, including direct requests
  to `/reai/checkout/start`.

## Repository requirements

- Follow existing sites with a public client brief in `AGENTS.md`, a README,
  Worker entrypoint, brand renderer, static editorial content and focused checks.
- Keep all upstream Site API requests in `packages/reai-site-client/` and reuse
  `packages/reai-cloudflare-storefront/` for shared behavior.
- Do not commit a product catalog, generated product pages, prices or inventory.
- Render API image alt text, intrinsic dimensions and width-based renditions;
  use useful product context when alt text is absent.
- Preserve semantic HTML, keyboard navigation, visible focus and reduced motion.
- Mark the preview `noindex, nofollow`. Production domain cutover is a separate step.
- Keep private configuration and operational records outside this public repository.

## Acceptance criteria for implementation

- Repository checks and Worker dry runs pass.
- Compare source and preview at matching desktop and mobile viewports across
  homepage, collection, product, search, cart, editorial and 404 routes.
- Verify empty search, unavailable products, missing alt text, unknown handles,
  upstream failures and disabled checkout behavior.
- Verify that product data comes from ReAI, credentials are absent from browser
  responses, and preview indexing is disabled.

This document records the intended storefront work; it does not mark that work
complete or authorize deployment by itself.
