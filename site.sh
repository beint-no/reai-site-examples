#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$root_dir/tools/site-lib.sh"

command_name="${1:-help}"
site="${2:-}"

usage() {
  cat <<'EOF'
usage:
  ./site.sh list
  ./site.sh build [site|all]
  ./site.sh dev <site>
  ./site.sh check [site|all]
  ./site.sh check-workers [site|all]
  ./site.sh secret <site>
  ./site.sh deploy <site>
EOF
}

dev_site() {
  require_site "$site"
  require_wrangler
  build_site "$site"
  cd "$root_dir/sites/$site"
  exec "$wrangler_bin" dev
}

build_sites() {
  local target="${site:-all}"
  if [ "$target" = all ]; then
    while IFS= read -r name; do
      build_site "$name"
    done < <(list_sites)
  else
    build_site "$target"
  fi
}

check_worker() {
  local name="$1"
  require_site "$name"
  require_wrangler
  (cd "$root_dir/sites/$name" && "$wrangler_bin" deploy --dry-run)
}

check_workers() {
  local target="${site:-all}"

  if [ "$target" = all ]; then
    while IFS= read -r name; do
      check_worker "$name"
    done < <(list_sites)
  else
    check_worker "$target"
  fi
}

put_secret() {
  require_site "$site"
  require_wrangler
  cd "$root_dir/sites/$site"
  exec "$wrangler_bin" secret put REAI_SITE_TOKEN
}

case "$command_name" in
  list) list_sites ;;
  build) build_sites ;;
  dev) dev_site ;;
  check) "$root_dir/validate.sh" "${site:-all}" ;;
  check-workers) check_workers ;;
  secret) put_secret ;;
  deploy) "$root_dir/deploy.sh" "$site" ;;
  help|-h|--help) usage ;;
  *) usage >&2; exit 64 ;;
esac
