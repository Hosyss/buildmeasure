import type { Metadata } from "next";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { CalculatorWorkedExample } from "@/components/calculator-worked-example";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  FOOTING_ENGINE_VERSION,
  FOOTING_FORMULA_VERSION,
} from "@/lib/calculators/footing";
import { absoluteUrl } from "@/lib/site";
import { FootingCalculator } from "./footing-calculator";

export const metadata: Metadata = {
  title: "Footing Concrete Calculator — Volume & Bags",
  description:
    "Estimate concrete for identical rectangular footings in cubic yards, cubic meters, and complete 40, 60, or 80 lb bags with an adjustable allowance.",
  alternates: { canonical: "/footing-calculator" },
  openGraph: {
    title: "Footing Concrete Calculator — Volume & Bags",
    description:
      "Calculate concrete quantity for rectangular footings without prescribing structural footing dimensions.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Footing Concrete Calculator — Volume & Bags",
    description:
      "Estimate rectangular footing concrete in yards, meters, and complete bags.",
  },
};

const faqs = [
  {
    question: "How do I calculate concrete for a rectangular footing?",
    answer:
      "Multiply the entered footing length, width, and concrete depth after converting them to a consistent unit. Multiply that volume by the number of identical footings, then apply your chosen extra allowance.",
  },
  {
    question: "Does this calculator tell me how wide or deep a footing should be?",
    answer:
      "No. BuildNumbers only calculates quantity from dimensions you provide. Footing size, reinforcement, bearing requirements, frost depth, concrete strength, and code compliance must come from the project design and applicable requirements.",
  },
  {
    question: "How are concrete bags rounded?",
    answer:
      "The calculator totals the concrete for all identical footings first, applies the allowance, then divides by the selected manufacturer-published bag yield and rounds the final purchase quantity up to a whole bag.",
  },
  {
    question: "Can I calculate more than one footing at once?",
    answer:
      "Yes. Enter the number of identical rectangular footings. If footings have different dimensions, calculate each size separately rather than averaging them.",
  },
  {
    question: "Can I use metric dimensions?",
    answer:
      "Yes. Metric mode uses meters for footing length and width and centimeters for concrete depth. Switching measurement systems converts the values already entered.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BuildNumbers Footing Concrete Calculator",
    url: absoluteUrl("/footing-calculator"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    description:
      "A quantity calculator for one or more identical rectangular concrete footings.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Footing Calculator", item: absoluteUrl("/footing-calculator") },
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

export default function FootingCalculatorPage() {
  return (
    <>
      <SiteHeader ctaHref="/#calculators" ctaLabel="All calculators" />
      <main className="calculator-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

        <section className="calculator-hero">
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <a href="/">Home</a><span aria-hidden="true">/</span><span>Footing Calculator</span>
            </nav>
            <div className="calculator-hero-grid">
              <div>
                <p className="eyebrow">Concrete tools</p>
                <h1>Footing Concrete Calculator — Volume &amp; Bags</h1>
                <p>
                  Enter the actual formed dimensions for one or more identical rectangular footings to estimate concrete volume and complete bag quantities.
                </p>
              </div>
              <ul>
                <li><CheckIcon /> Multiple identical footings</li>
                <li><CheckIcon /> Metric &amp; imperial inputs</li>
                <li><CheckIcon /> Final-project bag rounding</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="shell calculator-main-section"><FootingCalculator /></section>

        <section className="shell calculator-content">
          <article>
            <p className="eyebrow">Transparent by design</p>
            <h2>Rectangular footing concrete formula</h2>
            <p>
              Each rectangular footing is treated as a rectangular prism. BuildNumbers calculates one footing from the entered dimensions, multiplies by the quantity of identical footings, and applies the extra allowance only after the net total is known.
            </p>
            <div className="formula-block">
              <span>Per footing</span><code>V = length × width × depth</code>
              <span>Total net</span><code>V<sub>net</sub> = V × quantity</code>
              <span>Order volume</span><code>V<sub>order</sub> = V<sub>net</sub> × (1 + allowance ÷ 100)</code>
            </div>
            <p>
              The result is a material quantity, not a structural design. Use dimensions from the project plans or other qualified design source.
            </p>
          </article>
          <aside className="formula-meta">
            <h3>Calculation record</h3>
            <dl>
              <div><dt>Engine version</dt><dd>{FOOTING_ENGINE_VERSION}</dd></div>
              <div><dt>Formula version</dt><dd>{FOOTING_FORMULA_VERSION}</dd></div>
              <div><dt>Last reviewed</dt><dd>August 28, 2026</dd></div>
              <div><dt>Shape</dt><dd>Rectangular footing</dd></div>
            </dl>
            <h3>Primary references</h3>
            <a href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors" target="_blank" rel="noreferrer">NIST SP 811 — unit conversions <ArrowIcon /></a>
            <a href="https://www.sakrete.com/product/high-strength-concrete-mix/" target="_blank" rel="noreferrer">Sakrete — concrete mix yields <ArrowIcon /></a>
          </aside>
        </section>

        <CalculatorWorkedExample
          title="Three identical 10 ft × 2 ft × 8 in footings"
          description="This controlled quantity example demonstrates why BuildNumbers totals all identical footings before rounding complete bags. It is not a recommended footing size."
          steps={[
            { label: "One footing", value: "10 × 2 × (8 ÷ 12) = 13.333 ft³" },
            { label: "Three footings", value: "13.333 × 3 = 40 ft³" },
            { label: "Convert to yards", value: "40 ÷ 27 = 1.481 yd³" },
            { label: "80 lb bags", value: "40 ÷ 0.60 = 66.667; round up once" },
          ]}
          result="1.481 yd³ and 67 × 80 lb bags at 0% allowance"
          verification="Confirm the actual project dimensions and selected product yield before ordering."
        />

        <section className="faq-section">
          <div className="shell">
            <div className="section-heading">
              <div><p className="eyebrow">Common questions</p><h2>Footing concrete calculator FAQ</h2></div>
              <p>Quantity guidance without hidden structural assumptions.</p>
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
          <div><p className="eyebrow">Continue planning</p><h2>Use the right geometry for the next estimate.</h2></div>
          <a className="next-card next-card-live" href="/guides/how-much-concrete-for-footings"><span>Guide</span><strong>How Much Concrete for Footings?</strong><small>Formula, bags &amp; scope limits</small></a>
          <a className="next-card next-card-live" href="/post-hole-concrete-calculator"><span>Live</span><strong>Post Hole Concrete</strong><small>Round holes &amp; post displacement</small></a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
