#!/usr/bin/env bash
set -euo pipefail

site="${1:-}"
root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$root_dir/tools/site-lib.sh"

if [ -z "$site" ]; then
  echo "usage: $0 <site>" >&2
  exit 64
fi
require_site "$site"

: "${CLOUDFLARE_API_TOKEN:?CLOUDFLARE_API_TOKEN is required}"
: "${CLOUDFLARE_ACCOUNT_ID:?CLOUDFLARE_ACCOUNT_ID is required}"

if [ ! -x "$root_dir/node_modules/.bin/wrangler" ]; then
  echo "Wrangler is not installed; run 'npm ci' in $root_dir" >&2
  exit 1
fi

"$root_dir/validate.sh" "$site"
(cd "$root_dir/sites/$site" && "$root_dir/node_modules/.bin/wrangler" deploy)
