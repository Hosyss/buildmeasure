import type { Metadata } from "next";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { CalculatorWorkedExample } from "@/components/calculator-worked-example";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  CIRCULAR_SLAB_ENGINE_VERSION,
  CIRCULAR_SLAB_FORMULA_VERSION,
} from "@/lib/calculators/circular-slab";
import { absoluteUrl } from "@/lib/site";
import { CircularSlabCalculator } from "./circular-slab-calculator";

export const metadata: Metadata = {
  title: "Circular Slab Concrete Calculator — Volume & Bags",
  description:
    "Estimate concrete for circular slabs and pads from diameter and depth, including multiple identical pours, cubic yards, metric volume, and complete bags.",
  alternates: { canonical: "/circular-slab-calculator" },
  openGraph: {
    title: "Circular Slab Concrete Calculator — Volume & Bags",
    description:
      "Calculate circular concrete slab quantity from actual diameter and depth without structural sizing assumptions.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Circular Slab Concrete Calculator — Volume & Bags",
    description: "Estimate circular concrete volume in yards, meters, and complete bags.",
  },
};

const faqs = [
  {
    question: "How do I calculate concrete for a circular slab?",
    answer:
      "Divide the diameter by two to get radius, calculate circle area as pi times radius squared, then multiply by the concrete depth. For identical slabs, multiply the unrounded volume by the quantity before allowance and package rounding.",
  },
  {
    question: "Does this calculator choose the slab thickness?",
    answer:
      "No. BuildNumbers calculates quantity from dimensions you provide. Thickness, reinforcement, concrete strength, subbase, edge details, joints, loads, frost protection, drainage, and code requirements must come from project information and applicable requirements.",
  },
  {
    question: "Can I calculate several identical circular pads at once?",
    answer:
      "Yes. Enter the number of identical circular slabs or pads. BuildNumbers combines their unrounded concrete volume first and rounds the final bag quantity only once.",
  },
  {
    question: "Can I use metric dimensions?",
    answer:
      "Yes. Metric mode uses meters for diameter and centimeters for concrete depth. Switching systems converts the values already entered.",
  },
  {
    question: "How are concrete bags calculated?",
    answer:
      "The allowance-adjusted total is divided by the selected approximate manufacturer-published bag yield, then rounded upward to a complete bag. Verify the exact product yield before purchase.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BuildNumbers Circular Slab Concrete Calculator",
    url: absoluteUrl("/circular-slab-calculator"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    description: "A concrete quantity calculator for one or more identical full circular slabs or pads.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Circular Slab Calculator", item: absoluteUrl("/circular-slab-calculator") },
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

export default function CircularSlabCalculatorPage() {
  return (
    <>
      <SiteHeader ctaHref="/#calculators" ctaLabel="All calculators" />
      <main className="calculator-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

        <section className="calculator-hero">
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <a href="/">Home</a><span aria-hidden="true">/</span><span>Circular Slab Calculator</span>
            </nav>
            <div className="calculator-hero-grid">
              <div>
                <p className="eyebrow">Concrete tools</p>
                <h1>Circular Slab Concrete Calculator — Volume &amp; Bags</h1>
                <p>
                  Enter the actual diameter and concrete depth for one or more identical circular slabs or pads to estimate volume and complete bag quantities.
                </p>
              </div>
              <ul>
                <li><CheckIcon /> Diameter-based circle geometry</li>
                <li><CheckIcon /> Metric &amp; imperial inputs</li>
                <li><CheckIcon /> Final-project bag rounding</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="shell calculator-main-section"><CircularSlabCalculator /></section>

        <section className="shell calculator-content">
          <article>
            <p className="eyebrow">Transparent by design</p>
            <h2>Circular slab concrete formula</h2>
            <p>
              BuildNumbers converts the entered diameter to radius, calculates the full circle area, then multiplies by the entered concrete depth. Identical pours are combined before allowance and package rounding.
            </p>
            <div className="formula-block">
              <span>Radius</span><code>r = diameter ÷ 2</code>
              <span>Plan area</span><code>A = π × r²</code>
              <span>One slab</span><code>V = A × depth</code>
              <span>Order volume</span><code>V<sub>order</sub> = (V × quantity) × (1 + allowance ÷ 100)</code>
            </div>
            <p>
              This is a material quantity calculation only. It does not determine structural slab thickness, reinforcement, subbase, edge conditions, or load capacity.
            </p>
          </article>
          <aside className="formula-meta">
            <h3>Calculation record</h3>
            <dl>
              <div><dt>Engine version</dt><dd>{CIRCULAR_SLAB_ENGINE_VERSION}</dd></div>
              <div><dt>Formula version</dt><dd>{CIRCULAR_SLAB_FORMULA_VERSION}</dd></div>
              <div><dt>Last reviewed</dt><dd>August 28, 2026</dd></div>
              <div><dt>Geometry</dt><dd>Full circular slab</dd></div>
            </dl>
            <h3>Primary references</h3>
            <a href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors" target="_blank" rel="noreferrer">NIST SP 811 — unit conversions <ArrowIcon /></a>
            <a href="https://www.sakrete.com/product/high-strength-concrete-mix/" target="_blank" rel="noreferrer">Sakrete — concrete mix yields <ArrowIcon /></a>
          </aside>
        </section>

        <CalculatorWorkedExample
          title="One 12 ft diameter × 4 in circular slab"
          description="This controlled arithmetic example demonstrates circle geometry and final bag rounding. It is not a recommended slab thickness or design."
          steps={[
            { label: "Radius", value: "12 ÷ 2 = 6 ft" },
            { label: "Circle area", value: "π × 6² = 113.097 ft²" },
            { label: "Concrete volume", value: "113.097 × (4 ÷ 12) = 37.699 ft³" },
            { label: "80 lb bags", value: "37.699 ÷ 0.60 = 62.832; round up once" },
          ]}
          result="1.396 yd³ and 63 × 80 lb bags at 0% allowance"
          verification="Confirm the actual project diameter, depth, structural requirements, and selected product yield before ordering."
        />

        <section className="faq-section">
          <div className="shell">
            <div className="section-heading">
              <div><p className="eyebrow">Common questions</p><h2>Circular slab concrete calculator FAQ</h2></div>
              <p>Circle quantity guidance without hidden structural assumptions.</p>
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
          <div><p className="eyebrow">Continue planning</p><h2>Use the geometry that matches the pour.</h2></div>
          <a className="next-card next-card-live" href="/guides/how-much-concrete-for-circular-slabs"><span>Guide</span><strong>How Much Concrete for Circular Slabs?</strong><small>Diameter, depth &amp; bags</small></a>
          <a className="next-card next-card-live" href="/concrete-calculator"><span>Live</span><strong>Rectangular Slab Concrete</strong><small>Length × width × depth</small></a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
