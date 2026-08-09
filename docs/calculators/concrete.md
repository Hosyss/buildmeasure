# Concrete Slab Calculator Specification

## Record

| Field | Value |
| --- | --- |
| Calculator | Rectangular concrete slab |
| Engine version | 0.1.1 |
| Formula version | 1.0.0 |
| Last reviewed | 2026-07-31 |
| Status | Implemented, reference-audited, and covered by automated engine tests |

## Supported input

### Imperial

- Length: feet
- Width: feet
- Thickness: inches

### Metric

- Length: meters
- Width: meters
- Thickness: centimeters

The waste allowance accepts 0% through 50%. Supported bag estimates are 40,
60, and 80 lb.

## Formula

All input dimensions are first converted to meters.

```text
net_volume_m3 = length_m × width_m × thickness_m
order_volume_m3 = net_volume_m3 × (1 + waste_percent / 100)
```

Output conversions:

```text
cubic_feet = order_volume_m3 / 0.3048³
cubic_yards = order_volume_m3 / 0.9144³
liters = order_volume_m3 × 1000
bags = ceil(cubic_feet / published_bag_yield_ft3)
```

## Exact unit constants

- 1 international foot = 0.3048 meter exactly.
- 1 international yard = 0.9144 meter exactly.
- 1 inch = 0.0254 meter exactly.
- 27 cubic feet = 1 cubic yard.
- 1 cubic meter = 1,000 liters.

## Bag yield assumptions

The engine uses manufacturer-published Sakrete High-Strength Concrete Mix
yields:

- 40 lb bag: 0.30 ft³
- 60 lb bag: 0.45 ft³
- 80 lb bag: 0.60 ft³

These yields are approximate and product-specific. The interface tells the user
to confirm yield and order increments with the selected supplier.

## Primary references

1. NIST, *Guide to the SI, Appendix B: Conversion Factors*:
   https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors
2. NIST Handbook 44 (2026), *Appendix C — General Tables of Units of
   Measurement*:
   https://www.nist.gov/document/2026-nist-handbook-44-appendix-c
3. Sakrete, *High-Strength Concrete Mix* product technical information:
   https://www.sakrete.com/product/high-strength-concrete-mix/

References were checked on 2026-07-31.

## Known scope limits

- Rectangular slabs only.
- No footings, columns, walls, stairs, tubes, or irregular shapes yet.
- No structural design or mix-design advice.
- Bag quantity is a material estimate, not a purchase guarantee.
- Supplier order increments are not rounded automatically.

## Test cases

The automated suite covers:

- Known imperial slab volume.
- Known metric slab volume.
- Waste application.
- Bag rounding for every supported size.
- Exact-yield boundary rounding.
- Imperial/metric equivalence.
- Unsupported runtime options.
- Zero, negative, non-finite, underflow, overflow, and unsafe integer inputs.
- Regression guard that waste never changes net volume.
- 250 deterministic randomized cases with volume and procurement invariants.
