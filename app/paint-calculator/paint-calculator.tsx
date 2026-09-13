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
  calculatePaint,
  DEFAULT_COVERAGE_SQ_FT_PER_GALLON,
  PAINT_ENGINE_VERSION,
  PaintInputError,
  PaintResult,
} from "@/lib/calculators/paint";
import type { UnitSystem } from "@/lib/calculators/types";
import {
  formatConvertedInput,
  LITERS_PER_US_GALLON,
  LITERS_PER_US_QUART,
  METERS_PER_FOOT,
  SQUARE_METERS_PER_SQUARE_FOOT,
} from "@/lib/units";
import { formatQuantityLabel } from "@/lib/labels";

type FormState = {
  length: string;
  width: string;
  wallHeight: string;
  openingsArea: string;
  coats: string;
  coverage: string;
  extraPercent: string;
  includeCeiling: boolean;
  containerLiters: string;
};

type ContainerOption = {
  value: string;
  label: string;
  shortLabel: string;
};

const CONTAINERS: Record<UnitSystem, ContainerOption[]> = {
  imperial: [
    {
      value: String(LITERS_PER_US_QUART),
      label: "1 quart can",
      shortLabel: "1 qt",
    },
    {
      value: String(LITERS_PER_US_GALLON),
      label: "1 gallon can",
      shortLabel: "1 gal",
    },
    {
      value: String(LITERS_PER_US_GALLON * 5),
      label: "5 gallon pail",
      shortLabel: "5 gal",
    },
  ],
  metric: [
    { value: "1", label: "1 liter can", shortLabel: "1 L" },
    { value: "2.5", label: "2.5 liter can", shortLabel: "2.5 L" },
    { value: "5", label: "5 liter pail", shortLabel: "5 L" },
    { value: "10", label: "10 liter pail", shortLabel: "10 L" },
  ],
};

