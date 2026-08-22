"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  BAG_YIELDS_CUBIC_FEET,
  BagSize,
  calculateConcrete,
  CONCRETE_ENGINE_VERSION,
  ConcreteInputError,
  ConcreteResult,
  METERS_PER_FOOT,
  METERS_PER_INCH,
  UnitSystem,
} from "@/lib/calculators/concrete";
import { ResetIcon } from "@/components/icons";
import { CalculatorActions } from "@/components/calculator-actions";
import { CalculatorHistory } from "@/components/calculator-history";
import { CalculatorCostFields, CalculatorCostResult } from "@/components/calculator-cost";
import { usePurchaseCost } from "@/hooks/use-purchase-cost";
import { formatPurchaseCost } from "@/lib/cost-estimate";
import { useCalculatorAnalytics } from "@/components/analytics-tracker";
import { useSavedEstimates } from "@/hooks/use-saved-estimates";
import { createSavedEstimatePurchase } from "@/lib/history";
import { formatConvertedInput } from "@/lib/units";

type FormState = {
  length: string;
  width: string;
  depth: string;
  wastePercent: string;
  bagSize: BagSize;
};

const DEFAULTS: Record<UnitSystem, FormState> = {
  imperial: {
    length: "20",
    width: "12",
    depth: "4",
    wastePercent: "10",
    bagSize: 80,
  },
  metric: {
    length: "6",
    width: "3.5",
    depth: "10",
    wastePercent: "10",
    bagSize: 80,
  },
};

function format(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}

function safeNumber(value: string) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function resultSummary(result: ConcreteResult) {
  return `${format(result.cubicYards)} yd³ · ${format(result.orderCubicMeters)} m³ · ${result.bags} × ${result.bagSize} lb bags`;
}

