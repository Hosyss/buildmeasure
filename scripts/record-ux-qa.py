from pathlib import Path

AUDIT_MARKER = "## 2026-08-13 — UX clarity and documentation follow-up audit"

audits = Path("docs/AUDITS.md")
audit_text = audits.read_text()
if AUDIT_MARKER in audit_text:
    raise SystemExit("UX clarity audit already recorded")

audit_text += r'''

## 2026-08-13 — UX clarity and documentation follow-up audit

| Field | Value |
| --- | --- |
| Status | **Passed — source UX clarity/browser/Lighthouse gate; final cleaned-head CI and PR review remain** |
| Product version | 0.5.3 plus unreleased UX clarity follow-up |
| Audited product source through | `653adc5f9e3b4b63e08c3d003ea300c8aadbd1ed` |
| Automated/browser QA run | GitHub Actions `31694577543`, job `94429308828` |
| Closing Lighthouse run | GitHub Actions `31695391156`, job `94431898757` |
| Closing Lighthouse artifact | `ux-clarity-gzip-lighthouse`, ID `9179144912`, SHA-256 `0e08a22ef348d6a5d394e9808b3629d502885797a6a52c94e5b7cf9d8737476e` |
| Audit tool | Google Lighthouse 13.4.1 plus supervised headless Chrome interaction QA |
| Target | Local production Worker build on GitHub-hosted Ubuntu; lab evidence, not deployed field data |
| Profiles | Exact 360 px, 768 px, 1280 px browser checks; Lighthouse default mobile and desktop preset |

### Scope and engine boundary

- Brick preset labels now display the coverage basis for the active unit system. Imperial uses `bricks / 100 ft²`; Metric uses `bricks / 10 m²`.
- The UI derives preset values from the existing `brickPresetRate` conversion source. No duplicate conversion formula was added to React.
- A selected Brick preset is rendered as semantic static output instead of a read-only input. Only `Custom` exposes an editable coverage input.
- The homepage hero sample is explicitly labeled **Example estimate** and the complete card is a semantic link to the Concrete Calculator; the dimension examples no longer use input-like bordered controls.
- Shared header CTA behavior is explicit and server-rendered: the homepage uses **Browse calculators**, calculator pages use **All calculators**, and each focused material guide points to its related calculator.
- Helper/warning copy is raised to roughly 12–13 px and lower-priority metadata to roughly 11–12 px without changing the site's color identity or redesigning the layout.
- Guide hero/article spacing is reduced conservatively. Browser QA first caught the Brick guide primary CTA below a 1280×900 first screen; commit `653adc5f9e3b4b63e08c3d003ea300c8aadbd1ed` moved that CTA ahead of the extra reference paragraph and tightened shared guide spacing.
- No file under `lib/calculators/` changed in this follow-up. Calculator formulas, validation, conversions, and procurement rounding are unchanged.

### Automated evidence

- **117/117** unit/engine tests passed.
- TypeScript compiler syntactic + semantic diagnostics passed for all **17 changed TS/TSX surfaces**.
- `npm run lint` passed.
- The verified production build passed and its Sites artifact validation succeeded.
- **29/29** rendered application/content tests passed, including the permanent UX clarity contracts for homepage example semantics, calculator header CTAs, and guide header CTAs.
- A source scan found no remaining `readOnly` or `aria-readonly` form controls under `app/` or `components/`.
- `npm audit --omit=dev --audit-level=high` reported **0 vulnerabilities**.

The repository's raw global `npx tsc --noEmit` remains a pre-existing baseline failure unrelated to this UX branch. Run `31693929003` reached 117/117 unit passes before exposing existing Cloudflare Worker/D1 ambient-type gaps, existing `.ts` import-extension configuration errors, and existing analytics/feedback typing errors. Those unrelated baseline problems are retained as an open tooling issue; this branch does not modify Cloudflare, database, analytics, or feedback code simply to suppress them.

### Browser interaction and responsive evidence

The final supervised browser pass used the built application and exact **360 px, 768 px, and 1280 px** viewports.

- Homepage: the example card is one clear link, is labeled **Example estimate**, contains no input/select/button descendants, and the header CTA is **Browse calculators**.
- Brick Imperial: all preset options use `/ 100 ft²`; the Modular preset static output shows the expected 675 basis; no Custom input is present while a preset is selected.
- Brick Metric: all preset options switch to `/ 10 m²` with no stale `100 ft²` labels; the static output uses the converted preset value from the existing conversion source.
- Brick Custom: switching to Custom replaces the static preset output with a real numeric input; Metric and Imperial unit labels follow the active system, and the practical Custom round trip returns to the original Imperial rate within the existing display tolerance.
- Returning from Custom to a preset restores static output instead of leaving an editable-looking field.
- Calculator header CTA is **All calculators** and points to `/#calculators` instead of always returning to Concrete.
- Brick guide header CTA is **Open Brick Calculator** and points to `/brick-calculator`; after the density fix its primary calculator CTA is inside the 1280×900 first screen.
- All three tested surfaces reported **no horizontal overflow** at 360/768/1280.
- Site-originated browser console/runtime errors were **zero**.

### Lighthouse closing matrix

The scored closing matrix intentionally covers only the directly representative affected surfaces requested for this follow-up.

| Route | Mobile P/A/BP/SEO | Desktop P/A/BP/SEO |
| --- | --- | --- |
| `/` | **99 / 100 / 100 / 100** | **100 / 100 / 100 / 100** |
| `/brick-calculator` | **99 / 100 / 100 / 100** | **100 / 100 / 100 / 100** |
| `/guides/how-many-bricks-do-i-need` | **99 / 100 / 100 / 100** | **100 / 100 / 100 / 100** |

Every scored category is at or above the project minimum of 95.

### Failed diagnostics retained and measurement correction

1. Browser QA run `31694213667` passed unit/type/lint/build/rendered gates but correctly failed before Lighthouse because the Brick guide primary CTA began at roughly 1036 px in a 1280×900 viewport. That was treated as a real UX defect and fixed rather than dismissed as runner variance.
2. Run `31694577543` then passed **117/117** units, changed-surface TypeScript checking, lint, production build, **29/29** rendered tests, no-readOnly scan, and the complete 360/768/1280 browser matrix. Its direct `vinext start` Lighthouse reports scored 88–89 mobile Performance while all Desktop scores and all Accessibility/Best Practices/SEO scores were 100.
3. Warmed run `31695032065` reproduced the exact same 88–89 mobile Performance after two explicit non-scored warmups, proving simple runner warm-up was not the explanation.
4. Report inspection showed the local `vinext start` server transferring the shared JavaScript/CSS assets essentially uncompressed (for example the shared framework chunk transferred at about 190 KiB and the main index chunk at about 204 KiB), while TBT remained approximately 0 ms. The final QA therefore used a temporary Node built-in gzip proxy to match deployed compression behavior. The workflow explicitly verified `content-encoding: gzip` on a representative immutable JS asset before Lighthouse was allowed to run.
5. No product source, Lighthouse threshold, or category requirement changed between the uncompressed diagnostic and the closing gzip-representative matrix. Two explicit non-scored warmups remained excluded from release evidence.

### Documentation preflight

- Current `AGENTS.md` already documents **seven calculators**, so this branch intentionally does not create a redundant edit.
- Current `docs/ARCHITECTURE.md` already lists `/brick-calculator`, so this branch intentionally does not create a redundant edit.
- `docs/PROGRESS.md` is the active handoff/status record for this follow-up and contains the stage commits, QA failures, final evidence, and remaining review step.
- PR #27 remains open and untouched. Its Post-hole bag-guide route is already present on current `main`, so it appears stale/duplicative and should be reviewed separately; this branch does not close it.

### Release boundary

This work must stop at a **Draft PR**. It must not merge to `main`, deploy Production, close another PR, or submit indexing requests. Before opening the Draft PR, remove all temporary QA workflows/scripts and require the normal repository quality gate to pass on the cleaned branch head.
'''
audits.write_text(audit_text)

