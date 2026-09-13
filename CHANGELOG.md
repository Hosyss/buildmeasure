# Changelog

All notable user-visible changes are recorded here. The project follows
Semantic Versioning after the first verified release.

## [Unreleased]

### Rebrand

- Rebranded the public product from BuildMeasure to BuildNumbers after verifying
  that an unrelated, established calculator site already used the BuildMeasure
  name and the closely matching `buildmeasuretools.com` domain.
- Moved canonical, sitemap, robots, structured-data, social, and IndexNow URLs to
  `https://buildnumbers.pages.dev` while preserving path-and-query redirects from
  the former Worker, Sites, and `buildmeasuretools.pages.dev` hosts.

### Added

- Added a reference-backed Drywall Calculator for rectangular room walls and an optional ceiling, with measured openings, exact panel dimensions, explicit waste, unit conversion, device-local history, optional cost, Project Mode, feedback, and privacy-limited analytics wiring.
- Added a substantive drywall measurement and scope guide plus a public material-estimating guide library.
- Expanded sitemap, homepage, navigation, footer, machine-readable discovery, structured data, documentation, and regression coverage for the eighth calculator and eighth focused guide.

### Changed

- Removed development-preview metadata and the unimplemented Project Mode
  promotion from the public homepage and footer so production surfaces describe
  only verified live functionality.
- Published BuildMeasure's independent maintainer identity as `Hosyss` in site
  metadata, structured data, About content, footer copy, and repository docs,
  with direct links to the public source and verified release history.
- Updated the About page to reflect all seven live calculators and to explain that
  saved estimates stay in browser-local storage, do not sync between devices,
  and can be lost when site data is cleared.
- Aligned agent and architecture documentation with the current verified
  Cloudflare Workers production origin and live route inventory.
- Switched canonical metadata, the sitemap, machine-readable links, IndexNow,
  and the security policy to the verified Cloudflare Workers production origin.

### Added

- Added a reference-backed “How Many Bricks Do I Need for a Wall?” guide with BIA coverage-rate examples, openings subtraction, waste sequencing, explicit bond/material scope boundaries, and direct Brick Calculator linking.
- Added a reference-backed fired-clay Brick Calculator with measured openings, BIA Technical Note 10 running/stack-bond coverage presets, custom supplier/project coverage, explicit waste/breakage allowance, metric/imperial equivalence, whole-brick rounding, optional user-entered price per brick, and explicit exclusions for mortar, header-pattern corrections, structural design, and non-clay brick claims.
- Added a reference-backed guide for estimating complete 40/60/80 lb concrete bags for round post holes, including cylinder geometry, hole-count examples, optional post-displacement limits, allowance guidance, product-yield references, and explicit structural-design boundaries.
- Added optional user-entered package pricing to all seven live calculators, with approximate material-cost totals, currency labels, copy/save integration, stale-package price clearing, and no live-price or exchange-rate assumptions.
- Added a shared tested cost helper plus a documented cost-estimator scope and release checklist.
- Added a tested Post Hole Concrete Calculator for multiple round holes with
  optional round or square post displacement, metric and imperial inputs,
  adjustable allowance, and complete 40/60/80 lb bag estimates.
- Added post-hole formula documentation, structured metadata, homepage/footer
  discovery, sitemap and `llms.txt` entries, feedback/analytics compatibility,
  and deterministic engine coverage.
- Added a guarded Cloudflare Workers deployment path that accepts a production
  D1 binding through build-time configuration and rejects placeholder storage
  before deployment.
- Added a no-download GitHub-to-Cloudflare setup and verification runbook while
  preserving the existing public deployment until an independent cutover gate.

## [0.5.3] — 2026-08-09

### Added

- Added an automated, quality-gated GitHub release that publishes a current
  source ZIP, a full-history Git bundle, and a SHA-256 checksum manifest.
- Added a reproducible local backup command and documented direct download,
  verification, and restoration paths.

## [0.5.2] — 2026-08-09

### Added

- Added IndexNow ownership verification and a bounded production-sitemap
  submission command for Bing and other participating search engines.
- Added a durable indexing runbook that keeps Google Search Console and
  IndexNow responsibilities separate and avoids duplicate submissions.

## [0.5.1] — 2026-08-09

### Added

- Added a reproducible GitHub quality gate, weekly dependency update checks,
  a pinned Node.js major version, and a recovery guide for durable backups.
