# Column Concrete Calculator Specification

## Record

| Field | Value |
| --- | --- |
| Calculator | Rectangular and circular column concrete quantity |
| Engine version | 0.1.0 |
| Formula version | 1.0.0 |
| Last reviewed | 2026-08-28 |
| Status | Engine-first implementation |

## Purpose

Estimate concrete volume and complete 40, 60, or 80 lb bag quantities for one or more identical vertical columns from user-entered physical dimensions.

This calculator is a **quantity estimator only**. It does not choose column width, depth, diameter, height, reinforcement, concrete strength, load capacity, slenderness limits, footing size, connection details, formwork design, or any structural/code requirement.

## Supported geometry

### Rectangular or square column

- Imperial: height in feet; width and depth in inches.
- Metric: height in meters; width and depth in centimeters.

### Circular column

- Imperial: height in feet; diameter in inches.
- Metric: height in meters; diameter in centimeters.

Both shapes support:

- Whole-number quantity of identical columns from 1 through 100,000.
- 0–50% user-entered extra allowance.
- 40, 60, and 80 lb bag yields using the same verified bag-yield source already used by the Concrete Calculator.

## Formula

All physical dimensions are normalized to meters before geometry is calculated.

### Rectangular

```text
cross_section_m2 = width_m × depth_m
per_column_volume_m3 = cross_section_m2 × height_m
```

### Circular

```text
cross_section_m2 = π × (diameter_m / 2)²
per_column_volume_m3 = cross_section_m2 × height_m
```

### Shared project totals

```text
net_volume_m3 = per_column_volume_m3 × quantity
order_volume_m3 = net_volume_m3 × (1 + allowance_percent / 100)
cubic_feet = order_volume_m3 / meters_per_foot³
cubic_yards = order_volume_m3 / meters_per_yard³
liters = order_volume_m3 × 1000
bags = ceil(cubic_feet / selected_bag_yield_ft3)
```

Bag rounding happens once, after all identical columns and the allowance are combined.

## Independent known-result vectors

### Vector A — three 12 in × 12 in rectangular columns

Three columns, each 12 in × 12 in × 10 ft, with 10% extra allowance:

```text
per column = 10 ft³
net = 30 ft³
order = 33 ft³ = 1.222222... yd³
80 lb bags at 0.60 ft³ each = 55 bags
```

### Vector B — two circular metric columns

Two columns, each 30 cm diameter × 3 m high, with 5% extra allowance:

```text
per column = π × 0.15² × 3 = 0.2120575041 m³
net = 0.4241150082 m³
order = 0.4453207586 m³
80 lb bags = 27
```

## Validation

The engine rejects rather than displays misleading output when:

- Runtime unit system or column shape is unsupported.
- Height is missing, zero, negative, non-finite, underflows during normalization, or produces an unsafe numeric result.
- Rectangular width/depth is invalid when rectangular geometry is selected.
- Circular diameter is invalid when circular geometry is selected.
- Quantity is not a whole number from 1 through 100,000.
- Extra allowance is below 0% or above 50%.
- Bag size is unsupported.
- Final package quantity is non-finite or outside JavaScript safe-integer range.

Equivalent Imperial and Metric descriptions of the same physical column must agree on volume and procurement quantity.

## References

1. NIST SP 811 Appendix B — exact SI and U.S. customary conversion basis used by BuildNumbers.
2. Sakrete High-Strength Concrete Mix technical data — existing BuildNumbers source for 40, 60, and 80 lb package yields.

References reviewed on 2026-08-28.

## Known scope limits

- Identical vertical prismatic columns only.
- Rectangular/square and circular cross-sections only in v1.
- No tapered, flared, hollow, composite, irregular, or sloped columns.
- No structural sizing or code recommendation.
- No reinforcement, forms, labor, pump, delivery, tax, supplier minimum, or ready-mix truck planning.
- Actual order quantities may differ because field dimensions, spillage, form tolerances, supplier rules, and project requirements vary.

## Required automated coverage

Before public UI implementation, the engine suite must cover:

- Vectors A and B above.
- Rectangular and circular geometry.
- Multiple-column sequencing before final bag rounding.
- 0%, 10%, 25%, and 50% allowance behavior.
- Imperial/Metric equivalence.
- Exact whole-bag boundaries.
- Invalid quantity, dimensions, shape, unit systems, bag sizes, and allowances.
- Numeric underflow/overflow and unsafe bag totals.
- At least 500 deterministic randomized valid-input invariants across both shapes.
