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

async function render(worker, path) {
  const response = await worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    env,
    ctx,
  );
  return { response, html: await response.text() };
}

function assertHeaderCta(html, label, href) {
  assert.match(html, new RegExp(`href="${href.replaceAll("/", "\\/")}"[^>]*>${label}<\\/a>`));
}

test("homepage keeps calculator discovery and the example workflow actionable", async () => {
  const worker = await loadWorker("ux-home");
  const { response, html } = await render(worker, "/");
  assert.equal(response.status, 200);
  assertHeaderCta(html, "Browse calculators", "/calculators");
  assert.match(html, /class="hero-story"/);
  assert.match(html, /aria-label="Example BuildNumbers workflow"/);
  assert.match(html, /<h2>Patio slab estimate<\/h2>/);
  assert.match(html, /href="\/concrete-calculator" aria-label="Open the Concrete Calculator"/);
  assert.match(html, /Open example/);
  assert.match(html, /href="\/calculators"[^>]*>Start an estimate/);
  assert.doesNotMatch(html, /href="\/#calculators"/);
});

test("calculator headers return to the calculator library instead of a homepage anchor", async () => {
  const worker = await loadWorker("ux-calculator-headers");
  const routes = [
    "/concrete-calculator",
    "/post-hole-concrete-calculator",
    "/paint-calculator",
    "/tile-calculator",
    "/brick-calculator",
    "/gravel-calculator",
    "/mulch-calculator",
  ];
  for (const route of routes) {
    const { response, html } = await render(worker, route);
    assert.equal(response.status, 200, route);
    assertHeaderCta(html, "All calculators", "/calculators");
    assert.doesNotMatch(html, /href="\/#calculators"/);
  }
});

test("focused guide headers point to their related calculator", async () => {
  const worker = await loadWorker("ux-guide-headers");
  const routes = [
    ["/guides/how-many-bags-of-concrete", "Open Concrete Calculator", "/concrete-calculator"],
    ["/guides/how-many-bags-of-concrete-for-post-holes", "Open Post Hole Calculator", "/post-hole-concrete-calculator"],
    ["/guides/how-much-paint-do-i-need", "Open Paint Calculator", "/paint-calculator"],
    ["/guides/how-many-tiles-do-i-need", "Open Tile Calculator", "/tile-calculator"],
    ["/guides/how-many-bricks-do-i-need", "Open Brick Calculator", "/brick-calculator"],
    ["/guides/how-much-gravel-do-i-need", "Open Gravel Calculator", "/gravel-calculator"],
    ["/guides/how-much-mulch-do-i-need", "Open Mulch Calculator", "/mulch-calculator"],
  ];
  for (const [route, label, href] of routes) {
    const { response, html } = await render(worker, route);
    assert.equal(response.status, 200, route);
    assertHeaderCta(html, label, href);
    assert.match(html, /class="utility-page-hero guide-hero"/);
  }
});
