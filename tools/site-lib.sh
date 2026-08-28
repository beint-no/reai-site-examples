#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
sites_root="$repository_root/sites"

list_sites() {
  find "$sites_root" -mindepth 1 -maxdepth 1 -type d -print0 |
    while IFS= read -r -d '' site_dir; do
      if [ -d "$site_dir/public" ] && { [ -f "$site_dir/wrangler.jsonc" ] || [ -f "$site_dir/wrangler.toml" ]; }; then
        basename "$site_dir"
      fi
    done | sort
}

site_exists() {
  local site="${1:-}"
  [ -n "$site" ] && [ -d "$sites_root/$site/public" ] && {
    [ -f "$sites_root/$site/wrangler.jsonc" ] || [ -f "$sites_root/$site/wrangler.toml" ]
  }
}

require_site() {
  local site="${1:-}"
  if ! site_exists "$site"; then
    echo "unknown site '$site'; available sites:" >&2
    list_sites >&2
    return 64
  fi
}
