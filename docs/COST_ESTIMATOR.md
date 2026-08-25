# Optional Purchase Cost Estimator

## Purpose

BuildNumbers may add an optional material-cost layer after a calculator has
already produced its verified purchase quantity. The cost layer must never
change geometry, material quantity, allowance, unit conversion, package
rounding, or any calculator engine result.

## Version 1 scope

Version 1 prices only the complete purchase package already returned by each
calculator:

| Calculator | Purchase quantity priced |
| --- | --- |
| Concrete slab | Selected 40/60/80 lb concrete bag |
| Post-hole concrete | Selected 40/60/80 lb concrete bag |
| Paint | Selected can/pail container |
| Tile | Complete box |
| Gravel | User-defined bag weight |
| Mulch | User-defined bag volume |

Bulk ready-mix, truck delivery, pallets, mixed package optimization, labor,
tax, delivery fees, discounts, supplier minimums, and exchange-rate conversion
are explicitly outside this first version.

## Formula

```text
estimated_material_cost = rounded_purchase_package_count × user_unit_price
```

The package count is the calculator engine's existing procurement result. The
cost helper does not round or recalculate that quantity.

## Input rules

- Unit price is optional. A blank unit price produces no cost estimate.
- A supplied unit price must be finite and zero or greater.
- Currency is a user-controlled display label only, such as `$`, `EUR`, or
  `EGP`; BuildNumbers does not interpret or convert currencies.
- The purchase quantity must be a nonnegative safe integer from the calculator
  result.
- Totals outside the reliable JavaScript numeric range are rejected instead of
  displayed.
- Monetary values retain numeric precision internally and are rounded only for
  display.

## Product-change safety

A saved unit price must be cleared when the user changes what the priced package
means:

- Concrete/Post-hole: changing bag size.
- Paint: changing container size or switching measurement systems, because the
  available container set changes.
- Tile: changing tiles per box.
- Gravel: changing bag weight.
- Mulch: changing bag volume.

A measurement-system conversion that preserves the same physical package does
not clear the price for Gravel or Mulch.

## Copy, save, and privacy

When a valid optional price is present, copied and device-saved estimate
summaries include the estimated material cost. Existing history remains
backward compatible because saved estimates continue to store only a label and
summary string. No price is uploaded to a BuildNumbers account and no account is
required.

## User-facing limitations

Every cost result must state that it is approximate and based only on the price
the user entered. It must not imply a live quote and must disclose that tax,
delivery, labor, discounts, minimum-order rules, and future price changes are
not included.
