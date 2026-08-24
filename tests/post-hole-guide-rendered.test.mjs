import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const GUIDE_PATH = "/guides/how-many-bags-of-concrete-for-post-holes";
const GUIDE_URL = `https://buildmeasuretools.pages.dev${GUIDE_PATH}`;

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

test("renders the post-hole concrete bag guide with canonical structured content", async () => {
  const worker = await loadWorker("post-hole-guide");
  const response = await worker.fetch(
    new Request(`http://localhost${GUIDE_PATH}`, {
      headers: { accept: "text/html" },
    }),
    env,
    ctx,
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /How many bags of concrete do I need for post holes\?/i);
  assert.match(html, /1\.570796 ft³/);
  assert.match(html, /3 complete bags/);
  assert.match(html, /not a recommended hole size/i);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /"@type":"Article"/);
  assert.match(html, /"@type":"BreadcrumbList"/);
  assert.match(html, /"@type":"FAQPage"/);
  assert.doesNotMatch(html, /"@type":"HowTo"/);
  assert.match(html, new RegExp(GUIDE_URL.replaceAll("/", "\\/")));
  assert.match(html, /href="\/post-hole-concrete-calculator"/);
});

test("discovers the post-hole guide from public entry points", async () => {
  const worker = await loadWorker("post-hole-guide-links");

  for (const path of ["/", "/post-hole-concrete-calculator"]) {
    const response = await worker.fetch(
      new Request(`http://localhost${path}`, {
        headers: { accept: "text/html" },
      }),
      env,
      ctx,
    );
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(html, new RegExp(`href="${GUIDE_PATH.replaceAll("/", "\\/")}"`));
  }

  const sitemapResponse = await worker.fetch(
    new Request("http://localhost/sitemap.xml"),
    env,
    ctx,
  );
  const sitemap = await sitemapResponse.text();
  assert.equal(sitemapResponse.status, 200);
  assert.match(sitemap, new RegExp(`<loc>${GUIDE_URL.replaceAll("/", "\\/")}<\\/loc>`));

  const llmsSource = await readFile(
    new URL("../public/llms.txt", import.meta.url),
    "utf8",
  );
  assert.match(llmsSource, /guides\/how-many-bags-of-concrete-for-post-holes/);
});
