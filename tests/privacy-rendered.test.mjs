import assert from "node:assert/strict";
import test from "node:test";

async function loadWorker(label) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set(label, `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

const env = {
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
};
const ctx = { waitUntil() {}, passThroughOnException() {} };

test("privacy page documents local projects and bounded analytics without raw project values", async () => {
  const worker = await loadWorker("privacy-analytics-projects");
  const response = await worker.fetch(
    new Request("http://localhost/privacy", { headers: { accept: "text/html" } }),
    env,
    ctx,
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Last updated August 21, 2026/);
  assert.match(html, /Saved estimates and projects on this device/);
  assert.match(html, /Project Mode can copy selected saved/);
  assert.match(html, /not synchronized to an account or sent to BuildMeasure/);
  assert.match(html, /explicitly masks the Project Mode workspace/);
  assert.match(html, /clicking into a calculator from the homepage or a guide/);
  assert.match(html, /cost-feature events record only that the feature was used/);
  assert.match(html, /Measurements, quantities, entered unit prices, currency labels, and/);
  assert.match(html, /Clarity is not loaded before that choice/);
});
