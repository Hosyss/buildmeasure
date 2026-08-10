import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How Much Paint Do I Need? Wall & Room Paint Guide",
  description:
    "Estimate how much paint you need for walls and rooms using surface area, coats, coverage, doors, windows, and a practical waste allowance.",
  alternates: { canonical: absoluteUrl("/guides/how-much-paint-do-i-need") },
};

const faq = [
  {
    q: "How do I calculate how much paint I need?",
    a: "Estimate the paintable wall area, subtract openings such as doors and windows, multiply by the number of coats, then divide by the paint coverage listed on the product label.",
  },
  {
    q: "Should I buy extra paint?",
    a: "A small allowance can help cover touch-ups, porous surfaces, application losses, and small measuring errors. Keep the final estimate tied to the coverage stated by the paint manufacturer.",
  },
  {
    q: "Does a second coat double the amount of paint?",
    a: "Two full coats roughly double the theoretical coverage requirement, although real-world usage can vary with color change, surface condition, primer, and application method.",
  },
];

export default function PaintNeedGuide() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide">Paint estimating guide</p>
      <h1 className="text-4xl font-bold tracking-tight">How Much Paint Do I Need?</h1>
      <p className="mt-5 text-lg leading-8 text-muted-foreground">
        The reliable way to estimate paint is to calculate the area you actually plan to paint, account for the number of coats, and use the coverage rate printed on your paint container.
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Quick formula</h2>
        <p><strong>Paint needed = paintable area × coats ÷ coverage per container.</strong></p>
        <p>
          For walls, start with wall area and subtract doors and windows when they are not being painted. Coverage varies by product and surface, so the manufacturer&apos;s label should be your final reference.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Example</h2>
        <p>
          If you have 800 sq ft of paintable wall area, want two coats, and your paint is rated for 400 sq ft per gallon, the theoretical estimate is 800 × 2 ÷ 400 = 4 gallons. A rough or porous surface may require more.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">What changes the result?</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Number of coats and the size of the color change.</li>
          <li>Paint coverage stated by the manufacturer.</li>
          <li>Drywall, masonry, textured, repaired, or otherwise porous surfaces.</li>
          <li>Whether doors, windows, ceilings, and trim are included.</li>
          <li>Roller, brush, or spray application losses.</li>
        </ul>
      </section>

      <section className="mt-10 rounded-xl border p-6">
        <h2 className="text-2xl font-semibold">Calculate your project</h2>
        <p className="mt-2">Use the interactive calculator for room dimensions, openings, coats, coverage, and unit conversions.</p>
        <Link className="mt-4 inline-block font-semibold underline" href="/paint-calculator">Open the Paint Calculator →</Link>
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
        {faq.map((item) => (
          <div key={item.q}>
            <h3 className="font-semibold">{item.q}</h3>
            <p className="mt-1 text-muted-foreground">{item.a}</p>
          </div>
        ))}
      </section>

      <p className="mt-10 text-sm text-muted-foreground">
        Estimates are planning aids. Verify product coverage, surface preparation, and application instructions before purchasing materials.
      </p>
    </main>
  );
}
