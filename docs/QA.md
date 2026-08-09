# Quality Assurance Guide

## Release gate

A calculator may be described as released only after:

1. Formula sources and assumptions are documented.
2. Independent known-result vectors match hand calculations.
3. Unit, validation, rounding-boundary, numeric-range, and edge-case tests pass.
4. The production build succeeds.
5. Rendered route tests pass.
6. The primary flow is checked on desktop and mobile widths.
7. Keyboard focus, labels, errors, and result announcements are reviewed.
8. Metadata and structured data are inspected.
9. The required milestone audit is completed on mobile and desktop.
10. The audit result is recorded in `docs/AUDITS.md`.
11. The changelog is updated.

## Mandatory critical and milestone audits

This policy is non-negotiable. A change is not complete merely because its code
exists or its targeted test passes.

| Change class | Examples | Required gate |
| --- | --- | --- |
| Critical | Formula, unit conversion, validation, procurement rounding, numeric safety, shared calculator engine, or a calculation defect | Reproduce defects with a regression test first; run every automated check; recheck independent known-result vectors; manually exercise every affected calculator; run the full mobile and desktop audit matrix; record the result |
| Major milestone | New calculator or route, global design-system change, shared UI behavior, navigation or SEO change, storage/history change, framework upgrade, deployment configuration, or Project Mode capability | Run every automated check; complete the affected manual checklists; run Lighthouse on the homepage and every live calculator on mobile and desktop; check console errors and internal links; record the result |
| Minor | Isolated copy or documentation change with no formula, shared behavior, route, metadata, or global style impact | Run targeted checks and review the rendered change; escalate to the major gate if shared behavior is touched |

Run the complete automated portion with:

```bash
npm run qa:automated
```

The automated command is only the first portion of a critical or milestone
gate. It does not replace manual interaction review or an external Lighthouse
audit.

## Pass criteria

- All automated tests, lint checks, production builds, and rendered-route tests
  pass.
- No known calculation regression, crash, non-finite result, unsafe integer,
  or silent validation failure remains.
- Every changed formula has a current specification, primary reference,
  version, review date, and independent known-result vector.
- Browser console errors and broken internal links are zero in the audited
  flows.
- Lighthouse Performance, Accessibility, Best Practices, and SEO each score at
  least 95 on both the mobile and desktop profiles.
- No high-impact accessibility failure is ignored even when the aggregate
  Accessibility score is 95 or higher.
- An invalid, interrupted, or incomplete audit is recorded as inconclusive or
  partial, never as passed.

Any failed criterion blocks the critical or milestone gate. The work remains
open until the problem is fixed and the entire required matrix is rerun.

## Audit evidence

Every critical or milestone audit record must include:

- Date, product version, and source revision.
- Audit tool and version.
- Whether the target was a deployed build or a local production build.
- Every audited route and device profile.
- Category scores, failed audits, and significant warnings.
- Automated-suite result and manual-review scope.
- Final status: passed, failed, partial, or inconclusive.
- Follow-up work and the later record that closes a failed gate.

## Bug policy

For a calculation bug:

1. Add a failing test reproducing the bug.
2. Fix the engine.
3. Run the complete suite.
4. Record any user-visible change in the changelog.

## Manual concrete calculator checklist

- Switch Imperial → Metric → Imperial and confirm values convert.
- Confirm an 8 ft input returns to exactly 8 ft after a unit round trip.
- Clear each input and confirm a useful inline error appears.
- Test 0%, 10%, and 50% waste.
- Test all three bag sizes.
- Copy result.
- Save multiple estimates, reload, and clear history.
- Reload with an existing estimate and confirm no hydration error is logged.
- Print the result.
- Navigate with keyboard only.
- Inspect at 360 px, 768 px, and desktop widths.

## Manual paint calculator checklist

- Switch Imperial → Metric → Imperial and confirm dimensions, area, and
  coverage convert.
- Confirm 8 ft and 400 ft²/gal return without visible round-trip drift.
- Toggle the ceiling and confirm the added area equals length × width.
- Test zero openings and an opening area equal to the gross surface.
- Test 1 through 6 coats.
- Test custom coverage and 0%, 10%, and 25% extra allowance.
- Test every available container size in both unit systems.
- Copy result.
- Save multiple estimates, reload, and clear history.
- Reload with an existing estimate and confirm no hydration error is logged.
- Print the result.
- Navigate with keyboard only.
- Inspect at 360 px, 768 px, and desktop widths.

## Manual tile calculator checklist

- Switch Imperial → Metric → Imperial and confirm surface, tile, and grout
  dimensions convert.
- Confirm an 8 ft surface span returns to exactly 8 ft.
- Test square and rectangular tiles.
- Test aligned, rotated, and automatic orientation.
- Confirm grout-joint changes affect only the layout grid, not the area-based
  purchase quantity.
- Test 0%, 10%, 25%, and 50% waste.
- Test one tile per box and a box quantity that forces upward rounding.
- Confirm zero, negative, fractional box quantities, and a joint as large as a
  tile edge show useful errors.
- Copy result.
- Save multiple estimates, reload, and clear history.
- Reload with an existing estimate and confirm no hydration error is logged.
- Print the result.
- Navigate with keyboard only.
- Inspect at 360 px, 768 px, and desktop widths.

## Manual gravel calculator checklist

- Confirm the documented 10 ft × 10 ft × 4 in vector at 10% allowance,
  93 lb/ft³, and 50 lb bags returns 1.358 yd³, 3,410 lb, 1.705 short tons,
  and 69 bags.
- Switch Imperial → Metric → Imperial and confirm dimensions, density, bag
  weight, volume, mass, and bag count remain equivalent.
- Confirm 10 ft, 4 in, 93 lb/ft³, and 50 lb return without visible
  round-trip drift.
- Test 0%, 10%, 25%, and 50% allowance.
- Change bulk density and confirm volume is unchanged while mass and bags change.
- Change bag weight and confirm only the complete-bag count changes.
- Confirm an exact mass/bag boundary does not add an extra bag.
- Confirm zero, negative, non-finite, underflow, and extreme inputs show useful
  errors instead of non-finite results.
- Copy result.
- Save multiple estimates, reload, and clear history.
- Print the result.
- Navigate with keyboard only.
- Inspect at 360 px, 768 px, and desktop widths.

## Manual mulch calculator checklist

- Confirm the documented 20 ft × 10 ft × 3 in vector at 10% allowance and
  2 ft³ bags returns 2.037 yd³, 8 ft² per bag, and 28 complete bags.
- Switch Imperial → Metric → Imperial and confirm dimensions, bag volume,
  order volume, coverage, and bag count remain equivalent.
- Confirm 20 ft, 10 ft, 3 in, and 2 ft³ return without visible round-trip drift.
- Test 0%, 10%, 25%, and 50% allowance.
- Change bag volume and confirm bed volume is unchanged while coverage and bag
  count change.
- Change installed depth and confirm per-bag coverage changes correctly.
- Confirm an exact volume/bag boundary does not add an extra bag.
- Confirm zero, negative, non-finite, underflow, and extreme inputs show useful
  errors instead of non-finite results.
- Copy result.
- Save multiple estimates, reload, and clear history.
- Print the result.
- Navigate with keyboard only.
- Inspect at 360 px, 768 px, and desktop widths.

## Performance

Avoid client-side dependencies for pure formatting or simple UI behavior. Keep
calculator engines deterministic and local. Lighthouse 95+ remains the target,
and the mobile and desktop profiles must both meet it. Local production-build
audits may be recorded as lab evidence, but they must be identified clearly and
must not be described as deployed field data.
