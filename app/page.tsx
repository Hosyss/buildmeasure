import type { Metadata } from "next";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
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
    "A construction material planning workspace for turning measurements into quantities, saved estimates, project shopping lists, and printable reports.",
  creator: {
    "@type": "Person",
    name: "Hosyss",
    url: "https://github.com/Hosyss",
  },
  sameAs: ["https://github.com/Hosyss/buildmeasure"],
};

const audiences = [
  ["Homeowners", "Plan a renovation before ordering materials."],
  ["DIY builders", "Turn site measurements into practical purchase quantities."],
  ["Contractors", "Create repeatable estimates with visible assumptions."],
  ["Estimators", "Check quantities, save scenarios, and assemble project reports."],
] as const;

const standards = [
  "Formula and unit references",
  "Metric and imperial inputs",
  "Explicit allowances and product assumptions",
  "Versioned calculation engines with regression tests",
] as const;

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="home-product">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        <section className="identity-hero">
          <div className="shell identity-hero-grid">
            <div className="identity-copy">
              <p className="eyebrow eyebrow-light">
                <span className="eyebrow-line" aria-hidden="true" />
                Construction material planning
              </p>
              <h1>Know what to buy before you build.</h1>
              <p className="identity-lede">
                <strong>BuildNumbers is a free estimating workspace for construction and DIY projects.</strong>
                {" "}Enter real measurements, calculate material quantities, save the result,
                combine estimates into one project, and print a shopping-ready report.
              </p>

              <div className="identity-actions">
                <a className="button button-primary" href="/calculators">
                  Start an estimate <ArrowIcon />
                </a>
                <a className="button button-quiet" href="#how-it-works">
                  See how it works
                </a>
              </div>

              <div className="identity-proof" aria-label="BuildNumbers product summary">
                <span><strong>13</strong> focused calculators</span>
                <span><strong>2</strong> unit systems</span>
                <span><strong>1</strong> project workspace</span>
                <span><strong>0</strong> sign-up required</span>
              </div>
            </div>

            <div className="hero-story" aria-label="Example BuildNumbers workflow">
              <div className="hero-story-head">
                <div>
                  <span className="story-kicker">Example workflow</span>
                  <h2>Patio slab estimate</h2>
                </div>
                <span className="story-status">Ready to order</span>
              </div>

              <ol className="story-steps">
                <li>
                  <span>01</span>
                  <div><small>Measure</small><strong>20 ft × 12 ft × 4 in</strong></div>
                </li>
                <li>
                  <span>02</span>
                  <div><small>Calculate</small><strong>3.26 yd³ with 10% allowance</strong></div>
                </li>
                <li>
                  <span>03</span>
                  <div><small>Save</small><strong>Add estimate to “Patio project”</strong></div>
                </li>
              </ol>

              <div className="story-result">
                <div>
                  <small>Next step</small>
                  <strong>Build the material order</strong>
                </div>
                <a href="/concrete-calculator" aria-label="Open the Concrete Calculator">
                  Open example <ArrowIcon />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="audience-band" aria-labelledby="audience-title">
          <div className="shell">
            <div className="audience-title-row">
              <p className="eyebrow">Who uses BuildNumbers?</p>
              <h2 id="audience-title">Built for people who need a material answer they can act on.</h2>
            </div>
            <div className="audience-rail">
              {audiences.map(([name, description]) => (
                <article key={name}>
                  <span><CheckIcon /></span>
                  <div><h3>{name}</h3><p>{description}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="how-section shell" id="how-it-works" aria-labelledby="how-title">
          <div className="how-intro">
            <p className="eyebrow">How it works</p>
            <h2 id="how-title">Measurements in. A usable project plan out.</h2>
            <p>
              You do not need to learn thirteen tools. BuildNumbers keeps the same
              workflow across materials so you always know what to do next.
            </p>
          </div>

          <div className="how-path" aria-label="Three-step BuildNumbers workflow">
            <article>
              <span className="how-number">1</span>
              <div>
                <p className="how-label">Choose the job</p>
                <h3>Pick what you are estimating.</h3>
                <p>Concrete, paint, tile, drywall, brick, gravel, mulch, or a multi-shape concrete project.</p>
              </div>
            </article>
            <div className="how-connector" aria-hidden="true">→</div>
            <article>
              <span className="how-number">2</span>
              <div>
                <p className="how-label">Enter measurements</p>
                <h3>See the math and assumptions.</h3>
                <p>Use metric or imperial inputs. Allowance, coverage, density, openings, and package rounding stay visible.</p>
              </div>
            </article>
            <div className="how-connector" aria-hidden="true">→</div>
            <article>
              <span className="how-number">3</span>
              <div>
                <p className="how-label">Use the result</p>
                <h3>Save it to a project.</h3>
                <p>Combine estimates, review purchase quantities and same-currency costs, then print or save the report as PDF.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="start-section" aria-labelledby="start-title">
          <div className="shell">
            <div className="start-heading">
              <div>
                <p className="eyebrow eyebrow-light">Choose your starting point</p>
                <h2 id="start-title">Start with the job, not a wall of tools.</h2>
              </div>
              <a href="/calculators" className="text-link-light">Browse all 13 calculators <ArrowIcon /></a>
            </div>

            <div className="start-grid">
              <a className="start-feature" href="/concrete-project-calculator">
                <span className="start-tag">For complex concrete work</span>
                <h3>Combine multiple concrete shapes into one order.</h3>
                <p>
                  Slabs, circular pours, footings, columns, walls, and post holes can be measured separately and totaled once before allowance and bag rounding.
                </p>
                <strong>Open Multi-Shape Concrete Project <ArrowIcon /></strong>
              </a>

              <div className="start-side">
                <a href="/calculators">
                  <span>Quick estimate</span>
                  <h3>I need one material quantity.</h3>
                  <p>Choose a focused calculator for concrete, paint, tile, drywall, brick, gravel, or mulch.</p>
                  <strong>Find a calculator <ArrowIcon /></strong>
                </a>
                <a href="/projects">
                  <span>Whole project</span>
                  <h3>I already have estimates to combine.</h3>
                  <p>Group saved estimates into a project with shopping quantities, cost roll-ups, and a printable report.</p>
                  <strong>Open Project Mode <ArrowIcon /></strong>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="project-showcase" aria-labelledby="project-showcase-title">
          <div className="shell project-showcase-grid">
            <div className="project-showcase-copy">
              <p className="eyebrow">More than calculators</p>
              <h2 id="project-showcase-title">Your estimates can become one project record.</h2>
              <p>
                Save results locally in your browser, group different materials under one project,
                review purchase quantities and same-label costs, then print the project or save it as PDF.
              </p>
              <ul>
                <li><CheckIcon /> No account required</li>
                <li><CheckIcon /> Saved locally in the current browser</li>
                <li><CheckIcon /> Structured shopping quantities</li>
                <li><CheckIcon /> Printable project summary</li>
              </ul>
              <a className="button button-primary" href="/projects">Open Project Mode <ArrowIcon /></a>
            </div>

            <div className="project-sheet" aria-label="Example project summary">
              <div className="project-sheet-head">
                <div><small>PROJECT</small><strong>Backyard renovation</strong></div>
                <span>3 estimates</span>
              </div>
              <div className="project-sheet-row"><span>Patio concrete</span><strong>3.26 yd³</strong></div>
              <div className="project-sheet-row"><span>Garden mulch</span><strong>4.1 yd³</strong></div>
              <div className="project-sheet-row"><span>Fence post concrete</span><strong>18 bags</strong></div>
              <div className="project-sheet-total">
                <span>Project record</span>
                <strong>Ready to print</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-section shell" id="standards" aria-labelledby="trust-title">
          <div className="trust-lead">
            <p className="eyebrow">Why trust the result?</p>
            <h2 id="trust-title">The calculation is part of the product, not a black box.</h2>
            <p>
              BuildNumbers keeps formulas, units, assumptions, and engine versions visible so an estimate can be checked before money is spent.
            </p>
            <a href="/methodology" className="text-link">Read the methodology <ArrowIcon /></a>
          </div>
          <div className="trust-matrix">
            {standards.map((standard, index) => (
              <div key={standard}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{standard}</strong>
                <CheckIcon />
              </div>
            ))}
          </div>
        </section>

        <section className="home-final-cta">
          <div className="shell home-final-cta-inner">
            <div>
              <p className="eyebrow eyebrow-light">Ready when the measurements are</p>
              <h2>Find the calculator that matches your job.</h2>
              <p>Search and filter the complete calculator library, then move the result into Project Mode when you are ready.</p>
            </div>
            <div>
              <a className="button button-primary" href="/calculators">Browse calculators <ArrowIcon /></a>
              <a className="button button-quiet" href="/guides">Read practical guides</a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
