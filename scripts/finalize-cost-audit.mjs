import { readFile, writeFile } from "node:fs/promises";

const path = "docs/AUDITS.md";
const marker = "## 2026-08-13 — Optional purchase cost estimator milestone audit";
const existing = await readFile(path, "utf8");

if (!existing.includes(marker)) {
  const block = String.raw`

${marker}

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
`;

  await writeFile(path, `${existing.trimEnd()}${block}\n`, "utf8");
  console.log("Appended cost estimator milestone audit evidence.");
} else {
  console.log("Cost estimator milestone audit evidence already present.");
}
