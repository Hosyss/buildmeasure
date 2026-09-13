"use client";

import { FormEvent, useMemo, useState } from "react";
import { ResetIcon } from "@/components/icons";
import { CalculatorActions } from "@/components/calculator-actions";
import { CalculatorHistory } from "@/components/calculator-history";
import { CalculatorCostFields, CalculatorCostResult } from "@/components/calculator-cost";
import { useCalculatorAnalytics } from "@/components/analytics-tracker";
import { usePurchaseCost } from "@/hooks/use-purchase-cost";
import { useSavedEstimates } from "@/hooks/use-saved-estimates";
import { formatPurchaseCost } from "@/lib/cost-estimate";
import { createSavedEstimatePurchase } from "@/lib/history";
import { formatConvertedInput, METERS_PER_FOOT, METERS_PER_INCH } from "@/lib/units";
import { BAG_YIELDS_CUBIC_FEET, type BagSize } from "@/lib/calculators/concrete";
import {
  calculateColumnConcrete,
  COLUMN_ENGINE_VERSION,
  type ColumnResult,
  type ColumnShape,
  ColumnInputError,
} from "@/lib/calculators/column";
import type { UnitSystem } from "@/lib/calculators/types";

type FormState = {
  shape: ColumnShape;
  height: string;
  width: string;
  depth: string;
  diameter: string;
  quantity: string;
  wastePercent: string;
  bagSize: BagSize;
};

const DEFAULTS: Record<UnitSystem, FormState> = {
  imperial: {
    shape: "rectangular",
    height: "10",
    width: "12",
    depth: "12",
    diameter: "18",
    quantity: "1",
    wastePercent: "10",
    bagSize: 80,
  },
  metric: {
    shape: "rectangular",
    height: "3",
    width: "30",
    depth: "30",
    diameter: "45",
    quantity: "1",
    wastePercent: "10",
    bagSize: 80,
  },
};

function format(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);
}

function safeNumber(value: string) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function resultSummary(result: ColumnResult) {
  return `${format(result.cubicYards, 3)} yd³ · ${format(result.orderCubicMeters, 3)} m³ · ${result.bags} × ${result.bagSize} lb bags`;
}

