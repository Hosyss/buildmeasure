import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How to Estimate Construction Materials — A Practical Workflow",
  description:
    "A practical, unit-safe workflow for measuring a project, calculating net material, adding visible allowances, and rounding complete packages.",
  alternates: { canonical: "/guides/material-estimating-basics" },
  openGraph: {
    type: "article",
    title: "How to Estimate Construction Materials",
    description:
      "Measure geometry, separate assumptions, and convert a net quantity into a verifiable purchase plan.",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Estimate Construction Materials: A Practical Workflow",
  description:
    "A practical workflow for measuring geometry, calculating net material, applying visible allowances, and rounding purchase quantities.",
  datePublished: "2026-08-01",
  dateModified: "2026-08-01",
  mainEntityOfPage: absoluteUrl("/guides/material-estimating-basics"),
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
};

export default function MaterialEstimatingBasicsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        <section className="utility-page-hero guide-hero">
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <a href="/">Home</a>
              <span aria-hidden="true">/</span>
              <span>Guides</span>
            </nav>
            <p className="eyebrow">Material estimating guide</p>
            <h1>How to estimate construction materials</h1>
            <p>
              A reliable estimate moves through four separate questions: what
              shape are you measuring, what is the net quantity, which project
              assumptions apply, and how must the material actually be ordered?
            </p>
            <div className="guide-meta">
              <span>Published August 1, 2026</span>
              <span>Reviewed against the BuildMeasure calculation standard</span>
            </div>
          </div>
        </section>

        <article className="shell guide-article">
          <nav className="guide-toc" aria-label="On this page">
            <strong>On this page</strong>
            <a href="#scope">1. Define the scope</a>
            <a href="#measure">2. Measure and record units</a>
            <a href="#net">3. Calculate net quantity</a>
            <a href="#assumptions">4. Add visible assumptions</a>
            <a href="#procurement">5. Convert to purchase quantity</a>
            <a href="#verify">6. Verify before ordering</a>
            <a href="#workflow">Field checklist</a>
          </nav>

          <div className="guide-body">
            <section id="scope">
              <p className="eyebrow">Step 1</p>
              <h2>Define the exact scope and shape</h2>
              <p>
                Write down what the estimate includes before measuring. A slab,
                wall surface, floor, gravel base, and landscape bed use different
                geometry even when all of them look rectangular from above.
                Record openings, excluded areas, separate thicknesses, and
                irregular sections instead of hiding them in one rough dimension.
              </p>
              <p>
                Break a complex project into simple shapes, estimate each shape,
                then add the results. Do not force a rectangular calculator to
                represent a curve, slope, footing, or changing depth that it was
                not designed to model.
              </p>
            </section>

            <section id="measure">
              <p className="eyebrow">Step 2</p>
              <h2>Measure once and record every unit</h2>
              <p>
                A number without a unit is not a usable measurement. Record
                length, width, height, depth, tile size, coverage, density, and
                package size exactly as measured or printed. Keep a short project
                note so a later revision does not depend on memory.
              </p>
              <div className="guide-rule">
                <strong>Unit-safe rule</strong>
                <p>
                  Convert dimensions to one consistent system before multiplying.
                  Four inches is one-third of a foot, not 0.4 ft. BuildMeasure
                  performs this conversion internally and preserves full precision.
                </p>
              </div>
            </section>

            <section id="net">
              <p className="eyebrow">Step 3</p>
              <h2>Calculate the net geometric quantity</h2>
              <p>
                Net quantity describes the measured geometry before waste,
                spillage, compaction, cutting, touch-ups, or package rounding.
                Area is typically length × width. Rectangular volume is length ×
                width × depth. Wall area can be perimeter × height, less measured
                openings, with ceiling area added only when it is part of the job.
              </p>
              <p>
                Keeping the net value visible creates a stable baseline. If the
                allowance changes later, the measured geometry should not change
                with it.
              </p>
            </section>

            <section id="assumptions">
              <p className="eyebrow">Step 4</p>
              <h2>Add project and product assumptions separately</h2>
              <p>
                There is no universal allowance that is correct for every job.
                Concrete can be affected by form accuracy, subgrade, spillage, and
                supplier increments. Tile allowance depends on layout, cuts,
                breakage, pattern, and attic stock. Paint depends on coats,
                texture, porosity, and product coverage. Gravel weight depends on
                material density and state. Mulch depends on installed depth and
                the exact bag volume.
              </p>
              <div className="guide-assumption-grid">
                <div><strong>Geometry</strong><span>Area or volume measured from the project</span></div>
                <div><strong>Allowance</strong><span>Visible percentage for project-specific loss or extra</span></div>
                <div><strong>Material property</strong><span>Coverage, density, yield, or package volume</span></div>
                <div><strong>Supplier constraint</strong><span>Full bags, boxes, cans, pails, or delivery increments</span></div>
              </div>
            </section>

            <section id="procurement">
              <p className="eyebrow">Step 5</p>
              <h2>Convert the requirement into something you can buy</h2>
              <p>
                Keep the material requirement unrounded until the final purchase
                step. Then divide by the exact package yield, weight, area, or
                volume and round complete packages upward. For box quantities,
                report both the required pieces and the pieces purchased so box
                overage is not confused with the waste allowance.
              </p>
              <p>
                Bulk orders may use different increments from bagged products.
                Confirm whether the supplier sells by cubic yard, cubic meter,
                short ton, metric tonne, pallet, or fixed delivery batch.
              </p>
            </section>

            <section id="verify">
              <p className="eyebrow">Step 6</p>
              <h2>Verify the inputs that the calculator cannot know</h2>
              <ul>
                <li>Re-measure critical dimensions and confirm the selected units.</li>
                <li>Check the current product label for coverage, yield, weight, or volume.</li>
                <li>Ask the supplier which density, compaction state, or order increment applies.</li>
                <li>Compare the result with drawings, specifications, and local requirements.</li>
                <li>Use a qualified professional for structural, safety, regulatory, or contractual decisions.</li>
              </ul>
            </section>

            <section className="guide-tools" aria-labelledby="guide-tools-title">
              <p className="eyebrow">Use the workflow</p>
              <h2 id="guide-tools-title">Choose a verified calculator</h2>
              <div>
                <a href="/concrete-calculator"><strong>Concrete</strong><span>Slab volume and bags</span></a>
                <a href="/paint-calculator"><strong>Paint</strong><span>Walls, coats, coverage, and cans</span></a>
                <a href="/tile-calculator"><strong>Tile</strong><span>Area, waste, layout, and boxes</span></a>
                <a href="/gravel-calculator"><strong>Gravel</strong><span>Volume, density, tons, and bags</span></a>
                <a href="/mulch-calculator"><strong>Mulch</strong><span>Bed volume, coverage, and bags</span></a>
              </div>
            </section>

            <section id="workflow" className="guide-checklist">
              <p className="eyebrow">Field checklist</p>
              <h2>Before you place the order</h2>
              <ol>
                <li>Scope and shape match the selected calculator.</li>
                <li>Every dimension has a unit and was rechecked.</li>
                <li>Openings or excluded areas are measured explicitly.</li>
                <li>Allowance is project-specific and visible.</li>
                <li>Coverage, density, yield, or package volume matches the product.</li>
                <li>Final bags, boxes, cans, or pails are rounded upward once.</li>
                <li>Supplier increments and project requirements are confirmed.</li>
              </ol>
            </section>

            <div className="utility-callout">
              <strong>Want to inspect the engineering behind the tools?</strong>
              <p>
                Read the <a href="/methodology">BuildMeasure methodology</a> for
                formula sourcing, numeric safety, regression tests, and release
                evidence.
              </p>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
