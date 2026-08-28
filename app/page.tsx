import type { Metadata } from "next";
import { ArrowIcon, CalculatorIcon, CheckIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CONCRETE_ENGINE_VERSION } from "@/lib/calculators/concrete";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BuildNumbers",
  url: absoluteUrl("/"),
  description:
    "Reference-backed construction and DIY calculators with transparent formulas and visible assumptions.",
  creator: {
    "@type": "Person",
    name: "Hosyss",
    url: "https://github.com/Hosyss",
  },
  sameAs: ["https://github.com/Hosyss/buildmeasure"],
};

const calculators = [
  {
    group: "Concrete",
    tag: "Most popular",
    name: "Concrete Calculator",
    description: "Rectangular slab volume, ready-mix quantity, allowance, and complete bags.",
    href: "/concrete-calculator",
    guide: "/guides/how-many-bags-of-concrete",
  },
  {
    group: "Concrete",
    tag: "Circular pours",
    name: "Circular Slab Concrete Calculator",
    description: "Circular slabs and pads from measured diameter, depth, quantity, and allowance.",
    href: "/circular-slab-calculator",
    guide: "/guides/how-much-concrete-for-circular-slabs",
  },
  {
    group: "Foundations",
    tag: "Foundations",
    name: "Footing Concrete Calculator",
    description: "Identical rectangular footings with final-project bag rounding and visible allowance.",
    href: "/footing-calculator",
    guide: "/guides/how-much-concrete-for-footings",
  },
  {
    group: "Structure",
    tag: "Structural concrete",
    name: "Column Concrete Calculator",
    description: "Square, rectangular, or circular column quantity from actual measured dimensions.",
    href: "/column-calculator",
    guide: "/guides/how-much-concrete-for-columns",
  },
  {
    group: "Structure",
    tag: "Walls & forms",
    name: "Concrete Wall Calculator",
    description: "Concrete walls with measured full-depth opening subtraction before volume calculation.",
    href: "/wall-calculator",
    guide: "/guides/how-much-concrete-for-walls",
  },
  {
    group: "Foundations",
    tag: "Fences & decks",
    name: "Post Hole Concrete Calculator",
    description: "Round post holes, multiple-hole quantity, and optional post displacement.",
    href: "/post-hole-concrete-calculator",
    guide: "/guides/how-many-bags-of-concrete-for-post-holes",
  },
  {
    group: "Finishes",
    tag: "Interiors",
    name: "Paint Calculator",
    description: "Room walls and ceilings using measured openings, coats, coverage, and containers.",
    href: "/paint-calculator",
    guide: "/guides/how-much-paint-do-i-need",
  },
  {
    group: "Finishes",
    tag: "Flooring",
    name: "Tile Calculator",
    description: "Tile quantity, complete boxes, layout dimensions, grout spacing, and cutting allowance.",
    href: "/tile-calculator",
    guide: "/guides/how-many-tiles-do-i-need",
  },
  {
    group: "Masonry",
    tag: "Masonry",
    name: "Brick Calculator",
    description: "Net wall area, measured openings, documented coverage, and explicit breakage allowance.",
    href: "/brick-calculator",
    guide: "/guides/how-many-bricks-do-i-need",
  },
  {
    group: "Landscape",
    tag: "Landscaping",
    name: "Gravel Calculator",
    description: "Layer volume, adjustable density, total weight, tons or tonnes, and complete bags.",
    href: "/gravel-calculator",
    guide: "/guides/how-much-gravel-do-i-need",
  },
  {
    group: "Landscape",
    tag: "Outdoors",
    name: "Mulch Calculator",
    description: "Garden-bed volume, installed depth, bulk cubic yards, and package quantities.",
    href: "/mulch-calculator",
    guide: "/guides/how-much-mulch-do-i-need",
  },
  {
    group: "Finishes",
    tag: "Interior walls",
    name: "Drywall Calculator",
    description: "Room walls, optional ceiling, measured openings, panel size, and complete sheets.",
    href: "/drywall-calculator",
    guide: "/guides/how-many-drywall-sheets-do-i-need",
  },
] as const;

const standards = [
  "Formula and unit references",
  "Metric and imperial inputs",
  "Explicit allowances and product assumptions",
  "Versioned calculation engines with regression tests",
];

