"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalculatorActions } from "@/components/calculator-actions";
import { CalculatorHistory } from "@/components/calculator-history";
import {
  CalculatorCostFields,
  CalculatorCostResult,
} from "@/components/calculator-cost";
import { useCalculatorAnalytics } from "@/components/analytics-tracker";
import { ResetIcon } from "@/components/icons";
import { usePurchaseCost } from "@/hooks/use-purchase-cost";
import { useSavedEstimates } from "@/hooks/use-saved-estimates";
import { createSavedEstimatePurchase } from "@/lib/history";
import {
  BRICK_ENGINE_VERSION,
  BRICK_PRESETS,
  brickPresetRate,
  calculateBrick,
  convertBrickCoverageRate,
  BrickInputError,
  type BrickPresetId,
  type BrickResult,
} from "@/lib/calculators/brick";
import type { UnitSystem } from "@/lib/calculators/types";
import { formatPurchaseCost } from "@/lib/cost-estimate";
import {
  formatConvertedInput,
  METERS_PER_FOOT,
  SQUARE_METERS_PER_SQUARE_FOOT,
} from "@/lib/units";

type BrickChoice = BrickPresetId | "custom";

type FormState = {
  wallLength: string;
  wallHeight: string;
  openingsArea: string;
  coverageRate: string;
  wastePercent: string;
  brickChoice: BrickChoice;
};

function formatBrickConvertedInput(value: number) {
  return formatConvertedInput(value, 10);
}

function defaultsFor(unitSystem: UnitSystem): FormState {
  return {
    wallLength:
      unitSystem === "imperial"
        ? "20"
        : formatBrickConvertedInput(20 * METERS_PER_FOOT),
    wallHeight:
      unitSystem === "imperial"
        ? "8"
        : formatBrickConvertedInput(8 * METERS_PER_FOOT),
    openingsArea:
      unitSystem === "imperial"
        ? "16"
        : formatBrickConvertedInput(16 * SQUARE_METERS_PER_SQUARE_FOOT),
    coverageRate: formatBrickConvertedInput(
      brickPresetRate("modular", unitSystem),
    ),
    wastePercent: "5",
    brickChoice: "modular",
  };
}

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

function choiceLabel(choice: BrickChoice) {
  if (choice === "custom") return "Custom / supplier rate";
  return BRICK_PRESETS[choice].label;
}

function presetCoverageLabel(
  choice: BrickPresetId,
  unitSystem: UnitSystem,
) {
  const rateAreaUnit = unitSystem === "imperial" ? "100 ft²" : "10 m²";
  return `${format(brickPresetRate(choice, unitSystem), 3)} bricks / ${rateAreaUnit}`;
}

function resultSummary(result: BrickResult) {
  return `${result.orderBricks} ${result.orderBricks === 1 ? "brick" : "bricks"} to order`;
}

