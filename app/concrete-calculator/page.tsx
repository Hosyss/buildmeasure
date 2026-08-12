import type { Metadata } from "next";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { CalculatorWorkedExample } from "@/components/calculator-worked-example";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  CONCRETE_ENGINE_VERSION,
  CONCRETE_FORMULA_VERSION,
} from "@/lib/calculators/concrete";
import { absoluteUrl } from "@/lib/site";
import { ConcreteCalculator } from "./concrete-calculator";

export const metadata: Metadata = {
  title: "Concrete Calculator — Cubic Yards & Bags",
  description:
    "Calculate how much concrete you need for a rectangular slab in cubic yards, cubic feet, cubic meters, and 40, 60, or 80 lb bags with adjustable waste.",
  alternates: {
    canonical: "/concrete-calculator",
  },
  openGraph: {
    title: "Concrete Calculator — Cubic Yards & Bags",
    description:
      "Calculate slab concrete in cubic yards, cubic feet, cubic meters, and 40, 60, or 80 lb bags with adjustable waste.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Concrete Calculator — Cubic Yards & Bags",
    description:
      "Calculate slab concrete in cubic yards, cubic feet, cubic meters, and 40, 60, or 80 lb bags.",
  },
};

const faqs = [
  {
    question: "How does the concrete calculator work?",
    answer:
      "It multiplies length by width by thickness after converting every dimension to a consistent unit. It then adds your chosen waste allowance and converts the result to cubic yards, cubic meters, cubic feet, and liters.",
  },
  {
    question: "How much concrete do I need for a 10 × 10 slab at 4 inches thick?",
    answer:
      "A 10 ft × 10 ft slab at 4 inches thick is about 1.235 cubic yards before waste. With a 10% allowance it is about 1.358 cubic yards, or 62 complete 80 lb bags when the selected mix yields 0.60 cubic feet per bag.",
  },
  {
    question: "How much extra concrete should I order?",
    answer:
      "The calculator starts at 10%, but the correct allowance depends on subgrade accuracy, formwork, spillage, order increments, and site conditions. Adjust the percentage and confirm the final quantity with your supplier or project professional.",
  },
  {
    question: "Why is the bag count approximate?",
    answer:
      "Bag yield varies by product and the manufacturer's published yield is approximate. This calculator uses published Sakrete High-Strength Concrete Mix yields of 0.30, 0.45, and 0.60 cubic feet for 40, 60, and 80 lb bags respectively.",
  },
  {
    question: "Can I use metric measurements?",
    answer:
      "Yes. Select Metric to enter length and width in meters and thickness in centimeters. Switching systems converts the values already entered.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BuildMeasure Concrete Calculator",
    url: absoluteUrl("/concrete-calculator"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    description:
      "A concrete calculator for rectangular slabs that returns cubic yards, cubic feet, cubic meters, and complete bag quantities.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Concrete Calculator",
        item: absoluteUrl("/concrete-calculator"),
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  },
];

export default function ConcreteCalculatorPage() {
  return (
    <>
      <SiteHeader />
      <main className="calculator-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <section className="calculator-hero">
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <a href="/">Home</a>
              <span aria-hidden="true">/</span>
              <span>Concrete Calculator</span>
            </nav>
            <div className="calculator-hero-grid">
              <div>
                <p className="eyebrow">Concrete tools</p>
                <h1>Concrete Calculator — Cubic Yards &amp; Bags</h1>
                <p>
                  Enter slab length, width, and thickness to calculate how much
                  concrete you need in cubic yards, cubic meters, and complete
                  40, 60, or 80 lb bags.
                </p>
              </div>
              <ul>
                <li><CheckIcon /> Instant conversion</li>
                <li><CheckIcon /> Referenced units</li>
                <li><CheckIcon /> Adjustable waste</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="shell calculator-main-section">
          <ConcreteCalculator />
        </section>

        <section className="shell calculator-content">
          <article>
            <p className="eyebrow">Transparent by design</p>
            <h2>Concrete slab formula</h2>
            <p>
              A rectangular slab is a rectangular prism. Its net volume is
              calculated by multiplying length, width, and thickness after all
              three measurements have been converted to the same unit.
            </p>
            <div className="formula-block">
              <span>Net volume</span>
              <code>V = length × width × thickness</code>
              <span>Order volume</span>
              <code>V<sub>order</sub> = V × (1 + waste ÷ 100)</code>
            </div>
            <p>
              For imperial results, 27 cubic feet equals 1 cubic yard. Metric
              calculations use cubic meters, where 1 cubic meter equals 1,000
              liters.
            </p>
          </article>
          <aside className="formula-meta">
            <h3>Calculation record</h3>
            <dl>
              <div><dt>Engine version</dt><dd>{CONCRETE_ENGINE_VERSION}</dd></div>
              <div><dt>Formula version</dt><dd>{CONCRETE_FORMULA_VERSION}</dd></div>
              <div><dt>Last reviewed</dt><dd>July 31, 2026</dd></div>
              <div><dt>Shape</dt><dd>Rectangular slab</dd></div>
            </dl>
            <h3>Primary references</h3>
            <a href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors" target="_blank" rel="noreferrer">
              NIST SP 811 — unit conversions <ArrowIcon />
            </a>
            <a href="https://www.nist.gov/document/2026-nist-handbook-44-appendix-c" target="_blank" rel="noreferrer">
              NIST Handbook 44 — volume units <ArrowIcon />
            </a>
            <a href="https://www.sakrete.com/product/high-strength-concrete-mix/" target="_blank" rel="noreferrer">
              Sakrete — concrete mix yields <ArrowIcon />
            </a>
          </aside>
        </section>

        <CalculatorWorkedExample
          title="A slab that equals exactly one cubic yard"
          description="Use a 9 ft × 9 ft slab at 4 in thick, 0% waste, and the published 0.60 ft³ yield for an 80 lb bag. This is the independent reference vector used in the test suite."
          steps={[
            { label: "Convert the thickness", value: "4 in ÷ 12 = 0.333333 ft" },
            { label: "Find cubic feet", value: "9 × 9 × 0.333333 = 27 ft³" },
            { label: "Convert to cubic yards", value: "27 ft³ ÷ 27 = 1 yd³" },
            { label: "Find complete bags", value: "27 ft³ ÷ 0.60 ft³ = 45 bags" },
          ]}
          result="1 yd³ and 45 × 80 lb bags"
          verification="No waste is included in this controlled example. Add the project-specific allowance only after verifying the formed dimensions."
        />

        <section className="faq-section">
          <div className="shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Common questions</p>
                <h2>Concrete calculator FAQ</h2>
              </div>
              <p>Practical context for using the estimate responsibly.</p>
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
            <p className="eyebrow">Continue planning</p>
            <h2>Calculate, then verify the purchase plan.</h2>
          </div>
          <a className="next-card next-card-live" href="/guides/how-many-bags-of-concrete">
            <span>Guide</span><strong>How Much Concrete for a Slab?</strong><small>Yards, bags &amp; examples</small>
          </a>
          <a className="next-card next-card-live" href="/paint-calculator">
            <span>Live</span><strong>Paint Calculator</strong><small>Walls, coats &amp; cans</small>
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
