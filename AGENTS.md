# BuildMeasure agent instructions

This repository is the durable source of truth for the existing BuildMeasure
site. Preserve `.openai/hosting.json` and always open the existing site with
slug `buildmeasure`; never create a replacement site.

## Before changing code

1. Read `README.md`, `docs/ARCHITECTURE.md`, `docs/QA.md`, and the relevant
   calculator specification.
2. Keep the current package manager, lockfile, Node 22 runtime, D1 binding, and
   Sites architecture.
3. Make the smallest coherent change and do not claim unimplemented work.

## Required checks

Run `npm run qa:automated` before publishing. Formula, unit, rounding, routing,
SEO, storage, or framework changes also require the checks documented in
`docs/QA.md`. Never weaken a failing test to make a build pass.

## Product and safety rules

- Keep calculator engines pure and separate from interface components.
- Preserve full internal precision and round only display or final package
  quantities according to the documented formula.
- Keep assumptions visible and user-adjustable when they vary by product or
  project.
- Do not collect IP addresses, raw user-agent strings, names, or persistent
  tracking identifiers in analytics.
- Do not commit secrets, tokens, `.env` files, build output, or dependencies.
- Keep production canonical URLs on
  `https://buildmeasure.hosys.chatgpt.site` until an independently verified
  custom domain migration is complete.

## Publishing

Publish through a branch and reviewed pull request on GitHub. Deploy only a
validated commit to the existing Site, then verify the homepage, five
calculators, `/status`, `/api/health`, `/robots.txt`, `/sitemap.xml`, and
`/llms.txt` in production. When public content URLs changed, run
`npm run seo:indexnow` once after the production deployment is verified; never
repeat the submission when no public URL changed.