export function BrickCalculator() {
  const [unitSystem, setUnitSystem] =
    useState<UnitSystem>("imperial");
  const [form, setForm] = useState<FormState>(defaultsFor("imperial"));
  const [notice, setNotice] = useState("");
  const {
    history,
    saveEstimate,
    clearHistory: clearSavedHistory,
  } = useSavedEstimates("buildmeasure.brick.history.v1");

  const calculation = useMemo(() => {
    try {
      const result = calculateBrick({
        unitSystem,
        wallLength: Number(form.wallLength),
        wallHeight: Number(form.wallHeight),
        openingsArea: Number(form.openingsArea),
        coverageRate: Number(form.coverageRate),
        wastePercent: Number(form.wastePercent),
      });
      return { result, error: null };
    } catch (error) {
      if (error instanceof BrickInputError) {
        return { result: null, error };
      }
      throw error;
    }
  }, [form, unitSystem]);

  const purchaseUnitLabel = "brick";
  const purchaseCost = usePurchaseCost(
    calculation.result?.orderBricks ?? null,
    "brick",
  );

  const markInteraction = useCalculatorAnalytics(
    "brick-calculator",
    Boolean(calculation.result),
    calculation.error?.field ?? "",
  );

  function setField<Key extends keyof FormState>(
    field: Key,
    value: FormState[Key],
  ) {
    markInteraction();
    if (field === "coverageRate") purchaseCost.clearUnitPrice();
    setForm((current) => ({ ...current, [field]: value }));
    setNotice("");
  }

  function changeBrickChoice(next: BrickChoice) {
    if (next === form.brickChoice) return;
    markInteraction();
    purchaseCost.clearUnitPrice();
    setForm((current) => ({
      ...current,
      brickChoice: next,
      coverageRate:
        next === "custom"
          ? current.coverageRate
          : formatBrickConvertedInput(brickPresetRate(next, unitSystem)),
    }));
    setNotice(
      next === "custom"
        ? "Enter the coverage rate for the exact brick or supplier estimate you are using."
        : `${BRICK_PRESETS[next].label} coverage loaded from the BIA Table 4 estimating rate.`,
    );
  }

  function changeUnitSystem(next: UnitSystem) {
    if (next === unitSystem) return;
    markInteraction();

    const wallLength = safeNumber(form.wallLength);
    const wallHeight = safeNumber(form.wallHeight);
    const openingsArea = safeNumber(form.openingsArea);
    const coverageRate = safeNumber(form.coverageRate);
    const movingToMetric = next === "metric";

    setForm((current) => ({
      ...current,
      wallLength: formatBrickConvertedInput(
        movingToMetric
          ? wallLength * METERS_PER_FOOT
          : wallLength / METERS_PER_FOOT,
      ),
      wallHeight: formatBrickConvertedInput(
        movingToMetric
          ? wallHeight * METERS_PER_FOOT
          : wallHeight / METERS_PER_FOOT,
      ),
      openingsArea: formatBrickConvertedInput(
        movingToMetric
          ? openingsArea * SQUARE_METERS_PER_SQUARE_FOOT
          : openingsArea / SQUARE_METERS_PER_SQUARE_FOOT,
      ),
      coverageRate:
        current.brickChoice === "custom"
          ? formatBrickConvertedInput(
              convertBrickCoverageRate(coverageRate, unitSystem, next),
            )
          : formatBrickConvertedInput(
              brickPresetRate(current.brickChoice, next),
            ),
    }));
    setUnitSystem(next);
    setNotice(
      `Wall, openings, and coverage inputs converted to ${movingToMetric ? "metric" : "imperial"} units.`,
    );
  }

  function reset() {
    markInteraction();
    purchaseCost.resetCost();
    setForm(defaultsFor(unitSystem));
    setNotice("Calculator reset to the verified example values.");
  }

  async function copyResult() {
    if (!calculation.result) return;

    const areaUnit = unitSystem === "imperial" ? "ft²" : "m²";
    const rateUnit = unitSystem === "imperial" ? "100 ft²" : "10 m²";
    const displayedRate =
      unitSystem === "imperial"
        ? calculation.result.bricksPer100SquareFeet
        : calculation.result.bricksPer10SquareMeters;
    const costLine = purchaseCost.result
      ? `Estimated material cost: ${formatPurchaseCost(purchaseCost.result)}`
      : null;
    const text = [
      "BuildMeasure brick estimate",
      resultSummary(calculation.result),
      `Net wall area: ${format(displayArea(calculation.result.netAreaSquareMeters, unitSystem))} ${areaUnit}`,
      `Brick basis: ${choiceLabel(form.brickChoice)}`,
      `Coverage rate: ${format(displayedRate, 3)} brick / ${rateUnit}`,
      `Waste allowance: ${format(calculation.result.wastePercent)}%`,
      ...(costLine ? [costLine] : []),
      "Scope: fired-clay brick, running/stack bond quantity basis; verify project detailing separately.",
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

    const areaUnit = unitSystem === "imperial" ? "ft²" : "m²";
    saveEstimate({
      label: `${form.wallLength} × ${form.wallHeight} ${unitSystem === "imperial" ? "ft" : "m"} wall · ${choiceLabel(form.brickChoice)}`,
      summary: `${resultSummary(calculation.result)} · ${format(displayArea(calculation.result.netAreaSquareMeters, unitSystem))} ${areaUnit} net${purchaseCost.result ? ` · Est. cost ${formatPurchaseCost(purchaseCost.result)}` : ""}`,
      purchase: createSavedEstimatePurchase(
        calculation.result?.orderBricks ?? null,
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

  const dimensionUnit = unitSystem === "imperial" ? "ft" : "m";
  const areaUnit = unitSystem === "imperial" ? "ft²" : "m²";
  const rateAreaUnit = unitSystem === "imperial" ? "100 ft²" : "10 m²";
  const fieldError = calculation.error?.field;
  const displayedRate = calculation.result
    ? unitSystem === "imperial"
      ? calculation.result.bricksPer100SquareFeet
      : calculation.result.bricksPer10SquareMeters
    : safeNumber(form.coverageRate);

  return (
    <div className="calculator-workspace brick-workspace">
      <form className="calculator-panel" onSubmit={handleSubmit} noValidate>
        <div className="calculator-panel-head">
          <div>
            <p className="panel-kicker">Wall &amp; brick coverage</p>
            <h2>Define the brick wall</h2>
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
          <label className={fieldError === "wallLength" ? "field-invalid" : ""}>
            <span>Wall length</span>
            <span className="input-with-unit">
              <input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.wallLength}
                onChange={(event) => setField("wallLength", event.target.value)}
                aria-describedby={fieldError === "wallLength" ? "brick-error" : undefined}
              />
              <span>{dimensionUnit}</span>
            </span>
          </label>
          <label className={fieldError === "wallHeight" ? "field-invalid" : ""}>
            <span>Wall height</span>
            <span className="input-with-unit">
              <input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.wallHeight}
                onChange={(event) => setField("wallHeight", event.target.value)}
                aria-describedby={fieldError === "wallHeight" ? "brick-error" : undefined}
              />
              <span>{dimensionUnit}</span>
            </span>
          </label>
        </div>

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
                aria-describedby={fieldError === "openingsArea" ? "brick-error" : "brick-openings-help"}
              />
              <span>{areaUnit}</span>
            </span>
            <small id="brick-openings-help">Enter the combined measured area that will not receive brick.</small>
          </label>

          <label>
            <span>Brick coverage basis</span>
            <select
              value={form.brickChoice}
              onChange={(event) => changeBrickChoice(event.target.value as BrickChoice)}
              aria-describedby="brick-choice-help"
            >
              {Object.entries(BRICK_PRESETS).map(([key, preset]) => (
                <option value={key} key={key}>
                  {preset.label} — {presetCoverageLabel(key as BrickPresetId, unitSystem)}
                </option>
              ))}
              <option value="custom">Custom / supplier rate</option>
            </select>
            <small id="brick-choice-help">BIA presets use Technical Note 10 Table 4 running/stack-bond estimating rates.</small>
          </label>

          {form.brickChoice === "custom" ? (
            <label className={fieldError === "coverageRate" ? "field-invalid" : ""}>
              <span>Brick coverage rate</span>
              <span className="input-with-unit">
                <input
                  id="brick-custom-coverage-rate"
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  value={form.coverageRate}
                  onChange={(event) => setField("coverageRate", event.target.value)}
                  aria-describedby={fieldError === "coverageRate" ? "brick-error" : "brick-rate-help"}
                />
                <span>bricks / {rateAreaUnit}</span>
              </span>
              <small id="brick-rate-help">
                Use the coverage rate for the exact brick, supplier estimate, or project specification.
              </small>
            </label>
          ) : (
            <div className="brick-rate-display">
              <span>Brick coverage rate</span>
              <output
                id="brick-rate-output"
                className="brick-rate-output"
                aria-live="polite"
              >
                <strong>{format(brickPresetRate(form.brickChoice, unitSystem), 3)}</strong>
                <span>bricks / {rateAreaUnit}</span>
              </output>
              <small id="brick-rate-help">
                Preset value from the selected BIA estimating basis. Choose Custom to enter a project-specific rate.
              </small>
            </div>
          )}

          <label className={fieldError === "wastePercent" ? "field-invalid" : ""}>
            <span>Waste / breakage allowance</span>
            <span className="input-with-unit">
              <input
                type="number"
                min="0"
                max="50"
                step="1"
                inputMode="decimal"
                value={form.wastePercent}
                onChange={(event) => setField("wastePercent", event.target.value)}
                aria-describedby={fieldError === "wastePercent" ? "brick-error" : "brick-waste-help"}
              />
              <span>%</span>
            </span>
            <small id="brick-waste-help">BIA gives at least 5% as a general breakage/waste rule and notes some jobs need more.</small>
          </label>
        </div>

        <CalculatorCostFields
          unitLabel="brick"
          unitPrice={purchaseCost.unitPrice}
          currencyLabel={purchaseCost.currencyLabel}
          error={purchaseCost.error}
          errorId="brick-cost-error"
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
          <p className="calculator-error" id="brick-error" role="alert">
            {calculation.error.message}
          </p>
        ) : null}
      </form>

      <aside className="result-panel brick-result-panel" aria-live="polite">
        <div className="result-panel-head">
          <div>
            <p className="panel-kicker">Brick estimate</p>
            <h2>Your result</h2>
          </div>
          <span className="engine-badge">Engine v{BRICK_ENGINE_VERSION}</span>
        </div>

        {calculation.result ? (
          <>
            <div className="primary-result">
              <span>Bricks to order</span>
              <strong>
                {format(calculation.result.orderBricks, 0)}
                <small> bricks</small>
              </strong>
              <p>Includes {format(calculation.result.wastePercent)}% waste / breakage allowance.</p>
            </div>

            <dl className="result-breakdown">
              <div>
                <dt>Gross wall area</dt>
                <dd>{format(displayArea(calculation.result.grossAreaSquareMeters, unitSystem))} {areaUnit}</dd>
              </div>
              <div>
                <dt>Openings removed</dt>
                <dd>{format(displayArea(calculation.result.openingsAreaSquareMeters, unitSystem))} {areaUnit}</dd>
              </div>
              <div>
                <dt>Net brick area</dt>
                <dd>{format(displayArea(calculation.result.netAreaSquareMeters, unitSystem))} {areaUnit}</dd>
              </div>
              <div className="bag-result">
                <dt>Minimum whole bricks</dt>
                <dd>{format(calculation.result.minimumWholeBricks, 0)}</dd>
              </div>
            </dl>

            <div className="surface-summary">
              <span>Coverage basis</span>
              <strong>{choiceLabel(form.brickChoice)}</strong>
              <span>Coverage rate</span>
              <strong>{format(displayedRate, 3)} brick / {rateAreaUnit}</strong>
              <span>Allowance adds</span>
              <strong>{format(calculation.result.allowanceAddedBricks, 0)} bricks</strong>
              <span>Bond basis</span>
              <strong>Running / stack only</strong>
            </div>

            <CalculatorCostResult result={purchaseCost.result} />

            <p className="result-caution">
              Quantity estimate for fired-clay brick using a running/stack-bond area rate. It does not estimate mortar, header-pattern corrections, structural design, or code requirements.
            </p>

            <CalculatorActions
              calculator="brick-calculator"
              onCopy={copyResult}
              onSave={saveResult}
            />
          </>
        ) : (
          <div className="empty-result">
            <span>—</span>
            <p>Enter a valid wall, openings area, brick coverage rate, and allowance to calculate your estimate.</p>
          </div>
        )}

        <p className="calculator-notice" role="status">{notice}</p>
      </aside>

      <CalculatorHistory
        history={history}
        onClear={clearHistory}
        titleId="brick-history-title"
      />
    </div>
  );
}
