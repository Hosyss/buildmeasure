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
    name: "Concrete Calculator",
    description: "Estimate ready-mix volume and bag quantities for rectangular slabs.",
    href: "/concrete-calculator",
    status: "Live",
    tag: "Most popular",
  },
  {
    name: "Circular Slab Concrete Calculator",
    description: "Estimate circular slab or pad concrete from diameter, actual depth, quantity, and allowance.",
    href: "/circular-slab-calculator",
    status: "Live",
    tag: "Circular pours",
  },
  {
    name: "Footing Concrete Calculator",
    description: "Estimate concrete volume and complete bags for identical rectangular footings.",
    href: "/footing-calculator",
    status: "Live",
    tag: "Foundations",
  },
  {
    name: "Column Concrete Calculator",
    description: "Estimate concrete for square, rectangular, or circular columns from actual project dimensions.",
    href: "/column-calculator",
    status: "Live",
    tag: "Structural concrete",
  },
  {
    name: "Concrete Wall Calculator",
    description: "Estimate rectangular wall concrete after measured full-depth openings are subtracted.",
    href: "/wall-calculator",
    status: "Live",
    tag: "Walls & forms",
  },
  {
    name: "Post Hole Concrete Calculator",
    description: "Estimate concrete volume and complete bags for multiple round post holes.",
    href: "/post-hole-concrete-calculator",
    status: "Live",
    tag: "Fences & decks",
  },
  {
    name: "Paint Calculator",
    description: "Plan paint quantity from wall area, coats, and coverage.",
    href: "/paint-calculator",
    status: "Live",
    tag: "Interiors",
  },
  {
    name: "Tile Calculator",
    description: "Estimate tiles, full boxes, layout, and cutting allowance.",
    href: "/tile-calculator",
    status: "Live",
    tag: "Flooring",
  },
  {
    name: "Brick Calculator",
    description: "Estimate fired-clay bricks from net wall area, openings, and a documented coverage rate.",
    href: "/brick-calculator",
    status: "Live",
    tag: "Masonry",
  },
  {
    name: "Gravel Calculator",
    description: "Calculate gravel volume, weight, tons, and complete bags.",
    href: "/gravel-calculator",
    status: "Live",
    tag: "Landscaping",
  },
  {
    name: "Mulch Calculator",
    description: "Find mulch volume and the number of bags your beds need.",
    href: "/mulch-calculator",
    status: "Live",
    tag: "Outdoors",
  },
  {
    name: "Drywall Calculator",
    description: "Estimate complete sheets for rectangular room walls and an optional ceiling.",
    href: "/drywall-calculator",
    status: "Live",
    tag: "Interior walls",
  },
];

