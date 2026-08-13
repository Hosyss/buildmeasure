# Interior Room Paint Calculator Specification

## Record

| Field | Value |
| --- | --- |
| Calculator | Rectangular room walls and optional ceiling |
| Engine version | 0.1.1 |
| Formula version | 1.0.0 |
| Last reviewed | 2026-07-31 |
| Status | Implemented, reference-audited, and covered by automated engine tests |

## Supported input

### Imperial

- Room length, width, and wall height: feet
- Combined door/window deduction: square feet
- Coverage: square feet per U.S. gallon
- Containers: 1 quart, 1 gallon, or 5 gallons

### Metric

- Room length, width, and wall height: meters
- Combined door/window deduction: square meters
- Coverage: square meters per liter
- Containers: 1, 2.5, 5, or 10 liters

Both systems support 1–6 coats, an optional ceiling, and 0–25% extra
allowance.

## Formula

All dimensions are converted to meters and all area to square meters.

```text
wall_area_m2 = 2 × (length_m + width_m) × height_m
ceiling_area_m2 = include_ceiling ? length_m × width_m : 0
gross_area_m2 = wall_area_m2 + ceiling_area_m2
paintable_area_m2 = gross_area_m2 - openings_area_m2
coated_area_m2 = paintable_area_m2 × coats
base_paint_liters = coated_area_m2 / coverage_m2_per_liter
paint_liters = base_paint_liters × (1 + extra_percent / 100)
containers = ceil(paint_liters / selected_container_liters)
```

The engine rejects an opening deduction equal to or larger than the gross
surface. A small relative tolerance prevents equivalent imperial/metric values
from slipping through because of floating-point representation.

## Unit constants

- 1 international foot = 0.3048 meter exactly.
- 1 square foot = 0.09290304 square meter exactly.
- 1 U.S. gallon = 3.785411784 liters.
- 1 U.S. quart = one quarter U.S. gallon.

## Coverage assumption

The initial imperial coverage is 400 ft²/gal. Sherwin-Williams describes
typical gallon coverage as about 350–400 ft² and warns that wall texture and
desired coverage affect the result. The UI requires coverage to remain visible
and editable, and tells the user to use the selected product label.

Container count is a rounding result for the size selected by the user. It is
not a claim that the resulting container combination is the lowest-cost
purchase.

## Primary references

1. Sherwin-Williams, *How Much Paint to Buy*: multiply each wall's height by
   width, add wall areas, subtract large doors/windows, and use product-label
   coverage:
   https://www.sherwin-williams.com/homeowners/color/try-on-colors/color-snap-studio-for-ipad/sw-video-dir-howmuchpaintbuy
2. Sherwin-Williams, *Paint Calculator FAQs*: typical coverage of about
   350–400 ft²/gal:
   https://www.sherwin-williams.com/en-us/color/color-tools/paint-calculator
3. Sherwin-Williams, *Painting FAQs*: coated area divided by product coverage,
   with the warning that theoretical coverage excludes texture and applicator
   loss:
   https://www.sherwin-williams.com/en-us/project-center/faqs/paint-faq
4. NIST Handbook 44 (2026), *Appendix C — General Tables of Units of
   Measurement*:
   https://www.nist.gov/document/2026-nist-handbook-44-appendix-c
5. NIST SP 1038, *The International System of Units — Conversion Factors for
   General Use*:
   https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication1038.pdf

References were checked on 2026-07-31.

## Known scope limits

- Rectangular rooms only.
- One shared color/product coverage for all included surfaces.
- Doors and windows are entered as one measured area.
- No trim, baseboards, cabinets, or exterior geometry.
- No primer calculation yet.
- Actual coverage can change with product, substrate, porosity, texture,
  application method, and painter technique.

## Test cases

The automated suite covers:

- Known wall, opening, coat, and paint-volume result.
- Independent 1,000 ft² ÷ 400 ft²/gal reference vector.
- Optional ceiling area.
- Imperial/metric equivalence.
- Selected-container rounding.
- Exact-container boundary rounding.
- Separation of base volume and extra allowance.
- Invalid dimensions, coats, allowance, and runtime options.
- Underflow, overflow, and unsafe integer quantities.
- Opening deductions that remove every surface.
- 250 deterministic randomized cases with area and purchase invariants.

## Optional purchase cost layer

The quantity engine remains the source of truth and is unchanged by optional
pricing. The interface may multiply the engine's complete purchase-package
count by a user-entered price for that package. No live price, exchange rate,
tax, delivery, labor, discount, or supplier minimum is inferred. Package
definition changes clear the entered price to prevent stale-product pricing.
See [Optional Purchase Cost Estimator](../COST_ESTIMATOR.md).
