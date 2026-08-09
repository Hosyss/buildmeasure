import {
  FEEDBACK_CALCULATORS,
  type FeedbackCalculator,
} from "./feedback.ts";

export const ANALYTICS_EVENTS = [
  "calculator_opened",
  "calculator_interacted",
  "calculation_completed",
  "calculation_failed",
  "result_copied",
  "result_saved",
  "result_printed",
  "feedback_submitted",
  "client_error",
] as const;

export const ANALYTICS_BROWSERS = [
  "chrome",
  "edge",
  "firefox",
  "safari",
  "other",
] as const;

export const ANALYTICS_DEVICES = ["mobile", "tablet", "desktop"] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];
export type AnalyticsBrowser = (typeof ANALYTICS_BROWSERS)[number];
export type AnalyticsDevice = (typeof ANALYTICS_DEVICES)[number];

export type AnalyticsSubmission = {
  event: AnalyticsEventName;
  calculator: FeedbackCalculator | "";
  route: string;
  sessionToken: string;
  source: string;
  medium: string;
  campaign: string;
  referrerHost: string;
  browser: AnalyticsBrowser;
  device: AnalyticsDevice;
  locale: string;
  detail: string;
};

type AnalyticsValidationResult =
  | { ok: true; value: AnalyticsSubmission }
  | { ok: false; error: string };

const eventKeys = new Set<string>(ANALYTICS_EVENTS);
const calculatorKeys = new Set<string>(
  FEEDBACK_CALCULATORS.map(([key]) => key),
);
const browserKeys = new Set<string>(ANALYTICS_BROWSERS);
const deviceKeys = new Set<string>(ANALYTICS_DEVICES);

function readText(value: unknown, maximum: number) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length <= maximum ? text : null;
}

export function validateAnalyticsPayload(
  payload: unknown,
): AnalyticsValidationResult {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "Invalid analytics event." };
  }

  const data = payload as Record<string, unknown>;
  const event = readText(data.event, 40);
  const calculator = readText(data.calculator, 40);
  const route = readText(data.route, 160);
  const sessionToken = readText(data.sessionToken, 100);
  const source = readText(data.source, 64);
  const medium = readText(data.medium, 64);
  const campaign = readText(data.campaign, 64);
  const referrerHost = readText(data.referrerHost, 255);
  const browser = readText(data.browser, 16);
  const device = readText(data.device, 16);
  const locale = readText(data.locale, 20);
  const detail = readText(data.detail, 200);

  if (!event || !eventKeys.has(event)) {
    return { ok: false, error: "Invalid analytics event." };
  }
  if (
    calculator === null ||
    (calculator !== "" && !calculatorKeys.has(calculator))
  ) {
    return { ok: false, error: "Invalid calculator." };
  }
  if (!route || !/^\/[a-zA-Z0-9/_-]*$/.test(route)) {
    return { ok: false, error: "Invalid route." };
  }
  if (!sessionToken || !/^[a-zA-Z0-9-]{20,100}$/.test(sessionToken)) {
    return { ok: false, error: "Invalid analytics session." };
  }
  if (
    source === null ||
    medium === null ||
    campaign === null ||
    referrerHost === null ||
    locale === null ||
    detail === null
  ) {
    return { ok: false, error: "Analytics field is too long." };
  }
  if (!browser || !browserKeys.has(browser)) {
    return { ok: false, error: "Invalid browser class." };
  }
  if (!device || !deviceKeys.has(device)) {
    return { ok: false, error: "Invalid device class." };
  }
  if (locale && !/^[a-zA-Z0-9_-]{1,20}$/.test(locale)) {
    return { ok: false, error: "Invalid locale." };
  }

  return {
    ok: true,
    value: {
      event: event as AnalyticsEventName,
      calculator: calculator as FeedbackCalculator | "",
      route,
      sessionToken,
      source,
      medium,
      campaign,
      referrerHost: referrerHost.toLowerCase(),
      browser: browser as AnalyticsBrowser,
      device: device as AnalyticsDevice,
      locale,
      detail,
    },
  };
}
