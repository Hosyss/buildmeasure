# Calculator Verification Record

## Audit record

| Field | Value |
| --- | --- |
| Audit date | 2026-08-01 |
| Product release | 0.5.0 anonymous-usage monitoring release |
| Engines reviewed | Concrete 0.1.1, Paint 0.1.1, Tile 0.1.1, Gravel 0.1.0, Mulch 0.1.0 |
| Formula versions | 1.0.0 |
| Scope | Formula, conversion, rounding, validation, and numeric safety |

This record documents what was checked. It is not a certification and does not
remove the need to confirm product yield, coverage, site conditions, or order
increments with the relevant supplier or professional.

## Primary-source checks

| Calculator | Checked assumption | Primary source |
| --- | --- | --- |
| Concrete | 40, 60, and 80 lb yields of 0.30, 0.45, and 0.60 ft³ | Sakrete High-Strength Concrete Mix technical data |
| Paint | Typical 350–400 ft²/gal coverage and area ÷ product coverage method | Sherwin-Williams Paint Calculator FAQ and Painting FAQ |
| Tile | Upward area rounding, adjustable additional stock, and project-specific grout joints | American Olean/Daltile pattern guide, Daltile FAQ, and TCNA grout FAQ |
| Gravel | Loose/compacted bulk-density distinction and dry planning-density example | ASTM C29/C29M-23 and USACE HEC-HMS 4.11 |
| Mulch | Contextual 3–4 in depth guidance while keeping the entered depth user-controlled | U.S. EPA WaterSense Landscaping Tips |
| Shared units | International length, area, volume, and U.S. liquid-volume conversions | NIST SP 811 and Handbook 44 (2026), Appendix C |

The calculator specifications contain the direct source links and explain where
published values are approximate or product-specific.

## Independent known-result vectors

| Calculator | Input | Hand result guarded by test |
| --- | --- | --- |
| Concrete | 9 ft × 9 ft × 4 in, 0% waste, 80 lb bags | 27 ft³ = 1 yd³ = 45 bags at 0.60 ft³/bag |
| Paint | 1,000 ft², one coat, 400 ft²/US gal, 0% extra | 2.5 US gal; 3 one-gallon containers |
| Tile | 12 ft × 10 ft, 12 in × 12 in tile, 10% waste, 10/box | 120 exact tiles; 132 ordered; 14 boxes; 140 purchased |
| Gravel | 10 ft × 10 ft × 4 in, 10% allowance, 93 lb/ft³, 50 lb bags | 1.3580246914 yd³ ordered; 3,410 lb; 1.705 short tons; 69 bags |
| Mulch | 20 ft × 10 ft × 3 in, 10% allowance, 2 ft³ bags | 55 ft³ = 2.03703703704 yd³ ordered; 8 ft² per bag; 28 bags |

These vectors are calculated independently in the tests rather than copied
from an engine result.

## Numeric-safety policy

- Inputs must be finite and inside each calculator's documented domain.
- Converted dimensions and every reported result must remain finite.
- Positive dimensions that underflow to zero are rejected.
- Whole-unit purchase and layout counts must remain JavaScript safe integers.
- Upward rounding removes only microscopic floating-point artifacts at an
  integer boundary; a material fraction above that boundary still rounds up.
- Procurement quantities remain unrounded until the documented whole-unit or
  full-container step.

## Automated coverage

The 81-test unit and engine suite includes known-result, unit-equivalence,
validation, exact-boundary, underflow, overflow, unsafe-integer, deterministic
randomized, feedback-validation, and regression cases. Shared saved-history
tests cover malformed data, fixed limits, and unique IDs. Anonymous analytics
tests cover allowed fields, event types, session shape, route shape, and length
bounds. The 14-test rendered suite checks the homepage, all five calculators,
feedback, analytics, and health APIs,
launch content, structured content, security headers, robots metadata, sitemap
URLs, and internal-page link resolution.

The v0.4.0 launch-hardening release also completed the manual interaction checklist for every
calculator at desktop, exact 360 px, and exact 768 px widths. The detailed
manual and Lighthouse evidence is recorded in `docs/AUDITS.md`; the reusable
checklist remains in `docs/QA.md`.

The public v0.4.1 release added exact SHA-256 CSP allowlist hashes for every
inline application bootstrap script. Its post-fix automated suite and complete
12-run homepage/calculator Lighthouse matrix passed. External production checks
recorded 100 in every PageSpeed category on mobile and desktop and an A+
115/100 MDN HTTP Observatory result. These are lab and header-audit results;
real-user field data and independent usability review remain separate evidence.

The v0.4.2 search-operations release added the permanent Google ownership
artifact, completed Search Console ownership verification, submitted the XML
sitemap, and confirmed through live inspection that the public homepage is
available to Google and eligible for indexing. A later manual indexing request
hit Google's daily quota, so no successful manual request is claimed. Firefox
and WebKit execution was also attempted, but the audit container could not
launch them because of sandbox and missing-system-library restrictions; no
compatibility pass is claimed for those engines.

The v0.5.0 monitoring release added an owner-only analytics dashboard and
first-party anonymous interaction events. Automated page requests do not count
as engaged sessions; that metric requires an actual calculator field or setting
change. The event log excludes IP addresses, names, email addresses, raw
user-agent strings, and persistent analytics cookies, and its records expire
after 90 days. The production health surface now checks both feedback and
analytics storage.

## Known limits

- Concrete supports rectangular slabs only and uses approximate,
  product-specific bag yields.
- Paint supports one rectangular room, a single product coverage rate, and a
  combined measured opening deduction.
- Tile supports one rectangular surface and an area-based order. Its layout
  grid does not optimize cut-piece reuse.
- Gravel supports one rectangular layer. Mass and bag results depend on the
  selected bulk density and packaged weight; compaction is not modeled silently.
- Mulch supports one rectangular bed. It does not model irregular borders,
  settling, existing material, or horticultural suitability for a specific site.
- None of the calculators replaces structural design, product instructions,
  site measurement, or professional judgment.
