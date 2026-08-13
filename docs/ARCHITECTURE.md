# Architecture

## Goals

BuildMeasure is designed to scale from one calculator to hundreds without
duplicating formulas or coupling calculation logic to a page component.

## Layers

| Layer | Responsibility | Current location |
| --- | --- | --- |
| Routes | Metadata, structured data, content, page composition | `app/` |
| UI components | Reusable shell, icons, calculator interaction | `components/`, route components |
| Calculator engines | Pure formula and unit logic | `lib/calculators/` |
| Shared units | Exact constants reused by all engines | `lib/units.ts` |
| Validation | Shared predicates plus domain errors at each engine boundary | `lib/validation.ts`, calculator engines |
| Persistence | Device-local estimate history only | Browser `localStorage` |
| Tests | Formula, conversion, validation, and rendered output | `tests/` |
| Formula records | Versions, references, assumptions, review date | `docs/calculators/` |

## Dependency rule

Pages may import engines. Engines must never import React, browser APIs, route
code, or presentation formatting. This allows the same engine to power a page,
Project Mode, a future API, and tests without formula duplication.

## Calculator contract

Every calculator engine must:

1. Accept a typed input object.
2. Validate its own domain boundary.
3. Normalize inputs to a consistent internal unit.
4. calculate without DOM or network access.
5. Return unrounded numeric values.
6. expose engine, formula, and review metadata.
7. have a formula specification and automated tests.

Formatting and display rounding belong to the UI. Procurement rounding, such
as rounding bags upward, belongs to the engine because it changes the material
quantity.

## Current public routes

- `/` — production homepage and live calculator library.
- `/concrete-calculator` — rectangular concrete slab calculator.
- `/post-hole-concrete-calculator` — round post-hole concrete quantity calculator.
- `/paint-calculator` — interior rectangular room paint calculator.
- `/tile-calculator` — rectangular floor and wall tile order calculator.
- `/gravel-calculator` — rectangular gravel coverage and mass calculator.
- `/mulch-calculator` — rectangular mulch-bed volume and bag calculator.
- `/about` — ownership, product scope, privacy, and trust information.
- `/methodology` — calculation and QA methodology.
- `/robots.txt` — crawler policy.
- `/sitemap.xml` — current route discovery.

## Planned evolution

Shared unit constants and validation predicates were extracted when the second
calculator created a real reuse requirement. Project Mode remains a roadmap
capability and will consume the same calculator engines rather than recreate
formulas. It is not promoted as a live homepage feature until implemented and
verified.
