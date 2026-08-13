# Quality Audit Log

This log is the evidence record for the mandatory critical and milestone audit
policy in `docs/QA.md`. A partial or failed record does not approve a release.

## 2026-08-01 — v0.3.1 baseline audit

| Field | Value |
| --- | --- |
| Status | **Partial — gate not passed** |
| Product version | 0.3.1 |
| Source revision | `27dddcdcc24e` |
| Tool | Google Lighthouse 13.4.1 |
| Target | Local production build; this is lab data, not deployed field data |
| Profiles | Lighthouse default mobile and desktop preset |

### Completed measurements

| Route | Profile | Performance | Accessibility | Best Practices | SEO |
| --- | --- | ---: | ---: | ---: | ---: |
| `/` | Mobile | 85 | 95 | 100 | 100 |
| `/` | Desktop | 100 | 95 | 100 | 100 |
| `/concrete-calculator` | Mobile | 84 | 96 | 100 | 100 |
| `/concrete-calculator` | Desktop | 99 | 96 | 100 | 100 |
| `/paint-calculator` | Mobile | 83 | 96 | 100 | 100 |

### Incomplete measurements

- `/paint-calculator` desktop.
- `/tile-calculator` mobile and desktop.

### Findings

- Every completed mobile profile is below the required 95 Performance score.
- Lighthouse reported insufficient color contrast on the homepage and completed
  calculator-page audits.
- Lighthouse estimated roughly 135–141 KiB of unused JavaScript in the
  completed runs.
- Because the matrix is incomplete and required criteria failed, this record is
  not a passed Lighthouse or accessibility baseline.

### Required closure

1. Fix the confirmed contrast failures.
2. Investigate and improve mobile FCP/LCP and unnecessary client JavaScript.
3. Run `npm run qa:automated`.
4. Rerun every live route on mobile and desktop.
5. Add a new complete audit record; do not overwrite this failed baseline.

## 2026-08-01 — v0.3.1 stabilization audit

| Field | Value |
| --- | --- |
| Status | **Partial — automated and Lighthouse gates passed; browser manual review unavailable** |
| Product version | 0.3.1 (unreleased stabilization working tree) |
| Source revision | Base `77353ba2cded` plus code/test patch SHA-256 `b639213b9ff07d2e3b954eca0aae5cead27f289125958f5ffb2e48c26741fbd6` |
| Tool | Google Lighthouse 13.4.1 |
| Target | Local production build; this is lab data, not deployed field data |
| Profiles | Lighthouse default mobile and desktop preset |

### Complete measurements

| Route | Profile | Performance | Accessibility | Best Practices | SEO |
| --- | --- | ---: | ---: | ---: | ---: |
| `/` | Mobile | 97 | 100 | 100 | 100 |
| `/` | Desktop | 100 | 100 | 100 | 100 |
| `/concrete-calculator` | Mobile | 96 | 100 | 100 | 100 |
| `/concrete-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/paint-calculator` | Mobile | 96 | 100 | 100 | 100 |
| `/paint-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/tile-calculator` | Mobile | 96 | 100 | 100 | 100 |
| `/tile-calculator` | Desktop | 100 | 100 | 100 | 100 |

### Automated and audit evidence

- `npm run qa:automated` passed: lint, 48 engine tests, the verified
  production build, and 6 rendered-route tests all completed with zero
  failures.
- All eight Lighthouse runs met the required 95 minimum in every category.
- Color contrast, browser console errors, and `robots.txt` checks passed in
  every Lighthouse report.
- The previous 83–85 mobile Performance range improved to 96–97, and the
  previous 95–96 Accessibility range improved to 100.

### Manual-review limitation

The supervised development preview started and remained healthy, but the cloud
browser could not reach it because of an environment-level browser restriction.
No visual, responsive, keyboard, or calculator-interaction review is claimed in
this record. The completed Lighthouse baseline is passed, but the overall major
milestone gate remains partial under `docs/QA.md`.

### Required closure

1. When preview-browser access is available, inspect the homepage and all three
   calculators at mobile, tablet, and desktop widths.
2. Exercise unit switching, calculation, reset, validation, focus order, and
   primary result actions on every calculator.
3. Confirm no visual overflow or console error, then append a closure record.
4. Do not label this working tree as a completed product release before that
   manual closure is recorded.

## 2026-08-01 — Gravel milestone audit

| Field | Value |
| --- | --- |
| Status | **Partial — automated, desktop interaction, and Lighthouse gates passed; mobile manual interaction remains** |
| Product version | 0.3.1 plus unreleased Gravel milestone |
| Source revision | Base `8ba315643984` plus code/test patch SHA-256 `599424b2c8aa303bc248757e2540b274159f65f849b41a1aec2cc3a2d695d6b8` |
| Tool | Google Lighthouse 13.4.1 |
| Target | Local production build; this is lab data, not deployed field data |
| Profiles | Lighthouse default mobile and desktop preset |

### Complete clean rerun

| Route | Profile | Performance | Accessibility | Best Practices | SEO |
| --- | --- | ---: | ---: | ---: | ---: |
| `/` | Mobile | 97 | 100 | 100 | 100 |
| `/` | Desktop | 100 | 100 | 100 | 100 |
| `/concrete-calculator` | Mobile | 96 | 100 | 100 | 100 |
| `/concrete-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/paint-calculator` | Mobile | 96 | 100 | 100 | 100 |
| `/paint-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/tile-calculator` | Mobile | 96 | 100 | 100 | 100 |
| `/tile-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/gravel-calculator` | Mobile | 96 | 100 | 100 | 100 |
| `/gravel-calculator` | Desktop | 100 | 100 | 100 | 100 |

### Automated, interaction, and audit evidence

- `npm run qa:automated` passed: lint, 59 engine tests, the verified production
  build, and 7 rendered-route tests completed with zero failures.
- Desktop browser review confirmed the Gravel layout has no horizontal
  overflow and exercised the independent known-result vector, Imperial/Metric
  conversion, validation, reset, device-local save, and keyboard-based history
  clearing.
- No site-originated browser console error was observed. Two logged errors came
  from the cloud-browser extension itself and are not application errors.
