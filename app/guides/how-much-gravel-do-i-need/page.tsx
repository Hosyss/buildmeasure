import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How Much Gravel Do I Need? Volume & Coverage Guide",
  description: "Estimate gravel volume for driveways, paths, beds, and other projects from length, width, depth, and material coverage.",
  alternates: { canonical: absoluteUrl("/guides/how-much-gravel-do-i-need") },
};

const faq = [
  { q: "How do I calculate how much gravel I need?", a: "Multiply the project length by width by compacted depth using compatible units. Convert that volume to the purchasing unit you need, then use supplier-specific density or coverage data when converting volume to weight." },
  { q: "Why does gravel depth matter so much?", a: "Required volume changes directly with depth. Doubling the planned depth doubles the theoretical volume for the same surface area." },
  { q: "Can I convert gravel volume directly to tons?", a: "Only with an appropriate bulk density. Gravel density varies with material, grading, moisture, and compaction, so supplier data is preferable for purchase decisions." },
];

export default function GravelNeedGuide() {
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) };
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide">Gravel estimating guide</p>
      <h1 className="text-4xl font-bold tracking-tight">How Much Gravel Do I Need?</h1>
      <p className="mt-5 text-lg leading-8 text-muted-foreground">Gravel estimates begin with volume. Measure the area, choose the finished depth, calculate volume, and only then convert to bags, cubic yards, or weight using the relevant product or supplier data.</p>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-semibold">Quick formula</h2><p><strong>Gravel volume = length × width × depth.</strong></p><p>Use compatible units throughout the calculation. For irregular areas, split the project into simpler sections and add their volumes.</p></section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-semibold">Example</h2><p>A rectangular 20 ft × 10 ft area at 3 inches deep uses a theoretical volume of 50 cubic feet before any project allowance or supplier conversion. Because 3 inches is 0.25 ft, the calculation is 20 × 10 × 0.25.</p></section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-semibold">Before ordering</h2><ul className="list-disc space-y-2 pl-6"><li>Confirm whether your depth is loose or compacted depth.</li><li>Check the supplier&apos;s material-specific density or coverage.</li><li>Account for grading, settlement, compaction, and uneven subgrade where appropriate.</li><li>Measure separate project sections rather than guessing irregular shapes.</li></ul></section>
      <section className="mt-10 rounded-xl border p-6"><h2 className="text-2xl font-semibold">Calculate your gravel project</h2><p className="mt-2">Use the interactive calculator for dimensions, depth, unit conversion, and purchasing estimates.</p><Link className="mt-4 inline-block font-semibold underline" href="/gravel-calculator">Open the Gravel Calculator →</Link></section>
      <section className="mt-10 space-y-6"><h2 className="text-2xl font-semibold">Frequently asked questions</h2>{faq.map((item) => <div key={item.q}><h3 className="font-semibold">{item.q}</h3><p className="mt-1 text-muted-foreground">{item.a}</p></div>)}</section>
      <p className="mt-10 text-sm text-muted-foreground">Estimates are planning aids. Confirm material density, compaction assumptions, delivery quantities, and supplier guidance before ordering.</p>
    </main>
  );
}
