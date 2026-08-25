import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How Many Tiles Do I Need?",
  description:
    "Calculate tiles and full boxes from rectangular surface area, tile size, an adjustable waste allowance, and the carton quantity.",
  alternates: { canonical: "/guides/how-many-tiles-do-i-need" },
  openGraph: {
    type: "article",
    title: "How Many Tiles Do I Need?",
    description:
      "A transparent tile and box formula with waste, layout, and grout-joint checks.",
  },
};

const faqs = [
  {
    question: "How do I calculate how many tiles I need?",
    answer:
      "Divide the rectangular surface area by one tile's face area, multiply by one plus the project-specific waste percentage, round the required tiles upward, then divide by the tiles per box and round complete boxes upward.",
  },
  {
    question: "Is 10% extra tile always enough?",
    answer:
      "No. Ten percent can be a planning starting point, but pattern, cuts, breakage, tile variation, installer method, replacement stock, and supplier rules can require a different allowance.",
  },
  {
    question: "Does grout spacing reduce the tile purchase quantity?",
    answer:
      "JobsiteQuant keeps grout spacing out of the area-based purchase formula. Joint width helps check rows and columns, while the explicit waste allowance handles cut loss without pretending every grid position consumes a new tile.",
  },
  {
    question: "Can the formula estimate wall tile?",
    answer:
      "Yes for one rectangular wall. Enter width and height as the surface dimensions. Calculate separate rectangles and subtract measured openings carefully when the project is more complex.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How Many Tiles Do I Need?",
    description:
      "A transparent method for converting rectangular surface and tile dimensions into required tiles and complete boxes.",
    datePublished: "2026-08-11",
    dateModified: "2026-08-11",
    mainEntityOfPage: absoluteUrl("/guides/how-many-tiles-do-i-need"),
    author: {
      "@type": "Organization",
      name: "JobsiteQuant",
      url: absoluteUrl("/about"),
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
        name: "Tile Calculator",
        item: absoluteUrl("/tile-calculator"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "How Many Tiles Do I Need?",
        item: absoluteUrl("/guides/how-many-tiles-do-i-need"),
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

export default function TileGuidePage() {
  return (
    <>
      <SiteHeader ctaHref="/tile-calculator" ctaLabel="Open Tile Calculator" />
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
              <a href="/tile-calculator">Tile Calculator</a>
              <span aria-hidden="true">/</span>
              <span>Tile Quantity Guide</span>
            </nav>
            <p className="eyebrow">Tile estimating guide</p>
            <h1>How many tiles do I need?</h1>
            <p>
              Convert one rectangular floor or wall into required tiles, apply
              a visible allowance, then round the order to complete boxes.
            </p>
            <div className="guide-meta">
              <span>Published August 11, 2026</span>
              <span>Separates purchase quantity from layout planning</span>
            </div>
          </div>
        </section>

        <article className="shell guide-article">
          <nav className="guide-toc" aria-label="On this page">
            <strong>On this page</strong>
            <a href="#answer">Quick answer</a>
            <a href="#formula">Tile formula</a>
            <a href="#waste">Waste allowance</a>
            <a href="#table">Common tile sizes</a>
            <a href="#example">Worked example</a>
            <a href="#layout">Layout and grout</a>
            <a href="#verify">Before ordering</a>
          </nav>

          <div className="guide-body">
            <section id="answer">
              <p className="eyebrow">Quick answer</p>
              <h2>Area first, complete boxes last</h2>
              <p>
                Divide the rectangular surface area by one tile&apos;s face area.
                Apply the allowance selected for cuts, breakage, variation, and
                replacement stock. Round the required tile count upward, then
                divide by the exact carton quantity and round boxes upward.
              </p>
              <a className="button button-primary guide-primary-action" href="/tile-calculator">
                Calculate my tile order
              </a>
            </section>

            <section id="formula">
              <p className="eyebrow">The formula</p>
              <h2>Calculate tiles and boxes step by step</h2>
              <div className="formula-block guide-formula-block">
                <span>Surface area</span>
                <code>surface length × surface width</code>
                <span>Exact base tiles</span>
                <code>surface area ÷ one tile face area</code>
                <span>Required tiles</span>
                <code>round up (exact base tiles × (1 + waste ÷ 100))</code>
                <span>Complete boxes</span>
                <code>round up (required tiles ÷ tiles per box)</code>
              </div>
              <p>
                Convert every dimension to one consistent unit before finding
                area. A 12 in × 24 in tile has a face area of 2 ft² because its
                dimensions are 1 ft × 2 ft.
              </p>
            </section>

            <section id="waste">
              <p className="eyebrow">Project input</p>
              <h2>Use an allowance that matches the layout</h2>
              <p>
                No percentage is correct for every installation. Straight runs
                in a simple rectangle may need less than diagonal or complex
                patterns with many cuts. Breakage, shade or lot variation,
                replacement stock, installer planning, and supplier return rules
                also affect the decision.
              </p>
              <div className="guide-assumption-grid">
                <div><strong>Simple geometry</strong><span>Usually fewer unique cuts to plan</span></div>
                <div><strong>Complex pattern</strong><span>May increase cutting and unusable offcuts</span></div>
                <div><strong>Attic stock</strong><span>Reserve matching pieces for future repair</span></div>
                <div><strong>Supplier check</strong><span>Confirm carton coverage and return policy</span></div>
              </div>
              <p>
                Reference: <a href="https://www.daltile.com/how-to/faqs" target="_blank" rel="noreferrer">Daltile Tile &amp; Natural Stone FAQs</a> discusses planning for wastage and replacement stock. Treat any percentage as an editable assumption, not a guarantee.
              </p>
            </section>

            <section id="table">
              <p className="eyebrow">Reference table</p>
              <h2>Tiles for 100 ft² with 10% allowance</h2>
              <p>
                These examples use nominal face dimensions and round only the
                final required tile count. Box quantity is not included because
                it varies by product.
              </p>
              <div className="guide-table-wrap">
                <table>
                  <caption>Area-based planning examples before box rounding</caption>
                  <thead>
                    <tr>
                      <th>Tile size</th>
                      <th>Face area</th>
                      <th>Base tiles</th>
                      <th>With 10%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>12 × 12 in</td><td>1 ft²</td><td>100</td><td>110</td></tr>
                    <tr><td>12 × 24 in</td><td>2 ft²</td><td>50</td><td>55</td></tr>
                    <tr><td>18 × 18 in</td><td>2.25 ft²</td><td>44.45</td><td>49</td></tr>
                    <tr><td>24 × 24 in</td><td>4 ft²</td><td>25</td><td>28</td></tr>
                  </tbody>
                </table>
              </div>
              <p>
                Verify actual dimensions and the manufacturer&apos;s stated carton
                coverage. Nominal size can differ from the exact manufactured
                face size or package coverage used for ordering.
              </p>
            </section>

            <section id="example">
              <p className="eyebrow">Worked example</p>
              <h2>A 12 ft × 10 ft floor with 12 × 24 in tiles</h2>
              <p>
                Use a 10% allowance and a carton containing eight tiles.
              </p>
              <ol className="guide-calculation-steps">
                <li>Surface area: 12 × 10 = 120 ft².</li>
                <li>Tile face area: 1 × 2 = 2 ft².</li>
                <li>Exact base tiles: 120 ÷ 2 = 60.</li>
                <li>With 10% allowance: 60 × 1.10 = 66 required tiles.</li>
                <li>Complete boxes: round up (66 ÷ 8) = 9 boxes.</li>
                <li>Purchased quantity: 9 × 8 = 72 tiles.</li>
              </ol>
              <p>
                The six tiles above the required 66 come from box rounding, not
                from increasing the chosen waste allowance. Reporting both
                values prevents those two sources of overage from being confused.
              </p>
            </section>

            <section id="layout">
              <p className="eyebrow">Layout check</p>
              <h2>Keep grout spacing separate from purchase area</h2>
              <p>
                TCNA guidance explains that joint choice depends on the tile,
                variation, edge, substrate, and installation. JobsiteQuant uses
                the entered grout joint to compare row-and-column layouts, but
                it does not subtract joint area from the tile purchase quantity.
                Cut pieces may be reused, so a grid is not a cutting optimizer.
              </p>
              <p>
                Sources: <a href="https://tcnatile.com/resource-center/faq/grout/" target="_blank" rel="noreferrer">TCNA Grout FAQ</a> and <a href="https://tcnatile.com/resource-center/faq/ceramic-tile/" target="_blank" rel="noreferrer">TCNA Ceramic Tile FAQ</a>.
              </p>
            </section>

            <section id="verify">
              <p className="eyebrow">Before purchase</p>
              <h2>Verify what a rectangular formula cannot know</h2>
              <ul>
                <li>Break irregular rooms into measured rectangles and combine the results.</li>
                <li>Confirm actual tile dimensions, package coverage, and tiles per box.</li>
                <li>Choose waste for the planned pattern, cuts, breakage, and repair stock.</li>
                <li>Confirm substrate, movement joints, mortar, grout, trim, and waterproofing separately.</li>
                <li>Follow current manufacturer instructions and qualified installer guidance.</li>
              </ul>
            </section>

            <section className="faq-list guide-faq" aria-labelledby="tile-guide-faq-title">
              <p className="eyebrow">Common questions</p>
              <h2 id="tile-guide-faq-title">Tile quantity FAQ</h2>
              {faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary>{faq.question}<span aria-hidden="true">+</span></summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </section>

            <div className="utility-callout">
              <strong>Need tiles, boxes, waste, and layout in one result?</strong>
              <p>
                Open the <a href="/tile-calculator">JobsiteQuant Tile Calculator</a> and enter the exact product carton quantity.
              </p>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
