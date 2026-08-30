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
import { ADMIN_CSS, ADMIN_JS, DASHBOARD_HTML } from "./ui";

const CHALLENGE_TTL = 5 * 60;
const STEP_UP_TTL = 5 * 60;
const MAX_JSON_BYTES = 64 * 1024;
const RECORD_KEY = /^[a-z0-9][a-z0-9._/-]{0,127}$/;
const CREDENTIAL_ID = /^[A-Za-z0-9_-]{8,1024}$/;
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

function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: secureHeaders("text/html; charset=utf-8"),
  });
}

function text(
  body: string,
  status = 200,
  type = "text/plain; charset=utf-8",
): Response {
  return new Response(body, { status, headers: secureHeaders(type) });
}

async function parseJson(request: Request): Promise<Record<string, unknown>> {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(length) && length > MAX_JSON_BYTES) {
    throw new Response("Payload too large", { status: 413 });
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_JSON_BYTES) {
    throw new Response("Payload too large", { status: 413 });
  }
  if (!raw) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Response("Invalid JSON", { status: 400 });
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Response("Invalid JSON object", { status: 400 });
  }
  return parsed as Record<string, unknown>;
}

function passkeyLabel(value: unknown): string {
  if (typeof value !== "string") return "Backup passkey";
  const label = value.trim();
  if (!label || label.length > 80 || /[\u0000-\u001f\u007f]/.test(label)) {
    throw new Response("Invalid passkey label", { status: 400 });
  }
  return label;
}

function webauthnCredential(info: any) {
  const credential = info?.credential ?? null;
  const id = credential?.id ?? info?.credentialID;
  const publicKey = credential?.publicKey ?? info?.credentialPublicKey;
  const counter = credential?.counter ?? info?.counter ?? 0;

  if (!id || !publicKey) {
    throw new Error("WebAuthn registration did not return credential material");
  }

  return {
    id: String(id),
    publicKey: publicKey as Uint8Array,
    counter: Number(counter),
    transports: credential?.transports ?? [],
  };
}

async function storeChallenge(
  env: AdminEnv,
  purpose: string,
  challenge: string,
  adminId: string | null,
): Promise<string> {
  const id = randomId(24);
  const created = now();
  await env.ADMIN_DB.prepare(
    "INSERT INTO challenges(id, purpose, admin_id, challenge, expires_at, created_at) VALUES(?, ?, ?, ?, ?, ?)",
  )
    .bind(id, purpose, adminId, challenge, created + CHALLENGE_TTL, created)
    .run();
  return id;
}

async function takeChallenge(
  env: AdminEnv,
  id: string,
  purpose: string,
): Promise<ChallengeRow> {
  const claimedAt = now();
  const claim = await env.ADMIN_DB.prepare(
    "UPDATE challenges SET consumed_at = ? WHERE id = ? AND purpose = ? AND consumed_at IS NULL AND expires_at > ?",
  )
    .bind(claimedAt, id, purpose, claimedAt)
    .run();

  if ((claim.meta.changes ?? 0) !== 1) {
    throw new Response("Challenge expired or already used", { status: 400 });
  }

  const row = await env.ADMIN_DB.prepare(
    "SELECT id, purpose, admin_id, challenge, expires_at, consumed_at FROM challenges WHERE id = ?",
  )
    .bind(id)
    .first<ChallengeRow>();

  if (!row) {
    throw new Response("Challenge unavailable", { status: 400 });
  }
  return row;
}

async function verifyBootstrapSecret(
  env: AdminEnv,
  provided: unknown,
): Promise<void> {
  if (
    typeof provided !== "string" ||
    provided.length < 24 ||
    provided.length > 512
  ) {
    throw new Response("Forbidden", { status: 403 });
  }

  const digest = await sha256(provided);
  if (!timingSafeEqual(digest, env.BOOTSTRAP_SECRET_HASH)) {
    throw new Response("Forbidden", { status: 403 });
  }
}

async function adminCount(env: AdminEnv): Promise<number> {
  const row = await env.ADMIN_DB.prepare(
    "SELECT COUNT(*) AS count FROM admins WHERE disabled_at IS NULL",
  ).first<{ count: number }>();
  return Number(row?.count ?? 0);
}

