import type { Metadata } from "next";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { CalculatorWorkedExample } from "@/components/calculator-worked-example";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  TILE_ENGINE_VERSION,
  TILE_FORMULA_VERSION,
} from "@/lib/calculators/tile";
import { absoluteUrl } from "@/lib/site";
import { TileCalculator } from "./tile-calculator";

export const metadata: Metadata = {
  title: "Tile Calculator — Tiles, Boxes, Waste & Layout",
  description:
    "Calculate tiles and full boxes for a rectangular floor or wall using tile size, grout joint, waste allowance, and carton quantity in imperial or metric units.",
  alternates: {
    canonical: "/tile-calculator",
  },
  openGraph: {
    title: "Tile Calculator — Tiles, Boxes, Waste & Layout",
    description:
      "Estimate tile quantity, full boxes, purchased coverage, and a transparent layout grid.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Tile Calculator — Tiles, Boxes, Waste & Layout",
    description:
      "Estimate tile quantity, full boxes, purchased coverage, and a transparent layout grid.",
  },
};

const faqs = [
  {
    question: "How does the tile calculator find the order quantity?",
    answer:
      "It divides rectangular surface area by one tile's face area, applies the waste percentage you selected, rounds the tile quantity upward, then rounds again to complete boxes using the carton quantity.",
  },
  {
    question: "How much extra tile should I order?",
    answer:
      "There is no single allowance for every project. Ten percent is a common planning starting point, while complex patterns, many cuts, fragile material, or matching future repairs may require more. Confirm the allowance with the supplier or installer.",
  },
  {
    question: "Does grout-joint width reduce the number of tiles to buy?",
    answer:
      "JobsiteQuant does not subtract grout area from the purchase quantity. Tile is sold by its face coverage, and a transparent waste allowance handles cuts and loss. Joint width is used only for the row-and-column layout check.",
  },
  {
    question: "What does automatic orientation do?",
    answer:
      "For rectangular tiles, the calculator compares a length-aligned grid with a 90-degree rotated grid and shows the option with fewer grid cells. It does not claim to optimize every cut or visual pattern.",
  },
  {
    question: "Can this calculator be used for a tiled wall?",
    answer:
      "Yes, if the wall is rectangular. Enter wall width and height as the two surface dimensions. For multiple rectangles or openings, calculate their net areas separately until multi-surface projects are added.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "JobsiteQuant Tile Calculator",
    url: absoluteUrl("/tile-calculator"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    description:
      "A rectangular floor and wall calculator for estimating tiles, waste allowance, complete boxes, and a layout grid.",
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
        name: "Tile Calculator",
        item: absoluteUrl("/tile-calculator"),
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

export default function TileCalculatorPage() {
  return (
    <>
      <SiteHeader ctaHref="/#calculators" ctaLabel="All calculators" />
      <main className="calculator-page tile-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <section className="calculator-hero tile-calculator-hero">
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <a href="/">Home</a>
              <span aria-hidden="true">/</span>
              <span>Tile Calculator</span>
            </nav>
            <div className="calculator-hero-grid">
              <div>
                <p className="eyebrow">Flooring &amp; walls</p>
                <h1>Tile Calculator</h1>
                <p>
                  Estimate individual tiles and complete boxes from the
                  surface, tile dimensions, grout spacing, and the
                  cutting allowance you choose.
                </p>
              </div>
              <ul>
                <li><CheckIcon /> Metric &amp; imperial</li>
                <li><CheckIcon /> Full-box rounding</li>
                <li><CheckIcon /> Layout orientation check</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="shell calculator-main-section">
          <TileCalculator />
        </section>

        <section className="shell calculator-content">
          <article>
            <p className="eyebrow">Transparent by design</p>
            <h2>Tile order formula</h2>
            <p>
              The procurement result is based on measured surface area
              and the actual tile face dimensions. Waste is explicit,
              and boxes are always rounded upward because partial cartons
              cannot be ordered as full cartons.
            </p>
            <div className="formula-block">
              <span>Surface area</span>
              <code>A<sub>surface</sub> = length × width</code>
              <span>Tiles to order</span>
              <code>N = ceil((A<sub>surface</sub> ÷ A<sub>tile</sub>) × (1 + waste ÷ 100))</code>
              <span>Complete boxes</span>
              <code>Boxes = ceil(N ÷ tiles per box)</code>
              <span>Layout cells along one span</span>
              <code>Cells = ceil((surface span + joint) ÷ (tile span + joint))</code>
            </div>
            <p>
              The layout grid is deliberately separate from the purchase
              result. Cut pieces may be reused, so counting every grid
              position as a new tile can substantially overstate the
              material order.
            </p>
          </article>
          <aside className="formula-meta">
            <h3>Calculation record</h3>
            <dl>
              <div><dt>Engine version</dt><dd>{TILE_ENGINE_VERSION}</dd></div>
              <div><dt>Formula version</dt><dd>{TILE_FORMULA_VERSION}</dd></div>
              <div><dt>Last reviewed</dt><dd>July 31, 2026</dd></div>
              <div><dt>Surface shape</dt><dd>Rectangular</dd></div>
            </dl>
            <h3>Primary references</h3>
            <a href="https://digitalassets.daltile.com/content/dam/AmericanOlean/website/documents/content/AO_TilePatternGuide_2005_SinglePages.pdf" target="_blank" rel="noreferrer">
              American Olean — pattern guide <ArrowIcon />
            </a>
            <a href="https://www.daltile.com/how-to/faqs" target="_blank" rel="noreferrer">
              Daltile — material &amp; attic stock <ArrowIcon />
            </a>
            <a href="https://tcnatile.com/resource-center/faq/grout/" target="_blank" rel="noreferrer">
              TCNA — grout-joint guidance <ArrowIcon />
            </a>
            <a href="https://www.nist.gov/document/2026-nist-handbook-44-appendix-c" target="_blank" rel="noreferrer">
              NIST Handbook 44 — unit conversions <ArrowIcon />
            </a>
          </aside>
        </section>

        <CalculatorWorkedExample
          title="A 12 ft × 10 ft tile order"
          description="Use 12 in × 12 in tiles, 10% waste, and 10 tiles per box. The procurement quantity is area-based; grout-joint width is shown separately for the layout grid."
          steps={[
            { label: "Find surface area", value: "12 × 10 = 120 ft²" },
            { label: "Find base tiles", value: "120 ft² ÷ 1 ft² = 120 tiles" },
            { label: "Add 10% waste", value: "ceil(120 × 1.10) = 132 tiles" },
            { label: "Round to full boxes", value: "ceil(132 ÷ 10) = 14 boxes" },
          ]}
          result="132 required; buy 14 boxes / 140 tiles"
          verification="The eight-tile difference is box-rounding overage. It is reported separately so waste and packaging are not confused."
        />

        <section className="faq-section">
          <div className="shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Common questions</p>
                <h2>Tile calculator FAQ</h2>
              </div>
              <p>
                Area ordering and layout planning, kept visibly
                separate.
              </p>
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
          <a
            className="next-card next-card-live"
            href="/guides/how-many-tiles-do-i-need"
          >
            <span>Guide</span>
            <strong>How Many Tiles Do I Need?</strong>
            <small>Tiles, waste &amp; full boxes</small>
          </a>
          <a
            className="next-card next-card-live"
            href="/gravel-calculator"
          >
            <span>Live</span>
            <strong>Gravel Calculator</strong>
            <small>Volume, tons &amp; bags</small>
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
