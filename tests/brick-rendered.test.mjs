import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const BRICK_PATH = "/brick-calculator";
const BRICK_URL = `https://buildmeasuretools.pages.dev${BRICK_PATH}`;

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
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    env,
    ctx,
  );
  return { response, html: await response.text() };
}

test("renders the Brick Calculator with reference-backed scope and structured content", async () => {
  const worker = await loadWorker("brick-rendered");
  const { response, html } = await render(worker, BRICK_PATH);

  assert.equal(response.status, 200);
  assert.match(html, /Brick Calculator/);
  assert.match(html, /Define the brick wall/);
  assert.match(html, /BIA coverage presets/);
  assert.match(html, /fired-clay brick/i);
  assert.match(html, /running or stack bond/i);
  assert.match(html, /20 ft × 8 ft wall with a 16 ft² opening/);
  assert.match(html, /Order 1,021 bricks/);
  assert.match(html, /Optional price per brick/);
  assert.match(html, /No live prices are fetched/);
  assert.match(html, /BuildMeasure does not convert currencies or exchange rates/);
  assert.match(html, /id="brick-rate-output"/);
  assert.match(html, />675<\/strong>/);
  assert.match(html, /bricks \/ 100 ft²/);
  assert.match(html, /Custom \/ supplier rate/);
  assert.doesNotMatch(html, /readonly/);
  assert.match(html, /href="\/feedback\?calculator=brick-calculator"/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /"@type":"WebApplication"/);
  assert.match(html, /"@type":"BreadcrumbList"/);
  assert.match(html, /"@type":"FAQPage"/);
  assert.doesNotMatch(html, /"@type":"HowTo"/);
  assert.match(html, new RegExp(BRICK_URL.replaceAll("/", "\\/")));
  assert.match(html, /gobrick\.com\/media\/file\/10-dimensioning-and-estimating-brick-masonry\.pdf/);
  assert.match(html, /nist\.gov\/pml\/special-publication-811/);
});

test("discovers Brick Calculator from public product surfaces", async () => {
  const worker = await loadWorker("brick-discovery");

  const home = await render(worker, "/");
  assert.equal(home.response.status, 200);
  assert.match(home.html, /href="\/brick-calculator"/);
  assert.match(home.html, /Masonry/);

  const about = await render(worker, "/about");
  assert.equal(about.response.status, 200);
  assert.match(about.html, /eight live calculators/i);
  assert.match(about.html, /fired-clay brick walls/i);

  const sitemapResponse = await worker.fetch(
    new Request("http://localhost/sitemap.xml"),
    env,
    ctx,
  );
  const sitemap = await sitemapResponse.text();
  assert.equal(sitemapResponse.status, 200);
  assert.match(
    sitemap,
    /<loc>https:\/\/buildmeasuretools\.pages\.dev\/brick-calculator<\/loc>/,
  );

  const llmsSource = await readFile(
    new URL("../public/llms.txt", import.meta.url),
    "utf8",
  );
  assert.match(llmsSource, /\[Brick Calculator\]\(https:\/\/buildmeasuretools\.pages\.dev\/brick-calculator\)/);
  assert.match(llmsSource, /fired-clay brick quantity/);
});

test("registers Brick Calculator in the feedback form", async () => {
  const worker = await loadWorker("brick-feedback");
  const { response, html } = await render(
    worker,
    "/feedback?calculator=brick-calculator",
  );

  assert.equal(response.status, 200);
  assert.match(html, /Report a calculator issue/);
  assert.match(html, /value="brick-calculator" selected/);
  assert.match(html, />Brick Calculator<\/option>/);
  assert.match(html, /name="robots" content="noindex, follow"/);
});
