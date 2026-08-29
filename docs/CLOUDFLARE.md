# Cloudflare deployment

BuildNumbers uses Cloudflare Pages with the intended canonical public origin
`https://buildnumbers.pages.dev`. The release candidate is developed on
`feat/buildnumbers-rebrand-safe` and must not be assumed to be the code currently
served by the canonical Production hostname until an explicit release/cutover and
post-deploy verification are completed.

The former `buildmeasuretools` Pages project and the former Worker origin are
migration/rollback surfaces. Preserve path-and-query redirects when the cutover is
completed; do not destroy the old deployment as part of ordinary application work.

## Architecture

The repository builds a full-stack Cloudflare Worker through Vinext, Vite, and
`@cloudflare/vite-plugin`. Static assets are packaged for Pages advanced mode and
the application uses a D1 binding named `DB` for privacy-conscious analytics and
feedback.

The Pages build command is:

```bash
npm run build:pages
```

and the published output directory is:

```text
dist/pages
```

The existing D1 database is `buildmeasure-production`. Both Cloudflare Pages
**Preview** and **Production** environments must expose that database to the
application under the binding name `DB`.

Preview and Production bindings are separate release concerns. A successful Pages
deployment does not by itself prove that D1 is available; verify the runtime health
endpoint on the exact deployment being evaluated.

## BuildNumbers Pages project

Use these settings for the canonical Pages project:

- Project name: `buildnumbers`
- Repository: `Hosyss/buildmeasure`
- Repository root: `/`
- Production branch: `main`
- Build command: `npm run build:pages`
- Output directory: `dist/pages`
- D1 binding name: `DB`
- D1 database: `buildmeasure-production`

Do not create another D1 database just to satisfy a missing Preview binding. Fix the
environment binding instead.

## Release verification

Before merging the release PR or treating a deployment as Production-ready, verify
on an immutable Preview generated from the exact candidate SHA:

- `/`
- `/calculators`
- all 13 calculator routes
- `/guides`
- `/projects`
- `/status`
- `/api/health`
- `/robots.txt`
- `/sitemap.xml`
- `/llms.txt`

The required `/api/health` result is HTTP 200 with both:

- `feedbackStorage: ok`
- `analyticsStorage: ok`

Also verify the supported responsive matrix, absence of horizontal overflow and
page/runtime errors, and successful first-party analytics submission from every
calculator. Deployment success alone is not a substitute for these checks.

After an authorized merge/cutover, repeat the same read-only smoke against
`https://buildnumbers.pages.dev` before calling Production verified. Do not run a
D1 remote migration unless a separately reviewed schema change actually requires
one.

## Historical Worker deployment path

The repository retains guarded Worker-deployment tooling that can inject a real D1
UUID through `CLOUDFLARE_D1_DATABASE_ID` and validate the generated Worker config.
That path is historical/operational tooling; it is not the mechanism used to prove
the Pages runtime binding.

For local or authenticated Worker-path validation, when intentionally needed:

```bash
npm run build
npm run validate:cloudflare
bash scripts/deploy-cloudflare.sh --dry-run
```

Never commit Cloudflare API tokens, account credentials, or production database
UUID secrets into the repository.