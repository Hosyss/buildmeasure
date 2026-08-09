"use client";

import { CopyIcon, PrintIcon, SaveIcon } from "./icons";
import { trackAnalyticsEvent } from "./analytics-tracker";
import type { FeedbackCalculator } from "@/lib/feedback";

type CalculatorActionsProps = {
  calculator: FeedbackCalculator;
  onCopy: () => void | Promise<void>;
  onSave: () => void;
};

export function CalculatorActions({
  calculator,
  onCopy,
  onSave,
}: CalculatorActionsProps) {
  return (
    <div className="no-print">
      <div className="result-actions">
        <button type="button" onClick={async () => {
          await onCopy();
          trackAnalyticsEvent({ event: "result_copied", calculator });
        }}><CopyIcon /> Copy</button>
        <button type="button" onClick={() => {
          onSave();
          trackAnalyticsEvent({ event: "result_saved", calculator });
        }}><SaveIcon /> Save</button>
        <button type="button" onClick={() => {
          trackAnalyticsEvent({ event: "result_printed", calculator });
          window.print();
        }}><PrintIcon /> Print</button>
      </div>
      <a
        className="report-problem-link"
        href={`/feedback?calculator=${encodeURIComponent(calculator)}`}
      >
        Report a calculation issue
      </a>
    </div>
  );
}
