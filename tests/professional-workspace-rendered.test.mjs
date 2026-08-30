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

test("homepage immediately explains what BuildNumbers is, who it is for, and how it is used", async () => {
  const { response, html } = await render("/", "product-home");

  assert.equal(response.status, 200);
  assert.match(html, /Construction material planning/);
  assert.match(html, /Know what to buy before you build\./);
  assert.match(html, /BuildNumbers is a free estimating workspace for construction and DIY projects\./);
  assert.match(html, /Who uses BuildNumbers\?/);
  assert.match(html, /Homeowners/);
  assert.match(html, /DIY builders/);
  assert.match(html, /Contractors/);
  assert.match(html, /Estimators/);
  assert.match(html, /How it works/);
  assert.match(html, /Measurements in\. A usable project plan out\./);
  assert.match(html, /Choose the job/);
  assert.match(html, /Enter measurements/);
  assert.match(html, /Use the result/);
});

test("homepage presents clear starting paths without rendering the full calculator wall", async () => {
  const { html } = await render("/", "product-starting-paths");

  assert.match(html, /Start with the job, not a wall of tools\./);
  assert.match(html, /Combine multiple concrete shapes into one order\./);
  assert.match(html, /I need one material quantity\./);
  assert.match(html, /I already have estimates to combine\./);
  assert.match(html, /href="\/calculators"/);
  assert.match(html, /href="\/concrete-project-calculator"/);
  assert.match(html, /href="\/projects"/);
  assert.doesNotMatch(html, /Everything, organized in one table\./);
  assert.doesNotMatch(html, /<table class="tool-directory">/);
});

test("homepage explains Project Mode as the workflow beyond individual calculators", async () => {
  const { html } = await render("/", "product-project-mode");

  assert.match(html, /More than calculators/);
  assert.match(html, /Your estimates can become one project record\./);
  assert.match(html, /Saved locally in the current browser/);
  assert.match(html, /Structured shopping quantities/);
  assert.match(html, /Printable project summary/);
  assert.match(html, /Backyard renovation/);
  assert.match(html, /Ready to print/);
});

test("responsive navigation exposes primary destinations without JavaScript", async () => {
  const { response, html } = await render("/", "professional-nav");

  assert.equal(response.status, 200);
  assert.match(html, /class="mobile-nav"/);
  assert.match(html, /Open navigation menu/);
  assert.match(html, /Mobile navigation/);
  assert.match(html, /href="\/calculators"/);
  assert.match(html, /href="\/projects"/);
  assert.match(html, /href="\/guides"/);
  assert.match(html, /href="\/methodology"/);
});

test("professional design layer enforces readable controls and a distinct product homepage", async () => {
  const professionalCss = await readFile(new URL("../app/professional.css", import.meta.url), "utf8");
  const homeCss = await readFile(new URL("../app/home-product.css", import.meta.url), "utf8");
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

  assert.match(layout, /import "\.\/professional\.css"/);
  assert.match(layout, /import "\.\/home-product\.css"/);
  assert.match(professionalCss, /body\s*\{[\s\S]*font-size:\s*17px/);
  assert.match(professionalCss, /\.button\s*\{[\s\S]*min-height:\s*54px/);
  assert.match(professionalCss, /\.input-with-unit[\s\S]*min-height:\s*58px/);
  assert.match(homeCss, /\.identity-hero-grid[\s\S]*grid-template-columns:/);
  assert.match(homeCss, /\.audience-rail[\s\S]*grid-template-columns:\s*repeat\(4, 1fr\)/);
  assert.match(homeCss, /\.start-grid[\s\S]*grid-template-columns:\s*1\.12fr \.88fr/);
  assert.match(homeCss, /\.project-showcase-grid[\s\S]*grid-template-columns:\s*\.92fr 1\.08fr/);
  assert.match(homeCss, /@media \(max-width: 700px\)[\s\S]*\.identity-hero-grid[\s\S]*padding-block:/);
});
