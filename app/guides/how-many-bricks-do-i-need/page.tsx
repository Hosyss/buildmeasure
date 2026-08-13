import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl } from "@/lib/site";

const GUIDE_PATH = "/guides/how-many-bricks-do-i-need";

export const metadata: Metadata = {
  title: "How Many Bricks Do I Need for a Wall?",
  description:
    "Estimate fired-clay bricks for a wall from net wall area, BIA brick coverage rates, measured openings, and an explicit waste allowance.",
  alternates: { canonical: GUIDE_PATH },
  openGraph: {
    type: "article",
    title: "How Many Bricks Do I Need for a Wall?",
    description:
      "A reference-backed guide to calculating fired-clay brick quantity from net wall area, documented coverage, openings, and waste.",
  },
};

const faqs = [
  {
    question: "How many modular bricks do I need per square foot?",
    answer:
      "Brick Industry Association Technical Note 10 Table 4 lists 675 Modular bricks per 100 square feet for its running- or stack-bond estimating basis. That equals 6.75 bricks per square foot before any waste or breakage allowance.",
  },
  {
    question: "Should I subtract doors and windows before calculating bricks?",
    answer:
      "Yes. The BIA wall-area method starts with net wall area, so measured openings that will not receive brick are subtracted from gross wall area before the brick coverage rate and waste allowance are applied.",
  },
  {
    question: "How much extra brick should I order for waste and breakage?",
    answer:
      "BIA Technical Note 10 gives at least 5% as a general rule for brick breakage and waste and notes that project conditions or experience can justify more. BuildMeasure keeps the allowance explicit rather than assuming one percentage fits every job.",
  },
  {
    question: "Does this method include mortar?",
    answer:
      "No. This guide estimates fired-clay brick quantity only. It does not estimate mortar or grout. The BIA coverage presets already represent documented wall-area estimating quantities; BuildMeasure does not add a separate invented mortar-volume calculation to this guide.",
  },
  {
    question: "Can I use the same brick count for English or Flemish bond?",
    answer:
      "Not unchanged. BIA Table 4 is based on running or stack bond, while patterns that incorporate headers require separate correction factors. This guide does not apply those corrections.",
  },
  {
    question: "Can I use this guide for concrete brick or blocks?",
    answer:
      "Not as a verified BuildMeasure assumption. BIA states that its Technical Notes are based on fired-clay brick and should not be assumed to apply to concrete, fly-ash, or other non-clay units. Use product- and project-specific data for those materials.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How Many Bricks Do I Need for a Wall?",
    description:
      "A material-estimating guide for converting net wall area and a documented fired-clay brick coverage rate into a whole-brick purchase quantity.",
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
        name: "Brick Calculator",
        item: absoluteUrl("/brick-calculator"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "How Many Bricks Do I Need?",
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

export default function BrickWallGuidePage() {
  return (
    <>
      <SiteHeader ctaHref="/brick-calculator" ctaLabel="Open Brick Calculator" />
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
              <a href="/brick-calculator">Brick Calculator</a>
              <span aria-hidden="true">/</span>
              <span>Brick wall guide</span>
            </nav>
            <p className="eyebrow">Brick estimating guide</p>
            <h1>How many bricks do I need for a wall?</h1>
            <p>
              Calculate gross wall area, subtract measured openings, apply a
              documented fired-clay brick coverage rate, then add the waste or
              breakage allowance that fits the project.
            </p>
            <div className="guide-meta">
              <span>Published August 13, 2026</span>
              <span>Reviewed against Brick engine v0.1.0</span>
            </div>
          </div>
        </section>

        <article className="shell guide-article">
          <nav className="guide-toc" aria-label="On this page">
            <strong>On this page</strong>
            <a href="#answer">Quick answer</a>
            <a href="#formula">Brick formula</a>
            <a href="#example">Worked example</a>
            <a href="#table">Modular brick reference</a>
            <a href="#openings">Doors and windows</a>
            <a href="#waste">Waste and breakage</a>
            <a href="#limits">What this method does not cover</a>
          </nav>

          <div className="guide-body">
            <section id="answer">
              <p className="eyebrow">Quick answer</p>
              <h2>Use net wall area, not gross wall area</h2>
              <p>
                First multiply wall length by wall height. Subtract the measured
                area of doors, windows, or other openings that will not receive
                brick. Multiply that net wall area by the coverage rate for the
                brick you are actually estimating, apply the waste allowance,
                and round the final purchase quantity upward to whole bricks.
              </p>
              <a className="button button-primary guide-primary-action" href="/brick-calculator">
                Calculate my brick wall
              </a>
              <p>
                For one documented example, BIA Technical Note 10 Table 4 lists
                <strong> 675 Modular bricks per 100 ft²</strong> for its running-
                or stack-bond estimating basis. That is 6.75 bricks per ft²
                before waste.
              </p>
            </section>

            <section id="formula">
              <p className="eyebrow">The formula</p>
              <h2>Brick quantity from wall area and coverage</h2>
              <div className="formula-block guide-formula-block">
                <span>Gross wall area</span>
                <code>wall length × wall height</code>
                <span>Net wall area</span>
                <code>gross wall area − measured openings</code>
                <span>Exact net brick</span>
                <code>net wall area × brick coverage rate</code>
                <span>Bricks to order</span>
                <code>ceil(exact net brick × (1 + waste ÷ 100))</code>
              </div>
              <p>
                BuildMeasure keeps the exact net quantity unrounded internally.
                Waste is applied after the net estimate, then the final purchase
                quantity is rounded upward once so a fractional brick never
                becomes an understated order.
              </p>
            </section>

            <section id="example">
              <p className="eyebrow">Worked example</p>
              <h2>A 20 ft × 8 ft wall with 16 ft² of openings</h2>
              <p>
                This is a quantity example only. It uses the BIA Modular
                coverage rate and a 5% waste/breakage allowance; it does not
                recommend wall geometry, bond, or structural details.
              </p>
              <ol className="guide-calculation-steps">
                <li>Gross wall area: 20 ft × 8 ft = 160 ft².</li>
                <li>Net wall area: 160 − 16 = 144 ft².</li>
                <li>Modular coverage: 144 × 6.75 = 972 net bricks.</li>
                <li>Allowance: 972 × 1.05 = 1,020.6.</li>
                <li>Final order: round upward → 1,021 bricks.</li>
              </ol>
              <p>
                The same known-result vector is covered by the Brick Calculator
                engine tests, so the guide and interactive result share one
                verified calculation basis.
              </p>
            </section>

            <section id="table">
              <p className="eyebrow">Reference calculation</p>
              <h2>Modular brick count by net wall area</h2>
              <p>
                This table keeps the coverage fixed at the BIA Modular rate of
                675 brick per 100 ft² and applies a 5% allowance. It is a
                calculation reference, not a substitute for confirming the
                actual brick product or bond pattern.
              </p>
              <div className="guide-table-wrap">
                <table>
                  <caption>Example Modular brick quantities at 5% allowance</caption>
                  <thead>
                    <tr>
                      <th>Net wall area</th>
                      <th>Net brick</th>
                      <th>Order brick</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>50 ft²</td><td>337.5</td><td>355</td></tr>
                    <tr><td>100 ft²</td><td>675</td><td>709</td></tr>
                    <tr><td>150 ft²</td><td>1,012.5</td><td>1,064</td></tr>
                    <tr><td>200 ft²</td><td>1,350</td><td>1,418</td></tr>
                    <tr><td>250 ft²</td><td>1,687.5</td><td>1,772</td></tr>
                  </tbody>
                </table>
              </div>
              <p>
                If your supplier or project specification gives a different
                coverage rate, use that rate instead of forcing a preset that
                does not describe the brick being purchased.
              </p>
            </section>

            <section id="openings">
              <p className="eyebrow">Net area</p>
              <h2>Subtract measured openings before the brick rate</h2>
              <p>
                Doors and windows reduce the wall face that receives brick, so
                the BIA wall-area method uses gross wall area less openings. Add
                the measured areas of the openings that will not receive brick
                and subtract that total before multiplying by the coverage rate.
              </p>
              <p>
                The BuildMeasure calculator accepts one combined openings-area
                input. It does not add special jamb, sill, arch, corner, or
                bond-maintenance units, so those project details must be checked
                separately when they matter.
              </p>
            </section>

            <section id="waste">
              <p className="eyebrow">Purchase allowance</p>
              <h2>Add waste after the net quantity is known</h2>
              <p>
                BIA Technical Note 10 says to determine net brick quantities
                before allowances are added and gives <strong>at least 5%</strong>
                as a general rule for brick breakage and waste. It also notes
                that job conditions or experience can justify a higher
                percentage. BuildMeasure therefore defaults to 5% but leaves the
                value editable.
              </p>
              <p>
                If you know your current local price per brick, the calculator
                can multiply the rounded order quantity by that user-entered
                price. It does not fetch live prices, convert currencies, or
                infer tax, delivery, labor, discounts, or supplier minimums.
              </p>
            </section>

            <section id="limits">
              <p className="eyebrow">Scope boundary</p>
              <h2>Coverage is not the same as masonry design</h2>
              <p>
                BIA Table 4 quantities are based on running or stack bond.
                Header-containing patterns such as common, English, Flemish, or
                garden-wall bond require separate correction factors and are not
                modeled by this guide. The guide also does not estimate mortar,
                grout, wall thickness, wythes, anchors, reinforcement, lintels,
                foundations, structural capacity, or code compliance.
              </p>
              <p>
                BIA also states that its Technical Notes are based on fired-clay
                brick and should not automatically be applied to concrete,
                fly-ash, or other non-clay units. Confirm the material and
                coverage data for the exact product before ordering.
              </p>
              <p>
                Primary source: <a href="https://www.gobrick.com/media/file/10-dimensioning-and-estimating-brick-masonry.pdf" target="_blank" rel="noreferrer">Brick Industry Association Technical Note 10</a>.
                Material-scope reference: <a href="https://www.gobrick.com/resources/technical-notes" target="_blank" rel="noreferrer">BIA Technical Notes</a>.
                Unit conversions follow <a href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors" target="_blank" rel="noreferrer">NIST SP 811 Appendix B</a>.
              </p>
            </section>

            <section className="faq-list guide-faq" aria-labelledby="brick-guide-faq-title">
              <p className="eyebrow">Common questions</p>
              <h2 id="brick-guide-faq-title">Brick wall quantity FAQ</h2>
              {faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary>{faq.question}<span aria-hidden="true">+</span></summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </section>

            <div className="utility-callout">
              <strong>Have the wall dimensions and openings?</strong>
              <p>
                Open the <a href="/brick-calculator">BuildMeasure Brick Calculator</a> for BIA presets, a custom supplier/project coverage rate, waste allowance, metric/imperial inputs, whole-brick order rounding, and optional user-entered price per brick.
              </p>
            </div>

            <div className="utility-callout">
              <strong>Need the estimating workflow first?</strong>
              <p>
                Read <a href="/guides/material-estimating-basics">How to Estimate Construction Materials</a> for the broader geometry → allowance → product data → package rounding workflow.
              </p>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
