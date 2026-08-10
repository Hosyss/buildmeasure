import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How Many Tiles Do I Need? Tile Quantity & Waste Guide",
  description: "Estimate how many tiles you need from project area, tile size, and a practical waste allowance for cuts, breakage, and layout.",
  alternates: { canonical: absoluteUrl("/guides/how-many-tiles-do-i-need") },
};

const faq = [
  { q: "How do I calculate how many tiles I need?", a: "Divide the area to be tiled by the face area of one tile, then round up to whole tiles and add an appropriate allowance for cuts, breakage, and layout." },
  { q: "How much extra tile should I buy?", a: "The right allowance depends on the layout, room shape, tile size, breakage risk, and whether matching replacement tiles may be difficult to obtain later. Straight layouts usually waste less than diagonal or complex patterns." },
  { q: "Should I round tile quantity up?", a: "Yes. Tiles are purchased as whole pieces or boxes, so a fractional theoretical result must be rounded up before applying packaging constraints." },
];

export default function TileNeedGuide() {
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) };
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide">Tile estimating guide</p>
      <h1 className="text-4xl font-bold tracking-tight">How Many Tiles Do I Need?</h1>
      <p className="mt-5 text-lg leading-8 text-muted-foreground">Start with the actual floor or wall area, compare it with the face area of one tile, then allow for whole-tile rounding, cuts, breakage, and your chosen layout.</p>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-semibold">Quick formula</h2><p><strong>Base tile count = project area ÷ area of one tile.</strong></p><p>Round up to whole tiles, then account for waste. Keep all measurements in compatible units before dividing.</p></section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-semibold">Example</h2><p>A 120 sq ft floor using 12 × 12 inch tiles has a theoretical base count of 120 tiles because each tile covers 1 sq ft. The purchase quantity will be higher after whole-tile rounding and the project-specific waste allowance.</p></section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-semibold">What increases tile waste?</h2><ul className="list-disc space-y-2 pl-6"><li>Diagonal, herringbone, or other cut-heavy layouts.</li><li>Irregular rooms, niches, columns, and many edges.</li><li>Large-format tiles where an unusable offcut represents more area.</li><li>Breakage during transport, cutting, or installation.</li><li>Keeping spare matching tiles for future repairs.</li></ul></section>
      <section className="mt-10 rounded-xl border p-6"><h2 className="text-2xl font-semibold">Calculate your tile project</h2><p className="mt-2">Use the calculator to handle project dimensions, tile dimensions, unit conversion, and waste.</p><Link className="mt-4 inline-block font-semibold underline" href="/tile-calculator">Open the Tile Calculator →</Link></section>
      <section className="mt-10 space-y-6"><h2 className="text-2xl font-semibold">Frequently asked questions</h2>{faq.map((item) => <div key={item.q}><h3 className="font-semibold">{item.q}</h3><p className="mt-1 text-muted-foreground">{item.a}</p></div>)}</section>
      <p className="mt-10 text-sm text-muted-foreground">Estimates are planning aids. Confirm box coverage, lot availability, installation pattern, and manufacturer guidance before purchasing.</p>
    </main>
  );
}