- Every clean Lighthouse run met the required 95 minimum in every category.
  Color contrast, browser console, and `robots.txt` audits passed in all ten
  reports.

### Failed run and controlled investigation

The first ten-route matrix produced one failed lab result: Paint mobile scored
85 Performance with an isolated 400 ms Total Blocking Time spike. The same
unchanged Paint build was rerun three times after route warm-up and scored 96
Performance each time with 0–10 ms Total Blocking Time. The entire ten-route
matrix was then rerun from the start; the clean results above are that closure
matrix. The failed result remains recorded here and was not silently discarded.

### Remaining manual limitation

The available cloud browser exposed a desktop viewport but no supported mobile
viewport control. Lighthouse performed mobile emulation and found no category
failure, but it does not replace hands-on mobile interaction. The Gravel code
and checkpoint may be shared for review, but the overall milestone release gate
remains partial until mobile and tablet interaction checks are recorded.

### Required closure

1. Exercise Gravel conversion, validation, reset, actions, and saved history at
   360 px and 768 px widths in a supported browser.
2. Confirm no visual overflow, clipped control, focus loss, or site console
   error at those widths.
3. Append a closure record before labeling the milestone as a completed product
   release.

## 2026-08-01 — Mulch milestone audit

| Field | Value |
| --- | --- |
| Status | **Partial — automated, desktop interaction, and Lighthouse gates passed; mobile and tablet manual interaction remain** |
| Product version | 0.3.1 plus unreleased Gravel and Mulch milestones |
| Source revision | Base `27f7bfec509f` plus functional working-tree patch (excluding this audit log) SHA-256 `b74f90df1db0ce87da7bdbd786c968101de8f5db53d67eaccebcc0e6a64de415` |
| Tool | Google Lighthouse 13.4.1 with Chromium 149.0.7827.0 |
| Target | Local production build; this is lab data, not deployed field data |
| Profiles | Lighthouse default mobile and desktop preset |

### Complete clean matrix

| Route | Profile | Performance | Accessibility | Best Practices | SEO |
| --- | --- | ---: | ---: | ---: | ---: |
| `/` | Mobile | 96 | 100 | 100 | 100 |
| `/` | Desktop | 100 | 100 | 100 | 100 |
| `/concrete-calculator` | Mobile | 96 | 100 | 100 | 100 |
| `/concrete-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/paint-calculator` | Mobile | 96 | 100 | 100 | 100 |
| `/paint-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/tile-calculator` | Mobile | 96 | 100 | 100 | 100 |
| `/tile-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/gravel-calculator` | Mobile | 96 | 100 | 100 | 100 |
| `/gravel-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/mulch-calculator` | Mobile | 96 | 100 | 100 | 100 |
| `/mulch-calculator` | Desktop | 100 | 100 | 100 | 100 |

### Automated, interaction, and audit evidence

- `npm run qa:automated` passed: lint, 71 engine tests, the verified production
  build, and 9 rendered-application tests completed with zero failures.
- The rendered suite now verifies that every internal page link resolves in the
  built application.
- Desktop browser review confirmed no horizontal overflow and exercised the
  documented 20 ft × 10 ft × 3 in known-result vector, Imperial/Metric round
  trip, invalid input, 0% and 50% allowances, reset, copy, device-local save,
  history clearing by keyboard, and focus movement.
- No site-originated browser console error was observed. Logged errors came
  from the cloud-browser extension and not from a BuildMeasure URL.
- Every valid Lighthouse run met the required 95 minimum in every category.
  Color contrast, browser console, `robots.txt`, and HTTP-status audits passed
  in all twelve reports.

### Invalid preliminary run

The first Mulch mobile attempt used a `single-process` Chromium launch flag and
produced no Lighthouse screenshots, leaving Performance unscored. It was
recorded as an invalid tool configuration rather than a product result. The
flag was removed, a valid diagnostic scored 95 Performance, and the complete
clean matrix above then scored 96 on every mobile route.

### Remaining manual limitation

The available cloud browser exposed a 1363 px desktop viewport with no
supported viewport-resize control. Lighthouse mobile emulation confirmed the
responsive CSS and audit categories, but it cannot replace hands-on interaction
at 360 px and 768 px. Pointer automation also did not activate the below-fold
Clear all button, while keyboard activation cleared history correctly; touch
activation should therefore be included in the mobile closure.

### Required closure

1. Exercise Mulch conversion, validation, reset, actions, saved history, and
   Clear all at 360 px and 768 px widths in a supported browser.
2. Confirm no overflow, clipped control, focus loss, touch-target failure, or
   site console error at those widths.
3. Complete the equivalent cross-route manual matrix before labeling v1 ready.

## 2026-08-01 — v0.4.0 launch-hardening audit

| Field | Value |
| --- | --- |
| Status | **Passed — launch-hardening source gate** |
| Product version | 0.4.0 |
| Source revision | Base `2fe2d3bf281f` plus complete source snapshot SHA-256 `aece0813d0b4f4c86a95c5aa72aaad68d50fc82f2fcfffc630b74d5095222e9e` (all tracked and new source files except this audit log) |
| Tool | Google Lighthouse 13.4.1 with Chromium 149.0.7827.0 |
| Target | Local production build; this is lab data, not deployed field data |
| Profiles | Lighthouse default mobile and desktop preset |

### Required homepage and calculator matrix

| Route | Profile | Performance | Accessibility | Best Practices | SEO |
| --- | --- | ---: | ---: | ---: | ---: |
| `/` | Mobile | 97 | 100 | 100 | 100 |
| `/` | Desktop | 100 | 100 | 100 | 100 |
| `/concrete-calculator` | Mobile | 96 | 100 | 100 | 100 |
| `/concrete-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/paint-calculator` | Mobile | 96 | 100 | 100 | 100 |
| `/paint-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/tile-calculator` | Mobile | 96 | 100 | 100 | 100 |
| `/tile-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/gravel-calculator` | Mobile | 96 | 100 | 100 | 100 |
| `/gravel-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/mulch-calculator` | Mobile | 96 | 100 | 100 | 100 |
| `/mulch-calculator` | Desktop | 100 | 100 | 100 | 100 |

### Extended launch-content matrix

