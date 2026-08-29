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

test("Project Mode renders as a local-only, masked, non-indexed workspace", async () => {
  const worker = await loadWorker("project-mode");
  const response = await worker.fetch(
    new Request("http://localhost/projects", { headers: { accept: "text/html" } }),
    env,
    ctx,
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Project Mode/);
  assert.match(html, /Group estimates into one project/);
  assert.match(html, /Works across all thirteen calculators/);
  assert.match(html, /Projects are saved in this browser/);
  assert.match(html, /Print one project/);
  assert.match(html, /save it as a PDF/);
  assert.match(html, /Shopping lists and cost summaries use structured purchase data/);
  assert.match(html, /never parsed to invent quantities or prices/);
  assert.match(html, /Currency labels remain separate exactly as saved/);
  assert.match(html, /data-projects-page="true"/);
  assert.match(html, /href="\/projects"/);
  assert.match(html, /data-clarity-mask="true"/);
  assert.match(html, /name="robots"/);
  assert.match(html, /noindex/);
});
