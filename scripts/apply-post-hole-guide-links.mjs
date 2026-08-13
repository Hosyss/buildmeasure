import { readFile, writeFile } from "node:fs/promises";

async function update(path, transform) {
  const source = await readFile(path, "utf8");
  const next = transform(source);
  if (next === source) throw new Error(`No change produced for ${path}`);
  await writeFile(path, next, "utf8");
}

function replaceOnce(source, needle, replacement, path) {
  const first = source.indexOf(needle);
  if (first < 0) throw new Error(`Missing marker in ${path}: ${needle.slice(0, 100)}`);
  if (source.indexOf(needle, first + needle.length) >= 0) {
    throw new Error(`Ambiguous marker in ${path}: ${needle.slice(0, 100)}`);
  }
  return source.slice(0, first) + replacement + source.slice(first + needle.length);
}

await update("app/page.tsx", (source) => replaceOnce(
  source,
  `<a href="/post-hole-concrete-calculator">\n              <span>Post-hole concrete tool</span>\n              <h3>How many bags of concrete for post holes?</h3>\n              <p>Estimate multiple round holes, optional post displacement, extra allowance, and complete bag quantities.</p>\n              <strong>Calculate post-hole bags <ArrowIcon /></strong>\n            </a>`,
  `<a href="/guides/how-many-bags-of-concrete-for-post-holes">\n              <span>Post-hole concrete guide</span>\n              <h3>How many bags of concrete for post holes?</h3>\n              <p>Calculate total volume before rounding bags, compare 40/60/80 lb yields, and avoid treating example dimensions as design advice.</p>\n              <strong>Read the post-hole bag guide <ArrowIcon /></strong>\n            </a>`,
  "app/page.tsx",
));

await update("app/post-hole-concrete-calculator/page.tsx", (source) => replaceOnce(
  source,
  `<a className="next-card next-card-live" href="/guides/how-many-bags-of-concrete">\n            <span>Guide</span><strong>How Much Concrete for a Slab?</strong><small>Yards, bags &amp; examples</small>\n          </a>`,
  `<a className="next-card next-card-live" href="/guides/how-many-bags-of-concrete-for-post-holes">\n            <span>Guide</span><strong>How Many Bags for Post Holes?</strong><small>Total volume, bags &amp; examples</small>\n          </a>`,
  "app/post-hole-concrete-calculator/page.tsx",
));

await update("app/sitemap.ts", (source) => replaceOnce(
  source,
  `    {\n      url: absoluteUrl("/guides/how-many-bags-of-concrete"),\n      lastModified: new Date("2026-08-12"),\n      changeFrequency: "monthly",\n      priority: 0.8,\n    },`,
  `    {\n      url: absoluteUrl("/guides/how-many-bags-of-concrete"),\n      lastModified: new Date("2026-08-12"),\n      changeFrequency: "monthly",\n      priority: 0.8,\n    },\n    {\n      url: absoluteUrl("/guides/how-many-bags-of-concrete-for-post-holes"),\n      lastModified: new Date("2026-08-13"),\n      changeFrequency: "monthly",\n      priority: 0.8,\n    },`,
  "app/sitemap.ts",
));

await update("public/llms.txt", (source) => replaceOnce(
  source,
  `- [How Much Concrete Do I Need for a Slab?](https://buildmeasure.buildtools.workers.dev/guides/how-many-bags-of-concrete)\n`,
  `- [How Much Concrete Do I Need for a Slab?](https://buildmeasure.buildtools.workers.dev/guides/how-many-bags-of-concrete)\n- [How Many Bags of Concrete for Post Holes?](https://buildmeasure.buildtools.workers.dev/guides/how-many-bags-of-concrete-for-post-holes)\n`,
  "public/llms.txt",
));

await update("CHANGELOG.md", (source) => replaceOnce(
  source,
  `### Added\n\n- Added optional user-entered package pricing`,
  `### Added\n\n- Added a query-focused post-hole concrete bag guide with transparent total-volume rounding, worked quantity examples, visible safety boundaries, FAQ/Article structured data, and direct calculator links.\n- Added optional user-entered package pricing`,
  "CHANGELOG.md",
));

await update("tests/rendered-html.test.mjs", (source) => {
  let next = replaceOnce(
    source,
    `    ["/guides/how-many-bags-of-concrete", /How much concrete do I need for a slab/],\n`,
    `    ["/guides/how-many-bags-of-concrete", /How much concrete do I need for a slab/],\n    ["/guides/how-many-bags-of-concrete-for-post-holes", /How many bags of concrete do I need for post holes/],\n`,
    "tests/rendered-html.test.mjs",
  );

  next = replaceOnce(
    next,
    `  assert.match(\n    sitemap,\n    /<loc>https:\\/\\/buildmeasure\\.buildtools\\.workers\\.dev\\/guides\\/how-many-bags-of-concrete<\\/loc>/,\n  );`,
    `  assert.match(\n    sitemap,\n    /<loc>https:\\/\\/buildmeasure\\.buildtools\\.workers\\.dev\\/guides\\/how-many-bags-of-concrete<\\/loc>/,\n  );\n  assert.match(\n    sitemap,\n    /<loc>https:\\/\\/buildmeasure\\.buildtools\\.workers\\.dev\\/guides\\/how-many-bags-of-concrete-for-post-holes<\\/loc>/,\n  );`,
    "tests/rendered-html.test.mjs",
  );

  next = replaceOnce(
    next,
    `  assert.match(llmsSource, /guides\\/how-much-paint-do-i-need/);`,
    `  assert.match(llmsSource, /guides\\/how-many-bags-of-concrete-for-post-holes/);\n  assert.match(llmsSource, /guides\\/how-much-paint-do-i-need/);`,
    "tests/rendered-html.test.mjs",
  );

  const marker = `test("serves absolute production URLs in robots and sitemap", async () => {`;
  const guideTest = `test("renders the post-hole bag guide with verified quantity boundaries", async () => {\n  const workerUrl = new URL("../dist/server/index.js", import.meta.url);\n  workerUrl.searchParams.set("post-hole-guide", \`${"${process.pid}-${Date.now()}"}\`);\n  const { default: worker } = await import(workerUrl.href);\n  const response = await worker.fetch(\n    new Request("http://localhost/guides/how-many-bags-of-concrete-for-post-holes", {\n      headers: { accept: "text/html" },\n    }),\n    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },\n    { waitUntil() {}, passThroughOnException() {} },\n  );\n  const html = await response.text();\n\n  assert.equal(response.status, 200);\n  assert.match(html, /How many bags of concrete do I need for post holes/);\n  assert.match(html, /11 bags/);\n  assert.match(html, /24 × 40 lb/);\n  assert.match(html, /16 × 60 lb/);\n  assert.match(html, /12 × 80 lb/);\n  assert.match(html, /not recommended hole dimensions/i);\n  assert.match(html, /does not choose structural or code dimensions/i);\n  assert.match(html, /application\\/ld\\+json/);\n  assert.match(html, /FAQPage/);\n  assert.match(html, /Article/);\n  assert.match(html, /https:\\/\\/buildmeasure\\.buildtools\\.workers\\.dev\\/guides\\/how-many-bags-of-concrete-for-post-holes/);\n  assert.match(html, /href="\\/post-hole-concrete-calculator"/);\n});\n\n${marker}`;
  next = replaceOnce(next, marker, guideTest, "tests/rendered-html.test.mjs");
  return next;
});

console.log("Integrated post-hole bag guide discovery and regression coverage.");
