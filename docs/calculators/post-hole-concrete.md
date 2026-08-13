# Post-Hole Concrete Calculator Specification

## Record

| Field | Value |
| --- | --- |
| Calculator | Round post-hole concrete quantity |
| Engine version | 0.1.0 |
| Formula version | 1.0.0 |
| Last reviewed | 2026-08-13 |
| Status | Engine candidate; not released until the full major-milestone QA gate passes |

## Purpose

Estimate the concrete volume and 40/60/80 lb bag quantity for one or more round
holes from user-entered geometry. The calculator is a material estimator only.
It does not select a safe hole diameter, embedment depth, footing design, or
structural post size.

## Supported input

### Imperial

- Hole diameter: inches
- Concrete depth: inches
- Optional post diameter or square side: inches

### Metric

- Hole diameter: centimeters
- Concrete depth: centimeters
- Optional post diameter or square side: centimeters

Other inputs:

- Whole-number hole count greater than zero.
- Optional post displacement: none, round, or square.
- Waste allowance: 0% through 50%.
- Bag size: 40, 60, or 80 lb.

When post displacement is enabled, version 1.0.0 assumes the post occupies the
full entered concrete depth. If the real geometry differs, the user should leave
post displacement off or use dimensions that match the actual concrete-filled
geometry.

## Formula

All dimensions are first converted to meters.

```text
hole_radius_m = hole_diameter_m / 2
gross_per_hole_m3 = pi × hole_radius_m² × concrete_depth_m
```

Optional displacement:

```text
round_post_area_m2 = pi × (post_diameter_m / 2)²
square_post_area_m2 = post_side_m²
post_displacement_per_hole_m3 = post_area_m2 × concrete_depth_m
```

Concrete quantity:

```text
net_per_hole_m3 = gross_per_hole_m3 - post_displacement_per_hole_m3
total_net_m3 = net_per_hole_m3 × hole_count
order_m3 = total_net_m3 × (1 + waste_percent / 100)
```

Output conversions and procurement:

```text
cubic_feet = order_m3 / 0.3048³
cubic_yards = order_m3 / 0.9144³
liters = order_m3 × 1000
bags = ceil(cubic_feet / published_bag_yield_ft3)
```

Procurement rounding uses the shared BuildMeasure safe-ceiling helper so a
floating-point artifact at an exact bag-yield boundary does not add a bag.

## Fit validation

- A round post diameter must be smaller than the round hole diameter.
- A square post must geometrically fit inside the round hole; its diagonal may
  not exceed the hole diameter.
- The calculator does not infer clearance or structural requirements. Passing
  the geometry check only means the entered shapes can fit mathematically.

## Exact unit constants

- 1 international foot = 0.3048 meter exactly.
- 1 inch = 0.0254 meter exactly.
- 1 international yard = 0.9144 meter exactly.
- 27 cubic feet = 1 cubic yard.
- 1 cubic meter = 1,000 liters.

## Bag yield assumptions

The engine reuses the same manufacturer-published Sakrete High-Strength
Concrete Mix yields as the slab calculator:

- 40 lb bag: 0.30 ft³
- 60 lb bag: 0.45 ft³
- 80 lb bag: 0.60 ft³

These yields are approximate and product-specific. The final interface must tell
the user to confirm the selected product's current yield and purchase increments.

## Independent known-result vector

For one 12 in diameter round hole with 24 in of concrete depth, no post
displacement, and no allowance:

```text
radius = 0.5 ft
depth = 2 ft
volume = pi × 0.5² × 2 = 1.5707963268 ft³
cubic yards = 1.5707963268 / 27 = 0.0581776417 yd³
80 lb bags = ceil(1.5707963268 / 0.60) = 3 bags
```

For four identical holes with 10% allowance:

```text
net = 4 × 1.5707963268 = 6.2831853072 ft³
order = 6.2831853072 × 1.10 = 6.9115038379 ft³
80 lb bags = ceil(6.9115038379 / 0.60) = 12 bags
```

## Primary references

1. NIST, *Guide to the SI, Appendix B: Conversion Factors*:
   https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors
2. NIST Handbook 44 (2026), *Appendix C — General Tables of Units of Measurement*:
   https://www.nist.gov/document/2026-nist-handbook-44-appendix-c
3. Sakrete, *High-Strength Concrete Mix* technical information:
   https://www.sakrete.com/product/high-strength-concrete-mix/

Geometry uses the standard cylinder and square-prism volume formulas. No
structural-design rule is encoded.

## Known scope limits

- Round holes only.
- Optional displacement supports one centered round or square post per hole.
- Post displacement assumes the post occupies the full concrete depth.
- No soil, frost-line, wind-load, fence-height, footing, reinforcement, or code
  design advice.
- No dry-pour, mixing, curing, or installation instructions.
- Bag quantity is a material estimate, not a purchase guarantee.

## Automated test coverage required before release

- Independent cylindrical-volume vectors.
- Hole-count multiplication.
- Round and square post displacement.
- Imperial/metric equivalence.
- Allowance applied only after net geometry.
- 40/60/80 lb bag rounding.
- Exact bag-yield boundary behavior.
- Invalid and fractional hole counts.
- Invalid dimensions, post shapes, post fit, allowance, units, and bag sizes.
- Numeric underflow/overflow safety.
- Deterministic randomized geometry and procurement invariants.

## Optional purchase cost layer

The quantity engine remains the source of truth and is unchanged by optional
pricing. The interface may multiply the engine's complete purchase-package
count by a user-entered price for that package. No live price, exchange rate,
tax, delivery, labor, discount, or supplier minimum is inferred. Package
definition changes clear the entered price to prevent stale-product pricing.
See [Optional Purchase Cost Estimator](../COST_ESTIMATOR.md).
