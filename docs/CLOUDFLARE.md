# Cloudflare deployment

BuildMeasure remains live on the existing Sites deployment while the
Cloudflare Worker is prepared and independently verified. Do not change the
canonical URL, sitemap host, Search Console property, or the existing Site
until every route and storage check passes on Cloudflare.

## Architecture

The repository already builds a full-stack Cloudflare Worker through Vinext,
Vite, and `@cloudflare/vite-plugin`. Static assets are emitted beside the Worker
bundle and the application uses a D1 binding named `DB` for privacy-conscious
analytics and feedback.

The normal Sites build continues to use its local placeholder D1 identifier.
Cloudflare Workers Builds must provide the real production D1 identifier in an
environment variable. The deployment guard refuses to publish a build that
still contains the placeholder.

## One-time Cloudflare dashboard setup

1. Create a D1 database named `buildmeasure-production`.
2. Copy its database UUID from the D1 database overview.
3. In **Workers & Pages**, choose **Create application**, then **Import a
   repository**.
4. Connect GitHub and select `Hosyss/buildmeasure`.
5. Use the Worker name `buildmeasure`, repository root `/`, and production
   branch `main`.
6. Set the build command to `npm run build`.
7. Set the deploy command to `npm run deploy:cloudflare:built`.
8. Add these Workers Builds variables:
   - `CLOUDFLARE_D1_DATABASE_ID`: the copied D1 UUID.
   - `CLOUDFLARE_D1_DATABASE_NAME`: `buildmeasure-production`.
9. Save and deploy. Never put an API token or account credential in the
   repository or in either variable above.

The Worker name in Cloudflare must exactly match `buildmeasure`; Cloudflare
requires the dashboard Worker name and the generated Wrangler name to match.

## Verification before switching search traffic

Verify all of the following on the assigned `workers.dev` address:

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

Only after those checks pass should a separate migration change update the
canonical host, sitemap, metadata, security policy, IndexNow host, and Search
Console property. Keep the old deployment available during that cutover and
rollback window.

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
