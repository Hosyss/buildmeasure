import type { Metadata } from "next";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CALCULATOR_CATALOG, LIVE_CALCULATOR_COUNT } from "@/lib/calculator-catalog";
import { absoluteUrl } from "@/lib/site";
import { CalculatorLibrary } from "./calculator-library";

export const metadata: Metadata = {
  title: "Construction & DIY Calculator Library",
  description:
    "Search and browse BuildNumbers construction calculators by work area, compare project fit and verification checks, and open the matching estimating guide.",
  alternates: { canonical: "/calculators" },
  openGraph: {
    title: "BuildNumbers Calculator Library",
    description: `Browse ${LIVE_CALCULATOR_COUNT} transparent construction and DIY calculators by material, project type, and estimating workflow.`,
    type: "website",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "BuildNumbers Construction & DIY Calculator Library",
  url: absoluteUrl("/calculators"),
  description:
    "A searchable library of reference-backed construction and DIY material calculators with project-fit guidance and matching estimating guides.",
  hasPart: CALCULATOR_CATALOG.map((calculator) => ({
    "@type": "WebApplication",
    name: calculator.name,
    url: absoluteUrl(calculator.href),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    description: calculator.description,
  })),
};

export default function CalculatorsPage() {
  return (
    <>
      <SiteHeader ctaHref="/projects" ctaLabel="Open Project Mode" />
      <main className="calculator-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <section className="calculator-hero">
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <a href="/">Home</a><span aria-hidden="true">/</span><span>Calculators</span>
            </nav>
            <div className="calculator-hero-grid">
              <div>
                <p className="eyebrow">Calculator library</p>
                <h1>Find the right tool without hunting through the site.</h1>
                <p>
                  Search {LIVE_CALCULATOR_COUNT} live calculators by material, job, or geometry. Each tool now states when it fits the project, what to verify before ordering, and where to read the full estimating guide.
                </p>
              </div>
              <ul>
                <li><CheckIcon /> Search by material or project</li>
                <li><CheckIcon /> Check project fit before calculating</li>
                <li><CheckIcon /> Calculator + guide together</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="shell" aria-label="Searchable calculator directory">
          <CalculatorLibrary />
        </section>

        <section className="shell calculator-content" aria-labelledby="choose-calculator-title">
          <article>
            <p className="eyebrow">Choose by geometry first</p>
            <h2 id="choose-calculator-title">The right material calculator starts with the shape you actually measured.</h2>
            <p>
              A material name alone is not enough. Concrete can be a rectangular slab, circular pad, footing, column, wall, post hole, or a project that combines several of those shapes. Paint, tile, drywall, brick, gravel, and mulch each depend on different measurements and product assumptions.
            </p>
            <p>
              Pick the calculator whose modeled geometry matches the project, keep dimensions in their real units, and enter product-specific values such as coverage, density, yield, package volume, or pieces per box where the tool asks for them. If the project shape does not match the calculator, split it into supported shapes or use the matching guide before estimating.
            </p>
            <a className="button button-primary" href="/guides/material-estimating-basics">
              Read the estimating workflow <ArrowIcon />
            </a>
          </article>
          <aside className="formula-meta">
            <h3>Before you trust the result</h3>
            <dl>
              <div><dt>1. Scope</dt><dd>Confirm the calculator models the actual project shape.</dd></div>
              <div><dt>2. Measurements</dt><dd>Recheck dimensions, openings, depth, quantity, and units.</dd></div>
              <div><dt>3. Product data</dt><dd>Use the current label or supplier value for yield, coverage, density, or package size.</dd></div>
              <div><dt>4. Allowance</dt><dd>Choose a project-specific extra instead of treating a default as universal.</dd></div>
              <div><dt>5. Ordering</dt><dd>Confirm full-package rounding and supplier delivery increments.</dd></div>
            </dl>
            <h3>What BuildNumbers does not decide</h3>
            <p>
              Structural dimensions, code compliance, product suitability, installation method, and contractual quantities must come from the project documents, supplier, manufacturer, or a qualified professional.
            </p>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
