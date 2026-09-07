#!/usr/bin/env bash
set -euo pipefail
node build-static.mjs --check
node --test tests/*.test.mjs
node ../../tools/vintage-designer-local/validate-deployment.mjs
