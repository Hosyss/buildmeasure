import type { Metadata } from "next";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How to Estimate a Multi-Shape Concrete Project",
  description:
    "Learn how to combine slabs, circular pours, footings, columns, walls, and post holes into one concrete quantity without double-rounding or hidden unit assumptions.",
  alternates: { canonical: "/guides/how-to-estimate-multi-shape-concrete-project" },
};

const faqs = [
  {
    question: "How do I combine different concrete shapes in one estimate?",
    answer:
      "Calculate each measured part as physical volume, convert those volumes to a common base unit, add the unrounded volumes together, then apply one project allowance before procurement rounding.",
  },
  {
    question: "Should I add the bag counts from separate calculators?",
    answer:
      "Not when you are ordering one combined project. Adding already-rounded package counts can compound rounding. Combine unrounded physical volume first and round the final project package quantity once.",
  },
  {
    question: "Can one project mix metric and imperial dimensions?",
    answer:
      "Yes. BuildNumbers converts each part to a common physical volume before aggregation, so parts can use the unit system that matches the measurements you actually have.",
  },
  {
    question: "Does the project calculator choose structural dimensions?",
    answer:
      "No. It estimates material quantity only from dimensions you provide. Structural sizing, reinforcement, loads, bearing, frost depth, joints, drainage, concrete strength, and code requirements are outside its scope.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Estimate a Multi-Shape Concrete Project",
    description:
      "A practical workflow for combining multiple concrete geometries into one auditable project quantity.",
    mainEntityOfPage: absoluteUrl("/guides/how-to-estimate-multi-shape-concrete-project"),
    author: { "@type": "Person", name: "Hosyss" },
    publisher: { "@type": "Organization", name: "BuildNumbers" },
    dateModified: "2026-08-29",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/guides") },
      {
        "@type": "ListItem",
        position: 3,
        name: "Multi-Shape Concrete Project",
        item: absoluteUrl("/guides/how-to-estimate-multi-shape-concrete-project"),
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

export default function MultiShapeConcreteGuidePage() {
  return (
    <>
      <SiteHeader ctaHref="/concrete-project-calculator" ctaLabel="Open project calculator" />
      <main className="guide-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

        <section className="guide-hero">
          <div className="shell guide-hero-grid">
            <div>
              <nav className="breadcrumbs" aria-label="Breadcrumb">
                <a href="/">Home</a><span aria-hidden="true">/</span><a href="/guides">Guides</a><span aria-hidden="true">/</span><span>Multi-Shape Concrete</span>
              </nav>
              <p className="eyebrow">Concrete project workflow</p>
              <h1>How to estimate a multi-shape concrete project</h1>
              <p>
                A real concrete order can contain more than one geometry. The reliable workflow is to keep every part auditable, combine physical volume before procurement rounding, and apply one explicit project allowance.
              </p>
            </div>
            <aside>
              <strong>Use this workflow when</strong>
              <ul>
                <li><CheckIcon /> One order contains different concrete shapes</li>
                <li><CheckIcon /> Parts use different measurement systems</li>
                <li><CheckIcon /> You want one final bag or ready-mix quantity</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="section shell guide-article">
          <article>
            <p className="eyebrow">The core rule</p>
            <h2>Combine volume first. Round packages last.</h2>
            <p>
              Each slab, circular pad, footing, column, wall, or post hole should be calculated from its own measured geometry. BuildNumbers converts each part to a common physical volume and adds those unrounded values before applying the project allowance.
            </p>
            <div className="formula-block">
              <span>Project net volume</span><code>Vproject = V1 + V2 + … + Vn</code>
              <span>Order volume</span><code>Vorder = Vproject × (1 + allowance ÷ 100)</code>
              <span>Complete bags</span><code>bags = ceil(Vorder ÷ bag yield)</code>
            </div>
            <p>
              This avoids a common mistake: rounding each small part to complete bags and then adding those rounded package counts. If the material will be purchased as one combined order, that method can repeatedly add rounding overhead.
            </p>

            <h2>1. Break the job into measurable parts</h2>
            <p>
              Give each physical part a clear label such as “patio slab”, “round equipment pad”, “west footing run”, or “gate post holes”. Choose the geometry that actually matches the part instead of forcing every item into a rectangular volume.
            </p>
            <p>
              Repeated identical parts can use a quantity multiplier. If dimensions differ, keep them as separate parts so the calculation record remains auditable.
            </p>

            <h2>2. Use the units that match the source measurement</h2>
            <p>
              A project can mix Imperial and Metric inputs. The important point is not the display unit; it is that every part represents the same physical quantity after conversion. BuildNumbers uses exact shared unit constants and converts each result before aggregation.
            </p>
            <p>
              When you switch a part between Metric and Imperial in the project builder, the entered geometry is converted rather than reinterpreted as the same number in a different unit.
            </p>

            <h2>3. Keep geometry-specific deductions inside the part</h2>
            <p>
              Wall openings and post displacement affect only the part where they belong. A wall should subtract measured full-depth openings before its volume enters the project total. A post hole can subtract the measured post displacement before aggregation.
            </p>
            <p>
              These deductions should never be applied as a project-wide percentage because they describe real geometry, not uncertainty.
            </p>

            <h2>4. Apply one explicit project allowance</h2>
            <p>
              After all net part volumes are combined, apply the selected project allowance once. BuildNumbers accepts an explicit 0–50% allowance and does not silently choose one for you.
            </p>
            <p>
              The appropriate allowance depends on the project, placement method, site conditions, supplier rules, and the consequences of running short. Treat it as a planning input that you must choose and verify.
            </p>

            <h2>5. Round the purchase quantity once</h2>
            <p>
              For bagged concrete, choose the actual package size and verify the product yield. BuildNumbers supports the documented 40, 60, and 80 lb yield assumptions used by its concrete tools, then rounds the final combined bag count upward once.
            </p>
            <p>
              Ready-mix orders may have supplier minimums, increments, delivery rules, or practical overage requirements that are not represented by whole-bag rounding. Confirm those rules with the supplier before ordering.
            </p>

            <div className="utility-callout">
              <strong>Do not use this tool to design the concrete work</strong>
              <p>
                The calculator does not choose slab thickness, footing dimensions, column size, wall thickness, reinforcement, concrete strength, bearing area, frost depth, joints, drainage, formwork, excavation, or any structural/code requirement. Enter geometry from the project design or another qualified source.
              </p>
            </div>

            <h2>A practical audit before ordering</h2>
            <ul>
              <li>Confirm every part is represented once and only once.</li>
              <li>Check measured dimensions and repeated-part quantities against the plans or site.</li>
              <li>Verify wall openings and post displacement were entered only where applicable.</li>
              <li>Confirm the project allowance is intentional.</li>
              <li>Check bag yield or ready-mix supplier rules against the product you will actually buy.</li>
              <li>Review the part breakdown so one geometry cannot hide an input mistake inside the grand total.</li>
            </ul>

            <h2>Primary references</h2>
            <p>
              Unit conversions follow the NIST SI conversion guidance. Bag-yield assumptions used by the BuildNumbers concrete family are checked against manufacturer-published concrete mix information.
            </p>
            <div className="utility-link-row">
              <a className="button button-quiet" href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors" target="_blank" rel="noreferrer">NIST SP 811 <ArrowIcon /></a>
              <a className="button button-quiet" href="https://www.sakrete.com/product/high-strength-concrete-mix/" target="_blank" rel="noreferrer">Sakrete concrete mix data <ArrowIcon /></a>
            </div>
          </article>
        </section>

        <section className="faq-section">
          <div className="shell">
            <div className="section-heading">
              <div><p className="eyebrow">Common questions</p><h2>Multi-shape concrete project FAQ</h2></div>
              <p>Keep physical volume, uncertainty, and purchase rounding as separate steps.</p>
            </div>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary>{faq.question}<span aria-hidden="true">+</span></summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="shell next-calculators">
          <div><p className="eyebrow">Build the estimate</p><h2>Use one project builder or a focused geometry calculator.</h2></div>
          <a className="next-card next-card-live" href="/concrete-project-calculator"><span>Project</span><strong>Multi-Shape Concrete</strong><small>Combine seven verified geometry types</small></a>
          <a className="next-card next-card-live" href="/concrete-calculator"><span>Focused tool</span><strong>Rectangular Slab Concrete</strong><small>One slab geometry at a time</small></a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
