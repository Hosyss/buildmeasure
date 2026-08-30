import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const security = readFileSync(new URL('../src/security.ts', import.meta.url), 'utf8');
const worker = readFileSync(new URL('../src/index.ts', import.meta.url), 'utf8');
const schema = readFileSync(new URL('../schema.sql', import.meta.url), 'utf8');
const wrangler = readFileSync(new URL('../wrangler.toml.example', import.meta.url), 'utf8');

test('control plane has no Zero Trust dependency', () => {
  assert.doesNotMatch(worker + security + wrangler, /cloudflare access|zero trust|cf-access-/i);
});

test('admin session is host-only secure and strict', () => {
  assert.match(security, /__Host-bn_admin_session=/);
  assert.match(security, /HttpOnly; Secure; SameSite=Strict/);
  assert.match(security, /__Host-bn_admin_csrf=/);
  assert.match(security, /x-csrf-token/i);
});

test('mutations require exact origin and recent step-up', () => {
  assert.match(security, /origin !== expected\.origin/);
  assert.match(worker, /requireSession\(request, env, true\)/);
  assert.match(worker, /verifyAuthenticationResponse/);
  assert.match(worker, /userVerification:\s*"required"/);
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
  assert.match(wrangler, /workers_dev = false/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS release_requests/);
  assert.match(worker, /NO DIRECT DEPLOY/);
  assert.doesNotMatch(worker, /wrangler deploy|pages deploy|fetch\([^)]*buildnumbers\.pages\.dev/i);
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