const standards = [
  "Formula and unit references",
  "Metric and imperial inputs",
  "Explicit waste allowance",
  "Versioned calculation engine",
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <section className="hero">
          <div className="hero-grid shell">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="eyebrow-line" aria-hidden="true" />
                Built for better estimates
              </p>
              <h1>Material estimates you can build on.</h1>
              <p className="hero-lede">
                Professional construction and DIY calculators with transparent
                formulas, practical units, and results designed for the real
                jobsite.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="/concrete-calculator">
                  Calculate concrete <ArrowIcon />
                </a>
                <a className="button button-quiet" href="#calculators">
                  Browse calculators
                </a>
              </div>
              <ul className="trust-row" aria-label="BuildNumbers quality commitments">
                <li><CheckIcon /> Reference-backed</li>
                <li><CheckIcon /> Tested engine</li>
                <li><CheckIcon /> No sign-up</li>
              </ul>
            </div>

            <a className="estimate-card estimate-card-link" href="/concrete-calculator" aria-label="Open Concrete Calculator from this example estimate">
              <div className="estimate-card-head">
                <div>
                  <span className="card-kicker">Concrete slab</span>
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
          <div className="hero-gridlines" aria-hidden="true" />
        </section>

        <section className="section shell" id="calculators">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Calculator library</p>
              <h2>Start with the material you need.</h2>
            </div>
            <p>
              Each calculator is built as a documented product—not a black-box
              form.
            </p>
          </div>

          <div className="calculator-grid">
            {calculators.map((calculator) => {
              const isLive = calculator.status === "Live";
              const cardContent = (
                <>
                  <div className="calculator-card-top">
                    <span className="calculator-icon"><CalculatorIcon /></span>
                    <span className={`status-pill ${isLive ? "status-live" : ""}`}>
                      {calculator.status}
                    </span>
                  </div>
                  <p className="card-kicker">{calculator.tag}</p>
                  <h3>{calculator.name}</h3>
                  <p>{calculator.description}</p>
                  <span className="card-action">
                    {isLive ? "Open calculator" : "On the roadmap"} <ArrowIcon />
                  </span>
                </>
              );

              return isLive ? (
                <a
                  className={`calculator-card ${isLive ? "calculator-card-live" : ""}`}
                  href={calculator.href}
                  key={calculator.name}
                >
                  {cardContent}
                </a>
              ) : (
                <article
                  className="calculator-card"
                  key={calculator.name}
                >
                  {cardContent}
                </article>
              );
            })}
          </div>
        </section>

        <section className="standards-section" id="standards">
          <div className="shell standards-grid">
            <div>
              <p className="eyebrow eyebrow-light">The BuildNumbers standard</p>
              <h2>Accuracy is a feature.</h2>
              <p className="standards-lede">
                Useful estimates begin with visible assumptions. We publish how
                the result is calculated and keep the calculation engine separate
                from the interface.
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
              <h2 id="resource-title">From measurements to a purchase plan.</h2>
            </div>
            <p>Use the <a href="/guides">guide library</a>, then inspect how every result is verified.</p>
          </div>
          <div className="resource-grid">
            <a href="/guides/how-many-bags-of-concrete">
              <span>Rectangular slab guide</span>
              <h3>How much concrete do I need for a slab?</h3>
              <p>Convert rectangular slab dimensions into cubic yards and complete 40, 60, or 80 lb bags with a visible allowance.</p>
              <strong>Calculate slab yards and bags <ArrowIcon /></strong>
            </a>
            <a href="/guides/how-much-concrete-for-circular-slabs">
              <span>Circular slab guide</span>
              <h3>How much concrete do I need for a circular slab?</h3>
              <p>Convert measured diameter to radius and circle area, then calculate concrete volume from the actual project depth.</p>
              <strong>Plan circular slab concrete <ArrowIcon /></strong>
            </a>
            <a href="/guides/how-much-concrete-for-footings">
              <span>Footing concrete guide</span>
              <h3>How much concrete do I need for footings?</h3>
              <p>Turn measured rectangular footing dimensions into total volume and complete bags without guessing structural footing size.</p>
              <strong>Plan footing concrete <ArrowIcon /></strong>
            </a>
            <a href="/guides/how-much-concrete-for-columns">
              <span>Column concrete guide</span>
              <h3>How much concrete do I need for columns?</h3>
              <p>Estimate square, rectangular, and circular column volume from actual project dimensions without structural sizing assumptions.</p>
              <strong>Plan column concrete <ArrowIcon /></strong>
            </a>
            <a href="/guides/how-much-concrete-for-walls">
              <span>Concrete wall guide</span>
              <h3>How much concrete do I need for a wall?</h3>
              <p>Subtract measured full-depth openings from wall face area, then calculate concrete volume from the actual wall thickness.</p>
              <strong>Plan wall concrete <ArrowIcon /></strong>
            </a>
            <a href="/guides/how-many-bags-of-concrete-for-post-holes">
              <span>Post-hole concrete guide</span>
              <h3>How many bags of concrete for post holes?</h3>
              <p>Turn round-hole dimensions and hole count into volume and complete bags without prescribing structural hole size.</p>
              <strong>Read the post-hole bag guide <ArrowIcon /></strong>
            </a>
            <a href="/guides/how-much-paint-do-i-need">
              <span>Paint guide</span>
              <h3>How much paint do I need for a room?</h3>
              <p>Account for wall area, openings, coats, coverage, and full-container rounding.</p>
              <strong>Plan the paint order <ArrowIcon /></strong>
            </a>
            <a href="/guides/how-many-tiles-do-i-need">
              <span>Tile guide</span>
              <h3>How many tiles do I need?</h3>
              <p>Convert room and tile dimensions into complete boxes with an explicit waste allowance.</p>
              <strong>Plan the tile order <ArrowIcon /></strong>
            </a>
            <a href="/guides/how-many-bricks-do-i-need">
              <span>Brick guide</span>
              <h3>How many bricks do I need for a wall?</h3>
              <p>Subtract measured openings, apply documented fired-clay brick coverage, and keep waste explicit.</p>
              <strong>Plan the brick order <ArrowIcon /></strong>
            </a>
            <a href="/guides/how-much-gravel-do-i-need">
              <span>Gravel guide</span>
              <h3>How much gravel do I need?</h3>
              <p>Estimate compacted volume, adjustable density, total weight, and complete bags.</p>
              <strong>Plan the gravel order <ArrowIcon /></strong>
            </a>
            <a href="/guides/how-much-mulch-do-i-need">
              <span>Mulch guide</span>
              <h3>How much mulch do I need?</h3>
              <p>Turn bed area and installed depth into cubic yards and complete bags.</p>
              <strong>Plan the mulch order <ArrowIcon /></strong>
            </a>
            <a href="/guides/material-estimating-basics">
              <span>Practical guide</span>
              <h3>How to estimate construction materials</h3>
              <p>Separate geometry, allowances, product data, and package rounding.</p>
              <strong>Read the estimating workflow <ArrowIcon /></strong>
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
