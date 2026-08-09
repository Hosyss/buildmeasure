import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import {
  feedbackAdminEmail,
  listFeedbackReports,
} from "@/db/feedback";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  feedbackCalculatorLabel,
  feedbackCategoryLabel,
  type FeedbackCalculator,
  type FeedbackCategory,
} from "@/lib/feedback";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Feedback Inbox",
  robots: { index: false, follow: false },
};

function formatUtc(value: string) {
  const isoValue = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const date = new Date(isoValue);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      });
}

export default async function FeedbackInboxPage() {
  const adminEmail = await feedbackAdminEmail();
  if (!adminEmail) notFound();

  const user = await requireChatGPTUser("/feedback/inbox");
  if (user.email.trim().toLowerCase() !== adminEmail) notFound();

  const reports = await listFeedbackReports();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="utility-page-hero utility-page-hero-compact">
          <div className="shell">
            <p className="eyebrow">Owner review</p>
            <h1>Feedback inbox</h1>
            <p>{reports.length} most recent calculator reports, newest first.</p>
            <p className="owner-page-link"><a href="/analytics">View usage analytics</a></p>
          </div>
        </section>
        <section className="shell feedback-inbox-section">
          {reports.length ? (
            <ol className="feedback-inbox-list">
              {reports.map((report) => (
                <li key={report.id}>
                  <div className="feedback-inbox-head">
                    <div>
                      <span>BM-{String(report.id).padStart(6, "0")}</span>
                      <h2>
                        {feedbackCalculatorLabel(report.calculator as FeedbackCalculator)}
                      </h2>
                    </div>
                    <div>
                      <strong>{feedbackCategoryLabel(report.category as FeedbackCategory)}</strong>
                      <time dateTime={report.createdAt}>{formatUtc(report.createdAt)} UTC</time>
                    </div>
                  </div>
                  {report.calculationInputs ? (
                    <section><h3>Inputs</h3><p>{report.calculationInputs}</p></section>
                  ) : null}
                  {report.actualResult ? (
                    <section><h3>Result shown</h3><p>{report.actualResult}</p></section>
                  ) : null}
                  {report.expectedResult ? (
                    <section><h3>Expected result</h3><p>{report.expectedResult}</p></section>
                  ) : null}
                  <section><h3>Details</h3><p>{report.details}</p></section>
                </li>
              ))}
            </ol>
          ) : (
            <div className="feedback-empty">
              <h2>No reports yet</h2>
              <p>New calculator feedback will appear here after submission.</p>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
