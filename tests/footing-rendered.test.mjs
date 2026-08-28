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

test("renders the Footing Calculator with formula, scope, feedback, and canonical metadata", async () => {
  const { response, html } = await render("/footing-calculator", "footing-route");

  assert.equal(response.status, 200);
  assert.match(html, /Footing Concrete Calculator/);
  assert.match(html, /Enter the formed dimensions/);
  assert.match(html, /Rectangular footing concrete formula/);
  assert.match(html, /Three identical 10 ft × 2 ft × 8 in footings/);
  assert.match(html, /1\.481 yd³ and 67 × 80 lb bags/);
  assert.match(html, /does not choose structural footing depth/i);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /href="\/feedback\?calculator=footing-calculator"/);
  assert.match(html, /https:\/\/buildnumbers\.pages\.dev\/footing-calculator/);
});

test("renders the footing concrete guide with a calculator link and structural scope boundary", async () => {
  const { response, html } = await render(
    "/guides/how-much-concrete-for-footings",
    "footing-guide",
  );

  assert.equal(response.status, 200);
  assert.match(html, /How much concrete do I need for footings\?/i);
  assert.match(html, /Combine identical footings before rounding/);
  assert.match(html, /does not select structural footing geometry/i);
  assert.match(html, /href="\/footing-calculator"/);
  assert.match(html, /application\/ld\+json/);
  assert.match(
    html,
    /https:\/\/buildnumbers\.pages\.dev\/guides\/how-much-concrete-for-footings/,
  );
});

test("homepage and About surface Footing as the ninth live calculator", async () => {
  const home = await render("/", "footing-homepage");

  assert.equal(home.response.status, 200);
  assert.match(home.html, /Footing Concrete Calculator/);
  assert.match(home.html, /href="\/footing-calculator"/);
  assert.match(home.html, /href="\/guides\/how-much-concrete-for-footings"/);
  assert.match(home.html, /Foundations/);

  const about = await render("/about", "footing-about");
  assert.equal(about.response.status, 200);
  assert.match(about.html, /currently provides nine live calculators/i);
  assert.match(about.html, /rectangular concrete footings/i);
});

test("exposes footing routes through guide library, sitemap, footer, and llms", async () => {
  const guideLibrary = await render("/guides", "footing-library");
  assert.equal(guideLibrary.response.status, 200);
  assert.match(guideLibrary.html, /href="\/guides\/how-much-concrete-for-footings"/);
  assert.match(guideLibrary.html, /Nine focused guides/);
  assert.match(guideLibrary.html, /href="\/footing-calculator"/);

  const worker = await loadWorker("footing-discovery");
  const sitemapResponse = await worker.fetch(
    new Request("http://localhost/sitemap.xml"),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const sitemap = await sitemapResponse.text();
  assert.equal(sitemapResponse.status, 200);
  assert.match(sitemap, /https:\/\/buildnumbers\.pages\.dev\/footing-calculator/);
  assert.match(sitemap, /https:\/\/buildnumbers\.pages\.dev\/guides\/how-much-concrete-for-footings/);

  const llms = await readFile(new URL("../public/llms.txt", import.meta.url), "utf8");
  assert.match(llms, /Footing Concrete Calculator/);
  assert.match(llms, /how-much-concrete-for-footings/);
});
