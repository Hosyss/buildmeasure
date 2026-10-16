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

## Batch 3: masonry, drywall, and editorial context

- Added three original SVGs for post displacement, measured brick openings,
  and exact metric panel dimensions, with descriptive alternative text.
- Post-hole example: a 30 cm diameter × 60 cm filled-depth cylinder contains
  42.4115… L gross. A full-depth 10 cm square post displaces 6 L. Six holes
  with illustrative 10% allowance need 240.3159… L, or 15 of the documented
  example 80 lb bags; omitting displacement gives 17 bags.
- Brick example: a 6 × 2.7 m face minus 2.1 and 1.44 m² openings leaves
  12.66 m². An explicitly hypothetical supplier rate of 500 brick per 10 m²
  and 5% allowance requires 665 whole bricks. Complete 250-unit packs would
  round separately to 750; this is not a universal coverage or pack size.
- Drywall example: a 4 × 3 × 2.5 m room, ceiling included and 2 m² openings,
  has 45 m² net area. At illustrative 10% allowance, 49.5 m² requires 18
  panels of 1.2 × 2.4 m, 14 of 1.2 × 3 m, or 17 of 4 × 8 ft. The guide
  explains that metric mode preserves a preset's physical size.
- Expanded the existing estimating workflow with separate wall paint, ceiling
  paint, and floor tile order lines. Added transparent authorship, reference,
  example-provenance, and correction information to About without inventing
  professional credentials or claiming site-survey case studies.
- Rechecked BIA Technical Note 10, USG's Wallboard Estimator, and the linked
  panel data. New order scenarios are original arithmetic illustrations.
- Fresh locked installation of the security-patched dependencies on Node
  22.22.0; the complete automated gate passed: typecheck, lint, 143 engine
  tests, verified production build, and 38 rendered-route tests.
- Direct built-Worker requests verified the four updated guides and About
  return HTTP 200 with the new content. All eight SVGs parse as XML and their
  packaged files exist; the three new diagrams were rasterized and inspected.
- Browser/Lighthouse validation is unavailable and is not claimed.

## Security check follow-up

The first GitHub run passed the complete application gate but failed the
production dependency audit. The lockfile contained Next.js 16.3.5,
Next.js's nested Sharp version below 0.35.5, and source-map-js below 1.2.2.

- Applied the compatible Next.js 16.3.8 security patch and kept eslint-config-next
  on the same version. Refreshed permitted transitive resolutions to Sharp
  0.35.5 under Next.js and source-map-js 1.2.2 without a force update.
- `npm audit --package-lock-only --omit=dev --json`: **zero production
  vulnerability findings** on 2026-10-16.
- Installed the new committed lockfile in an isolated checkout with Node
  22.22.0. Typecheck, lint, all 143 engine tests, verified production build, and
  all 38 rendered-route tests passed again.
- Existing audit thresholds and CI checks are unchanged. This does not claim
  that any conditional upstream vulnerability was exploited on BuildMeasure.
- Supported interactive browser tooling is unavailable in this environment;
  the framework-patch milestone's browser/Lighthouse matrix is therefore
  **partial, not passed**. The code and automated evidence are available for
  review; no complete manual milestone audit is claimed.

## Production follow-up — 2026-10-16

- Content batches #76, #77, and #78 were merged on GitHub. The deployed content
  revision is `0d55c1380e307043de075f895018f6e79361dbd4`.
- Cloudflare Pages deployment `842ca6aa-ae71-4d6d-91e8-20f9cd0a5f0f`
  built successfully but failed while publishing assets with an internal
  platform error. Retrying that exact revision produced successful production
  deployment `a759c433-5afd-4db7-8fdd-9e489e1e4b34`.
- Direct public HTTP checks passed for 40 pages and assets: the homepage, all
  eight calculators, the guide library and nine updated guides, About and
  supporting public pages, discovery/health endpoints, and eight SVGs. Updated
  text and dates are present in server-rendered HTML. Both storage checks
  reported `ok`; `/status` is operational and intentionally `noindex`.
- Public discovery checks found 24 sitemap URLs, all on the production host,
  plus the correct sitemap declaration in robots.txt and host in llms.txt.
- A live Chrome review confirmed the brick guide's new illustration loads,
  its section link works, and the desktop document has no horizontal overflow.
  A concrete known-result interaction returned 1 yd³ and 45 80 lb bags for
  9 × 9 ft × 4 in at 0% waste. Metric/imperial round trips preserved the input;
  clearing and restoring a dimension removed and restored the valid result.
- Lighthouse 13.5.0 with Chrome 155.0.8059.80 on Windows audited the public
  homepage: mobile 96/100/100/100 and desktop 99/100/100/100 for Performance,
  Accessibility, Best Practices, and SEO. These are single-run lab results,
  not field measurements. Despite the aggregate accessibility score, the
  unscored `label-content-name-mismatch` audit reported a **serious** issue:
  the example card's aria-label hid its visible text from the link name.
- Removed that overriding label so the existing whole-card link derives its
  accessible name from visible content. The existing rendered test now checks
  the destination and guards against reintroducing an overriding name.
  The complete audit remains **partial pending the follow-up checks**; the
  initial scores alone do not close the milestone gate.

### Mobile layout follow-up

The live follow-up on revision `1c6bf312c3faa05de8ee930b92581cd50dd04d25`
confirmed that the homepage accessible-name issue is fixed. It also reproduced
Performance 92 on several mobile calculators, below the repository's 95 target.
The concrete trace recorded a single 0.1685 layout shift affecting the entire
main element; FCP was 1.1 s, LCP 1.4 s, and TBT 0 ms. The consent panel was
initially absent, then inserted in normal page flow after hydration.

Move the optional analytics panel out of document flow to a fixed bottom
position, with a bounded scrollable height. When someone reopens choices,
focus the panel instead of scrolling the document back to the top. Consent
storage, allow/decline behavior, Clarity loading conditions, and advertising
storage policy are unchanged. Full automated and live checks are pending for
this follow-up; the initial mobile failure is not reclassified as a pass.
