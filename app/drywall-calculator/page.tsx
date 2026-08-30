import type { Metadata } from "next";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { CalculatorWorkedExample } from "@/components/calculator-worked-example";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { DRYWALL_ENGINE_VERSION, DRYWALL_FORMULA_VERSION } from "@/lib/calculators/drywall";
import { absoluteUrl } from "@/lib/site";
import { DrywallCalculator } from "./drywall-calculator";

export const metadata: Metadata = {
  title: "Drywall Calculator — Sheets for Walls & Ceilings",
  description: "Estimate whole drywall sheets for rectangular room walls and an optional ceiling using measured openings, exact panel size, and an adjustable waste allowance.",
  alternates: { canonical: "/drywall-calculator" },
  openGraph: { title: "Drywall Calculator — Sheets for Walls & Ceilings", description: "Estimate complete drywall sheets with measured openings and visible waste.", type: "website" },
  twitter: { card: "summary", title: "Drywall Calculator — Sheets for Walls & Ceilings", description: "Estimate complete drywall sheets with measured openings and visible waste." },
};

const faqs = [
  { question: "How many drywall sheets do I need?", answer: "Measure the rectangular room length, width, and wall height; choose whether to include the ceiling; subtract the combined measured opening area; and enter the exact sheet size. BuildNumbers divides the allowance-adjusted area by the sheet area and rounds only the final purchase quantity upward." },
  { question: "Does this calculator include doors and windows?", answer: "Yes, when you enter their combined measured area. The calculator does not assume a standard door or window size because actual openings vary." },
  { question: "What drywall sheet sizes can I use?", answer: "Convenience presets cover 4 × 8, 4 × 10, and 4 × 12 ft sheets. Custom mode accepts the exact width and length printed by your supplier, including physical metric dimensions." },
  { question: "Is the waste allowance automatic?", answer: "No hidden allowance is applied. The field is visible and adjustable from 0% to 50%; choose a value based on layout, cuts, handling, breakage, and your installer or supplier guidance." },
  { question: "Does the result include joint compound, tape, screws, or framing?", answer: "No. This version estimates whole gypsum-board sheets only. It does not invent accessory quantities or prescribe a fastening schedule, board type, fire rating, moisture rating, or wall assembly." },
  { question: "Can the estimate replace a drywall layout?", answer: "No. It is area-based and does not optimize seams, offcuts, orientation, framing alignment, multiple layers, or code requirements. Verify a workable layout before ordering." },
];

const schema = [
  { "@context": "https://schema.org", "@type": "WebApplication", name: "BuildNumbers Drywall Calculator", url: absoluteUrl("/drywall-calculator"), applicationCategory: "UtilitiesApplication", operatingSystem: "Any", description: "An area-based drywall sheet quantity calculator for rectangular room walls and an optional ceiling.", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "Drywall Calculator", item: absoluteUrl("/drywall-calculator") }] },
  { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
];

export default function DrywallCalculatorPage() {
  return <>
    <SiteHeader ctaHref="/#calculators" ctaLabel="All calculators" />
    <main className="calculator-page drywall-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/>
      <section className="calculator-hero drywall-calculator-hero"><div className="shell"><nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>Drywall Calculator</span></nav><div className="calculator-hero-grid"><div><p className="eyebrow">Interior walls &amp; ceilings</p><h1>Drywall Calculator</h1><p>Estimate complete gypsum-board sheets from measured room surfaces, exact panel dimensions, and a visible project allowance.</p></div><ul><li><CheckIcon /> Walls plus optional ceiling</li><li><CheckIcon /> Metric &amp; imperial</li><li><CheckIcon /> No hidden waste</li></ul></div></div></section>
      <section className="shell calculator-main-section"><DrywallCalculator /></section>
      <section className="shell calculator-content"><article><p className="eyebrow">Transparent by design</p><h2>Drywall sheet formula</h2><p>The engine calculates the perimeter wall area of one rectangular room, adds the ceiling only when selected, subtracts your measured openings, and divides by the exact panel area.</p><div className="formula-block"><span>Wall area</span><code>A<sub>walls</sub> = 2 × (length + width) × height</code><span>Net area</span><code>A<sub>net</sub> = walls + ceiling − openings</code><span>Order area</span><code>A<sub>order</sub> = A<sub>net</sub> × (1 + waste ÷ 100)</code><span>Complete sheets</span><code>Sheets = ceil(A<sub>order</sub> ÷ panel area)</code></div><p>The result is deliberately an area estimate, not a cut plan. Longer boards can reduce joints in some layouts, while obstructions, multiple layers, board orientation, damaged edges, and fire-rated details can increase the real order.</p></article><aside className="formula-meta"><h3>Calculation record</h3><dl><div><dt>Engine version</dt><dd>{DRYWALL_ENGINE_VERSION}</dd></div><div><dt>Formula version</dt><dd>{DRYWALL_FORMULA_VERSION}</dd></div><div><dt>Last reviewed</dt><dd>August 24, 2026</dd></div><div><dt>Scope</dt><dd>One rectangular room</dd></div></dl><h3>Primary references</h3><a href="https://assemblies-tools.usg.com/content/usgcom/en/resource-center/tools/sheetrockestimator.html" target="_blank" rel="noreferrer">USG Sheetrock wallboard estimator <ArrowIcon /></a><a href="https://www.goldbondbuilding.com/products/mold-resistant-drywall-panels/xp-gypsum-board" target="_blank" rel="noreferrer">Gold Bond panel dimensions <ArrowIcon /></a><a href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors" target="_blank" rel="noreferrer">NIST SP 811 conversions <ArrowIcon /></a></aside></section>
      <CalculatorWorkedExample title="A 12 ft × 12 ft room with ceiling" description="Use 8 ft walls, 24 ft² of measured openings, 4 × 8 ft panels, and a 10% allowance." steps={[{ label: "Walls", value: "2 × (12 + 12) × 8 = 384 ft²" }, { label: "Add ceiling, subtract openings", value: "384 + 144 − 24 = 504 ft²" }, { label: "Add 10% allowance", value: "504 × 1.10 = 554.4 ft²" }, { label: "Round complete sheets", value: "ceil(554.4 ÷ 32) = 18 sheets" }]} result="18 complete 4 × 8 ft sheets" verification="Confirm a workable panel layout, board type, required layers, and supplier dimensions before buying." />
      <section className="faq-section"><div className="shell"><div className="section-heading"><div><p className="eyebrow">Common questions</p><h2>Drywall calculator FAQ</h2></div><p>Separate measured quantity from layout and assembly decisions.</p></div><div className="faq-list">{faqs.map((faq, index) => <details key={faq.question} open={index === 0}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div></div></section>
      <section className="shell next-calculators"><div><p className="eyebrow">Continue planning</p><h2>Estimate the next finish.</h2></div><a className="next-card next-card-live" href="/guides/how-many-drywall-sheets-do-i-need"><span>Guide</span><strong>How Many Drywall Sheets Do I Need?</strong><small>Measurements, openings &amp; layout limits</small></a><a className="next-card next-card-live" href="/paint-calculator"><span>Live</span><strong>Paint Calculator</strong><small>Walls, ceilings, coats &amp; containers</small></a></section>
    </main>
    <SiteFooter />
  </>;
}
