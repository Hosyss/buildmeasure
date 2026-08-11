import type { Metadata } from "next";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { CalculatorWorkedExample } from "@/components/calculator-worked-example";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  PAINT_ENGINE_VERSION,
  PAINT_FORMULA_VERSION,
} from "@/lib/calculators/paint";
import { absoluteUrl } from "@/lib/site";
import { PaintCalculator } from "./paint-calculator";

export const metadata: Metadata = {
  title: "Paint Calculator — Walls, Ceilings, Coats & Cans",
  description:
    "Calculate interior wall and ceiling paint from room dimensions, openings, coats, product coverage, and container size in imperial or metric units.",
  alternates: {
    canonical: "/paint-calculator",
  },
  openGraph: {
    title: "Paint Calculator — Walls, Ceilings, Coats & Cans",
    description:
      "Estimate paintable area, gallons, liters, and cans with adjustable product coverage.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Paint Calculator — Walls, Ceilings, Coats & Cans",
    description:
      "Estimate paintable area, gallons, liters, and cans with adjustable product coverage.",
  },
};

const faqs = [
  {
    question: "How does the paint calculator find wall area?",
    answer:
      "For a rectangular room, it multiplies the room perimeter—two times length plus width—by wall height. It adds the ceiling if selected, then subtracts the combined measured area of doors and windows.",
  },
  {
    question: "How much area does one gallon of paint cover?",
    answer:
      "Sherwin-Williams says a gallon typically covers about 350 to 400 square feet, but coverage changes with the product, texture, porosity, and application method. BuildMeasure starts at 400 square feet per gallon and lets you replace it with the value on your product label.",
  },
  {
    question: "Should doors and windows be subtracted?",
    answer:
      "Large openings that will not be painted can be subtracted. Measure and combine their area instead of relying on a standard door or window size.",
  },
  {
    question: "Does the estimate include multiple coats?",
    answer:
      "Yes. Paintable area is multiplied by the selected number of coats before it is divided by product coverage.",
  },
  {
    question: "Why does the calculator add an extra allowance?",
    answer:
      "The optional allowance helps account for surface texture, paint retained by tools, small losses, and future touch-ups. It is adjustable from 0% to 25%.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BuildMeasure Paint Calculator",
    url: absoluteUrl("/paint-calculator"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    description:
      "An interior room calculator for estimating paintable area, paint volume, and container count.",
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
        name: "Paint Calculator",
        item: absoluteUrl("/paint-calculator"),
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

export default function PaintCalculatorPage() {
  return (
    <>
      <SiteHeader />
      <main className="calculator-page paint-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <section className="calculator-hero paint-calculator-hero">
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <a href="/">Home</a>
              <span aria-hidden="true">/</span>
              <span>Paint Calculator</span>
            </nav>
            <div className="calculator-hero-grid">
              <div>
                <p className="eyebrow">Interior tools</p>
                <h1>Paint Calculator</h1>
                <p>
                  Estimate wall and ceiling paint from measured surfaces,
                  coats, product coverage, and the cans available to you.
                </p>
              </div>
              <ul>
                <li><CheckIcon /> Metric &amp; imperial</li>
                <li><CheckIcon /> Adjustable coverage</li>
                <li><CheckIcon /> Measured openings</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="shell calculator-main-section">
          <PaintCalculator />
        </section>

        <section className="shell calculator-content">
          <article>
            <p className="eyebrow">Transparent by design</p>
            <h2>Room paint formula</h2>
            <p>
              The engine calculates the four rectangular walls from perimeter
              and height. A ceiling is optional, while door and window area is
              measured and subtracted explicitly.
            </p>
            <div className="formula-block">
              <span>Wall area</span>
              <code>A<sub>walls</sub> = 2 × (length + width) × height</code>
              <span>Paintable area</span>
              <code>A<sub>paint</sub> = walls + ceiling − openings</code>
              <span>Paint volume</span>
              <code>V = (A<sub>paint</sub> × coats ÷ coverage) × (1 + extra ÷ 100)</code>
            </div>
            <p>
              Coverage is not universal. Use the spread rate printed on the
              selected product. BuildMeasure keeps the full calculation
              unrounded, then rounds only the final container count upward.
            </p>
          </article>
          <aside className="formula-meta">
            <h3>Calculation record</h3>
            <dl>
              <div><dt>Engine version</dt><dd>{PAINT_ENGINE_VERSION}</dd></div>
              <div><dt>Formula version</dt><dd>{PAINT_FORMULA_VERSION}</dd></div>
              <div><dt>Last reviewed</dt><dd>July 31, 2026</dd></div>
              <div><dt>Room shape</dt><dd>Rectangular</dd></div>
            </dl>
            <h3>Primary references</h3>
            <a href="https://www.sherwin-williams.com/homeowners/color/try-on-colors/color-snap-studio-for-ipad/sw-video-dir-howmuchpaintbuy" target="_blank" rel="noreferrer">
              Sherwin-Williams — surface method <ArrowIcon />
            </a>
            <a href="https://www.sherwin-williams.com/en-us/color/color-tools/paint-calculator" target="_blank" rel="noreferrer">
              Sherwin-Williams — coverage FAQ <ArrowIcon />
            </a>
            <a href="https://www.nist.gov/document/2026-nist-handbook-44-appendix-c" target="_blank" rel="noreferrer">
              NIST Handbook 44 — unit conversions <ArrowIcon />
            </a>
          </aside>
        </section>

        <CalculatorWorkedExample
          title="A 1,000-square-foot wall estimate"
          description="A 25 ft × 25 ft room with 10 ft walls produces 1,000 ft² of wall area when the ceiling and openings are excluded. Use one coat, 400 ft²/gal coverage, and 0% extra."
          steps={[
            { label: "Find wall area", value: "2 × (25 + 25) × 10 = 1,000 ft²" },
            { label: "Apply one coat", value: "1,000 ft² × 1 = 1,000 coat-ft²" },
            { label: "Find paint volume", value: "1,000 ÷ 400 = 2.5 gal" },
            { label: "Round containers upward", value: "ceil(2.5 ÷ 1 gal) = 3 cans" },
          ]}
          result="2.5 gal; buy 3 one-gallon cans"
          verification="Coverage is a product input, not a universal constant. Replace 400 ft²/gal with the value printed on the selected coating."
        />

        <section className="faq-section">
          <div className="shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Common questions</p>
                <h2>Paint calculator FAQ</h2>
              </div>
              <p>Inputs you can verify instead of assumptions you cannot see.</p>
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
            <h2>Estimate the next material.</h2>
          </div>
          <a className="next-card next-card-live" href="/guides/how-much-paint-do-i-need">
            <span>Guide</span><strong>How Much Paint Do I Need?</strong><small>Room formula &amp; worked example</small>
          </a>
          <a className="next-card next-card-live" href="/tile-calculator">
            <span>Live</span><strong>Tile Calculator</strong><small>Tiles, boxes &amp; waste</small>
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
