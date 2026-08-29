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
  const result = await readFile(
    new URL("../app/concrete-project-calculator/project-result.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /\+ Add concrete part/);
  assert.match(source, /movePart/);
  assert.match(source, /removePart/);
  assert.match(source, /CalculatorCostFields/);
  assert.match(source, /createSavedEstimatePurchase/);
  assert.match(editor, /Move up/);
  assert.match(editor, /Move down/);
  assert.match(editor, /convertDraftPartUnits/);
  assert.match(editor, /Post displacement/);
  assert.match(result, /CalculatorActions/);
  assert.match(result, /calculator="concrete-project-calculator"/);
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

test("Multi-Shape is discoverable from the professional workspace, guide library, footer, sitemap, and llms", async () => {
  const home = await render("/", "concrete-project-home");
  assert.equal(home.response.status, 200);
  assert.match(home.html, /Thirteen focused tools/);
  assert.match(home.html, /Multi-Shape Concrete Project Calculator/);
  assert.match(home.html, /href="\/concrete-project-calculator"/);
  assert.match(home.html, /href="\/guides\/how-to-estimate-multi-shape-concrete-project"/);
  assert.match(home.html, /href="\/concrete-project-calculator">Multi-shape concrete<\/a>/);

  const guides = await render("/guides", "concrete-project-guides");
  assert.equal(guides.response.status, 200);
  assert.match(guides.html, /Thirteen focused guides/);
  assert.match(guides.html, /How do I estimate a multi-shape concrete project\?/i);
  assert.match(guides.html, /href="\/guides\/how-to-estimate-multi-shape-concrete-project"/);

  const guide = await render(
    "/guides/how-to-estimate-multi-shape-concrete-project",
    "concrete-project-guide",
  );
  assert.equal(guide.response.status, 200);
  assert.match(guide.html, /Combine volume first\. Round packages last\./);
  assert.match(guide.html, /does not choose slab thickness/i);
  assert.match(guide.html, /href="\/concrete-project-calculator"/);
  assert.match(guide.html, /application\/ld\+json/);
  assert.match(guide.html, /https:\/\/buildnumbers\.pages\.dev\/guides\/how-to-estimate-multi-shape-concrete-project/);

  const about = await render("/about", "concrete-project-about");
  assert.equal(about.response.status, 200);
  assert.match(about.html, /currently provides thirteen live calculators/i);
  assert.match(about.html, /Multi-Shape Concrete Project Calculator/);

  const worker = await loadWorker("concrete-project-sitemap");
  const sitemapResponse = await worker.fetch(
    new Request("http://localhost/sitemap.xml"),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const sitemap = await sitemapResponse.text();
  assert.equal(sitemapResponse.status, 200);
  assert.match(sitemap, /https:\/\/buildnumbers\.pages\.dev\/concrete-project-calculator/);
  assert.match(sitemap, /https:\/\/buildnumbers\.pages\.dev\/guides\/how-to-estimate-multi-shape-concrete-project/);

  const llms = await readFile(new URL("../public/llms.txt", import.meta.url), "utf8");
  assert.match(llms, /Multi-Shape Concrete Project Calculator/);
  assert.match(llms, /how-to-estimate-multi-shape-concrete-project/);
});
