import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import packageInfo from "../package.json" with { type: "json" };

const codexPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])[^>]*>/i;
const authorMeta =
  /<meta(?=[^>]*\bname=["']author["'])(?=[^>]*\bcontent=["']Hosyss["'])[^>]*>/i;

test("redirects legacy production hosts to the canonical Pages origin", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("legacy-redirect", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  for (const hostname of [
    "buildmeasure.hosys.chatgpt.site",
    "buildmeasure.buildtools.workers.dev",
    "buildmeasuretools.pages.dev",
  ]) {
    const response = await worker.fetch(
      new Request(
        `https://${hostname}/concrete-calculator?system=metric`,
      ),
      {},
      {
        waitUntil() {},
        passThroughOnException() {},
      },
    );

    assert.equal(response.status, 301);
    assert.equal(
      response.headers.get("location"),
      "https://buildnumbers.pages.dev/concrete-calculator?system=metric",
    );
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  }
});

test("renders production metadata and security headers", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "SAMEORIGIN");
  assert.equal(
    response.headers.get("referrer-policy"),
    "strict-origin-when-cross-origin",
  );
  const contentSecurityPolicy =
    response.headers.get("content-security-policy") ?? "";
  assert.match(contentSecurityPolicy, /default-src 'self'/);
  assert.match(contentSecurityPolicy, /frame-ancestors 'self'/);
  assert.match(contentSecurityPolicy, /script-src 'self' 'sha256-/);
  assert.doesNotMatch(
    contentSecurityPolicy,
    /script-src[^;]*(?:'unsafe-inline'|\bdata:)/,
  );

  const html = await response.text();
  assert.doesNotMatch(html, codexPreviewMeta);
  assert.match(html, authorMeta);

  const inlineScripts = [
    ...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi),
  ].filter((match) => !/\bsrc\s*=/i.test(match[1] ?? "") && (match[2] ?? "").length > 0);
  assert.ok(inlineScripts.length > 0, "expected inline application bootstrap scripts");
  for (const match of inlineScripts) {
    const digest = createHash("sha256")
      .update(match[2] ?? "")
      .digest("base64");
    assert.ok(
      contentSecurityPolicy.includes(`'sha256-${digest}'`),
      "expected every inline script to have a matching CSP hash",
    );
  }
});

test("reports a degraded health state when feedback storage is unavailable", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("health", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/api/health"),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const payload = await response.json();

  assert.equal(response.status, 503);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(payload.status, "degraded");
  assert.equal(payload.version, packageInfo.version);
  assert.equal(payload.checks.feedbackStorage, "unavailable");
  assert.equal(payload.checks.analyticsStorage, "unavailable");
});

test("rejects invalid feedback before touching storage", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("feedback-api", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ details: "short" }),
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(typeof payload.error, "string");
});

test("rejects invalid analytics before touching storage", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("analytics-api", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "unknown_event" }),
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(typeof payload.error, "string");
});

