# Post-Hole Concrete Calculator — Milestone QA

This file records the supervised milestone checks for PR #24. `docs/QA.md`
remains the governing policy.

## Source under test

- Branch: `feature/post-hole-concrete-calculator`
- Calculator route: `/post-hole-concrete-calculator`
- Audited product source revision: `1c2a8bf267dde38c0141bf0d887a17ff9cabf8ff`
- Calculator scope: quantity estimation only. Do not treat any result as
  structural-design guidance for hole diameter, embedment, frost depth,
  footing design, soil, wind load, reinforcement, or code compliance.

## Automated evidence completed

- [x] Complete GitHub quality gate passed on the integrated PR merge result.
- [x] Unit/engine suite: 95 passed, 0 failed.
- [x] Rendered application suite: 17 passed, 0 failed.
- [x] Production build completed and included
  `/post-hole-concrete-calculator`.
- [x] Production dependency audit reported 0 vulnerabilities at the configured
  high-risk gate.

## Manual desktop interaction checklist

- [x] Reproduced the independent vector: one 12 in diameter hole, 24 in
  concrete depth, no post displacement, 0% allowance, 80 lb bags → about
  1.571 ft³ and 3 complete bags.
- [x] Switched Imperial → Metric → Imperial. The displayed dimensions changed
  12 in → 30.48 cm → 12 in and 24 in → 60.96 cm → 24 in without visible
  round-trip drift.
- [x] Exercised no-post, round-post, and square-post displacement.
- [x] Confirmed invalid round-post diameter is rejected when it is not smaller
  than the hole diameter.
- [x] Confirmed invalid square-post size is rejected when its diagonal cannot
  fit inside the round hole.
- [x] Exercised the documented allowance range including 0%, 10%, 25%, and
  50% cases.
- [x] Exercised 40, 60, and 80 lb bag-size selection and result updates.
- [x] Cleared required fields and confirmed useful validation and recovery.
- [x] Copy result action was exercised.
- [x] Save/history and clear-history behavior were exercised with persistent
  harness storage; the shared persistence parser also remains covered by the
  automated suite.
- [x] Reload/re-initialization with saved history produced no hydration/client
  error in the supervised harness.
- [x] Print activation was exercised.
- [x] Keyboard navigation and visible focus were exercised across the primary
  controls and actions.
- [x] No site-originated console error was observed in the audited calculator
  flow.

## Responsive interaction checklist

The primary flow was exercised at desktop, exact 360 px, and exact 768 px
viewports in Chromium.

- [x] No horizontal overflow.
- [x] No clipped form controls, result cards, actions, history, FAQ, or footer.
- [x] Imperial/Metric switch remained usable.
- [x] Validation and recovery remained usable.
- [x] Post-displacement controls remained clear and usable.
- [x] Copy, save, print, history, and clear-history controls remained usable.
- [x] Keyboard focus was not lost or hidden in the audited flow.
- [x] Result updates and error states remained readable.
- [x] No site-originated console error was observed.

### Browser-environment note

The conversation container's managed Chromium policy blocks direct navigation
to all URLs. The supervised interaction pass therefore loaded the built HTML,
CSS, and JavaScript into Chromium through a QA harness and isolated only the
origin-dependent analytics/local-storage plumbing needed by that harness. The
actual production-build origin was navigated independently by Lighthouse in
GitHub Actions. This limitation does not change any calculator code or result,
and it is recorded here rather than hidden.

## Lighthouse milestone matrix

- [x] Google Lighthouse 13.4.1 ran against a local production build in GitHub
  Actions on the homepage and every live calculator, on mobile and desktop.
- [x] All 14 scored reports met the `docs/QA.md` minimum of 95 in Performance,
  Accessibility, Best Practices, and SEO.
- [x] Post-hole scored 99/100/100/100 on mobile and 100/100/100/100 on desktop.
- [x] The complete score matrix and the preliminary-run investigation are
  recorded in `docs/AUDITS.md`.

Required calculator routes completed:

- [x] `/concrete-calculator`
- [x] `/post-hole-concrete-calculator`
- [x] `/paint-calculator`
- [x] `/tile-calculator`
- [x] `/gravel-calculator`
- [x] `/mulch-calculator`
- [x] `/` on both profiles

## Release decision

The Post-hole milestone QA gate is complete for the audited product source.
Before merge, remove the temporary browser/Lighthouse collection plumbing from
the PR, rerun the normal final GitHub quality gate on the cleaned head, then
mark PR #24 ready. After merge, verify the Cloudflare deployment and production
route before submitting the new production URL to IndexNow once.
