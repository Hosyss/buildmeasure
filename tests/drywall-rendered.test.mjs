import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
const ctx = { waitUntil() {}, passThroughOnException() {} };

async function loadWorker(label) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set(label, `${process.pid}-${Date.now()}`);
  return (await import(workerUrl.href)).default;
}

async function render(worker, path) {
  const response = await worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), env, ctx);
  return { response, html: await response.text() };
}

test("renders the Drywall Calculator as a complete reference-backed product", async () => {
  const worker = await loadWorker("drywall-calculator");
  const { response, html } = await render(worker, "/drywall-calculator");
  assert.equal(response.status, 200);
  assert.match(html, /Drywall Calculator/);
  assert.match(html, /Enter the room and panel/);
  assert.match(html, /Complete sheets to order/);
  assert.match(html, /Drywall sheet formula/);
  assert.match(html, /18 complete 4 × 8 ft sheets/);
  assert.match(html, /USG Sheetrock wallboard estimator/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /"@type":"WebApplication"/);
  assert.match(html, /"@type":"FAQPage"/);
  assert.match(html, /href="\/feedback\?calculator=drywall-calculator"/);
  assert.match(html, /https:\/\/buildmeasure\.buildtools\.workers\.dev\/drywall-calculator/);
});

test("renders and discovers the drywall guide and guide library", async () => {
  const worker = await loadWorker("drywall-guide");
  const guide = await render(worker, "/guides/how-many-drywall-sheets-do-i-need");
  assert.equal(guide.response.status, 200);
  assert.match(guide.html, /How many drywall sheets do I need\?/i);
  assert.match(guide.html, /Six decisions before you order/);
  assert.match(guide.html, /504 ft²/);
  assert.match(guide.html, /18 sheets/);
  assert.match(guide.html, /"@type":"Article"/);
  assert.doesNotMatch(guide.html, /"@type":"HowTo"/);

  const library = await render(worker, "/guides");
  assert.equal(library.response.status, 200);
  assert.match(library.html, /Material estimating guides/);
  assert.match(library.html, /href="\/guides\/how-many-drywall-sheets-do-i-need"/);

  const home = await render(worker, "/");
  assert.equal(home.response.status, 200);
  assert.match(home.html, /href="\/drywall-calculator"/);
  assert.match(home.html, /Drywall Calculator/);

  const sitemap = await worker.fetch(new Request("http://localhost/sitemap.xml"), env, ctx);
  const sitemapXml = await sitemap.text();
  assert.match(sitemapXml, /<loc>https:\/\/buildmeasure\.buildtools\.workers\.dev\/drywall-calculator<\/loc>/);
  assert.match(sitemapXml, /<loc>https:\/\/buildmeasure\.buildtools\.workers\.dev\/guides\/how-many-drywall-sheets-do-i-need<\/loc>/);
  assert.match(sitemapXml, /<loc>https:\/\/buildmeasure\.buildtools\.workers\.dev\/guides<\/loc>/);

  const llms = await readFile(new URL("../public/llms.txt", import.meta.url), "utf8");
  assert.match(llms, /\[Drywall Calculator\]\(https:\/\/buildmeasure\.buildtools\.workers\.dev\/drywall-calculator\)/);
  assert.match(llms, /\[How Many Drywall Sheets Do I Need\?\]\(https:\/\/buildmeasure\.buildtools\.workers\.dev\/guides\/how-many-drywall-sheets-do-i-need\)/);
});

test("registers Drywall in feedback and Project Mode", async () => {
  const worker = await loadWorker("drywall-wiring");
  const feedback = await render(worker, "/feedback?calculator=drywall-calculator");
  assert.equal(feedback.response.status, 200);
  assert.match(feedback.html, /value="drywall-calculator" selected/);
  const projects = await render(worker, "/projects");
  assert.equal(projects.response.status, 200);
  assert.match(projects.html, /Drywall/);
  assert.match(projects.html, /href="\/drywall-calculator"/);
});
