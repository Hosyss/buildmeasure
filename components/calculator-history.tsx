"use client";

import type { SavedEstimate } from "@/hooks/use-saved-estimates";

type CalculatorHistoryProps = {
  history: SavedEstimate[];
  onClear: () => void;
  titleId: string;
};

export function CalculatorHistory({
  history,
  onClear,
  titleId,
}: CalculatorHistoryProps) {
  return (
    <section className="history-panel no-print" aria-labelledby={titleId}>
      <div className="history-head">
        <div>
          <p className="panel-kicker">This device</p>
          <h2 id={titleId}>Saved estimates</h2>
        </div>
        {history.length ? (
          <button type="button" className="text-button" onClick={onClear}>
            Clear all
          </button>
        ) : null}
      </div>
      {history.length ? (
        <ul>
          {history.map((item) => (
            <li key={item.id}>
              <strong>{item.label}</strong>
              <span>{item.summary}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="history-empty">
          Save an estimate to keep it here. Data stays in this browser.
        </p>
      )}
    </section>
  );
}
