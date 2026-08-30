# BuildNumbers recovery guide

This repository is the durable source of truth for BuildNumbers. The hosted
Site and its saved deployment versions are release outputs; they are not a
substitute for this source repository and its downloadable backups.

## Download a verified backup

Open the [latest GitHub release](https://github.com/Hosyss/buildmeasure/releases/latest)
and download all three release assets:

- `buildmeasure-vX.Y.Z-source.zip` — the source at the released revision.
- `buildmeasure-vX.Y.Z-history.bundle` — every Git branch, tag, and commit.
- `SHA256SUMS.txt` — the expected SHA-256 digest for both files.

GitHub also provides a convenient
[ZIP of the current `main` branch](https://github.com/Hosyss/buildmeasure/archive/refs/heads/main.zip),
but the versioned release bundle is the safer disaster-recovery copy because it
preserves the complete repository history.

## Restore a working copy

Requirements:

- Git.
- Node.js 22 or newer (`.nvmrc` selects Node.js 22).
- npm.

```bash
git clone <repository-url>
cd buildmeasure
npm ci
npm run qa:automated
```

The restore is valid only when lint, all unit tests, the production build, the
artifact validator, and the rendered-route tests pass.

## Run locally

```bash
npm run dev
```

Do not commit `.env` files, credentials, tokens, generated build output,
dependency folders, or local runtime data. The repository's `.gitignore`
excludes these paths.

## Safe change workflow

1. Create a branch from the current `main` branch.
2. Make the smallest coherent change.
3. Add or update a regression test for behavior changes.
4. Run `npm run qa:automated` locally.
5. Open a pull request and wait for the GitHub quality gate to pass.
6. Merge only after review and a green quality gate.
7. For formula, routing, SEO, storage, or framework changes, complete the
   additional manual audit in `docs/QA.md`.

## Recover from a bad change

Do not rewrite or delete history. Revert the bad commit on a new branch, run the
complete quality gate, and merge the revert through a pull request. A previous
tag or release archive can be used to inspect older source, but the fix should
remain visible in Git history.

## Reconnect to ChatGPT Sites

The tracked `.openai/hosting.json` identifies the existing BuildNumbers Site.
Preserve it unchanged when restoring or cloning the project. Never create a
replacement Site for this source. Open the existing project by its stored
identity, validate the source, save a new version, and deploy only after the
intended audience and change have been reviewed.

## Backup verification

The source ZIP and the full-history Git bundle are complementary: the ZIP is
the easiest way to inspect and restore the current source, while the bundle
preserves every branch, tag, and commit.

For every downloadable backup set:

1. Keep the checksum manifest beside both files.
2. Verify both SHA-256 checksums before extraction or cloning.
3. Confirm the source ZIP contains `.openai/hosting.json`, `package.json`,
   `package-lock.json`, `app/`, `lib/`, `tests/`, and `docs/`.
4. Verify the bundle with `git bundle verify <bundle-file>`.
5. Restore full history with `git clone <bundle-file> buildmeasure`.
6. Run `npm ci` and `npm run qa:automated` from the restored copy.

On Linux, macOS, WSL, or Git Bash, verify a downloaded set from its directory:

```bash
sha256sum -c SHA256SUMS.txt
git bundle verify buildmeasure-vX.Y.Z-history.bundle
```

To generate and verify the same backup set from any trusted working copy:

```bash
bash scripts/create-release-backup.sh release-assets
cd release-assets
sha256sum -c SHA256SUMS.txt
```
