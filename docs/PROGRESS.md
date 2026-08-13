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

## One-time IndexNow submission

- `npm run seo:indexnow` was executed **once** after the verified Production deployment.
- GitHub Actions run `31713184925`, job `94491147703` completed successfully.
- IndexNow accepted **20 BuildMeasure URLs** with **HTTP 200**.
- The one-time workflow was removed immediately after the successful run so it cannot be triggered again from later branch changes.
- Do **not** repeat this submission unless a future verified Production deployment changes public URLs/content.
- No Manual Request Indexing was used in Google Search Console.

The weighted **Launch-ready v1 remains 97%** because the remaining broader cross-browser/real-user field-data and independent-usability-feedback gaps are unchanged. The approximate master-product vision remains **~2%**.

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
