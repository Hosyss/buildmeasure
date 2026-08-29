# Multi-Shape Concrete Project

## Product scope

BuildNumbers combines multiple concrete geometries into one project-level material quantity while preserving the calculation boundary of each individual shape.

The project engine supports:

- rectangular slabs
- circular slabs / pads
- rectangular footings
- rectangular / square columns
- circular columns
- rectangular concrete walls with measured full-depth openings
- round post holes with optional round or square post displacement

Each part can use Imperial or Metric inputs independently. Every shape is normalized to cubic meters before project aggregation.

## Core accuracy rule

The project engine must **not** add already-rounded bag quantities from individual calculators.

Instead:

1. validate each part using its existing verified geometry engine;
2. calculate each part with zero local allowance;
3. capture the unrounded net concrete volume;
4. sum all part volumes;
5. apply the project allowance once;
6. calculate ready-mix volume and complete bags from the combined project total;
7. round the final package count upward once.

This prevents package-rounding error from accumulating across multiple shapes.

## Project formula

For validated part volumes `V1 ... Vn`:

`V_net = V1 + V2 + ... + Vn`

`V_order = V_net × (1 + project allowance ÷ 100)`

`bags = ceil(order volume in ft³ ÷ selected bag yield)`

## Per-shape unit conventions

The engine deliberately preserves the same input conventions as the standalone calculators.

### Imperial

- rectangular slab: length/width in feet, depth in inches
- circular slab: diameter in feet, depth in inches
- footing: length/width in feet, depth in inches
- columns: height in feet, cross-section dimensions in inches
- wall: length/height in feet, thickness in inches, openings in ft²
- post holes: hole diameter/depth and post size in inches

### Metric

- rectangular slab: length/width in meters, depth in centimeters
- circular slab: diameter in meters, depth in centimeters
- footing: length/width in meters, depth in centimeters
- columns: height in meters, cross-section dimensions in centimeters
- wall: length/height in meters, thickness in centimeters, openings in m²
- post holes: hole diameter/depth and post size in centimeters

## Limits

- 1–100 project parts
- quantity per part: 1–100,000
- project allowance: 0–50%
- part label: single line, 1–80 characters
- supported bag sizes: 40, 60, 80 lb
- safe numeric guards apply to every part, the aggregate volume, and final package count

## Safety boundary

This is a material quantity workflow only. It does not select or validate:

- structural dimensions
- reinforcement
- concrete strength
- soil or bearing conditions
- loads or capacity
- formwork design
- frost protection
- joints
- drainage or slope
- excavation
- local code requirements

Each project part must use dimensions from the project design or other qualified source.

## Version record

- Engine: `0.1.0`
- Formula: `1.0.0`
- Last reviewed: 2026-08-28
