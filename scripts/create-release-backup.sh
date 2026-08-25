#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repository_root="$(git -C "$script_dir" rev-parse --show-toplevel)"
cd "$repository_root"

if [[ -n "$(git status --porcelain --untracked-files=all)" ]]; then
  echo "Refusing to back up a working tree with uncommitted changes." >&2
  exit 1
fi

output_dir="${1:-release-assets}"
if [[ -z "$output_dir" || "$output_dir" == "/" || "$output_dir" == "." ]]; then
  echo "Refusing unsafe output directory: ${output_dir:-<empty>}" >&2
  exit 1
fi

mkdir -p "$output_dir"
output_dir="$(cd "$output_dir" && pwd)"

version="$(node -p "require('./package.json').version")"
prefix="buildmeasure-v${version}"
source_archive="${output_dir}/${prefix}-source.zip"
history_bundle="${output_dir}/${prefix}-history.bundle"
checksum_manifest="${output_dir}/SHA256SUMS.txt"

rm -f "$source_archive" "$history_bundle" "$checksum_manifest"

git archive \
  --format=zip \
  --prefix="${prefix}/" \
  HEAD \
  -o "$source_archive"

git bundle create "$history_bundle" --all
git bundle verify "$history_bundle"

(
  cd "$output_dir"
  sha256sum \
    "$(basename "$source_archive")" \
    "$(basename "$history_bundle")" \
    > "$(basename "$checksum_manifest")"
)

echo "Created verified JobsiteQuant ${version} backups in ${output_dir}"