export function ConcreteCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");
  const [form, setForm] = useState<FormState>(DEFAULTS.imperial);
  const [notice, setNotice] = useState("");
  const {
    history,
    saveEstimate,
    clearHistory: clearSavedHistory,
  } = useSavedEstimates("buildmeasure.concrete.history.v1");

  const calculation = useMemo(() => {
    try {
      const result = calculateConcrete({
        unitSystem,
        length: Number(form.length),
        width: Number(form.width),
        depth: Number(form.depth),
        wastePercent: Number(form.wastePercent),
        bagSize: form.bagSize,
      });

      return { result, error: null };
    } catch (error) {
      if (error instanceof ConcreteInputError) {
        return { result: null, error };
      }
      throw error;
    }
  }, [form, unitSystem]);
  const purchaseUnitLabel = `${form.bagSize} lb bag`;
  const purchaseCost = usePurchaseCost(
    calculation.result?.bags ?? null,
    purchaseUnitLabel,
  );

  const markInteraction = useCalculatorAnalytics(
    "concrete-calculator",
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
    const width = safeNumber(form.width);
    const depth = safeNumber(form.depth);

    setForm((current) => ({
      ...current,
      length:
        next === "metric"
          ? formatConvertedInput(length * METERS_PER_FOOT)
          : formatConvertedInput(length / METERS_PER_FOOT),
      width:
        next === "metric"
          ? formatConvertedInput(width * METERS_PER_FOOT)
          : formatConvertedInput(width / METERS_PER_FOOT),
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
      "BuildMeasure concrete estimate",
      resultSummary(calculation.result),
      `Net volume: ${format(calculation.result.netCubicMeters)} m³`,
      `Waste allowance: ${format(calculation.result.wastePercent)}%`,
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

    saveEstimate({
      label: `${form.length} × ${form.width} × ${form.depth} ${
        unitSystem === "imperial" ? "ft / in" : "m / cm"
      }`,
      summary: `${resultSummary(calculation.result)}${purchaseCost.result ? ` · Est. cost ${formatPurchaseCost(purchaseCost.result)}` : ""}` ,
      purchase: createSavedEstimatePurchase(
        calculation.result?.bags ?? null,
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
            <p className="panel-kicker">Slab dimensions</p>
            <h2>Enter your measurements</h2>
          </div>
          <button className="icon-button" type="button" onClick={reset}>
            <ResetIcon />
            Reset
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
            Imperial
            <small>ft / in</small>
          </button>
          <button
            type="button"
            className={unitSystem === "metric" ? "active" : ""}
            aria-pressed={unitSystem === "metric"}
            onClick={() => changeUnitSystem("metric")}
          >
            Metric
            <small>m / cm</small>
          </button>
        </fieldset>

        <div className="input-grid">
          <label className={fieldError === "length" ? "field-invalid" : ""}>
            <span>Length</span>
            <span className="input-with-unit">
              <input
                id="concrete-length"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.length}
                onChange={(event) => setField("length", event.target.value)}
                aria-describedby={fieldError === "length" ? "calculator-error" : undefined}
              />
              <span>{lengthUnit}</span>
            </span>
          </label>
          <label className={fieldError === "width" ? "field-invalid" : ""}>
            <span>Width</span>
            <span className="input-with-unit">
              <input
                id="concrete-width"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.width}
                onChange={(event) => setField("width", event.target.value)}
                aria-describedby={fieldError === "width" ? "calculator-error" : undefined}
              />
              <span>{lengthUnit}</span>
            </span>
          </label>
          <label className={fieldError === "depth" ? "field-invalid" : ""}>
            <span>Thickness</span>
            <span className="input-with-unit">
              <input
                id="concrete-depth"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.depth}
                onChange={(event) => setField("depth", event.target.value)}
                aria-describedby={fieldError === "depth" ? "calculator-error" : undefined}
              />
              <span>{depthUnit}</span>
            </span>
          </label>
        </div>

        <div className="option-grid">
          <label className={fieldError === "wastePercent" ? "field-invalid" : ""}>
            <span>Waste allowance</span>
            <span className="input-with-unit">
              <input
                type="number"
                min="0"
                max="50"
                step="1"
                inputMode="decimal"
                value={form.wastePercent}
                onChange={(event) => setField("wastePercent", event.target.value)}
                aria-describedby={fieldError === "wastePercent" ? "calculator-error" : "waste-help"}
              />
              <span>%</span>
            </span>
            <small id="waste-help">Adjust for spillage, uneven subgrade, and over-excavation.</small>
          </label>
          <label>
            <span>Bag size</span>
            <select
              value={form.bagSize}
              onChange={(event) => setField("bagSize", Number(event.target.value) as BagSize)}
            >
              {Object.entries(BAG_YIELDS_CUBIC_FEET).map(([size, yieldAmount]) => (
                <option value={size} key={size}>
                  {size} lb — {yieldAmount} ft³ yield
                </option>
              ))}
            </select>
            <small>Approximate manufacturer-published yields.</small>
          </label>
        </div>

        <CalculatorCostFields
          unitLabel={purchaseUnitLabel}
          unitPrice={purchaseCost.unitPrice}
          currencyLabel={purchaseCost.currencyLabel}
          error={purchaseCost.error}
          errorId="concrete-cost-error"
          onUnitPriceChange={(value) => {
            markInteraction();
            purchaseCost.setUnitPrice(value);
            setNotice("");
          }}
          onCurrencyLabelChange={(value) => {
            markInteraction();
            purchaseCost.setCurrencyLabel(value);
            setNotice("");
          }}
        />

        {calculation.error ? (
          <p className="calculator-error" id="calculator-error" role="alert">
            {calculation.error.message}
          </p>
        ) : null}
      </form>

      <aside className="result-panel" aria-live="polite">
        <div className="result-panel-head">
          <div>
            <p className="panel-kicker">Material estimate</p>
            <h2>Your result</h2>
          </div>
          <span className="engine-badge">
            Engine v{CONCRETE_ENGINE_VERSION}
          </span>
        </div>

        {calculation.result ? (
          <>
            <div className="primary-result">
              <span>Order this volume</span>
              <strong>
                {unitSystem === "imperial"
                  ? format(calculation.result.cubicYards)
                  : format(calculation.result.orderCubicMeters)}
                <small>{unitSystem === "imperial" ? "yd³" : "m³"}</small>
              </strong>
              <p>Includes {format(calculation.result.wastePercent)}% waste allowance.</p>
            </div>

            <dl className="result-breakdown">
              <div>
                <dt>Net volume</dt>
                <dd>{format(calculation.result.netCubicMeters)} m³</dd>
              </div>
              <div>
                <dt>Cubic feet</dt>
                <dd>{format(calculation.result.cubicFeet)} ft³</dd>
              </div>
              <div>
                <dt>Liters</dt>
                <dd>{format(calculation.result.liters, 0)} L</dd>
              </div>
              <div className="bag-result">
                <dt>{calculation.result.bagSize} lb bags</dt>
                <dd>{calculation.result.bags} bags</dd>
              </div>
            </dl>

            <CalculatorCostResult result={purchaseCost.result} />

            <p className="result-caution">
              Bag yields are approximate. Confirm the selected product yield and
              ready-mix order increment with your supplier.
            </p>

            <CalculatorActions
              calculator="concrete-calculator"
              onCopy={copyResult}
              onSave={saveResult}
            />
          </>
        ) : (
          <div className="empty-result">
            <span>—</span>
            <p>Enter valid dimensions to calculate your estimate.</p>
          </div>
        )}

        <p className="calculator-notice" role="status">{notice}</p>
      </aside>

      <CalculatorHistory
        history={history}
        onClear={clearHistory}
        titleId="concrete-history-title"
      />
    </div>
  );
}
