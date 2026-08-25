"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalculatorActions } from "@/components/calculator-actions";
import { CalculatorHistory } from "@/components/calculator-history";
import { CalculatorCostFields, CalculatorCostResult } from "@/components/calculator-cost";
import { usePurchaseCost } from "@/hooks/use-purchase-cost";
import { formatPurchaseCost } from "@/lib/cost-estimate";
import { useCalculatorAnalytics } from "@/components/analytics-tracker";
import { ResetIcon } from "@/components/icons";
import { useSavedEstimates } from "@/hooks/use-saved-estimates";
import { createSavedEstimatePurchase } from "@/lib/history";
import {
  calculateGravel,
  GRAVEL_ENGINE_VERSION,
  GravelInputError,
  type GravelResult,
} from "@/lib/calculators/gravel";
import type { UnitSystem } from "@/lib/calculators/types";
import {
  CENTIMETERS_PER_INCH,
  formatConvertedInput,
  KILOGRAMS_PER_CUBIC_METER_PER_POUND_PER_CUBIC_FOOT,
  KILOGRAMS_PER_POUND,
  METERS_PER_FOOT,
} from "@/lib/units";

type FormState = {
  length: string;
  width: string;
  depth: string;
  wastePercent: string;
  bulkDensity: string;
  bagWeight: string;
};

