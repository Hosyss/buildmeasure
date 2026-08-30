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

test("renders the Circular Slab Calculator with circle geometry, scope, feedback, and canonical metadata", async () => {
  const { response, html } = await render(
    "/circular-slab-calculator",
    "circular-slab-route",
  );

  assert.equal(response.status, 200);
  assert.match(html, /Circular Slab Concrete Calculator/);
  assert.match(html, /Enter the actual circular pour dimensions/);
  assert.match(html, /Circular slab concrete formula/);
  assert.match(html, /Diameter-based circle geometry/);
  assert.match(html, /One 12 ft diameter × 4 in circular slab/);
  assert.match(html, /1\.396 yd³ and 63 × 80 lb bags/);
  assert.match(html, /does not determine structural slab thickness/i);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /href="\/feedback\?calculator=circular-slab-calculator"/);
  assert.match(html, /https:\/\/buildnumbers\.pages\.dev\/circular-slab-calculator/);
});

test("renders the circular slab guide with diameter, radius, package rounding, and scope boundary", async () => {
  const { response, html } = await render(
    "/guides/how-much-concrete-for-circular-slabs",
    "circular-slab-guide",
  );

  assert.equal(response.status, 200);
  assert.match(html, /How much concrete do I need for a circular slab\?/i);
  assert.match(html, /Measure the full diameter through the center/i);
  assert.match(html, /Calculate circular plan area/i);
  assert.match(html, /Combine identical pours before rounding/i);
  assert.match(html, /does not select slab thickness/i);
  assert.match(html, /href="\/circular-slab-calculator"/);
  assert.match(html, /application\/ld\+json/);
  assert.match(
    html,
    /https:\/\/buildnumbers\.pages\.dev\/guides\/how-much-concrete-for-circular-slabs/,
  );
});

test("calculator library, About, guide library, feedback, and Project Mode surface Circular Slab as a first-class product", async () => {
  const library = await render("/calculators", "circular-slab-library-page");
  assert.equal(library.response.status, 200);
  assert.match(library.html, /Circular Slab Concrete Calculator/);
  assert.match(library.html, /href="\/circular-slab-calculator"/);
  assert.match(library.html, /href="\/guides\/how-much-concrete-for-circular-slabs"/);
  assert.match(library.html, /Concrete &amp; foundations/);

  const about = await render("/about", "circular-slab-about");
  assert.equal(about.response.status, 200);
  assert.match(about.html, /currently provides thirteen focused calculators/i);
  assert.match(about.html, /circular slabs and pads/i);

  const guides = await render("/guides", "circular-slab-library");
  assert.equal(guides.response.status, 200);
  assert.match(guides.html, /Thirteen focused guides/);
  assert.match(guides.html, /href="\/guides\/how-much-concrete-for-circular-slabs"/);

  const feedback = await render(
    "/feedback?calculator=circular-slab-calculator",
    "circular-slab-feedback",
  );
  assert.equal(feedback.response.status, 200);
  assert.match(feedback.html, /value="circular-slab-calculator" selected/);
  assert.match(feedback.html, />Circular Slab Concrete Calculator<\/option>/);

  const projects = await render("/projects", "circular-slab-projects");
  assert.equal(projects.response.status, 200);
  assert.match(projects.html, /Works across all thirteen calculators/);
});

test("exposes circular slab routes through sitemap, footer, and llms", async () => {
  const worker = await loadWorker("circular-slab-discovery");
  const sitemapResponse = await worker.fetch(
    new Request("http://localhost/sitemap.xml"),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const sitemap = await sitemapResponse.text();
  assert.equal(sitemapResponse.status, 200);
  assert.match(sitemap, /https:\/\/buildnumbers\.pages\.dev\/circular-slab-calculator/);
  assert.match(sitemap, /https:\/\/buildnumbers\.pages\.dev\/guides\/how-much-concrete-for-circular-slabs/);

  const home = await render("/", "circular-slab-footer");
  assert.match(home.html, /href="\/circular-slab-calculator">Circular slabs<\/a>/);

  const llms = await readFile(new URL("../public/llms.txt", import.meta.url), "utf8");
  assert.match(llms, /Circular Slab Concrete Calculator/);
  assert.match(llms, /how-much-concrete-for-circular-slabs/);
});
