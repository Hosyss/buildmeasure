# Circular Slab Concrete Calculator

## Product scope

BuildNumbers estimates concrete quantity for one or more identical circular slabs, pads, or other full circular pours from dimensions supplied by the user.

It is a **material quantity calculator**, not a structural design tool.

## Inputs

- Measurement system: Imperial or Metric
- Diameter
  - Imperial: feet
  - Metric: meters
- Concrete depth
  - Imperial: inches
  - Metric: centimeters
- Number of identical circular slabs
- Extra allowance: 0–50%
- Bag size: 40 lb, 60 lb, or 80 lb

## Geometry

For diameter `D`, radius is:

`r = D / 2`

Circular plan area:

`A = π × r²`

Concrete volume for one slab:

`V_one = A × depth`

For `n` identical slabs:

`V_net = V_one × n`

After the user-controlled allowance:

`V_order = V_net × (1 + allowance / 100)`

Package count:

`bags = ceil(order volume in ft³ / selected bag yield)`

The complete project volume is combined before bag rounding so identical slabs do not accumulate artificial package-rounding error.

## Unit normalization

The engine normalizes all dimensions to meters before applying geometry.

BuildNumbers uses the shared exact unit constants in `lib/units.ts`, based on NIST SP 811 conversion factors.

## Package yields

The calculator reuses the verified concrete bag-yield constants already used by the core Concrete Calculator:

- 40 lb: 0.30 ft³
- 60 lb: 0.45 ft³
- 80 lb: 0.60 ft³

These are approximate manufacturer-published yields and must be checked against the exact product being purchased.

## Outputs

- Circular plan area
- Concrete volume per slab
- Net concrete volume before allowance
- Order volume after allowance
- Cubic feet
- Cubic yards
- Cubic meters
- Liters
- Complete bags for the selected package size

## Safety boundary

The calculator does **not** choose or verify:

- slab diameter
- slab thickness
- reinforcement
- concrete strength
- subbase or compaction
- frost protection
- edge thickening
- footings or foundations
- load capacity
- joints
- drainage or slope
- local code requirements

Users must supply dimensions from their project information and verify structural, site, product, and regulatory requirements separately.

## Version record

- Engine: `0.1.0`
- Formula: `1.0.0`
- Last reviewed: 2026-08-28
