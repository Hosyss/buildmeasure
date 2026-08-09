# Gravel Calculator Specification

## Scope

The first Gravel Calculator estimates a rectangular layer using length, width,
and placed depth. It reports net and allowance-adjusted volume, estimated mass,
short tons, metric tonnes, and complete bags.

The calculator supports Imperial and Metric inputs. It does not claim to model
irregular excavation, slope, field compaction, settlement, or a supplier's
actual aggregate gradation.

## Versions

- Formula version: `1.0.0`
- Engine version: `0.1.0`
- Last reviewed: `2026-08-01`

## Inputs

| Input | Imperial | Metric | Rule |
| --- | --- | --- | --- |
| Length | ft | m | Greater than zero |
| Width | ft | m | Greater than zero |
| Depth | in | cm | Greater than zero |
| Allowance | % | % | 0–50% |
| Bulk density | lb/ft³ | kg/m³ | Greater than zero; user-adjustable |
| Bag weight | lb | kg | Greater than zero |

The example density is `93 lb/ft³`, equivalent to approximately
`1,489.717 kg/m³`. The U.S. Army Corps of Engineers HEC-HMS documentation uses
`93 lb/ft³` (`1,490 kg/m³`) as a default dry density for sand through gravel
and explicitly says it should be changed when another value is more
appropriate. It is a planning example, not a universal gravel property.

Users should prefer the loose or compacted bulk density supplied for the exact
material. ASTM C29/C29M-23 distinguishes bulk density measured in loose and
compacted conditions; the density state should match the volume being
estimated.

## Formula

All internal geometry is converted to meters before calculation.

```text
net volume = length × width × depth
order volume = net volume × (1 + allowance ÷ 100)
estimated mass = order volume × selected bulk density
complete bags = ceil(estimated mass ÷ selected bag weight)
```

The allowance is visible and adjustable. It may be used for installation loss
or a project-specific compaction allowance, but the engine does not silently
choose a compaction factor.

## Exact unit constants

- `1 ft = 0.3048 m`
- `1 in = 0.0254 m`
- `1 lb = 0.45359237 kg`
- `1 short ton = 2,000 lb`
- `1 metric tonne = 1,000 kg`
- `1 yd³ = 0.764554857984 m³`

## Independent known-result vector

For a `10 ft × 10 ft × 4 in` rectangular layer, `10%` allowance,
`93 lb/ft³` bulk density, and `50 lb` bags:

| Result | Expected value |
| --- | ---: |
| Net volume | 33.3333333333 ft³ |
| Net volume | 1.2345679012 yd³ |
| Order volume | 36.6666666667 ft³ |
| Order volume | 1.3580246914 yd³ |
| Estimated mass | 3,410 lb |
| Short tons | 1.705 |
| Metric tonnes | 1.5467499817 |
| Complete 50 lb bags | 69 |

This vector is independently reproducible from the formula above and exact
conversion constants.

## Validation and numeric safety

- Reject empty, zero, negative, `NaN`, and infinite dimensions, density, and
  bag weight.
- Reject allowances outside 0–50%.
- Reject conversion underflow, overflow, non-finite results, and bag counts
  outside JavaScript's safe-integer range.
- Round only complete bag count upward. Do not round volume or mass inside the
  engine.

## Required tests

- Independent known-result vector.
- Metric/Imperial equivalence.
- Allowance changes order volume without changing net volume.
- Exact bag-boundary regression.
- Upward bag rounding.
- Unsupported unit-system rejection.
- Zero, negative, non-finite, underflow, overflow, and unsafe-integer cases.
- Deterministic randomized volume, mass, and procurement invariants.

## Primary references

- ASTM C29/C29M-23, *Standard Test Method for Bulk Density (Unit Weight) and
  Voids in Aggregate*: https://store.astm.org/c0029_c0029m-23.html
- U.S. Army Corps of Engineers, HEC-HMS 4.11, *Watershed Sediment Properties*:
  https://www.hec.usace.army.mil/confluence/hmsdocs/hmsum/4.11/erosion-and-sediment-transport/watershed-sediment-properties
- NIST Handbook 44 (2026), Appendix C, *General Tables of Units of
  Measurement*: https://www.nist.gov/document/2026-nist-handbook-44-appendix-c
