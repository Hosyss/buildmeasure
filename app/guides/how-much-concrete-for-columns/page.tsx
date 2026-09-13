import type { Metadata } from "next";
import { ArrowIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl } from "@/lib/site";

const GUIDE_PATH = "/guides/how-much-concrete-for-columns";

export const metadata: Metadata = {
  title: "How Much Concrete for Columns? Square, Rectangular & Circular",
  description:
    "Learn how to estimate concrete volume for square, rectangular, and circular columns, combine identical columns, apply allowance, and round complete bags.",
  alternates: { canonical: GUIDE_PATH },
  openGraph: {
    type: "article",
    title: "How Much Concrete for Columns?",
    description:
      "A quantity-first guide to rectangular and circular column concrete without guessing structural dimensions.",
  },
};

const faqs = [
  {
    question: "What measurements do I need for a rectangular column?",
    answer:
      "Use the actual concrete height, width, and depth from the project design. Square columns use the same formula with equal width and depth.",
  },
  {
    question: "What measurements do I need for a circular column?",
    answer:
      "Use the actual concrete height and diameter. The calculator converts diameter to radius internally before calculating the circular cross-section.",
  },
  {
    question: "Should I round bags for each column separately?",
    answer:
      "No. Combine the unrounded volume of identical columns first, apply the chosen allowance to the total, then round the final bag quantity upward once.",
  },
  {
    question: "Does this guide tell me how large a structural column should be?",
    answer:
      "No. Column dimensions, reinforcement, concrete strength, load capacity, connections, and code requirements are structural design decisions outside this quantity guide.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How Much Concrete for Columns?",
    url: absoluteUrl(GUIDE_PATH),
    author: { "@type": "Person", name: "Hosyss" },
    about: "Rectangular and circular column concrete quantity estimation",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/guides") },
      { "@type": "ListItem", position: 3, name: "Column concrete", item: absoluteUrl(GUIDE_PATH) },
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

export default function ColumnConcreteGuidePage() {
  return (
    <>
      <SiteHeader ctaHref="/column-calculator" ctaLabel="Open calculator" />
      <main className="guide-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <section className="guide-hero">
          <div className="shell guide-hero-grid">
            <div>
              <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/guides">Guides</a><span aria-hidden="true">/</span><span>Column concrete</span></nav>
              <p className="eyebrow">Concrete estimating guide</p>
              <h1>How much concrete do I need for columns?</h1>
              <p>Turn actual rectangular, square, or circular column dimensions into material volume while keeping the quantity calculation separate from structural design.</p>
              <a className="button button-primary" href="/column-calculator">Open Column Calculator <ArrowIcon /></a>
            </div>
            <aside>
              <strong>Quantity workflow</strong>
              <ol><li>Verify column shape and dimensions.</li><li>Calculate one cross-section.</li><li>Multiply by concrete height and count.</li><li>Apply allowance, then round packages.</li></ol>
            </aside>
          </div>
        </section>

        <section className="shell guide-article">
          <article>
            <h2>1. Start with the actual column cross-section</h2>
            <p>For a rectangular or square column, cross-sectional area is width × depth. For a circular column, cross-sectional area is π × radius squared, where radius is half the entered diameter.</p>
            <div className="formula-block"><span>Rectangular</span><code>A = width × depth</code><span>Circular</span><code>A = π × (diameter ÷ 2)²</code></div>
            <p>These formulas calculate geometry only. They do not determine what the structural dimensions should be.</p>

            <h2>2. Multiply cross-section by the concrete height</h2>
            <p>Once the cross-sectional area is known, multiply it by the actual concrete height to obtain the volume of one prismatic column.</p>
            <div className="formula-block"><span>One column</span><code>V = A × height</code></div>

            <h2>3. Combine identical columns before rounding</h2>
            <p>For repeated columns with identical dimensions, multiply one unrounded column volume by the quantity. Do not round each column to bags separately, because that can accumulate avoidable package-rounding error.</p>
            <div className="formula-block"><span>Total net volume</span><code>V<sub>net</sub> = V × quantity</code></div>
            <p>If column sizes or shapes differ, calculate each group separately and combine unrounded material volumes rather than averaging dimensions.</p>

            <h2>4. Keep the extra allowance visible</h2>
            <p>Placement loss, form tolerances, and field variation can increase purchased quantity. BuildNumbers applies the user-entered allowance only after the net project volume is known.</p>
            <div className="formula-block"><span>Order volume</span><code>V<sub>order</sub> = V<sub>net</sub> × (1 + allowance ÷ 100)</code></div>

            <h2>5. Convert to ready-mix volume or complete bags</h2>
            <p>Imperial results can be viewed in cubic yards and cubic feet; metric results use cubic meters and liters. For bagged concrete, the final allowance-adjusted volume is divided by the selected published package yield and rounded upward once.</p>
            <p>As a controlled arithmetic example, three 12 in × 12 in × 10 ft columns equal 30 ft³ net. With 10% allowance the order volume is 33 ft³, or 1.222 yd³. At a published 0.60 ft³ yield, that is exactly 55 complete 80 lb bags. Those dimensions are an arithmetic example, not a structural recommendation.</p>

            <h2>6. Check the estimate before ordering</h2>
            <p>Recheck column dimensions, quantity, concrete specification, product yield, supplier order increments, and whether the placement uses bagged or ready-mix concrete. This calculator does not estimate reinforcement, forms, labor, pumps, delivery, structural capacity, or code compliance.</p>

            <div className="guide-cta"><div><p className="eyebrow">Run the actual dimensions</p><h2>Calculate the column concrete quantity.</h2></div><a className="button button-primary" href="/column-calculator">Column Calculator <ArrowIcon /></a></div>

            <h2>Column concrete FAQ</h2>
            <div className="faq-list">{faqs.map((faq, index) => <details key={faq.question} open={index === 0}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div>
          </article>
          <aside className="guide-sidebar">
            <strong>Scope boundary</strong>
            <p>BuildNumbers calculates material quantity from dimensions you supply. It does not size structural columns, reinforcement, connections, or certify code compliance.</p>
            <strong>References</strong>
            <a href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors" target="_blank" rel="noreferrer">NIST SP 811 — conversions <ArrowIcon /></a>
            <a href="https://www.sakrete.com/product/high-strength-concrete-mix/" target="_blank" rel="noreferrer">Sakrete — package yields <ArrowIcon /></a>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
