#!/usr/bin/env bash
set -euo pipefail

site="${1:-}"
root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$root_dir/tools/site-lib.sh"

if [ -z "$site" ]; then
  echo "usage: $0 <site|all>" >&2
  exit 64
fi

validate_one() {
  local name="$1"
  local site_dir="$root_dir/sites/$name"

  require_site "$name"
  test -f "$site_dir/AGENTS.md" || { echo "site '$name' has no AGENTS.md" >&2; exit 1; }
  test -f "$site_dir/README.md" || { echo "site '$name' has no README.md" >&2; exit 1; }

  node "$root_dir/tools/check-links.mjs" "$site_dir/public"
  if [ -x "$site_dir/check.sh" ]; then
    (cd "$site_dir" && ./check.sh)
  fi
}

if [ "$site" = all ]; then
  while IFS= read -r name; do
    validate_one "$name"
  done < <(list_sites)
else
  validate_one "$site"
fi
