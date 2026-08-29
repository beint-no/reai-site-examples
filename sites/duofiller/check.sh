#!/usr/bin/env bash
set -euo pipefail

site_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

node "$site_dir/tools/check-i18n.mjs"
node --test "$site_dir/storefront.test.mjs"
test -f "$site_dir/public/index.html"
test -f "$site_dir/public/nb/index.html"
test -f "$site_dir/public/support/index.html"
test -f "$site_dir/public/nb/brukerstotte/index.html"

if rg -n "REAI_SITE_TOKEN\\s*[=:]\\s*['\"][^'\"]+" "$site_dir" --glob '!*.example' --glob '!README.md' --glob '!AGENTS.md'; then
  echo "DuoFiller source appears to contain a Site credential" >&2
  exit 1
fi
