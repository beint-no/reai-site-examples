#!/usr/bin/env bash
set -euo pipefail
node build-static.mjs --check
node --test tests/*.test.mjs
node --test ../../tools/vintage-designer-pages/demo.test.mjs ../../tools/vintage-designer-local/local.test.mjs
node ../../tools/vintage-designer-local/validate-deployment.mjs
