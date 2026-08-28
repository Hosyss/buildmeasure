import assert from "node:assert/strict";
import test from "node:test";

async function loadWorker(label) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set(label, `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

test("Project Mode renders a local structured cost roll-up surface", async () => {
  const worker = await loadWorker("project-cost-summary");
  const response = await worker.fetch(
    new Request("http://localhost/projects", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Project cost roll-up/);
  assert.match(html, /structured prices saved with calculator estimates/i);
  assert.match(html, /does not convert currencies or infer exchange rates/i);
  assert.match(html, /No FX/);
  assert.match(html, /Save an estimate with an optional package price/i);
});