async function bootstrapOptions(
  request: Request,
  env: AdminEnv,
): Promise<Response> {
  await enforceRateLimit(request, env, "bootstrap", 5, 60 * 60);
  const body = await parseJson(request);
  await verifyBootstrapSecret(env, body.bootstrapSecret);

  if (await adminCount(env)) {
    throw new Response("Bootstrap closed", { status: 409 });
  }

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

  const ticket = await storeChallenge(
    env,
    "bootstrap",
    options.challenge,
    adminId,
  );
  return json({ ticket, options });
}

async function bootstrapVerify(
  request: Request,
  env: AdminEnv,
): Promise<Response> {
  await enforceRateLimit(request, env, "bootstrap", 5, 60 * 60);
  const body = await parseJson(request);
  await verifyBootstrapSecret(env, body.bootstrapSecret);

  if (await adminCount(env)) {
    throw new Response("Bootstrap closed", { status: 409 });
  }
  if (typeof body.ticket !== "string" || !body.response) {
    throw new Response("Bad request", { status: 400 });
  }

  const challenge = await takeChallenge(env, body.ticket, "bootstrap");
  if (!challenge.admin_id) {
    throw new Response("Bad request", { status: 400 });
  }

  const verification = await verifyRegistrationResponse({
    response: body.response as any,
    expectedChallenge: challenge.challenge,
    expectedOrigin: env.ADMIN_ORIGIN,
    expectedRPID: env.RP_ID,
    requireUserVerification: true,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new Response("Passkey verification failed", { status: 401 });
  }

  const credential = webauthnCredential(verification.registrationInfo);
  const created = now();

  try {
    await env.ADMIN_DB.batch([
      env.ADMIN_DB.prepare(
        "INSERT INTO admins(id, display_name, created_at) VALUES(?, ?, ?)",
      ).bind(challenge.admin_id, "BuildNumbers Owner", created),
      env.ADMIN_DB.prepare(
        "INSERT INTO passkeys(credential_id, admin_id, label, public_key_b64, counter, transports_json, device_type, backed_up, created_at) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ).bind(
        credential.id,
        challenge.admin_id,
        "Primary passkey",
        base64url(credential.publicKey),
        credential.counter,
        JSON.stringify(credential.transports),
        (verification.registrationInfo as any).credentialDeviceType ?? null,
        (verification.registrationInfo as any).credentialBackedUp ? 1 : 0,
        created,
      ),
    ]);
  } catch {
    throw new Response("Bootstrap closed", { status: 409 });
  }

  await appendAudit(env, challenge.admin_id, "admin.bootstrap", "owner", {
    credentialId: credential.id,
  });
  return loginSuccess(env, challenge.admin_id);
}

async function loginOptions(
  request: Request,
  env: AdminEnv,
): Promise<Response> {
  await enforceRateLimit(request, env, "login", 10, 15 * 60);
  if (!(await adminCount(env))) {
    return json({ bootstrapRequired: true }, 409);
  }

  const options = await generateAuthenticationOptions({
    rpID: env.RP_ID,
    userVerification: "required",
  });
  const ticket = await storeChallenge(env, "login", options.challenge, null);
  return json({ ticket, options });
}

async function getPasskey(
  env: AdminEnv,
  credentialId: string,
): Promise<PasskeyRow> {
  const row = await env.ADMIN_DB.prepare(
    "SELECT credential_id, admin_id, public_key_b64, counter, transports_json FROM passkeys WHERE credential_id = ?",
  )
    .bind(credentialId)
    .first<PasskeyRow>();

  if (!row) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return row;
}

async function verifyPasskeyResponse(
  env: AdminEnv,
  response: any,
  challenge: ChallengeRow,
): Promise<PasskeyRow> {
  if (!response || typeof response.id !== "string") {
    throw new Response("Bad request", { status: 400 });
  }

  const passkey = await getPasskey(env, response.id);
  if (challenge.admin_id && challenge.admin_id !== passkey.admin_id) {
    throw new Response("Unauthorized", { status: 401 });
  }

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

  if (!verification.verified) {
    throw new Response("Passkey verification failed", { status: 401 });
  }

  await env.ADMIN_DB.prepare(
    "UPDATE passkeys SET counter = ?, last_used_at = ? WHERE credential_id = ?",
  )
    .bind(
      verification.authenticationInfo.newCounter,
      now(),
      passkey.credential_id,
    )
    .run();
  return passkey;
}

async function loginVerify(
  request: Request,
  env: AdminEnv,
): Promise<Response> {
  await enforceRateLimit(request, env, "login", 10, 15 * 60);
  const body = await parseJson(request);
  if (typeof body.ticket !== "string") {
    throw new Response("Bad request", { status: 400 });
  }

  const challenge = await takeChallenge(env, body.ticket, "login");
  const passkey = await verifyPasskeyResponse(env, body.response, challenge);
  await appendAudit(env, passkey.admin_id, "auth.login", "session", {
    credentialId: passkey.credential_id,
  });
  return loginSuccess(env, passkey.admin_id);
}

async function loginSuccess(
  env: AdminEnv,
  adminId: string,
): Promise<Response> {
  const session = await createSession(env, adminId);
  const headers = new Headers();
  headers.append("Set-Cookie", sessionCookie(session.token, session.maxAge));
  headers.append("Set-Cookie", csrfCookie(session.csrf, session.maxAge));
  return json(
    { ok: true, adminId, csrf: session.csrf },
    200,
    headers,
  );
}

async function stepupOptions(
  request: Request,
  env: AdminEnv,
): Promise<Response> {
  const principal = await requireSession(request, env);
  await enforceRateLimit(request, env, "stepup", 12, 15 * 60);

  const rows = await env.ADMIN_DB.prepare(
    "SELECT credential_id, transports_json FROM passkeys WHERE admin_id = ?",
  )
    .bind(principal.adminId)
    .all<{ credential_id: string; transports_json: string }>();

  const options = await generateAuthenticationOptions({
    rpID: env.RP_ID,
    userVerification: "required",
    allowCredentials: (rows.results ?? []).map((row) => ({
      id: row.credential_id,
      transports: JSON.parse(row.transports_json),
    })),
  });

  const ticket = await storeChallenge(
    env,
    "stepup",
    options.challenge,
    principal.adminId,
  );
  return json({ ticket, options });
}

async function stepupVerify(
  request: Request,
  env: AdminEnv,
): Promise<Response> {
  const principal = await requireSession(request, env);
  const body = await parseJson(request);
  if (typeof body.ticket !== "string") {
    throw new Response("Bad request", { status: 400 });
  }

  const challenge = await takeChallenge(env, body.ticket, "stepup");
  const passkey = await verifyPasskeyResponse(env, body.response, challenge);
  if (passkey.admin_id !== principal.adminId) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const token = parseCookies(request).get("__Host-bn_admin_session");
  if (!token) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const tokenHash = await hmac(env.SESSION_PEPPER, token);
  const until = now() + STEP_UP_TTL;
  await env.ADMIN_DB.prepare(
    "UPDATE sessions SET step_up_until = ? WHERE token_hash = ?",
  )
    .bind(until, tokenHash)
    .run();
  await appendAudit(env, principal.adminId, "auth.stepup", "session", {
    until,
  });
  return json({ ok: true, stepUpUntil: until });
}

async function listPasskeys(
  request: Request,
  env: AdminEnv,
): Promise<Response> {
  const principal = await requireSession(request, env);
  const result = await env.ADMIN_DB.prepare(
    "SELECT credential_id, label, device_type, backed_up, created_at, last_used_at FROM passkeys WHERE admin_id = ? ORDER BY created_at ASC",
  )
    .bind(principal.adminId)
    .all<{
      credential_id: string;
      label: string;
      device_type: string | null;
      backed_up: number;
      created_at: number;
      last_used_at: number | null;
    }>();

  return json({
    passkeys: (result.results ?? []).map((row) => ({
      id: row.credential_id,
      label: row.label,
      deviceType: row.device_type,
      backedUp: Boolean(row.backed_up),
      createdAt: row.created_at,
      lastUsedAt: row.last_used_at,
    })),
  });
}

async function registerPasskeyOptions(
  request: Request,
  env: AdminEnv,
): Promise<Response> {
  const principal = await requireSession(request, env, true);
  const existing = await env.ADMIN_DB.prepare(
    "SELECT credential_id, transports_json FROM passkeys WHERE admin_id = ?",
  )
    .bind(principal.adminId)
    .all<{ credential_id: string; transports_json: string }>();

  const options = await generateRegistrationOptions({
    rpName: "BuildNumbers Admin",
    rpID: env.RP_ID,
    userID: fromBase64url(principal.adminId),
    userName: "owner",
    userDisplayName: "BuildNumbers Owner",
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "required",
      requireResidentKey: true,
      userVerification: "required",
    },
    excludeCredentials: (existing.results ?? []).map((row) => ({
      id: row.credential_id,
      transports: JSON.parse(row.transports_json),
    })),
    supportedAlgorithmIDs: [-7, -257],
  });

  const ticket = await storeChallenge(
    env,
    "register",
    options.challenge,
    principal.adminId,
  );
  return json({ ticket, options });
}

