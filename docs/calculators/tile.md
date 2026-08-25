# Tile Calculator Specification

## Status

- Engine version: `0.1.1`
- Formula version: `1.0.0`
- Last reviewed: `2026-07-31`
- Route: `/tile-calculator`

## Scope

The current calculator estimates rectangular ceramic, porcelain, stone, or
similar individual tiles for one rectangular floor or wall surface. It returns
an area-based tile order, complete boxes, purchased coverage, and a
row-and-column layout check.

It does not estimate mortar, grout mass, trim, membranes, substrate materials,
labor, multiple surfaces, openings, or cutting optimization.

## Inputs

| Input | Imperial | Metric | Validation |
| --- | --- | --- | --- |
| Surface length | feet | meters | finite and greater than zero |
| Surface width | feet | meters | finite and greater than zero |
| Tile length | inches | millimeters | finite and greater than zero |
| Tile width | inches | millimeters | finite and greater than zero |
| Grout joint | inches | millimeters | finite, nonnegative, and smaller than both tile edges |
| Waste | percent | percent | 0–50 |
| Tiles per box | pieces | pieces | whole number, 1–500 |
| Orientation | auto/aligned/rotated | auto/aligned/rotated | enumerated value |

## Internal units

All lengths are normalized to meters. Areas are calculated in square meters.
The exact international foot (`0.3048 m`) and inch (`0.0254 m`) definitions
are used.

## Procurement formulas

For a rectangular surface:

```text
surface area = surface length × surface width
tile face area = tile length × tile width
exact tile count = surface area ÷ tile face area
minimum whole tiles = ceil(exact tile count)
order tiles = ceil(exact tile count × (1 + waste percent ÷ 100))
boxes = ceil(order tiles ÷ tiles per box)
purchased tiles = boxes × tiles per box
```

Only procurement quantities are rounded. Surface area, tile area, and the exact
tile count remain unrounded in the engine.

## Layout formulas

For one surface span, `n` tiles create `n - 1` internal grout joints. The
minimum grid-cell count is therefore:

```text
cells = ceil((surface span + grout joint) ÷ (tile span + grout joint))
```

Aligned and 90-degree rotated grids are calculated independently. Auto
orientation selects the grid with fewer cells, breaking a tie in favor of the
aligned orientation.

The grid is a planning aid and is not used as the purchase quantity. Counting
every grid cell as a new tile can overstate material because installers may
reuse cut pieces. JobsiteQuant uses the explicit waste allowance for cut loss
instead of claiming to solve the cutting-stock problem.

## Waste assumption

The default `10%` is an editable planning example, not a universal standard.
The correct allowance depends on the layout, breakage, tile variation,
replacement stock, installer plan, and supplier requirements. Daltile advises
accounting for wastage and discusses approximately 10% attic stock for natural
stone. The UI tells the user to confirm the project-specific value.

## Grout-joint assumption

The TCNA states that there is no single specific grout-joint size for every
installation. Tile variation, edge profile, tile size, substrate, and use all
matter. The calculator accepts a user-supplied joint and does not present the
default as a standard.

Grout area is not subtracted from the tile purchase. Carton coverage and tile
face area remain the procurement basis; joint width supports layout planning.

## References

- American Olean / Daltile,
  [Tile Pattern Guide](https://digitalassets.daltile.com/content/dam/AmericanOlean/website/documents/content/AO_TilePatternGuide_2005_SinglePages.pdf).
- Daltile,
  [Tile & Natural Stone FAQs](https://www.daltile.com/how-to/faqs).
- Tile Council of North America,
  [Grout FAQ](https://tcnatile.com/resource-center/faq/grout/).
- NIST,
  [Handbook 44, Appendix C](https://www.nist.gov/document/2026-nist-handbook-44-appendix-c).

## Automated verification

The test suite covers:

- A known 120 square-foot order.
- Exact metric/imperial equivalence.
- Whole-tile and complete-box upward rounding.
- Exact waste-boundary rounding.
- The `n - 1` internal-joint layout relationship.
- Aligned, rotated, and automatic orientation.
- Separation of grout spacing from procurement quantity.
- Invalid dimensions, waste, box quantity, joint size, and runtime units.
- Underflow, overflow, and unsafe integer quantities.
- 250 deterministic randomized inputs with procurement invariants.

## Optional purchase cost layer

The quantity engine remains the source of truth and is unchanged by optional
pricing. The interface may multiply the engine's complete purchase-package
count by a user-entered price for that package. No live price, exchange rate,
tax, delivery, labor, discount, or supplier minimum is inferred. Package
definition changes clear the entered price to prevent stale-product pricing.
See [Optional Purchase Cost Estimator](../COST_ESTIMATOR.md).
