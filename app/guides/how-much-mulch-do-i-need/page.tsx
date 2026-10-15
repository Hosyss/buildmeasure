import type { Metadata } from "next";
import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How Much Mulch Do I Need?",
  description:
    "Calculate mulch cubic yards and bags from landscape-bed area, installed depth, exact bag volume, and an adjustable project allowance.",
  alternates: { canonical: "/guides/how-much-mulch-do-i-need" },
  openGraph: {
    type: "article",
    title: "How Much Mulch Do I Need?",
    description:
      "A transparent mulch volume and bag formula with depth and top-up guidance.",
  },
};

const faqs = [
  {
    question: "How do I calculate cubic yards of mulch?",
    answer:
      "Multiply bed length by width by installed depth after converting depth to feet, then divide cubic feet by 27. Add only the project allowance you intend to use.",
  },
  {
    question: "How many square feet does a bag of mulch cover?",
    answer:
      "Divide the bag's net cubic volume by the installed depth in feet. A 2 ft³ bag covers 8 ft² at 3 inches because 2 divided by 0.25 equals 8.",
  },
  {
    question: "How deep should mulch be?",
    answer:
      "EPA WaterSense says three to four inches suits most plants while excessive mulch can restrict water flow. Plant, soil, drainage, climate, and mulch type still matter, so use local guidance for the final depth.",
  },
  {
    question: "How do I calculate a mulch top-up?",
    answer:
      "Enter only the additional depth needed above the existing layer. Using the full finished depth for a top-up would count material already in the bed.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How Much Mulch Do I Need?",
    description:
      "A transparent method for converting rectangular bed area and installed depth into cubic yards, bag coverage, and complete bags.",
    datePublished: "2026-08-11",
    dateModified: "2026-10-16",
    mainEntityOfPage: absoluteUrl("/guides/how-much-mulch-do-i-need"),
    author: { "@type": "Organization", name: "BuildMeasure", url: absoluteUrl("/about") },
    publisher: { "@type": "Organization", name: "BuildMeasure", url: absoluteUrl("/") },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Mulch Calculator", item: absoluteUrl("/mulch-calculator") },
      { "@type": "ListItem", position: 3, name: "How Much Mulch Do I Need?", item: absoluteUrl("/guides/how-much-mulch-do-i-need") },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question", name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  },
];

export default function MulchGuidePage() {
  return (
    <>
      <SiteHeader ctaHref="/mulch-calculator" ctaLabel="Open Mulch Calculator" />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <section className="utility-page-hero guide-hero">
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <a href="/">Home</a><span aria-hidden="true">/</span>
              <a href="/mulch-calculator">Mulch Calculator</a><span aria-hidden="true">/</span>
              <span>Mulch Quantity Guide</span>
            </nav>
            <p className="eyebrow">Mulch estimating guide</p>
            <h1>How much mulch do I need?</h1>
            <p>
              Turn measured landscape-bed area and the additional installed
              depth into cubic yards or complete bags without inventing density.
            </p>
            <div className="guide-meta">
              <span>Published August 11, 2026</span>
              <span>Updated October 16, 2026</span>
              <span>By <a href="/about">BuildMeasure</a></span>
            </div>
          </div>
        </section>

        <article className="shell guide-article">
          <nav className="guide-toc" aria-label="On this page">
            <strong>On this page</strong>
            <a href="#answer">Quick answer</a>
            <a href="#formula">Mulch formula</a>
            <a href="#coverage">Bag coverage table</a>
            <a href="#depth">Choose a depth</a>
            <a href="#example">Worked example</a>
            <a href="#top-up">Measure a top-up order</a>
            <a href="#verify">Before ordering</a>
          </nav>

          <div className="guide-body">
            <section id="answer">
              <p className="eyebrow">Quick answer</p>
              <h2>Calculate the new layer, not the material already present</h2>
              <p>
                Multiply bed area by the additional depth you need. Apply a
                visible allowance, then divide by the exact net volume printed
                on the bag and round complete bags upward. For bulk delivery,
                divide cubic feet by 27 to report cubic yards.
              </p>
              <a className="button button-primary guide-primary-action" href="/mulch-calculator">
                Calculate my mulch now
              </a>
            </section>

            <section id="formula">
              <p className="eyebrow">The formula</p>
              <h2>Calculate cubic yards and bags</h2>
              <div className="formula-block guide-formula-block">
                <span>Bed area</span><code>length × width</code>
                <span>Net volume</span><code>bed area × additional installed depth</code>
                <span>Order volume</span><code>net volume × (1 + allowance ÷ 100)</code>
                <span>Complete bags</span><code>round up (order volume ÷ net bag volume)</code>
              </div>
              <p>
                Divide depth in inches by 12 when area is in square feet. Estimate
                by volume rather than weight because particle size, material type,
                and moisture can change weight without changing the package label.
              </p>
            </section>

            <section id="coverage">
              <p className="eyebrow">Reference table</p>
              <h2>Square feet covered by one bag</h2>
              <p>Coverage equals net bag volume divided by installed depth.</p>
              <div className="guide-table-wrap">
                <table>
                  <caption>Exact geometric coverage before allowance</caption>
                  <thead><tr><th>Bag volume</th><th>2 in deep</th><th>3 in deep</th><th>4 in deep</th></tr></thead>
                  <tbody>
                    <tr><td>1.5 ft³</td><td>9 ft²</td><td>6 ft²</td><td>4.5 ft²</td></tr>
                    <tr><td>2 ft³</td><td>12 ft²</td><td>8 ft²</td><td>6 ft²</td></tr>
                    <tr><td>3 ft³</td><td>18 ft²</td><td>12 ft²</td><td>9 ft²</td></tr>
                  </tbody>
                </table>
              </div>
              <p>
                Use the bag&apos;s net volume, not its weight or the bag&apos;s
                outside dimensions. Package sizes differ by product and market.
              </p>
            </section>

            <section id="depth">
              <p className="eyebrow">Horticultural input</p>
              <h2>Choose depth for the actual bed and planting plan</h2>
              <p>
                EPA WaterSense states that three to four inches gives suitable
                coverage for most plants, while too much can restrict water from
                reaching roots. It also recommends leaving space between organic
                mulch and tree or woody-plant bases to help prevent rot.
              </p>
              <p>
                That guidance is context, not an automatic calculator setting.
                Existing depth, soil, drainage, plant type, mulch particle size,
                climate, decomposition, and local recommendations may require a
                different added layer.
              </p>
              <div className="guide-rule">
                <strong>Top-up rule</strong>
                <p>
                  If 2 inches remain and the target is 3 inches, estimate a
                  1-inch addition—not a new 3-inch layer.
                </p>
              </div>
              <p>
                Source: <a href="https://www.epa.gov/watersense/landscaping-tips" target="_blank" rel="noreferrer">U.S. EPA WaterSense Landscaping Tips</a>.
              </p>
            </section>

            <section id="example">
              <p className="eyebrow">Worked example</p>
              <h2>A 20 ft × 10 ft bed with a 3-inch layer</h2>
              <p>Use 10% allowance and bags labeled 2 ft³.</p>
              <ol className="guide-calculation-steps">
                <li>Bed area: 20 × 10 = 200 ft².</li>
                <li>Depth in feet: 3 ÷ 12 = 0.25 ft.</li>
                <li>Net volume: 200 × 0.25 = 50 ft³ = 1.852 yd³.</li>
                <li>Order volume: 50 × 1.10 = 55 ft³ = 2.037 yd³.</li>
                <li>Coverage per bag: 2 ÷ 0.25 = 8 ft².</li>
                <li>Complete bags: round up (55 ÷ 2) = 28 bags.</li>
              </ol>
              <p>
                The 28 bags contain 56 ft³, so one cubic foot above the 55 ft³
                requirement comes from final package rounding.
              </p>
            </section>

            <section id="top-up">
              <p className="eyebrow">A top-up purchase plan</p>
              <h2>Measure what remains before buying another full layer</h2>
              <figure style={{ margin: "1.5rem 0" }}>
                <Image src="/guides/mulch-top-up-section.svg" width={640} height={360}
                  alt="A mulch cross-section shows 50 millimeters of existing material plus a new 25 millimeter layer to reach an illustrative 75 millimeter target."
                  style={{ width: "100%", height: "auto" }} />
                <figcaption>Original BuildMeasure top-up diagram. Choose the target depth using guidance suitable for the plants and site.</figcaption>
              </figure>
              <p>
                Check the retained layer in several places rather than measuring
                only the deepest mound. Exclude areas that will stay bare or
                must remain clear around plant bases. If existing depths differ
                substantially, split the bed into zones and estimate each added
                depth separately. A single average can overfill one zone while
                leaving another short.
              </p>
              <p>
                Suppose two measured zones, after exclusions, are 6 × 1.2 m
                and 3 × 1 m. Their combined area is 10.2 m². For this example,
                the retained layer is 50 mm throughout and a locally selected
                target is 75 mm. Estimate only the additional 25 mm. The
                example does not prescribe a target for your plants.
              </p>
              <ol className="guide-calculation-steps">
                <li>Added depth: (75 − 50) ÷ 1,000 = 0.025 m.</li>
                <li>Net new volume: 10.2 × 0.025 = 0.255 m³ = 255 L.</li>
                <li>With an illustrative 10% allowance: 255 × 1.10 = 280.5 L.</li>
                <li>For 40 L bags: round up (280.5 ÷ 40) = 8 bags, containing 320 L.</li>
                <li>For 50 L bags: round up (280.5 ÷ 50) = 6 bags, containing 300 L.</li>
              </ol>
              <p>
                Entering the entire 75 mm finished depth would instead produce
                841.5 L after the same allowance, or 22 complete 40 L bags.
                That counts retained mulch as if it were absent. The difference
                is 14 bags in this example, before considering any actual
                variation in depth or usable existing material.
              </p>
              <h3>Compare bag volume with a bulk quote</h3>
              <p>
                For a bulk quote, the allowance-included requirement is
                0.2805 m³. Ask about minimum delivery volume and the sale
                increment before comparing it with the eight-bag option.
                Compare like materials and include delivery or collection costs;
                fewer bags do not automatically mean a cheaper or more suitable
                product.
              </p>
              <p>
                A weight label cannot replace the bag&apos;s net volume in this
                calculation. If a product expands after preparation, follow its
                declared coverage and instructions rather than treating the
                compressed package dimensions as usable installed volume.
                Keep any settling or project allowance visible instead of
                inventing a conversion from kilograms to liters.
              </p>
            </section>

            <section id="verify">
              <p className="eyebrow">Before purchase</p>
              <h2>Verify the bed, depth, and package</h2>
              <ul>
                <li>Break irregular beds into measured shapes and combine their volumes.</li>
                <li>Measure existing mulch before choosing the additional depth.</li>
                <li>Confirm the mulch type is appropriate for the plants and site.</li>
                <li>Use the exact bag volume or supplier bulk-delivery increment.</li>
                <li>Keep mulch clear of trunks and stems according to local horticultural guidance.</li>
              </ul>
            </section>

            <section className="faq-list guide-faq" aria-labelledby="mulch-guide-faq-title">
              <p className="eyebrow">Common questions</p>
              <h2 id="mulch-guide-faq-title">Mulch quantity FAQ</h2>
              {faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary>{faq.question}<span aria-hidden="true">+</span></summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </section>

            <div className="utility-callout">
              <strong>Need cubic yards, liters, coverage, and bags in one result?</strong>
              <p>
                Open the <a href="/mulch-calculator">BuildMeasure Mulch Calculator</a> and enter the exact package volume.
              </p>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
