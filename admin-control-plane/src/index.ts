import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import {
  type AdminEnv,
  appendAudit,
  assertAdminOrigin,
  base64url,
  clearCsrfCookie,
  clearSessionCookie,
  createSession,
  csrfCookie,
  enforceRateLimit,
  fromBase64url,
  hmac,
  json,
  now,
  parseCookies,
  randomId,
  requireSession,
  secureHeaders,
  sessionCookie,
  sha256,
  timingSafeEqual,
} from "./security";

const CHALLENGE_TTL = 5 * 60;
const STEP_UP_TTL = 5 * 60;
const MAX_JSON_BYTES = 64 * 1024;
const RECORD_KEY = /^[a-z0-9][a-z0-9._/-]{0,127}$/;
const ALLOWED_KINDS = new Set([
  "site",
  "page",
  "guide",
  "calculator",
  "seo",
  "navigation",
  "adsense",
  "feature",
  "notice",
  "protected-change",
]);

interface PasskeyRow {
  credential_id: string;
  admin_id: string;
  public_key_b64: string;
  counter: number;
  transports_json: string;
}

interface ChallengeRow {
  id: string;
  purpose: string;
  admin_id: string | null;
  challenge: string;
  expires_at: number;
  consumed_at: number | null;
}

interface RecordRow {
  record_key: string;
  kind: string;
  title: string;
  data_json: string;
  revision: number;
  state: string;
  updated_at: number;
}

const DASHBOARD_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>BuildNumbers Admin</title>
<link rel="stylesheet" href="/assets/admin.css">
</head>
<body>
<main class="shell">
  <header class="topbar"><div><span class="eyebrow">ISOLATED CONTROL PLANE</span><h1>BuildNumbers Admin</h1></div><button id="signout" class="quiet" hidden>Sign out</button></header>
  <section id="auth" class="panel"><h2>Passkey access</h2><p>This console does not use Cloudflare Zero Trust. Access is enforced by app-native WebAuthn with user verification.</p><div class="actions"><button id="login">Sign in with passkey</button><button id="bootstrap" class="quiet">First-device bootstrap</button></div><div id="bootstrapBox" class="stack" hidden><label>One-time bootstrap secret<input id="bootstrapSecret" type="password" autocomplete="off"></label><button id="bootstrapGo">Create owner passkey</button></div><p id="authMsg" class="msg"></p></section>
  <section id="app" hidden>
    <div class="status-grid"><article><span>Authentication</span><strong>Passkey + UV</strong></article><article><span>Mutation protection</span><strong>CSRF + step-up</strong></article><article><span>Publishing</span><strong>Staged only</strong></article><article><span>Audit</span><strong>HMAC chained</strong></article></div>
    <nav class="tabs"><button data-tab="records" class="active">Content & settings</button><button data-tab="release">Release requests</button><button data-tab="audit">Audit log</button><button data-tab="security">Security</button></nav>
    <section id="records" class="tab panel"><div class="section-head"><div><span class="eyebrow">SAFE EDITING</span><h2>Site control records</h2></div><button id="newRecord">New record</button></div><p>Manage pages, guides, SEO, navigation, AdSense settings, feature flags and calculator metadata. Calculation engine code is deliberately release-controlled and cannot be executed from this console.</p><div id="recordList" class="list"></div><form id="recordForm" class="editor" hidden><input id="recordKey" placeholder="record key (example: page/home)" required><select id="recordKind"><option>site</option><option>page</option><option>guide</option><option>calculator</option><option>seo</option><option>navigation</option><option>adsense</option><option>feature</option><option>notice</option><option>protected-change</option></select><input id="recordTitle" placeholder="Title" required><textarea id="recordData" rows="14" spellcheck="false" placeholder='{"field":"value"}' required></textarea><div class="actions"><button type="submit">Save draft</button><button type="button" id="cancelRecord" class="quiet">Cancel</button></div></form></section>
    <section id="release" class="tab panel" hidden><div class="section-head"><div><span class="eyebrow">NO DIRECT DEPLOY</span><h2>Release requests</h2></div><button id="newRelease">Create snapshot</button></div><p>Approved snapshots remain isolated. Integration into the public site is a separate reviewed step.</p><div id="releaseList" class="list"></div></section>
    <section id="audit" class="tab panel" hidden><div class="section-head"><div><span class="eyebrow">TAMPER EVIDENCE</span><h2>Audit trail</h2></div><button id="refreshAudit" class="quiet">Refresh</button></div><div id="auditList" class="list"></div></section>
    <section id="security" class="tab panel" hidden><span class="eyebrow">SECURITY BOUNDARY</span><h2>Control-plane policy</h2><ul><li>No Cloudflare Zero Trust dependency.</li><li>No shared D1 binding with the public site.</li><li>Passkeys require user verification.</li><li>Short-lived HttpOnly SameSite=Strict sessions.</li><li>CSRF token and exact Origin validation on mutations.</li><li>Recent passkey step-up required before content/release mutations.</li><li>Login rate limits use HMAC-pseudonymized network identifiers.</li><li>Admin responses are no-store, noindex, frame denied and CSP locked to self.</li><li>Public Production is not writable from this isolated stage.</li></ul><button id="stepup">Refresh privileged window</button><p id="securityMsg" class="msg"></p></section>
  </section>
