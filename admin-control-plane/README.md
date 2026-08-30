# BuildNumbers Admin Control Plane

This is an **isolated admin application** developed separately from the public BuildNumbers site.

## Security boundary

- No Cloudflare Zero Trust / Access dependency.
- Separate Worker identity and separate D1 database (`ADMIN_DB`).
- `workers_dev = false`; intended for a dedicated admin-only hostname after review.
- App-native WebAuthn/passkeys with `userVerification: required`.
- One-time bootstrap secret is accepted only while no enabled admin exists.
- Host-only `__Host-` cookies, `Secure`, `HttpOnly` for the session and `SameSite=Strict`.
- Exact Origin validation plus a synchronizer CSRF value for state-changing requests.
- Short sessions: 30 minute absolute lifetime, 10 minute idle cutoff.
- Recent passkey step-up required before content and release mutations.
- Auth rate limiting stores only an HMAC-pseudonymized network identifier, never the raw IP.
- Admin pages are `no-store`, `noindex`, frame denied, and use a self-only CSP.
- Audit entries form an HMAC-backed chain using a secret that is not stored in D1.
- The current stage **cannot deploy to or mutate the public site**. It creates isolated content records and release snapshots for later reviewed integration.

## What can be managed

The control plane models editable records for site settings, pages, guides, calculator metadata/copy, SEO, navigation, AdSense settings, feature flags, notices and protected change requests.

The calculation engine itself is intentionally not editable as arbitrary JavaScript from a browser. Code/formula changes are represented as `protected-change` records and must go through the normal repository QA/release path. Allowing raw code execution from an admin UI would turn an account compromise into immediate remote-code execution and is not an acceptable security tradeoff.

## Provisioning plan — do not run against Production yet

1. Create a **new** D1 database named `buildnumbers-admin`.
2. Apply `schema.sql` to that database only.
3. Copy `wrangler.toml.example` to an uncommitted deployment config and set the dedicated admin hostname values.
4. Generate four independent high-entropy secrets:
   - `SESSION_PEPPER`
   - `RATE_LIMIT_PEPPER`
   - `AUDIT_HMAC_SECRET`
   - a one-time bootstrap secret; store only its SHA-256 base64url digest as `BOOTSTRAP_SECRET_HASH`
5. Store secret values with Wrangler secrets; never commit them.
6. Deploy a separate Worker named `buildnumbers-admin` with no binding to the public BuildNumbers D1.
7. Register the first passkey from a trusted device. After the first admin exists, bootstrap automatically closes.
8. Verify login, idle expiry, CSRF rejection, Origin rejection, rate limiting, step-up, audit chaining, noindex/no-store headers and failed unauthorized access before any integration work.

## Integration rule

Do not add a link from the public site and do not allow this Worker to write the public database during the isolated build phase. Integration happens only after the admin security gate is green and a separate reviewed change teaches the public site how to consume approved snapshots.

## Local / CI checks

```bash
npm install --ignore-scripts
npm run ci
```

The dedicated GitHub workflow performs TypeScript checking, security-contract tests and a high-severity production dependency audit. It does not deploy anything.
