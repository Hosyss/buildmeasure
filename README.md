# BuildMeasure

BuildMeasure is an English-language construction and DIY calculator platform.
The product prioritizes transparent formulas, verified unit conversions,
maintainable calculator engines, accessible interfaces, and search-friendly
calculator pages.

## Live site

- [Open BuildMeasure](https://buildmeasure.buildtools.workers.dev/)
- [Concrete Calculator](https://buildmeasure.buildtools.workers.dev/concrete-calculator)
- [Paint Calculator](https://buildmeasure.buildtools.workers.dev/paint-calculator)
- [Tile Calculator](https://buildmeasure.buildtools.workers.dev/tile-calculator)
- [Gravel Calculator](https://buildmeasure.buildtools.workers.dev/gravel-calculator)
- [Mulch Calculator](https://buildmeasure.buildtools.workers.dev/mulch-calculator)

## Current verified scope

- Responsive product homepage.
- Concrete slab calculator.
- Interior room paint calculator for walls and optional ceilings.
- Rectangular floor and wall tile calculator.
- Rectangular gravel coverage calculator with adjustable bulk density.
- Rectangular mulch-bed calculator with exact package-volume input.
- Imperial and metric input systems.
- Ready-mix volume and 40/60/80 lb bag estimates.
- Adjustable waste allowance.
- Paint area, coats, measured openings, adjustable coverage, gallons/liters,
  and selected container count.
- Tile area, adjustable waste, full-box rounding, grout-aware layout check,
  and automatic rectangular-tile orientation.
- Gravel net/order volume, estimated mass, short tons, metric tonnes, and
  complete bags with an explicit material-density assumption.
- Mulch net/order volume, bed area, per-bag coverage, and complete bags without
  an invented density assumption.
- Copy, print, reset, and device-local save/history actions.
- Pure, versioned concrete, paint, tile, gravel, and mulch engines with
  automated unit tests.
- Shared numeric-range guards and exact-boundary rounding regression tests.
- Shared exact unit constants and validation helpers.
- Calculator metadata, FAQ, breadcrumb, and WebApplication structured data.
- Formula/version/source documentation.

Anything not listed above should be treated as planned, not implemented.

## Download BuildMeasure

- [Latest verified release](https://github.com/Hosyss/buildmeasure/releases/latest)
  includes the current source ZIP, a full-history Git bundle, and SHA-256
  checksums.
- [Download the current `main` source as ZIP](https://github.com/Hosyss/buildmeasure/archive/refs/heads/main.zip)
  directly from GitHub.

The release files are created only after the complete quality gate succeeds.
Use the full-history bundle when restoring the repository, or the ZIP when you
only need a readable copy of the current source. Verification and recovery
steps are in [the recovery guide](docs/RECOVERY.md).

## Local development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run test:unit
npm run lint
npm test
npm run qa:automated
npm run seo:indexnow -- --dry-run
```

`npm test` runs engine tests, creates the production build, and tests rendered
HTML from the built worker. `npm run qa:automated` adds lint to that complete
automated gate. Critical changes and major milestones additionally require the
mobile/desktop audit and evidence record defined in `docs/QA.md`.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Concrete calculator specification](docs/calculators/concrete.md)
- [Paint calculator specification](docs/calculators/paint.md)
- [Tile calculator specification](docs/calculators/tile.md)
- [Gravel calculator specification](docs/calculators/gravel.md)
- [Mulch calculator specification](docs/calculators/mulch.md)
- [Progress measurement](docs/PROGRESS.md)
- [QA guide](docs/QA.md)
- [Quality audit log](docs/AUDITS.md)
- [Verification record](docs/VERIFICATION.md)
- [Roadmap](docs/ROADMAP.md)
- [Bug register](docs/BUGS.md)
- [Recovery and backup guide](docs/RECOVERY.md)
- [Traffic and search operations](docs/TRAFFIC.md)
- [Search-engine discovery](docs/INDEXING.md)
- [Cloudflare deployment and cutover](docs/CLOUDFLARE.md)
- [Contributing](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

## Durable source and recovery

Treat this repository as the source of truth. Every proposed change is checked
by the GitHub quality gate, which installs the locked dependencies and runs
lint, engine tests, the production build, artifact validation, and rendered
route tests. Each versioned release publishes a verified downloadable backup
and its SHA-256 checksum. Keep an additional copy in a separate durable
location when possible. See [the recovery guide](docs/RECOVERY.md) for the
restore and rollback procedure.

The repository-level `AGENTS.md` keeps future coding agents on the existing
BuildMeasure Site, preserves the deployment identity, and requires the full
quality gate before publishing.

## Product rule

No feature is described as complete until its source exists and its relevant
checks pass. Accuracy is more important than release speed.
