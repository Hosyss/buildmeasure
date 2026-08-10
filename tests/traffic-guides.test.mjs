import assert from "node:assert/strict";
import test from "node:test";

const guideExpectations = [
  {
    path: "/guides/how-much-paint-do-i-need",
    heading: /How Much Paint Do I Need\?/,
    calculatorHref: /href="\/paint-calculator"/,
  },
  {
    path: "/guides/how-many-tiles-do-i-need",
    heading: /How Many Tiles Do I Need\?/,
    calculatorHref: /href="\/tile-calculator"/,
  },
  {
    path: "/guides/how-much-gravel-do-i-need",
    heading: /How Much Gravel Do I Need\?/,
    calculatorHref: /href="\/gravel-calculator"/,
  },
  {
    path: "/guides/how-much-mulch-do-i-need",
    heading: /How Much Mulch Do I Need\?/,
    calculatorHref: /href="\/mulch-calculator"/,
  },
];

async function loadWorker(label) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set(label, `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

const env = {
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
};

const ctx = { waitUntil() {}, passThroughOnException() {} };

test("renders every traffic-sprint guide with FAQ schema, canonical URL, and calculator CTA", async () => {
  const worker = await loadWorker("traffic-guides");

  for (const expectation of guideExpectations) {
    const response = await worker.fetch(
      new Request(`http://localhost${expectation.path}`, {
        headers: { accept: "text/html" },
      }),
      env,
      ctx,
    );
    const html = await response.text();

    assert.equal(response.status, 200, `${expectation.path} should render`);
    assert.match(html, expectation.heading);
    assert.match(html, expectation.calculatorHref);
    assert.match(html, /application\/ld\+json/);
    assert.match(html, /FAQPage/);
    assert.match(
      html,
      new RegExp(
        `https:\\/\\/buildmeasure\\.hosy-sthdr\\.workers\\.dev${expectation.path.replaceAll("/", "\\/")}`,
      ),
    );
  }
});

test("publishes every traffic-sprint guide in the production sitemap", async () => {
  const worker = await loadWorker("traffic-sitemap");
  const response = await worker.fetch(
    new Request("http://localhost/sitemap.xml", {
      headers: { accept: "application/xml,text/xml" },
    }),
    env,
    ctx,
  );
  const sitemap = await response.text();

  assert.equal(response.status, 200);

  for (const { path } of guideExpectations) {
    assert.match(
      sitemap,
      new RegExp(
        `<loc>https:\\/\\/buildmeasure\\.hosy-sthdr\\.workers\\.dev${path.replaceAll("/", "\\/")}<\\/loc>`,
      ),
    );
  }
});