export function ColumnCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");
  const [form, setForm] = useState<FormState>(DEFAULTS.imperial);
  const [notice, setNotice] = useState("");
  const { history, saveEstimate, clearHistory: clearSavedHistory } =
    useSavedEstimates("buildmeasure.column.history.v1");

  const calculation = useMemo(() => {
    try {
      const result = calculateColumnConcrete({
        unitSystem,
        shape: form.shape,
        height: Number(form.height),
        width: Number(form.width),
        depth: Number(form.depth),
        diameter: Number(form.diameter),
        quantity: Number(form.quantity),
        wastePercent: Number(form.wastePercent),
        bagSize: form.bagSize,
      });
      return { result, error: null };
    } catch (error) {
      if (error instanceof ColumnInputError) return { result: null, error };
      throw error;
    }
  }, [form, unitSystem]);

  const purchaseUnitLabel = `${form.bagSize} lb bag`;
  const purchaseCost = usePurchaseCost(calculation.result?.bags ?? null, purchaseUnitLabel);
  const markInteraction = useCalculatorAnalytics(
    "column-calculator",
    Boolean(calculation.result),
    calculation.error?.field ?? "",
  );

  function setField<Key extends keyof FormState>(field: Key, value: FormState[Key]) {
    markInteraction();
    if (field === "bagSize") purchaseCost.clearUnitPrice();
    setForm((current) => ({ ...current, [field]: value }));
    setNotice("");
  }

  function changeShape(shape: ColumnShape) {
    if (shape === form.shape) return;
    markInteraction();
    setForm((current) => ({ ...current, shape }));
    setNotice(`Using ${shape === "rectangular" ? "rectangular / square" : "circular"} column geometry.`);
  }

  function changeUnitSystem(next: UnitSystem) {
    if (next === unitSystem) return;
    markInteraction();

    const height = safeNumber(form.height);
    const width = safeNumber(form.width);
    const depth = safeNumber(form.depth);
    const diameter = safeNumber(form.diameter);

    setForm((current) => ({
      ...current,
      height:
        next === "metric"
          ? formatConvertedInput(height * METERS_PER_FOOT)
          : formatConvertedInput(height / METERS_PER_FOOT),
      width:
        next === "metric"
          ? formatConvertedInput((width * METERS_PER_INCH) / 0.01)
          : formatConvertedInput((width * 0.01) / METERS_PER_INCH),
      depth:
        next === "metric"
          ? formatConvertedInput((depth * METERS_PER_INCH) / 0.01)
          : formatConvertedInput((depth * 0.01) / METERS_PER_INCH),
      diameter:
        next === "metric"
          ? formatConvertedInput((diameter * METERS_PER_INCH) / 0.01)
          : formatConvertedInput((diameter * 0.01) / METERS_PER_INCH),
    }));
    setUnitSystem(next);
    setNotice(`Inputs converted to ${next === "metric" ? "metric" : "imperial"} units.`);
  }

  function reset() {
    markInteraction();
    purchaseCost.resetCost();
    setForm(DEFAULTS[unitSystem]);
    setNotice("Calculator reset to example values.");
  }

  async function copyResult() {
    if (!calculation.result) return;
    const costLine = purchaseCost.result
      ? `Estimated material cost: ${formatPurchaseCost(purchaseCost.result)}`
      : null;
    const text = [
      "BuildNumbers column concrete estimate",
      resultSummary(calculation.result),
      `Shape: ${calculation.result.shape}`,
      `Columns: ${calculation.result.quantity}`,
      `Net concrete: ${format(calculation.result.netCubicMeters, 3)} m³`,
      `Extra allowance: ${format(calculation.result.wastePercent)}%`,
      ...(costLine ? [costLine] : []),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setNotice("Estimate copied.");
    } catch {
      setNotice("Copy is unavailable in this browser.");
    }
  }

  function saveResult() {
    if (!calculation.result) return;
    const heightUnit = unitSystem === "imperial" ? "ft" : "m";
    const sectionUnit = unitSystem === "imperial" ? "in" : "cm";
    const geometry = form.shape === "rectangular"
      ? `${form.width} × ${form.depth} ${sectionUnit}`
      : `Ø ${form.diameter} ${sectionUnit}`;

    saveEstimate({
      label: `${form.quantity} × ${geometry} × ${form.height} ${heightUnit}`,
      summary: `${resultSummary(calculation.result)}${purchaseCost.result ? ` · Est. cost ${formatPurchaseCost(purchaseCost.result)}` : ""}`,
      purchase: createSavedEstimatePurchase(
        calculation.result.bags,
        purchaseUnitLabel,
        purchaseCost.result,
      ),
    });
    setNotice("Estimate saved on this device.");
  }

  function clearHistory() {
    clearSavedHistory();
    setNotice("Saved estimates cleared.");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  const heightUnit = unitSystem === "imperial" ? "ft" : "m";
  const sectionUnit = unitSystem === "imperial" ? "in" : "cm";
  const fieldError = calculation.error?.field;

  return (
    <div className="calculator-workspace">
      <form className="calculator-panel" onSubmit={handleSubmit} noValidate>
        <div className="calculator-panel-head">
          <div>
            <p className="panel-kicker">Column geometry</p>
            <h2>Enter the actual column dimensions</h2>
          </div>
          <button className="icon-button" type="button" onClick={reset}>
            <ResetIcon /> Reset
          </button>
        </div>

        <fieldset className="unit-toggle">
          <legend>Column cross-section</legend>
          <button
            type="button"
            className={form.shape === "rectangular" ? "active" : ""}
            aria-pressed={form.shape === "rectangular"}
            onClick={() => changeShape("rectangular")}
          >
            Rectangular<small>square / rectangle</small>
          </button>
          <button
            type="button"
            className={form.shape === "circular" ? "active" : ""}
            aria-pressed={form.shape === "circular"}
            onClick={() => changeShape("circular")}
          >
            Circular<small>diameter</small>
          </button>
        </fieldset>

        <fieldset className="unit-toggle">
          <legend>Measurement system</legend>
          <button
            type="button"
            className={unitSystem === "imperial" ? "active" : ""}
            aria-pressed={unitSystem === "imperial"}
            onClick={() => changeUnitSystem("imperial")}
          >
            Imperial<small>ft / in</small>
          </button>
          <button
            type="button"
            className={unitSystem === "metric" ? "active" : ""}
            aria-pressed={unitSystem === "metric"}
            onClick={() => changeUnitSystem("metric")}
          >
            Metric<small>m / cm</small>
          </button>
        </fieldset>

        <div className="input-grid">
          <label className={fieldError === "height" ? "field-invalid" : ""}>
            <span>Column height</span>
            <span className="input-with-unit">
              <input type="number" min="0" step="any" inputMode="decimal" value={form.height} onChange={(event) => setField("height", event.target.value)} aria-describedby={fieldError === "height" ? "calculator-error" : "column-height-help"} />
              <span>{heightUnit}</span>
            </span>
            <small id="column-height-help">Use the actual concrete height from the project design.</small>
          </label>

          {form.shape === "rectangular" ? (
            <>
              <label className={fieldError === "width" ? "field-invalid" : ""}>
                <span>Column width</span>
                <span className="input-with-unit">
                  <input type="number" min="0" step="any" inputMode="decimal" value={form.width} onChange={(event) => setField("width", event.target.value)} aria-describedby={fieldError === "width" ? "calculator-error" : undefined} />
                  <span>{sectionUnit}</span>
                </span>
              </label>
              <label className={fieldError === "depth" ? "field-invalid" : ""}>
                <span>Column depth</span>
                <span className="input-with-unit">
                  <input type="number" min="0" step="any" inputMode="decimal" value={form.depth} onChange={(event) => setField("depth", event.target.value)} aria-describedby={fieldError === "depth" ? "calculator-error" : undefined} />
                  <span>{sectionUnit}</span>
                </span>
              </label>
            </>
          ) : (
            <label className={fieldError === "diameter" ? "field-invalid" : ""}>
              <span>Column diameter</span>
              <span className="input-with-unit">
                <input type="number" min="0" step="any" inputMode="decimal" value={form.diameter} onChange={(event) => setField("diameter", event.target.value)} aria-describedby={fieldError === "diameter" ? "calculator-error" : undefined} />
                <span>{sectionUnit}</span>
              </span>
            </label>
          )}

          <label className={fieldError === "quantity" ? "field-invalid" : ""}>
            <span>Identical columns</span>
            <span className="input-with-unit">
              <input type="number" min="1" step="1" inputMode="numeric" value={form.quantity} onChange={(event) => setField("quantity", event.target.value)} aria-describedby={fieldError === "quantity" ? "calculator-error" : undefined} />
              <span>qty</span>
            </span>
          </label>
        </div>

        <p className="field-help">Quantity only — BuildNumbers does not choose structural column dimensions, reinforcement, concrete strength, or load capacity.</p>

        <div className="option-grid">
          <label className={fieldError === "wastePercent" ? "field-invalid" : ""}>
            <span>Extra allowance</span>
            <span className="input-with-unit">
              <input type="number" min="0" max="50" step="1" inputMode="decimal" value={form.wastePercent} onChange={(event) => setField("wastePercent", event.target.value)} aria-describedby={fieldError === "wastePercent" ? "calculator-error" : "column-waste-help"} />
              <span>%</span>
            </span>
            <small id="column-waste-help">Adjust for placement loss, form tolerances, and field variation.</small>
          </label>
          <label>
            <span>Bag size</span>
            <select value={form.bagSize} onChange={(event) => setField("bagSize", Number(event.target.value) as BagSize)}>
              {Object.entries(BAG_YIELDS_CUBIC_FEET).map(([size, yieldAmount]) => (
                <option value={size} key={size}>{size} lb — {yieldAmount} ft³ yield</option>
              ))}
            </select>
            <small>Approximate manufacturer-published yields; verify your product.</small>
          </label>
        </div>

        <CalculatorCostFields
          unitLabel={purchaseUnitLabel}
          unitPrice={purchaseCost.unitPrice}
          currencyLabel={purchaseCost.currencyLabel}
          error={purchaseCost.error}
          errorId="column-cost-error"
          onUnitPriceChange={(value) => { markInteraction(); purchaseCost.setUnitPrice(value); setNotice(""); }}
          onCurrencyLabelChange={(value) => { markInteraction(); purchaseCost.setCurrencyLabel(value); setNotice(""); }}
        />

        {calculation.error ? <p className="calculator-error" id="calculator-error" role="alert">{calculation.error.message}</p> : null}
      </form>

      <aside className="result-panel" aria-live="polite">
        <div className="result-panel-head">
          <div><p className="panel-kicker">Concrete estimate</p><h2>Your result</h2></div>
          <span className="engine-badge">Engine v{COLUMN_ENGINE_VERSION}</span>
        </div>

        {calculation.result ? (
          <>
            <div className="primary-result">
              <span>Order this volume</span>
              <strong>
                {unitSystem === "imperial" ? format(calculation.result.cubicYards, 3) : format(calculation.result.orderCubicMeters, 3)}
                <small>{unitSystem === "imperial" ? "yd³" : "m³"}</small>
              </strong>
              <p>Includes {format(calculation.result.wastePercent)}% extra allowance.</p>
            </div>
            <dl className="result-breakdown">
              <div><dt>Per column</dt><dd>{unitSystem === "imperial" ? `${format(calculation.result.perColumnCubicFeet, 3)} ft³` : `${format(calculation.result.perColumnCubicMeters * 1000, 1)} L`}</dd></div>
              <div><dt>Total net concrete</dt><dd>{format(calculation.result.netCubicMeters, 3)} m³</dd></div>
              <div><dt>Cubic feet</dt><dd>{format(calculation.result.cubicFeet, 2)} ft³</dd></div>
              <div className="bag-result"><dt>{calculation.result.bagSize} lb bags</dt><dd>{calculation.result.bags} bags</dd></div>
            </dl>
            <CalculatorCostResult result={purchaseCost.result} />
            <p className="result-caution">Quantity only. Verify structural dimensions, reinforcement, concrete strength, project requirements, product yield, and supplier order increments before construction or purchase.</p>
            <CalculatorActions calculator="column-calculator" onCopy={copyResult} onSave={saveResult} />
          </>
        ) : (
          <div className="empty-result"><span>—</span><p>Enter valid column dimensions to calculate your estimate.</p></div>
        )}
        <p className="calculator-notice" role="status">{notice}</p>
      </aside>

      <CalculatorHistory history={history} onClear={clearHistory} titleId="column-history-title" />
    </div>
  );
}
