import type { Metadata } from "next";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { CalculatorWorkedExample } from "@/components/calculator-worked-example";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  POST_HOLE_ENGINE_VERSION,
  POST_HOLE_FORMULA_VERSION,
} from "@/lib/calculators/post-hole-concrete";
import { absoluteUrl } from "@/lib/site";
import { PostHoleConcreteCalculator } from "./post-hole-concrete-calculator";

export const metadata: Metadata = {
  title: "Post Hole Concrete Calculator — Bags & Volume",
  description:
    "Calculate concrete for round post holes in cubic feet, cubic yards, cubic meters, liters, and 40, 60, or 80 lb bags with optional post displacement.",
  alternates: {
    canonical: "/post-hole-concrete-calculator",
  },
  openGraph: {
    title: "Post Hole Concrete Calculator — Bags & Volume",
    description:
      "Estimate concrete volume and complete bag quantities for round post holes with optional round or square post displacement.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Post Hole Concrete Calculator — Bags & Volume",
    description:
      "Estimate post-hole concrete in cubic yards and complete 40, 60, or 80 lb bags.",
  },
};

const faqs = [
  {
    question: "How does the post hole concrete calculator work?",
    answer:
      "It treats each hole as a cylinder, multiplies the per-hole concrete volume by the number of holes, optionally subtracts a round or square post, applies your chosen allowance, and converts the result to cubic feet, cubic yards, cubic meters, liters, and complete bags.",
  },
  {
    question: "How many 80 lb bags are needed for a 12 inch diameter, 24 inch deep hole?",
    answer:
      "With no post displacement and no extra allowance, a 12 inch diameter hole with 24 inches of concrete depth is about 1.571 cubic feet. At a published yield of 0.60 cubic feet per 80 lb bag, that rounds up to 3 bags.",
  },
  {
    question: "Should I subtract the post volume?",
    answer:
      "Only if the selected post shape and size reasonably represent the volume that will actually occupy the concrete-filled depth. When enabled, this calculator assumes the post occupies the full entered concrete depth. Leave displacement off when that assumption does not match the project.",
  },
  {
    question: "Does this calculator tell me how deep or wide a post hole should be?",
    answer:
      "No. It only estimates material from dimensions you enter. Hole diameter, embedment depth, footing details, frost requirements, soil conditions, wind loads, and local code requirements must be determined separately for the project.",
  },
  {
    question: "Why is the bag count approximate?",
    answer:
      "Concrete mix yield varies by product. The calculator uses published Sakrete High-Strength Concrete Mix yields of 0.30, 0.45, and 0.60 cubic feet for 40, 60, and 80 lb bags. Confirm the selected product's current yield before purchase.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BuildMeasure Post Hole Concrete Calculator",
    url: absoluteUrl("/post-hole-concrete-calculator"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    description:
      "A post-hole concrete quantity calculator for round holes with optional post displacement and complete bag estimates.",
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
        name: "Post Hole Concrete Calculator",
        item: absoluteUrl("/post-hole-concrete-calculator"),
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

export default function PostHoleConcreteCalculatorPage() {
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
              <span>Post Hole Concrete Calculator</span>
            </nav>
            <div className="calculator-hero-grid">
              <div>
                <p className="eyebrow">Concrete tools</p>
                <h1>Post Hole Concrete Calculator — Bags &amp; Volume</h1>
                <p>
                  Enter the number of round holes, hole diameter, and concrete
                  depth to estimate total volume and complete 40, 60, or 80 lb
                  bags. Optionally subtract a round or square post.
                </p>
              </div>
              <ul>
                <li><CheckIcon /> Multiple holes</li>
                <li><CheckIcon /> Optional post displacement</li>
                <li><CheckIcon /> Metric &amp; imperial</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="shell calculator-main-section">
          <PostHoleConcreteCalculator />
        </section>

        <section className="shell calculator-content">
          <article>
            <p className="eyebrow">Transparent by design</p>
            <h2>Post-hole concrete formula</h2>
            <p>
              Each round hole is treated as a cylinder. The calculator finds the
              gross cylindrical volume first, then optionally subtracts the
              volume occupied by a round or square post before multiplying by the
              number of holes.
            </p>
            <div className="formula-block">
              <span>Gross hole volume</span>
              <code>V = π × (diameter ÷ 2)² × depth</code>
              <span>Total net concrete</span>
              <code>V<sub>net</sub> = (V − post displacement) × hole count</code>
              <span>Order volume</span>
              <code>V<sub>order</sub> = V<sub>net</sub> × (1 + allowance ÷ 100)</code>
            </div>
            <p>
              This formula estimates material only. It does not determine a safe
              hole diameter, embedment depth, footing design, reinforcement, or
              code requirement.
            </p>
          </article>
          <aside className="formula-meta">
            <h3>Calculation record</h3>
            <dl>
              <div><dt>Engine version</dt><dd>{POST_HOLE_ENGINE_VERSION}</dd></div>
              <div><dt>Formula version</dt><dd>{POST_HOLE_FORMULA_VERSION}</dd></div>
              <div><dt>Last reviewed</dt><dd>August 13, 2026</dd></div>
              <div><dt>Hole shape</dt><dd>Round cylinder</dd></div>
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
          title="One 12-inch hole with 24 inches of concrete depth"
          description="Use one round hole, no post displacement, 0% extra allowance, and the published 0.60 ft³ yield for an 80 lb bag. This controlled example verifies the cylinder formula independently of the interface defaults."
          steps={[
            { label: "Convert radius", value: "12 in diameter = 0.5 ft radius" },
            { label: "Convert depth", value: "24 in = 2 ft" },
            { label: "Find volume", value: "π × 0.5² × 2 = 1.5708 ft³" },
            { label: "Find complete bags", value: "1.5708 ÷ 0.60 = 2.618 → 3 bags" },
          ]}
          result="1.571 ft³ and 3 × 80 lb bags"
          verification="This example does not prescribe a hole size. It only verifies the quantity calculation for the dimensions shown."
        />

        <section className="faq-section">
          <div className="shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Common questions</p>
                <h2>Post-hole concrete calculator FAQ</h2>
              </div>
              <p>Material-estimating context without structural-design assumptions.</p>
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
            <h2>Use the right concrete geometry for the job.</h2>
          </div>
          <a className="next-card next-card-live" href="/guides/how-many-bags-of-concrete-for-post-holes">
            <span>Guide</span><strong>Concrete Bags for Post Holes</strong><small>Formula, examples &amp; bag yields</small>
          </a>
          <a className="next-card next-card-live" href="/concrete-calculator">
            <span>Live</span><strong>Concrete Slab Calculator</strong><small>Cubic yards &amp; bags</small>
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
