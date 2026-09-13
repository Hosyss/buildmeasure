"use client";

import { CalculatorActions } from "@/components/calculator-actions";
import { CalculatorCostResult } from "@/components/calculator-cost";
import type { PurchaseCostResult } from "@/lib/cost-estimate";
import type { ConcreteProjectResult } from "@/lib/calculators/concrete-project";
import { KIND_LABELS } from "./project-draft";
import styles from "./concrete-project.module.css";

type ProjectResultProps = {
  result: ConcreteProjectResult | null;
  cost: PurchaseCostResult | null;
  notice: string;
  onCopy: () => void | Promise<void>;
  onSave: () => void;
};

export function ProjectResult({
  result,
  cost,
  notice,
  onCopy,
  onSave,
}: ProjectResultProps) {
  return (
    <aside className="result-panel" aria-live="polite">
      <div className="result-panel-head">
        <div>
          <p className="panel-kicker">Project total</p>
          <h2>Combined concrete order</h2>
        </div>
        <span className="engine-badge">One final rounding</span>
      </div>

      {result ? (
        <>
          <div className="primary-result">
            <span>Order volume</span>
            <strong>{result.cubicYards.toFixed(3)} <small>yd³</small></strong>
            <p>{result.orderCubicMeters.toFixed(3)} m³ · {result.liters.toFixed(0)} L</p>
          </div>

          <dl className="result-breakdown">
            <div><dt>Net concrete</dt><dd>{result.netCubicMeters.toFixed(3)} m³</dd></div>
            <div><dt>Project allowance</dt><dd>{result.wastePercent}%</dd></div>
            <div><dt>Complete bags</dt><dd>{result.bags} × {result.bagSize} lb</dd></div>
            <div><dt>Project parts</dt><dd>{result.partCount}</dd></div>
          </dl>

          <section aria-label="Per-part concrete breakdown">
            <p className="panel-kicker">Audit breakdown</p>
            <ul className={styles.breakdown}>
              {result.parts.map((part, index) => (
                <li key={`${part.kind}:${index}`}>
                  <span>
                    <strong>{part.label}</strong>
                    <small>{KIND_LABELS[part.kind]} · quantity {part.quantity}</small>
                  </span>
                  <b>
                    {part.netCubicMeters.toFixed(3)} m³
                    <small>{part.sharePercent.toFixed(1)}% of net volume</small>
                  </b>
                </li>
              ))}
            </ul>
          </section>

          <CalculatorCostResult result={cost} />
          <CalculatorActions
            calculator="concrete-project-calculator"
            onCopy={onCopy}
            onSave={onSave}
          />
          <p className="calculator-notice" role="status">{notice}</p>
          <p className="result-caution">
            Quantity estimate only. This workspace does not choose structural
            dimensions, reinforcement, concrete strength, subbase, formwork,
            joints, drainage, or code requirements.
          </p>
        </>
      ) : (
        <div className="result-empty">
          <strong>Complete every active part</strong>
          <p>The project total appears after all active geometry inputs are valid.</p>
        </div>
      )}
    </aside>
  );
}
