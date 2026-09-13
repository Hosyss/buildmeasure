"use client";

import { useState, type FormEvent } from "react";
import { trackAnalyticsEvent } from "@/components/analytics-tracker";
import {
  FEEDBACK_CALCULATORS,
  FEEDBACK_CATEGORIES,
  feedbackCalculatorLabel,
  type FeedbackCalculator,
} from "@/lib/feedback";

const CLIENT_TOKEN_KEY = "buildmeasure_feedback_client";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string }
  | { status: "success"; reference: string };

function createClientToken() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();

  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getClientToken() {
  const token = createClientToken();
  try {
    const existing = window.localStorage.getItem(CLIENT_TOKEN_KEY);
    if (existing && /^[a-zA-Z0-9-]{20,100}$/.test(existing)) return existing;

    window.localStorage.setItem(CLIENT_TOKEN_KEY, token);
    return token;
  } catch {
    return token;
  }
}

export function FeedbackForm({
  initialCalculator,
}: {
  initialCalculator: FeedbackCalculator;
}) {
  const [calculator, setCalculator] = useState(initialCalculator);
  const [startedAt] = useState(() => Date.now());
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ status: "submitting" });

    const form = new FormData(event.currentTarget);
    const payload = {
      calculator,
      category: form.get("category"),
      calculationInputs: form.get("calculationInputs"),
      actualResult: form.get("actualResult"),
      expectedResult: form.get("expectedResult"),
      details: form.get("details"),
      website: form.get("website"),
      clientToken: getClientToken(),
      startedAt,
    };

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        error?: string;
        reference?: string;
      };

      if (!response.ok || !result.reference) {
        setSubmitState({
          status: "error",
          message: result.error ?? "The report could not be submitted.",
        });
        return;
      }

      trackAnalyticsEvent({ event: "feedback_submitted", calculator });
      setSubmitState({ status: "success", reference: result.reference });
    } catch {
      setSubmitState({
        status: "error",
        message: "The report could not be submitted. Check your connection and try again.",
      });
    }
  }

  if (submitState.status === "success") {
    return (
      <section className="feedback-success" aria-labelledby="feedback-success-title">
        <p className="panel-kicker">Report received</p>
        <h2 id="feedback-success-title">Thank you for helping us verify the tools.</h2>
        <p>
          Your reference is <strong>{submitState.reference}</strong>. The report is
          stored for review; it does not change a calculator until the formula and
          test evidence are verified.
        </p>
        <a className="button button-primary" href={`/${calculator}`}>
          Return to {feedbackCalculatorLabel(calculator)}
        </a>
      </section>
    );
  }

  return (
    <form className="feedback-form" onSubmit={submitFeedback}>
      <div className="feedback-field-grid">
        <label>
          Calculator
          <select
            name="calculator"
            value={calculator}
            onChange={(event) => setCalculator(event.target.value as FeedbackCalculator)}
          >
            {FEEDBACK_CALCULATORS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          Feedback type
          <select name="category" defaultValue="result_issue">
            {FEEDBACK_CATEGORIES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Measurements and settings used
        <textarea
          name="calculationInputs"
          maxLength={1000}
          rows={4}
          placeholder="Example: 10 ft × 10 ft × 4 in, 10% allowance, 50 lb bags"
        />
      </label>

      <div className="feedback-field-grid">
        <label>
          Result shown
          <textarea
            name="actualResult"
            maxLength={500}
            rows={3}
            placeholder="Copy the result that BuildNumbers showed."
          />
        </label>
        <label>
          Result you expected
          <textarea
            name="expectedResult"
            maxLength={500}
            rows={3}
            placeholder="If known, tell us what you expected and why."
          />
        </label>
      </div>

      <label>
        What happened? <span aria-hidden="true">*</span>
        <textarea
          name="details"
          minLength={20}
          maxLength={2000}
          rows={6}
          required
          placeholder="Describe the problem clearly enough for us to reproduce it."
        />
        <small>Minimum 20 characters. Include steps to reproduce when possible.</small>
      </label>

      <div className="feedback-honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="feedback-submit-row">
        <button
          className="button button-primary"
          type="submit"
          disabled={submitState.status === "submitting"}
        >
          {submitState.status === "submitting" ? "Submitting…" : "Submit report"}
        </button>
        <p>
          Do not include personal, payment, account, or other sensitive information.
        </p>
      </div>

      <p className="feedback-status" role="status" aria-live="polite">
        {submitState.status === "error" ? submitState.message : ""}
      </p>
    </form>
  );
}
