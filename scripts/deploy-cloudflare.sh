#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "${script_dir}/.." && pwd)"
config_path="${project_root}/dist/server/wrangler.json"

mkdir -p "${project_root}/.wrangler/logs"
export WRANGLER_WRITE_LOGS=false
export WRANGLER_LOG_PATH="${project_root}/.wrangler/logs"
export MINIFLARE_REGISTRY_PATH="${project_root}/.wrangler/registry"

cd "${project_root}"
node "${project_root}/scripts/validate-cloudflare-build.mjs" "${config_path}"
exec "${project_root}/node_modules/.bin/wrangler" deploy \
  --config "${config_path}" \
  "$@"
