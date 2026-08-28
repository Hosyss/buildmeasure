# Concrete Wall Calculator Specification

## Record

| Field | Value |
| --- | --- |
| Calculator | Rectangular concrete wall quantity |
| Engine version | 0.1.0 |
| Formula version | 1.0.0 |
| Last reviewed | 2026-08-28 |
| Status | Engine-first implementation |

## Purpose

Estimate concrete volume and complete 40, 60, or 80 lb bag quantities for one or more identical rectangular walls from user-entered wall dimensions and optional measured opening area.

This calculator is a **quantity estimator only**. It does not choose wall length, height, thickness, reinforcement, concrete strength, footing/foundation dimensions, retaining-wall geometry, lateral-load capacity, drainage, waterproofing, formwork design, or any structural/code requirement.

## Supported geometry

### Imperial

- Wall length in feet.
- Wall height in feet.
- Wall thickness in inches.
- Measured opening area per identical wall in square feet.

### Metric

- Wall length in meters.
- Wall height in meters.
- Wall thickness in centimeters.
- Measured opening area per identical wall in square meters.

Both systems support:

- Whole-number quantity of identical walls from 1 through 100,000.
- Optional opening area from 0 up to, but not including, the gross wall face area.
- 0–50% user-entered extra allowance.
- 40, 60, and 80 lb bag yields using the same verified bag-yield source already used by the Concrete Calculator.

## Formula

All physical dimensions are normalized to meters before geometry is calculated.

```text
gross_face_area_m2 = length_m × height_m
net_face_area_m2 = gross_face_area_m2 − openings_area_m2
per_wall_volume_m3 = net_face_area_m2 × thickness_m
net_volume_m3 = per_wall_volume_m3 × quantity
order_volume_m3 = net_volume_m3 × (1 + allowance_percent / 100)
cubic_feet = order_volume_m3 / meters_per_foot³
cubic_yards = order_volume_m3 / meters_per_yard³
liters = order_volume_m3 × 1000
bags = ceil(cubic_feet / selected_bag_yield_ft3)
```

Openings are subtracted before thickness, quantity, allowance, and package rounding are applied. Bag rounding happens once at the final project total.

## Independent known-result vectors

### Vector A — one wall with a measured opening

One 10 ft × 8 ft × 6 in wall with 16 ft² of measured openings and 10% extra allowance:

```text
gross face area = 80 ft²
net face area = 64 ft²
thickness = 0.5 ft
net volume = 32 ft³
order volume = 35.2 ft³ = 1.303703... yd³
80 lb bags at 0.60 ft³ each = 59 bags
```

### Vector B — two metric walls

Two 4 m × 2.5 m × 20 cm walls with 2 m² of measured openings per wall and 5% extra allowance:

```text
gross face area per wall = 10 m²
net face area per wall = 8 m²
volume per wall = 1.6 m³
net project volume = 3.2 m³
order volume = 3.36 m³
```

## Validation

The engine rejects rather than displays misleading output when:

- Runtime unit system is unsupported.
- Length, height, or thickness is missing, zero, negative, non-finite, underflows during normalization, or produces an unsafe numeric result.
- Opening area is negative, non-finite, equal to the gross wall face area, or larger than it.
- Quantity is not a whole number from 1 through 100,000.
- Extra allowance is below 0% or above 50%.
- Bag size is unsupported.
- Final package quantity is non-finite or outside JavaScript safe-integer range.

Equivalent Imperial and Metric descriptions of the same physical wall must agree on volume and procurement quantity.

## References

1. NIST SP 811 Appendix B — exact SI and U.S. customary conversion basis used by BuildNumbers.
2. Sakrete High-Strength Concrete Mix technical data — existing BuildNumbers source for 40, 60, and 80 lb package yields.

References reviewed on 2026-08-28.

## Known scope limits

- Rectangular prismatic concrete walls only in v1.
- Identical repeated walls only when quantity is greater than one.
- Opening input is measured face area per identical wall; no automatic door/window dimension list in v1.
- No curved, tapered, battered, stepped, irregular, hollow, block/CMU, or masonry wall calculation.
- No retaining-wall design or soil/lateral-load calculation.
- No structural sizing, reinforcement, drainage, waterproofing, forms, labor, pumps, delivery, tax, supplier minimum, or ready-mix truck planning.
- Actual order quantities may differ because field dimensions, form tolerances, spillage, supplier rules, and project requirements vary.

## Required automated coverage

Before public UI implementation, the engine suite must cover:

- Vectors A and B above.
- Zero and measured openings.
- Multiple identical walls combined before final bag rounding.
- 0%, 10%, 25%, and 50% allowance behavior.
- Imperial/Metric equivalence.
- Exact whole-bag boundaries.
- Invalid quantity, dimensions, openings, unit systems, bag sizes, and allowances.
- Numeric underflow/overflow and unsafe bag totals.
- At least 500 deterministic randomized valid-input invariants.
