import type { Metadata } from "next";
import { UtilityContentPage } from "@/components/utility-content-page";

export const metadata: Metadata = {
  title: "Calculation Methodology & Quality Standard",
  description:
    "See how JobsiteQuant sources formulas, converts units, rounds procurement quantities, tests calculators, and handles defects.",
  alternates: { canonical: "/methodology" },
};

export default function MethodologyPage() {
  return (
    <UtilityContentPage
      eyebrow="The JobsiteQuant standard"
      title="How every calculator earns trust."
      intro="The interface is not the source of truth. Each result comes from a deterministic calculation engine with documented inputs, references, versions, and repeatable tests."
    >
      <h2>1. Define the calculation boundary</h2>
      <p>
        Every tool begins with a written specification: supported shape,
        required measurements, units, adjustable assumptions, output units,
        validation limits, and explicit exclusions. A rectangular slab tool,
        for example, is not presented as a footing, wall, or irregular-shape
        calculator.
      </p>

      <h2>2. Prefer primary references</h2>
      <p>
        Unit definitions come from NIST. Material practices use standards
        bodies, public technical agencies, or manufacturer product data as
        appropriate. A product-specific yield or coverage value is identified
        as product-specific and remains adjustable whenever a universal value
        would be misleading.
      </p>

      <h2>3. Calculate once, display many ways</h2>
      <p>
        The calculator engine converts inputs to a canonical unit and performs
        the calculation at full numeric precision. Metric and imperial outputs
        are different views of the same internal result. Display rounding never
        feeds back into the next calculation.
      </p>

      <h2>4. Separate geometry from assumptions</h2>
      <p>
        Net area or volume is calculated first. Waste, project allowance,
        coverage, bulk density, bag volume, bag weight, and package size are
        applied in separate visible steps. This makes it possible to change one
        assumption without silently changing the geometry.
      </p>

      <h2>5. Round only at the procurement boundary</h2>
      <p>
        Intermediate quantities remain unrounded. Complete bags, boxes, cans,
        and pails round upward only after the unrounded required quantity has
        been calculated. Exact boundaries are tested so a floating-point trace
        cannot add an unnecessary package.
      </p>

      <h2>6. Pass the release evidence</h2>
      <ul>
        <li>Independent hand-calculated result vectors.</li>
        <li>Metric and imperial equivalence tests.</li>
        <li>Zero, negative, non-finite, underflow, overflow, and unsafe-number tests.</li>
        <li>Exact procurement-boundary and upward-rounding tests.</li>
        <li>Deterministic randomized invariant tests.</li>
        <li>Rendered page, metadata, structured data, sitemap, robots, and internal-link checks.</li>
        <li>Manual keyboard, responsive interaction, console, and visual review.</li>
        <li>Mobile and desktop Lighthouse audits for major milestones.</li>
      </ul>

      <h2>7. Treat defects as permanent test cases</h2>
      <p>
        A calculation defect is reproduced with a failing regression test before
        the engine is changed. The complete required QA matrix is then rerun,
        and the user-visible change is recorded. A report is evidence to
        investigate, not permission to change a formula without verification.
      </p>

      <div className="utility-callout">
        <strong>Versioned evidence</strong>
        <p>
          Formula version identifies the mathematical specification. Engine
          version identifies its implementation. Last reviewed records the date
          the published references and behavior were checked together.
        </p>
      </div>

      <div className="utility-link-row">
        <a className="button button-primary" href="/guides/material-estimating-basics">Use the estimating workflow</a>
        <a className="button button-quiet" href="/feedback">Report a calculation issue</a>
      </div>
    </UtilityContentPage>
  );
}
