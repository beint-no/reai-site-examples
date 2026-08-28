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
require_wrangler

: "${CLOUDFLARE_API_TOKEN:?CLOUDFLARE_API_TOKEN is required}"
: "${CLOUDFLARE_ACCOUNT_ID:?CLOUDFLARE_ACCOUNT_ID is required}"

"$root_dir/validate.sh" "$site"
(cd "$root_dir/sites/$site" && "$wrangler_bin" deploy)
