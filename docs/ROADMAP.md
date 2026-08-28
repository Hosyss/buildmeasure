# Roadmap

This roadmap is directional. Items are not implemented unless they also appear
in the verified scope in `README.md`.

## Phase 1 — Foundation

- [x] Product architecture.
- [x] Reusable site shell and design system.
- [x] First isolated calculator engine.
- [x] Unit and rendered-route tests.
- [x] Configure the current production URL for canonical metadata and sitemap.
- [x] Define and begin recording mandatory critical/milestone audits.
- [x] Pass a complete Lighthouse and accessibility baseline on every live route.

## Phase 2 — Initial calculator library

- [x] Rectangular concrete slab calculator.
- [x] Interior rectangular room paint calculator.
- [x] Tile calculator.
- [x] Fired-clay brick wall quantity calculator.
- [x] Gravel calculator.
- [x] Mulch calculator.
- [x] Shared exact unit constants and validation helpers after reuse was proven.
- [x] Rectangular-room drywall sheet calculator.

## Phase 3 — Concrete expansion

- [x] Footing calculator.
- [x] Column calculator.
- [x] Wall calculator.
- [x] Post-hole calculator.
- [x] Circular slab calculator.
- [ ] Multi-shape concrete project.

## Phase 4 — Project Mode

- [x] Project creation — local-first project names and estimate snapshots.
- [x] Cross-calculator material list — select saved estimates from all twelve calculators.
- [ ] Waste and cost summary.
- [x] Saved projects — stored only in the current browser.
- [x] Printable/PDF report — one saved project at a time through the browser print dialog.
- [x] Shopping list — structured purchase quantities from saved estimates.

The first Project Mode slices deliberately do not total costs from display
strings because saved estimates can use different currencies and free-form
currency labels. A cost summary must use structured, validated data rather than
parsing human-readable result text. A structured same-label cost-summary engine
and printable roll-up are under review separately and must not combine or convert
unlike currency labels. Printable reports preserve the saved estimate snapshot
exactly as the user stored it and do not invent totals. Shopping lists use
structured purchase quantity and unit fields stored with new estimates. Older
snapshots remain compatible but are not parsed to invent missing purchase data.

## Next concrete milestone

The next expansion item is a **Multi-Shape Concrete Project** workflow. It should
combine independently validated concrete geometries without averaging dimensions
or parsing display strings. Each shape remains auditable on its own before totals,
allowance, purchase units, or optional cost are aggregated.

## Later

Programmatic calculator pages, contractor workflows, an API, premium features,
and carefully selected affiliate integrations may be evaluated only after
quality, search usefulness, and calculator coverage are established.
