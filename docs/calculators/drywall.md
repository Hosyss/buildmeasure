# Drywall Calculator Specification

## Record

| Field | Value |
| --- | --- |
| Calculator | Rectangular room drywall sheet quantity |
| Engine version | 0.1.0 |
| Formula version | 1.0.0 |
| Last reviewed | 2026-08-13 |
| Status | Specification locked before engine/UI implementation |

## Purpose

Estimate the number of whole gypsum-board / drywall panels needed to cover the
walls of one rectangular room, with an optional rectangular ceiling, a measured
combined openings deduction, an explicit waste allowance, and an exact panel
size supplied by the selected preset or the user.

This is an **area-based quantity estimator**, not a panel-layout optimizer. It
must not imply that every offcut can be reused or that the calculated sheet
count guarantees a workable seam, joint, orientation, or fastening layout.

## Supported input

### Imperial

- Room length: feet
- Room width: feet
- Wall height: feet
- Combined door/window/opening deduction: square feet
- Panel width: feet
- Panel length: feet

### Metric

- Room length: meters
- Room width: meters
- Wall height: meters
- Combined door/window/opening deduction: square meters
- Panel width: meters
- Panel length: meters

Both systems support:

- Walls always included.
- Optional ceiling.
- 0–50% user-entered waste allowance.
- Default waste allowance: **0%**. The USG Sheetrock Wallboard Estimator
  explicitly states that its estimate does not include a waste allowance, so
  BuildMeasure does not invent a hidden default.
- Optional price per complete sheet through the existing isolated purchase-cost
  layer.

## UI panel presets

USG product data documents 48 in. wide Sheetrock panels in lengths from 8 to 12
ft. The first UI may therefore offer these convenience presets:

- 4 ft × 8 ft — 32 ft² per panel.
- 4 ft × 10 ft — 40 ft² per panel.
- 4 ft × 12 ft — 48 ft² per panel.
- Custom / supplier panel size.

The engine itself must not depend on preset names. It receives the physical
panel width and length, which keeps supplier-specific or regional panel sizes
possible without changing the formula.

When Metric is selected, the physical preset dimensions are converted exactly
rather than rounded into a different nominal product:

- 4 ft = 1.2192 m.
- 8 ft = 2.4384 m.
- 10 ft = 3.048 m.
- 12 ft = 3.6576 m.

A user with a different metric product should choose Custom and enter the exact
product-label dimensions.

## Formula

All dimensions are normalized to meters and all areas to square meters.

```text
wall_area_m2 = 2 × (room_length_m + room_width_m) × wall_height_m
ceiling_area_m2 = include_ceiling ? room_length_m × room_width_m : 0
gross_area_m2 = wall_area_m2 + ceiling_area_m2
net_area_m2 = gross_area_m2 - openings_area_m2
panel_area_m2 = panel_width_m × panel_length_m
exact_net_panels = net_area_m2 / panel_area_m2
minimum_whole_panels = ceil(exact_net_panels)
adjusted_area_m2 = net_area_m2 × (1 + waste_percent / 100)
exact_order_panels = adjusted_area_m2 / panel_area_m2
order_panels = ceil(exact_order_panels)
```

Procurement rounding is upward and happens only at the final whole-panel
boundary. Internal area and exact panel quantities retain full numeric
precision.

## Validation

The engine must reject rather than display misleading output when:

- Room length, width, or wall height is missing, zero, negative, non-finite,
  underflows during normalization, or produces an unsafe numeric result.
- The openings deduction is negative or is equal to / greater than the gross
  included surface area.
- Panel width or panel length is missing, zero, negative, non-finite, or
  produces an invalid/unsafe panel area.
- Waste is below 0% or above 50%.
- The exact or rounded panel quantity is non-finite or exceeds the JavaScript
  safe-integer range.
- A runtime unit system is unsupported.

Equivalent Imperial and Metric descriptions of the same physical room and
panel must agree on net area and final whole-panel count.

