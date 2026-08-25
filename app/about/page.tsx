import type { Metadata } from "next";
import { UtilityContentPage } from "@/components/utility-content-page";

export const metadata: Metadata = {
  title: "About BuildNumbers",
  description:
    "Learn who maintains BuildNumbers and why its construction and DIY calculators publish transparent, reference-backed estimates.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <UtilityContentPage
      eyebrow="About the project"
      title="Clear calculations for better-built projects."
      intro="BuildNumbers is an independently developed calculator project, built and maintained by Hosyss, focused on practical material estimates, visible assumptions, and results people can verify before they buy."
    >
      <h2>Who maintains BuildNumbers</h2>
      <p>
        BuildNumbers is independently built and maintained by{" "}
        <a href="https://github.com/Hosyss">Hosyss</a>. The source repository,
        change history, and verified release artifacts are publicly available on{" "}
        <a href="https://github.com/Hosyss/buildmeasure">GitHub</a>, so the
        product&apos;s published claims can be checked against the code and release
        evidence.
      </p>

      <h2>What is live today</h2>
      <p>
        BuildNumbers currently provides eight live calculators: concrete slabs,
        post-hole concrete, room paint, rectangular tile surfaces, fired-clay
        brick walls, gravel layers, mulch beds, and drywall sheets. Each tool supports metric
        and imperial units and keeps allowances, product coverage, density,
        displacement, or package size visible rather than hiding them behind a
        fixed answer.
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
          BuildNumbers expands one verified tool at a time. A planned feature or
          calculator is never labeled live until its calculation, content, and
          release evidence exist.
        </p>
      </div>

      <h2>Privacy and saved estimates</h2>
      <p>
        No account is required to use the calculators. Saved estimates stay in
        the current browser&apos;s local storage instead of being uploaded to a
        BuildNumbers account. That improves privacy, but it also means saved
        estimates do not sync between devices and can be lost if browser site
        data is cleared.
      </p>

      <h2>What an estimate cannot replace</h2>
      <p>
        BuildNumbers does not create project plans, inspect site conditions, or
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
