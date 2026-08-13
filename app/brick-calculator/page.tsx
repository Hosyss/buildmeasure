import type { Metadata } from "next";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { CalculatorWorkedExample } from "@/components/calculator-worked-example";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  BRICK_ENGINE_VERSION,
  BRICK_FORMULA_VERSION,
} from "@/lib/calculators/brick";
import { absoluteUrl } from "@/lib/site";
import { BrickCalculator } from "./brick-calculator";

export const metadata: Metadata = {
  title: "Brick Calculator — Wall Bricks, Openings & Waste",
  description:
    "Estimate fired-clay bricks for a rectangular wall from net wall area, BIA brick coverage rates, measured openings, and an explicit waste allowance.",
  alternates: {
    canonical: "/brick-calculator",
  },
  openGraph: {
    title: "Brick Calculator — Wall Bricks, Openings & Waste",
    description:
      "Estimate fired-clay brick quantity with BIA Table 4 coverage presets, custom supplier rates, openings subtraction, and explicit waste.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Brick Calculator — Wall Bricks, Openings & Waste",
    description:
      "Estimate fired-clay brick quantity from net wall area and a documented brick coverage rate.",
  },
};

const faqs = [
  {
    question: "How does the brick calculator estimate the number of bricks?",
    answer:
      "It calculates gross wall area, subtracts the measured area of openings, multiplies the net wall area by the selected brick coverage rate, applies the waste percentage you entered, and rounds the final purchase quantity upward to whole bricks.",
  },
  {
    question: "How many modular bricks are used per 100 square feet?",
    answer:
      "Brick Industry Association Technical Note 10 Table 4 lists 675 Modular bricks per 100 square feet for its running- or stack-bond wall-area estimating basis. That is 6.75 bricks per square foot before waste or breakage allowance.",
  },
  {
    question: "How much extra brick should I allow for waste and breakage?",
    answer:
      "BIA Technical Note 10 gives at least 5% as a general rule for brick breakage and waste and notes that project conditions or experience may justify a higher percentage. BuildMeasure defaults to 5% but keeps the allowance editable.",
  },
  {
    question: "Can I subtract doors and windows?",
    answer:
      "Yes. Enter the combined measured area of openings that will not receive brick. The calculator subtracts that area before applying the brick coverage rate and waste allowance.",
  },
  {
    question: "Does this calculator support English, Flemish, common, or other header bonds?",
    answer:
      "No. BIA Table 4 is based on running or stack bond, while header patterns require separate correction factors. This version does not apply those factors, so do not use its result unchanged for a bond pattern that incorporates headers.",
  },
  {
    question: "Can I use these presets for concrete brick?",
    answer:
      "Not as a verified BuildMeasure assumption. BIA states that its Technical Notes are based on fired-clay brick and should not be assumed to apply to concrete, fly-ash, or other non-clay brick products. Use a supplier-specific custom coverage rate only when it is appropriate for the exact product and project.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BuildMeasure Brick Calculator",
    url: absoluteUrl("/brick-calculator"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    description:
      "A fired-clay brick wall quantity calculator using net wall area, documented brick coverage rates, openings, and an explicit waste allowance.",
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
        name: "Brick Calculator",
        item: absoluteUrl("/brick-calculator"),
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

export default function BrickCalculatorPage() {
  return (
    <>
      <SiteHeader />
      <main className="calculator-page brick-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <section className="calculator-hero">
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <a href="/">Home</a>
              <span aria-hidden="true">/</span>
              <span>Brick Calculator</span>
            </nav>
            <div className="calculator-hero-grid">
              <div>
                <p className="eyebrow">Masonry quantity tools</p>
                <h1>Brick Calculator</h1>
                <p>
                  Estimate fired-clay bricks for one rectangular wall from
                  measured wall area, openings, a BIA or supplier coverage
                  rate, and the waste allowance you choose.
                </p>
              </div>
              <ul>
                <li><CheckIcon /> BIA coverage presets</li>
                <li><CheckIcon /> Doors &amp; windows subtraction</li>
                <li><CheckIcon /> Metric &amp; imperial</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="shell calculator-main-section">
          <BrickCalculator />
        </section>

        <section className="shell calculator-content">
          <article>
            <p className="eyebrow">Transparent by design</p>
            <h2>Brick wall quantity formula</h2>
            <p>
              BuildMeasure follows the Brick Industry Association wall-area
              estimating method: find net wall area first, then multiply by a
              known brick quantity per unit area. Waste and breakage are added
              only after the net quantity is known.
            </p>
            <div className="formula-block">
              <span>Gross wall area</span>
              <code>A<sub>gross</sub> = wall length × wall height</code>
              <span>Net wall area</span>
              <code>A<sub>net</sub> = A<sub>gross</sub> − measured openings</code>
              <span>Exact net brick</span>
              <code>N<sub>net</sub> = A<sub>net</sub> × brick coverage rate</code>
              <span>Bricks to order</span>
              <code>N<sub>order</sub> = ceil(N<sub>net</sub> × (1 + waste ÷ 100))</code>
            </div>
            <p>
              BIA Table 4 quantities are based on running or stack bond.
              Patterns that incorporate headers need separate correction
              factors, so this version deliberately does not claim support for
              English, Flemish, common, garden-wall, or other header bonds.
            </p>
          </article>

          <aside className="formula-meta">
            <h3>Calculation record</h3>
            <dl>
              <div><dt>Engine version</dt><dd>{BRICK_ENGINE_VERSION}</dd></div>
              <div><dt>Formula version</dt><dd>{BRICK_FORMULA_VERSION}</dd></div>
              <div><dt>Last reviewed</dt><dd>August 13, 2026</dd></div>
              <div><dt>Supported material</dt><dd>Fired-clay brick</dd></div>
              <div><dt>Bond basis</dt><dd>Running / stack</dd></div>
            </dl>
            <h3>Primary references</h3>
            <a href="https://www.gobrick.com/media/file/10-dimensioning-and-estimating-brick-masonry.pdf" target="_blank" rel="noreferrer">
              BIA Technical Note 10 — estimating <ArrowIcon />
            </a>
            <a href="https://www.gobrick.com/resources/technical-notes" target="_blank" rel="noreferrer">
              BIA Technical Notes — material scope <ArrowIcon />
            </a>
            <a href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors" target="_blank" rel="noreferrer">
              NIST SP 811 — unit conversions <ArrowIcon />
            </a>
          </aside>
        </section>

        <CalculatorWorkedExample
          title="A 20 ft × 8 ft wall with a 16 ft² opening"
          description="Use the BIA Modular coverage preset of 675 brick per 100 ft² and a 5% waste/breakage allowance. This example verifies area subtraction, coverage, allowance, and final whole-brick rounding."
          steps={[
            { label: "Find gross wall area", value: "20 × 8 = 160 ft²" },
            { label: "Subtract openings", value: "160 − 16 = 144 ft² net" },
            { label: "Apply Modular coverage", value: "144 × 6.75 = 972 net bricks" },
            { label: "Add 5% allowance", value: "ceil(972 × 1.05) = 1,021 bricks" },
          ]}
          result="Order 1,021 bricks"
          verification="BIA gives 675 Modular brick per 100 ft² in Table 4 and recommends at least 5% as a general breakage/waste rule. The dimensions here are a quantity example, not a wall-design recommendation."
        />

        <section className="faq-section">
          <div className="shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Common questions</p>
                <h2>Brick calculator FAQ</h2>
              </div>
              <p>Quantity assumptions kept separate from masonry design.</p>
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
          <a className="next-card next-card-live" href="/guides/material-estimating-basics">
            <span>Guide</span>
            <strong>Material Estimating Basics</strong>
            <small>Geometry, allowances &amp; product data</small>
          </a>
          <a className="next-card next-card-live" href="/concrete-calculator">
            <span>Live</span>
            <strong>Concrete Calculator</strong>
            <small>Slabs, cubic yards &amp; bags</small>
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