const DEFAULTS: Record<UnitSystem, FormState> = {
  imperial: {
    length: "12",
    width: "10",
    wallHeight: "8",
    openingsArea: "42",
    coats: "2",
    coverage: String(DEFAULT_COVERAGE_SQ_FT_PER_GALLON),
    extraPercent: "10",
    includeCeiling: false,
    containerLiters: String(LITERS_PER_US_GALLON),
  },
  metric: {
    length: "3.6",
    width: "3",
    wallHeight: "2.4",
    openingsArea: "3.9",
    coats: "2",
    coverage: "9.8",
    extraPercent: "10",
    includeCeiling: false,
    containerLiters: "5",
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

function displayArea(squareMeters: number, unitSystem: UnitSystem) {
  return unitSystem === "imperial"
    ? squareMeters / SQUARE_METERS_PER_SQUARE_FOOT
    : squareMeters;
}

function containerLabel(unitSystem: UnitSystem, value: string) {
  return (
    CONTAINERS[unitSystem].find((option) => option.value === value)?.shortLabel ??
    "container"
  );
}

function resultSummary(
  result: PaintResult,
  unitSystem: UnitSystem,
  selectedContainer: string,
) {
  const volume =
    unitSystem === "imperial"
      ? `${format(result.paintGallons)} gal`
      : `${format(result.paintLiters)} L`;

  return `${result.containers} × ${containerLabel(unitSystem, selectedContainer)} · ${volume}`;
}

export function PaintCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");
  const [form, setForm] = useState<FormState>(DEFAULTS.imperial);
  const [notice, setNotice] = useState("");
  const {
    history,
    saveEstimate,
    clearHistory: clearSavedHistory,
  } = useSavedEstimates("buildmeasure.paint.history.v1");

  const calculation = useMemo(() => {
    try {
      const result = calculatePaint({
        unitSystem,
        length: Number(form.length),
        width: Number(form.width),
        wallHeight: Number(form.wallHeight),
        openingsArea: Number(form.openingsArea),
        coats: Number(form.coats),
        coverage: Number(form.coverage),
        extraPercent: Number(form.extraPercent),
        includeCeiling: form.includeCeiling,
        containerLiters: Number(form.containerLiters),
      });

      return { result, error: null };
    } catch (error) {
      if (error instanceof PaintInputError) {
        return { result: null, error };
      }
      throw error;
    }
  }, [form, unitSystem]);
  const purchaseUnitLabel = `${containerLabel(unitSystem, form.containerLiters)} container`;
  const purchaseCost = usePurchaseCost(
    calculation.result?.containers ?? null,
    purchaseUnitLabel,
  );

  const markInteraction = useCalculatorAnalytics(
    "paint-calculator",
    Boolean(calculation.result),
    calculation.error?.field ?? "",
  );

  function setField<Key extends keyof FormState>(
    field: Key,
    value: FormState[Key],
  ) {
    markInteraction();
    if (field === "containerLiters") purchaseCost.clearUnitPrice();
    setForm((current) => ({ ...current, [field]: value }));
    setNotice("");
  }

  function changeUnitSystem(next: UnitSystem) {
    if (next === unitSystem) return;
    markInteraction();
    purchaseCost.clearUnitPrice();

    const length = safeNumber(form.length);
    const width = safeNumber(form.width);
    const wallHeight = safeNumber(form.wallHeight);
    const openingsArea = safeNumber(form.openingsArea);
    const coverage = safeNumber(form.coverage);
    const movingToMetric = next === "metric";

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
      wallHeight: formatConvertedInput(
        movingToMetric
          ? wallHeight * METERS_PER_FOOT
          : wallHeight / METERS_PER_FOOT,
      ),
      openingsArea: formatConvertedInput(
        movingToMetric
          ? openingsArea * SQUARE_METERS_PER_SQUARE_FOOT
          : openingsArea / SQUARE_METERS_PER_SQUARE_FOOT,
      ),
      coverage: formatConvertedInput(
        movingToMetric
          ? (coverage * SQUARE_METERS_PER_SQUARE_FOOT) /
            LITERS_PER_US_GALLON
          : (coverage * LITERS_PER_US_GALLON) /
            SQUARE_METERS_PER_SQUARE_FOOT,
      ),
      containerLiters: movingToMetric
        ? DEFAULTS.metric.containerLiters
        : DEFAULTS.imperial.containerLiters,
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
      "BuildNumbers paint estimate",
      resultSummary(calculation.result, unitSystem, form.containerLiters),
      `Paintable area: ${format(displayArea(calculation.result.paintableAreaSquareMeters, unitSystem))} ${unitSystem === "imperial" ? "ft²" : "m²"}`,
      `Coats: ${calculation.result.coats}`,
      `Extra allowance: ${format(calculation.result.extraPercent)}%`,
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
      label: `${form.length} × ${form.width} × ${form.wallHeight} ${
        unitSystem === "imperial" ? "ft" : "m"
      } · ${formatQuantityLabel(Number(form.coats), "coat")}`,
      summary: `${resultSummary(calculation.result, unitSystem, form.containerLiters)}${purchaseCost.result ? ` · Est. cost ${formatPurchaseCost(purchaseCost.result)}` : ""}`,
      purchase: createSavedEstimatePurchase(
        calculation.result?.containers ?? null,
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
  const areaUnit = unitSystem === "imperial" ? "ft²" : "m²";
  const coverageUnit = unitSystem === "imperial" ? "ft²/gal" : "m²/L";
  const fieldError = calculation.error?.field;
  const selectedContainerLabel = containerLabel(
    unitSystem,
    form.containerLiters,
  );

  return (
    <div className="calculator-workspace paint-workspace">
      <form className="calculator-panel" onSubmit={handleSubmit} noValidate>
        <div className="calculator-panel-head">
          <div>
            <p className="panel-kicker">Room dimensions</p>
            <h2>Describe the surfaces</h2>
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
            <small>ft / ft²</small>
          </button>
          <button
            type="button"
            className={unitSystem === "metric" ? "active" : ""}
            aria-pressed={unitSystem === "metric"}
            onClick={() => changeUnitSystem("metric")}
          >
            Metric
            <small>m / m²</small>
          </button>
        </fieldset>

        <div className="input-grid">
          <label className={fieldError === "length" ? "field-invalid" : ""}>
            <span>Room length</span>
            <span className="input-with-unit">
              <input
                id="paint-length"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.length}
                onChange={(event) => setField("length", event.target.value)}
                aria-describedby={fieldError === "length" ? "paint-error" : undefined}
              />
              <span>{lengthUnit}</span>
            </span>
          </label>
          <label className={fieldError === "width" ? "field-invalid" : ""}>
            <span>Room width</span>
            <span className="input-with-unit">
              <input
                id="paint-width"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.width}
                onChange={(event) => setField("width", event.target.value)}
                aria-describedby={fieldError === "width" ? "paint-error" : undefined}
              />
              <span>{lengthUnit}</span>
            </span>
          </label>
          <label className={fieldError === "wallHeight" ? "field-invalid" : ""}>
            <span>Wall height</span>
            <span className="input-with-unit">
              <input
                id="paint-height"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.wallHeight}
                onChange={(event) => setField("wallHeight", event.target.value)}
                aria-describedby={fieldError === "wallHeight" ? "paint-error" : undefined}
              />
              <span>{lengthUnit}</span>
            </span>
          </label>
        </div>

        <label className="checkbox-card">
          <input
            type="checkbox"
            checked={form.includeCeiling}
            onChange={(event) => setField("includeCeiling", event.target.checked)}
          />
          <span className="checkbox-control" aria-hidden="true" />
          <span>
            <strong>Include the ceiling</strong>
            <small>Adds room length × width to the paintable surface.</small>
          </span>
        </label>

        <div className="paint-option-grid">
          <label className={fieldError === "openingsArea" ? "field-invalid" : ""}>
            <span>Doors &amp; windows to subtract</span>
            <span className="input-with-unit">
              <input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.openingsArea}
                onChange={(event) => setField("openingsArea", event.target.value)}
                aria-describedby={fieldError === "openingsArea" ? "paint-error" : "openings-help"}
              />
              <span>{areaUnit}</span>
            </span>
            <small id="openings-help">Enter their combined measured area.</small>
          </label>

          <label className={fieldError === "coats" ? "field-invalid" : ""}>
            <span>Number of coats</span>
            <select
              value={form.coats}
              onChange={(event) => setField("coats", event.target.value)}
            >
              {[1, 2, 3, 4, 5, 6].map((coats) => (
                <option value={coats} key={coats}>{coats} {coats === 1 ? "coat" : "coats"}</option>
              ))}
            </select>
            <small>Follow the selected product specification.</small>
          </label>

          <label className={fieldError === "coverage" ? "field-invalid" : ""}>
            <span>Coverage per {unitSystem === "imperial" ? "gallon" : "liter"}</span>
            <span className="input-with-unit">
              <input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.coverage}
                onChange={(event) => setField("coverage", event.target.value)}
                aria-describedby={fieldError === "coverage" ? "paint-error" : "coverage-help"}
              />
              <span>{coverageUnit}</span>
            </span>
            <small id="coverage-help">Use the coverage printed on your paint label.</small>
          </label>

          <label className={fieldError === "extraPercent" ? "field-invalid" : ""}>
            <span>Extra allowance</span>
            <span className="input-with-unit">
              <input
                type="number"
                min="0"
                max="25"
                step="1"
                inputMode="decimal"
                value={form.extraPercent}
                onChange={(event) => setField("extraPercent", event.target.value)}
                aria-describedby={fieldError === "extraPercent" ? "paint-error" : "extra-help"}
              />
              <span>%</span>
            </span>
            <small id="extra-help">For texture, applicator loss, and touch-ups.</small>
          </label>
        </div>

        <label className="container-select">
          <span>Container size</span>
          <select
            value={form.containerLiters}
            onChange={(event) => setField("containerLiters", event.target.value)}
          >
            {CONTAINERS[unitSystem].map((option) => (
              <option value={option.value} key={option.value}>{option.label}</option>
            ))}
          </select>
          <small>The purchase count is rounded up to this container size.</small>
        </label>

        <CalculatorCostFields
          unitLabel={purchaseUnitLabel}
          unitPrice={purchaseCost.unitPrice}
          currencyLabel={purchaseCost.currencyLabel}
          error={purchaseCost.error}
          errorId="paint-cost-error"
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
          <p className="calculator-error" id="paint-error" role="alert">
            {calculation.error.message}
          </p>
        ) : null}
      </form>

      <aside className="result-panel paint-result-panel" aria-live="polite">
        <div className="result-panel-head">
          <div>
            <p className="panel-kicker">Paint estimate</p>
            <h2>Your result</h2>
          </div>
          <span className="engine-badge">
            Engine v{PAINT_ENGINE_VERSION}
          </span>
        </div>

        {calculation.result ? (
          <>
            <div className="primary-result">
              <span>Containers to buy</span>
              <strong>
                {calculation.result.containers}
                <small>× {selectedContainerLabel}</small>
              </strong>
              <p>
                Minimum paint: {unitSystem === "imperial"
                  ? `${format(calculation.result.paintGallons)} gal`
                  : `${format(calculation.result.paintLiters)} L`}
              </p>
            </div>

            <dl className="result-breakdown">
              <div>
                <dt>Paintable area</dt>
                <dd>
                  {format(displayArea(calculation.result.paintableAreaSquareMeters, unitSystem))} {areaUnit}
                </dd>
              </div>
              <div>
                <dt>
                  Area across{" "}
                  {formatQuantityLabel(calculation.result.coats, "coat")}
                </dt>
                <dd>
                  {format(displayArea(calculation.result.coatedAreaSquareMeters, unitSystem))} {areaUnit}
                </dd>
              </div>
              <div>
                <dt>US gallons</dt>
                <dd>{format(calculation.result.paintGallons)} gal</dd>
              </div>
              <div className="bag-result">
                <dt>Liters</dt>
                <dd>{format(calculation.result.paintLiters)} L</dd>
              </div>
            </dl>

            <div className="surface-summary">
              <span>Walls</span>
              <strong>
                {format(displayArea(calculation.result.wallAreaSquareMeters, unitSystem))} {areaUnit}
              </strong>
              <span>Ceiling</span>
              <strong>
                {format(displayArea(calculation.result.ceilingAreaSquareMeters, unitSystem))} {areaUnit}
              </strong>
              <span>Openings</span>
              <strong>
                −{format(displayArea(calculation.result.openingsAreaSquareMeters, unitSystem))} {areaUnit}
              </strong>
            </div>

            <CalculatorCostResult result={purchaseCost.result} />

            <p className="result-caution">
              Coverage is theoretical and product-specific. Surface texture,
              porosity, and application method can change the actual quantity.
            </p>

            <CalculatorActions
              calculator="paint-calculator"
              onCopy={copyResult}
              onSave={saveResult}
            />
          </>
        ) : (
          <div className="empty-result">
            <span>—</span>
            <p>Enter valid room and coverage values to calculate your estimate.</p>
          </div>
        )}

        <p className="calculator-notice" role="status">{notice}</p>
      </aside>

      <CalculatorHistory
        history={history}
        onClear={clearHistory}
        titleId="paint-history-title"
      />
    </div>
  );
}
