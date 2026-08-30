import {
  countRecentAnalyticsEvents,
  insertAnalyticsEvent,
} from "@/db/analytics";
import { validateAnalyticsPayload } from "@/lib/analytics";
import { readBoundedJson } from "@/lib/request-body";

export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 4_096;
const MAX_EVENTS_PER_HOUR = 120;

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return json({ error: "Invalid analytics event." }, 415);
  }

  const body = await readBoundedJson(request, MAX_REQUEST_BYTES);
  if (!body.ok) {
    return body.reason === "too_large"
      ? json({ error: "Analytics event is too large." }, 413)
      : json({ error: "Invalid analytics event." }, 400);
  }

  const validation = validateAnalyticsPayload(body.value);
  if (!validation.ok) {
    return json({ error: validation.error }, 400);
  }

  try {
    const recentEvents = await countRecentAnalyticsEvents(
      validation.value.sessionToken,
    );
    if (recentEvents >= MAX_EVENTS_PER_HOUR) {
      return new Response(null, {
        status: 204,
        headers: { "Cache-Control": "no-store" },
      });
    }

    await insertAnalyticsEvent(validation.value);
    return new Response(null, {
      status: 204,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Analytics event storage failed", error);
    return new Response(null, {
      status: 204,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
