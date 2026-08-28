import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function loadWorker(label) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set(label, `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

async function render(path, label) {
  const worker = await loadWorker(label);
  const response = await worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  return { response, html: await response.text() };
}

test("renders Multi-Shape Concrete Project as a complete calculator workspace", async () => {
  const { response, html } = await render(
    "/concrete-project-calculator",
    "concrete-project-route",
  );

  assert.equal(response.status, 200);
  assert.match(html, /Multi-Shape Concrete Project Calculator/);
  assert.match(html, /Combine multiple concrete geometries into one auditable order/i);
  assert.match(html, /Seven verified geometry types/);
  assert.match(html, /Mixed Metric &amp; Imperial parts/);
  assert.match(html, /One final project rounding/);
  assert.match(html, /Aggregate physical volume before procurement rounding/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /https:\/\/buildnumbers\.pages\.dev\/concrete-project-calculator/);
});

test("client workspace preserves dynamic part controls, cost, save, and feedback integration", async () => {
  const source = await readFile(
    new URL("../app/concrete-project-calculator/concrete-project-calculator.tsx", import.meta.url),
    "utf8",
  );
  const editor = await readFile(
    new URL("../app/concrete-project-calculator/project-part-editor.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /\+ Add concrete part/);
  assert.match(source, /movePart/);
  assert.match(source, /removePart/);
  assert.match(source, /CalculatorCostFields/);
  assert.match(source, /createSavedEstimatePurchase/);
  assert.match(source, /concrete-project-calculator/);
  assert.match(editor, /Move up/);
  assert.match(editor, /Move down/);
  assert.match(editor, /convertDraftPartUnits/);
  assert.match(editor, /Post displacement/);
});

test("Project Mode accepts saved Multi-Shape Concrete Project estimates as source thirteen", async () => {
  const { response, html } = await render("/projects", "concrete-project-projects");
  assert.equal(response.status, 200);
  assert.match(html, /Works across all thirteen calculators/);

  const projectSource = await readFile(
    new URL("../lib/projects.ts", import.meta.url),
    "utf8",
  );
  assert.match(projectSource, /id: "concrete-project"/);
  assert.match(projectSource, /href: "\/concrete-project-calculator"/);
  assert.match(projectSource, /buildmeasure\.concrete-project\.history\.v1/);
});
