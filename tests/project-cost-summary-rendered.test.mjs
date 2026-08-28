import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function loadWorker(label) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set(label, `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

test("Project Mode documents structured cost roll-ups without currency inference", async () => {
  const worker = await loadWorker("project-cost-summary");
  const response = await worker.fetch(
    new Request("http://localhost/projects", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Shopping lists and cost summaries use structured purchase data/i);
  assert.match(html, /never parsed to invent quantities or prices/i);
  assert.match(html, /Currency labels remain separate exactly as saved/i);
  assert.match(html, /never converted/i);
});

test("saved project cards and printable reports share the structured cost summary block", async () => {
  const source = await readFile(
    new URL("../components/project-mode.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /function ProjectCostSummaryBlock/);
  assert.match(source, /buildProjectCostSummary\(project\)/);
  assert.match(source, /formatProjectCostGroup\(group\)/);
  assert.match(source, /<ProjectCostSummaryBlock project=\{project\} \/>/);
  assert.match(
    source,
    /<ProjectCostSummaryBlock project=\{printingProject\} printable \/>/,
  );
  assert.match(source, /does not\s+infer exchange rates/i);
});
