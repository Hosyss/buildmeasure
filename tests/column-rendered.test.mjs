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

test("renders the Column Calculator with both geometries, scope, feedback, and canonical metadata", async () => {
  const { response, html } = await render("/column-calculator", "column-route");

  assert.equal(response.status, 200);
  assert.match(html, /Column Concrete Calculator/);
  assert.match(html, /Enter the actual column dimensions/);
  assert.match(html, /Column concrete formulas/);
  assert.match(html, /Rectangular/);
  assert.match(html, /Circular/);
  assert.match(html, /Three 12 in × 12 in × 10 ft columns/);
  assert.match(html, /1\.222 yd³ and 55 × 80 lb bags/);
  assert.match(html, /does not choose structural column dimensions/i);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /href="\/feedback\?calculator=column-calculator"/);
  assert.match(html, /https:\/\/buildnumbers\.pages\.dev\/column-calculator/);
});

test("renders the column guide with rectangular and circular formulas and structural scope", async () => {
  const { response, html } = await render(
    "/guides/how-much-concrete-for-columns",
    "column-guide",
  );

  assert.equal(response.status, 200);
  assert.match(html, /How much concrete do I need for columns\?/i);
  assert.match(html, /rectangular or square column/i);
  assert.match(html, /circular column/i);
  assert.match(html, /Combine identical columns before rounding/i);
  assert.match(html, /does not size structural columns/i);
  assert.match(html, /href="\/column-calculator"/);
  assert.match(html, /application\/ld\+json/);
  assert.match(
    html,
    /https:\/\/buildnumbers\.pages\.dev\/guides\/how-much-concrete-for-columns/,
  );
});

test("homepage, About, guide library, and feedback keep Column first-class after Wall expands the library", async () => {
  const home = await render("/", "column-homepage");
  assert.equal(home.response.status, 200);
  assert.match(home.html, /Column Concrete Calculator/);
  assert.match(home.html, /href="\/column-calculator"/);
  assert.match(home.html, /href="\/guides\/how-much-concrete-for-columns"/);
  assert.match(home.html, /Structural concrete/);

  const about = await render("/about", "column-about");
  assert.equal(about.response.status, 200);
  assert.match(about.html, /currently provides eleven live calculators/i);
  assert.match(about.html, /ten live calculators/i);
  assert.match(about.html, /circular concrete columns/i);

  const guides = await render("/guides", "column-library");
  assert.equal(guides.response.status, 200);
  assert.match(guides.html, /Eleven focused guides/);
  assert.match(guides.html, /href="\/guides\/how-much-concrete-for-columns"/);

  const feedback = await render(
    "/feedback?calculator=column-calculator",
    "column-feedback",
  );
  assert.equal(feedback.response.status, 200);
  assert.match(feedback.html, /value="column-calculator" selected/);
  assert.match(feedback.html, />Column Concrete Calculator<\/option>/);
});

test("exposes column routes through sitemap, footer, and llms", async () => {
  const worker = await loadWorker("column-discovery");
  const sitemapResponse = await worker.fetch(
    new Request("http://localhost/sitemap.xml"),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const sitemap = await sitemapResponse.text();
  assert.equal(sitemapResponse.status, 200);
  assert.match(sitemap, /https:\/\/buildnumbers\.pages\.dev\/column-calculator/);
  assert.match(sitemap, /https:\/\/buildnumbers\.pages\.dev\/guides\/how-much-concrete-for-columns/);

  const home = await render("/", "column-footer");
  assert.match(home.html, /href="\/column-calculator">Columns<\/a>/);

  const llms = await readFile(new URL("../public/llms.txt", import.meta.url), "utf8");
  assert.match(llms, /Column Concrete Calculator/);
  assert.match(llms, /how-much-concrete-for-columns/);
});
