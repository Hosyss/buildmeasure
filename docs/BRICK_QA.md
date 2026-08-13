# Brick Calculator QA

Status: release-blocking checklist for the Brick Calculator milestone.

## Source and formula gate

- [x] Brick Industry Association Technical Note 10 reviewed for the wall-area method, Table 4 coverage rates, running/stack-bond basis, header-pattern correction boundary, and breakage/waste guidance.
- [x] BIA Technical Notes scope statement reviewed for the fired-clay-brick material boundary.
- [x] NIST SP 811 exact international-foot conversion basis retained.
- [x] Quantity engine implemented independently from the UI and optional purchase-cost layer.
- [x] Known BIA Modular vector: 100 ft² at 675 / 100 ft² = 675 bricks at 0% waste and 709 at 5% waste.
- [x] Known BIA Standard vector: 100 ft² = 655 bricks at 0% waste.
- [x] Openings vector: 20 ft × 8 ft − 16 ft², Modular, 5% = 1,021 bricks.
- [x] Imperial/Metric equivalence and deterministic randomized invariants covered.

## Automated gate

- [x] Complete lint + engine/unit + production build + rendered application tests pass on the integrated branch.
- [x] Brick route returns HTTP 200 from the production build.
- [x] Canonical URL is `/brick-calculator` on the production origin.
- [x] WebApplication, BreadcrumbList, and visible FAQ structured data render; no unsupported HowTo schema is introduced.
- [x] Homepage, footer, sitemap, `llms.txt`, About, feedback, and internal-link discovery include Brick Calculator.
- [x] Optional price-per-brick UI renders and remains outside the quantity engine.
- [x] High-risk production dependency audit passes.

## Supervised interaction matrix

### Default and reference results

- [x] Default 20 ft × 8 ft wall, 16 ft² openings, Modular rate, and 5% waste renders 1,021 order bricks.
- [x] 10 ft × 10 ft wall, zero openings, Modular, 0% waste renders 675 bricks.
- [x] 10 ft × 10 ft wall, zero openings, Modular, 5% waste renders 709 bricks.
- [x] 10 ft × 10 ft wall, zero openings, Standard, 0% waste renders 655 bricks.
- [x] Net wall area and allowance-added brick counts agree with the engine output.

### Brick basis and units

- [x] Every documented BIA preset can be selected and updates the coverage rate.
- [x] Preset coverage field is read-only; Custom / supplier rate makes it editable.
- [x] Custom positive coverage rates calculate normally.
- [x] Invalid/zero/negative custom rates show a cost-independent quantity validation error.
- [x] Imperial → Metric → Imperial preserves the practical wall, openings, and coverage values and final whole-brick order.
- [x] Metric mode labels wall area and coverage rate correctly.

### Openings, waste, and validation

- [x] Zero openings is accepted.
- [x] Openings smaller than gross wall area are subtracted before coverage and waste.
- [x] Openings equal to or larger than the gross wall area are rejected.
- [x] Waste values 0%, 5%, 25%, and 50% calculate with final upward rounding.
- [x] Waste below 0% or above 50% is rejected.
- [x] Empty, zero, negative, non-finite, overflow, and unsafe numeric inputs do not produce misleading results.

### Optional purchase cost

- [x] Blank price leaves the quantity-only result unchanged.
- [x] Zero and ordinary decimal prices are accepted.
- [x] Negative, non-finite, or numerically unsafe prices are rejected without hiding a valid brick quantity.
- [x] `$`, `EUR`, and `EGP` display labels work without currency conversion.
- [x] Changing the brick preset or custom coverage rate clears the stale unit price.
- [x] Switching only the unit system preserves the current brick product price.
- [x] Estimated material cost uses the rounded `orderBricks` procurement quantity.

### Actions and persistence

- [x] Copy includes quantity, net area, brick basis, coverage rate, allowance, scope warning, and cost only when valid.
- [x] Save stores the current estimate locally and includes cost only when valid.
- [x] History renders, survives ordinary re-rendering, and Clear removes it.
- [x] Print action is wired to the browser print path.
- [x] Reset restores the verified default values and clears optional price state.
- [x] Feedback link targets `brick-calculator` and the feedback form accepts that calculator ID.
- [x] Brick analytics events are accepted by the existing bounded analytics validator.

## Responsive, keyboard, and console gate

- [x] Exact 360 px viewport: no document-level horizontal overflow or clipped primary inputs/results/actions.
- [x] Exact 768 px viewport: no document-level horizontal overflow or clipped primary inputs/results/actions.
- [x] Desktop viewport: calculator and result panels render coherently.
- [x] Keyboard Tab order reaches unit toggle, inputs, brick-basis select, custom rate when applicable, cost controls, Reset, Copy, Save, Print, feedback, and history controls.
- [x] No site-originated browser console/runtime errors during the interaction matrix.
- [x] Visible scope copy keeps fired-clay, running/stack-bond quantity, no-mortar, no-header-pattern, and no-structural-design boundaries explicit.

## Lighthouse milestone gate

Required scored routes:

- `/`
- `/concrete-calculator`
- `/post-hole-concrete-calculator`
- `/paint-calculator`
- `/tile-calculator`
- `/brick-calculator`
- `/gravel-calculator`
- `/mulch-calculator`

For every route:

- [x] Mobile Performance >= 95.
- [x] Mobile Accessibility >= 95.
- [x] Mobile Best Practices >= 95.
- [x] Mobile SEO >= 95.
- [x] Desktop Performance >= 95.
- [x] Desktop Accessibility >= 95.
- [x] Desktop Best Practices >= 95.
- [x] Desktop SEO >= 95.

## Release closeout

- [x] Any preliminary failure is retained transparently in `docs/AUDITS.md` and does not count as a pass.
- [x] Final browser and Lighthouse evidence is recorded in `docs/AUDITS.md`.
- [x] `CHANGELOG.md` records the Brick Calculator milestone.
- [x] All temporary QA workflows/scripts are removed from the final PR diff.
- [ ] Final normal CI passes on the cleaned PR head.
- [ ] PR is marked Ready only after all release evidence above passes.
- [ ] Main-branch CI, Cloudflare Workers deployment, and immutable release backup pass after merge.
- [ ] Canonical production Brick route is independently verified before describing it as deployed.
- [ ] IndexNow is submitted exactly once for the bounded set of changed public URLs after verified deployment; manual GSC indexing is not used.
