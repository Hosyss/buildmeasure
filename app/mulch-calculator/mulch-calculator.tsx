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
  calculateMulch,
  MULCH_ENGINE_VERSION,
  MulchInputError,
  type MulchResult,
} from "@/lib/calculators/mulch";
import type { UnitSystem } from "@/lib/calculators/types";
import {
  CENTIMETERS_PER_INCH,
  formatConvertedInput,
  LITERS_PER_CUBIC_FOOT,
  METERS_PER_FOOT,
} from "@/lib/units";

type FormState = {
  length: string;
  width: string;
  depth: string;
  wastePercent: string;
  bagVolume: string;
};

const DEFAULTS: Record<UnitSystem, FormState> = {
  imperial: {
    length: "20",
    width: "10",
    depth: "3",
    wastePercent: "10",
    bagVolume: "2",
  },
  metric: {
    length: "6",
    width: "3",
    depth: "8",
    wastePercent: "10",
    bagVolume: "50",
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

function displayBagVolume(result: MulchResult, unitSystem: UnitSystem) {
  return unitSystem === "imperial"
    ? result.bagVolumeCubicFeet
    : result.bagVolumeLiters;
}

function resultSummary(result: MulchResult, unitSystem: UnitSystem) {
  return unitSystem === "imperial"
    ? `${format(result.orderCubicYards, 3)} yd³ · ${result.bags} × ${format(displayBagVolume(result, unitSystem))} ft³ bags`
    : `${format(result.orderCubicMeters, 3)} m³ · ${result.bags} × ${format(displayBagVolume(result, unitSystem))} L bags`;
}

export function MulchCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");
  const [form, setForm] = useState<FormState>(DEFAULTS.imperial);
  const [notice, setNotice] = useState("");
  const {
    history,
    saveEstimate,
    clearHistory: clearSavedHistory,
  } = useSavedEstimates("buildmeasure.mulch.history.v1");

  const calculation = useMemo(() => {
    try {
      const result = calculateMulch({
        unitSystem,
        length: Number(form.length),
        width: Number(form.width),
        depth: Number(form.depth),
        wastePercent: Number(form.wastePercent),
        bagVolume: Number(form.bagVolume),
      });

      return { result, error: null };
    } catch (error) {
      if (error instanceof MulchInputError) {
        return { result: null, error };
      }
      throw error;
    }
  }, [form, unitSystem]);
  const purchaseUnitLabel = `${calculation.result ? format(displayBagVolume(calculation.result, unitSystem)) : form.bagVolume} ${unitSystem === "imperial" ? "ft³" : "L"} bag`;
  const purchaseCost = usePurchaseCost(
    calculation.result?.bags ?? null,
    purchaseUnitLabel,
  );

  const markInteraction = useCalculatorAnalytics(
    "mulch-calculator",
    Boolean(calculation.result),
    calculation.error?.field ?? "",
  );

  function setField<Key extends keyof FormState>(
    field: Key,
    value: FormState[Key],
  ) {
    markInteraction();
    if (field === "bagVolume") purchaseCost.clearUnitPrice();
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
    const bagVolume = safeNumber(form.bagVolume);

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
      bagVolume: formatConvertedInput(
        movingToMetric
          ? bagVolume * LITERS_PER_CUBIC_FOOT
          : bagVolume / LITERS_PER_CUBIC_FOOT,
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
      "BuildMeasure mulch estimate",
      resultSummary(calculation.result, unitSystem),
      `Net volume: ${format(calculation.result.netCubicMeters, 3)} m³`,
      `Allowance: ${format(calculation.result.wastePercent)}%`,
      `Selected bag volume: ${format(calculation.result.bagVolumeLiters, 3)} L`,
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
  const bagVolumeUnit = unitSystem === "imperial" ? "ft³" : "L";
  const fieldError = calculation.error?.field;

  return (
    <div className="calculator-workspace mulch-workspace">
      <form className="calculator-panel" onSubmit={handleSubmit} noValidate>
        <div className="calculator-panel-head">
          <div>
            <p className="panel-kicker">Bed coverage &amp; bags</p>
            <h2>Enter the mulch bed</h2>
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
            <small>ft / in / ft³</small>
          </button>
          <button
            type="button"
            className={unitSystem === "metric" ? "active" : ""}
            aria-pressed={unitSystem === "metric"}
            onClick={() => changeUnitSystem("metric")}
          >
            Metric
            <small>m / cm / L</small>
          </button>
        </fieldset>

        <div className="input-grid">
          <label className={fieldError === "length" ? "field-invalid" : ""}>
            <span>Length</span>
            <span className="input-with-unit">
              <input
                id="mulch-length"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.length}
                onChange={(event) => setField("length", event.target.value)}
                aria-describedby={fieldError === "length" ? "mulch-error" : undefined}
              />
              <span>{lengthUnit}</span>
            </span>
          </label>
          <label className={fieldError === "width" ? "field-invalid" : ""}>
            <span>Width</span>
            <span className="input-with-unit">
              <input
                id="mulch-width"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.width}
                onChange={(event) => setField("width", event.target.value)}
                aria-describedby={fieldError === "width" ? "mulch-error" : undefined}
              />
              <span>{lengthUnit}</span>
            </span>
          </label>
          <label className={fieldError === "depth" ? "field-invalid" : ""}>
            <span>Installed depth</span>
            <span className="input-with-unit">
              <input
                id="mulch-depth"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.depth}
                onChange={(event) => setField("depth", event.target.value)}
                aria-describedby={fieldError === "depth" ? "mulch-error" : "mulch-depth-help"}
              />
              <span>{depthUnit}</span>
            </span>
            <small id="mulch-depth-help">
              Enter only the new layer depth when topping up existing mulch.
            </small>
          </label>
        </div>

        <div className="paint-option-grid mulch-option-grid">
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
                aria-describedby={fieldError === "wastePercent" ? "mulch-error" : "mulch-allowance-help"}
              />
              <span>%</span>
            </span>
            <small id="mulch-allowance-help">
              Add only the extra volume you want for uneven beds or handling loss.
            </small>
          </label>
          <label className={fieldError === "bagVolume" ? "field-invalid" : ""}>
            <span>Volume per bag</span>
            <span className="input-with-unit">
              <input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.bagVolume}
                onChange={(event) => setField("bagVolume", event.target.value)}
                aria-describedby={fieldError === "bagVolume" ? "mulch-error" : "mulch-bag-help"}
              />
              <span>{bagVolumeUnit}</span>
            </span>
            <small id="mulch-bag-help">
              Use the exact net volume printed on the product bag.
            </small>
          </label>
        </div>

        <CalculatorCostFields
          unitLabel={purchaseUnitLabel}
          unitPrice={purchaseCost.unitPrice}
          currencyLabel={purchaseCost.currencyLabel}
          error={purchaseCost.error}
          errorId="mulch-cost-error"
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
          <p className="calculator-error" id="mulch-error" role="alert">
            {calculation.error.message}
          </p>
        ) : null}
      </form>

      <aside className="result-panel mulch-result-panel" aria-live="polite">
        <div className="result-panel-head">
          <div>
            <p className="panel-kicker">Material estimate</p>
            <h2>Your result</h2>
          </div>
          <span className="engine-badge">Engine v{MULCH_ENGINE_VERSION}</span>
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
                <dt>Bed area</dt>
                <dd>
                  {unitSystem === "imperial"
                    ? `${format(calculation.result.areaSquareFeet)} ft²`
                    : `${format(calculation.result.areaSquareMeters)} m²`}
                </dd>
              </div>
              <div>
                <dt>Coverage per bag</dt>
                <dd>
                  {unitSystem === "imperial"
                    ? `${format(calculation.result.coveragePerBagSquareFeet)} ft²`
                    : `${format(calculation.result.coveragePerBagSquareMeters)} m²`}
                </dd>
              </div>
              <div className="bag-result">
                <dt>{format(displayBagVolume(calculation.result, unitSystem))} {bagVolumeUnit} bags</dt>
                <dd>{calculation.result.bags} bags</dd>
              </div>
            </dl>

            <CalculatorCostResult result={purchaseCost.result} />

            <p className="result-caution">
              Confirm the installed depth, bag volume, and bulk-delivery increments.
              Mulch settles and existing material can reduce the amount needed.
            </p>

            <CalculatorActions
              calculator="mulch-calculator"
              onCopy={copyResult}
              onSave={saveResult}
            />
          </>
        ) : (
          <div className="empty-result">
            <span>—</span>
            <p>Enter valid bed dimensions and a bag volume to calculate.</p>
          </div>
        )}

        <p className="calculator-notice" role="status">{notice}</p>
      </aside>

      <CalculatorHistory
        history={history}
        onClear={clearHistory}
        titleId="mulch-history-title"
      />
    </div>
  );
}
