import type { Metadata } from "next";
import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How Much Concrete Do I Need for a Slab?",
  description:
    "Calculate slab concrete in cubic yards and 40, 60, or 80 lb bags, with 10 × 10 and 12 × 12 examples, bag yields, and a visible waste allowance.",
  alternates: { canonical: "/guides/how-many-bags-of-concrete" },
  openGraph: {
    type: "article",
    title: "How Much Concrete Do I Need for a Slab?",
    description:
      "A practical slab guide for converting length, width, and thickness into cubic yards and complete concrete bags.",
  },
};

const faqs = [
  {
    question: "How much concrete do I need for a 10 × 10 slab at 4 inches thick?",
    answer:
      "A 10 ft × 10 ft slab at 4 inches thick is about 1.235 cubic yards before waste. With a 10% allowance it is about 1.358 cubic yards. Using an 80 lb bag yield of 0.60 cubic feet, that order volume is 62 complete bags.",
  },
  {
    question: "How many 80 lb bags make one cubic yard?",
    answer:
      "Using a published yield of 0.60 cubic feet per 80 lb bag, one cubic yard requires 45 bags before any waste allowance because 27 divided by 0.60 equals 45.",
  },
  {
    question: "Should I add 10% extra concrete?",
    answer:
      "Ten percent is a common starting allowance, not a universal rule. Form accuracy, subgrade, spillage, supplier increments, and site conditions can require a different amount.",
  },
  {
    question: "When should I order ready-mix instead of bags?",
    answer:
      "Large bag counts can be slow and labor-intensive to mix consistently. Compare the total bag quantity, mixing capacity, placement time, delivery minimums, and supplier advice before choosing.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How Much Concrete Do I Need for a Slab?",
    description:
      "A practical method for converting rectangular slab dimensions into cubic yards and complete concrete bag quantities.",
    datePublished: "2026-08-09",
    dateModified: "2026-10-16",
    mainEntityOfPage: absoluteUrl("/guides/how-many-bags-of-concrete"),
    author: {
      "@type": "Organization",
      name: "BuildMeasure",
      url: absoluteUrl("/about"),
    },
    publisher: {
      "@type": "Organization",
      name: "BuildMeasure",
      url: absoluteUrl("/"),
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
        name: "Concrete Calculator",
        item: absoluteUrl("/concrete-calculator"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "How Much Concrete for a Slab",
        item: absoluteUrl("/guides/how-many-bags-of-concrete"),
      },
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

export default function ConcreteBagGuidePage() {
  return (
    <>
      <SiteHeader ctaHref="/concrete-calculator" ctaLabel="Open Concrete Calculator" />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <section className="utility-page-hero guide-hero">
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <a href="/">Home</a>
              <span aria-hidden="true">/</span>
              <a href="/concrete-calculator">Concrete Calculator</a>
              <span aria-hidden="true">/</span>
              <span>Slab Guide</span>
            </nav>
            <p className="eyebrow">Concrete estimating guide</p>
            <h1>How much concrete do I need for a slab?</h1>
            <p>
              Calculate slab volume first, convert it to cubic yards, then use
              the exact yield for your mix when you need complete bag counts.
            </p>
            <div className="guide-meta">
              <span>Published August 9, 2026</span>
              <span>Updated October 16, 2026</span>
              <span>By <a href="/about">BuildMeasure</a></span>
            </div>
          </div>
        </section>

        <article className="shell guide-article">
          <nav className="guide-toc" aria-label="On this page">
            <strong>On this page</strong>
            <a href="#answer">Quick answer</a>
            <a href="#formula">Slab formula</a>
            <a href="#measure">Measure an irregular slab</a>
            <a href="#yields">Example bag yields</a>
            <a href="#table">Common slab table</a>
            <a href="#example">Worked example</a>
            <a href="#ordering">Bags or delivery?</a>
            <a href="#verify">Verify before ordering</a>
          </nav>

          <div className="guide-body">
            <section id="answer">
              <p className="eyebrow">Quick answer</p>
              <h2>Calculate slab volume, then yards or bags</h2>
              <p>
                Multiply length by width by thickness after converting every
                dimension to feet. Divide cubic feet by 27 for cubic yards. If
                you are using bagged mix, apply your project-specific allowance,
                divide by the yield printed for the exact product, and round the
                final bag count upward.
              </p>
              <a className="button button-primary guide-primary-action" href="/concrete-calculator">
                Calculate my slab now
              </a>
            </section>

            <section id="formula">
              <p className="eyebrow">The formula</p>
              <h2>Calculate concrete for a slab step by step</h2>
              <div className="formula-block guide-formula-block">
                <span>Net cubic feet</span>
                <code>length (ft) × width (ft) × thickness (ft)</code>
                <span>Net cubic yards</span>
                <code>net cubic feet ÷ 27</code>
                <span>Order cubic feet</span>
                <code>net volume × (1 + allowance ÷ 100)</code>
                <span>Complete bags</span>
                <code>round up (order volume ÷ yield per bag)</code>
              </div>
              <p>
                When thickness is measured in inches, divide it by 12 before
                multiplying. Keep full precision through the calculation and
                round only the displayed result or final package quantity.
              </p>
            </section>

            <section id="yields">
              <p className="eyebrow">Product input</p>
              <h2>Use the yield for the exact mix</h2>
              <p>
                As a documented example, Sakrete High-Strength Concrete Mix
                lists yields of 0.30 ft³ for a 40 lb bag, 0.45 ft³ for a 60 lb
                bag, and 0.60 ft³ for an 80 lb bag. Other mixes and products can
                differ, so the current bag or technical data sheet controls.
              </p>
              <div className="guide-assumption-grid">
                <div><strong>40 lb example</strong><span>0.30 ft³ per bag</span></div>
                <div><strong>60 lb example</strong><span>0.45 ft³ per bag</span></div>
                <div><strong>80 lb example</strong><span>0.60 ft³ per bag</span></div>
                <div><strong>One cubic yard</strong><span>27 ft³ before allowance</span></div>
              </div>
              <p>
                Source: <a href="https://www.sakrete.com/product/high-strength-concrete-mix/" target="_blank" rel="noreferrer">Sakrete High-Strength Concrete Mix product data</a>.
              </p>
            </section>

            <section id="table">
              <p className="eyebrow">Reference table</p>
              <h2>Common 4-inch slabs with 10% allowance</h2>
              <p>
                These examples assume a rectangular slab, uniform 4-inch
                thickness, and the example yields above. They are planning
                references—not substitutes for measuring the actual project.
              </p>
              <div className="guide-table-wrap">
                <table>
                  <caption>Estimated complete bags after a 10% allowance</caption>
                  <thead>
                    <tr>
                      <th>Slab</th>
                      <th>Order yd³</th>
                      <th>40 lb</th>
                      <th>60 lb</th>
                      <th>80 lb</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>5 × 5 ft</td><td>0.340</td><td>31</td><td>21</td><td>16</td></tr>
                    <tr><td>10 × 10 ft</td><td>1.358</td><td>123</td><td>82</td><td>62</td></tr>
                    <tr><td>12 × 12 ft</td><td>1.956</td><td>176</td><td>118</td><td>88</td></tr>
                    <tr><td>20 × 20 ft</td><td>5.432</td><td>489</td><td>326</td><td>245</td></tr>
                  </tbody>
                </table>
              </div>
              <p>
                A high bag count can make ready-mix delivery more practical.
                Compare delivery minimums, placement time, labor, mixing
                capacity, and supplier recommendations before deciding.
              </p>
            </section>

            <section id="measure">
              <p className="eyebrow">Measurement plan</p>
              <h2>Break an L-shaped slab into rectangles</h2>
              <p>
                Sketch the formed footprint before opening a calculator. Mark
                the inside dimensions, excluded recesses, and the specified
                thickness of each section. An outside bounding rectangle can
                include a large area that will never receive concrete.
              </p>
              <figure style={{ margin: "1.5rem 0" }}>
                <Image src="/guides/concrete-measurement-plan.svg" width={640} height={460}
                  alt="L-shaped slab: rectangle A is 6 by 2 meters and B is 4 by 2 meters, giving 20 square meters while excluding a 2 by 2 meter recess."
                  style={{ width: "100%", height: "auto" }} />
                <figcaption>Original BuildMeasure measurement diagram. Dimensions illustrate quantity estimation; they do not specify a structural design.</figcaption>
              </figure>
              <p>
                In this plan, rectangle A covers 12 m² and B covers 8 m².
                They meet at an edge, so adding them does not double-count an
                overlap. The same answer comes from subtracting the 2 × 2 m
                recess from the 6 × 4 m bounding rectangle: 24 − 4 = 20 m².
              </p>
              <p>
                Run the rectangular calculator once for A and once for B.
                Add the unrounded volumes before converting the total into a
                supplier order. If sections have different specified thicknesses,
                calculate their volumes separately; multiplying the whole area
                by a guessed average can conceal the deeper section.
              </p>
            </section>

            <section id="example">
              <p className="eyebrow">Worked metric example</p>
              <h2>From the measured footprint to an order discussion</h2>
              <p>
                Suppose the project drawings specify a uniform 100 mm thickness
                for the illustrated footprint. This is an example input, not a
                thickness recommendation. Use 10% as an illustrative allowance.
              </p>
              <ol className="guide-calculation-steps">
                <li>Convert thickness: 100 mm ÷ 1,000 = 0.10 m.</li>
                <li>Rectangle A: 6 × 2 × 0.10 = 1.20 m³.</li>
                <li>Rectangle B: 4 × 2 × 0.10 = 0.80 m³.</li>
                <li>Combine net volumes: 1.20 + 0.80 = 2.00 m³.</li>
                <li>Apply allowance once: 2.00 × 1.10 = 2.20 m³.</li>
              </ol>
              <p>
                Tell the supplier both quantities: 2.00 m³ measured volume and
                2.20 m³ after the chosen allowance. Ask about sale increments
                before rounding the order again. For this 20 m² footprint,
                every additional 10 mm of actual depth adds 0.20 m³ before
                allowance. Rechecking depth can matter more than displaying
                another decimal place.
              </p>
              <p>
                A 5%, 10%, or 15% allowance changes this example to 2.10,
                2.20, or 2.30 m³ respectively. Those are comparisons, not
                recommended percentages. Select the allowance after checking
                form accuracy, subgrade variation, handling, and supplier advice.
              </p>
            </section>

            <section id="ordering">
              <p className="eyebrow">Purchase decision</p>
              <h2>Compare the whole job, not only the bag price</h2>
              <div className="guide-table-wrap">
                <table>
                  <caption>Questions to resolve before choosing bags or ready-mix</caption>
                  <thead><tr><th scope="col">Check</th><th scope="col">Bagged mix</th><th scope="col">Ready-mix</th></tr></thead>
                  <tbody>
                    <tr><th scope="row">Quantity</th><td>Confirm the exact product yield and whole bags.</td><td>Confirm minimum load and order increment.</td></tr>
                    <tr><th scope="row">Access</th><td>Plan unloading, storage, mixing, and carrying.</td><td>Confirm truck access and any pumping or carrying arrangement.</td></tr>
                    <tr><th scope="row">Placement</th><td>Check mixer output and available labor.</td><td>Agree delivery timing and unloading arrangements.</td></tr>
                    <tr><th scope="row">Comparable price</th><td>Include equipment, labor, and transport.</td><td>Ask about delivery, small-load, waiting, and other applicable charges.</td></tr>
                  </tbody>
                </table>
              </div>
              <p>
                There is no universal volume at which delivery becomes cheaper.
                Get comparable quotations for the specified mix and actual site.
                The calculator&apos;s optional bag-price total covers material
                packages only; it does not estimate the complete installed cost.
              </p>
              <h3>Three errors to catch on the measurement sheet</h3>
              <ul>
                <li>Keep excavation depth separate from concrete thickness when the build-up also includes other materials.</li>
                <li>Exclude recesses and avoid overlapping rectangles before adding an allowance.</li>
                <li>Keep extra volume separate from supplier rounding so you can explain every part of the final order.</li>
              </ul>
              <p>
                Thickened edges, footings, slopes, and changing depths need
                their own documented geometry and project requirements. Do not
                hide those volumes inside a larger waste percentage.
              </p>
            </section>

            <section id="verify">
              <p className="eyebrow">Before purchase</p>
              <h2>Verify what a calculator cannot know</h2>
              <ul>
                <li>Re-measure the formed length, width, and actual thickness.</li>
                <li>Confirm that the selected mix is suitable for the application and depth.</li>
                <li>Use the current yield printed for the exact product and bag size.</li>
                <li>Choose an allowance based on the subgrade, forms, spillage, and site conditions.</li>
                <li>Check structural, reinforcement, code, weather, curing, and supplier requirements with a qualified professional.</li>
              </ul>
            </section>

            <section className="faq-list guide-faq" aria-labelledby="bag-faq-title">
              <p className="eyebrow">Common questions</p>
              <h2 id="bag-faq-title">Concrete slab FAQ</h2>
              {faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary>{faq.question}<span aria-hidden="true">+</span></summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </section>

            <div className="utility-callout">
              <strong>Need dimensions, waste, yards, meters, and bags in one result?</strong>
              <p>
                Open the <a href="/concrete-calculator">BuildMeasure Concrete Calculator for cubic yards and bags</a> and verify the selected product yield before ordering.
              </p>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
