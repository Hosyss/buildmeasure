import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const security = readFileSync(new URL('../src/security.ts', import.meta.url), 'utf8');
const worker = readFileSync(new URL('../src/index.ts', import.meta.url), 'utf8');
const ui = readFileSync(new URL('../src/ui.ts', import.meta.url), 'utf8');
const schema = readFileSync(new URL('../schema.sql', import.meta.url), 'utf8');
const wrangler = readFileSync(new URL('../wrangler.toml.example', import.meta.url), 'utf8');

test('control plane has no Cloudflare Access / Zero Trust technical dependency', () => {
  const runtime = worker + security + wrangler;
  assert.doesNotMatch(runtime, /cf-access-jwt-assertion|cf-access-authenticated-user-email|access_application_aud|access_team_domain/i);
  assert.doesNotMatch(wrangler, /\[access\]|access_policy|zero_trust|access_application/i);
  assert.match(worker, /verifyAuthenticationResponse/);
  assert.match(worker, /verifyRegistrationResponse/);
});

test('admin session and CSRF cookies are host-only HttpOnly secure and strict', () => {
  assert.match(security, /__Host-bn_admin_session=.*HttpOnly; Secure; SameSite=Strict/);
  assert.match(security, /__Host-bn_admin_csrf=.*HttpOnly; Secure; SameSite=Strict/);
  assert.match(security, /x-csrf-token/i);
});

test('mutations require exact origin and recent step-up', () => {
  assert.match(security, /origin !== expected\.origin/);
  assert.match(worker, /requireSession\(request, env, true\)/);
  assert.match(worker, /verifyAuthenticationResponse/);
  assert.match(worker, /userVerification:\s*"required"/);
});

test('WebAuthn challenges are atomically single-use', () => {
  assert.match(worker, /UPDATE challenges SET consumed_at = \? WHERE id = \? AND purpose = \? AND consumed_at IS NULL AND expires_at > \?/);
  assert.match(worker, /claim\.meta\.changes \?\? 0/);
  assert.match(worker, /Challenge expired or already used/);
});

test('response policy blocks framing, indexing, foreign scripts and caching', () => {
  assert.match(security, /frame-ancestors 'none'/);
  assert.match(security, /script-src 'self'/);
  assert.match(security, /X-Robots-Tag/);
  assert.match(security, /no-store/);
  assert.match(security, /X-Frame-Options", "DENY"/);
});

test('admin data is isolated and release flow is staged', () => {
  assert.match(wrangler, /binding = "ADMIN_DB"/);
  assert.match(wrangler, /database_name = "buildnumbers-admin"/);
  assert.match(wrangler, /workers_dev = true/);
  assert.match(wrangler, /ADMIN_ORIGIN = "https:\/\/buildnumbers-admin\.buildtools\.workers\.dev"/);
  assert.match(wrangler, /RP_ID = "buildnumbers-admin\.buildtools\.workers\.dev"/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS release_requests/);
  assert.match(ui, /NO DIRECT DEPLOY/);
  assert.doesNotMatch(worker + ui, /wrangler deploy|pages deploy|fetch\([^)]*buildnumbers\.pages\.dev/i);
});

test('bootstrap is constrained to one owner at the database boundary', () => {
  assert.match(schema, /owner_slot INTEGER NOT NULL DEFAULT 1 UNIQUE CHECK \(owner_slot = 1\)/);
});

test('backup passkeys require verified registration and the last passkey cannot be deleted', () => {
  assert.match(schema, /label TEXT NOT NULL DEFAULT 'Passkey'/);
  assert.match(worker, /registerPasskeyOptions/);
  assert.match(worker, /registerPasskeyVerify/);
  assert.match(worker, /verifyRegistrationResponse/);
  assert.match(worker, /purpose:\s*string/);
  assert.match(worker, /\(SELECT COUNT\(\*\) FROM passkeys WHERE admin_id = \?\) > 1/);
  assert.match(worker, /Cannot remove the last passkey/);
  assert.match(ui, /Add backup passkey/);
});

test('audit log is chained with secret HMAC material', () => {
  assert.match(schema, /previous_hmac TEXT NOT NULL/);
  assert.match(schema, /entry_hmac TEXT NOT NULL/);
  assert.match(security, /AUDIT_HMAC_SECRET/);
  assert.match(security, /previous\?\.entry_hmac \?\? "GENESIS"/);
});

test('raw IP addresses are not persisted by rate limiting', () => {
  assert.match(security, /cf-connecting-ip/);
  assert.match(security, /hmac\(env\.RATE_LIMIT_PEPPER, ip\)/);
  assert.doesNotMatch(schema, /\bip_address\b|\braw_ip\b/i);
});
