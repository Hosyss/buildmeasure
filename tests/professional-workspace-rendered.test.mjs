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

test("homepage is organized as a workspace instead of a flat calculator card wall", async () => {
  const { response, html } = await render("/", "professional-home");

  assert.equal(response.status, 200);
  assert.match(html, /Construction estimating workspace/);
  assert.match(html, /Choose by job/);
  assert.match(html, /Three work areas\. Thirteen focused tools\./);
  assert.match(html, /13<\/strong><span>live calculators/);
  assert.match(html, /Calculator directory/);
  assert.match(html, /Everything, organized in one table\./);
  assert.match(html, /Professional workflow/);
  assert.match(html, /Project Mode/);
  assert.match(html, /Example estimate/);
  assert.match(html, /aria-label="Open Concrete Calculator from this example estimate"/);
});

test("homepage directory preserves all thirteen calculator and guide entry points", async () => {
  const { html } = await render("/", "professional-directory");

  const calculatorRoutes = [
    "/concrete-project-calculator",
    "/concrete-calculator",
    "/circular-slab-calculator",
    "/footing-calculator",
    "/column-calculator",
    "/wall-calculator",
    "/post-hole-concrete-calculator",
    "/paint-calculator",
    "/tile-calculator",
    "/brick-calculator",
    "/gravel-calculator",
    "/mulch-calculator",
    "/drywall-calculator",
  ];

  const guideRoutes = [
    "/guides/how-to-estimate-multi-shape-concrete-project",
    "/guides/how-many-bags-of-concrete",
    "/guides/how-much-concrete-for-circular-slabs",
    "/guides/how-much-concrete-for-footings",
    "/guides/how-much-concrete-for-columns",
    "/guides/how-much-concrete-for-walls",
    "/guides/how-many-bags-of-concrete-for-post-holes",
    "/guides/how-much-paint-do-i-need",
    "/guides/how-many-tiles-do-i-need",
    "/guides/how-many-bricks-do-i-need",
    "/guides/how-much-gravel-do-i-need",
    "/guides/how-much-mulch-do-i-need",
    "/guides/how-many-drywall-sheets-do-i-need",
  ];

  for (const route of [...calculatorRoutes, ...guideRoutes]) {
    assert.match(html, new RegExp(`href=\\"${route.replaceAll("/", "\\/")}\\"`));
  }

  assert.match(html, /Multi-Shape Concrete Project Calculator/);
  assert.match(html, /7 tools/);
});

test("responsive navigation exposes primary destinations without JavaScript", async () => {
  const { response, html } = await render("/", "professional-nav");

  assert.equal(response.status, 200);
  assert.match(html, /class="mobile-nav"/);
  assert.match(html, /Open navigation menu/);
  assert.match(html, /Mobile navigation/);
  assert.match(html, /href="\/projects"/);
  assert.match(html, /href="\/guides"/);
  assert.match(html, /href="\/methodology"/);
});

test("professional design layer enforces readable controls and independent mobile workspace", async () => {
  const css = await readFile(new URL("../app/professional.css", import.meta.url), "utf8");
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

  assert.match(layout, /import "\.\/professional\.css"/);
  assert.match(css, /body\s*\{[\s\S]*font-size:\s*17px/);
  assert.match(css, /\.button\s*\{[\s\S]*min-height:\s*54px/);
  assert.match(css, /\.input-with-unit[\s\S]*min-height:\s*58px/);
  assert.match(css, /@media \(max-width: 700px\)[\s\S]*\.input-grid,[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /\.tool-directory tbody tr[\s\S]*border-radius:\s*15px/);
});
