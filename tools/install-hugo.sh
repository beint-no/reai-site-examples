#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
install_dir="$repository_root/.tools/bin"
version="0.165.0"
archive="hugo_${version}_linux-amd64.tar.gz"
expected_sha256="5c3a37a5450b3e386e5b75a87a790fea2d04a796d75e171216c80ef48a32b432"

if [ "$(uname -s)" != "Linux" ] || [ "$(uname -m)" != "x86_64" ]; then
  echo "The pinned installer supports Linux x86_64 for CI; install Hugo ${version} with the platform package manager." >&2
  exit 1
fi

mkdir -p "$install_dir"
temporary_dir="$(mktemp -d)"
trap 'rm -rf "$temporary_dir"' EXIT

curl --fail --location --silent --show-error \
  "https://github.com/gohugoio/hugo/releases/download/v${version}/${archive}" \
  --output "$temporary_dir/$archive"

actual_sha256="$(sha256sum "$temporary_dir/$archive" | cut -d' ' -f1)"
if [ "$actual_sha256" != "$expected_sha256" ]; then
  echo "Hugo archive checksum mismatch" >&2
  exit 1
fi

tar -xzf "$temporary_dir/$archive" -C "$temporary_dir" hugo
install -m 0755 "$temporary_dir/hugo" "$install_dir/hugo"
"$install_dir/hugo" version
