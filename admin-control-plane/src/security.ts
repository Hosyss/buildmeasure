export interface AdminEnv {
  ADMIN_DB: D1Database;
  ADMIN_ORIGIN: string;
  RP_ID: string;
  BOOTSTRAP_SECRET_HASH: string;
  SESSION_PEPPER: string;
  RATE_LIMIT_PEPPER: string;
  AUDIT_HMAC_SECRET: string;
}

export interface SessionPrincipal {
  adminId: string;
  csrf: string;
  stepUpUntil: number;
}

const encoder = new TextEncoder();

export function now(): number {
  return Math.floor(Date.now() / 1000);
}

export function randomId(bytes = 32): string {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  return base64url(data);
}

export function base64url(data: Uint8Array): string {
  let binary = "";
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function fromBase64url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return base64url(new Uint8Array(digest));
}

export async function hmac(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return base64url(new Uint8Array(signature));
}

export function timingSafeEqual(a: string, b: string): boolean {
  const aa = encoder.encode(a);
  const bb = encoder.encode(b);
  if (aa.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < aa.length; i += 1) diff |= aa[i] ^ bb[i];
  return diff === 0;
}

export function parseCookies(request: Request): Map<string, string> {
  const result = new Map<string, string>();
  const raw = request.headers.get("cookie") ?? "";
  for (const pair of raw.split(";")) {
    const index = pair.indexOf("=");
    if (index < 1) continue;
    result.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim());
  }
  return result;
}

