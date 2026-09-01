#!/usr/bin/env bash
set -euo pipefail

node --test storefront.test.mjs

for page in index.html handlekurv/index.html bestilling/fullfort/index.html 404.html; do
  test -f "public/$page"
done

for image in doner durum falafel fries hero mezze pizza plate; do
  test -f "public/assets/$image.jpg"
done

test -f public/assets/favicon.svg
test -f public/styles.css
test -f public/script.js

! test -e public/products
! test -e public/collections
! test -e public/data/catalog.json
! test -e public/assets/products
! test -e public/sitemap.xml
! test -e tools/sync-shopify.mjs
! grep -q 'class="dish__price"' public/index.html
grep -q 'Kongen av' storefront.mjs
grep -q 'Brattørgata 4' storefront.mjs
grep -q 'Trondheim-kebab' storefront.mjs
grep -q 'data-en=' storefront.mjs
grep -q '/assets/hero.jpg' storefront.mjs
grep -q '/styles.css' storefront.mjs
grep -q '/script.js' storefront.mjs
grep -q 'kebabking-cart-v1' public/assets/store.js
grep -q '/reai/checkout/start' public/assets/store.js
grep -q 'data-checkout-start' public/handlekurv/index.html
grep -q 'data-order-complete' public/bestilling/fullfort/index.html
grep -q 'removeItem(CART_KEY)' public/assets/store.js
grep -q 'data-add-to-cart' storefront.mjs
grep -q 'data-collection-grid' storefront.mjs
grep -q 'renderProductPage' storefront.mjs
grep -q 'renderCollectionPage' storefront.mjs
grep -q 'renderHomePage' storefront.mjs
grep -q 'renderSitemap' storefront.mjs
grep -q 'createReaiStorefrontWorker' worker.js
grep -q 'REAI_SITE_TOKEN' ../../packages/reai-cloudflare-storefront/worker.mjs
grep -q '"REAI_BASE_URL": "https://app.reai.no"' wrangler.jsonc
grep -q '"name": "kebabkingtrondheim"' wrangler.jsonc
grep -q '"pattern": "kebabkingtrondheim.no"' wrangler.jsonc
grep -q '"pattern": "www.kebabkingtrondheim.no"' wrangler.jsonc
grep -q 'SITE_ORIGIN = "https://kebabkingtrondheim.no"' storefront.mjs
grep -q '^\.dev\.vars$' ../../.gitignore
grep -q 'sitemap.xml' public/robots.txt
! grep -R -q 'shopify' public storefront.mjs worker.js --include='*.html' --include='*.js' --include='*.mjs'

echo "Kebab King ReAI storefront checks passed."
