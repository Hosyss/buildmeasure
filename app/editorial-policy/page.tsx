import type { Metadata } from "next";
import { UtilityContentPage } from "@/components/utility-content-page";

export const metadata: Metadata = {
  title: "Editorial, Source & Corrections Policy",
  description:
    "How BuildNumbers researches calculator guidance, chooses sources, separates facts from assumptions, reviews changes, and corrects published errors.",
  alternates: { canonical: "/editorial-policy" },
};

export default function EditorialPolicyPage() {
  return (
    <UtilityContentPage
      eyebrow="Published August 29, 2026"
      title="Editorial, source and corrections policy"
      intro="BuildNumbers publishes practical estimating guidance alongside tested calculators. This page explains what counts as evidence, what remains an assumption, how content is reviewed, and how mistakes are corrected."
    >
      <h2>Who is responsible for the site</h2>
      <p>
        BuildNumbers is independently developed and maintained by Hosyss. The
        public source repository and change history are available on GitHub so
        readers can compare published claims with the implementation and release
        record. BuildNumbers does not present itself as a substitute for an
        engineer, architect, building official, manufacturer, or material
        supplier.
      </p>

      <h2>What we publish</h2>
      <p>
        The site focuses on material quantity estimation: measured geometry,
        unit conversion, visible project allowances, product coverage or yield,
        and whole-package purchasing quantities. It does not choose structural
        dimensions, reinforcement, code requirements, product suitability, or
        site-specific safety decisions for the user.
      </p>

      <h2>Source hierarchy</h2>
      <p>
        BuildNumbers prefers primary or first-party technical sources whenever a
        published fact depends on an external reference. Unit definitions and
        conversions are checked against NIST resources. Product-specific yield,
        coverage, package volume, or similar values are tied to the relevant
        manufacturer data when those values are used as examples or defaults.
        Standards bodies, public technical agencies, and manufacturer technical
        documentation are preferred over unsourced summaries.
      </p>
      <p>
        A source is used only for the claim it actually supports. A manufacturer
        yield does not become a universal material constant, and a unit
        conversion reference does not establish project design requirements.
        When products or regions vary, the user-controlled value remains visible
        instead of being presented as a universal rule.
      </p>

      <h2>Facts, defaults and assumptions stay separate</h2>
      <p>
        Calculator geometry and unit conversions are deterministic. Project
        allowances, waste percentages, material density, product coverage,
        package size, bag yield, and similar purchasing inputs can vary. Where a
        default is useful, BuildNumbers labels it as an adjustable planning value
        or a product-backed example rather than hiding it in the formula.
      </p>

      <h2>How calculator guidance is reviewed</h2>
      <ul>
        <li>Define the supported geometry and exclusions before implementation.</li>
        <li>Check conversions and referenced values against the cited source.</li>
        <li>Keep the calculation engine separate from display formatting.</li>
        <li>Verify worked examples against independent hand-calculated vectors.</li>
        <li>Test metric and imperial equivalence, invalid inputs, and package-rounding boundaries.</li>
        <li>Run rendered-page checks for metadata, structured data, links, sitemap, and robots output.</li>
        <li>Record formula version, engine version, and review date on calculator pages.</li>
      </ul>

      <h2>Guide content is written to support a decision</h2>
      <p>
        A BuildNumbers guide should answer a concrete estimating question, show
        the measurement or formula sequence, explain which inputs change the
        result, include an example or reference table where it adds value, and
        state what must still be verified before purchase. The goal is not to
        create pages merely to target search phrases or increase page count.
      </p>

      <h2>Corrections policy</h2>
      <p>
        Reports are treated as evidence to investigate, not as permission to
        change a result without verification. A confirmed calculation defect is
        reproduced with a regression test before the engine is changed. The
        affected quality checks are rerun before release, and material changes
        are recorded in the public repository history.
      </p>
      <p>
        If a reference changes, a product value becomes outdated, a worked
        example is wrong, or wording overstates what a calculator can decide,
        the published page should be corrected and its review date updated.
      </p>

      <h2>Advertising does not set the answer</h2>
      <p>
        Advertising status does not change formulas, calculator outputs, source
        selection, or the decision to correct an error. If advertising is
        enabled, it remains separate from the calculation result and does not
        turn a product-specific example into a recommendation. BuildNumbers does
        not sell a better calculation result to advertisers or suppliers.
      </p>

      <h2>How to challenge a result or source</h2>
      <p>
        Use the <a href="/feedback">calculator issue form</a> for a calculation,
        conversion, documentation, or usability concern. Include the calculator,
        the values you entered, the result you expected, and a source when you
        are disputing a referenced value. For general questions, use the{" "}
        <a href="/contact">contact page</a>.
      </p>

      <div className="utility-link-row">
        <a className="button button-primary" href="/methodology">Read the calculation methodology</a>
        <a className="button button-quiet" href="/about">About BuildNumbers</a>
      </div>
    </UtilityContentPage>
  );
}