test("renders the product homepage", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("home", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Material estimates you can build on\./);
  assert.match(html, /Concrete Calculator/);
  assert.match(html, /href="\/post-hole-concrete-calculator"/);
  assert.match(html, /href="\/paint-calculator"/);
  assert.match(html, /href="\/tile-calculator"/);
  assert.match(html, /href="\/gravel-calculator"/);
  assert.match(html, /href="\/mulch-calculator"/);
  assert.match(html, /Accuracy is a feature\./);
  assert.match(html, /https:\/\/github\.com\/Hosyss\/buildmeasure/);
  assert.doesNotMatch(html, /href="\/#project-mode"/);
  assert.doesNotMatch(html, /Coming later/);
  assert.match(html, /0\.1\.1/);

  const modulePreloads = html.match(/<link[^>]*\brel=["']modulepreload["'][^>]*>/gi) ?? [];
  assert.ok(modulePreloads.length > 0, "expected the app shell to preload client modules");
  for (const preload of modulePreloads) {
    assert.match(preload, /\bfetchpriority=["']low["']/i);
  }
  assert.doesNotMatch(html, /<link[^>]*\bas=["']font["'][^>]*>/i);
});

test("renders the concrete calculator route and structured content", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("calculator", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/concrete-calculator", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Concrete Calculator/);
  assert.match(html, /Enter your measurements/);
  assert.match(html, /Formula version/);
  assert.match(html, /A slab that equals exactly one cubic yard/);
  assert.match(html, /1 yd³ and 45 × 80 lb bags/);
  assert.match(html, /0\.1\.1/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /href="\/feedback\?calculator=concrete-calculator"/);
  assert.match(
    html,
    /https:\/\/buildnumbers\.pages\.dev\/concrete-calculator/,
  );
});

test("renders the post-hole concrete calculator route and structured content", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("post-hole", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/post-hole-concrete-calculator", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Post Hole Concrete Calculator/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /href="\/feedback\?calculator=post-hole-concrete-calculator"/);
  assert.match(
    html,
    /https:\/\/buildnumbers\.pages\.dev\/post-hole-concrete-calculator/,
  );
});

test("renders the paint calculator route and structured content", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("paint", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/paint-calculator", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Paint Calculator/);
  assert.match(html, /Describe the surfaces/);
  assert.match(html, /Adjustable coverage/);
  assert.match(html, /Room paint formula/);
  assert.match(html, /A 1,000-square-foot wall estimate/);
  assert.match(html, /2\.5 gal; buy 3 one-gallon cans/);
  assert.match(html, /0\.1\.1/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /href="\/feedback\?calculator=paint-calculator"/);
  assert.match(
    html,
    /https:\/\/buildnumbers\.pages\.dev\/paint-calculator/,
  );
});

test("renders the tile calculator route and structured content", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("tile", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/tile-calculator", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Tile Calculator/);
  assert.match(html, /Define the tile project/);
  assert.match(html, /Full-box rounding/);
  assert.match(html, /Tile order formula/);
  assert.match(html, /A 12 ft × 10 ft tile order/);
  assert.match(html, /132 required; buy 14 boxes \/ 140 tiles/);
  assert.match(html, /0\.1\.1/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /href="\/feedback\?calculator=tile-calculator"/);
  assert.match(
    html,
    /https:\/\/buildnumbers\.pages\.dev\/tile-calculator/,
  );
});

test("renders the gravel calculator route and structured content", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("gravel", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/gravel-calculator", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Gravel Calculator/);
  assert.match(html, /Enter the gravel layer/);
  assert.match(html, /Adjustable bulk density/);
  assert.match(html, /Gravel volume and weight formula/);
  assert.match(html, /A 10 ft × 10 ft gravel layer/);
  assert.match(html, /1\.358 yd³; 3,410 lb; 69 × 50 lb bags/);
  assert.match(html, /0\.1\.0/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /href="\/feedback\?calculator=gravel-calculator"/);
  assert.match(
    html,
    /https:\/\/buildnumbers\.pages\.dev\/gravel-calculator/,
  );
});

test("renders the mulch calculator route and structured content", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("mulch", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/mulch-calculator", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Mulch Calculator/);
  assert.match(html, /Enter the mulch bed/);
  assert.match(html, /Exact package volume/);
  assert.match(html, /Mulch volume and bag formula/);
  assert.match(html, /A 20 ft × 10 ft mulch bed/);
  assert.match(html, /2\.037 yd³; 8 ft² per bag; 28 bags/);
  assert.match(html, /0\.1\.0/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /href="\/feedback\?calculator=mulch-calculator"/);
  assert.match(
    html,
    /https:\/\/buildnumbers\.pages\.dev\/mulch-calculator/,
  );
});

test("renders the calculator feedback form without indexing the report page", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("feedback", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/feedback?calculator=mulch-calculator", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Report a calculator issue/);
  assert.match(html, /Every confirmed calculation defect gets a regression test/);
  assert.match(html, /name="details"/);
  assert.match(html, /name="calculator"/);
  assert.match(html, /value="mulch-calculator" selected/);
  assert.match(html, /name="robots" content="noindex, follow"/);
});

test("renders the launch trust and estimating content", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("launch-content", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const env = {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  };
  const ctx = { waitUntil() {}, passThroughOnException() {} };
  const expectations = [
    ["/about", /Clear calculations for better-built projects\./],
    ["/methodology", /How every calculator earns trust\./],
    ["/privacy", /Anonymous product analytics/],
    ["/terms", /Verify before purchase or construction/],
    ["/guides/material-estimating-basics", /How to estimate construction materials/],
    ["/guides/how-many-bags-of-concrete", /How much concrete do I need for a slab/],
    ["/guides/how-much-paint-do-i-need", /How much paint do I need for a room/],
    ["/guides/how-many-tiles-do-i-need", /How many tiles do I need/],
    ["/guides/how-much-gravel-do-i-need", /How much gravel do I need/],
    ["/guides/how-much-mulch-do-i-need", /How much mulch do I need/],
  ];

  for (const [path, pattern] of expectations) {
    const response = await worker.fetch(
      new Request(`http://localhost${path}`, {
        headers: { accept: "text/html" },
      }),
      env,
      ctx,
    );
    const html = await response.text();
    assert.equal(response.status, 200, `expected ${path} to render`);
    assert.match(html, pattern);
    assert.match(html, new RegExp(`https://buildnumbers\\.pages\\.dev${path.replaceAll("/", "\\/")}`));

    if (path === "/about") {
      assert.match(html, /independently developed calculator project/);
      assert.match(html, /eight live calculators/);
      assert.match(html, /browser(?:&apos;|')s local storage/);
      assert.match(html, /https:\/\/github\.com\/Hosyss\/buildmeasure/);
      assert.match(html, /Hosyss/);
    }
  }
});

test("serves absolute production URLs in robots and sitemap", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("seo", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const env = {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  };
  const ctx = { waitUntil() {}, passThroughOnException() {} };

  const robotsResponse = await worker.fetch(
    new Request("http://localhost/robots.txt"),
    env,
    ctx,
  );
  const sitemapResponse = await worker.fetch(
    new Request("http://localhost/sitemap.xml"),
    env,
    ctx,
  );
  const robots = await robotsResponse.text();
  const sitemap = await sitemapResponse.text();

  assert.equal(robotsResponse.status, 200);
  assert.equal(sitemapResponse.status, 200);
  assert.match(
    robots,
    /Sitemap: https:\/\/buildnumbers\.pages\.dev\/sitemap\.xml/,
  );
  assert.match(robots, /Disallow: \/api\//);
  assert.match(robots, /Disallow: \/feedback\/inbox/);
  assert.match(
    sitemap,
    /<loc>https:\/\/buildnumbers\.pages\.dev\/<\/loc>/,
  );
  assert.match(
    sitemap,
    /<loc>https:\/\/buildnumbers\.pages\.dev\/concrete-calculator<\/loc>/,
  );
  assert.match(
    sitemap,
    /<loc>https:\/\/buildnumbers\.pages\.dev\/post-hole-concrete-calculator<\/loc>/,
  );
  assert.match(
    sitemap,
    /<loc>https:\/\/buildnumbers\.pages\.dev\/paint-calculator<\/loc>/,
  );
  assert.match(
    sitemap,
    /<loc>https:\/\/buildnumbers\.pages\.dev\/tile-calculator<\/loc>/,
  );
  assert.match(
    sitemap,
    /<loc>https:\/\/buildnumbers\.pages\.dev\/gravel-calculator<\/loc>/,
  );
  assert.match(
    sitemap,
    /<loc>https:\/\/buildnumbers\.pages\.dev\/mulch-calculator<\/loc>/,
  );
  assert.match(
    sitemap,
    /<loc>https:\/\/buildnumbers\.pages\.dev\/guides\/material-estimating-basics<\/loc>/,
  );
  assert.match(
    sitemap,
    /<loc>https:\/\/buildnumbers\.pages\.dev\/guides\/how-many-bags-of-concrete<\/loc>/,
  );
  assert.match(
    sitemap,
    /<loc>https:\/\/buildnumbers\.pages\.dev\/guides\/how-much-paint-do-i-need<\/loc>/,
  );
  assert.match(
    sitemap,
    /<loc>https:\/\/buildnumbers\.pages\.dev\/guides\/how-many-tiles-do-i-need<\/loc>/,
  );
  assert.match(
    sitemap,
    /<loc>https:\/\/buildnumbers\.pages\.dev\/guides\/how-much-gravel-do-i-need<\/loc>/,
  );
  assert.match(
    sitemap,
    /<loc>https:\/\/buildnumbers\.pages\.dev\/guides\/how-much-mulch-do-i-need<\/loc>/,
  );
  assert.match(
    sitemap,
    /<loc>https:\/\/buildnumbers\.pages\.dev\/methodology<\/loc>/,
  );
});

test("serves a concise machine-readable site guide", async () => {
  const llmsSource = await readFile(
    new URL("../public/llms.txt", import.meta.url),
    "utf8",
  );
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("llms", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/llms.txt"),
    {
      ASSETS: {
        fetch: async (request) => {
          const url = new URL(request.url);
          if (url.pathname === "/llms.txt") {
            return new Response(
              "# BuildNumbers\n\nCanonical site: https://buildnumbers.pages.dev/\n",
              { headers: { "content-type": "text/plain; charset=utf-8" } },
            );
          }
          return new Response("Not found", { status: 404 });
        },
      },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/plain/);
  assert.match(body, /# BuildNumbers/);
  assert.match(body, /https:\/\/buildnumbers\.pages\.dev\//);
  assert.match(llmsSource, /guides\/how-much-paint-do-i-need/);
  assert.match(llmsSource, /guides\/how-many-tiles-do-i-need/);
  assert.match(llmsSource, /guides\/how-much-gravel-do-i-need/);
  assert.match(llmsSource, /guides\/how-much-mulch-do-i-need/);
});

test("ships a valid IndexNow verification key and bounded submitter", async () => {
  const key = (
    await readFile(
      new URL(
        "../public/bb6fa46f3784f7f264c8d9ed4a9cc44c.txt",
        import.meta.url,
      ),
      "utf8",
    )
  ).trim();
  const submitter = await readFile(
    new URL("../scripts/submit-indexnow.mjs", import.meta.url),
    "utf8",
  );

  assert.match(key, /^[a-f0-9]{32}$/);
  assert.match(submitter, /https:\/\/api\.indexnow\.org\/indexnow/);
  assert.match(submitter, /sitemap\.xml/);
  assert.match(submitter, /Refusing to submit an off-site URL/);
  assert.match(submitter, /--dry-run/);
});

test("renders optional package cost fields on every live calculator", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("cost-fields", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const env = {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  };
  const ctx = { waitUntil() {}, passThroughOnException() {} };
  const expectations = [
    ["/concrete-calculator", /Optional price per 80 lb bag/],
    ["/post-hole-concrete-calculator", /Optional price per 80 lb bag/],
    ["/paint-calculator", /Optional price per 1 gal container/],
    ["/tile-calculator", /Optional price per box/],
    ["/gravel-calculator", /Optional price per 50 lb bag/],
    ["/mulch-calculator", /Optional price per 2 ft³ bag/],
  ];

  for (const [path, pattern] of expectations) {
    const response = await worker.fetch(
      new Request(`http://localhost${path}`, {
        headers: { accept: "text/html" },
      }),
      env,
      ctx,
    );
    const html = await response.text();
    assert.equal(response.status, 200, `expected ${path} to render`);
    assert.match(html, pattern);
    assert.match(html, /No live prices are fetched/);
    assert.match(html, /BuildNumbers does not convert currencies or exchange rates/);
  }
});

test("every internal page link resolves in the built application", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("links", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const env = {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  };
  const ctx = { waitUntil() {}, passThroughOnException() {} };
  const routes = [
    "/",
    "/concrete-calculator",
    "/post-hole-concrete-calculator",
    "/paint-calculator",
    "/tile-calculator",
    "/gravel-calculator",
    "/mulch-calculator",
  ];
  const internalPaths = new Set(routes);

  for (const route of routes) {
    const response = await worker.fetch(
      new Request(`http://localhost${route}`, {
        headers: { accept: "text/html" },
      }),
      env,
      ctx,
    );
    const html = await response.text();
    const linkPattern = /<a\b[^>]*\bhref="([^"]+)"/gi;

    for (const match of html.matchAll(linkPattern)) {
      const url = new URL(match[1], "http://localhost");
      if (url.origin === "http://localhost") {
        internalPaths.add(url.pathname);
      }
    }
  }

  for (const path of internalPaths) {
    const response = await worker.fetch(
      new Request(`http://localhost${path}`, {
        headers: { accept: "text/html" },
      }),
      env,
      ctx,
    );
    assert.equal(response.status, 200, `expected ${path} to resolve`);
  }
});