async function registerPasskeyVerify(
  request: Request,
  env: AdminEnv,
): Promise<Response> {
  const principal = await requireSession(request, env, true);
  const body = await parseJson(request);
  if (typeof body.ticket !== "string" || !body.response) {
    throw new Response("Bad request", { status: 400 });
  }

  const label = passkeyLabel(body.label);
  const challenge = await takeChallenge(env, body.ticket, "register");
  if (challenge.admin_id !== principal.adminId) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const verification = await verifyRegistrationResponse({
    response: body.response as any,
    expectedChallenge: challenge.challenge,
    expectedOrigin: env.ADMIN_ORIGIN,
    expectedRPID: env.RP_ID,
    requireUserVerification: true,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new Response("Passkey verification failed", { status: 401 });
  }

  const credential = webauthnCredential(verification.registrationInfo);
  const created = now();
  try {
    await env.ADMIN_DB.prepare(
      "INSERT INTO passkeys(credential_id, admin_id, label, public_key_b64, counter, transports_json, device_type, backed_up, created_at) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(
        credential.id,
        principal.adminId,
        label,
        base64url(credential.publicKey),
        credential.counter,
        JSON.stringify(credential.transports),
        (verification.registrationInfo as any).credentialDeviceType ?? null,
        (verification.registrationInfo as any).credentialBackedUp ? 1 : 0,
        created,
      )
      .run();
  } catch {
    throw new Response("Passkey already registered", { status: 409 });
  }

  await appendAudit(env, principal.adminId, "passkey.register", credential.id, {
    label,
  });
  return json({ ok: true, id: credential.id, label });
}

async function deletePasskey(
  request: Request,
  env: AdminEnv,
  credentialId: string,
): Promise<Response> {
  const principal = await requireSession(request, env, true);
  if (!CREDENTIAL_ID.test(credentialId)) {
    throw new Response("Invalid credential", { status: 400 });
  }

  const result = await env.ADMIN_DB.prepare(
    `DELETE FROM passkeys
     WHERE credential_id = ?
       AND admin_id = ?
       AND (SELECT COUNT(*) FROM passkeys WHERE admin_id = ?) > 1`,
  )
    .bind(credentialId, principal.adminId, principal.adminId)
    .run();

  if ((result.meta.changes ?? 0) !== 1) {
    throw new Response("Cannot remove the last passkey", { status: 409 });
  }

  await appendAudit(env, principal.adminId, "passkey.delete", credentialId, {});
  return json({ ok: true });
}

async function sessionInfo(
  request: Request,
  env: AdminEnv,
): Promise<Response> {
  const principal = await requireSession(request, env);
  return json({
    authenticated: true,
    adminId: principal.adminId,
    csrf: principal.csrf,
    stepUpUntil: principal.stepUpUntil,
  });
}

async function listRecords(
  request: Request,
  env: AdminEnv,
): Promise<Response> {
  await requireSession(request, env);
  const kind = new URL(request.url).searchParams.get("kind");
  let query =
    "SELECT record_key, kind, title, data_json, revision, state, updated_at FROM content_records WHERE state != 'retired'";
  const values: unknown[] = [];

  if (kind) {
    if (!ALLOWED_KINDS.has(kind)) {
      throw new Response("Bad kind", { status: 400 });
    }
    query += " AND kind = ?";
    values.push(kind);
  }

  query += " ORDER BY kind, record_key";
  const result = await env.ADMIN_DB.prepare(query)
    .bind(...values)
    .all<RecordRow>();

  return json({
    records: (result.results ?? []).map((row) => ({
      ...row,
      data: JSON.parse(row.data_json),
      data_json: undefined,
    })),
  });
}

async function saveRecord(
  request: Request,
  env: AdminEnv,
  key: string,
): Promise<Response> {
  const principal = await requireSession(request, env, true);
  if (!RECORD_KEY.test(key)) {
    throw new Response("Invalid record key", { status: 400 });
  }

  const body = await parseJson(request);
  const kind = typeof body.kind === "string" ? body.kind : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (
    !ALLOWED_KINDS.has(kind) ||
    title.length < 1 ||
    title.length > 200 ||
    body.data === undefined
  ) {
    throw new Response("Invalid record", { status: 400 });
  }

  const dataJson = JSON.stringify(body.data);
  if (new TextEncoder().encode(dataJson).byteLength > MAX_JSON_BYTES) {
    throw new Response("Record too large", { status: 413 });
  }

  const timestamp = now();
  const existing = await env.ADMIN_DB.prepare(
    "SELECT revision FROM content_records WHERE record_key = ?",
  )
    .bind(key)
    .first<{ revision: number }>();
  const revision = (existing?.revision ?? 0) + 1;

  await env.ADMIN_DB.prepare(
    `INSERT INTO content_records(record_key, kind, title, data_json, revision, state, updated_by, updated_at, created_at)
     VALUES(?, ?, ?, ?, ?, 'draft', ?, ?, ?)
     ON CONFLICT(record_key) DO UPDATE SET kind=excluded.kind, title=excluded.title, data_json=excluded.data_json, revision=excluded.revision, state='draft', updated_by=excluded.updated_by, updated_at=excluded.updated_at`,
  )
    .bind(
      key,
      kind,
      title,
      dataJson,
      revision,
      principal.adminId,
      timestamp,
      timestamp,
    )
    .run();

  await appendAudit(env, principal.adminId, "record.save", key, {
    kind,
    revision,
    sha256: await sha256(dataJson),
  });
  return json({ ok: true, key, revision });
}

async function retireRecord(
  request: Request,
  env: AdminEnv,
  key: string,
): Promise<Response> {
  const principal = await requireSession(request, env, true);
  await env.ADMIN_DB.prepare(
    "UPDATE content_records SET state='retired', updated_by=?, updated_at=?, revision=revision+1 WHERE record_key=?",
  )
    .bind(principal.adminId, now(), key)
    .run();
  await appendAudit(env, principal.adminId, "record.retire", key, {});
  return json({ ok: true });
}

async function listReleaseRequests(
  request: Request,
  env: AdminEnv,
): Promise<Response> {
  await requireSession(request, env);
  const result = await env.ADMIN_DB.prepare(
    "SELECT id, label, record_keys_json, snapshot_sha256, state, created_at, approved_at, integrated_at FROM release_requests ORDER BY created_at DESC LIMIT 100",
  ).all();
  return json({ releases: result.results ?? [] });
}

async function createReleaseRequest(
  request: Request,
  env: AdminEnv,
): Promise<Response> {
  const principal = await requireSession(request, env, true);
  const body = await parseJson(request);
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const keys = Array.isArray(body.keys)
    ? [
        ...new Set(
          body.keys.filter(
            (value): value is string =>
              typeof value === "string" && RECORD_KEY.test(value),
          ),
        ),
      ].sort()
    : [];

  if (!label || label.length > 160 || !keys.length || keys.length > 200) {
    throw new Response("Invalid release request", { status: 400 });
  }

  const placeholders = keys.map(() => "?").join(",");
  const records = await env.ADMIN_DB.prepare(
    `SELECT record_key, kind, title, data_json, revision FROM content_records WHERE state != 'retired' AND record_key IN (${placeholders}) ORDER BY record_key`,
  )
    .bind(...keys)
    .all<RecordRow>();

  if ((records.results ?? []).length !== keys.length) {
    throw new Response("One or more records are missing", { status: 409 });
  }

  const snapshot = JSON.stringify(
    (records.results ?? []).map((row) => ({
      key: row.record_key,
      kind: row.kind,
      title: row.title,
      data: JSON.parse(row.data_json),
      revision: row.revision,
    })),
  );
  const id = randomId(18);
  const digest = await sha256(snapshot);

  await env.ADMIN_DB.prepare(
    "INSERT INTO release_requests(id, label, record_keys_json, snapshot_json, snapshot_sha256, created_by, created_at) VALUES(?, ?, ?, ?, ?, ?, ?)",
  )
    .bind(
      id,
      label,
      JSON.stringify(keys),
      snapshot,
      digest,
      principal.adminId,
      now(),
    )
    .run();
  await appendAudit(env, principal.adminId, "release.create", id, {
    label,
    keys,
    snapshotSha256: digest,
  });
  return json({ ok: true, id, snapshotSha256: digest });
}

async function approveRelease(
  request: Request,
  env: AdminEnv,
  id: string,
): Promise<Response> {
  const principal = await requireSession(request, env, true);
  const result = await env.ADMIN_DB.prepare(
    "UPDATE release_requests SET state='approved', approved_at=? WHERE id=? AND state='pending'",
  )
    .bind(now(), id)
    .run();

  if (!result.meta.changes) {
    throw new Response("Release request is not pending", { status: 409 });
  }
  await appendAudit(env, principal.adminId, "release.approve", id, {});
  return json({ ok: true });
}

async function listAudit(
  request: Request,
  env: AdminEnv,
): Promise<Response> {
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
    await env.ADMIN_DB.prepare(
      "UPDATE sessions SET revoked_at = ? WHERE token_hash = ?",
    )
      .bind(now(), tokenHash)
      .run();
  }

  await appendAudit(env, principal.adminId, "auth.logout", "session", {});
  const headers = new Headers();
  headers.append("Set-Cookie", clearSessionCookie());
  headers.append("Set-Cookie", clearCsrfCookie());
  return json({ ok: true }, 200, headers);
}

