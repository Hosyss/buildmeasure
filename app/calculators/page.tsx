import type { Metadata } from "next";
import { CheckIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CALCULATOR_CATALOG, LIVE_CALCULATOR_COUNT } from "@/lib/calculator-catalog";
import { absoluteUrl } from "@/lib/site";
import { CalculatorLibrary } from "./calculator-library";

export const metadata: Metadata = {
  title: "Construction & DIY Calculator Library",
  description:
    "Search and browse BuildNumbers construction calculators by work area, including concrete, paint, tile, brick, gravel, mulch, and drywall tools.",
  alternates: { canonical: "/calculators" },
  openGraph: {
    title: "BuildNumbers Calculator Library",
    description: `Browse ${LIVE_CALCULATOR_COUNT} transparent construction and DIY calculators by material and project type.`,
    type: "website",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "BuildNumbers Construction & DIY Calculator Library",
  url: absoluteUrl("/calculators"),
  description:
    "A searchable library of reference-backed construction and DIY material calculators.",
  hasPart: CALCULATOR_CATALOG.map((calculator) => ({
    "@type": "WebApplication",
    name: calculator.name,
    url: absoluteUrl(calculator.href),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
  })),
};

export default function CalculatorsPage() {
  return (
    <>
      <SiteHeader ctaHref="/projects" ctaLabel="Open Project Mode" />
      <main className="calculator-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <section className="calculator-hero">
          <div className="shell">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <a href="/">Home</a><span aria-hidden="true">/</span><span>Calculators</span>
            </nav>
            <div className="calculator-hero-grid">
              <div>
                <p className="eyebrow">Calculator library</p>
                <h1>Find the right tool without hunting through the site.</h1>
                <p>
                  Search {LIVE_CALCULATOR_COUNT} live calculators by material, job, or geometry, or narrow the library to one work area. Every tool links to a matching practical guide.
                </p>
              </div>
              <ul>
                <li><CheckIcon /> Search by material or project</li>
                <li><CheckIcon /> Filter by work area</li>
                <li><CheckIcon /> Calculator + guide together</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="shell" aria-label="Searchable calculator directory">
          <CalculatorLibrary />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
