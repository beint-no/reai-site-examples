#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
sites_root="$repository_root/sites"
wrangler_bin="$repository_root/node_modules/.bin/wrangler"
hugo_bin="${HUGO_BIN:-}"
if [ -z "$hugo_bin" ] && [ -x "$repository_root/.tools/bin/hugo" ]; then
  hugo_bin="$repository_root/.tools/bin/hugo"
fi
if [ -z "$hugo_bin" ] && command -v hugo >/dev/null 2>&1; then
  hugo_bin="$(command -v hugo)"
fi

list_sites() {
  find "$sites_root" -mindepth 1 -maxdepth 1 -type d -print0 |
    while IFS= read -r -d '' site_dir; do
      if { [ -d "$site_dir/public" ] || [ -f "$site_dir/hugo.yaml" ] || [ -f "$site_dir/hugo.yml" ] || [ -f "$site_dir/hugo.toml" ]; } && { [ -f "$site_dir/wrangler.jsonc" ] || [ -f "$site_dir/wrangler.toml" ]; }; then
        basename "$site_dir"
      fi
    done | sort
}

site_exists() {
  local site="${1:-}"
  [ -n "$site" ] && [ -d "$sites_root/$site" ] && {
    [ -f "$sites_root/$site/wrangler.jsonc" ] || [ -f "$sites_root/$site/wrangler.toml" ]
  } && { [ -d "$sites_root/$site/public" ] || [ -f "$sites_root/$site/hugo.yaml" ] || [ -f "$sites_root/$site/hugo.yml" ] || [ -f "$sites_root/$site/hugo.toml" ]; }
}

require_site() {
  local site="${1:-}"
  if ! site_exists "$site"; then
    echo "unknown site '$site'; available sites:" >&2
    list_sites >&2
    return 64
  fi
}

require_wrangler() {
  if [ ! -x "$wrangler_bin" ]; then
    echo "Wrangler is not installed; run 'npm ci' in $repository_root" >&2
    return 1
  fi
}

require_hugo() {
  if [ -z "$hugo_bin" ] || [ ! -x "$hugo_bin" ]; then
    echo "Hugo is required for this site; install Hugo 0.165.0 or run ./tools/install-hugo.sh" >&2
    return 1
  fi
}

build_site() {
  local site="${1:-}"
  require_site "$site"
  local site_dir="$sites_root/$site"
  if [ -f "$site_dir/hugo.yaml" ] || [ -f "$site_dir/hugo.yml" ] || [ -f "$site_dir/hugo.toml" ]; then
    require_hugo
    "$hugo_bin" --source "$site_dir" --destination "$site_dir/public" --cleanDestinationDir --gc --minify --printI18nWarnings --panicOnWarning
  fi
}
