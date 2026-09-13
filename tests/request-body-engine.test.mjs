import assert from "node:assert/strict";
import test from "node:test";
import { readBoundedJson } from "../lib/request-body.ts";

function requestWithStream(chunks, headers = {}) {
  const encoder = new TextEncoder();
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: new ReadableStream({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
        controller.close();
      },
    }),
    duplex: "half",
  });
}

test("parses JSON when the actual body stays within the byte limit", async () => {
  const result = await readBoundedJson(
    requestWithStream(['{"ok":', "true}"]),
    64,
  );

  assert.deepEqual(result, { ok: true, value: { ok: true } });
});

test("rejects an oversized streamed body even without Content-Length", async () => {
  const result = await readBoundedJson(
    requestWithStream(['{"data":"', "x".repeat(100), '"}']),
    32,
  );

  assert.deepEqual(result, { ok: false, reason: "too_large" });
});

test("does not trust a smaller declared Content-Length", async () => {
  const result = await readBoundedJson(
    requestWithStream(['{"data":"', "x".repeat(100), '"}'], {
      "content-length": "8",
    }),
    32,
  );

  assert.deepEqual(result, { ok: false, reason: "too_large" });
});

test("rejects immediately when the declared length exceeds the limit", async () => {
  const request = requestWithStream(['{"ok":true}'], { "content-length": "999" });
  const result = await readBoundedJson(request, 32);

  assert.deepEqual(result, { ok: false, reason: "too_large" });
});

test("counts UTF-8 bytes rather than JavaScript characters", async () => {
  const payload = JSON.stringify({ label: "😀😀😀😀" });
  const byteLength = new TextEncoder().encode(payload).byteLength;
  assert.ok(byteLength > payload.length);

  const rejected = await readBoundedJson(requestWithStream([payload]), payload.length);
  assert.deepEqual(rejected, { ok: false, reason: "too_large" });

  const accepted = await readBoundedJson(requestWithStream([payload]), byteLength);
  assert.equal(accepted.ok, true);
});

test("rejects malformed and empty JSON bodies", async () => {
  assert.deepEqual(
    await readBoundedJson(requestWithStream(["{bad"]), 64),
    { ok: false, reason: "invalid_json" },
  );

  const empty = new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "content-type": "application/json" },
  });
  assert.deepEqual(await readBoundedJson(empty, 64), {
    ok: false,
    reason: "invalid_json",
  });
});

test("rejects invalid configured limits", async () => {
  for (const maxBytes of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    await assert.rejects(
      () => readBoundedJson(requestWithStream(['{"ok":true}']), maxBytes),
      TypeError,
    );
  }
});
