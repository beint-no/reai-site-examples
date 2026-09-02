#!/usr/bin/env bash
set -euo pipefail

site_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

node "$site_dir/tools/check-i18n.mjs"
node --test "$site_dir/storefront.test.mjs"
test -f "$site_dir/public/index.html"
test -f "$site_dir/public/nb/index.html"
test -f "$site_dir/public/support/index.html"
test -f "$site_dir/public/nb/brukerstotte/index.html"
test -f "$site_dir/public/policies/refund/index.html"
test -f "$site_dir/public/nb/policies/retur/index.html"
grep -q 'href=/products/duofiller-core-g3/' "$site_dir/public/index.html"
grep -q 'href=/nb/products/duofiller-core-g3/' "$site_dir/public/nb/index.html"
grep -q 'href=/support/' "$site_dir/public/index.html"
grep -q 'href=/nb/brukerstotte/' "$site_dir/public/nb/index.html"
grep -q 'hreflang=x-default href=https://duofiller.respiro.workers.dev/' "$site_dir/public/nb/index.html"
grep -Eq 'href="?https://reai.no"? rel="?external"?>Powered by ReAI</a>' "$site_dir/public/index.html"
grep -Eq 'href="?https://reai.no"? rel="?external"?>Drevet av ReAI</a>' "$site_dir/public/nb/index.html"
grep -Eq 'href="?/policies/refund/"?>Refund policy</a>' "$site_dir/public/index.html"
grep -Eq 'href="?/nb/policies/retur/"?>Retur</a>' "$site_dir/public/nb/index.html"
grep -q 'data-store-currency=USD' "$site_dir/public/cart/index.html"
grep -q 'data-store-currency=NOK' "$site_dir/public/nb/handlekurv/index.html"
grep -q 'CHECKOUT_ENABLED": "true"' "$site_dir/wrangler.jsonc"
grep -q 'data-market-switch' "$site_dir/public/index.html"
grep -q 'data-market-current-code>NOK' "$site_dir/public/nb/index.html"
grep -q 'data-market-current-code>USD' "$site_dir/public/index.html"
grep -q 'href=/?market=norway data-market=norway' "$site_dir/public/index.html"
grep -q 'href=/nb/?market=international data-market=international' "$site_dir/public/nb/index.html"
grep -q 'class=language-switch href=/nb/?market=international' "$site_dir/public/index.html"
grep -q 'class=language-switch href=/?market=norway' "$site_dir/public/nb/index.html"

if rg -n "REAI_SITE_TOKEN\\s*[=:]\\s*['\"][^'\"]+" "$site_dir" --glob '!*.example' --glob '!README.md' --glob '!AGENTS.md'; then
  echo "DuoFiller source appears to contain a Site credential" >&2
  exit 1
fi
