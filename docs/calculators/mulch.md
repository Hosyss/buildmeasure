# Mulch Calculator Specification

## Scope

The first Mulch Calculator estimates a rectangular bed using length, width,
and installed depth. It reports area, net and allowance-adjusted volume,
coverage per selected bag, and the complete number of bags required.

The calculator supports Imperial and Metric inputs. It does not model irregular
boundaries, settled or decomposed material, slopes, compaction, or the amount of
existing mulch already in place.

## Versions

- Formula version: `1.0.0`
- Engine version: `0.1.0`
- Last reviewed: `2026-08-01`

## Inputs

| Input | Imperial | Metric | Rule |
| --- | --- | --- | --- |
| Length | ft | m | Greater than zero |
| Width | ft | m | Greater than zero |
| Installed depth | in | cm | Greater than zero |
| Project allowance | % | % | 0–50% |
| Bag volume | ft³ | L | Greater than zero; user-entered |

The example depth is `3 in`. U.S. EPA WaterSense guidance says three to four
inches provides suitable coverage for most plants, while also warning that
excessive mulch can restrict water flow. This guidance is contextual only: the
engine uses the depth entered by the user and does not choose a horticultural
depth automatically.

The user should enter the exact net volume printed on the mulch bag. Mulch type,
particle size, moisture, and settling do not need a density assumption when the
material is purchased and estimated by volume.

## Formula

All internal geometry is converted to meters before calculation.

```text
area = length × width
net volume = area × installed depth
order volume = net volume × (1 + allowance ÷ 100)
coverage per bag = bag volume ÷ installed depth
complete bags = ceil(order volume ÷ bag volume)
```

The allowance is visible and adjustable. Only the complete-bag procurement
quantity is rounded upward; area and volume are not rounded in the engine.

## Exact unit constants

- `1 ft = 0.3048 m`
- `1 in = 0.0254 m`
- `1 ft³ = 0.028316846592 m³`
- `1 ft³ = 28.316846592 L`
- `1 yd³ = 0.764554857984 m³`
- `1 m³ = 1,000 L`

## Independent known-result vector

For a `20 ft × 10 ft × 3 in` rectangular bed, `10%` allowance, and
`2 ft³` bags:

| Result | Expected value |
| --- | ---: |
| Area | 200 ft² |
| Net volume | 50 ft³ |
| Net volume | 1.85185185185 yd³ |
| Order volume | 55 ft³ |
| Order volume | 2.03703703704 yd³ |
| Coverage per bag at 3 in | 8 ft² |
| Complete 2 ft³ bags | 28 |

This vector is independently reproducible from the formula above and exact
conversion constants.

## Validation and numeric safety

- Reject empty, zero, negative, `NaN`, and infinite dimensions and bag volume.
- Reject allowances outside 0–50%.
- Reject conversion underflow, overflow, non-finite results, and bag counts
  outside JavaScript's safe-integer range.
- Round only complete bag count upward. Do not round area or volume inside the
  engine.

## Required tests

- Independent known-result vector.
- Metric/Imperial equivalence.
- Allowance changes order volume without changing net volume.
- Bag size changes bag count and per-bag coverage without changing bed volume.
- Installed depth changes coverage per bag.
- Exact bag-boundary regression and upward bag rounding.
- Unsupported unit-system rejection.
- Zero, negative, non-finite, underflow, overflow, and unsafe-integer cases.
- Deterministic randomized volume and procurement invariants.

## Primary references

- U.S. Environmental Protection Agency WaterSense, *Landscaping Tips*:
  https://www.epa.gov/watersense/landscaping-tips
- NIST Handbook 44 (2026), Appendix C, *General Tables of Units of
  Measurement*:
  https://www.nist.gov/publications/nist-handbook-44-specifications-tolerances-and-other-technical-requirements-weighing-18

## Optional purchase cost layer

The quantity engine remains the source of truth and is unchanged by optional
pricing. The interface may multiply the engine's complete purchase-package
count by a user-entered price for that package. No live price, exchange rate,
tax, delivery, labor, discount, or supplier minimum is inferred. Package
definition changes clear the entered price to prevent stale-product pricing.
See [Optional Purchase Cost Estimator](../COST_ESTIMATOR.md).
