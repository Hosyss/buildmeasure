import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAnalyticsDashboard } from "@/db/analytics";
import { feedbackAdminEmail } from "@/db/feedback";
import {
  feedbackCalculatorLabel,
  type FeedbackCalculator,
} from "@/lib/feedback";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Usage Analytics",
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

export default async function AnalyticsPage() {
  const adminEmail = await feedbackAdminEmail();
  if (!adminEmail) notFound();

  const user = await requireChatGPTUser("/analytics");
  if (user.email.trim().toLowerCase() !== adminEmail) notFound();

  const analytics = await getAnalyticsDashboard(30);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="utility-page-hero utility-page-hero-compact">
          <div className="shell">
            <p className="eyebrow">Owner analytics</p>
            <h1>Real calculator usage</h1>
            <p>
              Anonymous interaction evidence from the last {analytics.days} days.
              Automated page requests alone do not count as engaged sessions.
            </p>
            <p className="owner-page-link"><a href="/feedback/inbox">Open feedback inbox</a></p>
          </div>
        </section>

        <section className="shell analytics-section">
          <div className="analytics-summary-grid">
            <article><span>Engaged sessions</span><strong>{analytics.totals.engagedSessions}</strong></article>
            <article><span>Calculator opens</span><strong>{analytics.totals.openings}</strong></article>
            <article><span>Completed estimates</span><strong>{analytics.totals.completed}</strong></article>
            <article><span>Invalid attempts</span><strong>{analytics.totals.failed}</strong></article>
            <article><span>Feedback submitted</span><strong>{analytics.totals.feedback}</strong></article>
            <article><span>Client errors</span><strong>{analytics.totals.errors}</strong></article>
          </div>

          <div className="analytics-table-grid">
            <section>
              <h2>Calculator activity</h2>
              {analytics.calculators.length ? (
                <div className="analytics-table-wrap">
                  <table>
                    <thead><tr><th>Calculator</th><th>Sessions</th><th>Completed</th><th>Invalid</th></tr></thead>
                    <tbody>
                      {analytics.calculators.map((row) => (
                        <tr key={row.calculator}>
                          <td>{feedbackCalculatorLabel(row.calculator as FeedbackCalculator)}</td>
                          <td>{row.engagedSessions}</td>
                          <td>{row.completed}</td>
                          <td>{row.failed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p>No calculator interactions recorded yet.</p>}
            </section>

            <section>
              <h2>Engaged traffic sources</h2>
              {analytics.sources.length ? (
                <div className="analytics-table-wrap">
                  <table>
                    <thead><tr><th>Source</th><th>Sessions</th></tr></thead>
                    <tbody>
                      {analytics.sources.map((row) => (
                        <tr key={row.source}><td>{row.source || "direct"}</td><td>{row.engagedSessions}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p>No engaged traffic sources recorded yet.</p>}
            </section>
          </div>

          <section className="analytics-errors">
            <h2>Recent browser errors</h2>
            {analytics.recentErrors.length ? (
              <ol>
                {analytics.recentErrors.map((error, index) => (
                  <li key={`${error.createdAt}-${index}`}>
                    <strong>{error.detail || "Unspecified client error"}</strong>
                    <span>{error.route} · {error.browser} · {error.device} · {formatUtc(error.createdAt)} UTC</span>
                  </li>
                ))}
              </ol>
            ) : <p>No client errors recorded in this period.</p>}
          </section>

          <p className="analytics-privacy-note">
            BuildMeasure does not store IP addresses, names, email addresses,
            raw user-agent strings, or persistent analytics cookies in this log.
            Each page load receives a temporary random session identifier.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
