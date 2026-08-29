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
  "/drywall-calculator",
  "/brick-calculator",
  "/gravel-calculator",
  "/mulch-calculator",
];

test("calculator library renders all thirteen tools with search, filters, and matching guides", async () => {
  const { response, html } = await render("/calculators", "calculator-library");

  assert.equal(response.status, 200);
  assert.match(html, /Calculator library/);
  assert.match(html, /Find the right tool without hunting through the site\./);
  assert.match(html, /Search 13 live calculators/);
  assert.match(html, /Search calculators/);
  assert.match(html, /All tools/);
  assert.match(html, /Concrete &amp; foundations/);
  assert.match(html, /Interiors &amp; finishes/);
  assert.match(html, /Masonry &amp; landscape/);
  assert.match(html, /13 of 13 tools/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /https:\/\/buildnumbers\.pages\.dev\/calculators/);

  for (const route of calculatorRoutes) {
    assert.match(html, new RegExp(`href=\\"${route.replaceAll("/", "\\/")}\\"`));
  }
});

test("calculator library source keeps client filtering accessible and SSR-first", async () => {
  const source = await readFile(
    new URL("../app/calculators/calculator-library.tsx", import.meta.url),
    "utf8",
  );
  const styles = await readFile(
    new URL("../app/calculators/calculator-library.module.css", import.meta.url),
    "utf8",
  );

  assert.match(source, /type="search"/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /aria-pressed=\{active\}/);
  assert.match(source, /CALCULATOR_CATALOG\.filter/);
  assert.match(source, /Open calculator/);
  assert.match(source, /Read guide/);
  assert.match(styles, /min-height:\s*58px/);
  assert.match(styles, /@media \(max-width: 620px\)/);
  assert.match(styles, /grid-template-columns:\s*1fr/);
});

test("global navigation, footer, and sitemap expose the scalable calculator library", async () => {
  const home = await render("/", "calculator-library-nav");
  assert.equal(home.response.status, 200);
  assert.match(home.html, /href="\/calculators">Calculators<\/a>/);
  assert.match(home.html, /href="\/calculators">Browse all calculators<\/a>/);

  const calculator = await render("/wall-calculator", "calculator-library-legacy-cta");
  assert.equal(calculator.response.status, 200);
  assert.match(calculator.html, /href="\/calculators">All calculators<\/a>/);
  assert.doesNotMatch(calculator.html, /href="\/#calculators">All calculators<\/a>/);

  const worker = await loadWorker("calculator-library-sitemap");
  const sitemapResponse = await worker.fetch(
    new Request("http://localhost/sitemap.xml"),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const sitemap = await sitemapResponse.text();
  assert.equal(sitemapResponse.status, 200);
  assert.match(sitemap, /https:\/\/buildnumbers\.pages\.dev\/calculators/);
});