const categories = [
  {
    label: "Concrete & foundations",
    count: "6 tools",
    description: "Slabs, circular pads, footings, columns, walls, and post holes in one focused concrete suite.",
    href: "/concrete-calculator",
  },
  {
    label: "Interiors & finishes",
    count: "3 tools",
    description: "Plan paint, tile, and drywall with product coverage, openings, and package rounding kept visible.",
    href: "/paint-calculator",
  },
  {
    label: "Masonry & landscape",
    count: "3 tools",
    description: "Estimate brick, gravel, and mulch from measured geometry and explicit material assumptions.",
    href: "/brick-calculator",
  },
] as const;

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        <section className="workspace-hero">
          <div className="workspace-hero-grid shell">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-line" aria-hidden="true" />
                Construction estimating workspace
              </p>
              <h1>Plan materials without getting lost in the tools.</h1>
              <p className="hero-lede">
                BuildNumbers organizes verified construction calculators, guides,
                saved estimates, shopping quantities, and project reports into one
                clear workspace. Pick the job first; the math stays transparent.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#calculators">
                  Find the right calculator <ArrowIcon />
                </a>
                <a className="button button-quiet" href="/projects">
                  Open Project Mode
                </a>
              </div>
              <ul className="trust-row" aria-label="BuildNumbers quality commitments">
                <li><CheckIcon /> Reference-backed</li>
                <li><CheckIcon /> Tested engines</li>
                <li><CheckIcon /> Local saved estimates</li>
                <li><CheckIcon /> No sign-up</li>
              </ul>
              <div className="hero-stat-grid" aria-label="BuildNumbers workspace summary">
                <div className="hero-stat"><strong>12</strong><span>live calculators</span></div>
                <div className="hero-stat"><strong>12+</strong><span>practical guides</span></div>
                <div className="hero-stat"><strong>2</strong><span>unit systems</span></div>
                <div className="hero-stat"><strong>1</strong><span>project workspace</span></div>
              </div>
            </div>

            <div style={{ display: "grid", gap: 18 }}>
              <div className="hero-command-card" aria-label="Quick workspace actions">
                <div className="command-head">
                  <div>
                    <p>Start here</p>
                    <h2>What are you trying to do?</h2>
                  </div>
                  <span className="command-status">Ready</span>
                </div>
                <div className="command-list">
                  <a className="command-link" href="/concrete-calculator">
                    <span className="command-icon"><CalculatorIcon /></span>
                    <span><strong>Estimate one material</strong><small>Open a focused calculator and see the formula.</small></span>
                    <ArrowIcon />
                  </a>
                  <a className="command-link" href="/projects">
                    <span className="command-icon"><CalculatorIcon /></span>
                    <span><strong>Combine a project</strong><small>Group saved estimates, shopping quantities, and costs.</small></span>
                    <ArrowIcon />
                  </a>
                  <a className="command-link" href="/guides">
                    <span className="command-icon"><CalculatorIcon /></span>
                    <span><strong>Learn before calculating</strong><small>Check measurements, assumptions, and scope limits.</small></span>
                    <ArrowIcon />
                  </a>
                </div>
              </div>

              <a
                className="estimate-card estimate-card-link"
                href="/concrete-calculator"
                aria-label="Open Concrete Calculator from this example estimate"
              >
                <div className="estimate-card-head">
                  <div>
                    <span className="card-kicker">Concrete slab · verified example</span>
                    <h2>Example estimate</h2>
                  </div>
                  <span className="live-pill"><span /> Live</span>
                </div>
                <div className="dimension-grid">
                  <div><span>Length</span><strong>20 ft</strong></div>
                  <span className="dimension-multiplier" aria-hidden="true">×</span>
                  <div><span>Width</span><strong>12 ft</strong></div>
                  <span className="dimension-multiplier" aria-hidden="true">×</span>
                  <div><span>Depth</span><strong>4 in</strong></div>
                </div>
                <div className="estimate-result">
                  <div>
                    <span>Order volume</span>
                    <strong>3.26 <small>yd³</small></strong>
                  </div>
                  <div className="waste-badge">Includes 10% waste</div>
                </div>
                <div className="estimate-meta">
                  <span>Formula</span>
                  <code>L × W × D</code>
                  <span>Engine</span>
                  <code>v{CONCRETE_ENGINE_VERSION}</code>
                </div>
                <span className="estimate-link">
                  Open Concrete Calculator <ArrowIcon />
                </span>
              </a>
            </div>
          </div>
        </section>

        <section className="category-section shell" id="calculators">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Choose by job</p>
              <h2>Three work areas. Twelve focused tools.</h2>
            </div>
            <p>
              Start with the type of work instead of scanning a wall of nearly
              identical calculator cards.
            </p>
          </div>
          <div className="category-strip">
            {categories.map((category) => (
              <a className="category-tile" href={category.href} key={category.label}>
                <span>{category.count}</span>
                <h3>{category.label}</h3>
                <p>{category.description}</p>
                <strong>Start in this work area →</strong>
              </a>
            ))}
          </div>
        </section>

        <section className="directory-section shell" aria-labelledby="directory-title">
          <div className="directory-shell">
            <div className="directory-head">
              <div>
                <p className="eyebrow">Calculator directory</p>
                <h2 id="directory-title">Everything, organized in one table.</h2>
              </div>
              <p>
                See the job type, tool, scope, calculator, and matching guide
                before you open anything.
              </p>
            </div>
            <table className="tool-directory">
              <thead>
                <tr>
                  <th>Work area</th>
                  <th>Calculator</th>
                  <th>What it estimates</th>
                  <th>Open</th>
                </tr>
              </thead>
              <tbody>
                {calculators.map((calculator) => (
                  <tr key={calculator.href}>
                    <td data-label="Work area">{calculator.group}</td>
                    <td data-label="Calculator">
                      <a href={calculator.href}>{calculator.name}</a>
                      <small style={{ display: "block", marginTop: 3, color: "var(--ink-500)" }}>
                        {calculator.tag}
                      </small>
                    </td>
                    <td data-label="Scope">{calculator.description}</td>
                    <td data-label="Open">
                      <div className="directory-actions">
                        <a href={calculator.href}>Calculator</a>
                        <a href={calculator.guide}>Guide</a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="workflow-section" aria-labelledby="workflow-title">
          <div className="shell workflow-grid">
            <div className="workflow-copy">
              <p className="eyebrow">Professional workflow</p>
              <h2 id="workflow-title">Measure once. Estimate clearly. Build a project.</h2>
              <p>
                The calculators are individual tools, but the product is the
                workflow around them: transparent inputs, saved estimates,
                structured purchase quantities, project cost roll-ups, and a
                printable record.
              </p>
              <div className="project-cta">
                <div>
                  <h3>Project Mode</h3>
                  <p>Combine saved estimates without uploading project details to an account.</p>
                </div>
                <a className="button button-primary" href="/projects">
                  Build a project <ArrowIcon />
                </a>
              </div>
            </div>
            <div className="workflow-steps">
              <article className="workflow-step">
                <span>01</span>
                <div><h3>Choose the correct geometry</h3><p>Use the directory to match the physical job to a focused calculator.</p></div>
              </article>
              <article className="workflow-step">
                <span>02</span>
                <div><h3>Keep assumptions visible</h3><p>Units, waste, coverage, density, openings, and package sizes stay explicit.</p></div>
              </article>
              <article className="workflow-step">
                <span>03</span>
                <div><h3>Save the estimate</h3><p>Store the result locally in the current browser and keep its calculation context.</p></div>
              </article>
              <article className="workflow-step">
                <span>04</span>
                <div><h3>Combine and report</h3><p>Build a shopping list, view same-label cost totals, and print or save the project as PDF.</p></div>
              </article>
            </div>
          </div>
        </section>

        <section className="standards-section" id="standards">
          <div className="shell standards-grid">
            <div>
              <p className="eyebrow eyebrow-light">The BuildNumbers standard</p>
              <h2>Accuracy is a feature.</h2>
              <p className="standards-lede">
                Useful estimates begin with visible assumptions. BuildNumbers
                publishes how results are calculated and keeps calculation
                engines separate from the interface.
              </p>
            </div>
            <ul className="standards-list">
              {standards.map((standard, index) => (
                <li key={standard}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{standard}</strong>
                  <CheckIcon />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section shell resource-section" aria-labelledby="resource-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Plan with context</p>
              <h2 id="resource-title">Read the method, not just the answer.</h2>
            </div>
            <p>
              Start with the most common planning guides, or open the complete
              <a href="/guides"> guide library</a>.
            </p>
          </div>
          <div className="resource-grid">
            <a href="/guides/how-many-bags-of-concrete">
              <span>Concrete slab guide</span>
              <h3>How much concrete do I need for a slab?</h3>
              <p>Convert measured slab dimensions into volume and complete bags with a visible allowance.</p>
              <strong>Read the slab guide <ArrowIcon /></strong>
            </a>
            <a href="/guides/how-much-paint-do-i-need">
              <span>Paint guide</span>
              <h3>How much paint do I need for a room?</h3>
              <p>Separate wall area, openings, coats, product coverage, and container rounding.</p>
              <strong>Read the paint guide <ArrowIcon /></strong>
            </a>
            <a href="/guides/how-many-tiles-do-i-need">
              <span>Tile guide</span>
              <h3>How many tiles do I need?</h3>
              <p>Understand purchase quantity, box rounding, grout-aware layout, and cutting allowance.</p>
              <strong>Read the tile guide <ArrowIcon /></strong>
            </a>
            <a href="/guides/material-estimating-basics">
              <span>Estimating fundamentals</span>
              <h3>How to estimate construction materials</h3>
              <p>Use one repeatable workflow for geometry, allowances, product data, and package rounding.</p>
              <strong>Read the estimating workflow <ArrowIcon /></strong>
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
