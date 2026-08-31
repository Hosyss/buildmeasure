# Admin Control Plane Security Review

Status: isolated pre-deployment candidate. This document does not claim that any internet-facing system is unhackable.

## Boundary

- Source branch: `security/admin-control-plane-app-auth-20260831`
- Public BuildNumbers release branch is not modified by this control plane until a reviewed merge.
- No Cloudflare Access / Zero Trust authentication dependency.
- Separate Worker and separate D1 are mandatory at deployment time.
- No direct Production deploy or public-database write capability exists in this stage.

## Controls implemented

- WebAuthn/passkeys with `userVerification: required` for bootstrap, login, step-up and backup-passkey registration.
- WebAuthn challenges expire after five minutes and are atomically claimed once before verification to stop concurrent replay.
- One-time bootstrap secret plus a database-level single-owner constraint closes bootstrap races.
- 30-minute absolute session lifetime with a 10-minute idle cutoff.
- Host-only `__Host-` session and CSRF cookies are `HttpOnly`, `Secure` and `SameSite=Strict`.
- Exact Origin validation and synchronizer CSRF header verification protect state-changing requests.
- A fresh passkey step-up is required before content, release and passkey mutations.
- Login/bootstrap/step-up rate limiting stores an HMAC-pseudonymized network identifier rather than the raw client IP.
- Backup passkeys are supported; deletion is conditional on another passkey remaining.
- Admin responses are `no-store`, `noindex`, frame-denied and constrained by a self-only CSP.
- Audit events form an HMAC chain whose signing secret is kept outside D1.
- Content changes are staged records and immutable release snapshots; arbitrary browser-supplied JavaScript is not executable.

## Automated evidence

On head `c0bf89a7cc7b84468a0d3895baa5c780d4348531`, GitHub Actions run `33339140900` completed:

- strict TypeScript check: PASS
- security contracts: 10/10 PASS
- high-risk production dependency audit: PASS
- npm reported 0 vulnerabilities

## Still required before an internet-facing Admin deployment

1. Provision a dedicated `buildnumbers-admin` D1 database and apply only `admin-control-plane/schema.sql`.
2. Provision independent high-entropy secrets for session, rate-limit and audit HMAC keys plus the one-time bootstrap digest.
3. Deploy a separate Worker to a dedicated admin hostname with `workers_dev = false`; do not bind the public D1.
4. Register a primary passkey and a backup passkey on separate trusted devices.
5. Perform live negative tests for unauthorized access, bad Origin, bad CSRF, expired sessions, reused challenges, rate limits and last-passkey deletion.
6. Verify live response headers and noindex/no-store behavior from outside the deployment environment.
7. Run a fresh external security-header scan against the final admin hostname.
8. Only after those gates pass, review how approved snapshots may be consumed by the public site. Do not give the Admin Worker arbitrary code execution or direct deploy credentials.
