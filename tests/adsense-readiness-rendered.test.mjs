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
  assert.match(html, /href="\/editorial-policy"/);
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
  assert.match(html, /Get in touch with BuildNumbers/);
  assert.match(html, /calculator feedback form/);
  assert.match(html, /Privacy or data request/);
  assert.match(html, /BuildNumbers repository/);
  assert.match(html, /rel="canonical" href="https:\/\/buildnumbers\.pages\.dev\/contact"/);
});

test("editorial policy is public, canonical, and documents source and correction standards", async () => {
  const worker = await loadWorker("adsense-editorial-policy");
  const response = await worker.fetch(
    new Request("http://localhost/editorial-policy", { headers: { accept: "text/html" } }),
    env,
    ctx,
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Editorial, source and corrections policy/);
  assert.match(html, /Source hierarchy/);
  assert.match(html, /Facts, defaults and assumptions stay separate/);
  assert.match(html, /Corrections policy/);
  assert.match(html, /Advertising does not set the answer/);
  assert.match(
    html,
    /rel="canonical" href="https:\/\/buildnumbers\.pages\.dev\/editorial-policy"/,
  );
});

test("about page exposes ownership, methodology, and editorial accountability", async () => {
  const worker = await loadWorker("adsense-about-trust");
  const response = await worker.fetch(
    new Request("http://localhost/about", { headers: { accept: "text/html" } }),
    env,
    ctx,
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Who maintains BuildNumbers/);
  assert.match(html, /How content and sources are reviewed/);
  assert.match(html, /href="\/methodology"/);
  assert.match(html, /href="\/editorial-policy"/);
});

test("ads.txt authorizes only the current Google AdSense publisher ID", async () => {
  const adsTxt = await readFile(new URL("../public/ads.txt", import.meta.url), "utf8");
  assert.equal(
    adsTxt,
    "google.com, pub-3369551572403499, DIRECT, f08c47fec0942fa0\n",
  );
});

test("sitemap includes contact, privacy, and editorial policy pages", async () => {
  const worker = await loadWorker("adsense-sitemap");
  const response = await worker.fetch(
    new Request("http://localhost/sitemap.xml", { headers: { accept: "application/xml" } }),
    env,
    ctx,
  );
  const xml = await response.text();

  assert.equal(response.status, 200);
  assert.match(xml, /https:\/\/buildnumbers\.pages\.dev\/contact/);
  assert.match(xml, /https:\/\/buildnumbers\.pages\.dev\/privacy/);
  assert.match(xml, /https:\/\/buildnumbers\.pages\.dev\/editorial-policy/);
  assert.match(xml, /<lastmod>2026-08-29T00:00:00\.000Z<\/lastmod>/);
});
