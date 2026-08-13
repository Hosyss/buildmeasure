# Post-Hole Concrete Calculator — Milestone QA

This file records the remaining supervised milestone checks for PR #24. It does
not approve release by itself; `docs/QA.md` remains the governing policy.

## Source under test

- Branch: `feature/post-hole-concrete-calculator`
- Calculator route: `/post-hole-concrete-calculator`
- Scope: quantity estimation only. Do not treat any result as structural-design
  guidance for hole diameter, embedment, frost depth, footing design, soil,
  wind load, reinforcement, or code compliance.

## Automated evidence already completed

- Complete GitHub quality gate passed on the final integrated branch head after
  merging current `main` into the feature branch.
- Unit/engine suite: 95 passed, 0 failed.
- Rendered application suite: 17 passed, 0 failed.
- Production build completed and included `/post-hole-concrete-calculator`.
- Production dependency audit reported 0 vulnerabilities at the configured
  high-risk gate.

## Manual desktop interaction checklist

- [ ] Reproduce the independent vector: one 12 in diameter hole, 24 in concrete
  depth, no post displacement, 0% allowance, 80 lb bags → about 1.571 ft³ and
  3 complete bags.
- [ ] Switch Imperial → Metric → Imperial and confirm displayed dimensions and
  results remain equivalent without visible round-trip drift.
- [ ] Exercise no-post, round-post, and square-post displacement.
- [ ] Confirm invalid round-post diameter is rejected when it is not smaller
  than the hole diameter.
- [ ] Confirm invalid square-post size is rejected when its diagonal cannot fit
  inside the round hole.
- [ ] Test 0%, 10%, 25%, and 50% allowance.
- [ ] Test 40, 60, and 80 lb bag sizes.
- [ ] Clear required fields and confirm useful inline validation and recovery.
- [ ] Copy result.
- [ ] Save multiple estimates, reload, and clear history.
- [ ] Reload with saved history and confirm no hydration/client error.
- [ ] Activate print.
- [ ] Navigate the calculator with keyboard only and inspect focus visibility,
  labels, errors, and result announcements.
- [ ] Confirm no site-originated console error.

## Responsive interaction checklist

Repeat the primary flow at both 360 px and 768 px widths.

- [ ] No horizontal overflow.
- [ ] No clipped form controls, result cards, actions, history, FAQ, or footer.
- [ ] Imperial/Metric switch remains usable.
- [ ] Validation and recovery remain usable.
- [ ] Post-displacement controls remain clear and usable.
- [ ] Copy, save, print, history, and clear-history targets remain usable by
  pointer/touch.
- [ ] Keyboard focus is not lost or hidden.
- [ ] Result updates and error states remain readable.
- [ ] No site-originated console error.

## Lighthouse milestone matrix

Run Lighthouse on the homepage and every live calculator, including Post-hole,
on both mobile and desktop profiles. Under `docs/QA.md`, Performance,
Accessibility, Best Practices, and SEO must each be at least 95. Any invalid,
interrupted, incomplete, or failing run blocks release until the full required
matrix is rerun cleanly.

Required calculator routes:

- `/concrete-calculator`
- `/post-hole-concrete-calculator`
- `/paint-calculator`
- `/tile-calculator`
- `/gravel-calculator`
- `/mulch-calculator`

Also audit `/` on both profiles.

## Release decision

PR #24 stays Draft until every unchecked item above that is required by
`docs/QA.md` is completed and the resulting evidence is appended to
`docs/AUDITS.md`. Only then may the PR be marked ready, merged, deployed,
verified on production, and submitted to IndexNow once.
