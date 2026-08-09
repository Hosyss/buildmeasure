import type { Metadata } from "next";
import { UtilityContentPage } from "@/components/utility-content-page";

export const metadata: Metadata = {
  title: "About BuildMeasure",
  description:
    "Learn why BuildMeasure publishes transparent, reference-backed construction and DIY calculators.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <UtilityContentPage
      eyebrow="About the project"
      title="Clear calculations for better-built projects."
      intro="BuildMeasure is an independent calculator project focused on practical material estimates, visible assumptions, and results people can verify before they buy."
    >
      <h2>What BuildMeasure is building</h2>
      <p>
        The first release covers five common planning tasks: concrete slabs,
        room paint, rectangular tile surfaces, gravel layers, and mulch beds.
        Each tool supports metric and imperial units and keeps allowances,
        product coverage, density, or package size visible rather than hiding
        them behind a fixed answer.
      </p>

      <h2>Why the formulas are visible</h2>
      <p>
        A material estimate is only useful when its inputs and assumptions can
        be checked. Every live calculator publishes its formula version,
        engine version, review date, primary references, and a worked example
        that also appears in the automated test evidence.
      </p>

      <div className="utility-callout">
        <strong>Accuracy over page count</strong>
        <p>
          BuildMeasure expands one verified tool at a time. A planned feature or
          calculator is never labeled live until its calculation, content, and
          release evidence exist.
        </p>
      </div>

      <h2>What an estimate cannot replace</h2>
      <p>
        BuildMeasure does not create project plans, inspect site conditions, or
        know the exact product stocked by a supplier. Results are planning
        estimates and should be checked against drawings, local requirements,
        manufacturer data, supplier order increments, and a qualified project
        professional when the work requires one.
      </p>

      <div className="utility-link-row">
        <a className="button button-primary" href="/methodology">Read the methodology</a>
        <a className="button button-quiet" href="/feedback">Report an issue</a>
      </div>
    </UtilityContentPage>
  );
}
