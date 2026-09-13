import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How Much Gravel Do I Need for a Driveway?",
  description:
    "Calculate how much gravel a driveway needs in cubic yards, estimated tons, and bags from area, installed depth, allowance, and verified bulk density.",
  alternates: { canonical: "/guides/how-much-gravel-do-i-need" },
  openGraph: {
    type: "article",
    title: "How Much Gravel Do I Need for a Driveway?",
    description:
      "A driveway gravel quantity guide with cubic yards, estimated tons, bags, density, and compaction checks.",
  },
};

const faqs = [
  {
    question: "How do I calculate cubic yards of gravel?",
    answer:
      "Multiply length by width by depth after converting depth to feet, then divide cubic feet by 27. Apply any project-specific allowance after finding the net geometric volume.",
  },
  {
    question: "How many tons are in a cubic yard of gravel?",
    answer:
      "There is no single reliable answer because tonnage depends on the aggregate's bulk density and whether the quoted condition is loose or compacted. Multiply volume by a density supplied for the actual material and state.",
  },
  {
    question: "Does the calculator include compaction?",
    answer:
      "No hidden compaction factor is applied. Enter a project allowance only when it matches your plan, and use a density whose loose or compacted condition matches the volume being estimated.",
  },
  {
    question: "Should I order gravel by volume or weight?",
    answer:
      "Calculate the geometric volume first, then convert it to estimated weight only when the supplier sells by mass. Confirm the supplier's delivery increment and density basis before ordering.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How Much Gravel Do I Need for a Driveway?",
    description:
      "A transparent method for converting driveway area and installed depth into gravel volume, estimated mass, tons, and bags.",
    datePublished: "2026-08-11",
    dateModified: "2026-08-13",
    mainEntityOfPage: absoluteUrl("/guides/how-much-gravel-do-i-need"),
    author: { "@type": "Organization", name: "BuildNumbers", url: absoluteUrl("/about") },
    publisher: { "@type": "Organization", name: "BuildNumbers", url: absoluteUrl("/") },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Gravel Calculator", item: absoluteUrl("/gravel-calculator") },
      { "@type": "ListItem", position: 3, name: "How Much Gravel Do I Need for a Driveway?", item: absoluteUrl("/guides/how-much-gravel-do-i-need") },
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

export default function GravelGuidePage() {
  return (
    <>
      <SiteHeader ctaHref="/gravel-calculator" ctaLabel="Open Gravel Calculator" />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <section className="utility-page-hero guide-hero">
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <a href="/">Home</a><span aria-hidden="true">/</span>
              <a href="/gravel-calculator">Gravel Calculator</a><span aria-hidden="true">/</span>
              <span>Gravel Quantity Guide</span>
            </nav>
            <p className="eyebrow">Gravel estimating guide</p>
            <h1>How much gravel do I need for a driveway?</h1>
            <p>
              Measure the driveway area and installed gravel depth first, then convert
              that volume to cubic yards, estimated tons, or bags with a verified density.
            </p>
            <div className="guide-meta">
              <span>Published August 11, 2026</span>
              <span>Keeps volume and material density separate</span>
            </div>
          </div>
        </section>

        <article className="shell guide-article">
          <nav className="guide-toc" aria-label="On this page">
            <strong>On this page</strong>
            <a href="#answer">Quick answer</a>
            <a href="#formula">Gravel formula</a>
            <a href="#depth">Depth table</a>
            <a href="#density">Density and tons</a>
            <a href="#example">Worked example</a>
            <a href="#verify">Before ordering</a>
          </nav>

          <div className="guide-body">
            <section id="answer">
              <p className="eyebrow">Quick answer</p>
              <h2>Driveway gravel starts with area × installed depth</h2>
              <p>
                For a rectangular driveway, multiply length by width by the installed
                gravel depth after converting all dimensions to one unit. Apply a visible allowance only when the
                project needs it. Convert volume to mass using a bulk density
                that matches the exact aggregate and its loose or compacted state.
              </p>
              <a className="button button-primary guide-primary-action" href="/gravel-calculator">
                Calculate my gravel now
              </a>
            </section>

            <section id="formula">
              <p className="eyebrow">The formula</p>
              <h2>Calculate volume, tons, and bags</h2>
              <div className="formula-block guide-formula-block">
                <span>Net volume</span><code>length × width × installed depth</code>
                <span>Order volume</span><code>net volume × (1 + allowance ÷ 100)</code>
                <span>Estimated mass</span><code>order volume × selected bulk density</code>
                <span>Complete bags</span><code>round up (estimated mass ÷ bag weight)</code>
              </div>
              <p>
                When using feet and inches, divide depth in inches by 12 before
                multiplying. Divide cubic feet by 27 to report cubic yards. Keep
                the unrounded volume for later steps.
              </p>
            </section>

            <section id="depth">
              <p className="eyebrow">Reference table</p>
              <h2>Net gravel volume for 100 ft²</h2>
              <p>These geometric values exclude allowance, compaction, and density.</p>
              <div className="guide-table-wrap">
                <table>
                  <caption>Rectangular coverage at common installed depths</caption>
                  <thead><tr><th>Depth</th><th>Cubic feet</th><th>Cubic yards</th></tr></thead>
                  <tbody>
                    <tr><td>2 in</td><td>16.667</td><td>0.617</td></tr>
                    <tr><td>3 in</td><td>25.000</td><td>0.926</td></tr>
                    <tr><td>4 in</td><td>33.333</td><td>1.235</td></tr>
                    <tr><td>6 in</td><td>50.000</td><td>1.852</td></tr>
                  </tbody>
                </table>
              </div>
              <p>
                Uneven excavation, slopes, settlement, and field compaction can
                make the installed project differ from a rectangular planning model.
              </p>
            </section>

            <section id="density">
              <p className="eyebrow">Material input</p>
              <h2>One cubic yard does not have one universal weight</h2>
              <p>
                ASTM C29/C29M covers aggregate bulk density in loose and
                compacted conditions. That distinction matters because identical
                geometric volumes can contain different material mass. Ask for
                supplier or test data that matches the condition you are ordering.
              </p>
              <p>
                As an explicit planning example, USACE HEC-HMS documents 93
                lb/ft³ (about 1,490 kg/m³) as a default dry value for sand through
                gravel and says it should be replaced when another value better
                matches the watershed. BuildNumbers exposes the value instead of
                treating it as a universal gravel density.
              </p>
              <div className="guide-assumption-grid">
                <div><strong>Geometry</strong><span>Length × width × placed depth</span></div>
                <div><strong>Density state</strong><span>Loose or compacted must match the volume</span></div>
                <div><strong>Weight order</strong><span>Confirm short tons or metric tonnes</span></div>
                <div><strong>Bag order</strong><span>Use exact packaged weight</span></div>
              </div>
              <p>
                Sources: <a href="https://store.astm.org/c0029_c0029m-23.html" target="_blank" rel="noreferrer">ASTM C29/C29M-23</a> and <a href="https://www.hec.usace.army.mil/confluence/hmsdocs/hmsum/4.11/erosion-and-sediment-transport/watershed-sediment-properties" target="_blank" rel="noreferrer">USACE HEC-HMS sediment properties</a>.
              </p>
            </section>

            <section id="example">
              <p className="eyebrow">Worked example</p>
              <h2>A 12 ft × 50 ft driveway area, 4 inches deep</h2>
              <p>Use 10% allowance, 93 lb/ft³ example density, and 50 lb bags. The 4 in depth is an arithmetic example, not a universal driveway specification.</p>
              <ol className="guide-calculation-steps">
                <li>Net volume: 12 × 50 × (4 ÷ 12) = 200 ft³.</li>
                <li>Net cubic yards: 200 ÷ 27 = 7.407 yd³.</li>
                <li>Order volume: 200 × 1.10 = 220 ft³ = 8.148 yd³.</li>
                <li>Estimated mass: 220 × 93 = 20,460 lb.</li>
                <li>Short tons: 20,460 ÷ 2,000 = 10.23 tons.</li>
                <li>Complete bags: round up (20,460 ÷ 50) = 410 bags.</li>
              </ol>
              <p>
                Changing density changes the estimated tons and bags, not the
                measured volume. Recalculate with supplier data before purchase.
              </p>
            </section>

            <section id="verify">
              <p className="eyebrow">Before purchase</p>
              <h2>Verify the site and supplier assumptions</h2>
              <ul>
                <li>Measure the prepared area and installed depth at multiple points.</li>
                <li>Confirm the aggregate type, grading, moisture, and intended use.</li>
                <li>Match loose or compacted density to the estimated volume state.</li>
                <li>Confirm delivery units, minimum loads, and whether compaction is already considered.</li>
                <li>Use qualified project guidance for drainage, base preparation, slopes, and structural work.</li>
              </ul>
            </section>

            <section className="faq-list guide-faq" aria-labelledby="gravel-guide-faq-title">
              <p className="eyebrow">Common questions</p>
              <h2 id="gravel-guide-faq-title">Gravel quantity FAQ</h2>
              {faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary>{faq.question}<span aria-hidden="true">+</span></summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </section>

            <div className="utility-callout">
              <strong>Need cubic yards, tons, tonnes, and bags in one result?</strong>
              <p>
                Open the <a href="/gravel-calculator">BuildNumbers Gravel Calculator</a> and replace the example density with supplier data.
              </p>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
