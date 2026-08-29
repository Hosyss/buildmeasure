import type { Metadata } from "next";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  CONCRETE_PROJECT_ENGINE_VERSION,
  CONCRETE_PROJECT_FORMULA_VERSION,
} from "@/lib/calculators/concrete-project";
import { absoluteUrl } from "@/lib/site";
import { ConcreteProjectCalculator } from "./concrete-project-calculator";

export const metadata: Metadata = {
  title: "Multi-Shape Concrete Project Calculator",
  description:
    "Combine slabs, circular pads, footings, columns, walls, and post holes into one concrete quantity with one project allowance and one final bag rounding.",
  alternates: { canonical: "/concrete-project-calculator" },
  openGraph: {
    title: "Multi-Shape Concrete Project Calculator",
    description:
      "Build one concrete quantity from multiple verified geometries without adding separately rounded bag estimates.",
    type: "website",
  },
};

const faqs = [
  {
    question: "Why combine concrete shapes before rounding bags?",
    answer:
      "Rounding each slab, footing, column, wall, or post-hole section separately can overstate the total package count. BuildNumbers sums unrounded net volume first, applies one project allowance, then rounds the final bag quantity upward once.",
  },
  {
    question: "Can different parts use different unit systems?",
    answer:
      "Yes. Each part can use Imperial or Metric inputs. BuildNumbers normalizes every valid part to cubic meters before project aggregation, so the project can contain mixed unit systems without mixing physical quantities.",
  },
  {
    question: "Does the project calculator design structural concrete?",
    answer:
      "No. It only combines material quantities from dimensions you enter. Structural sizing, reinforcement, concrete strength, soil, loads, formwork, joints, drainage, excavation, and code requirements remain outside its scope.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BuildNumbers Multi-Shape Concrete Project Calculator",
    url: absoluteUrl("/concrete-project-calculator"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    description:
      "A multi-part concrete quantity workspace for slabs, pads, footings, columns, walls, and post holes.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Multi-Shape Concrete Project", item: absoluteUrl("/concrete-project-calculator") },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  },
];

export default function ConcreteProjectCalculatorPage() {
  return (
    <>
      <SiteHeader ctaHref="/#calculators" ctaLabel="All calculators" />
      <main className="calculator-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <section className="calculator-hero">
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <a href="/">Home</a><span aria-hidden="true">/</span><span>Multi-Shape Concrete Project</span>
            </nav>
            <div className="calculator-hero-grid">
              <div>
                <p className="eyebrow">Concrete workspace</p>
                <h1>Multi-Shape Concrete Project Calculator</h1>
                <p>
                  Combine multiple concrete geometries into one auditable order.
                  Every part keeps its own dimensions and units while the project
                  applies allowance and package rounding only after net volume is combined.
                </p>
              </div>
              <ul>
                <li><CheckIcon /> Seven verified geometry types</li>
                <li><CheckIcon /> Mixed Metric &amp; Imperial parts</li>
                <li><CheckIcon /> One final project rounding</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="shell calculator-main-section">
          <ConcreteProjectCalculator />
        </section>

        <section className="shell calculator-content">
          <article>
            <p className="eyebrow">Project-level accuracy</p>
            <h2>Aggregate physical volume before procurement rounding.</h2>
            <p>
              Each project part reuses a verified BuildNumbers geometry engine
              with zero local allowance. The project engine then sums those
              unrounded net volumes, applies one selected project allowance, and
              calculates one final complete-bag quantity.
            </p>
            <div className="formula-block">
              <span>Part aggregation</span>
              <code>Vnet = V1 + V2 + … + Vn</code>
              <span>Project allowance</span>
              <code>Vorder = Vnet × (1 + allowance ÷ 100)</code>
              <span>Final packages</span>
              <code>bags = ceil(Vorder ÷ bag yield)</code>
            </div>
            <p>
              This avoids the systematic over-count that can occur when each
              project section is rounded to complete bags before the volumes are combined.
            </p>
          </article>

          <aside className="formula-meta">
            <h3>Calculation record</h3>
            <dl>
              <div><dt>Engine version</dt><dd>{CONCRETE_PROJECT_ENGINE_VERSION}</dd></div>
              <div><dt>Formula version</dt><dd>{CONCRETE_PROJECT_FORMULA_VERSION}</dd></div>
              <div><dt>Last reviewed</dt><dd>August 28, 2026</dd></div>
              <div><dt>Supported parts</dt><dd>1–100</dd></div>
            </dl>
            <h3>Underlying references</h3>
            <a href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors" target="_blank" rel="noreferrer">
              NIST SP 811 — unit conversions <ArrowIcon />
            </a>
            <a href="https://www.sakrete.com/product/high-strength-concrete-mix/" target="_blank" rel="noreferrer">
              Sakrete — concrete mix yields <ArrowIcon />
            </a>
          </aside>
        </section>

        <section className="faq-section">
          <div className="shell">
            <div className="section-heading">
              <div><p className="eyebrow">Common questions</p><h2>Multi-shape concrete project FAQ</h2></div>
              <p>One project total without hiding geometry or rounding rules.</p>
            </div>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary>{faq.question}<span aria-hidden="true">+</span></summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="shell next-calculators">
          <div>
            <p className="eyebrow">Need one shape only?</p>
            <h2>Use a focused calculator when the project does not need aggregation.</h2>
          </div>
          <a className="next-card next-card-live" href="/concrete-calculator">
            <span>Live</span><strong>Rectangular Concrete Slab</strong><small>Single slab workflow</small>
          </a>
          <a className="next-card next-card-live" href="/projects">
            <span>Workspace</span><strong>Project Mode</strong><small>Combine saved material estimates</small>
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
