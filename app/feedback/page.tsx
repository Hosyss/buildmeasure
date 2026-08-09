import type { Metadata } from "next";
import { FeedbackForm } from "@/components/feedback-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  FEEDBACK_CALCULATORS,
  isFeedbackCalculator,
} from "@/lib/feedback";

export const metadata: Metadata = {
  title: "Report a Calculator Issue",
  description:
    "Report a calculation, conversion, usability, or documentation issue to BuildMeasure.",
  alternates: { canonical: "/feedback" },
  robots: { index: false, follow: true },
};

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ calculator?: string }>;
}) {
  const { calculator } = await searchParams;
  const initialCalculator = isFeedbackCalculator(calculator)
    ? calculator
    : FEEDBACK_CALCULATORS[0][0];

  return (
    <>
      <SiteHeader />
      <main>
        <section className="utility-page-hero">
          <div className="shell utility-page-hero-grid">
            <div>
              <p className="eyebrow">Accuracy feedback</p>
              <h1>Report a calculator issue</h1>
              <p>
                Tell us exactly what you entered, what BuildMeasure returned, and
                what looked wrong. Every confirmed calculation defect gets a
                regression test before it is fixed.
              </p>
            </div>
            <aside className="feedback-principles" aria-label="Review process">
              <strong>How reports are handled</strong>
              <ol>
                <li>Reproduce the inputs.</li>
                <li>Check the formula and source.</li>
                <li>Add a regression test.</li>
                <li>Fix, rerun QA, and document the change.</li>
              </ol>
            </aside>
          </div>
        </section>
        <section className="shell feedback-page-section">
          <FeedbackForm initialCalculator={initialCalculator} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
