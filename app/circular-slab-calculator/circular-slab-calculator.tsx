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
import {
  formatConvertedInput,
  METERS_PER_FOOT,
  METERS_PER_INCH,
} from "@/lib/units";
import { BAG_YIELDS_CUBIC_FEET, type BagSize } from "@/lib/calculators/concrete";
import {
  calculateCircularSlabConcrete,
  CIRCULAR_SLAB_ENGINE_VERSION,
  type CircularSlabResult,
  CircularSlabInputError,
} from "@/lib/calculators/circular-slab";
import type { UnitSystem } from "@/lib/calculators/types";

type FormState = {
  diameter: string;
  depth: string;
  quantity: string;
  wastePercent: string;
  bagSize: BagSize;
};

const DEFAULTS: Record<UnitSystem, FormState> = {
  imperial: {
    diameter: "12",
    depth: "4",
    quantity: "1",
    wastePercent: "10",
    bagSize: 80,
  },
  metric: {
    diameter: "3.6",
    depth: "10",
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

function resultSummary(result: CircularSlabResult) {
  return `${format(result.cubicYards, 3)} yd³ · ${format(result.orderCubicMeters, 3)} m³ · ${result.bags} × ${result.bagSize} lb bags`;
}

export function CircularSlabCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");
  const [form, setForm] = useState<FormState>(DEFAULTS.imperial);
  const [notice, setNotice] = useState("");
  const { history, saveEstimate, clearHistory: clearSavedHistory } =
    useSavedEstimates("buildmeasure.circular-slab.history.v1");

  const calculation = useMemo(() => {
    try {
      const result = calculateCircularSlabConcrete({
        unitSystem,
        diameter: Number(form.diameter),
        depth: Number(form.depth),
        quantity: Number(form.quantity),
        wastePercent: Number(form.wastePercent),
        bagSize: form.bagSize,
      });
      return { result, error: null };
    } catch (error) {
      if (error instanceof CircularSlabInputError) return { result: null, error };
      throw error;
    }
  }, [form, unitSystem]);

  const purchaseUnitLabel = `${form.bagSize} lb bag`;
  const purchaseCost = usePurchaseCost(calculation.result?.bags ?? null, purchaseUnitLabel);
  const markInteraction = useCalculatorAnalytics(
    "circular-slab-calculator",
    Boolean(calculation.result),
    calculation.error?.field ?? "",
  );

  function setField<Key extends keyof FormState>(field: Key, value: FormState[Key]) {
    markInteraction();
    if (field === "bagSize") purchaseCost.clearUnitPrice();
    setForm((current) => ({ ...current, [field]: value }));
    setNotice("");
  }

  function changeUnitSystem(next: UnitSystem) {
    if (next === unitSystem) return;
    markInteraction();

    const diameter = safeNumber(form.diameter);
    const depth = safeNumber(form.depth);

    setForm((current) => ({
      ...current,
      diameter:
        next === "metric"
          ? formatConvertedInput(diameter * METERS_PER_FOOT)
          : formatConvertedInput(diameter / METERS_PER_FOOT),
      depth:
        next === "metric"
          ? formatConvertedInput((depth * METERS_PER_INCH) / 0.01)
          : formatConvertedInput((depth * 0.01) / METERS_PER_INCH),
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
      "BuildNumbers circular slab concrete estimate",
      resultSummary(calculation.result),
      `Identical circular slabs: ${calculation.result.quantity}`,
      `Plan area per slab: ${unitSystem === "imperial" ? `${format(calculation.result.areaSquareFeet, 2)} ft²` : `${format(calculation.result.areaSquareMeters, 2)} m²`}`,
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
    const diameterUnit = unitSystem === "imperial" ? "ft" : "m";
    const depthUnit = unitSystem === "imperial" ? "in" : "cm";

    saveEstimate({
      label: `${form.quantity} × Ø${form.diameter} ${diameterUnit} × ${form.depth} ${depthUnit}`,
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

  const diameterUnit = unitSystem === "imperial" ? "ft" : "m";
  const depthUnit = unitSystem === "imperial" ? "in" : "cm";
  const fieldError = calculation.error?.field;

  return (
    <div className="calculator-workspace">
      <form className="calculator-panel" onSubmit={handleSubmit} noValidate>
        <div className="calculator-panel-head">
          <div>
            <p className="panel-kicker">Circular slab geometry</p>
            <h2>Enter the actual circular pour dimensions</h2>
          </div>
          <button className="icon-button" type="button" onClick={reset}>
            <ResetIcon /> Reset
          </button>
        </div>

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
          <label className={fieldError === "diameter" ? "field-invalid" : ""}>
            <span>Slab diameter</span>
            <span className="input-with-unit">
              <input type="number" min="0" step="any" inputMode="decimal" value={form.diameter} onChange={(event) => setField("diameter", event.target.value)} aria-describedby={fieldError === "diameter" ? "calculator-error" : "circular-diameter-help"} />
              <span>{diameterUnit}</span>
            </span>
            <small id="circular-diameter-help">Measure straight across the full circle through its center.</small>
          </label>
          <label className={fieldError === "depth" ? "field-invalid" : ""}>
            <span>Concrete depth</span>
            <span className="input-with-unit">
              <input type="number" min="0" step="any" inputMode="decimal" value={form.depth} onChange={(event) => setField("depth", event.target.value)} aria-describedby={fieldError === "depth" ? "calculator-error" : "circular-depth-help"} />
              <span>{depthUnit}</span>
            </span>
            <small id="circular-depth-help">Enter the actual project thickness. BuildNumbers does not select slab thickness.</small>
          </label>
          <label className={fieldError === "quantity" ? "field-invalid" : ""}>
            <span>Identical circular slabs</span>
            <span className="input-with-unit">
              <input type="number" min="1" step="1" inputMode="numeric" value={form.quantity} onChange={(event) => setField("quantity", event.target.value)} aria-describedby={fieldError === "quantity" ? "calculator-error" : undefined} />
              <span>qty</span>
            </span>
          </label>
        </div>

        <p className="field-help">Quantity only — BuildNumbers does not choose structural thickness, reinforcement, concrete strength, subbase, edge thickening, frost protection, or load capacity.</p>

        <div className="option-grid">
          <label className={fieldError === "wastePercent" ? "field-invalid" : ""}>
            <span>Extra allowance</span>
            <span className="input-with-unit">
              <input type="number" min="0" max="50" step="1" inputMode="decimal" value={form.wastePercent} onChange={(event) => setField("wastePercent", event.target.value)} aria-describedby={fieldError === "wastePercent" ? "calculator-error" : "circular-waste-help"} />
              <span>%</span>
            </span>
            <small id="circular-waste-help">Adjust for field variation, placement loss, and form tolerances.</small>
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
          errorId="circular-slab-cost-error"
          onUnitPriceChange={(value) => { markInteraction(); purchaseCost.setUnitPrice(value); setNotice(""); }}
          onCurrencyLabelChange={(value) => { markInteraction(); purchaseCost.setCurrencyLabel(value); setNotice(""); }}
        />

        {calculation.error ? <p className="calculator-error" id="calculator-error" role="alert">{calculation.error.message}</p> : null}
      </form>

      <aside className="result-panel" aria-live="polite">
        <div className="result-panel-head">
          <div><p className="panel-kicker">Concrete estimate</p><h2>Your result</h2></div>
          <span className="engine-badge">Engine v{CIRCULAR_SLAB_ENGINE_VERSION}</span>
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
              <div><dt>Plan area / slab</dt><dd>{unitSystem === "imperial" ? `${format(calculation.result.areaSquareFeet, 2)} ft²` : `${format(calculation.result.areaSquareMeters, 2)} m²`}</dd></div>
              <div><dt>Concrete / slab</dt><dd>{unitSystem === "imperial" ? `${format(calculation.result.perSlabCubicFeet, 2)} ft³` : `${format(calculation.result.perSlabCubicMeters, 3)} m³`}</dd></div>
              <div><dt>Total net concrete</dt><dd>{format(calculation.result.netCubicMeters, 3)} m³</dd></div>
              <div className="bag-result"><dt>{calculation.result.bagSize} lb bags</dt><dd>{calculation.result.bags} bags</dd></div>
            </dl>
            <CalculatorCostResult result={purchaseCost.result} />
            <p className="result-caution">Verify diameter, depth, structural requirements, concrete specification, selected product yield, and supplier order increments before construction or purchase.</p>
            <CalculatorActions calculator="circular-slab-calculator" onCopy={copyResult} onSave={saveResult} />
          </>
        ) : (
          <div className="empty-result"><span>—</span><p>Enter valid circular slab dimensions to calculate your estimate.</p></div>
        )}
        <p className="calculator-notice" role="status">{notice}</p>
      </aside>

      <CalculatorHistory history={history} onClear={clearHistory} titleId="circular-slab-history-title" />
    </div>
  );
}
