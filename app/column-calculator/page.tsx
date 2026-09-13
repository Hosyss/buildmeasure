import type { Metadata } from "next";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { CalculatorWorkedExample } from "@/components/calculator-worked-example";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  COLUMN_ENGINE_VERSION,
  COLUMN_FORMULA_VERSION,
} from "@/lib/calculators/column";
import { absoluteUrl } from "@/lib/site";
import { ColumnCalculator } from "./column-calculator";

export const metadata: Metadata = {
  title: "Column Concrete Calculator — Square, Rectangular & Circular",
  description:
    "Estimate concrete for identical square, rectangular, or circular columns in cubic yards, cubic meters, and complete 40, 60, or 80 lb bags.",
  alternates: { canonical: "/column-calculator" },
  openGraph: {
    title: "Column Concrete Calculator — Square, Rectangular & Circular",
    description:
      "Calculate concrete quantity for rectangular or circular columns without prescribing structural dimensions.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Column Concrete Calculator",
    description:
      "Estimate concrete volume and bags for rectangular or circular columns.",
  },
};

const faqs = [
  {
    question: "How do I calculate concrete for a rectangular column?",
    answer:
      "Multiply the column width by its depth to get cross-sectional area, then multiply by the concrete height. For multiple identical columns, multiply that volume by the quantity before applying your extra allowance.",
  },
  {
    question: "How do I calculate concrete for a circular column?",
    answer:
      "Use the circular cross-section area π × radius squared, then multiply by the concrete height. BuildNumbers converts the entered diameter to radius internally and totals all identical columns before package rounding.",
  },
  {
    question: "Does this calculator choose column size or reinforcement?",
    answer:
      "No. It only calculates material quantity from dimensions you provide. Structural dimensions, reinforcement, concrete strength, load capacity, connections, and code compliance must come from the project design and applicable requirements.",
  },
  {
    question: "How are concrete bags rounded?",
    answer:
      "The calculator totals all identical columns, applies the selected extra allowance, divides by the selected manufacturer-published bag yield, and rounds the final purchase quantity up once.",
  },
  {
    question: "Can I switch between metric and imperial measurements?",
    answer:
      "Yes. Height uses feet or meters while cross-section dimensions use inches or centimeters. Switching systems converts the dimensions already entered.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BuildNumbers Column Concrete Calculator",
    url: absoluteUrl("/column-calculator"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    description:
      "A quantity calculator for identical rectangular, square, or circular concrete columns.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Column Calculator", item: absoluteUrl("/column-calculator") },
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

export default function ColumnCalculatorPage() {
  return (
    <>
      <SiteHeader ctaHref="/#calculators" ctaLabel="All calculators" />
      <main className="calculator-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

        <section className="calculator-hero">
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <a href="/">Home</a><span aria-hidden="true">/</span><span>Column Calculator</span>
            </nav>
            <div className="calculator-hero-grid">
              <div>
                <p className="eyebrow">Concrete tools</p>
                <h1>Column Concrete Calculator — Square, Rectangular &amp; Circular</h1>
                <p>
                  Enter the actual concrete height and cross-section for one or more identical columns to estimate volume and complete bag quantities.
                </p>
              </div>
              <ul>
                <li><CheckIcon /> Rectangular &amp; circular columns</li>
                <li><CheckIcon /> Metric &amp; imperial inputs</li>
                <li><CheckIcon /> Final-project bag rounding</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="shell calculator-main-section"><ColumnCalculator /></section>

        <section className="shell calculator-content">
          <article>
            <p className="eyebrow">Transparent by design</p>
            <h2>Column concrete formulas</h2>
            <p>
              BuildNumbers first calculates the cross-sectional area, then multiplies by the entered concrete height. Identical columns are combined before the extra allowance and final bag rounding are applied.
            </p>
            <div className="formula-block">
              <span>Rectangular section</span><code>A = width × depth</code>
              <span>Circular section</span><code>A = π × (diameter ÷ 2)²</code>
              <span>Per column</span><code>V = A × height</code>
              <span>Order volume</span><code>V<sub>order</sub> = (V × quantity) × (1 + allowance ÷ 100)</code>
            </div>
            <p>
              The result is a material quantity only. Use dimensions and concrete requirements from the project plans or another qualified design source.
            </p>
          </article>
          <aside className="formula-meta">
            <h3>Calculation record</h3>
            <dl>
              <div><dt>Engine version</dt><dd>{COLUMN_ENGINE_VERSION}</dd></div>
              <div><dt>Formula version</dt><dd>{COLUMN_FORMULA_VERSION}</dd></div>
              <div><dt>Last reviewed</dt><dd>August 28, 2026</dd></div>
              <div><dt>Shapes</dt><dd>Rectangular / circular</dd></div>
            </dl>
            <h3>Primary references</h3>
            <a href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors" target="_blank" rel="noreferrer">NIST SP 811 — unit conversions <ArrowIcon /></a>
            <a href="https://www.sakrete.com/product/high-strength-concrete-mix/" target="_blank" rel="noreferrer">Sakrete — concrete mix yields <ArrowIcon /></a>
          </aside>
        </section>

        <CalculatorWorkedExample
          title="Three 12 in × 12 in × 10 ft columns"
          description="This controlled quantity example demonstrates total-project allowance and bag rounding. It is not a recommended structural column size."
          steps={[
            { label: "One column", value: "1 ft × 1 ft × 10 ft = 10 ft³" },
            { label: "Three columns", value: "10 × 3 = 30 ft³" },
            { label: "Add 10%", value: "30 × 1.10 = 33 ft³" },
            { label: "80 lb bags", value: "33 ÷ 0.60 = 55" },
          ]}
          result="1.222 yd³ and 55 × 80 lb bags at 10% allowance"
          verification="Confirm the actual structural dimensions, concrete specification, and selected product yield before ordering."
        />

        <section className="faq-section">
          <div className="shell">
            <div className="section-heading">
              <div><p className="eyebrow">Common questions</p><h2>Column concrete calculator FAQ</h2></div>
              <p>Material quantity without hidden structural assumptions.</p>
            </div>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="shell next-calculators">
          <div><p className="eyebrow">Continue planning</p><h2>Use the right concrete geometry for the next estimate.</h2></div>
          <a className="next-card next-card-live" href="/guides/how-much-concrete-for-columns"><span>Guide</span><strong>How Much Concrete for Columns?</strong><small>Rectangular &amp; circular formulas</small></a>
          <a className="next-card next-card-live" href="/footing-calculator"><span>Live</span><strong>Footing Concrete</strong><small>Rectangular foundations</small></a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
