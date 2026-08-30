import { ensureFeedbackStorage } from "@/db/feedback";
import { ensureAnalyticsStorage } from "@/db/analytics";
import { BUILDMEASURE_VERSION } from "@/lib/release";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  const [feedbackStorage, analyticsStorage] = await Promise.allSettled([
    ensureFeedbackStorage(),
    ensureAnalyticsStorage(),
  ]);
  const checks = {
    feedbackStorage: feedbackStorage.status === "fulfilled" ? "ok" : "unavailable",
    analyticsStorage: analyticsStorage.status === "fulfilled" ? "ok" : "unavailable",
  };

  if (feedbackStorage.status === "fulfilled" && analyticsStorage.status === "fulfilled") {
    return Response.json(
      {
        status: "ok",
        version: BUILDMEASURE_VERSION,
        checks,
        timestamp,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  console.error("BuildNumbers health check failed", {
    feedbackStorage: feedbackStorage.status,
    analyticsStorage: analyticsStorage.status,
  });
  return Response.json(
    {
      status: "degraded",
      version: BUILDMEASURE_VERSION,
      checks,
      timestamp,
    },
    {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": "60",
      },
    },
  );
}