progress = Path("docs/PROGRESS.md")
text = progress.read_text()
text = text.replace(
    "| Brick coverage clarity | [`8123371`](https://github.com/Hosyss/buildmeasure/commit/8123371186e1e13f517b192f92cfdcad67d2012c) | Preset labels now derive their Imperial/Metric values from existing `brickPresetRate`; preset coverage is a semantic static `<output>` and only Custom exposes an editable input; rendered regression added. No calculator engine file changed. | Browser Imperial/Metric/Custom interaction QA and final gates pending. |",
    "| Brick coverage clarity | [`8123371`](https://github.com/Hosyss/buildmeasure/commit/8123371186e1e13f517b192f92cfdcad67d2012c) | Preset labels now derive their Imperial/Metric values from existing `brickPresetRate`; preset coverage is a semantic static `<output>` and only Custom exposes an editable input; rendered regression added. No calculator engine file changed. | **Closed:** Imperial/Metric/Custom browser QA, responsive checks, and affected-surface Lighthouse passed. |",
)
text = text.replace(
    "| Shared UX clarity | [`07e47bc`](https://github.com/Hosyss/buildmeasure/commit/07e47bc52e9ec9666e654c37e27a111da7d999ee) | Header CTA is explicit per context without client pathname logic; homepage hero card is a linked **Example estimate** with no fake input controls; helper/warning copy is raised to ~12.5 px and secondary metadata to ~11.5–12 px; focused guides link to their related calculator and use a denser hero; permanent rendered contracts cover homepage/header/guide semantics. | Responsive browser QA, console/overflow checks, and affected-page Lighthouse pending. |",
    "| Shared UX clarity | [`07e47bc`](https://github.com/Hosyss/buildmeasure/commit/07e47bc52e9ec9666e654c37e27a111da7d999ee) | Header CTA is explicit per context without client pathname logic; homepage hero card is a linked **Example estimate** with no fake input controls; helper/warning copy is raised to ~12.5 px and secondary metadata to ~11.5–12 px; focused guides link to their related calculator and use a denser hero; permanent rendered contracts cover homepage/header/guide semantics. | **Closed:** 360/768/1280 browser QA found no overflow or site errors; representative Lighthouse passed. |",
)
text = text.replace(
    "| Guide first-screen density | [`653adc5`](https://github.com/Hosyss/buildmeasure/commit/653adc5f9e3b4b63e08c3d003ea300c8aadbd1ed) | Browser QA proved the Brick guide CTA was below a 1280×900 first screen. Shared guide hero/article spacing was reduced conservatively and the Brick quick-answer CTA was moved ahead of its extra reference paragraph. Content and calculator logic are unchanged. | Re-run the complete QA matrix and confirm first-screen placement. |",
    "| Guide first-screen density | [`653adc5`](https://github.com/Hosyss/buildmeasure/commit/653adc5f9e3b4b63e08c3d003ea300c8aadbd1ed) | Browser QA proved the Brick guide CTA was below a 1280×900 first screen. Shared guide hero/article spacing was reduced conservatively and the Brick quick-answer CTA was moved ahead of its extra reference paragraph. Content and calculator logic are unchanged. | **Closed:** final desktop browser QA confirms the primary CTA is inside the first 1280×900 screen. |",
)

needle = "- The repo-wide raw `tsc --noEmit` baseline remains an unresolved repository\n  tooling/type-definition issue. This branch does not make unrelated Cloudflare,\n  database, analytics, or feedback changes merely to suppress it.\n"
if needle not in text:
    raise SystemExit("PROGRESS QA insertion target not found")
closure = needle + r'''
- Final browser/automated closure on run `31694577543`: 117/117 unit tests,
  changed-surface TypeScript diagnostics, lint, production build, 29/29 rendered
  tests, no-readOnly source scan, and exact 360/768/1280 browser interaction all
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
'''
text = text.replace(needle, closure, 1)

start = text.index("### Next work on this branch\n")
end = text.index("\n## Master product vision", start)
text = text[:start] + '''### Next work on this branch

1. Remove all temporary UX QA workflows/scripts from the branch.
2. Run the normal repository quality gate on the cleaned head.
3. Re-check current `main` and all open PRs for drift/conflicts.
4. Open a **Draft PR only**, record its link here, and stop for review. Do not
   merge, deploy Production, close another PR, or submit indexing requests.
''' + text[end:]
progress.write_text(text)
