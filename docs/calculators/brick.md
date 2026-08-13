# Brick Calculator Specification

## Status

- Engine version: `0.1.0`
- Formula version: `1.0.0`
- Last reviewed: `2026-08-13`
- Route: `/brick-calculator`

## Scope

The current calculator estimates **fired-clay brick quantity** for one
rectangular wall using the Brick Industry Association (BIA) wall-area estimating
method. It supports running-bond or stack-bond quantity planning by multiplying
net wall area by a documented brick coverage rate, then applying an explicit
waste/breakage allowance and rounding the final purchase quantity upward.

The calculator supports BIA Table 4 coverage presets and a custom coverage rate
for a supplier- or project-specific brick. The custom rate is expressed as
brick per 100 square feet in Imperial mode or brick per 10 square meters in
Metric mode.

It does **not** estimate mortar, grout, wall thickness, wythes, structural
capacity, veneer anchorage, reinforcement, foundations, lintels, movement
joints, labor, or code compliance. It does not apply header-bond correction
factors for common, English, Flemish, garden-wall, or other bond patterns.
Those patterns require separate corrections and are outside version 1.0.0.

BIA states that its Technical Notes are based on fired-clay brick and should not
be assumed to apply to concrete brick, fly-ash brick, or other non-clay units.
The current calculator therefore does not claim those materials as supported.

## Inputs

| Input | Imperial | Metric | Validation |
| --- | --- | --- | --- |
| Wall length | feet | meters | finite and greater than zero |
| Wall height | feet | meters | finite and greater than zero |
| Openings area | square feet | square meters | finite, nonnegative, and less than gross wall area |
| Brick coverage rate | brick / 100 ft² | brick / 10 m² | finite and greater than zero |
| Waste / breakage allowance | percent | percent | 0–50 |

The default BIA preset is `Modular`, with `675 brick per 100 ft²` from BIA
Technical Note 10, Table 4. The default allowance is `5%`, matching BIA's
general rule that at least 5% be added to net brick quantities for breakage and
waste. The user can change the allowance because BIA notes that project
conditions or experience may warrant a higher percentage.

## Supported BIA presets

The initial UI exposes a focused subset of Table 4 as convenience presets. The
engine receives a numeric coverage rate and does not depend on the preset name.

| Preset | BIA nominal / designation basis | Brick per 100 ft² |
| --- | --- | ---: |
| Modular | 4 × 2⅔ × 8 in nominal | 675 |
| Engineer Modular | 4 × 3⅕ × 8 in nominal | 563 |
| Closure Modular | 4 × 4 × 8 in nominal | 450 |
| Roman | 4 × 2 × 12 in nominal | 600 |
| Norman | 4 × 2⅔ × 12 in nominal | 450 |
| Utility | 4 × 4 × 12 in nominal | 300 |
| Meridian | 4 × 4 × 16 in nominal | 225 |
| Standard | non-modular Standard designation | 655 |

The BIA table also prints rounded metric rates per 10 m². BuildMeasure stores
one canonical physical rate from the `brick per 100 ft²` value and converts it
with the exact square-foot definition so Imperial and Metric descriptions of
the same wall remain equivalent. The converted display can therefore differ
slightly from BIA's rounded whole-number metric table entry.

## Internal units

All wall areas are normalized to square meters. The exact international foot
(`0.3048 m`) definition is used, so:

```text
1 ft² = 0.09290304 m² exactly
```

A coverage rate entered in Imperial mode is normalized as:

```text
brick per m² = (brick per 100 ft²) ÷ (100 × 0.09290304)
```

A coverage rate entered in Metric mode is normalized as:

```text
brick per m² = (brick per 10 m²) ÷ 10
```

## Quantity formulas

BIA Technical Note 10 describes the wall-area method as multiplying **net wall
area** (gross wall area less openings) by a known material quantity per unit
area.

```text
gross wall area = wall length × wall height
net wall area = gross wall area − openings area
exact net brick = net wall area × brick coverage rate
minimum whole brick = ceil(exact net brick)
order brick = ceil(exact net brick × (1 + waste percent ÷ 100))
```

