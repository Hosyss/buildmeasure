# Optional Cost Estimator QA

This checklist supplements `docs/QA.md` for the shared purchase-cost layer.
Because it changes every calculator's shared UI, copy/save behavior, and
procurement presentation, release it through the major-milestone gate.

## Shared behavior

- Leave unit price blank and confirm every quantity result is unchanged and no
  cost total is shown.
- Enter a valid decimal unit price and confirm total = complete purchase count ×
  unit price.
- Test `$`, `EUR`, and `EGP` display labels without currency conversion.
- Confirm negative, non-finite, overlong-label, and unsafe-range values show a
  useful cost-only error without hiding the valid material quantity.
- Enter price `0` and confirm an explicit zero cost is valid.
- Copy and save an estimate with a valid cost and confirm the cost is included.
- Copy and save without a price and confirm the old quantity-only summary
  remains valid.
- Print with and without a cost estimate.
- Navigate all new fields using the keyboard only.
- Inspect exact 360 px, 768 px, and desktop widths for clipping or horizontal
  overflow.

## Product-change safety

- Concrete: enter a bag price, then change 40/60/80 lb bag size and confirm the
  unit price clears.
- Post-hole concrete: enter a bag price, then change bag size and confirm the
  unit price clears.
- Paint: enter a container price, then change container size and confirm the
  unit price clears; repeat across Imperial/Metric switch.
- Tile: enter a box price, then change tiles per box and confirm the unit price
  clears.
- Gravel: enter a bag price, then change bag weight and confirm the unit price
  clears. Confirm Imperial/Metric conversion of the same bag does not clear the
  price.
- Mulch: enter a bag price, then change bag volume and confirm the unit price
  clears. Confirm Imperial/Metric conversion of the same bag does not clear the
  price.

## Regression gate

- Run `npm run qa:automated`.
- Recheck all calculator known-result vectors and package counts through the
  automated engine suite.
- Confirm no calculator engine/version/formula changed for this feature.
- Confirm browser console errors and broken internal links are zero.
- Run Lighthouse on the homepage and all six live calculators on mobile and
  desktop; every Performance, Accessibility, Best Practices, and SEO category
  must score at least 95.
- Record the failed and final passing evidence in `docs/AUDITS.md` before merge.