| Route | Profile | Performance | Accessibility | Best Practices | SEO |
| --- | --- | ---: | ---: | ---: | ---: |
| `/guides/material-estimating-basics` | Mobile | 96 | 100 | 100 | 100 |
| `/guides/material-estimating-basics` | Desktop | 100 | 100 | 100 | 100 |
| `/methodology` | Mobile | 96 | 100 | 100 | 100 |
| `/methodology` | Desktop | 100 | 100 | 100 | 100 |
| `/about` | Mobile | 96 | 100 | 100 | 100 |
| `/about` | Desktop | 100 | 100 | 100 | 100 |
| `/privacy` | Mobile | 96 | 100 | 100 | 100 |
| `/privacy` | Desktop | 100 | 100 | 100 | 100 |
| `/terms` | Mobile | 96 | 100 | 100 | 100 |
| `/terms` | Desktop | 100 | 100 | 100 | 100 |
| `/feedback` | Mobile | 96 | 100 | 100 | Not run — intentionally `noindex` |
| `/feedback` | Desktop | 100 | 100 | 100 | Not run — intentionally `noindex` |

### Automated and manual evidence

- `npm run qa:automated` passed with zero failures: lint, 76 unit and engine
  tests, the verified production build, artifact validation, and 13 rendered
  application/API tests.
- Every calculator was exercised at exact 360 px and 768 px content widths.
  The checks covered horizontal overflow, independent known-result vectors,
  Imperial/Metric round trips, validation and reset recovery, copy, device-local
  save and Clear all, print activation, focus movement, and pointer activation.
- All visible calculator actions meet the 44 px target. The Paint ceiling
  checkbox retains a native hidden input while its visible selectable card is
  substantially larger than 44 px and toggled correctly by pointer.
- The five independent vectors matched their documented results: Concrete
  1 yd³/45 80-lb bags; Paint 1,000 ft²/2.5 gal/3 one-gallon cans; Tile
  132 required/14 boxes/140 purchased; Gravel 1.358 yd³/3,410 lb/1.705 tons/69
  bags; and Mulch 2.037 yd³/8 ft² per bag/28 bags.
- A real local D1 feedback submission returned receipt `BM-000001`; the
  feedback form remained anonymous and returned to its selected calculator.
  The private inbox authorization path and configured owner-only access were
  also inspected without exposing the owner identity.
- Fresh browser navigation across the homepage, calculators, feedback, guide,
  methodology, privacy, terms, about, and status surfaces produced zero
  site-originated console errors. Browser-extension messages were excluded.
- Rendered application tests verify all internal links and the response
  security headers. The status surface reported calculator and feedback
  storage operational in the supervised local preview.

### Lighthouse findings

- All 24 valid reports met the applicable 95 minimum; there were no Lighthouse
  run warnings and no Accessibility, Best Practices, or SEO category failure.
- Mobile FCP was 0.9 s, CLS was 0, and TBT ranged from 0–50 ms. Mobile LCP was
  2.6–2.9 s and was the only sub-perfect weighted performance metric; the
  aggregate mobile Performance scores remained 96–97.
- Feedback SEO was deliberately omitted because the report-submission route is
  correctly marked `noindex`; its Performance, Accessibility, and Best
  Practices categories were still audited on both profiles.

### Remaining launch work

- Publish and verify the private checkpoint on the existing `buildmeasure`
  site. Changing access to public remains a separate, explicit approval gate.
- Complete broader real-browser coverage and establish deployed field
  monitoring after launch; Lighthouse results above are local lab evidence.
- Connect search operations after public launch and expand the useful content
  library without weakening calculator accuracy or privacy.

## 2026-08-01 — v0.4.1 public-launch audit

