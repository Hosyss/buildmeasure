import type { Metadata } from "next";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { CalculatorWorkedExample } from "@/components/calculator-worked-example";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  GRAVEL_ENGINE_VERSION,
  GRAVEL_FORMULA_VERSION,
} from "@/lib/calculators/gravel";
import { absoluteUrl } from "@/lib/site";
import { GravelCalculator } from "./gravel-calculator";

export const metadata: Metadata = {
  title: "Gravel Calculator — Cubic Yards, Tons & Bags",
  description:
    "Calculate gravel for driveways, paths, and base layers in cubic yards, estimated tons, metric tonnes, and bags with adjustable depth, density, and allowance.",
  alternates: {
    canonical: "/gravel-calculator",
  },
  openGraph: {
    title: "Gravel Calculator — Cubic Yards, Tons & Bags",
    description:
      "Estimate gravel for driveways and paths in cubic yards, tons, and bags with transparent density and allowance assumptions.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Gravel Calculator — Cubic Yards, Tons & Bags",
    description:
      "Estimate gravel for driveways and paths in cubic yards, tons, and bags with transparent density and allowance assumptions.",
  },
};

const faqs = [
  {
    question: "How does the gravel calculator find volume?",
    answer:
      "It converts length, width, and placed depth to a consistent unit, multiplies them to find the rectangular layer volume, then applies the project allowance you selected.",
  },
  {
    question: "Why can I change gravel density?",
    answer:
      "Gravel bulk density changes with stone type, grading, moisture, voids, and whether the material is loose or compacted. A fixed universal density would create false precision, so JobsiteQuant exposes the value and lets you replace the planning example with supplier or test data.",
  },
  {
    question: "Should I use loose or compacted bulk density?",
    answer:
      "Use a density that matches the volume state you are estimating. ASTM C29/C29M distinguishes loose and compacted aggregate bulk density. Ask the supplier which condition their value represents and whether delivered volume already accounts for compaction.",
  },
  {
    question: "What should the project allowance include?",
    answer:
      "Use it only for project-specific needs such as installation loss, an uneven base, or a known compaction allowance. The calculator does not hide or automatically choose a compaction factor.",
  },
  {
    question: "Are the tonnage and bag results exact?",
    answer:
      "The geometry follows the entered measurements, but mass depends on the selected bulk density. Bag count also depends on the exact packaged weight. Confirm both values and supplier delivery increments before purchasing.",
  },
  {
    question: "Can I use metric measurements?",
    answer:
      "Yes. Metric mode uses meters for length and width, centimeters for depth, kilograms per cubic meter for density, and kilograms for bag weight. Switching systems converts the values already entered.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "JobsiteQuant Gravel Calculator",
    url: absoluteUrl("/gravel-calculator"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    description:
      "A gravel calculator for driveways, paths, and base layers with cubic yards, estimated mass, tons, and complete bags.",
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
        name: "Gravel Calculator",
        item: absoluteUrl("/gravel-calculator"),
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

export default function GravelCalculatorPage() {
  return (
    <>
      <SiteHeader ctaHref="/#calculators" ctaLabel="All calculators" />
      <main className="calculator-page gravel-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <section className="calculator-hero gravel-calculator-hero">
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <a href="/">Home</a>
              <span aria-hidden="true">/</span>
              <span>Gravel Calculator</span>
            </nav>
            <div className="calculator-hero-grid">
              <div>
                <p className="eyebrow">Landscaping &amp; base layers</p>
                <h1>Gravel Calculator</h1>
                <p>
                  Estimate gravel for driveways, paths, and base layers in cubic yards,
                  weight, tons, and bags without hiding the density assumption.
                </p>
              </div>
              <ul>
                <li><CheckIcon /> Metric &amp; imperial</li>
                <li><CheckIcon /> Adjustable bulk density</li>
                <li><CheckIcon /> Visible project allowance</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="shell calculator-main-section">
          <GravelCalculator />
        </section>

        <section className="shell calculator-content">
          <article>
            <p className="eyebrow">Transparent by design</p>
            <h2>Gravel volume and weight formula</h2>
            <p>
              A rectangular gravel layer is a rectangular prism. JobsiteQuant
              keeps geometry separate from the material-density assumption so
              you can inspect exactly where volume ends and estimated weight begins.
            </p>
            <div className="formula-block">
              <span>Net volume</span>
              <code>V = length × width × depth</code>
              <span>Order volume</span>
              <code>V<sub>order</sub> = V × (1 + allowance ÷ 100)</code>
              <span>Estimated mass</span>
              <code>M = V<sub>order</sub> × bulk density</code>
              <span>Complete bags</span>
              <code>Bags = ceil(M ÷ bag weight)</code>
            </div>
            <p>
              The default `93 lb/ft³` value is only a dry planning example from
              USACE HEC-HMS documentation. Replace it with the loose or compacted
              bulk density for the actual aggregate whenever that value is available.
            </p>
          </article>
          <aside className="formula-meta">
            <h3>Calculation record</h3>
            <dl>
              <div><dt>Engine version</dt><dd>{GRAVEL_ENGINE_VERSION}</dd></div>
              <div><dt>Formula version</dt><dd>{GRAVEL_FORMULA_VERSION}</dd></div>
              <div><dt>Last reviewed</dt><dd>August 1, 2026</dd></div>
              <div><dt>Shape</dt><dd>Rectangular layer</dd></div>
            </dl>
            <h3>Primary references</h3>
            <a href="https://store.astm.org/c0029_c0029m-23.html" target="_blank" rel="noreferrer">
              ASTM C29/C29M-23 — bulk density <ArrowIcon />
            </a>
            <a href="https://www.hec.usace.army.mil/confluence/hmsdocs/hmsum/4.11/erosion-and-sediment-transport/watershed-sediment-properties" target="_blank" rel="noreferrer">
              USACE HEC-HMS — dry density example <ArrowIcon />
            </a>
            <a href="https://www.nist.gov/document/2026-nist-handbook-44-appendix-c" target="_blank" rel="noreferrer">
              NIST Handbook 44 — unit conversions <ArrowIcon />
            </a>
          </aside>
        </section>

        <CalculatorWorkedExample
          title="A 10 ft × 10 ft gravel layer"
          description="Use a 4 in installed depth, 10% project allowance, 93 lb/ft³ planning density, and 50 lb bags. Density remains an adjustable material assumption."
          steps={[
            { label: "Find net volume", value: "10 × 10 × (4 ÷ 12) = 33.333 ft³" },
            { label: "Add 10% allowance", value: "33.333 × 1.10 = 36.667 ft³ = 1.358 yd³" },
            { label: "Estimate mass", value: "36.667 × 93 = 3,410 lb" },
            { label: "Round complete bags", value: "ceil(3,410 ÷ 50) = 69 bags" },
          ]}
          result="1.358 yd³; 3,410 lb; 69 × 50 lb bags"
          verification="Changing density changes mass and bags, not geometric volume. Confirm loose or compacted density with the supplier."
        />

        <section className="faq-section">
          <div className="shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Common questions</p>
                <h2>Gravel calculator FAQ</h2>
              </div>
              <p>Volume is geometric; tonnage depends on the material.</p>
            </div>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary>
                    {faq.question}<span aria-hidden="true">+</span>
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="shell next-calculators">
          <div>
            <p className="eyebrow">Continue planning</p>
            <h2>Estimate the next material.</h2>
          </div>
          <a className="next-card next-card-live" href="/guides/how-much-gravel-do-i-need">
            <span>Guide</span>
            <strong>How Much Gravel Do I Need?</strong>
            <small>Cubic yards, tons &amp; bags</small>
          </a>
          <a className="next-card next-card-live" href="/tile-calculator">
            <span>Live</span>
            <strong>Tile Calculator</strong>
            <small>Tiles, boxes &amp; waste</small>
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