- Added a search-focused concrete bag guide with documented product yields,
  worked formulas, common slab examples, structured data, and internal links.
- Added `llms.txt`, a durable agent instruction file, and a free-plan traffic
  operations guide.
- Added privacy-conscious site-wide engagement tracking and landing-page
  reporting so passive probes are not counted as engaged visits.

### Changed

- Updated the production and build dependency set to patched releases and
  removed all known production dependency advisories reported by `npm audit`.
- Updated Vite imports to the current native JSON and TypeScript syntax so the
  project remains compatible with future Vite loader changes.
- Published the dependency, CI, recovery, and Node 22 safeguards from the
  durable GitHub backup into the Sites source tree.

## [0.5.0] — 2026-08-01

### Added

- Added first-party anonymous calculator events for real interaction,
  completed and invalid estimates, result actions, feedback, traffic source,
  and browser errors.
- Added a private owner analytics dashboard that excludes automated page
  requests from its engaged-session count.
- Added bounded event validation, per-page-session rate limiting, D1 indexes,
  90-day retention cleanup, storage health checks, and regression coverage.

### Changed

- Updated the privacy policy to document the analytics fields and retention.
  The event log stores no IP address, name, email address, raw user-agent
  string, or persistent analytics cookie.

## [0.4.2] — 2026-08-01

### Added

- Added the Google Search Console ownership-verification artifact and completed
  ownership verification for the public URL-prefix property.
- Submitted the XML sitemap and confirmed through live URL inspection that the
  public homepage is available to Google and eligible for indexing.

## [0.4.1] — 2026-08-01

### Changed

- Published the existing `buildmeasure` site for public access and completed
  external production performance and HTTP-security audits.

### Fixed

- Replaced the permissive script fallback in the production Content Security
  Policy with exact SHA-256 allowlist hashes for every inline application
  bootstrap script while retaining same-origin client bundles.
- Added rendered-response coverage that rejects unsafe inline or `data:` script
  sources and verifies every emitted inline script has a matching CSP hash.

## [0.4.0] — 2026-08-01

### Added

- Anonymous calculation-issue reporting with validated, rate-limited D1
  storage, private owner inbox, retention cleanup, and receipt references.
- Public status and health surfaces for calculator and feedback-storage
  monitoring, plus release-version reporting.
- Worked examples for all five calculators and a practical material-estimating
  guide with methodology, about, privacy, and terms pages.
- Security headers covering framing, MIME sniffing, permissions, referrers,
  transport security, and a restrictive baseline content policy.
- Rectangular Mulch Calculator with Imperial and Metric measurements.
- Net and allowance-adjusted mulch volume, bed area, coverage per selected bag,
  and complete custom-volume bags.
- Pure, versioned mulch engine with independent known-result,
  unit-equivalence, exact-boundary, validation, numeric-range, and
  deterministic randomized tests.
- Mulch metadata, canonical URL, FAQ and breadcrumb structured data, sitemap
  entry, U.S. EPA and NIST reference links, formula specification, and QA
  checklist.
- Built-application checks that verify every internal page link resolves.
- Rectangular Gravel Calculator with Imperial and Metric measurements.
- Net and allowance-adjusted volume, estimated pounds/kilograms, short tons,
  metric tonnes, and complete custom-weight bags.
- Explicit user-adjustable bulk density with a documented USACE dry planning
  example and ASTM loose-versus-compacted guidance.
- Pure, versioned gravel engine with independent known-result,
  unit-equivalence, exact-boundary, validation, numeric-range, and
  deterministic randomized tests.
- Gravel metadata, canonical URL, FAQ and breadcrumb structured data, sitemap
  entry, primary-reference links, formula specification, and QA checklist.
- A documented weighted progress model for the launch-ready v1 and the
  long-term product vision.

### Changed

- Raised shared interactive controls to a 44 px minimum target and verified
  every calculator at exact 360 px and 768 px content widths.
- Expanded primary navigation, footer resources, structured content, canonical
  metadata, robots directives, and the XML sitemap for launch readiness.
- Made full automated checks plus recorded mobile and desktop Lighthouse audits
  mandatory after critical changes and major milestones.
- Added an append-only quality audit log and recorded the incomplete v0.3.1
  baseline without treating it as a passed gate.
- Replaced the web-font preload set with a system font stack and lowered
  generated module-preload priority so render-blocking CSS can load first.