export function sessionCookie(token: string, maxAge: number): string {
  return `__Host-bn_admin_session=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
}

export function csrfCookie(token: string, maxAge: number): string {
  return `__Host-bn_admin_csrf=${token}; Path=/; Max-Age=${maxAge}; Secure; SameSite=Strict`;
}

export function clearSessionCookie(): string {
  return "__Host-bn_admin_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict";
}

export function clearCsrfCookie(): string {
  return "__Host-bn_admin_csrf=; Path=/; Max-Age=0; Secure; SameSite=Strict";
}

export function assertAdminOrigin(request: Request, env: AdminEnv): void {
  const url = new URL(request.url);
  const expected = new URL(env.ADMIN_ORIGIN);
  if (url.origin !== expected.origin) throw new Response("Not found", { status: 404 });

  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const origin = request.headers.get("origin");
    if (origin !== expected.origin) throw new Response("Forbidden", { status: 403 });
  }
}

export function secureHeaders(contentType: string, extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  headers.set("Content-Type", contentType);
  headers.set("Cache-Control", "no-store, max-age=0");
  headers.set("Pragma", "no-cache");
  headers.set("Content-Security-Policy", [
    "default-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "object-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'none'",
    "worker-src 'none'",
  ].join("; "));
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), browsing-topics=()");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  return headers;
}

export function json(data: unknown, status = 200, extra?: HeadersInit): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: secureHeaders("application/json; charset=utf-8", extra),
  });
}

export async function requestActorHash(request: Request, env: AdminEnv): Promise<string> {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  return hmac(env.RATE_LIMIT_PEPPER, ip);
}

export async function enforceRateLimit(
  request: Request,
  env: AdminEnv,
  scope: string,
  limit: number,
  windowSeconds: number,
): Promise<void> {
  const actorHash = await requestActorHash(request, env);
  const bucketStart = Math.floor(now() / windowSeconds) * windowSeconds;
  await env.ADMIN_DB.prepare(
    `INSERT INTO rate_limits(scope, actor_hash, bucket_start, hits) VALUES(?, ?, ?, 1)
     ON CONFLICT(scope, actor_hash, bucket_start) DO UPDATE SET hits = hits + 1`,
  ).bind(scope, actorHash, bucketStart).run();
  const row = await env.ADMIN_DB.prepare(
    "SELECT hits FROM rate_limits WHERE scope = ? AND actor_hash = ? AND bucket_start = ?",
  ).bind(scope, actorHash, bucketStart).first<{ hits: number }>();
  if ((row?.hits ?? 0) > limit) throw new Response("Too many requests", { status: 429 });
}

export async function createSession(env: AdminEnv, adminId: string): Promise<{ token: string; csrf: string; maxAge: number }> {
  const token = randomId(32);
  const csrf = randomId(24);
  const created = now();
  const maxAge = 30 * 60;
  const tokenHash = await hmac(env.SESSION_PEPPER, token);
  const csrfHash = await sha256(csrf);
  await env.ADMIN_DB.prepare(
    "INSERT INTO sessions(token_hash, admin_id, csrf_hash, created_at, last_seen_at, expires_at, step_up_until) VALUES(?, ?, ?, ?, ?, ?, ?)",
  ).bind(tokenHash, adminId, csrfHash, created, created, created + maxAge, created + 5 * 60).run();
  return { token, csrf, maxAge };
}

export async function requireSession(request: Request, env: AdminEnv, requireStepUp = false): Promise<SessionPrincipal> {
  const cookies = parseCookies(request);
  const token = cookies.get("__Host-bn_admin_session");
  const csrf = cookies.get("__Host-bn_admin_csrf");
  if (!token || !csrf) throw new Response("Unauthorized", { status: 401 });
  const tokenHash = await hmac(env.SESSION_PEPPER, token);
  const row = await env.ADMIN_DB.prepare(
    "SELECT admin_id, csrf_hash, last_seen_at, expires_at, step_up_until, revoked_at FROM sessions WHERE token_hash = ?",
  ).bind(tokenHash).first<{ admin_id: string; csrf_hash: string; last_seen_at: number; expires_at: number; step_up_until: number; revoked_at: number | null }>();
  const current = now();
  if (!row || row.revoked_at || row.expires_at <= current || row.last_seen_at < current - 10 * 60) {
    throw new Response("Unauthorized", { status: 401 });
  }
  if (!timingSafeEqual(row.csrf_hash, await sha256(csrf))) throw new Response("Unauthorized", { status: 401 });
  if (!["GET", "HEAD"].includes(request.method)) {
    const submitted = request.headers.get("x-csrf-token");
    if (!submitted || !timingSafeEqual(submitted, csrf)) throw new Response("Forbidden", { status: 403 });
  }
  if (requireStepUp && row.step_up_until < current) throw new Response("Step-up required", { status: 428 });
  await env.ADMIN_DB.prepare("UPDATE sessions SET last_seen_at = ? WHERE token_hash = ?").bind(current, tokenHash).run();
  return { adminId: row.admin_id, csrf, stepUpUntil: row.step_up_until };
}

export async function revokeSession(request: Request, env: AdminEnv): Promise<void> {
  const token = parseCookies(request).get("__Host-bn_admin_session");
  if (!token) return;
  const tokenHash = await hmac(env.SESSION_PEPPER, token);
  await env.ADMIN_DB.prepare("UPDATE sessions SET revoked_at = ? WHERE token_hash = ?").bind(now(), tokenHash).run();
}

export async function appendAudit(
  env: AdminEnv,
  actorAdminId: string | null,
  action: string,
  target: string,
  detail: unknown,
): Promise<void> {
  const previous = await env.ADMIN_DB.prepare(
    "SELECT sequence, entry_hmac FROM audit_log ORDER BY sequence DESC LIMIT 1",
  ).first<{ sequence: number; entry_hmac: string }>();
  const sequence = (previous?.sequence ?? 0) + 1;
  const createdAt = now();
  const detailJson = JSON.stringify(detail ?? {});
  const previousHmac = previous?.entry_hmac ?? "GENESIS";
  const id = randomId(18);
  const payload = [sequence, actorAdminId ?? "system", action, target, detailJson, createdAt, previousHmac].join("\n");
  const entryHmac = await hmac(env.AUDIT_HMAC_SECRET, payload);
  await env.ADMIN_DB.prepare(
    "INSERT INTO audit_log(id, sequence, actor_admin_id, action, target, detail_json, created_at, previous_hmac, entry_hmac) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)",
  ).bind(id, sequence, actorAdminId, action, target, detailJson, createdAt, previousHmac, entryHmac).run();
}
