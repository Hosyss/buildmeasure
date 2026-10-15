import type { Metadata } from "next";
import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How Much Paint Do I Need for a Room?",
  description:
    "Calculate room paint from wall and ceiling area, measured openings, coats, product coverage, and an adjustable extra allowance.",
  alternates: { canonical: "/guides/how-much-paint-do-i-need" },
  openGraph: {
    type: "article",
    title: "How Much Paint Do I Need for a Room?",
    description:
      "A transparent room-paint formula with a worked example and product-coverage checks.",
  },
};

const faqs = [
  {
    question: "How many square feet does a gallon of paint cover?",
    answer:
      "Sherwin-Williams says one gallon typically covers about 350 to 400 square feet. The exact coating, surface texture, porosity, color change, and application can alter coverage, so use the current product label for the final estimate.",
  },
  {
    question: "Do I multiply the room area by the number of coats?",
    answer:
      "Yes. First find the paintable surface after subtracting measured openings, then multiply that area by the planned number of coats before dividing by product coverage.",
  },
  {
    question: "Should I subtract doors and windows?",
    answer:
      "Subtract only openings that will not be painted, using their measured combined area. Do not rely on a generic door or window size when an accurate measurement is available.",
  },
  {
    question: "Should the ceiling be included?",
    answer:
      "Include length multiplied by width only when the ceiling is part of the same coating estimate. Use a separate calculation if its product, color, coverage, or coat count differs from the walls.",
  },
];

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How Much Paint Do I Need for a Room?",
    description:
      "A transparent method for converting room dimensions, openings, coats, and coating coverage into paint volume and complete containers.",
    datePublished: "2026-08-11",
    dateModified: "2026-10-16",
    mainEntityOfPage: absoluteUrl("/guides/how-much-paint-do-i-need"),
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
        name: "Paint Calculator",
        item: absoluteUrl("/paint-calculator"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "How Much Paint Do I Need?",
        item: absoluteUrl("/guides/how-much-paint-do-i-need"),
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

export default function PaintGuidePage() {
  return (
    <>
      <SiteHeader ctaHref="/paint-calculator" ctaLabel="Open Paint Calculator" />
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
              <a href="/paint-calculator">Paint Calculator</a>
              <span aria-hidden="true">/</span>
              <span>Room Paint Guide</span>
            </nav>
            <p className="eyebrow">Paint estimating guide</p>
            <h1>How much paint do I need for a room?</h1>
            <p>
              Measure the surfaces, subtract openings, apply the planned coats,
              and use the coverage printed for the exact coating you will buy.
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
            <a href="#formula">Room formula</a>
            <a href="#coverage">Coverage input</a>
            <a href="#measure">Measure each surface</a>
            <a href="#example">Worked example</a>
            <a href="#containers">Container rounding</a>
            <a href="#separate-products">Separate paint products</a>
            <a href="#verify">Before buying</a>
          </nav>

          <div className="guide-body">
            <section id="answer">
              <p className="eyebrow">Quick answer</p>
              <h2>Calculate surface area before paint volume</h2>
              <p>
                For a rectangular room, wall area is the perimeter multiplied by
                wall height. Add the ceiling only when it is included, subtract
                measured doors and windows, multiply by coats, then divide by the
                product&apos;s coverage rate. Apply any extra allowance before
                rounding the final container count upward.
              </p>
              <a className="button button-primary guide-primary-action" href="/paint-calculator">
                Calculate my room now
              </a>
            </section>

            <section id="formula">
              <p className="eyebrow">The formula</p>
              <h2>Room paint calculation step by step</h2>
              <div className="formula-block guide-formula-block">
                <span>Wall area</span>
                <code>2 × (length + width) × wall height</code>
                <span>Paintable area</span>
                <code>walls + included ceiling − measured openings</code>
                <span>Coated area</span>
                <code>paintable area × number of coats</code>
                <span>Paint volume</span>
                <code>(coated area ÷ product coverage) × (1 + extra ÷ 100)</code>
              </div>
              <p>
                Keep every area in the same unit as the coverage rate. Use square
                feet with ft²/gal or square meters with m²/L; do not mix systems
                inside one division.
              </p>
            </section>

            <section id="coverage">
              <p className="eyebrow">Product input</p>
              <h2>Coverage is not a universal constant</h2>
              <p>
                Sherwin-Williams reports typical gallon coverage of about 350 to
                400 square feet and notes that texture and desired coverage can
                change the result. Its estimating instructions also direct users
                to measure wall area, subtract large openings, and check the
                selected paint label.
              </p>
              <div className="guide-assumption-grid">
                <div><strong>Typical example</strong><span>350–400 ft² per U.S. gallon</span></div>
                <div><strong>Surface</strong><span>Texture and porosity can reduce spread rate</span></div>
                <div><strong>Coats</strong><span>Count every planned full coat</span></div>
                <div><strong>Controlling value</strong><span>The exact product label or data sheet</span></div>
              </div>
              <p>
                Sources: <a href="https://www.sherwin-williams.com/en-us/color/color-tools/paint-calculator" target="_blank" rel="noreferrer">Sherwin-Williams Paint Calculator FAQs</a> and <a href="https://www.sherwin-williams.com/painting-contractors/sw-video-dir-howmuchpaintbuy" target="_blank" rel="noreferrer">How Much Paint to Buy</a>.
              </p>
            </section>

            <section id="measure">
              <p className="eyebrow">Measurement plan</p>
              <h2>Count the walls, then decide what shares one product</h2>
              <figure style={{ margin: "1.5rem 0" }}>
                <Image src="/guides/paint-surface-plan.svg" width={640} height={420}
                  alt="Four unfolded walls of a 4 by 3 meter room have a 14 meter perimeter and 2.5 meter height. The 12 square meter ceiling is measured separately."
                  style={{ width: "100%", height: "auto" }} />
                <figcaption>Original BuildMeasure surface diagram. Openings are schematic; use their measured areas.</figcaption>
              </figure>
              <p>
                For four walls of equal height, perimeter × height gives the
                gross wall area. If wall heights vary, measure each rectangular
                surface separately and add the results. A floor area is not the
                wall area: two rooms with the same floor area can have different
                perimeters, heights, and paint requirements.
              </p>
              <p>
                Record each unpainted opening as width × height and total the
                deductions. Measure only the part excluded from that paint
                product. Painting a door or its trim with a different finish
                calls for a separate estimate rather than adding its area to
                the wall coating without checking coverage.
              </p>
              <p>
                Give an accent wall its own line on the measurement sheet.
                Record the product, color, sheen, coats, coverage unit, and
                available container sizes for every line. Combining different
                paints into one volume can make the grand total look sufficient
                while leaving one color short.
              </p>
            </section>

            <section id="example">
              <p className="eyebrow">Worked example</p>
              <h2>A 12 ft × 10 ft room with an 8 ft ceiling</h2>
              <p>
                Include the ceiling, subtract one 21 ft² door and two windows
                totaling 30 ft², use two coats, 400 ft²/gal coverage, and 10%
                extra.
              </p>
              <ol className="guide-calculation-steps">
                <li>Walls: 2 × (12 + 10) × 8 = 352 ft².</li>
                <li>Ceiling: 12 × 10 = 120 ft².</li>
                <li>Paintable area: 352 + 120 − 51 = 421 ft².</li>
                <li>Two coats: 421 × 2 = 842 coat-ft².</li>
                <li>Base paint: 842 ÷ 400 = 2.105 gal.</li>
                <li>With 10% extra: 2.105 × 1.10 = 2.3155 gal.</li>
              </ol>
              <p>
                If the coating is sold only in one-gallon containers, the final
                purchase result is three complete cans. A different package mix
                may be more economical, so compare available sizes and prices.
              </p>
            </section>

            <section id="containers">
              <p className="eyebrow">Purchase quantity</p>
              <h2>Round once, at the final container step</h2>
              <p>
                Do not round wall area, coated area, or paint volume between
                steps. Divide the final volume by the selected container size,
                then round complete containers upward. For separate wall and
                ceiling products, calculate each product independently rather
                than combining unlike coverage rates.
              </p>
              <div className="guide-rule">
                <strong>Planning rule</strong>
                <p>
                  A calculator estimates quantity, not product suitability. Check
                  primer needs, surface preparation, color change, sheen, dry
                  time, ventilation, and application instructions for the exact
                  coating.
                </p>
              </div>
            </section>

            <section id="separate-products">
              <p className="eyebrow">Worked metric comparison</p>
              <h2>Walls and ceiling with different coverage rates</h2>
              <p>
                In the illustrated 4 m × 3 m room, wall height is 2.5 m.
                Suppose measured openings total 3 m². For this arithmetic
                example only, use two coats, 10% extra, wall-paint coverage of
                10 m²/L, and ceiling-paint coverage of 8 m²/L. Replace both
                coverage rates with the selected products&apos; data.
              </p>
              <div className="guide-table-wrap">
                <table>
                  <caption>Calculate and purchase each coating separately</caption>
                  <thead><tr><th scope="col">Step</th><th scope="col">Wall paint</th><th scope="col">Ceiling paint</th></tr></thead>
                  <tbody>
                    <tr><th scope="row">Gross surface</th><td>2 × (4 + 3) × 2.5 = 35 m²</td><td>4 × 3 = 12 m²</td></tr>
                    <tr><th scope="row">After openings</th><td>35 − 3 = 32 m²</td><td>12 m²</td></tr>
                    <tr><th scope="row">Two coats</th><td>64 coat-m²</td><td>24 coat-m²</td></tr>
                    <tr><th scope="row">Base paint</th><td>64 ÷ 10 = 6.40 L</td><td>24 ÷ 8 = 3.00 L</td></tr>
                    <tr><th scope="row">With 10% extra</th><td>7.04 L</td><td>3.30 L</td></tr>
                    <tr><th scope="row">If sold only in 2.5 L cans</th><td>3 cans = 7.50 L</td><td>2 cans = 5.00 L</td></tr>
                  </tbody>
                </table>
              </div>
              <p>
                Adding 7.04 L and 3.30 L before rounding would suggest five
                2.5 L cans without identifying which product belongs in each
                can. Round within each product first. Compare alternative
                container sizes using the supplier&apos;s actual availability
                and prices; the calculator does not optimize a mixed-size order.
              </p>
              <h3>What happens if coverage is lower?</h3>
              <p>
                For the same 64 coat-m² of walls, coverage of 8 m²/L instead
                of 10 m²/L raises the allowance-included quantity from 7.04 L
                to 8.80 L. With only 2.5 L cans available, the order changes
                from three to four cans. This is a sensitivity comparison,
                not a prediction of your surface&apos;s absorption.
              </p>
              <p>
                Sherwin-Williams explains that theoretical coverage does not
                account for texture and material left on applicators. Its
                <a href="https://www.sherwin-williams.com/en-us/project-center/faqs/paint-faq" target="_blank" rel="noreferrer"> Painting FAQs</a>
                discuss these limits. Check product instructions and surface
                condition before choosing a coverage input. Primer is another
                product with its own coverage; do not treat its coat as a coat
                of finish paint.
              </p>
            </section>

            <section id="verify">
              <p className="eyebrow">Before purchase</p>
              <h2>Verify what room dimensions cannot predict</h2>
              <ul>
                <li>Re-measure length, width, height, and every excluded opening.</li>
                <li>Confirm whether walls and ceiling use the same product and coat count.</li>
                <li>Replace the example coverage with the current label value.</li>
                <li>Choose extra allowance for texture, application loss, and touch-ups.</li>
                <li>Follow the manufacturer&apos;s preparation, safety, ventilation, and application instructions.</li>
              </ul>
            </section>

            <section className="faq-list guide-faq" aria-labelledby="paint-guide-faq-title">
              <p className="eyebrow">Common questions</p>
              <h2 id="paint-guide-faq-title">Room paint FAQ</h2>
              {faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary>{faq.question}<span aria-hidden="true">+</span></summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </section>

            <div className="utility-callout">
              <strong>Want walls, ceiling, openings, coats, and cans in one result?</strong>
              <p>
                Open the <a href="/paint-calculator">BuildMeasure Paint Calculator</a> and replace the default coverage with your product value.
              </p>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
