from pathlib import Path

AUDIT_MARKER = "## 2026-08-13 — UX clarity production deployment closure"
HANDOFF_HEADING = "## Active handoff — UX clarity and documentation"
MASTER_HEADING = "## Master product vision"

AUDIT_SECTION = r'''

## 2026-08-13 — UX clarity production deployment closure

| Field | Value |
| --- | --- |
| Status | **Passed — merged, deployed, and verified on Cloudflare Production** |
| Source PR | `#33 — Clarify calculator UX, CTAs, typography, and guide density` |
| Merge commit | `38fcad44ab803e5167f392547f2b4815301a1885` |
| Main quality gate | GitHub Actions `31698057960` — **passed** |
| Verified-source backup | GitHub Actions `31698119121` — **passed** |
| Production host | `https://buildmeasure.buildtools.workers.dev/` |
| Definitive production smoke | GitHub Actions `31699354811`, job `94444463894` — **passed** |

### Production verification

- The merged PR #33 markers were present on Cloudflare Production: homepage **Example estimate**, Brick static `brick-rate-output`, and Brick-guide **Open Brick Calculator** CTA.
- HTTP **200** was verified for the homepage, all seven calculator routes, all seven focused material-guide routes, `/api/health`, `/status`, `/robots.txt`, `/sitemap.xml`, and `/llms.txt`.
- A valid production `POST /api/analytics` returned **204**.
- Headless-Chrome production checks passed at exact **360×900**, **768×1024**, and **1280×900** viewports for the homepage, Brick Calculator, and Brick wall guide.
- Homepage Example-estimate semantics, the **Browse calculators** CTA, Brick Imperial → Metric → Custom interaction, **All calculators**, and both Brick-guide calculator CTAs passed on Production.
- No horizontal overflow, site page errors, or non-analytics same-origin request failures were observed on the directly affected surfaces. Critical internal destinations resolved successfully.

### Failed diagnostics retained

The Production deployment was already live while temporary browser harnesses were corrected. These diagnostics remain recorded and are not relabeled as product passes:

- `31698413359` / `94441411972`: Cloudflare markers were live, but the first combined browser harness exited without useful failure detail.
- `31698574147` / `94441922381`: the diagnostic rerun reproduced the opaque harness exit.
- `31698730787` / `94442421749`: Production markers and the full HTTP route/API gate passed; the browser harness then failed because an ESM QA script under `/tmp` could not resolve repository-installed `puppeteer-core`.
- `31699001042` / `94443287332`: after module-resolution correction, HTTP passed again; GitHub Bash `-e` still exited before the intended diagnostic capture.
- `31699161652` / `94443811833`: explicit diagnostics isolated only best-effort `/api/analytics` requests aborted during QA page teardown.
- The application intentionally catches analytics-fetch failures. The definitive gate therefore verified `/api/analytics` directly with a valid **204** response and excluded only analytics teardown aborts from browser request-failure gating.
- `31699354811` / `94444463894`: the corrected definitive production gate passed end-to-end.

### Release state

- PR #33 is merged and its public UX/content changes are verified on Production.
- No calculator engine or formula changed in the production-verification follow-up.
- PR #27 and PR #32 remain untouched.
- No Google Search Console manual-indexing request was made.
- **IndexNow has not been submitted yet**; it remains a separate post-verification decision and, if used, must cover only actually changed public URLs once.
'''

PROGRESS_SECTION = r'''## UX clarity production closure

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
- IndexNow remains **not submitted** pending the post-verification indexing decision.

The weighted **Launch-ready v1 remains 97%** because the remaining broader cross-browser/real-user field-data and independent-usability-feedback gaps are unchanged. The approximate master-product vision remains **~2%**.
'''


def main():
    audits_path = Path("docs/AUDITS.md")
    progress_path = Path("docs/PROGRESS.md")

    audits = audits_path.read_text(encoding="utf-8")
    if AUDIT_MARKER not in audits:
        audits_path.write_text(audits.rstrip() + "\n\n" + AUDIT_SECTION.strip() + "\n", encoding="utf-8")

    progress = progress_path.read_text(encoding="utf-8")
    start = progress.find(HANDOFF_HEADING)
    end = progress.find(MASTER_HEADING)
    if start < 0 or end < 0 or end <= start:
        raise RuntimeError("Could not locate UX handoff/master-vision boundaries in docs/PROGRESS.md")
    updated = progress[:start] + PROGRESS_SECTION.strip() + "\n\n" + progress[end:]
    progress_path.write_text(updated, encoding="utf-8")

    print("Production evidence recorded in AUDITS.md and PROGRESS.md")


if __name__ == "__main__":
    main()
