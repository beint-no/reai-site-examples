#!/usr/bin/env bash
set -euo pipefail

node tools/generate-pages.mjs --check
node --check storefront.mjs
node --check legal-pages.mjs
node --check public/assets/site.js
node --check worker.js
test ! -e public/products
test ! -e public/collections
test ! -e public/data/catalog.json
grep -q '^Sitemap: https://squadrasport.no/sitemap.xml$' public/robots.txt
! grep -q '^Disallow: /$' public/robots.txt