- Use ordinary document navigation for the small independent calculator pages,
  avoiding an unnecessary client-router payload.

### Fixed

- Increased low-contrast text, button, focus, and result-label colors to pass
  the Lighthouse color-contrast audit across every live route.
- Raised the complete local-production Lighthouse matrix to 96–100 Performance
  and 100 Accessibility, Best Practices, and SEO on mobile and desktop.
- Extended that passing matrix to all five live routes after adding Gravel.
- Extended the passing matrix to the homepage and all five launch calculators
  after adding Mulch.

## [0.3.1] — 2026-07-31

### Fixed

- Concrete bag counts no longer add one bag when the exact requirement lands
  on a published bag-yield boundary.
- Paint container counts no longer add one container when the exact
  requirement lands on a container boundary.
- Concrete, paint, and tile engines now reject unit modes, runtime options,
  underflow, overflow, and integer quantities that cannot be calculated
  safely instead of returning misleading or non-finite results.
- Saved-estimate history now hydrates consistently when prior device data
  exists, so its controls remain interactive after page load.
- Paint results and saved estimates now use the singular “coat” when one coat
  is selected.
- Unit-system switches now retain up to seven decimal places for converted input,
  preventing visible round-trip drift such as 8 ft returning as 7.999 ft.

### Changed

- Added one shared safe upward-rounding implementation for material units.
- Bumped all three calculator engines to `0.1.1`; formula versions remain
  `1.0.0`.
- Rechecked concrete yields, paint coverage assumptions, tile allowance
  guidance, and conversion constants against primary sources.
- Expanded deterministic randomized, independent known-result, numeric-range,
  and exact-boundary regression coverage.
- Hardened saved-history parsing, cross-tab updates, item limits, and ID
  uniqueness.
- Centralized converted-input formatting across all calculators.

## [0.3.0] — 2026-07-31

### Added

- Rectangular floor and wall Tile Calculator.
- Imperial surface dimensions in feet with tile and grout dimensions in
  inches.
- Metric surface dimensions in meters with tile and grout dimensions in
  millimeters.
- Area-based tile quantity, adjustable 0–50% waste allowance, complete-box
  rounding, purchased coverage, and box-overage reporting.
- Transparent row-and-column layout check with aligned, rotated, and automatic
  orientation modes.
- Tile-specific copy, print, reset, device-local save, and history actions.
- Pure, versioned tile engine with known-result, unit-equivalence, rounding,
  orientation, validation, edge-case, and deterministic randomized tests.
- Tile metadata, canonical, FAQ, breadcrumb, WebApplication structured data,
  sitemap entry, formula specification, and QA checklist.

### Changed

- Homepage, footer, Concrete Calculator, and Paint Calculator now link to the
  live Tile Calculator.
- Shared unit constants now include exact inch-to-millimeter conversion.

## [0.2.0] — 2026-07-31

### Added

- Interior rectangular room Paint Calculator.
- Imperial and metric room dimensions with immediate conversion.
- Wall area, optional ceiling area, and measured door/window deductions.
- Adjustable coats, product coverage, and 0–25% extra allowance.
- Gallon, liter, and selected container-size estimates.
- Paint-specific copy, print, reset, device-local save, and history actions.
- Pure, versioned paint engine with formula, validation, conversion, and
  regression tests.
- Paint metadata, canonical, FAQ, breadcrumb, WebApplication structured data,
  and sitemap entry.
- Shared unit constants, validation helpers, result actions, estimate history,
  and local-history hook.
- Paint formula specification and QA checklist.

### Changed

- Homepage and footer now list Paint Calculator as live.
- Concrete page links directly to Paint Calculator.

## [0.1.0] — 2026-07-31

### Added

- Responsive BuildMeasure homepage and engineering-style visual system.
- Concrete slab calculator with imperial and metric input.
- Ready-mix volume in cubic yards and cubic meters.
- Cubic-foot, liter, and 40/60/80 lb bag estimates.
- Adjustable waste allowance.
- Reset, copy, print, device-local save, and estimate history.
- Pure, versioned concrete engine.
- Automated formula, conversion, validation, regression, and rendered-route
  tests.
- Metadata, sitemap, robots, FAQ, breadcrumb, and WebApplication structured
  content.
- Absolute canonical and sitemap URLs for the verified production site.
- Architecture, calculator, QA, roadmap, bug, and contribution documentation.
