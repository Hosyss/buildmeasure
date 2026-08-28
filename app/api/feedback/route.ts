import { countRecentFeedback, insertFeedback } from "@/db/feedback";
import { validateFeedbackPayload } from "@/lib/feedback";
import { readBoundedJson } from "@/lib/request-body";

export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 16_384;
const MAX_REPORTS_PER_HOUR = 5;

function json(body: Record<string, unknown>, status: number, headers?: HeadersInit) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return json({ error: "Submit the feedback form again." }, 415);
  }

  const body = await readBoundedJson(request, MAX_REQUEST_BYTES);
  if (!body.ok) {
    return body.reason === "too_large"
      ? json({ error: "This report is too large to submit." }, 413)
      : json({ error: "Submit the feedback form again." }, 400);
  }

  const validation = validateFeedbackPayload(body.value);
  if (!validation.ok) {
    return json({ error: validation.error }, 400);
  }

  try {
    const recentReports = await countRecentFeedback(
      validation.value.clientToken,
    );
    if (recentReports >= MAX_REPORTS_PER_HOUR) {
      return json(
        { error: "You have submitted several reports. Try again in one hour." },
        429,
        { "Retry-After": "3600" },
      );
    }

    const id = await insertFeedback(validation.value);
    return json(
      {
        ok: true,
        reference: `BM-${String(id).padStart(6, "0")}`,
      },
      201,
    );
  } catch (error) {
    console.error("Feedback submission failed", error);
    return json(
      { error: "Feedback is temporarily unavailable. Please try again later." },
      503,
    );
  }
}
