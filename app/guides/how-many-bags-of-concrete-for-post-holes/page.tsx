import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl } from "@/lib/site";

const GUIDE_PATH = "/guides/how-many-bags-of-concrete-for-post-holes";

export const metadata: Metadata = {
  title: "How Many Bags of Concrete for Post Holes?",
  description:
    "Calculate concrete bags for round post holes from hole count, diameter, concrete depth, optional post displacement, allowance, and 40, 60, or 80 lb bag yields.",
  alternates: { canonical: GUIDE_PATH },
  openGraph: {
    type: "article",
    title: "How Many Bags of Concrete for Post Holes?",
    description:
      "A reference-backed guide to turning round post-hole dimensions into concrete volume and complete bag quantities without prescribing structural hole size.",
  },
};

const faqs = [
  {
    question: "How many 80 lb bags of concrete are needed for a 12 inch by 24 inch post hole?",
    answer:
      "For one 12 inch diameter round hole with 24 inches of concrete depth, no post displacement, and no extra allowance, the volume is about 1.571 cubic feet. Using an example published yield of 0.60 cubic feet per 80 lb bag, the quantity rounds up to 3 complete bags.",
  },
  {
    question: "How many 80 lb bags are needed for four 12 inch by 24 inch holes?",
    answer:
      "Four identical 12 inch diameter by 24 inch concrete-depth holes contain about 6.283 cubic feet before allowance. With a 10% allowance, the order volume is about 6.912 cubic feet, which rounds up to 12 complete 80 lb bags at a 0.60 cubic-foot yield.",
  },
  {
    question: "Should I subtract the volume of the post?",
    answer:
      "Only when the entered post shape and size reasonably match the volume that actually occupies the concrete-filled depth. JobsiteQuant can subtract a round or square post and assumes that post occupies the full entered concrete depth when displacement is enabled.",
  },
  {
    question: "How deep or wide should a post hole be?",
    answer:
      "This guide does not choose hole diameter, embedment depth, footing geometry, reinforcement, or structural post size. Those requirements depend on the project, soil, loads, frost conditions, local code, and other design factors that must be determined separately.",
  },
  {
    question: "Why can the bag count differ from the number printed on another concrete product?",
    answer:
      "Bag yield is product-specific. The examples here use published Sakrete High-Strength Concrete Mix yields of 0.30, 0.45, and 0.60 cubic feet for 40, 60, and 80 lb bags. Check the current yield for the exact product you plan to buy.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How Many Bags of Concrete for Post Holes?",
    description:
      "A material-estimating guide for converting round post-hole dimensions into concrete volume and complete bag quantities.",
    datePublished: "2026-08-13",
    dateModified: "2026-08-13",
    mainEntityOfPage: absoluteUrl(GUIDE_PATH),
    author: {
      "@type": "Person",
      name: "Hosyss",
      url: "https://github.com/Hosyss",
    },
    publisher: {
      "@type": "Organization",
      name: "JobsiteQuant",
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
        name: "Post Hole Concrete Calculator",
        item: absoluteUrl("/post-hole-concrete-calculator"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Concrete Bags for Post Holes",
        item: absoluteUrl(GUIDE_PATH),
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

export default function PostHoleConcreteBagGuidePage() {
  return (
    <>
      <SiteHeader ctaHref="/post-hole-concrete-calculator" ctaLabel="Open Post Hole Calculator" />
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
              <a href="/post-hole-concrete-calculator">Post Hole Concrete Calculator</a>
              <span aria-hidden="true">/</span>
              <span>Post-hole bag guide</span>
            </nav>
            <p className="eyebrow">Post-hole concrete guide</p>
            <h1>How many bags of concrete do I need for post holes?</h1>
            <p>
              Start with the round-hole volume, multiply by the number of holes,
              subtract post displacement only when it matches the real geometry,
              then apply your allowance and the current yield for the exact mix.
            </p>
            <div className="guide-meta">
              <span>Published August 13, 2026</span>
              <span>Reviewed against Post-hole engine v0.1.0</span>
            </div>
          </div>
        </section>

        <article className="shell guide-article">
          <nav className="guide-toc" aria-label="On this page">
            <strong>On this page</strong>
            <a href="#answer">Quick answer</a>
            <a href="#formula">Post-hole formula</a>
            <a href="#example">Worked example</a>
            <a href="#table">Hole-count reference</a>
            <a href="#posts">Post displacement</a>
            <a href="#allowance">Allowance and bag yield</a>
            <a href="#verify">What this guide does not design</a>
          </nav>

          <div className="guide-body">
            <section id="answer">
              <p className="eyebrow">Quick answer</p>
              <h2>Find the concrete volume first, then round complete bags up</h2>
              <p>
                For a round hole, calculate cylindrical volume from the diameter
                and concrete depth. Multiply by the whole-number hole count,
                subtract only the post volume that actually occupies the
                concrete-filled depth, and then apply the project allowance. To
                estimate bags, divide the final order volume by the yield for the
                exact concrete product and round the package count upward.
              </p>
              <a className="button button-primary guide-primary-action" href="/post-hole-concrete-calculator">
                Calculate my post holes
              </a>
            </section>

            <section id="formula">
              <p className="eyebrow">The formula</p>
              <h2>Concrete volume for round post holes</h2>
              <div className="formula-block guide-formula-block">
                <span>Gross volume per hole</span>
                <code>π × (diameter ÷ 2)² × concrete depth</code>
                <span>Net volume per hole</span>
                <code>gross hole volume − optional post displacement</code>
                <span>Total net concrete</span>
                <code>net volume per hole × hole count</code>
                <span>Order volume</span>
                <code>total net volume × (1 + allowance ÷ 100)</code>
                <span>Complete bags</span>
                <code>round up (order cubic feet ÷ yield per bag)</code>
              </div>
              <p>
                Keep all dimensions in one unit system during the geometry step.
                JobsiteQuant converts internally with exact international-foot,
                inch, and yard definitions and keeps full precision until display
                or final package rounding.
              </p>
            </section>

            <section id="example">
              <p className="eyebrow">Worked example</p>
              <h2>One 12-inch diameter hole with 24 inches of concrete depth</h2>
              <p>
                This is a controlled calculation example, <strong>not a recommended
                hole size</strong>. It uses no post displacement and no extra
                allowance so the geometry can be checked independently.
              </p>
              <ol className="guide-calculation-steps">
                <li>Radius: 12 in diameter ÷ 2 = 6 in = 0.5 ft.</li>
                <li>Concrete depth: 24 in = 2 ft.</li>
                <li>Volume: π × 0.5² × 2 = 1.570796 ft³.</li>
                <li>Cubic yards: 1.570796 ÷ 27 = 0.058178 yd³.</li>
                <li>80 lb example: 1.570796 ÷ 0.60 = 2.618 → 3 complete bags.</li>
              </ol>
              <p>
                Using the same published example yields, this one-hole volume
                rounds to 6 × 40 lb bags, 4 × 60 lb bags, or 3 × 80 lb bags.
              </p>
            </section>

            <section id="table">
              <p className="eyebrow">Reference calculation</p>
              <h2>What changes when the number of identical holes changes?</h2>
              <p>
                The table holds the example geometry fixed at 12 inches diameter
                and 24 inches of concrete depth, with no post displacement. The
                dimensions are examples only, not design recommendations. The
                last two columns use the 0.60 ft³ example yield for an 80 lb bag.
              </p>
              <div className="guide-table-wrap">
                <table>
                  <caption>Example quantity for identical round holes</caption>
                  <thead>
                    <tr>
                      <th>Hole count</th>
                      <th>Net ft³</th>
                      <th>Net yd³</th>
                      <th>80 lb bags, 0%</th>
                      <th>80 lb bags, 10%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>1</td><td>1.571</td><td>0.058</td><td>3</td><td>3</td></tr>
                    <tr><td>2</td><td>3.142</td><td>0.116</td><td>6</td><td>6</td></tr>
                    <tr><td>4</td><td>6.283</td><td>0.233</td><td>11</td><td>12</td></tr>
                    <tr><td>6</td><td>9.425</td><td>0.349</td><td>16</td><td>18</td></tr>
                    <tr><td>8</td><td>12.566</td><td>0.465</td><td>21</td><td>24</td></tr>
                  </tbody>
                </table>
              </div>
              <p>
                Package counts jump in whole bags because procurement rounding is
                applied after the full-precision order volume is calculated.
              </p>
            </section>

            <section id="posts">
              <p className="eyebrow">Optional geometry</p>
              <h2>Subtract a post only when the displacement assumption fits</h2>
              <p>
                A post occupies some of the cylindrical hole volume, but the
                amount depends on its shape, size, and how much of the entered
                concrete depth it actually occupies. JobsiteQuant supports one
                centered round or square post per hole. When displacement is
                enabled, it assumes the post occupies the full entered concrete
                depth.
              </p>
              <p>
                A passing fit check is geometric only. It does not certify
                clearance, strength, embedment, soil performance, or code
                compliance. If the full-depth displacement assumption does not
                match the project, leave displacement off rather than forcing an
                inaccurate subtraction.
              </p>
            </section>

            <section id="allowance">
              <p className="eyebrow">Purchase inputs</p>
              <h2>Allowance and bag yield are separate decisions</h2>
              <p>
                An allowance accounts for project variation such as
                over-excavation, spillage, and site irregularities; it is not part
                of the cylinder geometry. JobsiteQuant applies the selected
                allowance after net concrete volume is known.
              </p>
              <div className="guide-assumption-grid">
                <div><strong>40 lb example</strong><span>0.30 ft³ per bag</span></div>
                <div><strong>60 lb example</strong><span>0.45 ft³ per bag</span></div>
                <div><strong>80 lb example</strong><span>0.60 ft³ per bag</span></div>
                <div><strong>Final bag count</strong><span>Always rounded upward</span></div>
              </div>
              <p>
                The example yields come from Sakrete High-Strength Concrete Mix.
                Use the current yield printed for the exact product you intend to
                buy because other mixes can differ.
              </p>
              <p>
                If you know your local package price, the calculator also lets
                you enter an optional price per selected bag and shows an
                approximate material cost. JobsiteQuant does not fetch prices,
                convert currencies, or infer tax, delivery, labor, discounts, or
                supplier minimums.
              </p>
              <p>
                Source: <a href="https://www.sakrete.com/product/high-strength-concrete-mix/" target="_blank" rel="noreferrer">Sakrete High-Strength Concrete Mix product data</a>.
              </p>
            </section>

            <section id="verify">
              <p className="eyebrow">Safety boundary</p>
              <h2>What a material calculator cannot choose for you</h2>
              <p>
                This guide estimates quantity from dimensions you already have.
                It does not determine the dimensions themselves. Before purchase
                or construction, separately verify:
              </p>
              <ul>
                <li>Hole diameter and embedment depth for the actual project.</li>
                <li>Soil, frost, drainage, wind, loading, and local code requirements.</li>
                <li>Post size, footing geometry, reinforcement, and structural details.</li>
                <li>The current yield and suitability of the exact concrete product.</li>
                <li>The allowance needed for the measured site conditions.</li>
              </ul>
              <p>
                For unit references, JobsiteQuant uses NIST conversion factors
                and volume-unit definitions. See the <a href="/methodology">calculation methodology</a> for how formulas, assumptions, and QA evidence are handled.
              </p>
            </section>

            <section className="faq-list guide-faq" aria-labelledby="post-hole-guide-faq-title">
              <p className="eyebrow">Common questions</p>
              <h2 id="post-hole-guide-faq-title">Post-hole concrete bag FAQ</h2>
              {faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary>{faq.question}<span aria-hidden="true">+</span></summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </section>

            <div className="utility-callout">
              <strong>Have the hole count, diameter, and concrete depth?</strong>
              <p>
                Open the <a href="/post-hole-concrete-calculator">JobsiteQuant Post Hole Concrete Calculator</a> for cubic feet, cubic yards, metric volume, post displacement, allowance, complete bags, and optional user-entered package cost.
              </p>
            </div>

            <div className="utility-callout">
              <strong>Estimating a rectangular slab instead?</strong>
              <p>
                Use the <a href="/guides/how-many-bags-of-concrete">concrete slab bag guide</a> or open the <a href="/concrete-calculator">Concrete Calculator</a> for rectangular slab geometry.
              </p>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
