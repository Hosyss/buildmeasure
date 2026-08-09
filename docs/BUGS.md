# Bug Register

No open product bugs are recorded at this checkpoint.

## Resolved

### BM-005 — 2026-07-31 — Unit-switch round-trip drift

- Affected routes: all calculator routes.
- Reproduction: enter 8 ft, switch to metric, then switch back to imperial.
- Expected: 8 ft.
- Actual before fix: 7.999 ft because the intermediate meter value was shown
  with only three decimal places.
- Severity: medium; the physical difference was small but could alter a
  rounding boundary.
- Regression test: added for length and paint-coverage round trips.
- Resolution: shared seven-decimal converted-input formatter; release `0.3.1`.

### BM-004 — 2026-07-31 — Singular paint-coat label

- Affected route: `/paint-calculator`
- Reproduction: select one coat and inspect the result or saved estimate.
- Expected: `1 coat`.
- Actual before fix: `1 coats`.
- Severity: low; calculation results were unaffected.
- Regression coverage: one-coat browser release check.
- Resolution: centralized singular/plural coat label; release `0.3.1`.

### BM-003 — 2026-07-31 — Saved-history hydration mismatch

- Affected routes: all calculator routes when device-local history already
  existed before page load.
- Reproduction: save an estimate, reload the calculator, then use the history
  controls.
- Expected: existing entries render after hydration and `Clear all` remains
  interactive.
- Actual before fix: client storage could differ from server HTML during
  hydration, leaving the history subtree mismatched and its control inert.
- Severity: medium; calculations were unaffected, but saved-history controls
  could fail.
- Regression coverage: storage parsing, invalid-data recovery, fixed limits,
  and ID uniqueness are automated; reload and clear are in the browser
  release checklist.
- Resolution: a server-safe external-store snapshot and explicit same-tab and
  cross-tab update notifications; release `0.3.1`.

### BM-002 — 2026-07-31 — Paint exact-boundary overcount

- Affected route: `/paint-calculator`
- Reproduction: a 1 ft × 1 ft room with 9 ft walls, one coat, no openings,
  3 ft²/gal coverage, no extra allowance, and one-gallon containers.
- Expected: 36 ft² ÷ 3 ft²/gal = 12 containers.
- Actual before fix: 13 containers because a binary floating-point artifact
  represented the quotient as slightly greater than 12.
- Severity: high; the purchase count was one container too large.
- Regression test: added and passing.
- Resolution: shared safe upward-rounding helper; engine `0.1.1`, release
  `0.3.1`.

### BM-001 — 2026-07-31 — Concrete exact-boundary overcount

- Affected route: `/concrete-calculator`
- Reproduction: a 3 ft × 3 ft × 2 in slab, no waste, using 40 lb bags with
  0.30 ft³ published yield.
- Expected: 1.5 ft³ ÷ 0.30 ft³ = 5 bags.
- Actual before fix: 6 bags because a binary floating-point artifact
  represented the quotient as slightly greater than 5.
- Severity: high; the purchase count was one bag too large.
- Regression test: added and passing.
- Resolution: shared safe upward-rounding helper; engine `0.1.1`, release
  `0.3.1`.

## Reporting format

Every new entry must include:

- ID and date.
- Affected calculator/route.
- Reproduction steps.
- Expected and actual result.
- Severity.
- Regression test status.
- Resolution and release version.

Absence from this register does not prove the product is defect-free.
