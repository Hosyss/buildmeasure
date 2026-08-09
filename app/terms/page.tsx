import type { Metadata } from "next";
import { UtilityContentPage } from "@/components/utility-content-page";

export const metadata: Metadata = {
  title: "Terms of Use & Estimating Disclaimer",
  description:
    "The terms, limitations, and user responsibilities that apply to BuildMeasure estimates.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <UtilityContentPage
      eyebrow="Last updated August 1, 2026"
      title="Terms of use and estimating disclaimer"
      intro="BuildMeasure provides planning estimates. Using a calculator does not create project drawings, a supplier quotation, or professional approval."
    >
      <h2>Planning use</h2>
      <p>
        BuildMeasure may be used to estimate material quantities for personal,
        educational, construction, and DIY planning. You are responsible for the
        accuracy, units, and suitability of every value you enter.
      </p>

      <h2>Verify before purchase or construction</h2>
      <p>
        Check results against project drawings, measured site conditions, local
        requirements, manufacturer instructions, supplier stock and order
        increments, and a qualified project professional when appropriate. Do
        not rely on a calculator as the sole basis for structural, safety,
        regulatory, or contractual decisions.
      </p>

      <h2>Visible assumptions are still assumptions</h2>
      <p>
        Waste percentages, coverage rates, bulk density, bag volume, bag weight,
        and package size can vary. BuildMeasure exposes these inputs so they can
        be replaced with project- and product-specific values; it cannot verify
        those values for you.
      </p>

      <h2>No guarantee of exact jobsite quantity</h2>
      <p>
        Real projects can differ because of irregular geometry, grading,
        compaction, spillage, substrate condition, cutting patterns, application
        method, product variation, and measurement error. Estimates are provided
        on an as-available basis without a guarantee that the quantity purchased
        will exactly match the quantity used.
      </p>

      <h2>Responsible use</h2>
      <p>
        Do not attempt to disrupt the service, submit abusive or sensitive
        content through feedback fields, or use automated requests in a way that
        interferes with other visitors. Feedback may be retained and reviewed to
        improve calculator quality under the privacy policy.
      </p>

      <h2>Changes</h2>
      <p>
        Calculators, formulas, references, and these terms may be updated as the
        product develops. Material formula changes are versioned and tested under
        the published <a href="/methodology">BuildMeasure methodology</a>.
      </p>
    </UtilityContentPage>
  );
}
