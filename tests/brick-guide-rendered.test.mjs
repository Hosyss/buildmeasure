import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const GUIDE_PATH = "/guides/how-many-bricks-do-i-need";
const GUIDE_URL = `https://buildmeasure.buildtools.workers.dev${GUIDE_PATH}`;

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

test("renders the Brick wall guide with canonical reference-backed content", async () => {
  const worker = await loadWorker("brick-guide-rendered");
  const { response, html } = await render(worker, GUIDE_PATH);

  assert.equal(response.status, 200);
  assert.match(html, /How many bricks do I need for a wall\?/i);
  assert.match(html, /675 Modular bricks per 100 ft²/);
  assert.match(html, /972 net bricks/);
  assert.match(html, /1,021 bricks/);
  assert.match(html, /fired-clay brick/i);
  assert.match(html, /running or stack bond/i);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /"@type":"Article"/);
  assert.match(html, /"@type":"BreadcrumbList"/);
  assert.match(html, /"@type":"FAQPage"/);
  assert.doesNotMatch(html, /"@type":"HowTo"/);
  assert.match(html, new RegExp(GUIDE_URL.replaceAll("/", "\\/")));
  assert.match(html, /gobrick\.com\/media\/file\/10-dimensioning-and-estimating-brick-masonry\.pdf/);
  assert.match(html, /nist\.gov\/pml\/special-publication-811/);
});

test("discovers the Brick wall guide from the calculator, homepage, sitemap, and llms.txt", async () => {
  const worker = await loadWorker("brick-guide-discovery");

  const calculator = await render(worker, "/brick-calculator");
  assert.equal(calculator.response.status, 200);
  assert.match(calculator.html, /href="\/guides\/how-many-bricks-do-i-need"/);
  assert.match(calculator.html, /How Many Bricks Do I Need\?/);

  const home = await render(worker, "/");
  assert.equal(home.response.status, 200);
  assert.match(home.html, /href="\/guides\/how-many-bricks-do-i-need"/);
  assert.match(home.html, /Brick guide/);

  const sitemapResponse = await worker.fetch(
    new Request("http://localhost/sitemap.xml"),
    env,
    ctx,
  );
  const sitemap = await sitemapResponse.text();
  assert.equal(sitemapResponse.status, 200);
  assert.match(
    sitemap,
    /<loc>https:\/\/buildmeasure\.buildtools\.workers\.dev\/guides\/how-many-bricks-do-i-need<\/loc>/,
  );

  const llmsSource = await readFile(new URL("../public/llms.txt", import.meta.url), "utf8");
  assert.match(
    llmsSource,
    /\[How Many Bricks Do I Need for a Wall\?\]\(https:\/\/buildmeasure\.buildtools\.workers\.dev\/guides\/how-many-bricks-do-i-need\)/,
  );
});
