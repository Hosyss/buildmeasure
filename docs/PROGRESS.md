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

## UX clarity production closure

- PR #33 was reviewed, marked Ready, and merged to `main`.
- Merge commit: `38fcad44ab803e5167f392547f2b4815301a1885`.
- Main quality gate: GitHub Actions `31698057960` — **passed**.
- Verified-source backup: GitHub Actions `31698119121` — **passed**.
- Cloudflare Production: `https://buildmeasure.buildtools.workers.dev/`.
- Definitive production smoke: `31699354811`, job `94444463894` — **passed**.
- Verification covered all seven calculators, all seven focused material guides, health/status/robots/sitemap/llms, a valid analytics POST, exact 360/768/1280 browser widths, homepage Example-estimate semantics, Brick Imperial/Metric/Custom interaction, guide/header CTAs, critical internal destinations, overflow, page errors, and non-analytics same-origin request failures.
- Earlier temporary production-smoke failures are retained in `docs/AUDITS.md` as QA-harness diagnostics rather than rewritten as successes.
- No calculator file under `lib/calculators/` changed in the UX release or this closure.
- PR #27 and PR #32 remain untouched. No Google Search Console manual-indexing request was made.
- IndexNow was submitted once after production verification: run `31713184925`,
  job `94491147703` — **20 canonical URLs accepted with HTTP 200**. The
  one-shot workflow removed itself after success and must not be rerun without
  a new public-content release.

The weighted **Launch-ready v1 remains 97%** because the remaining broader cross-browser/real-user field-data and independent-usability-feedback gaps are unchanged. The approximate master-product vision remains **~2%**.

## Post-launch corrective audit

- A production review found that the Brick Calculator's displayed Imperial to
  Metric conversion could move the documented example across a whole-brick
  boundary (`972` to `973`) because converted form values were limited to seven
  decimal places before recalculation.
- PR #35 was merged to `main` at
  `47f58fd5911aae9a45a7f24f1940c42e30ee295f`. The fix keeps the shared
  calculator engine unchanged, preserves extra precision only for Brick form
  conversions, and adds a permanent regression for the displayed-input path.
- All `118` unit/engine tests passed. Both the pull-request quality gate
  (`31719529624`, job `94512682405`) and the final `main` quality gate
  (run 222) completed successfully.
- Production verification at
  `https://buildmeasure.buildtools.workers.dev/brick-calculator` confirmed the
  default Metric result remains aligned with Imperial: minimum `972`, allowance
  `49`, and order quantity `1,021`.
- The existing public legacy Sites deployment was updated in place to redirect
  directly to the canonical production origin while preserving paths and query
  strings. Sites version 22, commit
  `04c921ce39fe442df269402f34eaaa93adee43f4`, was deployed successfully and
  verified with a live Brick route redirect.
- This corrective audit is closed. The remaining launch gap is unchanged:
  broader Firefox/WebKit coverage plus real-user field data and independent
  usability feedback.

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