The exact net count remains unrounded internally. Only whole-piece procurement
quantities are rounded upward. Waste is applied to the unrounded net estimate,
then the final order is rounded upward. This avoids hidden intermediate
rounding while preserving the BIA sequence of net estimate first, waste second.

## Bond-pattern boundary

BIA Table 4 quantities are based on running or stack bond. BIA provides
separate brick correction factors for patterns that incorporate headers. The
current calculator intentionally does not expose those correction factors.
Users planning common bond, English bond, Flemish bond, garden-wall bond, or
another header pattern must obtain a project-specific estimate rather than
assuming this result applies unchanged.

## Openings

The openings input is the combined measured area of doors, windows, or other
areas that will not receive brick. It is subtracted before the brick rate is
applied. The calculator rejects an openings area equal to or larger than the
gross wall area.

The calculator does not add special corner, jamb, sill, arch, or bond-maintenance
pieces. BIA notes that partial brick may be required to maintain bond at corners;
this one-wall area estimate does not claim to model that detailing.

## Waste and breakage

BIA Technical Note 10 states that net brick quantities should be determined
before allowances are added and gives a general rule of **at least 5%** for
brick breakage and waste, while noting that job conditions may justify a higher
percentage. BuildMeasure therefore defaults to 5% but keeps the value explicit
and editable from 0% to 50%.

## Known verification vectors

### BIA Table 4 — Modular brick

For exactly `100 ft²` of net wall area, the Modular preset and `0%` waste:

```text
exact net brick = 100 ft² × 675 / 100 ft² = 675
minimum whole brick = 675
order brick = 675
```

With the same wall and `5%` waste:

```text
order brick = ceil(675 × 1.05) = 709
```

### BIA Table 4 — Standard non-modular brick

For exactly `100 ft²` of net wall area, the Standard preset and `0%` waste:

```text
order brick = 655
```

### Openings vector

For a `20 ft × 8 ft` wall with `16 ft²` of measured openings, Modular coverage,
and `5%` waste:

```text
gross area = 160 ft²
net area = 144 ft²
exact net brick = 144 × 6.75 = 972
order brick = ceil(972 × 1.05) = 1021
```

The equivalent Metric inputs must produce the same net area and brick order
within floating-point tolerance before final whole-brick rounding.

## References

- Brick Industry Association, Technical Note 10,
  [Dimensioning and Estimating Brick Masonry](https://www.gobrick.com/media/file/10-dimensioning-and-estimating-brick-masonry.pdf),
  especially the wall-area method, Table 4, bond-pattern corrections, and
  brick breakage/waste guidance.
- Brick Industry Association,
  [Technical Notes](https://www.gobrick.com/resources/technical-notes), for the
  fired-clay-brick scope warning that the Technical Notes should not be assumed
  to apply to non-clay brick products.
- NIST SP 811, Appendix B,
  [Conversion Factors](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors),
  for exact international foot and related SI conversions.

## Automated verification requirements

The engine test suite must cover:

- The BIA Modular `675 brick / 100 ft²` known vector.
- The BIA Standard `655 brick / 100 ft²` known vector.
- The `20 × 8 ft − 16 ft²` openings vector with 5% waste (`1021 brick`).
- Exact Imperial/Metric equivalence for the same wall and coverage rate.
- Waste applied after net area and exact net brick calculation.
- Upward rounding without adding a brick at exact integer boundaries.
- Zero openings and valid nonzero openings.
- Rejection of openings equal to or larger than gross wall area.
- Rejection of empty/zero/negative/non-finite dimensions and coverage rates.
- Rejection of allowances outside 0–50%.
- Rejection of unsupported runtime unit systems.
- Underflow, overflow, and unsafe whole-brick quantities.
- At least 250 deterministic randomized valid inputs with area, waste, and
  procurement invariants.

## Optional purchase cost layer

The quantity engine is the only source of truth for brick quantity. The UI may
multiply `order brick` by a user-entered price per brick using the existing
optional purchase-cost layer. No live price, exchange rate, tax, delivery,
labor, discount, or supplier minimum is inferred. Changing the selected brick
preset or custom coverage rate clears the entered price to avoid applying a
stale price to a different brick product.

See [Optional Purchase Cost Estimator](../COST_ESTIMATOR.md).
