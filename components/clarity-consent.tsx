"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const CLARITY_PROJECT_ID = "y1aqxtb5o5";
const CONSENT_STORAGE_KEY = "buildmeasure-analytics-consent-v1";
const CHOICES_EVENT = "buildmeasure:analytics-choices";

type ConsentState = "granted" | "denied";
type ConsentLocale = "en" | "ar";
type ClarityFunction = ((...args: unknown[]) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    clarity?: ClarityFunction;
  }
}

const copy = {
  en: {
    label: "Analytics choices",
    title: "Optional analytics",
    description:
      "Microsoft Clarity can help us understand navigation and technical friction. It loads only after you allow it, and advertising storage stays disabled.",
    allow: "Allow",
    decline: "Decline",
    privacy: "Privacy policy",
  },
  ar: {
    label: "خيارات التحليلات",
    title: "تحليلات اختيارية",
    description:
      "يمكن لـ Microsoft Clarity مساعدتنا في فهم التنقل والمشكلات التقنية. لا يتم تحميله إلا بعد موافقتك، ويظل تخزين الإعلانات معطّلًا.",
    allow: "سماح",
    decline: "رفض",
    privacy: "سياسة الخصوصية",
  },
} as const;

function browserLocale(): ConsentLocale {
  return window.navigator.language.toLowerCase().startsWith("ar") ? "ar" : "en";
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
  position: "relative",
  zIndex: 1000,
  width: "100%",
  borderBottom: "1px solid #c7d4dc",
  background: "#f8fbfc",
  color: "#183247",
  padding: "8px 12px",
  boxShadow: "0 2px 8px rgba(17, 36, 50, 0.08)",
} as const;

const panelInnerStyle = {
  width: "100%",
  maxWidth: "1180px",
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "8px 14px",
} as const;

const copyStyle = {
  flex: "1 1 360px",
  minWidth: 0,
} as const;

const actionRowStyle = {
  display: "flex",
  flex: "0 1 auto",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "6px",
} as const;

const primaryButtonStyle = {
  minHeight: "36px",
  border: "1px solid #183247",
  background: "#183247",
  color: "#ffffff",
  padding: "6px 11px",
  font: "inherit",
  fontWeight: 700,
  cursor: "pointer",
} as const;

const secondaryButtonStyle = {
  minHeight: "36px",
  border: "1px solid #183247",
  background: "#ffffff",
  color: "#183247",
  padding: "6px 11px",
  font: "inherit",
  fontWeight: 700,
  cursor: "pointer",
} as const;

export function ClarityConsent() {
  const consentGranted = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [locale, setLocale] = useState<ConsentLocale>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored === "granted") {
      consentGranted.current = true;
      loadClarity();
    } else if (stored !== "denied") {
      queueMicrotask(() => {
        setLocale(browserLocale());
        setIsOpen(true);
      });
    }

    const openChoices = () => {
      setLocale(browserLocale());
      setIsOpen(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
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

  const text = copy[locale];

  return (
    <section
      aria-label={text.label}
      aria-live="polite"
      dir={locale === "ar" ? "rtl" : "ltr"}
      lang={locale}
      style={panelStyle}
    >
      <div style={panelInnerStyle}>
        <div style={copyStyle}>
          <strong style={{ display: "block", fontSize: "0.95rem", lineHeight: 1.25 }}>
            {text.title}
          </strong>
          <p style={{ margin: "2px 0 0", fontSize: "0.875rem", lineHeight: 1.35 }}>
            {text.description}
          </p>
        </div>
        <div style={actionRowStyle}>
          <button type="button" style={primaryButtonStyle} onClick={() => choose("granted")}>
            {text.allow}
          </button>
          <button type="button" style={secondaryButtonStyle} onClick={() => choose("denied")}>
            {text.decline}
          </button>
          <a
            href="/privacy"
            style={{
              color: "inherit",
              minHeight: "36px",
              display: "inline-flex",
              alignItems: "center",
              padding: "0 4px",
              fontSize: "0.875rem",
            }}
          >
            {text.privacy}
          </a>
        </div>
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
