"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FeedbackCalculator } from "@/lib/feedback";
import type {
  AnalyticsBrowser,
  AnalyticsDevice,
  AnalyticsEventName,
} from "@/lib/analytics";

type AnalyticsEventInput = {
  event: AnalyticsEventName;
  calculator?: FeedbackCalculator;
  detail?: string;
};

let pageSessionToken = "";
const sentOnce = new Set<string>();

function createSessionToken() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();

  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function sessionToken() {
  if (!pageSessionToken) pageSessionToken = createSessionToken();
  return pageSessionToken;
}

function browserClass(): AnalyticsBrowser {
  const agent = navigator.userAgent;
  if (/Edg\//.test(agent)) return "edge";
  if (/Firefox\//.test(agent)) return "firefox";
  if (/Safari\//.test(agent) && !/(?:Chrome|Chromium)\//.test(agent)) {
    return "safari";
  }
  if (/(?:Chrome|Chromium)\//.test(agent)) return "chrome";
  return "other";
}

function deviceClass(): AnalyticsDevice {
  if (window.innerWidth < 640) return "mobile";
  if (window.innerWidth < 1024) return "tablet";
  return "desktop";
}

function limited(value: string | null, maximum: number) {
  return (value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, maximum);
}

function externalReferrerHost() {
  if (!document.referrer) return "";
  try {
    const referrer = new URL(document.referrer);
    return referrer.origin === window.location.origin
      ? ""
      : limited(referrer.hostname, 255).toLowerCase();
  } catch {
    return "";
  }
}

export function trackAnalyticsEvent(
  input: AnalyticsEventInput,
  options: { once?: string } = {},
) {
  if (options.once) {
    if (sentOnce.has(options.once)) return;
    sentOnce.add(options.once);
  }

  const parameters = new URLSearchParams(window.location.search);
  const referrerHost = externalReferrerHost();
  const payload = {
    event: input.event,
    calculator: input.calculator ?? "",
    route: window.location.pathname,
    sessionToken: sessionToken(),
    source: limited(
      parameters.get("utm_source") || referrerHost || "direct",
      64,
    ),
    medium: limited(parameters.get("utm_medium"), 64),
    campaign: limited(parameters.get("utm_campaign"), 64),
    referrerHost,
    browser: browserClass(),
    device: deviceClass(),
    locale: limited(navigator.language, 20),
    detail: limited(input.detail, 200),
  };

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => undefined);
}

export function useCalculatorAnalytics(
  calculator: FeedbackCalculator,
  hasResult: boolean,
  errorDetail = "",
) {
  const interacted = useRef(false);
  const [interactionVersion, setInteractionVersion] = useState(0);

  useEffect(() => {
    trackAnalyticsEvent(
      { event: "calculator_opened", calculator },
      { once: `calculator-opened:${calculator}` },
    );
  }, [calculator]);

  useEffect(() => {
    if (!interacted.current || interactionVersion === 0) return;

    const timeout = window.setTimeout(() => {
      trackAnalyticsEvent({
        event: hasResult ? "calculation_completed" : "calculation_failed",
        calculator,
        detail: hasResult ? "" : errorDetail,
      });
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [calculator, errorDetail, hasResult, interactionVersion]);

  return useCallback(() => {
    if (!interacted.current) {
      interacted.current = true;
      trackAnalyticsEvent(
        { event: "calculator_interacted", calculator },
        { once: `calculator-interacted:${calculator}` },
      );
    }
    setInteractionVersion((current) => current + 1);
  }, [calculator]);
}

export function AnalyticsTracker() {
  useEffect(() => {
    function onError(event: ErrorEvent) {
      trackAnalyticsEvent(
        {
          event: "client_error",
          detail: event.message || "Script error",
        },
        { once: `client-error:${event.message || "script"}` },
      );
    }

    function onUnhandledRejection(event: PromiseRejectionEvent) {
      const detail =
        event.reason instanceof Error
          ? event.reason.message
          : typeof event.reason === "string"
            ? event.reason
            : "Unhandled promise rejection";
      trackAnalyticsEvent(
        { event: "client_error", detail },
        { once: `promise-error:${detail}` },
      );
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
