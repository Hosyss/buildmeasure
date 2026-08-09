import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How Many Bags of Concrete Do I Need?",
  description:
    "Estimate 40, 60, and 80 lb concrete bags from slab dimensions, bag yield, and waste—with a worked formula and common-size table.",
  alternates: { canonical: "/guides/how-many-bags-of-concrete" },
  openGraph: {
    type: "article",
    title: "How Many Bags of Concrete Do I Need?",
    description:
      "A unit-safe method for converting slab volume into complete bags of concrete mix.",
  },
};

const faqs = [
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
    headline: "How Many Bags of Concrete Do I Need?",
    description:
      "A unit-safe method for converting rectangular slab volume into complete bags of concrete mix.",
    datePublished: "2026-08-09",
    dateModified: "2026-08-09",
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
        name: "How Many Bags of Concrete",
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
      <SiteHeader />
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
              <span>Bag Guide</span>
            </nav>
            <p className="eyebrow">Concrete estimating guide</p>
            <h1>How many bags of concrete do I need?</h1>
            <p>
              Convert a rectangular slab into cubic feet, apply a visible
              allowance, then divide by the exact yield printed for your mix.
            </p>
            <div className="guide-meta">
              <span>Published August 9, 2026</span>
              <span>Uses manufacturer-published example yields</span>
            </div>
          </div>
        </section>

        <article className="shell guide-article">
          <nav className="guide-toc" aria-label="On this page">
            <strong>On this page</strong>
            <a href="#answer">Quick answer</a>
            <a href="#formula">Bag formula</a>
            <a href="#yields">Example bag yields</a>
            <a href="#table">Common slab table</a>
            <a href="#example">Worked example</a>
            <a href="#verify">Verify before ordering</a>
          </nav>

          <div className="guide-body">
            <section id="answer">
              <p className="eyebrow">Quick answer</p>
              <h2>Volume first, bags last</h2>
              <p>
                Multiply length by width by thickness after converting every
                dimension to feet. Apply your project-specific allowance, then
                divide the order volume by the bag yield. Round only the final
                bag count upward because suppliers sell complete bags.
              </p>
              <a className="button button-primary guide-primary-action" href="/concrete-calculator">
                Calculate my slab now
              </a>
            </section>

            <section id="formula">
              <p className="eyebrow">The formula</p>
              <h2>Calculate concrete bags step by step</h2>
              <div className="formula-block guide-formula-block">
                <span>Net cubic feet</span>
                <code>length (ft) × width (ft) × thickness (ft)</code>
                <span>Order cubic feet</span>
                <code>net volume × (1 + allowance ÷ 100)</code>
                <span>Complete bags</span>
                <code>round up (order volume ÷ yield per bag)</code>
              </div>
              <p>
                When thickness is measured in inches, divide it by 12 before
                multiplying. To convert cubic feet to cubic yards, divide by 27.
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

            <section id="example">
              <p className="eyebrow">Worked example</p>
              <h2>A 9 ft × 9 ft slab, 4 inches thick</h2>
              <ol className="guide-calculation-steps">
                <li>Convert thickness: 4 in ÷ 12 = 0.333333 ft.</li>
                <li>Find net volume: 9 × 9 × 0.333333 = 27 ft³.</li>
                <li>With 0% allowance, the result is exactly 1 yd³.</li>
                <li>For the 80 lb example: 27 ÷ 0.60 = 45 complete bags.</li>
              </ol>
              <p>
                If you add an allowance, apply it to the 27 ft³ net volume
                before dividing by the bag yield.
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
              <h2 id="bag-faq-title">Concrete bag FAQ</h2>
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
                Open the <a href="/concrete-calculator">BuildMeasure Concrete Calculator</a> and keep the product yield adjustable.
              </p>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
