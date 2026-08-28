# Footing Concrete Calculator Specification

## Record

| Field | Value |
| --- | --- |
| Calculator | Rectangular footing concrete quantity |
| Engine version | 0.1.0 |
| Formula version | 1.0.0 |
| Last reviewed | 2026-08-28 |
| Status | Engine-first implementation |

## Purpose

Estimate concrete volume and complete 40, 60, or 80 lb bag quantities for one or more identical rectangular footings from user-entered physical dimensions.

This calculator is a **quantity estimator only**. It does not choose footing width, depth, reinforcement, bearing area, frost depth, embedment, concrete strength, or any structural/code requirement.

## Supported input

### Imperial

- Footing length: feet
- Footing width: feet
- Footing depth: inches
- Quantity: whole number of identical footings

### Metric

- Footing length: meters
- Footing width: meters
- Footing depth: centimeters
- Quantity: whole number of identical footings

Both systems support:

- 0–50% user-entered extra allowance.
- Default extra allowance: 0%.
- 40, 60, and 80 lb bag yields using the same verified bag-yield source already used by the Concrete Calculator.

## Formula

All physical dimensions are normalized to meters before volume is calculated.

```text
per_footing_volume_m3 = length_m × width_m × depth_m
net_volume_m3 = per_footing_volume_m3 × quantity
order_volume_m3 = net_volume_m3 × (1 + allowance_percent / 100)
cubic_feet = order_volume_m3 / meters_per_foot³
cubic_yards = order_volume_m3 / meters_per_yard³
liters = order_volume_m3 × 1000
bags = ceil(cubic_feet / selected_bag_yield_ft3)
```

Bag rounding happens once, at the final total-project quantity. The calculator does not round each footing independently and multiply rounded bag counts.

## Validation

The engine rejects rather than displays misleading output when:

- Length, width, or depth is missing, zero, negative, non-finite, underflows during normalization, or produces an unsafe numeric result.
- Quantity is not a whole number from 1 through 100,000.
- Extra allowance is below 0% or above 50%.
- Bag size is unsupported.
- Final bag quantity is non-finite or outside JavaScript safe-integer range.
- Runtime unit system is unsupported.

Equivalent Imperial and Metric descriptions of the same physical footings must agree on net volume and procurement quantity.

## Independent known-result vectors

### Vector A — one rectangular footing

10 ft × 2 ft × 8 in:

```text
volume = 10 × 2 × (8 / 12) = 13.3333333333 ft³
cubic yards = 13.3333333333 / 27 = 0.4938271605 yd³
80 lb bags at 0.60 ft³ each = ceil(22.2222...) = 23 bags
```

### Vector B — three identical footings

Three 10 ft × 2 ft × 8 in footings:

```text
net volume = 13.3333333333 × 3 = 40 ft³
80 lb bags = ceil(40 / 0.60) = 67 bags
```

The total is calculated before package rounding.

### Vector C — metric

Two 4 m × 0.6 m × 25 cm footings:

```text
per footing = 4 × 0.6 × 0.25 = 0.6 m³
net volume = 0.6 × 2 = 1.2 m³
```

## References

1. NIST SP 811 Appendix B — exact SI and U.S. customary conversion basis used by BuildNumbers.
2. Sakrete High-Strength Concrete Mix technical data — existing BuildNumbers source for 40, 60, and 80 lb package yields.

References reviewed on 2026-08-28.

## Known scope limits

- Identical rectangular footings only.
- No stepped, trapezoidal, circular, combined, or irregular footing geometry in v1.
- No excavation estimate.
- No structural sizing or code recommendation.
- No reinforcement, forms, labor, delivery, tax, supplier minimum, or ready-mix truck planning.
- Actual order quantities may differ because field dimensions, spillage, subgrade variation, supplier rules, and project requirements vary.

## Required automated coverage

Before public UI implementation, the engine suite must cover:

- Vectors A–C above.
- Multiple-footing sequencing before final bag rounding.
- 0%, 10%, 25%, and 50% allowance behavior.
- Imperial/Metric equivalence.
- Exact whole-bag boundaries.
- Invalid quantity, dimensions, unit systems, bag sizes, and allowances.
- Numeric underflow/overflow and unsafe bag totals.
- At least 250 deterministic randomized valid-input invariants.