## Independent known-result vectors

### Vector A — exact 10-panel wall boundary

One 10 ft × 10 ft rectangular room, 8 ft wall height, walls only, no openings,
4 ft × 8 ft panels, and 0% waste:

```text
wall area = 2 × (10 + 10) × 8 = 320 ft²
panel area = 4 × 8 = 32 ft²
exact panels = 320 / 32 = 10
order panels = 10
```

This exact boundary must not add an eleventh panel.

### Vector B — walls + ceiling + measured openings

One 12 ft × 12 ft room, 8 ft wall height, ceiling included, 24 ft² measured
openings, 4 ft × 8 ft panels, and 0% waste:

```text
wall area = 2 × (12 + 12) × 8 = 384 ft²
ceiling area = 12 × 12 = 144 ft²
gross area = 528 ft²
net area = 528 - 24 = 504 ft²
exact panels = 504 / 32 = 15.75
order panels = 16
```

The 24 ft² opening is a calculation input, not a claimed standard door/window
size.

### Vector C — explicit 10% waste on Vector B

```text
adjusted area = 504 × 1.10 = 554.4 ft²
exact order panels = 554.4 / 32 = 17.325
order panels = 18
```

### Vector D — exact waste boundary

Vector A with 10% waste:

```text
adjusted area = 320 × 1.10 = 352 ft²
exact order panels = 352 / 32 = 11
order panels = 11
```

The exact boundary must not add a twelfth panel.

## Primary references

1. USG, **Sheetrock® Wallboard Estimator** — estimates wallboard from area to be
   covered and selected panel size and explicitly states that its estimate does
   not include an allowance for waste:
   https://assemblies-tools.usg.com/content/usgcom/en/resource-center/tools/sheetrockestimator.html
2. USG, **Sheetrock® Brand Gypsum Panels** — product data lists 48 in. wide
   panels with lengths from 8 to 12 ft and compliance with ASTM C1396 for the
   documented products:
   https://www.usg.com/en-US/p/product/sheetrock-brand-gypsum-panels-141010
3. NIST SP 811 Appendix B, **Conversion Factors** — exact SI / customary-unit
   conversion basis used by BuildMeasure:
   https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors

References reviewed on 2026-08-13.

## Known scope limits

- One rectangular room only.
- Walls are always included; ceiling is optional.
- Openings are entered as one measured combined area.
- Area-based sheet count only; no cut-plan, seam, orientation, stud-spacing, or
  offcut-reuse optimization.
- No screw, nail, tape, joint compound, corner bead, adhesive, primer, framing,
  or labor estimate in v1.
- No recommendation of drywall thickness, fire rating, moisture resistance,
  sound-control assembly, fastening schedule, or code-compliant construction.
- No assumption that a 4 × 8, 4 × 10, or 4 × 12 panel is correct for the
  project; presets are convenience dimensions only.
- Actual purchase quantity can be higher because of layout, breakage, handling,
  product availability, required board orientation, multiple layers, project
  detailing, and supplier/package rules.

## Required automated coverage

Before UI implementation the engine suite must cover:

- Vectors A–D above.
- Optional ceiling isolation.
- Openings subtraction before waste.
- 0%, 10%, 25%, and 50% waste.
- Custom panel dimensions.
- Imperial/Metric equivalence.
- Exact upward-rounding boundaries.
- Missing, zero, negative, non-finite, underflow, overflow, and unsafe inputs.
- Openings that consume the entire included surface.
- Unsupported runtime unit system.
- At least 250 deterministic randomized valid-input invariants for geometry,
  waste sequencing, and procurement rounding.

## Optional purchase cost layer

The quantity engine remains the source of truth. The UI may multiply
`order_panels` by a user-entered price per sheet using the existing shared cost
helper. Changing the selected/custom physical panel size clears a stale price;
a
measurement-system conversion that preserves the same physical panel does not.
No live price, currency conversion, tax, delivery, labor, discount, or supplier
minimum is inferred.
