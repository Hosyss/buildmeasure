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

test("renders the Concrete Wall Calculator with openings, scope, feedback, and canonical metadata", async () => {
  const { response, html } = await render("/wall-calculator", "wall-route");

  assert.equal(response.status, 200);
  assert.match(html, /Concrete Wall Calculator/);
  assert.match(html, /Enter the actual concrete wall dimensions/);
  assert.match(html, /Measured opening subtraction/);
  assert.match(html, /Concrete wall volume formula/);
  assert.match(html, /10 ft × 8 ft × 6 in wall with 16 ft² of openings/);
  assert.match(html, /1\.304 yd³ and 59 × 80 lb bags/);
  assert.match(html, /does not choose structural wall thickness/i);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /href="\/feedback\?calculator=wall-calculator"/);
  assert.match(html, /https:\/\/buildnumbers\.pages\.dev\/wall-calculator/);
});

test("renders the concrete wall guide with opening subtraction and structural scope", async () => {
  const { response, html } = await render(
    "/guides/how-much-concrete-for-walls",
    "wall-guide",
  );

  assert.equal(response.status, 200);
  assert.match(html, /How much concrete do I need for a wall\?/i);
  assert.match(html, /Subtract measured full-depth openings/i);
  assert.match(html, /Combine identical walls before rounding/i);
  assert.match(html, /does not size structural or retaining walls/i);
  assert.match(html, /href="\/wall-calculator"/);
  assert.match(html, /application\/ld\+json/);
  assert.match(
    html,
    /https:\/\/buildnumbers\.pages\.dev\/guides\/how-much-concrete-for-walls/,
  );
});

test("feedback and Project Mode keep Wall first-class after Circular Slab expands the library", async () => {
  const feedback = await render(
    "/feedback?calculator=wall-calculator",
    "wall-feedback",
  );
  assert.equal(feedback.response.status, 200);
  assert.match(feedback.html, /value="wall-calculator" selected/);
  assert.match(feedback.html, />Concrete Wall Calculator<\/option>/);

  const projects = await render("/projects", "wall-projects");
  assert.equal(projects.response.status, 200);
  assert.match(projects.html, /Works across all thirteen calculators/);
});

test("wall static source remains discoverable after the public integration commit", async () => {
  const llms = await readFile(new URL("../public/llms.txt", import.meta.url), "utf8");
  assert.match(llms, /BuildNumbers/);
  assert.match(llms, /Concrete Wall Calculator/);
  assert.match(llms, /how-much-concrete-for-walls/);
});
