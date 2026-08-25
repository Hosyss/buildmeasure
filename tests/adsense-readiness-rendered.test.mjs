import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

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

test("homepage exposes the official AdSense account verification meta tag", async () => {
  const worker = await loadWorker("adsense-meta");
  const response = await worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    env,
    ctx,
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(
    html,
    /<meta name="google-adsense-account" content="ca-pub-3369551572403499"\s*\/?>(?:<\/meta>)?/,
  );
});

test("contact page is public, canonical, and links to the support flows", async () => {
  const worker = await loadWorker("adsense-contact");
  const response = await worker.fetch(
    new Request("http://localhost/contact", { headers: { accept: "text/html" } }),
    env,
    ctx,
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Get in touch with JobsiteQuant/);
  assert.match(html, /calculator feedback form/);
  assert.match(html, /Privacy or data request/);
  assert.match(html, /JobsiteQuant repository/);
  assert.match(html, /rel="canonical" href="https:\/\/jobsitequant\.pages\.dev\/contact"/);
});

test("ads.txt authorizes only the current Google AdSense publisher ID", async () => {
  const adsTxt = await readFile(new URL("../public/ads.txt", import.meta.url), "utf8");
  assert.equal(
    adsTxt,
    "google.com, pub-3369551572403499, DIRECT, f08c47fec0942fa0\n",
  );
});

test("sitemap includes contact and updated privacy pages", async () => {
  const worker = await loadWorker("adsense-sitemap");
  const response = await worker.fetch(
    new Request("http://localhost/sitemap.xml", { headers: { accept: "application/xml" } }),
    env,
    ctx,
  );
  const xml = await response.text();

  assert.equal(response.status, 200);
  assert.match(xml, /https:\/\/jobsitequant\.pages\.dev\/contact/);
  assert.match(xml, /<lastmod>2026-08-22T00:00:00\.000Z<\/lastmod>/);
});
