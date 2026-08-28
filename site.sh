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
  ./site.sh check [site|all]
  ./site.sh deploy <site>

Deployment runs locally with Wrangler. Every site is a separate Cloudflare
Worker, and the production storefronts also serve as runnable Site API examples.
EOF
}

case "$command_name" in
  list) list_sites ;;
  check) ./validate.sh "${site:-all}" ;;
  deploy) ./deploy.sh "$site" ;;
  help|-h|--help) usage ;;
  *) usage >&2; exit 64 ;;
esac
