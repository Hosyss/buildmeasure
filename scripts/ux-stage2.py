from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text()
    if old not in text:
        raise SystemExit(f"target not found in {path}: {old[:80]!r}")
    file.write_text(text.replace(old, new, 1))


# Keep the shared header server-rendered and explicit: no pathname hook or added JS.
Path("components/site-header.tsx").write_text('''type SiteHeaderProps = {
  ctaHref?: string;
  ctaLabel?: string;
};

export function SiteHeader({
  ctaHref = "/#calculators",
  ctaLabel = "Browse calculators",
}: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="utility-bar">
        <div className="shell utility-inner">
          <span>Free construction calculators</span>
          <span className="utility-separator" aria-hidden="true" />
          <span>Metric &amp; Imperial</span>
        </div>
      </div>
      <div className="shell nav-wrap">
        <a className="brand" href="/" aria-label="BuildMeasure home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>BuildMeasure</span>
        </a>
        <nav className="main-nav" aria-label="Primary navigation">
          <a href="/#calculators">Calculators</a>
          <a href="/guides/material-estimating-basics">Estimating guide</a>
          <a href="/methodology">Methodology</a>
        </nav>
        <a className="button button-small button-outline" href={ctaHref}>
          {ctaLabel}
        </a>
      </div>
    </header>
  );
}
''')

calculator_pages = [
    "app/concrete-calculator/page.tsx",
    "app/post-hole-concrete-calculator/page.tsx",
    "app/paint-calculator/page.tsx",
    "app/tile-calculator/page.tsx",
    "app/brick-calculator/page.tsx",
    "app/gravel-calculator/page.tsx",
    "app/mulch-calculator/page.tsx",
]
for page in calculator_pages:
    replace_once(
        page,
        "<SiteHeader />",
        '<SiteHeader ctaHref="/#calculators" ctaLabel="All calculators" />',
    )

guide_ctas = {
    "app/guides/how-many-bags-of-concrete/page.tsx": ("/concrete-calculator", "Open Concrete Calculator"),
    "app/guides/how-many-bags-of-concrete-for-post-holes/page.tsx": ("/post-hole-concrete-calculator", "Open Post Hole Calculator"),
    "app/guides/how-much-paint-do-i-need/page.tsx": ("/paint-calculator", "Open Paint Calculator"),
    "app/guides/how-many-tiles-do-i-need/page.tsx": ("/tile-calculator", "Open Tile Calculator"),
    "app/guides/how-many-bricks-do-i-need/page.tsx": ("/brick-calculator", "Open Brick Calculator"),
    "app/guides/how-much-gravel-do-i-need/page.tsx": ("/gravel-calculator", "Open Gravel Calculator"),
    "app/guides/how-much-mulch-do-i-need/page.tsx": ("/mulch-calculator", "Open Mulch Calculator"),
}
for page, (href, label) in guide_ctas.items():
    replace_once(
        page,
        "<SiteHeader />",
        f'<SiteHeader ctaHref="{href}" ctaLabel="{label}" />',
    )

# Homepage: the static hero sample is unmistakably an example and the whole card is the link.
replace_once(
    "app/page.tsx",
    '<div className="estimate-card" aria-label="Example concrete estimate">',
    '<a className="estimate-card estimate-card-link" href="/concrete-calculator" aria-label="Open Concrete Calculator from this example estimate">',
)
replace_once(
    "app/page.tsx",
    '<h2>Quick estimate</h2>',
    '<h2>Example estimate</h2>',
)
replace_once(
    "app/page.tsx",
    '''              <a className="estimate-link" href="/concrete-calculator">
                Use this calculator <ArrowIcon />
              </a>
            </div>''',
    '''              <span className="estimate-link">
                Open Concrete Calculator <ArrowIcon />
              </span>
            </a>''',
)