function safeError(response: Response): Response {
  const headers = secureHeaders(
    response.headers.get("content-type") ?? "text/plain; charset=utf-8",
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function route(request: Request, env: AdminEnv): Promise<Response> {
  assertAdminOrigin(request, env);
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === "GET" && path === "/") {
    return html(DASHBOARD_HTML);
  }
  if (request.method === "GET" && path === "/health") {
    return text("ok\n");
  }
  if (request.method === "GET" && path === "/assets/admin.css") {
    return text(ADMIN_CSS, 200, "text/css; charset=utf-8");
  }
  if (request.method === "GET" && path === "/assets/admin.js") {
    return text(ADMIN_JS, 200, "text/javascript; charset=utf-8");
  }

  if (request.method === "POST" && path === "/api/bootstrap/options") {
    return bootstrapOptions(request, env);
  }
  if (request.method === "POST" && path === "/api/bootstrap/verify") {
    return bootstrapVerify(request, env);
  }
  if (request.method === "POST" && path === "/api/auth/options") {
    return loginOptions(request, env);
  }
  if (request.method === "POST" && path === "/api/auth/verify") {
    return loginVerify(request, env);
  }
  if (request.method === "GET" && path === "/api/session") {
    return sessionInfo(request, env);
  }
  if (request.method === "POST" && path === "/api/auth/stepup/options") {
    return stepupOptions(request, env);
  }
  if (request.method === "POST" && path === "/api/auth/stepup/verify") {
    return stepupVerify(request, env);
  }
  if (request.method === "POST" && path === "/api/logout") {
    return logout(request, env);
  }

  if (request.method === "GET" && path === "/api/passkeys") {
    return listPasskeys(request, env);
  }
  if (request.method === "POST" && path === "/api/passkeys/register/options") {
    return registerPasskeyOptions(request, env);
  }
  if (request.method === "POST" && path === "/api/passkeys/register/verify") {
    return registerPasskeyVerify(request, env);
  }
  if (request.method === "DELETE" && path.startsWith("/api/passkeys/")) {
    const credentialId = decodeURIComponent(path.slice("/api/passkeys/".length));
    return deletePasskey(request, env, credentialId);
  }

  if (request.method === "GET" && path === "/api/records") {
    return listRecords(request, env);
  }
  if (path.startsWith("/api/records/")) {
    const key = decodeURIComponent(path.slice("/api/records/".length));
    if (request.method === "PUT") return saveRecord(request, env, key);
    if (request.method === "DELETE") return retireRecord(request, env, key);
  }

  if (request.method === "GET" && path === "/api/release-requests") {
    return listReleaseRequests(request, env);
  }
  if (request.method === "POST" && path === "/api/release-requests") {
    return createReleaseRequest(request, env);
  }
  const approveMatch = path.match(
    /^\/api\/release-requests\/([A-Za-z0-9_-]+)\/approve$/,
  );
  if (request.method === "POST" && approveMatch) {
    return approveRelease(request, env, approveMatch[1]);
  }
  if (request.method === "GET" && path === "/api/audit") {
    return listAudit(request, env);
  }

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