| Field | Value |
| --- | --- |
| Status | **Passed — public deployment, external performance, and security gates** |
| Product version | 0.4.1 |
| Deployed source revision | `d95ae9fe135` |
| Production target | [buildmeasure.hosys.chatgpt.site](https://buildmeasure.hosys.chatgpt.site) with public access |
| External tools | Google PageSpeed Insights and MDN HTTP Observatory |
| Regression tool | Google Lighthouse 13.4.1 with Chromium 149.0.7827.0 |

### External production evidence

| Profile | Performance | Accessibility | Best Practices | SEO | Agentic browsing |
| --- | ---: | ---: | ---: | ---: | ---: |
| Mobile | 100 | 100 | 100 | 100 | 2/2 |
| Desktop | 100 | 100 | 100 | 100 | 2/2 |

- The public [PageSpeed Insights report](https://pagespeed.web.dev/analysis/https-buildmeasure-hosys-chatgpt-site/6yk54ts2uv?form_factor=desktop)
  recorded mobile FCP 0.9 s, LCP 1.4 s, TBT 0 ms, CLS 0, and Speed Index
  2.3 s. Desktop recorded FCP 0.2 s, LCP 0.3 s, TBT 0 ms, CLS 0, and
  Speed Index 0.5 s.
- PageSpeed reported no field data yet, which is expected for a newly public
  site; the scores above are production lab results rather than real-user Core
  Web Vitals.
- The first [MDN HTTP Observatory report](https://developer.mozilla.org/en-US/observatory/analyze?host=buildmeasure.hosys.chatgpt.site)
  scored B+ 80/100 because the launch CSP did not explicitly restrict script
  execution. Version 0.4.1 replaced that fallback with exact SHA-256 hashes for
  every inline application script and retained same-origin bundles.
- A fresh post-deployment Observatory scan at 2026-08-01 15:05:01 GMT scored
  **A+ 115/100**. Every scored security test passed. Observatory retained a
  non-scoring recommendation to remove `unsafe-inline` from `style-src`; SRI
  was also non-scoring because all scripts load from the same origin.
- The W3C validator attempt reached a Cloudflare human-verification challenge
  in the audit browser. No validator result is claimed from that attempt.

### Post-fix regression evidence

| Route | Mobile P/A/BP/SEO | Desktop P/A/BP/SEO |
| --- | --- | --- |
| `/` | 96/100/100/100 | 100/100/100/100 |
| `/concrete-calculator` | 96/100/100/100 | 100/100/100/100 |
| `/paint-calculator` | 96/100/100/100 | 100/100/100/100 |
| `/tile-calculator` | 96/100/100/100 | 100/100/100/100 |
| `/gravel-calculator` | 96/100/100/100 | 100/100/100/100 |
| `/mulch-calculator` | 96/100/100/100 | 100/100/100/100 |

- `npm run qa:automated` passed with zero failures: lint, 76 unit and engine
  tests, the verified build, artifact validation, and 13 rendered tests.
- The 12-run local production matrix above passed every required threshold.
  An initial two-run homepage check scored 92 Best Practices because the local
  CSP blocked the production-absolute favicon. The image policy was corrected,
  the site rebuilt, and the complete clean matrix was rerun; the partial result
  remains recorded here rather than being silently discarded.
- The deployed Concrete calculator also reproduced the independent 9 ft × 9 ft
  × 4 in, 0% allowance, 80 lb vector: 1 yd³, 27 ft³, and 45 bags.

### Remaining evidence, not release blockers

- Gather real-user Core Web Vitals and feedback after sufficient public use.
- Add broader device/browser coverage and independent usability review.
- Connect search operations and verify indexation after discovery data exists.

## 2026-08-01 — v0.4.2 search-operations audit

| Field | Value |
| --- | --- |
| Status | **Passed — search ownership, discovery, and live indexability gates; broader browser execution remains inconclusive** |
| Product version | 0.4.2 |
| Source revision | Base `6e9d8e7` plus the verification cleanup and evidence recorded by this checkpoint |
| Production target | [buildmeasure.hosys.chatgpt.site](https://buildmeasure.hosys.chatgpt.site) with public access |
| Search tool | Google Search Console URL-prefix property |
| Browser tool | Playwright 1.62.1 with Firefox 153 and WebKit 26.5 downloaded in the audit environment |

### Search operations evidence

- Google Search Console ownership verification succeeded using the permanent
  `google6d67c58ff3b5201c.html` verification artifact. The hosting layer
  redirects that filename to an extensionless same-domain URL whose response
  contains the exact token; Google supports same-domain redirects for this
  verification method and accepted the property.
- `sitemap.xml` was submitted successfully through the verified property.
- A live homepage inspection reported that the URL is available to Google and
  can be indexed, with page availability passing.
- A subsequent manual indexing request reached Search Console's daily request
  quota. No successful manual request is claimed; the submitted sitemap remains
  the normal discovery path, and the quota message does not indicate a site,
  account, or payment failure.

### Cross-browser execution result

- Firefox and WebKit runtime packages were installed outside the project and
  launch attempts were time-bounded so an environment failure could not stall
  the release workflow.
- Firefox could not start reliably because the container denied required
  sandbox/framebuffer operations and exposed no writable font cache.
- WebKit could not start because the container image lacks its required GTK,
  GStreamer, graphics, text, and system integration libraries.
- These are audit-environment limitations, not observed BuildMeasure failures.
  No Firefox, Safari, or WebKit compatibility pass is claimed. Existing
  Chromium interaction, Lighthouse, PageSpeed, and security evidence remains
  valid for the environments actually tested.

### Remaining evidence, not release blockers

- Run the launch routes in real Firefox and Safari or a fully provisioned
  WebKit environment.
- Gather real-user Core Web Vitals and independent usability feedback after
  sufficient public use.

## 2026-08-01 — v0.5.0 anonymous-usage monitoring audit

| Field | Value |
| --- | --- |
| Status | **Passed — automated, build, privacy, and Chromium interaction gates** |
| Product version | 0.5.0 |
| Production target | [buildmeasure.hosys.chatgpt.site](https://buildmeasure.hosys.chatgpt.site) with public access |
| Automated result | ESLint, 81 unit/engine tests, production build, and 14 rendered-application tests passed |
| Interaction target | Local Sites preview in the connected Chromium browser |

### Monitoring evidence

- A calculator field change was exercised in the built Concrete page and the
  live result updated from the changed value without reload or client error.
- An engaged session requires a field, unit, or reset interaction; a request or
  calculator-page open alone is not counted as engaged usage.
- Event names, calculators, routes, session token shape, browser/device class,
  locale, referrer host, campaign fields, and error detail are allowlisted and
  length bounded before storage. Invalid API input is rejected before D1 access.
- The owner dashboard uses the existing authenticated-owner boundary and is
  marked `noindex, nofollow`.
- Analytics records expire after 90 days. The BuildMeasure event log stores no
  IP address, name, email address, raw user-agent string, or persistent analytics
  cookie. The public privacy policy discloses the fields and retention period.
- The generated D1 migration was inspected and contains only the new analytics
  event table and its time, event, and session indexes.

### Remaining evidence, not release blockers

- Gather enough independent real-user sessions to establish conversion,
  failure, and browser-error baselines; no conclusions are drawn from owner or
  synthetic usage.
- Complete broader real-device Safari and Firefox interaction coverage.

## 2026-08-13 — Post-hole concrete calculator milestone audit

| Field | Value |
| --- | --- |
| Status | **Passed — automated, supervised Chromium interaction, and Lighthouse milestone gates** |
| Product version | 0.5.3 plus Post-hole calculator milestone |
| Audited product source revision | `1c2a8bf267dde38c0141bf0d887a17ff9cabf8ff` |
| CI run | GitHub Actions run #84 (`31665167446`) |
| Tool | Google Lighthouse 13.4.1 |
| Target | Local production build on GitHub-hosted Ubuntu runner; lab data, not deployed field data |
| Profiles | Lighthouse default mobile and desktop preset |

### Complete milestone matrix

| Route | Profile | Performance | Accessibility | Best Practices | SEO |
| --- | --- | ---: | ---: | ---: | ---: |
| `/` | Mobile | 99 | 100 | 100 | 100 |
| `/` | Desktop | 100 | 100 | 100 | 100 |
| `/concrete-calculator` | Mobile | 98 | 100 | 100 | 100 |
| `/concrete-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/paint-calculator` | Mobile | 99 | 100 | 100 | 100 |
| `/paint-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/tile-calculator` | Mobile | 99 | 100 | 100 | 100 |
| `/tile-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/gravel-calculator` | Mobile | 99 | 100 | 100 | 100 |
| `/gravel-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/mulch-calculator` | Mobile | 99 | 100 | 100 | 100 |
| `/mulch-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/post-hole-concrete-calculator` | Mobile | 99 | 100 | 100 | 100 |
| `/post-hole-concrete-calculator` | Desktop | 100 | 100 | 100 | 100 |

### Automated and interaction evidence

- The integrated PR merge result passed the complete automated quality gate:
  lint, 95 unit/engine tests, verified production build, 17 rendered
  application/API tests, internal-link resolution, and the production
  dependency audit with 0 high-risk vulnerabilities.
- The independent Post-hole vector was reproduced in the supervised Chromium
  flow: one 12 in diameter hole × 24 in concrete depth, no post displacement,
  0% allowance, 80 lb bags → about 1.571 ft³ and 3 complete bags.
- Imperial → Metric → Imperial changed 12 in → 30.48 cm → 12 in and 24 in →
  60.96 cm → 24 in without visible round-trip drift.
- No-post, round-post, and square-post displacement, post-fit validation,
  allowance changes, all 40/60/80 lb bag selections, required-field validation,
  reset/recovery, copy, save/history, clear history, print activation, and
  keyboard focus were exercised.
- Desktop, exact 360 px, and exact 768 px Chromium layouts showed no horizontal
  overflow or clipped primary controls/results, and no site-originated console
  error was observed in the audited interaction flow.
- The conversation container's managed Chromium blocks direct navigation by
  policy. The supervised interaction pass therefore loaded the built HTML,
  CSS, and JavaScript through a QA harness and isolated only origin-dependent
  analytics/storage plumbing. GitHub Actions Lighthouse independently navigated
  the real local production-build origin for every scored report.

### Preliminary Lighthouse runs and controlled closure

- The first temporary CI matrix served local assets without transfer
  compression and under-reported mobile Performance. The QA preview was changed
  to gzip text assets to match normal deployed transfer behavior; no product
  code or Lighthouse threshold was changed.
- The next matrix exposed a first-process runner anomaly on the homepage:
  Homepage mobile scored 80 Performance while the identical shared framework
  chunk consumed about 999 ms of scripting. In later fresh Lighthouse processes
  in the same run, that identical chunk consumed about 409 ms and then 168 ms,
  while calculator mobile scores rose to 96–99. This identified hosted-runner
  cold-start/toolchain variance rather than homepage-specific JavaScript.
- Run #84 therefore performed two explicit non-scored Lighthouse warm-up passes
  before collecting the required 14 reports. The warm-ups are excluded from
  release evidence; the scored reports still use the unchanged 95 minimum.
  The complete clean matrix above then passed every category.
- Failed and diagnostic runs remain described here and were not silently
  discarded or relabeled as passes.

### Release decision

The Post-hole calculator milestone satisfies the source QA gate for the audited
product source. Temporary QA collection plumbing must be removed and the normal
GitHub quality gate rerun on the cleaned PR head before merge. After merge,
verify the Cloudflare production deployment and the new route before submitting
that production URL to IndexNow once.

## Record template

Create a new dated section for every critical or milestone gate. Include the
product version, source revision, tool version, target environment, complete
route/profile score matrix, failed audits, automated and manual results, final
status, and required follow-up.

## 2026-08-13 — Production brand and identity hardening audit

| Field | Value |
| --- | --- |
| Status | **Passed — production brand/metadata source gate** |
| Product version | 0.5.3 plus unreleased brand hardening |
| Source revision | `abfccd72a116690e96c83de0ec653735820c3016` |
| CI evidence | GitHub Actions run #92 (`31666819247`) |
| Tool | Google Lighthouse 13.4.1 on GitHub-hosted Ubuntu runners |
| Target | Local production build served by the QA Worker harness; lab data, not deployed field data |
| Profiles | Lighthouse default mobile and desktop preset |

### Complete closing matrix

| Route | Profile | Performance | Accessibility | Best Practices | SEO |
| --- | --- | ---: | ---: | ---: | ---: |
| `/` | Mobile | 99 | 100 | 100 | 100 |
| `/` | Desktop | 100 | 100 | 100 | 100 |
| `/concrete-calculator` | Mobile | 99 | 100 | 100 | 100 |
| `/concrete-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/post-hole-concrete-calculator` | Mobile | 99 | 100 | 100 | 100 |
| `/post-hole-concrete-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/paint-calculator` | Mobile | 99 | 100 | 100 | 100 |
| `/paint-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/tile-calculator` | Mobile | 99 | 100 | 100 | 100 |
| `/tile-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/gravel-calculator` | Mobile | 99 | 100 | 100 | 100 |
| `/gravel-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/mulch-calculator` | Mobile | 99 | 100 | 100 | 100 |
| `/mulch-calculator` | Desktop | 100 | 100 | 100 | 100 |

### Automated and affected-surface evidence

- `npm run qa:automated` passed with zero failures: lint, 95 unit/engine tests,
  the verified production build, artifact validation, and 18 rendered
  application/API tests.
- `npm audit --omit=dev --audit-level=high` reported zero vulnerabilities.
- Rendered production tests verify that the `codex-preview` development marker
  is absent, the public `Hosyss` maintainer identity is present, About explains
  ownership and device-local saving, Post-hole is included in route coverage,
  Project Mode is not promoted as a live public feature, canonical URLs remain
  on the current Workers origin, and internal links resolve.
- No calculator engine, formula, unit conversion, validation, or procurement
  behavior changed in this milestone.
- The complete closing Lighthouse matrix met the required 95 minimum in all
  four categories on every required route/profile.

### Failed first attempt and controlled closure

The first matrix on the same source revision failed only one measurement:
`/concrete-calculator` mobile Performance scored 89 while every other mobile
route scored 99 and every desktop route scored 100. The failed Concrete report
showed 430 ms Total Blocking Time and an isolated approximately 659 ms execution
cost in the shared `framework-DjWA_DlG.js` chunk. In the same run that identical
framework chunk cost approximately 178 ms on Post-hole and 147 ms on the
homepage. No Concrete source was changed by this PR.

The exact same GitHub Actions job was rerun on the exact same source revision,
with no threshold, application, or audit-method change. The complete 14-report
matrix then passed: every mobile route scored 99 Performance, every desktop
route scored 100 Performance, and Accessibility, Best Practices, and SEO were
100 everywhere. The original failed result is retained here as hosted-runner
variance rather than silently discarded.

### Release follow-up

After merge, verify the deployed homepage, `/about`, metadata, `llms.txt`, and
calculator navigation on the canonical production origin before describing the
change as deployed. Submit the changed public URLs to IndexNow once only after
that production verification, following `docs/INDEXING.md`.

## 2026-08-13 — Optional purchase cost estimator milestone audit

| Field | Value |
| --- | --- |
| Status | **Passed — source milestone gate; production verification still required after merge** |
| Product version | 0.5.3 plus unreleased optional cost estimator |
| Verified source revision | `7221b0eb552997561bad3a18feaa19731b9c75ca` |
| Final milestone run | GitHub Actions `31670220083`, job `94353111799` |
| Audit tool | Google Lighthouse 13.4.1 plus supervised headless Chrome interaction QA |
| Target | Local production Worker build on GitHub-hosted Ubuntu; lab evidence, not deployed field data |
| Profiles | Exact 360 px, 768 px, 1280 px browser checks; Lighthouse default mobile and desktop preset |

### Feature boundary

The optional cost layer prices only the complete purchase package already returned by the verified calculator engine. It does not change geometry, unit conversion, allowance, material quantity, or procurement rounding. No file under `lib/calculators/` changed in this milestone.

- Concrete slab: selected 40/60/80 lb bag.
- Post-hole concrete: selected 40/60/80 lb bag.
- Paint: selected can/pail container.
- Tile: complete box.
- Gravel: user-defined bag weight.
- Mulch: user-defined bag volume.
- No live price, exchange rate, tax, delivery, labor, discount, or supplier minimum is inferred.

### Automated gate

- `npm run qa:automated` passed with lint, **103/103** unit/engine tests, the verified production build, artifact validation, and **19/19** rendered application/API tests.
- `npm audit --omit=dev --audit-level=high` reported zero vulnerabilities.
- Cost helper coverage includes blank price, zero price, decimal price, currency-label handling, negative/non-finite price rejection, unsafe purchase quantities, bounded labels, and unsafe totals.
- Rendered-route coverage verifies the correct optional purchase-price field on all six live calculators while preserving existing canonical, structured-content, and internal-link checks.

### Supervised browser interaction evidence

The final browser matrix used the built Worker with Google Chrome, explicitly dismissed the Analytics consent prompt through the visible **No thanks** control after navigation, and verified that the overlay was gone before interacting with the calculator.

| Calculator | Purchase unit | Default purchase qty | Test price | Expected/observed cost | Product change clears stale price | Metric switch |
| --- | --- | ---: | ---: | ---: | --- | --- |
| Concrete | 80 lb bag | 147 | EGP 10 | EGP 1,470 | 80 lb → 40 lb | Preserves same-package price |
| Post-hole concrete | 80 lb bag | 10 | EGP 10 | EGP 100 | 80 lb → 40 lb | Preserves same-package price |
| Paint | 1 gal container | 2 | EGP 10 | EGP 20 | 1 gal → 1 qt | Clears because package set changes |
| Tile | box | 14 | EGP 10 | EGP 140 | 10 → 11 tiles/box | Preserves same-package price |
| Gravel | 50 lb bag | 103 | EGP 10 | EGP 1,030 | 50 lb → 55 lb | Preserves same physical bag price |
| Mulch | 2 ft³ bag | 28 | EGP 10 | EGP 280 | 2 ft³ → 3 ft³ | Preserves same physical bag price |

For every calculator the supervised matrix also verified:

- blank price leaves the material result unchanged and shows no cost total;
- `$`, `EUR`, and `EGP` behave as display labels only;
- explicit zero price is accepted;
- negative price, missing currency label, overlong currency label, and unsafe numeric totals produce a cost-only error while the valid material estimate remains visible;
- browser sanitization of a non-finite number-field entry was observed, while direct non-finite rejection remains covered by unit tests;
- Copy and device-local Save include a valid cost and stay quantity-only when price is blank;
- Print remains wired with and without a cost estimate;
- keyboard Tab order moves from the purchase-price input to the currency-label input;
- package-definition changes clear stale prices according to `docs/COST_ESTIMATOR.md`;
- browser console/runtime errors were zero.

### Responsive and visual review

At exact 360, 768, and 1280 px widths, each calculator reported no horizontal overflow. The 360 px screenshots show the optional price and currency fields stacked clearly with the material-result panel remaining within the viewport width. Desktop screenshots show the cost summary inside the existing result panel; for example the Concrete default displays `EGP 1,470.00` and `147 × EGP 10.00 per 80 lb bag`. The Analytics consent overlay was explicitly removed before the final visual evidence was captured.

### Final Lighthouse matrix

| Route | Mobile P/A/BP/SEO | Desktop P/A/BP/SEO |
| --- | --- | --- |
| `/` | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| `/concrete-calculator` | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| `/post-hole-concrete-calculator` | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| `/paint-calculator` | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| `/tile-calculator` | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| `/gravel-calculator` | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| `/mulch-calculator` | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |

Every required category remains above the project minimum of 95.

### Failed and incomplete attempts retained as evidence

1. The first normal PR quality gate exposed a brittle rendered-HTML assertion because React split dynamic label text with SSR comment markers. Unit tests and build were already green. The UI was given an explicit accessible `aria-label` and the rendered assertion was stabilized; the next normal gate passed completely.
2. An earlier Lighthouse attempt on the same feature measured Paint Desktop Performance at 81 while Paint Mobile was 99 and every other desktop route was 100. The failed report showed approximately 431 ms Total Blocking Time driven by an isolated roughly 507 ms execution of the shared framework chunk. The exact same job was rerun on the exact same source with no application, threshold, or methodology change and the complete 14-report matrix passed. The 81 is retained as hosted-runner variance rather than silently discarded.
3. Review of the first successful screenshot artifact found the Analytics consent prompt obscuring part of the screenshots. That visual evidence was therefore treated as incomplete, not passed. The browser harness was changed to dismiss the visible prompt before interaction and capture a stable cost-result target.
4. The first improved visual run could not open Chrome remote debugging because the current hosted Chrome rejects remote debugging on the default profile. No product code failed. The QA harness was updated to use an isolated temporary `--user-data-dir`, after which the complete browser and Lighthouse milestone gate passed.

### Release follow-up

Before describing the cost estimator as released, the feature branch must remove all temporary QA scripts/workflows, pass the normal final GitHub quality gate on the cleaned head, merge through PR review, pass the main-branch release checks, deploy successfully to the existing Cloudflare Worker, and be verified on the canonical production origin. Only after verified production content changes should IndexNow be submitted once, following `docs/INDEXING.md`.

## 2026-08-13 — Post-hole concrete long-tail guide SEO milestone audit

| Field | Value |
| --- | --- |
| Status | **Passed — source SEO/content milestone gate; final clean CI and production verification still required before release** |
| Product version | 0.5.3 plus targeted Post-hole concrete guide milestone |
| Audited product source revision | `16ab7e0192b0dab07849616ece3a45aa45a6c1f0` |
| Successful milestone run | GitHub Actions `31677609841`, job `94375541253` |
| Evidence artifact | `post-hole-guide-milestone-qa` — ID `9172250593`, SHA-256 `7f902403b6b7820c684cf8e1a79dd4353d0c26fc4c47f74ab9b0ddd183b25c68` |
| Audit tool | Google Lighthouse 13.4.1 plus supervised headless Chrome guide QA |
| Target | Local production Worker build on GitHub-hosted Ubuntu; lab evidence, not deployed field data |
| Profiles | Exact 360 px, 768 px, and 1280 px browser checks; Lighthouse default mobile and desktop preset |

### Scope and content safeguards

- Added one focused long-tail route, `/guides/how-many-bags-of-concrete-for-post-holes`, instead of mass-generating thin pages.
- The guide reuses the reviewed Post-hole quantity assumptions and documented Sakrete 40/60/80 lb example yields without changing any calculator engine under `lib/calculators/`.
- The controlled 12 in diameter × 24 in concrete-depth example is explicitly labeled as a calculation example, not a recommended hole size.
- The content does not prescribe hole diameter, embedment depth, frost depth, footing geometry, reinforcement, soil, wind-load, or code requirements.
- Visible structured data is limited to Article, BreadcrumbList, and FAQPage; no HowTo structured data is published.
- The guide is linked from the homepage and Post Hole Concrete Calculator and is listed in the sitemap and `llms.txt`.

### Automated gate

- `npm run qa:automated` passed with lint, **103/103** unit/engine tests, the verified production build and artifact validation, and **21/21** rendered application/API/content tests.
- The two guide-specific rendered tests verify HTTP 200 rendering, canonical metadata, Article/Breadcrumb/FAQ structured data, absence of HowTo schema, known example values, structural-design disclaimers, homepage/calculator discovery, sitemap discovery, and `llms.txt` discovery.
- `npm audit --omit=dev --audit-level=high` reported zero vulnerabilities.

### Supervised browser evidence

- The final guide browser matrix passed at exact **360 px, 768 px, and 1280 px**.
- It verified the production canonical URL, Article/BreadcrumbList/FAQPage schema types, absence of HowTo schema, known-result copy, explicit “not a recommended hole size” language, calculator/slab-guide/source links, and dismissal of the analytics-consent overlay before visual evidence.
- The homepage and Post-hole calculator both expose the new guide link.
- Final browser evidence recorded zero site-originated console/runtime errors and no page-level horizontal overflow.

### Lighthouse closing matrix

| Route group | Mobile P/A/BP/SEO | Desktop P/A/BP/SEO |
| --- | --- | --- |
| Homepage | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| All six live calculators | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| `/guides/how-many-bags-of-concrete-for-post-holes` | **99 / 96 / 100 / 100** | **100 / 96 / 100 / 100** |

All 16 scored Lighthouse reports met the project minimum of 95 in every audited category. Two explicit warm-up passes were excluded from scored release evidence; the threshold was not changed.

### Preliminary failure and controlled fix

The first milestone browser run (`31677432511`, job `94374986891`) exposed a **real responsive defect** before Lighthouse was allowed to run: at a 360 px viewport the guide document expanded to **467 px**. The failure was not treated as runner variance or ignored.

Investigation traced the overflow to the guide grid's min-content sizing: the reference table correctly used an internal horizontal-scroll wrapper and a 560 px table minimum, but `.guide-body` lacked `min-width: 0`, allowing the grid item to widen the page before the wrapper could contain the table. The permanent guide-layout containment fix adds `min-width: 0` to `.guide-body`. The full browser QA then passed at 360/768/1280 px, and only after that did the 16-report Lighthouse matrix run and pass.

### Release follow-up

Before describing this guide as released, remove all temporary milestone QA workflows/scripts, run the normal GitHub quality gate on the cleaned PR head, merge through PR review, pass main-branch checks, verify the Cloudflare Workers deployment and the new guide on the canonical production origin, then submit only the changed public URLs to IndexNow once. Do not use the exhausted manual Google Search Console indexing quota.

## 2026-08-13 — Post-hole guide primary-action contrast hotfix

| Field | Value |
| --- | --- |
| Status | **Passed — targeted accessibility regression closed before release** |
| Source fix | `app/guides/guides.css` on PR #29 |
| Root cause | `.guide-body a` overrode `.button-primary` text color, producing Lighthouse-reported 1.11:1 contrast on “Calculate my post holes” |
| Fix | `.guide-body a.button-primary { color: var(--white); }` |
| Automated gate | GitHub Actions run `31679009213` passed normal quality gate and production dependency audit |
| Targeted Lighthouse | GitHub Actions run `31679116129`, job `94380263648`, Lighthouse 13.4.1 |
| Evidence artifact | `guide-contrast-qa`, ID `9172764363`, SHA-256 `79eeb48c8461ca65a6cd7c45fe6d709fe19c924f01aed9cb22656c97413646d0` |

### Closing scores

- Guide mobile: Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**.
- Guide desktop: Performance **100**, Accessibility **100**, Best Practices **100**, SEO **100**.
- Lighthouse `color-contrast` audit score is **1 (pass)** on both profiles.
- This hotfix changes only the primary-link text color inside guide content. No calculator engine, formula, route, metadata, or guide copy changed.

### Release follow-up

Remove all temporary contrast-QA workflow/server files, pass the normal clean-head quality gate, merge through PR review, verify the changed guide on the canonical production origin, then submit only that changed guide URL to IndexNow once. Do not use the exhausted manual Google Search Console indexing quota.


## 2026-08-13 — Brick Calculator milestone audit

| Field | Value |
| --- | --- |
| Status | **Passed — automated, supervised browser interaction, supplemental interaction, and Lighthouse milestone gates** |
| Product version | 0.5.3 plus unreleased Brick Calculator milestone |
| Primary milestone source | `551e1c5c6f8eef0b4ad067f9d220b06c4034bef3` |
| Supplemental QA source | `16aa5ca985c093efd931254399fbc05d902a9ea1` |
| Lighthouse | Google Lighthouse 13.4.1 |
| Target | Local production Worker build; lab evidence, not deployed field data |

### Formula and automated evidence

- Brick quantity logic is isolated in `lib/calculators/brick.ts`; optional purchase pricing stays in the shared cost layer and does not alter the quantity engine.
- Primary formula/reference basis: Brick Industry Association Technical Note 10 wall-area method and Table 4 running/stack-bond estimating quantities, BIA fired-clay material scope, and NIST SP 811 unit conversions.
- Verified vectors include Modular 675 bricks / 100 ft², Standard 655 / 100 ft², and the 20 ft × 8 ft wall minus 16 ft² openings example: 972 net bricks and 1,021 bricks after a 5% waste/breakage allowance with final upward rounding.
- Final milestone run `31683010849` passed the complete automated gate: **116/116 unit/engine tests**, verified production build, **24/24 rendered application tests**, internal-link discovery, and high-risk production dependency audit with zero reported vulnerabilities.
- A permanent analytics regression confirms `brick-calculator` is accepted by the bounded shared analytics validator; rendered feedback coverage confirms the Brick feedback ID is accepted.

### Supervised browser evidence

Final milestone run `31683010849` passed the Brick interaction matrix against the production Worker build:

- Default 1,021-brick vector, Modular 675 at 0% waste, Modular 709 at 5%, and Standard 655 at 0%.
- All documented BIA presets plus editable Custom / supplier coverage.
- Openings subtraction, 0/5/25/50% waste, invalid coverage/openings/waste states, Imperial ↔ Metric round trip, and final procurement rounding.
- Optional price-per-brick behavior, stale-price clearing when the brick definition changes, price preservation during unit-system conversion, and valid quantity retention when cost input is invalid.
- Copy, Save, device-local History/Clear, Print, Reset, feedback, keyboard-focusable controls, and no site-originated browser console/runtime errors.
- Exact 360 px, 768 px, and desktop widths rendered without document-level horizontal overflow.

Supplemental run `31685959880` passed the remaining release-blocking interaction cases:

- `$`, `EUR`, and `EGP` display labels; zero and decimal prices; unsafe-price rejection; custom negative/non-finite coverage handling; empty/overflow wall input handling; and openings/waste boundary errors.
- Copy/Save includes a valid estimated material cost and omits cost when the optional price is invalid.
- Saved history survives an ordinary calculator re-render and clears on request; Custom coverage remains editable and keyboard-focusable.

### Lighthouse milestone matrix

Two non-scored warm-ups preceded the 16 scored reports. Every required category met the >=95 policy threshold.

| Route | Profile | Performance | Accessibility | Best Practices | SEO |
| --- | --- | ---: | ---: | ---: | ---: |
| `/` | Mobile | 99 | 100 | 100 | 100 |
| `/` | Desktop | 100 | 100 | 100 | 100 |
| `/concrete-calculator` | Mobile | 99 | 100 | 100 | 100 |
| `/concrete-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/post-hole-concrete-calculator` | Mobile | 99 | 100 | 100 | 100 |
| `/post-hole-concrete-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/paint-calculator` | Mobile | 99 | 100 | 100 | 100 |
| `/paint-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/tile-calculator` | Mobile | 99 | 100 | 100 | 100 |
| `/tile-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/brick-calculator` | Mobile | 99 | 100 | 100 | 100 |
| `/brick-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/gravel-calculator` | Mobile | 99 | 100 | 100 | 100 |
| `/gravel-calculator` | Desktop | 100 | 100 | 100 | 100 |
| `/mulch-calculator` | Mobile | 99 | 100 | 100 | 100 |
| `/mulch-calculator` | Desktop | 100 | 100 | 100 | 100 |

### Evidence artifacts

- Milestone artifact: `brick-calculator-milestone-qa`, artifact ID `9174387031`, SHA-256 `13e9c1e3dc58abd4a136cd4ecd5ac3b83cc08213d5757fe02f523e0665de65e3`.
- Supplemental artifact: `brick-supplemental-interaction-qa`, artifact ID `9175432257`, SHA-256 `3ff44115d27a9f71a6c77a851f74f9dbaeb65ff14c6a198533828fd6aab765c9`.

### Preliminary failures retained

No preliminary failure is counted as a release pass.

- The first engine-gate failure came from an incorrect underflow test using `Number.MIN_VALUE` in a path that performed no conversion underflow. The test was corrected; the passing engine result did not require weakening the engine.
- Preliminary browser-milestone attempts failed on QA-harness assumptions about adjacent DOM text-node whitespace, thousands-separator formatting in raw procurement detail, and the exact shared cost-validator message. The harness was corrected without changing the Brick quantity product behavior.
- The first supplemental attempt incorrectly expected the default allowance to add 34 bricks. The verified calculation is 972 net bricks → `ceil(972 × 1.05)` = 1,021, so the final whole-brick allowance adds **49 bricks**. The assertion was corrected and the supplemental matrix then passed.

### Release decision

The Brick Calculator milestone interaction and Lighthouse gates are passed. Merge remains blocked until temporary QA plumbing is absent from the PR diff and the normal repository CI passes on the cleaned final head. Deployment, production verification, and bounded IndexNow submission remain post-merge gates and are not claimed by this record.
