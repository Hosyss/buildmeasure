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
- Base and latest checked `main`: `fdac762aee542ab4ceb9482910b6e8e54b9a4e96`
- Draft PR: [#33 — Clarify calculator UX, CTAs, typography, and guide density](https://github.com/Hosyss/buildmeasure/pull/33)
- Cleaned pre-PR head: `e8430d3c27d3b48b94a25fc9d15a59ddb2fd24c9`
- Normal PR quality gate on that cleaned head: GitHub Actions run `31696026918`, job `94433885182` — **passed**, including the complete repository quality gate and high-risk production dependency audit.
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
| Brick coverage clarity | [`8123371`](https://github.com/Hosyss/buildmeasure/commit/8123371186e1e13f517b192f92cfdcad67d2012c) | Preset labels now derive their Imperial/Metric values from existing `brickPresetRate`; preset coverage is a semantic static `<output>` and only Custom exposes an editable input; rendered regression added. No calculator engine file changed. | **Closed:** Imperial/Metric/Custom browser QA, responsive checks, and affected-surface Lighthouse passed. |
| Shared UX clarity | [`07e47bc`](https://github.com/Hosyss/buildmeasure/commit/07e47bc52e9ec9666e654c37e27a111da7d999ee) | Header CTA is explicit per context without client pathname logic; homepage hero card is a linked **Example estimate** with no fake input controls; helper/warning copy is raised to ~12.5 px and secondary metadata to ~11.5–12 px; focused guides link to their related calculator and use a denser hero; permanent rendered contracts cover homepage/header/guide semantics. | **Closed:** 360/768/1280 browser QA found no overflow or site errors; representative Lighthouse passed. |
| Guide first-screen density | [`653adc5`](https://github.com/Hosyss/buildmeasure/commit/653adc5f9e3b4b63e08c3d003ea300c8aadbd1ed) | Browser QA proved the Brick guide CTA was below a 1280×900 first screen. Shared guide hero/article spacing was reduced conservatively and the Brick quick-answer CTA was moved ahead of its extra reference paragraph. Content and calculator logic are unchanged. | **Closed:** final desktop browser QA confirms the primary CTA is inside the first 1280×900 screen. |
| QA record and cleanup | [`e8430d3`](https://github.com/Hosyss/buildmeasure/commit/e8430d3c27d3b48b94a25fc9d15a59ddb2fd24c9) | Final audit evidence was recorded and all temporary UX QA workflows/scripts were removed. `.github/workflows` is back to the permanent `ci.yml` and `release.yml` only. | **Closed:** normal PR quality gate passed on this cleaned source head. |

### Static-affordance review

The source review found two misleading affordances in the requested scope: the
Brick preset coverage field was rendered as a read-only input, and the homepage
concrete example used bordered dimension boxes that could be read as form
fields. Both are addressed above. The automated source scan now finds no
`readOnly` or `aria-readonly` controls under `app/` or `components/`; the final
browser pass also verified the changed visual surfaces rather than treating the
source scan alone as sufficient.

### QA evidence and preliminary failures

- Pre-PR QA run `31693929003`: **117/117 unit tests passed**, then raw
  repository-wide `npx tsc --noEmit` failed on pre-existing baseline issues:
  missing Cloudflare Worker/D1 ambient types, existing `.ts` import-extension
  configuration, and existing analytics/feedback typing errors. These failures
  occur outside this UX diff and are not relabeled as a pass.
- Pre-PR QA run `31694213667`: **117/117 unit tests passed**; a TypeScript
  compiler semantic check passed for all 17 changed TS/TSX surfaces; lint,
  production build, **29/29 rendered tests**, and the no-readOnly source scan
  passed. Browser QA then found a real UX issue: on 1280×900 the Brick guide
  quick-answer CTA began at about 1036 px and was outside the first screen. The
  run stopped there; Lighthouse and dependency audit were correctly not counted.
- The repo-wide raw `tsc --noEmit` baseline remains an unresolved repository
  tooling/type-definition issue. This branch does not make unrelated Cloudflare,
  database, analytics, or feedback changes merely to suppress it.
- Final browser/automated closure on run `31694577543`: **117/117 unit tests**,
  changed-surface TypeScript diagnostics, lint, production build, **29/29 rendered
  tests**, no-readOnly source scan, and exact 360/768/1280 browser interaction all
  passed. Browser QA covered Brick Imperial/Metric/Custom behavior, page-aware
  header CTAs, homepage example semantics, guide first-screen CTA placement, no
  horizontal overflow, and zero site-originated console/runtime errors.
- Direct local `vinext start` Lighthouse stayed at 88–89 Mobile Performance even
  after two warmups because shared JS/CSS assets were served essentially
  uncompressed. This diagnostic is retained; it was not called a pass.
- Closing run `31695391156` verified gzip on a representative immutable JS asset
  before scoring the same three affected surfaces. Home, Brick, and Brick guide
  scored **99/100/100/100 mobile** and **100/100/100/100 desktop**. The high-risk
  production dependency audit reported zero vulnerabilities. Evidence artifact:
  `ux-clarity-gzip-lighthouse` ID `9179144912`, SHA-256
  `0e08a22ef348d6a5d394e9808b3629d502885797a6a52c94e5b7cf9d8737476e`.
- Normal GitHub PR quality gate run `31696026918`, job `94433885182` passed on
  cleaned head `e8430d3c27d3b48b94a25fc9d15a59ddb2fd24c9`, including `npm run
  qa:automated` and `npm audit --omit=dev --audit-level=high`.

### Review boundary

Draft PR #33 is now the handoff point. Stop here for user/reviewer inspection.
Do **not** mark it ready, merge it, deploy Production, close PR #27 or PR #32,
or submit Google Search Console / IndexNow requests until the user explicitly
continues the release workflow after review.

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
