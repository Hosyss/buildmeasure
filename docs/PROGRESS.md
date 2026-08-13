# Progress Measurement

BuildMeasure reports two progress figures so a short-term launch target is not
confused with the multi-year product vision.

## Launch-ready v1

`100%` means the first public version is ready with the shared platform, seven
verified calculators (Concrete, Post-hole Concrete, Paint, Tile, Brick, Gravel,
and Mulch), complete QA, technical SEO, feedback collection, and basic launch
operations.

| Workstream | Weight | Verified credit | Current evidence / remaining work |
| --- | ---: | ---: | --- |
| Architecture and documentation | 15% | 15% | Architecture, workflow, formula records, QA policy, and audit log exist |
| Shared engine, UI, units, storage | 15% | 13% | Shared utilities and components, local history, 44 px action targets, anonymous feedback, and privacy-conscious usage events exist; broader cross-browser review remains |
| First seven calculators | 30% | 30% | Concrete, Post-hole Concrete, Paint, Tile, Brick, Gravel, and Mulch have documented engines, tested pages, SEO integration, and recorded milestone evidence |
| QA and release evidence | 15% | 15% | Full automated gates, rendered-route coverage, responsive/browser audits, and Lighthouse evidence exist; each critical or major follow-up records its own current evidence in `docs/AUDITS.md` |
| SEO and useful page content | 15% | 15% | Calculator metadata, schema, formulas, FAQs, worked examples, internal links, sitemap, estimating guides, methodology, and trust/legal pages exist; Google Search Console ownership is verified and the sitemap is submitted |
| Public launch, feedback, monitoring | 10% | 9% | The existing site is public with anonymous feedback, a private owner inbox, privacy-conscious interaction/error/source monitoring, retention cleanup, health/status surfaces, PageSpeed evidence, and an MDN Observatory A+; enough real-user field data and independent usability feedback remain |
| **Total** | **100%** | **97%** | Rounded only after evidence is added |

Progress changes only when a workstream has runnable code, recorded evidence,
or published documentation. A plan or claim does not earn credit.

## Active handoff — UX clarity and documentation

- Branch: `fix/ux-clarity-and-docs`
- Base: `fdac762aee542ab4ceb9482910b6e8e54b9a4e96` (`main` at branch creation)
- Scope rule: UX clarity, typography, header CTA behavior, guide density, tests,
  and documentation only. Calculator formulas and engine behavior stay unchanged
  unless a regression test proves a real defect.
- Other-agent work: PR #32 (`feature/drywall-calculator`) is intentionally
  untouched. No open PR is being merged, closed, or edited by this branch.
- Documentation preflight: current `AGENTS.md` already says seven calculators,
  and current `docs/ARCHITECTURE.md` already lists `/brick-calculator`; no
  redundant edit is needed for either file.
- PR #27 remains open and untouched. Its Post-hole bag-guide route is already
  present on current `main`, so it appears stale/duplicative and should be
  reviewed separately rather than closed by this work.

### Stage log

| Stage | Commit | Status / evidence | Remaining |
| --- | --- | --- | --- |
| Brick coverage clarity | [`8123371`](https://github.com/Hosyss/buildmeasure/commit/8123371186e1e13f517b192f92cfdcad67d2012c) | Preset labels now derive their Imperial/Metric values from existing `brickPresetRate`; preset coverage is a semantic static `<output>` and only Custom exposes an editable input; rendered regression added. No calculator engine file changed. | Browser Imperial/Metric/Custom interaction QA and final gates pending. |
| Shared UX clarity | [`07e47bc`](https://github.com/Hosyss/buildmeasure/commit/07e47bc52e9ec9666e654c37e27a111da7d999ee) | Header CTA is explicit per context without client pathname logic; homepage hero card is a linked **Example estimate** with no fake input controls; helper/warning copy is raised to ~12.5 px and secondary metadata to ~11.5–12 px; focused guides link to their related calculator and use a denser hero; permanent rendered contracts cover homepage/header/guide semantics. | Automated/typecheck/build, responsive browser QA, console/overflow checks, and affected-page Lighthouse pending. |

### Static-affordance review

The current source review found two misleading affordances in the requested
scope: the Brick preset coverage field was rendered as a read-only input, and
the homepage concrete example used bordered dimension boxes that could be read
as form fields. Both are addressed above. The final browser QA will also scan
for remaining `readOnly`/`aria-readonly` form controls and record any exception
instead of silently ignoring it.

### Next work on this branch

1. Run all unit tests, explicit TypeScript `tsc --noEmit`, lint, production
   build, and rendered tests.
2. Exercise Brick Imperial, Metric, preset, and Custom interactions in Chrome.
3. Capture 360 / 768 / 1280 visual evidence and fail on horizontal overflow or
   site-originated console/runtime errors.
4. Run Lighthouse only on the directly representative affected surfaces:
   homepage, Brick Calculator, and Brick guide, mobile and desktop.
5. Record the QA evidence, remove temporary QA plumbing, verify the final diff,
   then open a **Draft PR only** and stop for review.

## Master product vision

The long-term vision includes more than 300 calculators, Project Mode, reports,
contractor workflows, an API, premium capabilities, and mature search and
monetization operations. Against that scope, current completion is estimated at
approximately **2%**. This figure is intentionally approximate because the
future calculator catalog and commercial scope are not yet frozen.

## Reporting rule

Every material progress update should report both figures in this order:

1. Launch-ready v1 percentage from the weighted table above.
2. Approximate master-vision percentage.

The table must be updated before either percentage is raised.
