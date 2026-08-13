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