css = Path("app/globals.css")
text = css.read_text()
addition = r'''

/* UX clarity follow-up: static examples, readable support copy, and denser guides. */
.estimate-card-link {
  display: block;
  color: inherit;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.estimate-card-link:hover {
  transform: translateY(-2px);
  border-color: rgba(43, 128, 110, 0.35);
  box-shadow: 0 24px 64px rgba(16, 32, 28, 0.11);
}

.estimate-card-link .dimension-grid div {
  border: 0;
  background: var(--sand-100);
}

/* Important helper and warning copy stays at roughly 12–13 px minimum. */
.option-grid small,
.paint-option-grid small,
.container-select small,
.brick-rate-display small,
.primary-result p,
.result-caution {
  font-size: 0.78rem;
}

/* Secondary metadata stays readable without competing with primary content. */
.card-kicker,
.live-pill,
.status-pill,
.dimension-grid span,
.estimate-result span,
.estimate-meta,
.input-with-unit > span,
.primary-result > span,
.result-breakdown dt,
.guide-meta,
.worked-example-card li > span,
.guide-tools a span,
.guide-table-wrap caption {
  font-size: 0.72rem;
}

.waste-badge {
  font-size: 0.75rem;
}

/* Guides should reach the quick answer sooner without losing editorial hierarchy. */
.guide-hero.utility-page-hero {
  padding-block: 62px;
}

.guide-hero .breadcrumbs {
  margin-bottom: 32px;
}

.guide-hero h1 {
  font-size: clamp(2.7rem, 5vw, 4.25rem);
}

@media (max-width: 680px) {
  .guide-hero.utility-page-hero {
    padding-block: 42px;
  }

  .guide-hero .breadcrumbs {
    margin-bottom: 24px;
  }

  .guide-hero h1 {
    font-size: clamp(2.35rem, 11vw, 3.35rem);
  }
}
'''
if "/* UX clarity follow-up:" in text:
    raise SystemExit("stage 2 CSS already present")
css.write_text(text + addition)

# Permanent rendered contract tests for the non-interactive UX guarantees.
Path("tests/ux-clarity-rendered.test.mjs").write_text(r'''import assert from "node:assert/strict";
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

async function render(worker, path) {
  const response = await worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    env,
    ctx,
  );
  return { response, html: await response.text() };
}

function assertHeaderCta(html, label, href) {
  assert.match(html, new RegExp(`href="${href.replaceAll("/", "\\/")}"[^>]*>${label}<\\/a>`));
}

test("homepage labels the hero sample as an example and makes the whole card actionable", async () => {
  const worker = await loadWorker("ux-home");
  const { response, html } = await render(worker, "/");
  assert.equal(response.status, 200);
  assertHeaderCta(html, "Browse calculators", "/#calculators");
  assert.match(html, /class="estimate-card estimate-card-link"/);
  assert.match(html, /href="\/concrete-calculator" aria-label="Open Concrete Calculator from this example estimate"/);
  assert.match(html, /<h2>Example estimate<\/h2>/);
  assert.match(html, /Open Concrete Calculator/);
  const card = html.match(/<a class="estimate-card estimate-card-link"[\s\S]*?<\/a>/)?.[0];
  assert.ok(card, "expected the linked example estimate card");
  assert.doesNotMatch(card, /<(input|select|button)\b/);
});

test("calculator headers return to the calculator library instead of Concrete", async () => {
  const worker = await loadWorker("ux-calculator-headers");
  const routes = [
    "/concrete-calculator",
    "/post-hole-concrete-calculator",
    "/paint-calculator",
    "/tile-calculator",
    "/brick-calculator",
    "/gravel-calculator",
    "/mulch-calculator",
  ];
  for (const route of routes) {
    const { response, html } = await render(worker, route);
    assert.equal(response.status, 200, route);
    assertHeaderCta(html, "All calculators", "/#calculators");
  }
});

test("focused guide headers point to their related calculator", async () => {
  const worker = await loadWorker("ux-guide-headers");
  const routes = [
    ["/guides/how-many-bags-of-concrete", "Open Concrete Calculator", "/concrete-calculator"],
    ["/guides/how-many-bags-of-concrete-for-post-holes", "Open Post Hole Calculator", "/post-hole-concrete-calculator"],
    ["/guides/how-much-paint-do-i-need", "Open Paint Calculator", "/paint-calculator"],
    ["/guides/how-many-tiles-do-i-need", "Open Tile Calculator", "/tile-calculator"],
    ["/guides/how-many-bricks-do-i-need", "Open Brick Calculator", "/brick-calculator"],
    ["/guides/how-much-gravel-do-i-need", "Open Gravel Calculator", "/gravel-calculator"],
    ["/guides/how-much-mulch-do-i-need", "Open Mulch Calculator", "/mulch-calculator"],
  ];
  for (const [route, label, href] of routes) {
    const { response, html } = await render(worker, route);
    assert.equal(response.status, 200, route);
    assertHeaderCta(html, label, href);
    assert.match(html, /class="utility-page-hero guide-hero"/);
  }
});
''')
