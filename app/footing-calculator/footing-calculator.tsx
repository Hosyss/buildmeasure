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
  calculateFootingConcrete,
  FOOTING_ENGINE_VERSION,
  type FootingResult,
  FootingInputError,
} from "@/lib/calculators/footing";
import type { UnitSystem } from "@/lib/calculators/types";

type FormState = {
  footingLength: string;
  footingWidth: string;
  footingDepth: string;
  quantity: string;
  wastePercent: string;
  bagSize: BagSize;
};

const DEFAULTS: Record<UnitSystem, FormState> = {
  imperial: {
    footingLength: "10",
    footingWidth: "2",
    footingDepth: "8",
    quantity: "1",
    wastePercent: "10",
    bagSize: 80,
  },
  metric: {
    footingLength: "3",
    footingWidth: "0.6",
    footingDepth: "20",
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

function resultSummary(result: FootingResult) {
  return `${format(result.cubicYards, 3)} yd³ · ${format(result.orderCubicMeters, 3)} m³ · ${result.bags} × ${result.bagSize} lb bags`;
}

export function FootingCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");
  const [form, setForm] = useState<FormState>(DEFAULTS.imperial);
  const [notice, setNotice] = useState("");
  const { history, saveEstimate, clearHistory: clearSavedHistory } =
    useSavedEstimates("buildmeasure.footing.history.v1");

  const calculation = useMemo(() => {
    try {
      const result = calculateFootingConcrete({
        unitSystem,
        footingLength: Number(form.footingLength),
        footingWidth: Number(form.footingWidth),
        footingDepth: Number(form.footingDepth),
        quantity: Number(form.quantity),
        wastePercent: Number(form.wastePercent),
        bagSize: form.bagSize,
      });
      return { result, error: null };
    } catch (error) {
      if (error instanceof FootingInputError) return { result: null, error };
      throw error;
    }
  }, [form, unitSystem]);

  const purchaseUnitLabel = `${form.bagSize} lb bag`;
  const purchaseCost = usePurchaseCost(calculation.result?.bags ?? null, purchaseUnitLabel);
  const markInteraction = useCalculatorAnalytics(
    "footing-calculator",
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

    const length = safeNumber(form.footingLength);
    const width = safeNumber(form.footingWidth);
    const depth = safeNumber(form.footingDepth);

    setForm((current) => ({
      ...current,
      footingLength:
        next === "metric"
          ? formatConvertedInput(length * METERS_PER_FOOT)
          : formatConvertedInput(length / METERS_PER_FOOT),
      footingWidth:
        next === "metric"
          ? formatConvertedInput(width * METERS_PER_FOOT)
          : formatConvertedInput(width / METERS_PER_FOOT),
      footingDepth:
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
      "BuildNumbers footing concrete estimate",
      resultSummary(calculation.result),
      `Footings: ${calculation.result.quantity}`,
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
    const lengthUnit = unitSystem === "imperial" ? "ft" : "m";
    const depthUnit = unitSystem === "imperial" ? "in" : "cm";
    saveEstimate({
      label: `${form.quantity} × ${form.footingLength} ${lengthUnit} × ${form.footingWidth} ${lengthUnit} × ${form.footingDepth} ${depthUnit}`,
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

  const lengthUnit = unitSystem === "imperial" ? "ft" : "m";
  const depthUnit = unitSystem === "imperial" ? "in" : "cm";
  const fieldError = calculation.error?.field;

  return (
    <div className="calculator-workspace">
      <form className="calculator-panel" onSubmit={handleSubmit} noValidate>
        <div className="calculator-panel-head">
          <div>
            <p className="panel-kicker">Footing geometry</p>
            <h2>Enter the formed dimensions</h2>
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
          <label className={fieldError === "footingLength" ? "field-invalid" : ""}>
            <span>Footing length</span>
            <span className="input-with-unit">
              <input type="number" min="0" step="any" inputMode="decimal" value={form.footingLength} onChange={(event) => setField("footingLength", event.target.value)} aria-describedby={fieldError === "footingLength" ? "calculator-error" : undefined} />
              <span>{lengthUnit}</span>
            </span>
          </label>
          <label className={fieldError === "footingWidth" ? "field-invalid" : ""}>
            <span>Footing width</span>
            <span className="input-with-unit">
              <input type="number" min="0" step="any" inputMode="decimal" value={form.footingWidth} onChange={(event) => setField("footingWidth", event.target.value)} aria-describedby={fieldError === "footingWidth" ? "calculator-error" : undefined} />
              <span>{lengthUnit}</span>
            </span>
          </label>
          <label className={fieldError === "footingDepth" ? "field-invalid" : ""}>
            <span>Concrete depth</span>
            <span className="input-with-unit">
              <input type="number" min="0" step="any" inputMode="decimal" value={form.footingDepth} onChange={(event) => setField("footingDepth", event.target.value)} aria-describedby={fieldError === "footingDepth" ? "calculator-error" : "footing-depth-help"} />
              <span>{depthUnit}</span>
            </span>
            <small id="footing-depth-help">Enter the actual project dimension. This tool does not choose structural footing depth.</small>
          </label>
          <label className={fieldError === "quantity" ? "field-invalid" : ""}>
            <span>Identical footings</span>
            <span className="input-with-unit">
              <input type="number" min="1" step="1" inputMode="numeric" value={form.quantity} onChange={(event) => setField("quantity", event.target.value)} aria-describedby={fieldError === "quantity" ? "calculator-error" : undefined} />
              <span>qty</span>
            </span>
          </label>
        </div>

        <div className="option-grid">
          <label className={fieldError === "wastePercent" ? "field-invalid" : ""}>
            <span>Extra allowance</span>
            <span className="input-with-unit">
              <input type="number" min="0" max="50" step="1" inputMode="decimal" value={form.wastePercent} onChange={(event) => setField("wastePercent", event.target.value)} aria-describedby={fieldError === "wastePercent" ? "calculator-error" : "footing-waste-help"} />
              <span>%</span>
            </span>
            <small id="footing-waste-help">Adjust for field variation, over-excavation, and spillage.</small>
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
          errorId="footing-cost-error"
          onUnitPriceChange={(value) => { markInteraction(); purchaseCost.setUnitPrice(value); setNotice(""); }}
          onCurrencyLabelChange={(value) => { markInteraction(); purchaseCost.setCurrencyLabel(value); setNotice(""); }}
        />

        {calculation.error ? <p className="calculator-error" id="calculator-error" role="alert">{calculation.error.message}</p> : null}
      </form>

      <aside className="result-panel" aria-live="polite">
        <div className="result-panel-head">
          <div><p className="panel-kicker">Concrete estimate</p><h2>Your result</h2></div>
          <span className="engine-badge">Engine v{FOOTING_ENGINE_VERSION}</span>
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
              <div><dt>Per footing</dt><dd>{unitSystem === "imperial" ? `${format(calculation.result.perFootingCubicFeet, 3)} ft³` : `${format(calculation.result.perFootingCubicMeters * 1000, 1)} L`}</dd></div>
              <div><dt>Total net concrete</dt><dd>{format(calculation.result.netCubicMeters, 3)} m³</dd></div>
              <div><dt>Cubic feet</dt><dd>{format(calculation.result.cubicFeet, 2)} ft³</dd></div>
              <div className="bag-result"><dt>{calculation.result.bagSize} lb bags</dt><dd>{calculation.result.bags} bags</dd></div>
            </dl>
            <CalculatorCostResult result={purchaseCost.result} />
            <p className="result-caution">Quantity only. Verify footing dimensions, reinforcement, local requirements, product yield, and supplier order increments before construction or purchase.</p>
            <CalculatorActions calculator="footing-calculator" onCopy={copyResult} onSave={saveResult} />
          </>
        ) : (
          <div className="empty-result"><span>—</span><p>Enter valid footing dimensions to calculate your estimate.</p></div>
        )}
        <p className="calculator-notice" role="status">{notice}</p>
      </aside>

      <CalculatorHistory history={history} onClear={clearHistory} titleId="footing-history-title" />
    </div>
  );
}
