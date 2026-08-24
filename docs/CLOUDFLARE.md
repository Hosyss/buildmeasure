# Cloudflare deployment

BuildMeasure is deployed at `https://buildmeasuretools.pages.dev`
with the production D1 binding. The former Workers and original Sites deployments
remain available only as path-preserving redirects during the migration window.
Keep both redirects until Search Console accepts the new URL-prefix property and
the Pages production checks remain healthy.

## Architecture

The repository already builds a full-stack Cloudflare Worker through Vinext,
Vite, and `@cloudflare/vite-plugin`. Static assets are emitted beside the Worker
bundle and the application uses a D1 binding named `DB` for privacy-conscious
analytics and feedback.

The normal Sites build continues to use its local placeholder D1 identifier.
The Pages project uses `npm run build:pages`, publishes `dist/pages`, and binds
the existing `buildmeasure-production` database at runtime as `DB`.

## Cloudflare Pages dashboard setup

1. In **Workers & Pages**, choose **Create application**, then **Import a
   repository**.
2. Connect GitHub and select `Hosyss/buildmeasure`.
3. Use the Pages project name `buildmeasuretools`, repository root `/`, and production
   branch `main`.
4. Set the build command to `npm run build:pages` and output directory to
   `dist/pages`.
5. Bind the existing D1 database `buildmeasure-production` with variable name
   `DB`, then trigger a new production deployment.

## Verification before switching search traffic

Verify all of the following on `https://buildmeasuretools.pages.dev`:

- `/`
- `/concrete-calculator`
- `/paint-calculator`
- `/tile-calculator`
- `/gravel-calculator`
- `/mulch-calculator`
- `/status`
- `/api/health` with both D1 checks reporting `ok`
- `/robots.txt`, `/sitemap.xml`, and `/llms.txt`
- analytics event submission and feedback submission
- mobile and desktop Lighthouse and HTTP security checks

The route, storage, canonical-host, metadata, security-policy, and IndexNow
cutover checks passed on the Cloudflare origin. Keep the old deployment
available during the Search Console migration and rollback window.

## Local or CI validation

With the Cloudflare build variables set in the environment:

```bash
npm run build
npm run validate:cloudflare
bash scripts/deploy-cloudflare.sh --dry-run
```

For an authenticated deployment, use `npm run deploy:cloudflare`. The command
rebuilds, validates the generated Worker, and deploys only when the D1 binding
is a real UUID. The deployment script repeats the validation itself, so direct
invocation cannot bypass the placeholder-storage guard.
