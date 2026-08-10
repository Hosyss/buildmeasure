import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How Much Mulch Do I Need? Mulch Depth & Coverage Guide",
  description: "Estimate mulch for garden beds and landscaping from bed area and mulch depth, with guidance for cubic feet, cubic yards, and bags.",
  alternates: { canonical: absoluteUrl("/guides/how-much-mulch-do-i-need") },
};

const faq = [
  { q: "How do I calculate how much mulch I need?", a: "Multiply the bed area by the planned mulch depth using compatible units. Convert the resulting volume into cubic feet, cubic yards, or bags using the package size you intend to buy." },
  { q: "How many cubic feet are in a cubic yard?", a: "One cubic yard contains 27 cubic feet. Bag counts still depend on the volume printed on each bag." },
  { q: "Should I measure around plants?", a: "For a practical estimate, measure the bed area being covered. Large excluded areas can be subtracted, while small plant stems usually do not materially change a landscaping-scale estimate." },
];

export default function MulchNeedGuide() {
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) };
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide">Mulch estimating guide</p>
      <h1 className="text-4xl font-bold tracking-tight">How Much Mulch Do I Need?</h1>
      <p className="mt-5 text-lg leading-8 text-muted-foreground">Mulch quantity is a volume problem: measure the bed area, choose the intended depth, calculate volume, then convert that result to the bulk or bag size you plan to purchase.</p>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-semibold">Quick formula</h2><p><strong>Mulch volume = bed area × mulch depth.</strong></p><p>Make sure depth is converted into the same base unit used for the area calculation before multiplying.</p></section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-semibold">Example</h2><p>A 300 sq ft bed at 3 inches deep requires a theoretical 75 cubic feet of mulch. Since 3 inches equals 0.25 ft, the calculation is 300 × 0.25. That is about 2.78 cubic yards before purchase rounding or project allowance.</p></section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-semibold">Bagged vs bulk mulch</h2><p>Once you know the volume, compare it with the exact bag volume or bulk quantity sold by your supplier. Round purchasing quantities up rather than assuming a partial bag can be bought.</p></section>
      <section className="mt-10 rounded-xl border p-6"><h2 className="text-2xl font-semibold">Calculate your mulch project</h2><p className="mt-2">Use the interactive calculator for bed dimensions, depth, unit conversion, bags, and bulk volume.</p><Link className="mt-4 inline-block font-semibold underline" href="/mulch-calculator">Open the Mulch Calculator →</Link></section>
      <section className="mt-10 space-y-6"><h2 className="text-2xl font-semibold">Frequently asked questions</h2>{faq.map((item) => <div key={item.q}><h3 className="font-semibold">{item.q}</h3><p className="mt-1 text-muted-foreground">{item.a}</p></div>)}</section>
      <p className="mt-10 text-sm text-muted-foreground">Estimates are planning aids. Confirm desired depth, package volume, site conditions, and supplier quantities before purchasing.</p>
    </main>
  );
}
