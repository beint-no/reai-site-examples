#!/usr/bin/env bash
set -euo pipefail

node "$(dirname "${BASH_SOURCE[0]}")/tools/check-storefront.mjs"

for page in index.html sok/index.html handlekurv/index.html bestilling/fullfort/index.html frakt/index.html faq/index.html vilkar/index.html om/index.html kontakt/index.html personvern/index.html retur/index.html storrelse/index.html 404.html; do
  test -f "public/$page"
done

! test -e public/products
! test -e public/collections
! test -e public/data/catalog.json
! test -e public/assets/products
! test -e tools/sync-shopify.mjs
! grep -R -q 'data-age-gate' public --include='*.html'
! grep -R -q '/assets/products/' public --include='*.html' --include='*.js' --include='*.css'
! grep -R -q '/data/catalog.json' public --include='*.html' --include='*.js'
grep -q 'data-contact-form' public/kontakt/index.html
grep -q 'data-search-results' public/sok/index.html
grep -q 'data-cart-root' public/handlekurv/index.html
grep -q "endorphin-cart-v1" public/assets/store.js
grep -q "'/reai/catalog'" public/assets/store.js
grep -q '/reai/collections/' public/assets/store.js
grep -q 'siteImageUrl' public/assets/store.js
grep -q 'data-add-to-cart' storefront.mjs
grep -q 'option-pill' storefront.mjs
grep -q 'option-pill--color' storefront.mjs
grep -q 'option-pill-text' storefront.mjs
grep -q 'option-swatch' storefront.mjs
grep -q 'data-product-options' storefront.mjs
grep -q 'bootstrapProductOptions' public/assets/store.js
grep -q 'data-product-variant-map' public/assets/store.js
grep -q 'store.js?v=13' storefront.mjs
grep -q 'store.css?v=11' storefront.mjs
grep -q 'data-gallery-prev' storefront.mjs
grep -q 'data-gallery-next' public/assets/store.js
! grep -q 'aspect-ratio: 1 / 1' public/assets/store.css
! grep -q 'option-pill--color.is-selected { color: var(--shop-ink); background: #fff' public/assets/store.css
! grep -q '<select data-product-variant' storefront.mjs
! grep -q '<select data-product-variant' public/assets/store.js
grep -q 'data-collection-grid' storefront.mjs
grep -q 'https://app.reai.no/' storefront.mjs
grep -q 'renderProductPage' storefront.mjs
grep -q 'renderCollectionPage' storefront.mjs
grep -q 'renderHomePage' storefront.mjs
grep -q 'renderSitemap' storefront.mjs
grep -q 'createReaiStorefrontWorker' worker.js
grep -q 'import \* as storefront from "./storefront.mjs"' worker.js
grep -q 'norwegianMessages' worker.js
grep -q 'REAI_SITE_TOKEN' ../../packages/reai-cloudflare-storefront/worker.mjs
grep -q '/reai/collections' ../../packages/reai-cloudflare-storefront/worker.mjs
grep -q 'ReaiSiteClient' ../../packages/reai-cloudflare-storefront/worker.mjs
grep -q 'Content-Security-Policy' ../../packages/reai-cloudflare-storefront/worker.mjs
grep -q '/reai/checkout/start' ../../packages/reai-cloudflare-storefront/worker.mjs
grep -q '/reai/checkout/start' public/assets/store.js
grep -q 'data-checkout-start' public/handlekurv/index.html
grep -q 'data-order-complete' public/bestilling/fullfort/index.html
! grep -q 'data-order-complete' public/handlekurv/index.html
grep -q '/bestilling/fullfort/' ../../packages/reai-cloudflare-storefront/worker.mjs
grep -q 'removeItem(CART_KEY)' public/assets/store.js
grep -q 'legacyRedirectUrl' worker.js
grep -q 'Response.redirect(legacyTarget, 301)' worker.js
grep -q 'post@famme.no' public/kontakt/index.html
grep -q "CONTACT_EMAIL = 'post@famme.no'" public/assets/store.js
! grep -R -q 'post@endorphin.no' AGENTS.md README.md public storefront.mjs tools
! grep -R -q '/blogs/' public --include='*.html'
grep -q '"REAI_BASE_URL": "https://app.reai.no"' wrangler.jsonc
grep -q 'SITE_ORIGIN = "https://endorphin.no"' storefront.mjs
grep -q '"pattern": "endorphin.no"' wrangler.jsonc
grep -q '"pattern": "www.endorphin.no"' wrangler.jsonc
grep -q '"custom_domain": true' wrangler.jsonc
! grep -q 'endorphin.no/\*' wrangler.jsonc
grep -q 'www.endorphin.no' worker.js
grep -q '^\.dev\.vars$' ../../.gitignore
grep -q 'sitemap.xml' public/robots.txt
grep -q 'Sitemap: https://endorphin.no/sitemap.xml' public/robots.txt
! grep -R -q 'rel="canonical" href="https://endorphin.respiro.workers.dev' public --include='*.html'
while IFS= read -r page; do
  grep -q 'class="compact-legal-links"' "$page"
  grep -q 'href="https://reai.no" rel="external">Drevet av ReAI</a>' "$page"
  grep -q 'href="/retur/">Retur</a>' "$page"
  grep -q 'href="/personvern/">Personvern</a>' "$page"
  grep -q 'href="/vilkar/">Kjøpsvilkår</a>' "$page"
done < <(find public -name '*.html' -type f)
! grep -R -q 'Rdnt' public --include='*.html'
! grep -R -q 'testdrift' public --include='*.html'
! grep -R -q 'Kasse hos' public --include='*.html'
! grep -q 'Kasse hos ReAI' storefront.mjs
! grep -q 'Skoene fra Famme' storefront.mjs
test -f public/assets/brand/endorphin-logo.png
for image in rx2-city rx1-white rx1-black airstep-white 90s-lifestyle; do
  test -f "public/assets/lifestyle/$image.webp"
  for width in 480 800 1200; do
    test -f "public/assets/lifestyle/$image-$width.avif"
  done
done
grep -q '<picture class="responsive-picture">' public/index.html
grep -q 'aria-label="Brødsmulesti"' public/sok/index.html
! grep -R -q 'store.js?v=11' public --include='*.html'
! grep -R -q 'store.css?v=10' public --include='*.html'
! grep -R -q 'over 400 kr' AGENTS.md README.md public storefront.mjs
! grep -R -q '100 dag' AGENTS.md README.md public storefront.mjs
! grep -R -q 'Klarna' AGENTS.md README.md public storefront.mjs tools/write-static-pages.mjs
grep -R -q 'over 899 kr' public storefront.mjs

echo "Endorphin static checks passed."
