#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "${script_dir}/.." && pwd)"
client_dir="${project_root}/dist/client"
server_dir="${project_root}/dist/server"
pages_dir="${project_root}/dist/pages"

[[ -f "${server_dir}/index.js" ]] || {
  echo "Missing Vinext Worker entry: dist/server/index.js" >&2
  exit 66
}

[[ -d "${client_dir}" ]] || {
  echo "Missing Vinext client assets: dist/client" >&2
  exit 66
}

rm -rf "${pages_dir}"
mkdir -p "${pages_dir}/_worker.js"
cp -R "${client_dir}/." "${pages_dir}/"
cp -R "${server_dir}/." "${pages_dir}/_worker.js/"

cat > "${pages_dir}/_routes.json" <<'JSON'
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/_next/static/*"]
}
JSON

[[ -f "${pages_dir}/_worker.js/index.js" ]] || {
  echo "Missing Pages advanced-mode Worker entry" >&2
  exit 66
}

[[ -f "${pages_dir}/_routes.json" ]] || {
  echo "Missing Pages static-asset routing manifest" >&2
  exit 66
}

echo "Packaged Cloudflare Pages artifact: dist/pages"
