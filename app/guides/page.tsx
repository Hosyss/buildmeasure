import type { Metadata } from "next";
import { ArrowIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Material Estimating Guides — Construction & DIY",
  description: "Practical, reference-backed guides for measuring concrete slabs, footings, columns, drywall, paint, tile, brick, gravel, and mulch before using a material calculator.",
  alternates: { canonical: "/guides" },
};

const guides = [
  ["Concrete slabs", "How many bags of concrete do I need?", "Measure a slab, convert volume, compare ready-mix and bag quantities, and keep waste visible.", "/guides/how-many-bags-of-concrete"],
  ["Concrete footings", "How much concrete do I need for footings?", "Turn measured rectangular footing dimensions and identical footing count into volume and complete bags without guessing structural size.", "/guides/how-much-concrete-for-footings"],
  ["Concrete columns", "How much concrete do I need for columns?", "Calculate rectangular, square, or circular column volume, combine identical columns, keep allowance visible, and round complete bags.", "/guides/how-much-concrete-for-columns"],
  ["Posts & fences", "How many concrete bags for post holes?", "Calculate round-hole volume, multiple holes, optional post displacement, and complete bags.", "/guides/how-many-bags-of-concrete-for-post-holes"],
  ["Interior walls", "How many drywall sheets do I need?", "Measure room walls and ceilings, subtract openings, choose panel size, and understand layout limits.", "/guides/how-many-drywall-sheets-do-i-need"],
  ["Interior finishes", "How much paint do I need?", "Turn wall area, openings, coats, product coverage, and container size into a purchase estimate.", "/guides/how-much-paint-do-i-need"],
  ["Flooring", "How many tiles do I need?", "Separate area-based purchase quantity from grout-aware layout and full-box rounding.", "/guides/how-many-tiles-do-i-need"],
  ["Masonry", "How many bricks do I need?", "Use measured net wall area, a documented product coverage rate, and explicit breakage allowance.", "/guides/how-many-bricks-do-i-need"],
  ["Landscaping", "How much gravel do I need?", "Calculate volume first, then use an explicit bulk-density assumption for mass, tons, and bags.", "/guides/how-much-gravel-do-i-need"],
  ["Garden beds", "How much mulch do I need?", "Estimate bed volume, installed depth, bulk cubic yards, and bags using package volume.", "/guides/how-much-mulch-do-i-need"],
] as const;

const schema = { "@context": "https://schema.org", "@type": "CollectionPage", name: "BuildNumbers Material Estimating Guides", url: absoluteUrl("/guides"), description: "A library of practical construction and DIY material estimating guides.", hasPart: guides.map((guide) => ({ "@type": "Article", name: guide[1], url: absoluteUrl(guide[3]) })) };

export default function GuidesPage() {
  return <>
    <SiteHeader ctaHref="/#calculators" ctaLabel="Open calculators" />
    <main className="guide-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/><section className="guide-hero"><div className="shell guide-hero-grid"><div><nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>Guides</span></nav><p className="eyebrow">BuildNumbers field notes</p><h1>Material estimating guides</h1><p>Learn what to measure, which assumptions change the result, where rounding belongs, and what the calculator cannot decide for your project.</p></div><aside><strong>Use the library in order</strong><ol><li>Read the measurement guide.</li><li>Verify product-label values.</li><li>Run the matching calculator.</li><li>Check plans and supplier rules.</li></ol></aside></div></section><section className="section shell"><div className="section-heading"><div><p className="eyebrow">Ten focused guides</p><h2>Choose the material you are planning.</h2></div><p>Every guide links to a tested calculator and states its scope limits.</p></div><div className="resource-grid">{guides.map(([topic, title, description, href]) => <a href={href} key={href}><span>{topic}</span><h3>{title}</h3><p>{description}</p><strong>Read the guide <ArrowIcon /></strong></a>)}</div></section><section className="standards-section"><div className="shell standards-grid"><div><p className="eyebrow eyebrow-light">Before the first measurement</p><h2>Good estimates preserve uncertainty.</h2><p className="standards-lede">BuildNumbers separates geometry, user-controlled allowances, product-label inputs, and whole-package rounding. It does not hide regional product differences behind a universal default.</p></div><div><a className="button button-primary" href="/guides/material-estimating-basics">Read the estimating workflow <ArrowIcon /></a></div></div></section></main>
    <SiteFooter />
  </>;
}
