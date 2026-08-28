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
  calculateWallConcrete,
  WALL_ENGINE_VERSION,
  type WallResult,
  WallInputError,
} from "@/lib/calculators/wall";
import type { UnitSystem } from "@/lib/calculators/types";

type FormState = {
  length: string;
  height: string;
  thickness: string;
  openingsArea: string;
  quantity: string;
  wastePercent: string;
  bagSize: BagSize;
};

const DEFAULTS: Record<UnitSystem, FormState> = {
  imperial: {
    length: "10",
    height: "8",
    thickness: "6",
    openingsArea: "16",
    quantity: "1",
    wastePercent: "10",
    bagSize: 80,
  },
  metric: {
    length: "3",
    height: "2.4",
    thickness: "15",
    openingsArea: "1.5",
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

function resultSummary(result: WallResult) {
  return `${format(result.cubicYards, 3)} yd³ · ${format(result.orderCubicMeters, 3)} m³ · ${result.bags} × ${result.bagSize} lb bags`;
}

export function WallCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");
  const [form, setForm] = useState<FormState>(DEFAULTS.imperial);
  const [notice, setNotice] = useState("");
  const { history, saveEstimate, clearHistory: clearSavedHistory } =
    useSavedEstimates("buildmeasure.wall.history.v1");

  const calculation = useMemo(() => {
    try {
      const result = calculateWallConcrete({
        unitSystem,
        length: Number(form.length),
        height: Number(form.height),
        thickness: Number(form.thickness),
        openingsArea: Number(form.openingsArea),
        quantity: Number(form.quantity),
        wastePercent: Number(form.wastePercent),
        bagSize: form.bagSize,
      });
      return { result, error: null };
    } catch (error) {
      if (error instanceof WallInputError) return { result: null, error };
      throw error;
    }
  }, [form, unitSystem]);

  const purchaseUnitLabel = `${form.bagSize} lb bag`;
  const purchaseCost = usePurchaseCost(calculation.result?.bags ?? null, purchaseUnitLabel);
  const markInteraction = useCalculatorAnalytics(
    "wall-calculator",
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

    const length = safeNumber(form.length);
    const height = safeNumber(form.height);
    const thickness = safeNumber(form.thickness);
    const openingsArea = safeNumber(form.openingsArea);

    setForm((current) => ({
      ...current,
      length:
        next === "metric"
          ? formatConvertedInput(length * METERS_PER_FOOT)
          : formatConvertedInput(length / METERS_PER_FOOT),
      height:
        next === "metric"
          ? formatConvertedInput(height * METERS_PER_FOOT)
          : formatConvertedInput(height / METERS_PER_FOOT),
      thickness:
        next === "metric"
          ? formatConvertedInput((thickness * METERS_PER_INCH) / 0.01)
          : formatConvertedInput((thickness * 0.01) / METERS_PER_INCH),
      openingsArea:
        next === "metric"
          ? formatConvertedInput(openingsArea * METERS_PER_FOOT ** 2)
          : formatConvertedInput(openingsArea / METERS_PER_FOOT ** 2),
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
      "BuildNumbers concrete wall estimate",
      resultSummary(calculation.result),
      `Identical walls: ${calculation.result.quantity}`,
      `Net face area per wall: ${unitSystem === "imperial" ? `${format(calculation.result.netFaceAreaSquareFeetPerWall, 2)} ft²` : `${format(calculation.result.netFaceAreaSquareMetersPerWall, 2)} m²`}`,
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
    const thicknessUnit = unitSystem === "imperial" ? "in" : "cm";
    const areaUnit = unitSystem === "imperial" ? "ft²" : "m²";

    saveEstimate({
      label: `${form.quantity} × ${form.length} × ${form.height} ${lengthUnit} × ${form.thickness} ${thicknessUnit}; openings ${form.openingsArea} ${areaUnit}`,
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
  const thicknessUnit = unitSystem === "imperial" ? "in" : "cm";
  const areaUnit = unitSystem === "imperial" ? "ft²" : "m²";
  const fieldError = calculation.error?.field;

  return (
    <div className="calculator-workspace">
      <form className="calculator-panel" onSubmit={handleSubmit} noValidate>
        <div className="calculator-panel-head">
          <div>
            <p className="panel-kicker">Wall geometry</p>
            <h2>Enter the actual concrete wall dimensions</h2>
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
            Imperial<small>ft / in / ft²</small>
          </button>
          <button
            type="button"
            className={unitSystem === "metric" ? "active" : ""}
            aria-pressed={unitSystem === "metric"}
            onClick={() => changeUnitSystem("metric")}
          >
            Metric<small>m / cm / m²</small>
          </button>
        </fieldset>

        <div className="input-grid">
          <label className={fieldError === "length" ? "field-invalid" : ""}>
            <span>Wall length</span>
            <span className="input-with-unit">
              <input type="number" min="0" step="any" inputMode="decimal" value={form.length} onChange={(event) => setField("length", event.target.value)} aria-describedby={fieldError === "length" ? "calculator-error" : undefined} />
              <span>{lengthUnit}</span>
            </span>
          </label>
          <label className={fieldError === "height" ? "field-invalid" : ""}>
            <span>Wall height</span>
            <span className="input-with-unit">
              <input type="number" min="0" step="any" inputMode="decimal" value={form.height} onChange={(event) => setField("height", event.target.value)} aria-describedby={fieldError === "height" ? "calculator-error" : undefined} />
              <span>{lengthUnit}</span>
            </span>
          </label>
          <label className={fieldError === "thickness" ? "field-invalid" : ""}>
            <span>Wall thickness</span>
            <span className="input-with-unit">
              <input type="number" min="0" step="any" inputMode="decimal" value={form.thickness} onChange={(event) => setField("thickness", event.target.value)} aria-describedby={fieldError === "thickness" ? "calculator-error" : undefined} />
              <span>{thicknessUnit}</span>
            </span>
          </label>
          <label className={fieldError === "openingsArea" ? "field-invalid" : ""}>
            <span>Openings per wall</span>
            <span className="input-with-unit">
              <input type="number" min="0" step="any" inputMode="decimal" value={form.openingsArea} onChange={(event) => setField("openingsArea", event.target.value)} aria-describedby={fieldError === "openingsArea" ? "calculator-error" : "wall-openings-help"} />
              <span>{areaUnit}</span>
            </span>
            <small id="wall-openings-help">Enter the total measured face area of doors, windows, or other full-depth openings in each identical wall.</small>
          </label>
          <label className={fieldError === "quantity" ? "field-invalid" : ""}>
            <span>Identical walls</span>
            <span className="input-with-unit">
              <input type="number" min="1" step="1" inputMode="numeric" value={form.quantity} onChange={(event) => setField("quantity", event.target.value)} aria-describedby={fieldError === "quantity" ? "calculator-error" : undefined} />
              <span>qty</span>
            </span>
          </label>
        </div>

        <p className="field-help">Quantity only — BuildNumbers does not choose structural wall thickness, reinforcement, footing/foundation size, concrete strength, or retaining-wall design.</p>

        <div className="option-grid">
          <label className={fieldError === "wastePercent" ? "field-invalid" : ""}>
            <span>Extra allowance</span>
            <span className="input-with-unit">
              <input type="number" min="0" max="50" step="1" inputMode="decimal" value={form.wastePercent} onChange={(event) => setField("wastePercent", event.target.value)} aria-describedby={fieldError === "wastePercent" ? "calculator-error" : "wall-waste-help"} />
              <span>%</span>
            </span>
            <small id="wall-waste-help">Adjust for placement loss, form tolerances, and field variation.</small>
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
          errorId="wall-cost-error"
          onUnitPriceChange={(value) => { markInteraction(); purchaseCost.setUnitPrice(value); setNotice(""); }}
          onCurrencyLabelChange={(value) => { markInteraction(); purchaseCost.setCurrencyLabel(value); setNotice(""); }}
        />

        {calculation.error ? <p className="calculator-error" id="calculator-error" role="alert">{calculation.error.message}</p> : null}
      </form>

      <aside className="result-panel" aria-live="polite">
        <div className="result-panel-head">
          <div><p className="panel-kicker">Concrete estimate</p><h2>Your result</h2></div>
          <span className="engine-badge">Engine v{WALL_ENGINE_VERSION}</span>
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
              <div><dt>Net face area / wall</dt><dd>{unitSystem === "imperial" ? `${format(calculation.result.netFaceAreaSquareFeetPerWall, 2)} ft²` : `${format(calculation.result.netFaceAreaSquareMetersPerWall, 2)} m²`}</dd></div>
              <div><dt>Concrete / wall</dt><dd>{unitSystem === "imperial" ? `${format(calculation.result.perWallCubicFeet, 2)} ft³` : `${format(calculation.result.perWallCubicMeters, 3)} m³`}</dd></div>
              <div><dt>Total net concrete</dt><dd>{format(calculation.result.netCubicMeters, 3)} m³</dd></div>
              <div className="bag-result"><dt>{calculation.result.bagSize} lb bags</dt><dd>{calculation.result.bags} bags</dd></div>
            </dl>
            <CalculatorCostResult result={purchaseCost.result} />
            <p className="result-caution">Verify wall geometry, full-depth opening area, structural design, concrete specification, selected product yield, and supplier order increments before construction or purchase.</p>
            <CalculatorActions calculator="wall-calculator" onCopy={copyResult} onSave={saveResult} />
          </>
        ) : (
          <div className="empty-result"><span>—</span><p>Enter valid wall dimensions to calculate your estimate.</p></div>
        )}
        <p className="calculator-notice" role="status">{notice}</p>
      </aside>

      <CalculatorHistory history={history} onClear={clearHistory} titleId="wall-history-title" />
    </div>
  );
}
