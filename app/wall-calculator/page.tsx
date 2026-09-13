import type { Metadata } from "next";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { CalculatorWorkedExample } from "@/components/calculator-worked-example";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  WALL_ENGINE_VERSION,
  WALL_FORMULA_VERSION,
} from "@/lib/calculators/wall";
import { absoluteUrl } from "@/lib/site";
import { WallCalculator } from "./wall-calculator";

export const metadata: Metadata = {
  title: "Concrete Wall Calculator — Volume, Openings & Bags",
  description:
    "Estimate concrete for rectangular walls from length, height, thickness, measured opening area, quantity, allowance, and complete 40, 60, or 80 lb bags.",
  alternates: { canonical: "/wall-calculator" },
  openGraph: {
    title: "Concrete Wall Calculator — Volume, Openings & Bags",
    description:
      "Calculate rectangular concrete wall quantity while subtracting measured openings before allowance and package rounding.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Concrete Wall Calculator",
    description:
      "Estimate rectangular wall concrete volume and complete bags from actual project dimensions.",
  },
};

const faqs = [
  {
    question: "How do I calculate concrete for a rectangular wall?",
    answer:
      "Multiply wall length by height to get gross face area, subtract measured full-depth opening area, multiply the remaining face area by wall thickness, then multiply by the number of identical walls.",
  },
  {
    question: "How should doors and windows be entered?",
    answer:
      "Add the measured face area of full-depth openings in one identical wall and enter that total as opening area. The calculator subtracts it before applying thickness, quantity, allowance, and package rounding.",
  },
  {
    question: "Does this calculator choose wall thickness or reinforcement?",
    answer:
      "No. It only calculates material quantity from dimensions you provide. Wall thickness, reinforcement, concrete strength, foundations, retaining-wall design, drainage, and code requirements are outside its scope.",
  },
  {
    question: "Should I round concrete bags for each wall separately?",
    answer:
      "No. BuildNumbers combines the unrounded concrete volume for identical walls first, applies the selected allowance, and rounds the final package quantity upward once.",
  },
  {
    question: "Can I use metric and imperial measurements?",
    answer:
      "Yes. Imperial uses feet for wall length and height, inches for thickness, and square feet for openings. Metric uses meters, centimeters, and square meters.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BuildNumbers Concrete Wall Calculator",
    url: absoluteUrl("/wall-calculator"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    description:
      "A rectangular concrete wall quantity calculator with measured opening-area subtraction.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Concrete Wall Calculator", item: absoluteUrl("/wall-calculator") },
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

export default function WallCalculatorPage() {
  return (
    <>
      <SiteHeader ctaHref="/#calculators" ctaLabel="All calculators" />
      <main className="calculator-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

        <section className="calculator-hero">
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <a href="/">Home</a><span aria-hidden="true">/</span><span>Concrete Wall Calculator</span>
            </nav>
            <div className="calculator-hero-grid">
              <div>
                <p className="eyebrow">Concrete tools</p>
                <h1>Concrete Wall Calculator — Volume, Openings &amp; Bags</h1>
                <p>
                  Enter actual wall length, height, thickness, measured opening area, and repeated-wall count to estimate concrete volume and complete bag quantities.
                </p>
              </div>
              <ul>
                <li><CheckIcon /> Measured opening subtraction</li>
                <li><CheckIcon /> Metric &amp; imperial inputs</li>
                <li><CheckIcon /> Final-project bag rounding</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="shell calculator-main-section"><WallCalculator /></section>

        <section className="shell calculator-content">
          <article>
            <p className="eyebrow">Transparent by design</p>
            <h2>Concrete wall volume formula</h2>
            <p>
              BuildNumbers calculates gross wall face area, subtracts the measured area of full-depth openings in each identical wall, and multiplies only the remaining face area by the entered concrete thickness.
            </p>
            <div className="formula-block">
              <span>Gross face area</span><code>A<sub>gross</sub> = length × height</code>
              <span>Net face area</span><code>A<sub>net</sub> = A<sub>gross</sub> − openings</code>
              <span>One wall</span><code>V = A<sub>net</sub> × thickness</code>
              <span>Order volume</span><code>V<sub>order</sub> = (V × quantity) × (1 + allowance ÷ 100)</code>
            </div>
            <p>
              The result is a material quantity only. Use dimensions, reinforcement, concrete strength, foundation details, and other requirements from the project design or another qualified source.
            </p>
          </article>
          <aside className="formula-meta">
            <h3>Calculation record</h3>
            <dl>
              <div><dt>Engine version</dt><dd>{WALL_ENGINE_VERSION}</dd></div>
              <div><dt>Formula version</dt><dd>{WALL_FORMULA_VERSION}</dd></div>
              <div><dt>Last reviewed</dt><dd>August 28, 2026</dd></div>
              <div><dt>Geometry</dt><dd>Rectangular prismatic wall</dd></div>
            </dl>
            <h3>Primary references</h3>
            <a href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors" target="_blank" rel="noreferrer">NIST SP 811 — unit conversions <ArrowIcon /></a>
            <a href="https://www.sakrete.com/product/high-strength-concrete-mix/" target="_blank" rel="noreferrer">Sakrete — concrete mix yields <ArrowIcon /></a>
          </aside>
        </section>

        <CalculatorWorkedExample
          title="10 ft × 8 ft × 6 in wall with 16 ft² of openings"
          description="This controlled quantity example demonstrates opening subtraction, allowance, and bag rounding. It is not a recommended structural wall size."
          steps={[
            { label: "Gross face area", value: "10 × 8 = 80 ft²" },
            { label: "Subtract openings", value: "80 − 16 = 64 ft²" },
            { label: "Net volume", value: "64 × 0.5 ft = 32 ft³" },
            { label: "Add 10%", value: "32 × 1.10 = 35.2 ft³" },
            { label: "80 lb bags", value: "35.2 ÷ 0.60 = 58.67 → 59" },
          ]}
          result="1.304 yd³ and 59 × 80 lb bags at 10% allowance"
          verification="Confirm the actual wall geometry, full-depth openings, structural design, concrete specification, and selected product yield before ordering."
        />

        <section className="faq-section">
          <div className="shell">
            <div className="section-heading">
              <div><p className="eyebrow">Common questions</p><h2>Concrete wall calculator FAQ</h2></div>
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
          <div><p className="eyebrow">Continue planning</p><h2>Use the matching concrete geometry for the next estimate.</h2></div>
          <a className="next-card next-card-live" href="/guides/how-much-concrete-for-walls"><span>Guide</span><strong>How Much Concrete for Walls?</strong><small>Openings &amp; volume workflow</small></a>
          <a className="next-card next-card-live" href="/column-calculator"><span>Live</span><strong>Column Concrete</strong><small>Rectangular &amp; circular columns</small></a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
