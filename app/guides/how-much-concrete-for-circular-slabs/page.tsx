import type { Metadata } from "next";
import { ArrowIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl } from "@/lib/site";

const GUIDE_PATH = "/guides/how-much-concrete-for-circular-slabs";

export const metadata: Metadata = {
  title: "How Much Concrete for a Circular Slab? Formula & Bags",
  description:
    "Learn how to calculate concrete for circular slabs and pads from diameter and depth, combine identical pours, add allowance, and round complete bags.",
  alternates: { canonical: GUIDE_PATH },
  openGraph: {
    type: "article",
    title: "How Much Concrete for a Circular Slab?",
    description:
      "A quantity-first guide to circular slab area, concrete volume, identical pours, allowance, and whole-bag rounding.",
  },
};

const faqs = [
  {
    question: "What measurements do I need for a circular concrete slab?",
    answer:
      "You need the full diameter measured through the center and the actual concrete depth from your project information. If several pours are identical, also record the quantity.",
  },
  {
    question: "Why does the formula divide diameter by two?",
    answer:
      "Circle area uses radius. Radius is half of the full diameter, so the calculator converts diameter to radius before applying pi times radius squared.",
  },
  {
    question: "Should I round bags for every circular pad separately?",
    answer:
      "No. For identical pours, combine the unrounded concrete volume first, apply the chosen allowance to the project total, then round the final bag quantity upward once.",
  },
  {
    question: "Does this guide recommend slab thickness?",
    answer:
      "No. Thickness, reinforcement, subbase, concrete strength, edge details, joints, loads, frost protection, drainage, and code requirements are outside this quantity guide.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How Much Concrete for a Circular Slab?",
    url: absoluteUrl(GUIDE_PATH),
    author: { "@type": "Person", name: "Hosyss" },
    about: "Circular slab concrete quantity estimation",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/guides") },
      { "@type": "ListItem", position: 3, name: "Circular slab concrete", item: absoluteUrl(GUIDE_PATH) },
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

export default function CircularSlabConcreteGuidePage() {
  return (
    <>
      <SiteHeader ctaHref="/circular-slab-calculator" ctaLabel="Open calculator" />
      <main className="guide-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <section className="guide-hero">
          <div className="shell guide-hero-grid">
            <div>
              <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/guides">Guides</a><span aria-hidden="true">/</span><span>Circular slab concrete</span></nav>
              <p className="eyebrow">Concrete estimating guide</p>
              <h1>How much concrete do I need for a circular slab?</h1>
              <p>Turn a measured diameter and project depth into circular concrete volume, then keep quantity, allowance, and package rounding in the right order.</p>
              <a className="button button-primary" href="/circular-slab-calculator">Open Circular Slab Calculator <ArrowIcon /></a>
            </div>
            <aside>
              <strong>Quantity workflow</strong>
              <ol><li>Verify diameter and depth.</li><li>Convert diameter to radius.</li><li>Calculate circle area and volume.</li><li>Combine identical pours.</li><li>Apply allowance, then round packages.</li></ol>
            </aside>
          </div>
        </section>

        <section className="shell guide-article">
          <article>
            <h2>1. Measure the full diameter through the center</h2>
            <p>Diameter is the straight-line distance from one edge of the circle to the opposite edge through its center. The volume formula needs radius, which is exactly half of that diameter.</p>
            <div className="formula-block"><span>Radius</span><code>r = diameter ÷ 2</code></div>
            <p>If the pour is not a full circle, do not force it into this formula. Split the project into geometry that matches the actual shape or use a tool designed for that geometry.</p>

            <h2>2. Calculate circular plan area</h2>
            <p>Once radius is known, the full circular plan area is pi times radius squared.</p>
            <div className="formula-block"><span>Circle area</span><code>A = π × r²</code></div>
            <p>This is the horizontal plan area only. Concrete volume also needs the actual project depth.</p>

            <h2>3. Multiply the circle area by concrete depth</h2>
            <p>Use compatible units before multiplication. BuildNumbers normalizes Imperial and Metric inputs internally before calculating the volume.</p>
            <div className="formula-block"><span>One circular slab</span><code>V = A × depth</code></div>
            <p>The entered depth is an input, not a recommendation. Structural slab design and site preparation remain separate decisions.</p>

            <h2>4. Combine identical pours before rounding</h2>
            <p>If several pads or slabs have the same diameter and depth, multiply the unrounded volume of one by the quantity. This avoids accumulating package-rounding error at every individual pour.</p>
            <div className="formula-block"><span>Total net volume</span><code>V<sub>net</sub> = V × quantity</code></div>

            <h2>5. Apply a visible allowance</h2>
            <p>BuildNumbers keeps extra material explicit instead of hiding a fixed waste assumption inside the geometry.</p>
            <div className="formula-block"><span>Order volume</span><code>V<sub>order</sub> = V<sub>net</sub> × (1 + allowance ÷ 100)</code></div>

            <h2>6. Convert to ready-mix volume or complete bags</h2>
            <p>For bagged concrete, divide the final allowance-adjusted volume by the selected product yield and round upward once. Published yields are approximate, so verify the exact product before purchase.</p>
            <p>A controlled 12 ft diameter × 4 in example has a 6 ft radius, a 113.097 ft² circle area, and 37.699 ft³ of concrete before allowance. That is 1.396 yd³. At 0.60 ft³ per 80 lb bag, 37.699 ÷ 0.60 = 62.832, so the purchase quantity is 63 complete bags. The dimensions are an arithmetic example, not a design recommendation.</p>

            <h2>7. Verify what the quantity estimate does not cover</h2>
            <p>The estimate does not include reinforcement, forms, subbase, excavation, thickened edges, footings, joints, finishing, delivery constraints, drainage, slope, or structural requirements. Check the actual project plan, site conditions, product data, and supplier ordering rules before purchase.</p>

            <div className="guide-cta"><div><p className="eyebrow">Run the measured dimensions</p><h2>Calculate the circular concrete quantity.</h2></div><a className="button button-primary" href="/circular-slab-calculator">Circular Slab Calculator <ArrowIcon /></a></div>

            <h2>Circular slab concrete FAQ</h2>
            <div className="faq-list">{faqs.map((faq, index) => <details key={faq.question} open={index === 0}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div>
          </article>
          <aside className="guide-sidebar">
            <strong>Scope boundary</strong>
            <p>BuildNumbers calculates material quantity from dimensions you supply. It does not select slab thickness or certify structural or code compliance.</p>
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