</main>
<script src="/assets/admin.js" defer></script>
</body>
</html>`;

function html(body: string, status = 200): Response {
  return new Response(body, { status, headers: secureHeaders("text/html; charset=utf-8") });
}

function text(body: string, status = 200, type = "text/plain; charset=utf-8"): Response {
  return new Response(body, { status, headers: secureHeaders(type) });
}

async function parseJson(request: Request): Promise<Record<string, unknown>> {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(length) && length > MAX_JSON_BYTES) throw new Response("Payload too large", { status: 413 });
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_JSON_BYTES) throw new Response("Payload too large", { status: 413 });
  if (!raw) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Response("Invalid JSON", { status: 400 });
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Response("Invalid JSON object", { status: 400 });
  return parsed as Record<string, unknown>;
}

function webauthnCredential(info: any) {
  const credential = info?.credential ?? null;
  const id = credential?.id ?? info?.credentialID;
  const publicKey = credential?.publicKey ?? info?.credentialPublicKey;
  const counter = credential?.counter ?? info?.counter ?? 0;
  if (!id || !publicKey) throw new Error("WebAuthn registration did not return credential material");
  return { id: String(id), publicKey: publicKey as Uint8Array, counter: Number(counter), transports: credential?.transports ?? [] };
}

async function storeChallenge(env: AdminEnv, purpose: string, challenge: string, adminId: string | null): Promise<string> {
  const id = randomId(24);
  const created = now();
  await env.ADMIN_DB.prepare(
    "INSERT INTO challenges(id, purpose, admin_id, challenge, expires_at, created_at) VALUES(?, ?, ?, ?, ?, ?)",
  ).bind(id, purpose, adminId, challenge, created + CHALLENGE_TTL, created).run();
  return id;
}

async function takeChallenge(env: AdminEnv, id: string, purpose: string): Promise<ChallengeRow> {
  const row = await env.ADMIN_DB.prepare(
    "SELECT id, purpose, admin_id, challenge, expires_at, consumed_at FROM challenges WHERE id = ?",
  ).bind(id).first<ChallengeRow>();
  if (!row || row.purpose !== purpose || row.consumed_at || row.expires_at <= now()) throw new Response("Challenge expired", { status: 400 });
  await env.ADMIN_DB.prepare("UPDATE challenges SET consumed_at = ? WHERE id = ? AND consumed_at IS NULL").bind(now(), id).run();
  return row;
}

async function verifyBootstrapSecret(env: AdminEnv, provided: unknown): Promise<void> {
  if (typeof provided !== "string" || provided.length < 24 || provided.length > 512) throw new Response("Forbidden", { status: 403 });
  const digest = await sha256(provided);
  if (!timingSafeEqual(digest, env.BOOTSTRAP_SECRET_HASH)) throw new Response("Forbidden", { status: 403 });
}

async function adminCount(env: AdminEnv): Promise<number> {
  const row = await env.ADMIN_DB.prepare("SELECT COUNT(*) AS count FROM admins WHERE disabled_at IS NULL").first<{ count: number }>();
  return Number(row?.count ?? 0);
}

async function bootstrapOptions(request: Request, env: AdminEnv): Promise<Response> {
  await enforceRateLimit(request, env, "bootstrap", 5, 60 * 60);
  const body = await parseJson(request);
  await verifyBootstrapSecret(env, body.bootstrapSecret);
  if (await adminCount(env)) throw new Response("Bootstrap closed", { status: 409 });
  const adminId = randomId(18);
  const options = await generateRegistrationOptions({
    rpName: "BuildNumbers Admin",
    rpID: env.RP_ID,
    userID: fromBase64url(adminId),
    userName: "owner",
    userDisplayName: "BuildNumbers Owner",
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "required",
      requireResidentKey: true,
      userVerification: "required",
    },
    supportedAlgorithmIDs: [-7, -257],
  });
  const ticket = await storeChallenge(env, "bootstrap", options.challenge, adminId);
  return json({ ticket, options });
}

async function bootstrapVerify(request: Request, env: AdminEnv): Promise<Response> {
  await enforceRateLimit(request, env, "bootstrap", 5, 60 * 60);
  const body = await parseJson(request);
  await verifyBootstrapSecret(env, body.bootstrapSecret);
  if (await adminCount(env)) throw new Response("Bootstrap closed", { status: 409 });
  if (typeof body.ticket !== "string" || !body.response) throw new Response("Bad request", { status: 400 });
  const challenge = await takeChallenge(env, body.ticket, "bootstrap");
  if (!challenge.admin_id) throw new Response("Bad request", { status: 400 });
  const verification = await verifyRegistrationResponse({
    response: body.response as any,
    expectedChallenge: challenge.challenge,
    expectedOrigin: env.ADMIN_ORIGIN,
    expectedRPID: env.RP_ID,
    requireUserVerification: true,
  });
  if (!verification.verified || !verification.registrationInfo) throw new Response("Passkey verification failed", { status: 401 });
  const credential = webauthnCredential(verification.registrationInfo);
  const created = now();
  await env.ADMIN_DB.batch([
    env.ADMIN_DB.prepare("INSERT INTO admins(id, display_name, created_at) VALUES(?, ?, ?)").bind(challenge.admin_id, "BuildNumbers Owner", created),
    env.ADMIN_DB.prepare("INSERT INTO passkeys(credential_id, admin_id, public_key_b64, counter, transports_json, device_type, backed_up, created_at) VALUES(?, ?, ?, ?, ?, ?, ?, ?)").bind(
      credential.id,
      challenge.admin_id,
      base64url(credential.publicKey),
      credential.counter,
      JSON.stringify(credential.transports),
      (verification.registrationInfo as any).credentialDeviceType ?? null,
      (verification.registrationInfo as any).credentialBackedUp ? 1 : 0,
      created,
    ),
  ]);
  await appendAudit(env, challenge.admin_id, "admin.bootstrap", "owner", { credentialId: credential.id });
  return loginSuccess(env, challenge.admin_id);
}

async function loginOptions(request: Request, env: AdminEnv): Promise<Response> {
  await enforceRateLimit(request, env, "login", 10, 15 * 60);
  if (!(await adminCount(env))) return json({ bootstrapRequired: true }, 409);
  const options = await generateAuthenticationOptions({ rpID: env.RP_ID, userVerification: "required" });
  const ticket = await storeChallenge(env, "login", options.challenge, null);
  return json({ ticket, options });
}

async function getPasskey(env: AdminEnv, credentialId: string): Promise<PasskeyRow> {
  const row = await env.ADMIN_DB.prepare(
    "SELECT credential_id, admin_id, public_key_b64, counter, transports_json FROM passkeys WHERE credential_id = ?",
  ).bind(credentialId).first<PasskeyRow>();
  if (!row) throw new Response("Unauthorized", { status: 401 });
  return row;
}

async function verifyPasskeyResponse(env: AdminEnv, response: any, challenge: ChallengeRow): Promise<PasskeyRow> {
  if (!response || typeof response.id !== "string") throw new Response("Bad request", { status: 400 });
  const passkey = await getPasskey(env, response.id);
  if (challenge.admin_id && challenge.admin_id !== passkey.admin_id) throw new Response("Unauthorized", { status: 401 });
  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge: challenge.challenge,
    expectedOrigin: env.ADMIN_ORIGIN,
    expectedRPID: env.RP_ID,
    credential: {
      id: passkey.credential_id,
      publicKey: fromBase64url(passkey.public_key_b64),
      counter: passkey.counter,
      transports: JSON.parse(passkey.transports_json),
    },
    requireUserVerification: true,
  });
  if (!verification.verified) throw new Response("Passkey verification failed", { status: 401 });
  await env.ADMIN_DB.prepare("UPDATE passkeys SET counter = ?, last_used_at = ? WHERE credential_id = ?")
    .bind(verification.authenticationInfo.newCounter, now(), passkey.credential_id).run();
  return passkey;
}

async function loginVerify(request: Request, env: AdminEnv): Promise<Response> {
  await enforceRateLimit(request, env, "login", 10, 15 * 60);
  const body = await parseJson(request);
  if (typeof body.ticket !== "string") throw new Response("Bad request", { status: 400 });
  const challenge = await takeChallenge(env, body.ticket, "login");
  const passkey = await verifyPasskeyResponse(env, body.response, challenge);
  await appendAudit(env, passkey.admin_id, "auth.login", "session", { credentialId: passkey.credential_id });
  return loginSuccess(env, passkey.admin_id);
}

async function loginSuccess(env: AdminEnv, adminId: string): Promise<Response> {
  const session = await createSession(env, adminId);
  const headers = new Headers();
  headers.append("Set-Cookie", sessionCookie(session.token, session.maxAge));
  headers.append("Set-Cookie", csrfCookie(session.csrf, session.maxAge));
  return json({ ok: true, adminId, csrf: session.csrf }, 200, headers);
}

async function stepupOptions(request: Request, env: AdminEnv): Promise<Response> {
  const principal = await requireSession(request, env);
  await enforceRateLimit(request, env, "stepup", 12, 15 * 60);
  const rows = await env.ADMIN_DB.prepare("SELECT credential_id, transports_json FROM passkeys WHERE admin_id = ?").bind(principal.adminId).all<{ credential_id: string; transports_json: string }>();
  const options = await generateAuthenticationOptions({
    rpID: env.RP_ID,
    userVerification: "required",
    allowCredentials: (rows.results ?? []).map((row) => ({ id: row.credential_id, transports: JSON.parse(row.transports_json) })),
  });
  const ticket = await storeChallenge(env, "stepup", options.challenge, principal.adminId);
  return json({ ticket, options });
}

async function stepupVerify(request: Request, env: AdminEnv): Promise<Response> {
  const principal = await requireSession(request, env);
  const body = await parseJson(request);
  if (typeof body.ticket !== "string") throw new Response("Bad request", { status: 400 });
  const challenge = await takeChallenge(env, body.ticket, "stepup");
  const passkey = await verifyPasskeyResponse(env, body.response, challenge);
  if (passkey.admin_id !== principal.adminId) throw new Response("Unauthorized", { status: 401 });
  const token = parseCookies(request).get("__Host-bn_admin_session");
  if (!token) throw new Response("Unauthorized", { status: 401 });
  const tokenHash = await hmac(env.SESSION_PEPPER, token);
  const until = now() + STEP_UP_TTL;
  await env.ADMIN_DB.prepare("UPDATE sessions SET step_up_until = ? WHERE token_hash = ?").bind(until, tokenHash).run();
  await appendAudit(env, principal.adminId, "auth.stepup", "session", { until });
  return json({ ok: true, stepUpUntil: until });
}

async function sessionInfo(request: Request, env: AdminEnv): Promise<Response> {
  const principal = await requireSession(request, env);
  return json({ authenticated: true, adminId: principal.adminId, csrf: principal.csrf, stepUpUntil: principal.stepUpUntil });
}

async function listRecords(request: Request, env: AdminEnv): Promise<Response> {
  await requireSession(request, env);
  const kind = new URL(request.url).searchParams.get("kind");
  let query = "SELECT record_key, kind, title, data_json, revision, state, updated_at FROM content_records WHERE state != 'retired'";
  const values: unknown[] = [];
  if (kind) {
    if (!ALLOWED_KINDS.has(kind)) throw new Response("Bad kind", { status: 400 });
    query += " AND kind = ?";
    values.push(kind);
  }
  query += " ORDER BY kind, record_key";
  const result = await env.ADMIN_DB.prepare(query).bind(...values).all<RecordRow>();
  return json({ records: (result.results ?? []).map((row) => ({ ...row, data: JSON.parse(row.data_json), data_json: undefined })) });
}

async function saveRecord(request: Request, env: AdminEnv, key: string): Promise<Response> {
  const principal = await requireSession(request, env, true);
  if (!RECORD_KEY.test(key)) throw new Response("Invalid record key", { status: 400 });
  const body = await parseJson(request);
  const kind = typeof body.kind === "string" ? body.kind : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!ALLOWED_KINDS.has(kind) || title.length < 1 || title.length > 200 || body.data === undefined) throw new Response("Invalid record", { status: 400 });
  const dataJson = JSON.stringify(body.data);
  if (new TextEncoder().encode(dataJson).byteLength > MAX_JSON_BYTES) throw new Response("Record too large", { status: 413 });
  const timestamp = now();
  const existing = await env.ADMIN_DB.prepare("SELECT revision FROM content_records WHERE record_key = ?").bind(key).first<{ revision: number }>();
  const revision = (existing?.revision ?? 0) + 1;
  await env.ADMIN_DB.prepare(
    `INSERT INTO content_records(record_key, kind, title, data_json, revision, state, updated_by, updated_at, created_at)
     VALUES(?, ?, ?, ?, ?, 'draft', ?, ?, ?)
     ON CONFLICT(record_key) DO UPDATE SET kind=excluded.kind, title=excluded.title, data_json=excluded.data_json, revision=excluded.revision, state='draft', updated_by=excluded.updated_by, updated_at=excluded.updated_at`,
  ).bind(key, kind, title, dataJson, revision, principal.adminId, timestamp, timestamp).run();
  await appendAudit(env, principal.adminId, "record.save", key, { kind, revision, sha256: await sha256(dataJson) });
  return json({ ok: true, key, revision });
}

async function retireRecord(request: Request, env: AdminEnv, key: string): Promise<Response> {
  const principal = await requireSession(request, env, true);
  await env.ADMIN_DB.prepare("UPDATE content_records SET state='retired', updated_by=?, updated_at=?, revision=revision+1 WHERE record_key=?")
    .bind(principal.adminId, now(), key).run();
  await appendAudit(env, principal.adminId, "record.retire", key, {});
  return json({ ok: true });
}

async function listReleaseRequests(request: Request, env: AdminEnv): Promise<Response> {
  await requireSession(request, env);
  const result = await env.ADMIN_DB.prepare(
    "SELECT id, label, record_keys_json, snapshot_sha256, state, created_at, approved_at, integrated_at FROM release_requests ORDER BY created_at DESC LIMIT 100",
  ).all();
  return json({ releases: result.results ?? [] });
}

async function createReleaseRequest(request: Request, env: AdminEnv): Promise<Response> {
  const principal = await requireSession(request, env, true);
  const body = await parseJson(request);
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const keys = Array.isArray(body.keys) ? [...new Set(body.keys.filter((value): value is string => typeof value === "string" && RECORD_KEY.test(value)))].sort() : [];
  if (!label || label.length > 160 || !keys.length || keys.length > 200) throw new Response("Invalid release request", { status: 400 });
  const placeholders = keys.map(() => "?").join(",");
  const records = await env.ADMIN_DB.prepare(
    `SELECT record_key, kind, title, data_json, revision FROM content_records WHERE state != 'retired' AND record_key IN (${placeholders}) ORDER BY record_key`,
  ).bind(...keys).all<RecordRow>();
  if ((records.results ?? []).length !== keys.length) throw new Response("One or more records are missing", { status: 409 });
  const snapshot = JSON.stringify((records.results ?? []).map((row) => ({ key: row.record_key, kind: row.kind, title: row.title, data: JSON.parse(row.data_json), revision: row.revision })));
  const id = randomId(18);
  const digest = await sha256(snapshot);
  await env.ADMIN_DB.prepare(
    "INSERT INTO release_requests(id, label, record_keys_json, snapshot_json, snapshot_sha256, created_by, created_at) VALUES(?, ?, ?, ?, ?, ?, ?)",
  ).bind(id, label, JSON.stringify(keys), snapshot, digest, principal.adminId, now()).run();
  await appendAudit(env, principal.adminId, "release.create", id, { label, keys, snapshotSha256: digest });
  return json({ ok: true, id, snapshotSha256: digest });
}

async function approveRelease(request: Request, env: AdminEnv, id: string): Promise<Response> {
  const principal = await requireSession(request, env, true);
  const result = await env.ADMIN_DB.prepare("UPDATE release_requests SET state='approved', approved_at=? WHERE id=? AND state='pending'").bind(now(), id).run();
  if (!result.meta.changes) throw new Response("Release request is not pending", { status: 409 });
  await appendAudit(env, principal.adminId, "release.approve", id, {});
  return json({ ok: true });
}

async function listAudit(request: Request, env: AdminEnv): Promise<Response> {
  await requireSession(request, env);
  const result = await env.ADMIN_DB.prepare(
    "SELECT sequence, actor_admin_id, action, target, detail_json, created_at, previous_hmac, entry_hmac FROM audit_log ORDER BY sequence DESC LIMIT 100",
  ).all();
  return json({ entries: result.results ?? [] });
}

async function logout(request: Request, env: AdminEnv): Promise<Response> {
  const principal = await requireSession(request, env);
  const token = parseCookies(request).get("__Host-bn_admin_session");
  if (token) {
    const tokenHash = await hmac(env.SESSION_PEPPER, token);
    await env.ADMIN_DB.prepare("UPDATE sessions SET revoked_at = ? WHERE token_hash = ?").bind(now(), tokenHash).run();
  }
  await appendAudit(env, principal.adminId, "auth.logout", "session", {});
  const headers = new Headers();
  headers.append("Set-Cookie", clearSessionCookie());
  headers.append("Set-Cookie", clearCsrfCookie());
  return json({ ok: true }, 200, headers);
}

function safeError(response: Response): Response {
  const headers = secureHeaders(response.headers.get("content-type") ?? "text/plain; charset=utf-8");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function route(request: Request, env: AdminEnv): Promise<Response> {
  assertAdminOrigin(request, env);
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === "GET" && path === "/") return html(DASHBOARD_HTML);
  if (request.method === "GET" && path === "/health") return text("ok\n");
  if (request.method === "GET" && path === "/assets/admin.css") return text(ADMIN_CSS, 200, "text/css; charset=utf-8");
  if (request.method === "GET" && path === "/assets/admin.js") return text(ADMIN_JS, 200, "text/javascript; charset=utf-8");

  if (request.method === "POST" && path === "/api/bootstrap/options") return bootstrapOptions(request, env);
  if (request.method === "POST" && path === "/api/bootstrap/verify") return bootstrapVerify(request, env);
  if (request.method === "POST" && path === "/api/auth/options") return loginOptions(request, env);
  if (request.method === "POST" && path === "/api/auth/verify") return loginVerify(request, env);
  if (request.method === "GET" && path === "/api/session") return sessionInfo(request, env);
  if (request.method === "POST" && path === "/api/auth/stepup/options") return stepupOptions(request, env);
  if (request.method === "POST" && path === "/api/auth/stepup/verify") return stepupVerify(request, env);
  if (request.method === "POST" && path === "/api/logout") return logout(request, env);

  if (request.method === "GET" && path === "/api/records") return listRecords(request, env);
  if (path.startsWith("/api/records/")) {
    const key = decodeURIComponent(path.slice("/api/records/".length));
    if (request.method === "PUT") return saveRecord(request, env, key);
    if (request.method === "DELETE") return retireRecord(request, env, key);
  }
  if (request.method === "GET" && path === "/api/release-requests") return listReleaseRequests(request, env);
  if (request.method === "POST" && path === "/api/release-requests") return createReleaseRequest(request, env);
  const approveMatch = path.match(/^\/api\/release-requests\/([A-Za-z0-9_-]+)\/approve$/);
  if (request.method === "POST" && approveMatch) return approveRelease(request, env, approveMatch[1]);
  if (request.method === "GET" && path === "/api/audit") return listAudit(request, env);

  return text("Not found", 404);
}

export default {
  async fetch(request: Request, env: AdminEnv): Promise<Response> {
    try {
      return await route(request, env);
    } catch (error) {
      if (error instanceof Response) return safeError(error);
      console.error("admin-control-plane", error);
      return text("Internal error", 500);
    }
  },
};

const ADMIN_CSS = `:root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,sans-serif;background:#07111f;color:#eaf1f8}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at top,#102842 0,#07111f 42%);min-height:100vh}.shell{width:min(1120px,calc(100% - 28px));margin:0 auto;padding:28px 0 64px}.topbar,.section-head,.actions{display:flex;align-items:center;justify-content:space-between;gap:14px}.eyebrow{font-size:.72rem;letter-spacing:.16em;color:#7dd3fc;font-weight:800}h1{margin:.25rem 0;font-size:clamp(1.8rem,5vw,3.4rem)}h2{margin:.2rem 0 1rem}.panel,.status-grid article{background:#0d1b2b;border:1px solid #243a51;border-radius:18px;box-shadow:0 18px 50px #0005}.panel{padding:22px;margin:20px 0}.status-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0}.status-grid article{padding:16px}.status-grid span{display:block;color:#91a4b7;font-size:.78rem}.status-grid strong{display:block;margin-top:6px}.tabs{display:flex;gap:8px;flex-wrap:wrap}.tabs button,.quiet{background:#102235;color:#c9d8e7;border:1px solid #31485f}.tabs button.active{border-color:#38bdf8;color:white}button{appearance:none;border:0;border-radius:11px;padding:11px 15px;background:#0ea5e9;color:#03111c;font-weight:800;cursor:pointer}button:disabled{opacity:.5;cursor:not-allowed}.stack,.editor{display:grid;gap:12px;margin-top:18px}label{display:grid;gap:6px}input,select,textarea{width:100%;border:1px solid #31485f;background:#071421;color:#eaf1f8;border-radius:10px;padding:11px;font:inherit}textarea{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.list{display:grid;gap:10px;margin-top:16px}.item{padding:14px;border:1px solid #263c52;border-radius:12px;background:#0a1725}.item small{color:#8da3b7}.item .row{display:flex;align-items:center;justify-content:space-between;gap:10px}.msg{min-height:1.3em;color:#fbbf24}ul{line-height:1.8}@media(max-width:760px){.status-grid{grid-template-columns:1fr 1fr}.topbar,.section-head{align-items:flex-start;flex-direction:column}.shell{width:min(100% - 20px,1120px);padding-top:18px}}`;