const DEFAULTS: Record<UnitSystem, FormState> = {
  imperial: {
    length: "20",
    width: "10",
    depth: "3",
    wastePercent: "10",
    bulkDensity: "93",
    bagWeight: "50",
  },
  metric: {
    length: "6",
    width: "3",
    depth: "8",
    wastePercent: "10",
    bulkDensity: "1490",
    bagWeight: "25",
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

function displayBagWeight(result: GravelResult, unitSystem: UnitSystem) {
  return unitSystem === "imperial"
    ? result.bagWeightKilograms / KILOGRAMS_PER_POUND
    : result.bagWeightKilograms;
}

function resultSummary(result: GravelResult, unitSystem: UnitSystem) {
  return unitSystem === "imperial"
    ? `${format(result.orderCubicYards, 3)} yd³ · ${format(result.shortTons, 3)} short tons · ${result.bags} × ${format(displayBagWeight(result, unitSystem))} lb bags`
    : `${format(result.orderCubicMeters, 3)} m³ · ${format(result.metricTonnes, 3)} t · ${result.bags} × ${format(displayBagWeight(result, unitSystem))} kg bags`;
}

export function GravelCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");
  const [form, setForm] = useState<FormState>(DEFAULTS.imperial);
  const [notice, setNotice] = useState("");
  const {
    history,
    saveEstimate,
    clearHistory: clearSavedHistory,
  } = useSavedEstimates("buildmeasure.gravel.history.v1");

  const calculation = useMemo(() => {
    try {
      const result = calculateGravel({
        unitSystem,
        length: Number(form.length),
        width: Number(form.width),
        depth: Number(form.depth),
        wastePercent: Number(form.wastePercent),
        bulkDensity: Number(form.bulkDensity),
        bagWeight: Number(form.bagWeight),
      });

      return { result, error: null };
    } catch (error) {
      if (error instanceof GravelInputError) {
        return { result: null, error };
      }
      throw error;
    }
  }, [form, unitSystem]);
  const purchaseUnitLabel = `${calculation.result ? format(displayBagWeight(calculation.result, unitSystem)) : form.bagWeight} ${unitSystem === "imperial" ? "lb" : "kg"} bag`;
  const purchaseCost = usePurchaseCost(
    calculation.result?.bags ?? null,
    purchaseUnitLabel,
  );

  const markInteraction = useCalculatorAnalytics(
    "gravel-calculator",
    Boolean(calculation.result),
    calculation.error?.field ?? "",
  );

  function setField<Key extends keyof FormState>(
    field: Key,
    value: FormState[Key],
  ) {
    markInteraction();
    if (field === "bagWeight") purchaseCost.clearUnitPrice();
    setForm((current) => ({ ...current, [field]: value }));
    setNotice("");
  }

  function changeUnitSystem(next: UnitSystem) {
    if (next === unitSystem) return;
    markInteraction();

    const movingToMetric = next === "metric";
    const length = safeNumber(form.length);
    const width = safeNumber(form.width);
    const depth = safeNumber(form.depth);
    const bulkDensity = safeNumber(form.bulkDensity);
    const bagWeight = safeNumber(form.bagWeight);

    setForm((current) => ({
      ...current,
      length: formatConvertedInput(
        movingToMetric
          ? length * METERS_PER_FOOT
          : length / METERS_PER_FOOT,
      ),
      width: formatConvertedInput(
        movingToMetric
          ? width * METERS_PER_FOOT
          : width / METERS_PER_FOOT,
      ),
      depth: formatConvertedInput(
        movingToMetric
          ? depth * CENTIMETERS_PER_INCH
          : depth / CENTIMETERS_PER_INCH,
      ),
      bulkDensity: formatConvertedInput(
        movingToMetric
          ? bulkDensity *
              KILOGRAMS_PER_CUBIC_METER_PER_POUND_PER_CUBIC_FOOT
          : bulkDensity /
              KILOGRAMS_PER_CUBIC_METER_PER_POUND_PER_CUBIC_FOOT,
      ),
      bagWeight: formatConvertedInput(
        movingToMetric
          ? bagWeight * KILOGRAMS_PER_POUND
          : bagWeight / KILOGRAMS_PER_POUND,
      ),
    }));
    setUnitSystem(next);
    setNotice(
      `Inputs converted to ${movingToMetric ? "metric" : "imperial"} units.`,
    );
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
      "JobsiteQuant gravel estimate",
      resultSummary(calculation.result, unitSystem),
      `Net volume: ${format(calculation.result.netCubicMeters, 3)} m³`,
      `Allowance: ${format(calculation.result.wastePercent)}%`,
      `Selected bulk density: ${format(calculation.result.bulkDensityKilogramsPerCubicMeter)} kg/m³`,
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
      label:
        unitSystem === "imperial"
          ? `${form.length} × ${form.width} ft · ${form.depth} in deep`
          : `${form.length} × ${form.width} m · ${form.depth} cm deep`,
      summary: `${resultSummary(calculation.result, unitSystem)}${purchaseCost.result ? ` · Est. cost ${formatPurchaseCost(purchaseCost.result)}` : ""}` ,
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
  const densityUnit = unitSystem === "imperial" ? "lb/ft³" : "kg/m³";
  const weightUnit = unitSystem === "imperial" ? "lb" : "kg";
  const fieldError = calculation.error?.field;

  return (
    <div className="calculator-workspace gravel-workspace">
      <form className="calculator-panel" onSubmit={handleSubmit} noValidate>
        <div className="calculator-panel-head">
          <div>
            <p className="panel-kicker">Coverage &amp; material</p>
            <h2>Enter the gravel layer</h2>
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
            <small>ft / in / lb</small>
          </button>
          <button
            type="button"
            className={unitSystem === "metric" ? "active" : ""}
            aria-pressed={unitSystem === "metric"}
            onClick={() => changeUnitSystem("metric")}
          >
            Metric
            <small>m / cm / kg</small>
          </button>
        </fieldset>

        <div className="input-grid">
          <label className={fieldError === "length" ? "field-invalid" : ""}>
            <span>Length</span>
            <span className="input-with-unit">
              <input
                id="gravel-length"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.length}
                onChange={(event) => setField("length", event.target.value)}
                aria-describedby={fieldError === "length" ? "gravel-error" : undefined}
              />
              <span>{lengthUnit}</span>
            </span>
          </label>
          <label className={fieldError === "width" ? "field-invalid" : ""}>
            <span>Width</span>
            <span className="input-with-unit">
              <input
                id="gravel-width"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.width}
                onChange={(event) => setField("width", event.target.value)}
                aria-describedby={fieldError === "width" ? "gravel-error" : undefined}
              />
              <span>{lengthUnit}</span>
            </span>
          </label>
          <label className={fieldError === "depth" ? "field-invalid" : ""}>
            <span>Placed depth</span>
            <span className="input-with-unit">
              <input
                id="gravel-depth"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.depth}
                onChange={(event) => setField("depth", event.target.value)}
                aria-describedby={fieldError === "depth" ? "gravel-error" : undefined}
              />
              <span>{depthUnit}</span>
            </span>
          </label>
        </div>

        <div className="paint-option-grid gravel-option-grid">
          <label className={fieldError === "wastePercent" ? "field-invalid" : ""}>
            <span>Project allowance</span>
            <span className="input-with-unit">
              <input
                type="number"
                min="0"
                max="50"
                step="1"
                inputMode="decimal"
                value={form.wastePercent}
                onChange={(event) => setField("wastePercent", event.target.value)}
                aria-describedby={fieldError === "wastePercent" ? "gravel-error" : "gravel-allowance-help"}
              />
              <span>%</span>
            </span>
            <small id="gravel-allowance-help">
              Make compaction or installation loss explicit—never hidden.
            </small>
          </label>
          <label className={fieldError === "bulkDensity" ? "field-invalid" : ""}>
            <span>Bulk density</span>
            <span className="input-with-unit">
              <input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.bulkDensity}
                onChange={(event) => setField("bulkDensity", event.target.value)}
                aria-describedby={fieldError === "bulkDensity" ? "gravel-error" : "gravel-density-help"}
              />
              <span>{densityUnit}</span>
            </span>
            <small id="gravel-density-help">
              93 lb/ft³ (1,490 kg/m³) is a dry planning example. Prefer supplier data.
            </small>
          </label>
          <label className={fieldError === "bagWeight" ? "field-invalid" : ""}>
            <span>Bag weight</span>
            <span className="input-with-unit">
              <input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.bagWeight}
                onChange={(event) => setField("bagWeight", event.target.value)}
                aria-describedby={fieldError === "bagWeight" ? "gravel-error" : "gravel-bag-help"}
              />
              <span>{weightUnit}</span>
            </span>
            <small id="gravel-bag-help">
              Enter the exact packaged weight printed by the supplier.
            </small>
          </label>
        </div>

        <CalculatorCostFields
          unitLabel={purchaseUnitLabel}
          unitPrice={purchaseCost.unitPrice}
          currencyLabel={purchaseCost.currencyLabel}
          error={purchaseCost.error}
          errorId="gravel-cost-error"
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
          <p className="calculator-error" id="gravel-error" role="alert">
            {calculation.error.message}
          </p>
        ) : null}
      </form>

      <aside className="result-panel gravel-result-panel" aria-live="polite">
        <div className="result-panel-head">
          <div>
            <p className="panel-kicker">Material estimate</p>
            <h2>Your result</h2>
          </div>
          <span className="engine-badge">Engine v{GRAVEL_ENGINE_VERSION}</span>
        </div>

        {calculation.result ? (
          <>
            <div className="primary-result">
              <span>Order this volume</span>
              <strong>
                {unitSystem === "imperial"
                  ? format(calculation.result.orderCubicYards, 3)
                  : format(calculation.result.orderCubicMeters, 3)}
                <small>{unitSystem === "imperial" ? "yd³" : "m³"}</small>
              </strong>
              <p>Includes {format(calculation.result.wastePercent)}% project allowance.</p>
            </div>

            <dl className="result-breakdown">
              <div>
                <dt>Net volume</dt>
                <dd>
                  {unitSystem === "imperial"
                    ? `${format(calculation.result.netCubicYards, 3)} yd³`
                    : `${format(calculation.result.netCubicMeters, 3)} m³`}
                </dd>
              </div>
              <div>
                <dt>Estimated mass</dt>
                <dd>
                  {unitSystem === "imperial"
                    ? `${format(calculation.result.massPounds, 0)} lb`
                    : `${format(calculation.result.massKilograms, 0)} kg`}
                </dd>
              </div>
              <div>
                <dt>Bulk material</dt>
                <dd>
                  {unitSystem === "imperial"
                    ? `${format(calculation.result.shortTons, 3)} short tons`
                    : `${format(calculation.result.metricTonnes, 3)} t`}
                </dd>
              </div>
              <div className="bag-result">
                <dt>{format(displayBagWeight(calculation.result, unitSystem))} {weightUnit} bags</dt>
                <dd>{calculation.result.bags} bags</dd>
              </div>
            </dl>

            <CalculatorCostResult result={purchaseCost.result} />

            <p className="result-caution">
              Weight depends on the selected bulk density. Confirm material state,
              density, delivery increments, and bag weight with the supplier.
            </p>

            <CalculatorActions
              calculator="gravel-calculator"
              onCopy={copyResult}
              onSave={saveResult}
            />
          </>
        ) : (
          <div className="empty-result">
            <span>—</span>
            <p>Enter valid project and material values to calculate.</p>
          </div>
        )}

        <p className="calculator-notice" role="status">{notice}</p>
      </aside>

      <CalculatorHistory
        history={history}
        onClear={clearHistory}
        titleId="gravel-history-title"
      />
    </div>
  );
}
