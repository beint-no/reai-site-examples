#!/usr/bin/env bash
set -euo pipefail

node "$(dirname "${BASH_SOURCE[0]}")/tools/check-storefront.mjs"
node --test "$(dirname "${BASH_SOURCE[0]}")/tools/routes.test.mjs"

for page in index.html blogs/news/index.html search/index.html cart/index.html bestilling/fullfort/index.html pages/frakt/index.html pages/faq/index.html pages/salgsvilkar/index.html pages/om-oss/index.html pages/kontakt-oss/index.html policies/privacy-policy/index.html kunnskap/index.html 404.html; do
  test -f "public/$page"
done

test "$(find public/blogs/news -name index.html | wc -l | tr -d ' ')" -ge 26
! test -e public/products
! test -e public/collections
! test -e public/data/catalog.json
! test -e public/assets/products
! test -e tools/sync-shopify.mjs
! grep -R -q 'data-age-gate' public --include='*.html'
! grep -R -q '/assets/products' public --include='*.html' --include='*.js' --include='*.css'
! grep -R -q '/data/catalog.json' public --include='*.html' --include='*.js'
grep -q 'data-contact-form' public/pages/kontakt-oss/index.html
grep -q 'data-search-results' public/search/index.html
grep -q 'data-cart-root' public/cart/index.html
grep -q "budmates-cart-v3" public/assets/store.js
grep -q 'store.js?v=10' storefront.mjs
grep -q 'store.css?v=3' storefront.mjs
grep -q 'store.js?v=10' public/search/index.html
grep -q 'store.css?v=3' public/search/index.html
grep -q 'aria-label="Brødsmulesti"' public/search/index.html
while IFS= read -r page; do
  grep -q 'class="compact-legal-links"' "$page"
  grep -q 'href="https://reai.no" rel="external">Drevet av ReAI</a>' "$page"
  grep -q 'href="/policies/refund-policy">Retur</a>' "$page"
  grep -q 'href="/policies/privacy-policy">Personvern</a>' "$page"
  grep -q 'href="/pages/salgsvilkar">Kjøpsvilkår</a>' "$page"
done < <(find public -name '*.html' -type f)
grep -q 'id="angrerett"' public/pages/salgsvilkar/index.html
! grep -R -q 'store.js?v=6' public --include='*.html'
grep -q "'/reai/catalog'" public/assets/store.js
grep -q '/reai/collections' public/assets/store.js
grep -q 'siteImageUrl' public/assets/store.js
grep -q 'data-add-to-cart' storefront.mjs
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
grep -q 'data-checkout-start' public/cart/index.html
grep -q 'data-order-complete' public/bestilling/fullfort/index.html
! grep -q 'data-order-complete' public/cart/index.html
grep -q '/bestilling/fullfort/' ../../packages/reai-cloudflare-storefront/worker.mjs
grep -q 'removeItem(CART_KEY)' public/assets/store.js
grep -q '"REAI_BASE_URL": "https://app.reai.no"' wrangler.jsonc
grep -q '^\.dev\.vars$' ../../.gitignore
grep -q 'sitemap.xml' public/robots.txt
test -f public/assets/brand/budmates-logo.png
for image in discreet-delivery hero-materials; do
  test -f "public/assets/$image.webp"
  for width in 640 1200 1600; do
    test -f "public/assets/$image-$width.avif"
  done
done

echo "BudMates static checks passed."
