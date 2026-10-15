# Editorial content review — 2026-10-16

## Batch 1: slab concrete and room paint

Base revision: `fb4319285826979b6f1f71e601288bdc7967c524`.

This batch expands two existing guides and adds two original static SVG
measurement illustrations. It changes editorial update dates to match the
substantive additions. Calculator engines, inputs, units, procurement behavior,
routes, canonical hosts, tracking, storage, and deployment configuration are
unchanged.

### Content and arithmetic review

- Slab example: non-overlapping 6 × 2 m and 4 × 2 m rectangles cover 20 m².
  At an illustrative 100 mm thickness they require 2.00 m³ net and 2.20 m³
  with 10% allowance. An extra 10 mm adds 0.20 m³ before allowance.
- Paint example: a 4 × 3 × 2.5 m room has 35 m² of walls; subtracting 3 m²
  of openings gives 32 m². Two coats at 10 m²/L and 10% extra need 7.04 L.
  The separate ceiling needs 3.30 L at 8 m²/L. Complete 2.5 L cans are
  rounded per product, not after combining unlike paints.
- Product-yield and coverage references were checked against Sakrete
  High-Strength Concrete Mix and Sherwin-Williams Paint Calculator/Painting
  FAQs. The new measurement examples and sensitivity comparisons are
  BuildMeasure arithmetic illustrations, not field measurements or a claim of
  professional design approval.
- Corrected an existing guide statement that implied the concrete calculator
  supports editable bag yields; it selects documented product yields.

### Validation

- Node 22.22.0 with the committed npm lockfile.
- `npm run qa:automated`: typecheck, lint, 143 engine tests, verified production
  build/artifact validation, and 38 rendered-route tests passed.
- Both changed guides were additionally requested directly from the built
  Worker: HTTP 200, updated article dates and image references present, and SVG
  assets included in `dist/client`.
- Both SVGs parsed as XML and were rasterized with Sharp for visual inspection.
  Labels and geometry were reviewed; both include descriptive alternative text.
- `git diff --check` passed.
- Interactive browser/mobile review was unavailable because the supported
  browser-control skill is not present. No Lighthouse or interactive-browser
  pass is claimed for this editorial batch.

These changes improve the usefulness of the existing pages. They do not
establish Google's undisclosed rejection cause or guarantee AdSense approval.

## Batch 2: tile, gravel, and mulch

Base content revision: `f3e54d6a2b3d524f46a2f2f756a7ea23bc8926ad`.

- Tile: 9.62 m² at a 0.36 m² tile face and 10% allowance requires 30 tiles,
  or eight four-tile boxes. Three additional untouched spares, when not already
  included in that allowance, raise the requirement to nine boxes. The
  illustration deliberately distinguishes grid cells from purchased tiles.
- Gravel: 24 m² × 0.10 m = 2.40 m³. At 10% allowance, 2.64 m³ and example
  same-state densities of 1,500/1,700 kg/m³ give 3,960/4,488 kg, or 159/180
  complete 25 kg bags. No density range or compaction factor is prescribed.
- Mulch: 10.2 m² with a 25 mm added layer requires 255 L net, or 280.5 L
  after 10% allowance. This is eight 40 L bags or six 50 L bags. Entering the
  full illustrative 75 mm target instead would count retained material and
  produce 22 complete 40 L bags.
- Rechecked Daltile/TCNA tile guidance, ASTM's loose/compacted aggregate
  distinction, and EPA WaterSense mulch guidance. New numerical examples are
  original illustrative arithmetic, not manufacturer recommendations.
- Full automated gate passed again: typecheck, lint, 143 engine tests,
  production build/artifact validation, and 38 rendered-route tests.
- All three modified guides additionally rendered HTTP 200 from the built
  Worker, with matching update dates and packaged SVGs. All three diagrams
  passed XML parsing and visual inspection after Sharp rasterization.
- Browser interaction/Lighthouse remain unmeasured; no browser pass is claimed.
