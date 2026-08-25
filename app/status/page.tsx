import type { Metadata } from "next";
import { UtilityContentPage } from "@/components/utility-content-page";
import { ensureAnalyticsStorage } from "@/db/analytics";
import { ensureFeedbackStorage } from "@/db/feedback";
import { BUILDMEASURE_VERSION } from "@/lib/release";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "System Status",
  robots: { index: false, follow: false },
};

export default async function StatusPage() {
  const [feedbackCheck, analyticsCheck] = await Promise.allSettled([
    ensureFeedbackStorage(),
    ensureAnalyticsStorage(),
  ]);
  const feedbackStorage = feedbackCheck.status === "fulfilled" ? "Operational" : "Degraded";
  const analyticsStorage = analyticsCheck.status === "fulfilled" ? "Operational" : "Degraded";
  const healthy = feedbackStorage === "Operational" && analyticsStorage === "Operational";

  return (
    <UtilityContentPage
      eyebrow="System status"
      title={healthy ? "JobsiteQuant is operational." : "JobsiteQuant is partially degraded."}
      intro="This first-party check confirms that the application can reach the storage used for calculator feedback and anonymous usage events. It does not represent traffic volume or field-performance data."
    >
      <div className="status-card">
        <div><span>Calculator pages</span><strong>Operational</strong></div>
        <div><span>Feedback storage</span><strong>{feedbackStorage}</strong></div>
        <div><span>Analytics storage</span><strong>{analyticsStorage}</strong></div>
        <div><span>Application version</span><strong>{BUILDMEASURE_VERSION}</strong></div>
        <div><span>Checked</span><strong>{new Date().toISOString()}</strong></div>
      </div>
      <p>
        For a calculation concern, use the <a href="/feedback">calculator issue form</a>
        so the exact inputs and expected result can be reviewed.
      </p>
    </UtilityContentPage>
  );
}