const ADMIN_JS = `const $=s=>document.querySelector(s);let csrf='';const b64=b=>{const a=new Uint8Array(b);let s='';a.forEach(v=>s+=String.fromCharCode(v));return btoa(s).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,'')};const bin=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');s+='='.repeat((4-s.length%4)%4);const b=atob(s);return Uint8Array.from(b,c=>c.charCodeAt(0))};function pub(o){o={...o,challenge:bin(o.challenge),user:o.user?{...o.user,id:bin(o.user.id)}:o.user};if(o.excludeCredentials)o.excludeCredentials=o.excludeCredentials.map(x=>({...x,id:bin(x.id)}));if(o.allowCredentials)o.allowCredentials=o.allowCredentials.map(x=>({...x,id:bin(x.id)}));return o}function regJSON(c){return{id:c.id,rawId:b64(c.rawId),type:c.type,response:{clientDataJSON:b64(c.response.clientDataJSON),attestationObject:b64(c.response.attestationObject),transports:c.response.getTransports?c.response.getTransports():[]},clientExtensionResults:c.getClientExtensionResults(),authenticatorAttachment:c.authenticatorAttachment}}function authJSON(c){return{id:c.id,rawId:b64(c.rawId),type:c.type,response:{clientDataJSON:b64(c.response.clientDataJSON),authenticatorData:b64(c.response.authenticatorData),signature:b64(c.response.signature),userHandle:c.response.userHandle?b64(c.response.userHandle):null},clientExtensionResults:c.getClientExtensionResults(),authenticatorAttachment:c.authenticatorAttachment}}async function api(path,opt={}){const h={'content-type':'application/json',...(opt.headers||{})};if(csrf&&!['GET','HEAD'].includes(opt.method||'GET'))h['x-csrf-token']=csrf;const r=await fetch(path,{...opt,headers:h});let d={};try{d=await r.json()}catch{}if(!r.ok){const e=new Error(d.error||r.statusText||'Request failed');e.status=r.status;throw e}return d}async function login(){const a=await api('/api/auth/options',{method:'POST',body:'{}'});const c=await navigator.credentials.get({publicKey:pub(a.options)});const d=await api('/api/auth/verify',{method:'POST',body:JSON.stringify({ticket:a.ticket,response:authJSON(c)})});csrf=d.csrf;await enter()}async function bootstrap(){const secret=$('#bootstrapSecret').value;const a=await api('/api/bootstrap/options',{method:'POST',body:JSON.stringify({bootstrapSecret:secret})});const c=await navigator.credentials.create({publicKey:pub(a.options)});const d=await api('/api/bootstrap/verify',{method:'POST',body:JSON.stringify({ticket:a.ticket,bootstrapSecret:secret,response:regJSON(c)})});csrf=d.csrf;$('#bootstrapSecret').value='';await enter()}async function stepup(){const a=await api('/api/auth/stepup/options',{method:'POST',body:'{}'});const c=await navigator.credentials.get({publicKey:pub(a.options)});await api('/api/auth/stepup/verify',{method:'POST',body:JSON.stringify({ticket:a.ticket,response:authJSON(c)})});$('#securityMsg').textContent='Privileged window refreshed for 5 minutes.'}async function enter(){const s=await api('/api/session');csrf=s.csrf;$('#auth').hidden=true;$('#app').hidden=false;$('#signout').hidden=false;await Promise.all([records(),releases(),audit()])}async function records(){const d=await api('/api/records');const el=$('#recordList');el.innerHTML='';d.records.forEach(r=>{const x=document.createElement('div');x.className='item';x.innerHTML='<div class="row"><div><strong></strong><br><small></small></div><button class="quiet">Edit</button></div>';x.querySelector('strong').textContent=r.title;x.querySelector('small').textContent=r.kind+' · '+r.record_key+' · rev '+r.revision;x.querySelector('button').onclick=()=>edit(r);el.appendChild(x)})}function edit(r){$('#recordForm').hidden=false;$('#recordKey').value=r.record_key;$('#recordKey').readOnly=true;$('#recordKind').value=r.kind;$('#recordTitle').value=r.title;$('#recordData').value=JSON.stringify(r.data,null,2)}async function save(e){e.preventDefault();try{await stepup();const key=$('#recordKey').value;const body={kind:$('#recordKind').value,title:$('#recordTitle').value,data:JSON.parse($('#recordData').value)};await api('/api/records/'+encodeURIComponent(key),{method:'PUT',body:JSON.stringify(body)});$('#recordForm').hidden=true;await records()}catch(e){alert(e.message)}}async function releases(){const d=await api('/api/release-requests');const el=$('#releaseList');el.innerHTML='';d.releases.forEach(r=>{const x=document.createElement('div');x.className='item';x.textContent=r.label+' · '+r.state+' · '+r.snapshot_sha256;el.appendChild(x)})}async function makeRelease(){const d=await api('/api/records');const keys=d.records.map(r=>r.record_key);if(!keys.length)return alert('No records yet');const label=prompt('Release snapshot label');if(!label)return;await stepup();await api('/api/release-requests',{method:'POST',body:JSON.stringify({label,keys})});await releases()}async function audit(){const d=await api('/api/audit');const el=$('#auditList');el.innerHTML='';d.entries.forEach(r=>{const x=document.createElement('div');x.className='item';x.textContent='#'+r.sequence+' '+r.action+' · '+r.target+' · '+new Date(r.created_at*1000).toISOString();el.appendChild(x)})}document.addEventListener('DOMContentLoaded',async()=>{$('#login').onclick=()=>login().catch(e=>$('#authMsg').textContent=e.message);$('#bootstrap').onclick=()=>$('#bootstrapBox').hidden=!$('#bootstrapBox').hidden;$('#bootstrapGo').onclick=()=>bootstrap().catch(e=>$('#authMsg').textContent=e.message);$('#stepup').onclick=()=>stepup().catch(e=>$('#securityMsg').textContent=e.message);$('#newRecord').onclick=()=>{$('#recordForm').reset();$('#recordForm').hidden=false;$('#recordKey').readOnly=false};$('#cancelRecord').onclick=()=>$('#recordForm').hidden=true;$('#recordForm').onsubmit=save;$('#newRelease').onclick=()=>makeRelease().catch(e=>alert(e.message));$('#refreshAudit').onclick=()=>audit().catch(e=>alert(e.message));$('#signout').onclick=async()=>{await api('/api/logout',{method:'POST',body:'{}'});location.reload()};document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.tab').forEach(x=>x.hidden=x.id!==b.dataset.tab)});try{await enter()}catch{}});`;
