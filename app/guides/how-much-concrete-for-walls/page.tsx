import type { Metadata } from "next";
import { ArrowIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl } from "@/lib/site";

const GUIDE_PATH = "/guides/how-much-concrete-for-walls";

export const metadata: Metadata = {
  title: "How Much Concrete for a Wall? Openings, Thickness & Volume",
  description:
    "Learn how to estimate rectangular concrete wall volume, subtract measured openings, combine repeated walls, apply allowance, and round complete bags.",
  alternates: { canonical: GUIDE_PATH },
  openGraph: {
    type: "article",
    title: "How Much Concrete for a Wall?",
    description:
      "A quantity-first guide to wall face area, measured openings, thickness, allowance, and package rounding without structural sizing assumptions.",
  },
};

const faqs = [
  {
    question: "What dimensions do I need for a concrete wall estimate?",
    answer:
      "Use actual wall length, height, and thickness from the project design. If the wall has full-depth doors, windows, or other openings, measure their combined face area as well.",
  },
  {
    question: "Why are openings subtracted before wall thickness?",
    answer:
      "Opening area removes part of the wall face. Subtracting it from gross face area first leaves the concrete-bearing face area that should then be multiplied by thickness.",
  },
  {
    question: "Can I calculate several identical walls at once?",
    answer:
      "Yes. Calculate the unrounded volume for one wall after opening subtraction, multiply by the number of identical walls, then apply allowance and final package rounding.",
  },
  {
    question: "Does this guide size retaining walls or reinforcement?",
    answer:
      "No. Retaining-wall geometry, soil pressure, drainage, reinforcement, concrete strength, foundations, and code requirements are structural design decisions outside this quantity guide.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How Much Concrete for a Wall?",
    url: absoluteUrl(GUIDE_PATH),
    author: { "@type": "Person", name: "Hosyss" },
    about: "Rectangular concrete wall quantity estimation with measured openings",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/guides") },
      { "@type": "ListItem", position: 3, name: "Concrete walls", item: absoluteUrl(GUIDE_PATH) },
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

export default function ConcreteWallGuidePage() {
  return (
    <>
      <SiteHeader ctaHref="/wall-calculator" ctaLabel="Open calculator" />
      <main className="guide-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <section className="guide-hero">
          <div className="shell guide-hero-grid">
            <div>
              <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/guides">Guides</a><span aria-hidden="true">/</span><span>Concrete walls</span></nav>
              <p className="eyebrow">Concrete estimating guide</p>
              <h1>How much concrete do I need for a wall?</h1>
              <p>Turn actual rectangular wall dimensions and measured full-depth openings into concrete volume while keeping quantity calculation separate from structural wall design.</p>
              <a className="button button-primary" href="/wall-calculator">Open Wall Calculator <ArrowIcon /></a>
            </div>
            <aside>
              <strong>Quantity workflow</strong>
              <ol><li>Measure wall face dimensions.</li><li>Subtract full-depth opening area.</li><li>Multiply net face area by thickness.</li><li>Combine walls, apply allowance, then round packages.</li></ol>
            </aside>
          </div>
        </section>

        <section className="shell guide-article">
          <article>
            <h2>1. Calculate gross wall face area</h2>
            <p>For a rectangular wall, multiply the actual wall length by the concrete height. Keep both dimensions in the same length unit before multiplying.</p>
            <div className="formula-block"><span>Gross face area</span><code>A<sub>gross</sub> = length × height</code></div>

            <h2>2. Subtract measured full-depth openings</h2>
            <p>If doors, windows, sleeves, or other openings pass through the full wall thickness, add their measured face areas and subtract that total from gross face area. Do not subtract a recess that still contains concrete through part of the wall depth as if it were a full-depth opening.</p>
            <div className="formula-block"><span>Net face area</span><code>A<sub>net</sub> = A<sub>gross</sub> − openings</code></div>
            <p>BuildNumbers rejects an opening area equal to or larger than the entire wall face because that would leave no positive concrete wall volume.</p>

            <h2>3. Multiply net face area by wall thickness</h2>
            <p>Once the remaining face area is known, multiply by the actual concrete thickness from the project design. Imperial thickness is entered in inches and metric thickness in centimeters, then normalized internally before volume is calculated.</p>
            <div className="formula-block"><span>One wall</span><code>V = A<sub>net</sub> × thickness</code></div>

            <h2>4. Combine identical walls before rounding</h2>
            <p>When several walls have identical dimensions and opening area, multiply the unrounded volume of one wall by the wall count. Do not round each wall to bags separately because repeated rounding can overstate the purchase quantity.</p>
            <div className="formula-block"><span>Net project volume</span><code>V<sub>net</sub> = V × quantity</code></div>
            <p>Walls with different dimensions or different openings should be calculated as separate groups rather than averaged.</p>

            <h2>5. Add an explicit allowance</h2>
            <p>Concrete placement loss, form tolerances, and field variation can increase the amount purchased. BuildNumbers leaves that decision visible and applies the entered allowance only after net project volume is known.</p>
            <div className="formula-block"><span>Order volume</span><code>V<sub>order</sub> = V<sub>net</sub> × (1 + allowance ÷ 100)</code></div>

            <h2>6. Convert to ready-mix volume or complete bags</h2>
            <p>For smaller placements, the final order volume can be divided by the selected package yield and rounded upward once. For larger wall pours, cubic-yard or cubic-meter volume is usually the more useful quantity to take to a ready-mix supplier.</p>
            <p>As a controlled arithmetic example, a 10 ft × 8 ft wall with 16 ft² of full-depth openings has 64 ft² of net face area. At 6 in thick, that is 32 ft³ net. With 10% allowance the order volume is 35.2 ft³, or about 1.304 yd³. At a 0.60 ft³ package yield, that is 59 complete 80 lb bags. These dimensions are an arithmetic example, not a structural recommendation.</p>

            <h2>7. Check structural and supplier information separately</h2>
            <p>This guide does not determine wall thickness, reinforcement, concrete strength, foundations, lateral-load capacity, retaining-wall geometry, drainage, waterproofing, formwork, or code compliance. Verify those requirements separately before construction, then confirm supplier order increments and product yield before purchase.</p>

            <div className="guide-cta"><div><p className="eyebrow">Run the actual dimensions</p><h2>Calculate the concrete wall quantity.</h2></div><a className="button button-primary" href="/wall-calculator">Wall Calculator <ArrowIcon /></a></div>

            <h2>Concrete wall FAQ</h2>
            <div className="faq-list">{faqs.map((faq, index) => <details key={faq.question} open={index === 0}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div>
          </article>
          <aside className="guide-sidebar">
            <strong>Scope boundary</strong>
            <p>BuildNumbers calculates material quantity from dimensions you supply. It does not size structural or retaining walls, reinforcement, foundations, drainage, or certify code compliance.</p>
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
