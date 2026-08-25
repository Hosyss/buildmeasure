import type { Metadata } from "next";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { CalculatorWorkedExample } from "@/components/calculator-worked-example";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  MULCH_ENGINE_VERSION,
  MULCH_FORMULA_VERSION,
} from "@/lib/calculators/mulch";
import { absoluteUrl } from "@/lib/site";
import { MulchCalculator } from "./mulch-calculator";

export const metadata: Metadata = {
  title: "Mulch Calculator — Cubic Yards & Bags",
  description:
    "Calculate mulch volume, cubic yards, liters, bag coverage, and complete bags for a rectangular landscape bed with adjustable depth and allowance.",
  alternates: {
    canonical: "/mulch-calculator",
  },
  openGraph: {
    title: "Mulch Calculator — Cubic Yards & Bags",
    description:
      "Estimate mulch volume and complete bags with transparent depth and allowance inputs.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Mulch Calculator — Cubic Yards & Bags",
    description:
      "Estimate mulch volume and complete bags with transparent depth and allowance inputs.",
  },
};

const faqs = [
  {
    question: "How does the mulch calculator find volume?",
    answer:
      "It converts length, width, and installed depth to consistent units, multiplies them to find the rectangular bed volume, then applies the project allowance you selected.",
  },
  {
    question: "How many bags of mulch do I need?",
    answer:
      "The calculator divides the allowance-adjusted order volume by the net volume printed on your chosen bag and rounds only the final bag quantity upward. Enter the package volume, not its weight.",
  },
  {
    question: "How deep should mulch be?",
    answer:
      "U.S. EPA WaterSense guidance says three to four inches provides suitable coverage for most plants and warns that excessive mulch can restrict water flow. Plant, soil, drainage, and mulch type still matter, so confirm local guidance for the bed you are treating.",
  },
  {
    question: "What if mulch is already in the bed?",
    answer:
      "Measure and enter only the additional depth needed to reach the intended finished layer. Entering the full finished depth would overstate a top-up estimate.",
  },
  {
    question: "Should I estimate mulch by weight or volume?",
    answer:
      "Mulch bags and bulk deliveries are commonly labeled by volume. JobsiteQuant therefore uses the exact bag volume or bulk volume without inventing a density that may change with mulch type, particle size, and moisture.",
  },
  {
    question: "Can I use metric measurements?",
    answer:
      "Yes. Metric mode uses meters for length and width, centimeters for depth, and liters for bag volume. Switching systems converts the values already entered.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "JobsiteQuant Mulch Calculator",
    url: absoluteUrl("/mulch-calculator"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    description:
      "A rectangular landscape-bed calculator for mulch volume, coverage per bag, and complete bags.",
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
        name: "Mulch Calculator",
        item: absoluteUrl("/mulch-calculator"),
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

export default function MulchCalculatorPage() {
  return (
    <>
      <SiteHeader ctaHref="/#calculators" ctaLabel="All calculators" />
      <main className="calculator-page mulch-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <section className="calculator-hero mulch-calculator-hero">
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <a href="/">Home</a>
              <span aria-hidden="true">/</span>
              <span>Mulch Calculator</span>
            </nav>
            <div className="calculator-hero-grid">
              <div>
                <p className="eyebrow">Landscape beds &amp; planting areas</p>
                <h1>Mulch Calculator</h1>
                <p>
                  Estimate mulch volume, cubic yards, bag coverage, and
                  complete bags from the dimensions you can verify.
                </p>
              </div>
              <ul>
                <li><CheckIcon /> Metric &amp; imperial</li>
                <li><CheckIcon /> Exact package volume</li>
                <li><CheckIcon /> Visible project allowance</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="shell calculator-main-section">
          <MulchCalculator />
        </section>

        <section className="shell calculator-content">
          <article>
            <p className="eyebrow">Transparent by design</p>
            <h2>Mulch volume and bag formula</h2>
            <p>
              A rectangular mulch bed is a shallow rectangular prism.
              JobsiteQuant calculates its geometric volume first, then keeps
              your project allowance and package size visible.
            </p>
            <div className="formula-block">
              <span>Bed area</span>
              <code>A = length × width</code>
              <span>Net volume</span>
              <code>V = A × installed depth</code>
              <span>Order volume</span>
              <code>V<sub>order</sub> = V × (1 + allowance ÷ 100)</code>
              <span>Complete bags</span>
              <code>Bags = ceil(V<sub>order</sub> ÷ bag volume)</code>
            </div>
            <p>
              The example uses a 3-inch layer. EPA WaterSense describes three
              to four inches as suitable coverage for most plants, but the
              calculator never forces that depth. Enter the actual layer your
              planting plan requires, and leave space around stems and trunks.
            </p>
          </article>
          <aside className="formula-meta">
            <h3>Calculation record</h3>
            <dl>
              <div><dt>Engine version</dt><dd>{MULCH_ENGINE_VERSION}</dd></div>
              <div><dt>Formula version</dt><dd>{MULCH_FORMULA_VERSION}</dd></div>
              <div><dt>Last reviewed</dt><dd>August 1, 2026</dd></div>
              <div><dt>Shape</dt><dd>Rectangular bed</dd></div>
            </dl>
            <h3>Primary references</h3>
            <a href="https://www.epa.gov/watersense/landscaping-tips" target="_blank" rel="noreferrer">
              U.S. EPA WaterSense — mulch depth <ArrowIcon />
            </a>
            <a href="https://www.nist.gov/publications/nist-handbook-44-specifications-tolerances-and-other-technical-requirements-weighing-18" target="_blank" rel="noreferrer">
              NIST Handbook 44 — unit conversions <ArrowIcon />
            </a>
          </aside>
        </section>

        <CalculatorWorkedExample
          title="A 20 ft × 10 ft mulch bed"
          description="Use a 3 in installed layer, 10% project allowance, and bags labeled 2 ft³. The calculator uses package volume directly and does not invent a mulch density."
          steps={[
            { label: "Find bed volume", value: "20 × 10 × (3 ÷ 12) = 50 ft³" },
            { label: "Add 10% allowance", value: "50 × 1.10 = 55 ft³ = 2.037 yd³" },
            { label: "Find bag coverage", value: "2 ft³ ÷ 0.25 ft = 8 ft² per bag" },
            { label: "Round complete bags", value: "ceil(55 ÷ 2) = 28 bags" },
          ]}
          result="2.037 yd³; 8 ft² per bag; 28 bags"
          verification="Use only the new layer depth when topping up an existing bed, and confirm the exact net volume printed on the bag."
        />

        <section className="faq-section">
          <div className="shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Common questions</p>
                <h2>Mulch calculator FAQ</h2>
              </div>
              <p>Measure the bed, choose the layer, and verify the bag label.</p>
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
          <a className="next-card next-card-live" href="/guides/how-much-mulch-do-i-need">
            <span>Guide</span>
            <strong>How Much Mulch Do I Need?</strong>
            <small>Cubic yards, coverage &amp; bags</small>
          </a>
          <a className="next-card next-card-live" href="/concrete-calculator">
            <span>Live</span>
            <strong>Concrete Calculator</strong>
            <small>Slab volume &amp; bags</small>
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
