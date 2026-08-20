"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const CLARITY_PROJECT_ID = "y1aqxtb5o5";
const CONSENT_STORAGE_KEY = "buildmeasure-analytics-consent-v1";
const CHOICES_EVENT = "buildmeasure:analytics-choices";

type ConsentState = "granted" | "denied";
type ClarityFunction = ((...args: unknown[]) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    clarity?: ClarityFunction;
  }
}

function clarityQueue() {
  if (window.clarity) return window.clarity;

  const queued = ((...args: unknown[]) => {
    queued.q ??= [];
    queued.q.push(args);
  }) as ClarityFunction;
  queued.q = [];
  window.clarity = queued;
  return queued;
}

function loadClarity() {
  const clarity = clarityQueue();
  clarity("consentv2", {
    ad_Storage: "denied",
    analytics_Storage: "granted",
  });

  if (document.getElementById("buildmeasure-clarity")) return;

  const script = document.createElement("script");
  script.id = "buildmeasure-clarity";
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
  document.head.appendChild(script);
}

function clearClarityConsent() {
  window.clarity?.("consentv2", {
    ad_Storage: "denied",
    analytics_Storage: "denied",
  });
  window.clarity?.("consent", false);
}

const panelStyle = {
  position: "fixed",
  right: "12px",
  bottom: "12px",
  zIndex: 1000,
  width: "min(390px, calc(100vw - 24px))",
  maxHeight: "calc(100vh - 24px)",
  overflowY: "auto",
  border: "1px solid #183247",
  background: "#ffffff",
  color: "#183247",
  padding: "14px",
  boxShadow: "0 10px 28px rgba(17, 36, 50, 0.18)",
} as const;

const actionRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  marginTop: "12px",
} as const;

const primaryButtonStyle = {
  flex: "1 1 150px",
  minHeight: "44px",
  border: "1px solid #183247",
  background: "#183247",
  color: "#ffffff",
  padding: "10px 14px",
  font: "inherit",
  fontWeight: 700,
  cursor: "pointer",
} as const;

const secondaryButtonStyle = {
  flex: "1 1 150px",
  minHeight: "44px",
  border: "1px solid #183247",
  background: "#ffffff",
  color: "#183247",
  padding: "10px 14px",
  font: "inherit",
  fontWeight: 700,
  cursor: "pointer",
} as const;

export function ClarityConsent() {
  const consentGranted = useRef(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored === "granted") {
      consentGranted.current = true;
      loadClarity();
    } else if (stored !== "denied") {
      queueMicrotask(() => setIsOpen(true));
    }

    const openChoices = () => setIsOpen(true);
    window.addEventListener(CHOICES_EVENT, openChoices);
    return () => window.removeEventListener(CHOICES_EVENT, openChoices);
  }, []);

  const choose = useCallback((next: ConsentState) => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, next);
    setIsOpen(false);

    if (next === "granted") {
      consentGranted.current = true;
      loadClarity();
      return;
    }

    const wasGranted = consentGranted.current;
    consentGranted.current = false;
    clearClarityConsent();
    if (wasGranted) {
      window.location.reload();
    }
  }, []);

  if (!isOpen) return null;

  return (
    <section
      aria-label="Analytics choices"
      aria-live="polite"
      style={panelStyle}
    >
      <strong style={{ display: "block", fontSize: "1rem" }}>
        Optional analytics
      </strong>
      <p style={{ margin: "6px 0 0", lineHeight: 1.5 }}>
        Allow Microsoft Clarity to help us understand navigation and technical
        friction. Clarity loads only after you allow it, and advertising storage
        stays disabled.
      </p>
      <div style={actionRowStyle}>
        <button type="button" style={primaryButtonStyle} onClick={() => choose("granted")}>
          Allow analytics
        </button>
        <button type="button" style={secondaryButtonStyle} onClick={() => choose("denied")}>
          Decline analytics
        </button>
        <a
          href="/privacy"
          style={{
            alignSelf: "center",
            color: "inherit",
            minHeight: "44px",
            display: "inline-flex",
            alignItems: "center",
            padding: "0 2px",
          }}
        >
          Privacy policy
        </a>
      </div>
    </section>
  );
}

export function AnalyticsChoicesButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(CHOICES_EVENT))}
      style={{
        border: 0,
        padding: 0,
        background: "transparent",
        color: "inherit",
        font: "inherit",
        textAlign: "left",
        cursor: "pointer",
        textDecoration: "underline",
        textUnderlineOffset: "3px",
      }}
    >
      Analytics choices
    </button>
  );
}
