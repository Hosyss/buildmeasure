# Contributing

## Workflow

1. Research the calculation and primary references.
2. Write or update the calculator specification.
3. Implement the pure engine.
4. Add tests, including edge cases.
5. Build the interface around the tested engine.
6. Run unit, lint, build, and rendered-route checks.
7. For a critical change or major milestone, complete the mobile/desktop audit
   matrix and record it in `docs/AUDITS.md`.
8. Update documentation and the changelog.

## Rules

- Never duplicate a formula in a page component.
- Never silently clamp an invalid construction input.
- Never round intermediate engine values for display.
- Keep unit constants named and referenced.
- Use explicit input and result types.
- Add a regression test before fixing a calculation bug.
- Do not close a critical change or major milestone without the audit required
  by `docs/QA.md`.
- Do not describe planned functionality as implemented.

## Naming

Use domain terms (`wastePercent`, `orderCubicMeters`) rather than generic names
(`value1`, `result2`). Files and routes use lowercase kebab-case; TypeScript
symbols use camelCase or PascalCase as appropriate.
