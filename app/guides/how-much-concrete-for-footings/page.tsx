import type { Metadata } from "next";
import { ArrowIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl } from "@/lib/site";

const GUIDE_PATH = "/guides/how-much-concrete-for-footings";

export const metadata: Metadata = {
  title: "How Much Concrete for Footings? Formula & Bags",
  description:
    "Learn how to turn measured rectangular footing dimensions into concrete volume and complete bag quantities without guessing structural footing size.",
  alternates: { canonical: GUIDE_PATH },
  openGraph: {
    type: "article",
    title: "How Much Concrete for Footings?",
    description:
      "A quantity-first guide to rectangular footing concrete, multiple identical footings, allowance, and whole-bag rounding.",
  },
};

const faqs = [
  {
    question: "What measurements do I need for footing concrete?",
    answer:
      "For a rectangular footing, measure or obtain the project length, width, and concrete depth. If several footings are identical, also record the quantity. Do not use this guide to choose structural dimensions.",
  },
  {
    question: "Should I round concrete bags for each footing separately?",
    answer:
      "No. Combine the unrounded concrete volume for identical footings first, apply the chosen allowance to the total, then round the final bag quantity upward once.",
  },
  {
    question: "Does the calculator design the footing?",
    answer:
      "No. Footing dimensions, reinforcement, bearing capacity, frost depth, concrete strength, and other structural requirements are outside the calculator scope.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How Much Concrete for Footings?",
    url: absoluteUrl(GUIDE_PATH),
    author: { "@type": "Person", name: "Hosyss" },
    about: "Rectangular footing concrete quantity estimation",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/guides") },
      { "@type": "ListItem", position: 3, name: "Footing concrete", item: absoluteUrl(GUIDE_PATH) },
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

export default function FootingConcreteGuidePage() {
  return (
    <>
      <SiteHeader ctaHref="/footing-calculator" ctaLabel="Open calculator" />
      <main className="guide-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <section className="guide-hero">
          <div className="shell guide-hero-grid">
            <div>
              <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/guides">Guides</a><span aria-hidden="true">/</span><span>Footing concrete</span></nav>
              <p className="eyebrow">Concrete estimating guide</p>
              <h1>How much concrete do I need for footings?</h1>
              <p>Use measured or designed footing dimensions to calculate material quantity. Keep the geometry calculation separate from structural design decisions.</p>
              <a className="button button-primary" href="/footing-calculator">Open Footing Calculator <ArrowIcon /></a>
            </div>
            <aside>
              <strong>Quantity workflow</strong>
              <ol><li>Verify the project dimensions.</li><li>Calculate one footing volume.</li><li>Multiply by identical footing count.</li><li>Apply allowance, then round packages.</li></ol>
            </aside>
          </div>
        </section>

        <section className="shell guide-article">
          <article>
            <h2>1. Start with the actual footing geometry</h2>
            <p>A rectangular footing is a rectangular prism, so its material volume is length × width × concrete depth. All three dimensions must describe the same physical footing and must be converted to compatible units before multiplication.</p>
            <div className="formula-block"><span>One footing</span><code>V = length × width × depth</code></div>
            <p>The formula answers a material question only. It does not tell you what the width or depth should be. Use project drawings, engineering information, and applicable requirements for those dimensions.</p>

            <h2>2. Combine identical footings before rounding</h2>
            <p>If several footings have the same dimensions, multiply the unrounded volume of one footing by the quantity. This preserves the actual total instead of accumulating package-rounding error at every footing.</p>
            <div className="formula-block"><span>Total net volume</span><code>V<sub>net</sub> = V × quantity</code></div>
            <p>If footing sizes differ, calculate each size separately and combine the unrounded material volumes rather than averaging the dimensions.</p>

            <h2>3. Add a visible project allowance</h2>
            <p>Field conditions can make the purchased quantity higher than the ideal formed volume. BuildNumbers keeps the extra allowance explicit instead of hiding a universal percentage inside the formula.</p>
            <div className="formula-block"><span>Order volume</span><code>V<sub>order</sub> = V<sub>net</sub> × (1 + allowance ÷ 100)</code></div>

            <h2>4. Convert to ready-mix volume or complete bags</h2>
            <p>Imperial results can be viewed in cubic yards and cubic feet; metric results use cubic meters and liters. For bagged concrete, BuildNumbers divides the final allowance-adjusted volume by the selected published package yield and rounds upward once to a complete bag.</p>
            <p>A controlled example of three 10 ft × 2 ft × 8 in rectangular footings equals 40 ft³ before allowance. At a published 0.60 ft³ yield, 40 ÷ 0.60 = 66.667, so the purchase quantity is 67 complete 80 lb bags. Those dimensions are an arithmetic example, not a footing recommendation.</p>

            <h2>5. Check the estimate before ordering</h2>
            <p>Recheck the actual formed dimensions, project requirements, product yield, supplier order increments, and whether the project uses bagged or ready-mix concrete. Excavation volume is not automatically the same as concrete volume, and this calculator does not estimate forms, reinforcement, labor, delivery, or structural requirements.</p>

            <div className="guide-cta"><div><p className="eyebrow">Run the measured dimensions</p><h2>Calculate the concrete quantity.</h2></div><a className="button button-primary" href="/footing-calculator">Footing Calculator <ArrowIcon /></a></div>

            <h2>Footing concrete FAQ</h2>
            <div className="faq-list">{faqs.map((faq, index) => <details key={faq.question} open={index === 0}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div>
          </article>
          <aside className="guide-sidebar">
            <strong>Scope boundary</strong>
            <p>BuildNumbers calculates material quantity from dimensions you supply. It does not select structural footing geometry or certify code compliance.</p>
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
