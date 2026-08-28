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
- [x] Structured cost summary — grouped only by exact saved currency label with no FX inference or conversion.
- [x] Saved projects — stored only in the current browser.
- [x] Printable/PDF report — one saved project at a time through the browser print dialog.
- [x] Shopping list — structured purchase quantities from saved estimates.
- [x] Printable cost roll-up — uses the same structured cost summary as the saved project card.

Project Mode never totals costs from human-readable display strings. Cost
summaries use only structured, validated purchase data. Unlike currency labels
remain separate exactly as entered, unpriced purchase lines are disclosed rather
than guessed, and totals outside the safe numeric range are suppressed instead
of displayed. Older snapshots remain compatible but are not parsed to invent
missing purchase quantities or prices.

## Next concrete milestone

The next expansion item is a **Multi-Shape Concrete Project** workflow. It should
combine independently validated concrete geometries without averaging dimensions
or parsing display strings. Each shape remains auditable on its own before totals,
allowance, purchase units, or optional cost are aggregated.

## Later

Programmatic calculator pages, contractor workflows, an API, premium features,
and carefully selected affiliate integrations may be evaluated only after
quality, search usefulness, and calculator coverage are established.
