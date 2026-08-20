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

test("privacy page documents funnel and cost analytics without raw project values", async () => {
  const worker = await loadWorker("privacy-analytics");
  const response = await worker.fetch(
    new Request("http://localhost/privacy", { headers: { accept: "text/html" } }),
    env,
    ctx,
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Last updated August 20, 2026/);
  assert.match(html, /clicking into a calculator from the homepage or a guide/);
  assert.match(html, /cost-feature events record only that the feature was used/);
  assert.match(html, /Measurements, quantities, entered unit prices, currency labels, and/);
  assert.match(html, /Clarity is not loaded before that choice/);
});
