"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  BAG_YIELDS_CUBIC_FEET,
  type BagSize,
  calculatePostHoleConcrete,
  POST_HOLE_ENGINE_VERSION,
  type PostHoleConcreteResult,
  PostHoleConcreteInputError,
  type PostShape,
  type UnitSystem,
} from "@/lib/calculators/post-hole-concrete";
import {
  LITERS_PER_CUBIC_METER,
  METERS_PER_FOOT,
  METERS_PER_INCH,
} from "@/lib/units";
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
  holeCount: string;
  holeDiameter: string;
  holeDepth: string;
  postShape: PostShape;
  postSize: string;
  wastePercent: string;
  bagSize: BagSize;
};

const DEFAULTS: Record<UnitSystem, FormState> = {
  imperial: {
    holeCount: "4",
    holeDiameter: "12",
    holeDepth: "24",
    postShape: "square",
    postSize: "4",
    wastePercent: "10",
    bagSize: 80,
  },
  metric: {
    holeCount: "4",
    holeDiameter: "30.48",
    holeDepth: "60.96",
    postShape: "square",
    postSize: "10.16",
    wastePercent: "10",
    bagSize: 80,
  },
};

const CENTIMETERS_PER_INCH = METERS_PER_INCH / 0.01;

function format(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}

function safeNumber(value: string) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function postShapeLabel(shape: PostShape) {
  if (shape === "round") return "round post";
  if (shape === "square") return "square post";
  return "no post displacement";
}

function resultSummary(result: PostHoleConcreteResult) {
  return `${format(result.cubicYards)} yd³ · ${format(result.orderCubicMeters)} m³ · ${result.bags} × ${result.bagSize} lb bags`;
}

export function PostHoleConcreteCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");
  const [form, setForm] = useState<FormState>(DEFAULTS.imperial);
  const [notice, setNotice] = useState("");
  const {
    history,
    saveEstimate,
    clearHistory: clearSavedHistory,
  } = useSavedEstimates("buildmeasure.post-hole-concrete.history.v1");

  const calculation = useMemo(() => {
    try {
      const result = calculatePostHoleConcrete({
        unitSystem,
        holeCount: Number(form.holeCount),
        holeDiameter: Number(form.holeDiameter),
        holeDepth: Number(form.holeDepth),
        postShape: form.postShape,
        postSize: form.postShape === "none" ? 0 : Number(form.postSize),
        wastePercent: Number(form.wastePercent),
        bagSize: form.bagSize,
      });

      return { result, error: null };
    } catch (error) {
      if (error instanceof PostHoleConcreteInputError) {
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
    "post-hole-concrete-calculator",
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

    const factor = next === "metric" ? CENTIMETERS_PER_INCH : 1 / CENTIMETERS_PER_INCH;
    const holeDiameter = safeNumber(form.holeDiameter);
    const holeDepth = safeNumber(form.holeDepth);
    const postSize = safeNumber(form.postSize);

    setForm((current) => ({
      ...current,
      holeDiameter: formatConvertedInput(holeDiameter * factor),
      holeDepth: formatConvertedInput(holeDepth * factor),
      postSize: formatConvertedInput(postSize * factor),
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
      "JobsiteQuant post-hole concrete estimate",
      resultSummary(calculation.result),
      `Holes: ${calculation.result.holeCount}`,
      `Post displacement: ${postShapeLabel(calculation.result.postShape)}`,
      `Net concrete: ${format(calculation.result.totalNetCubicMeters)} m³`,
      `Allowance: ${format(calculation.result.wastePercent)}%`,
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
    const unit = unitSystem === "imperial" ? "in" : "cm";
    saveEstimate({
      label: `${form.holeCount} holes · Ø ${form.holeDiameter} ${unit} × ${form.holeDepth} ${unit}`,
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

  const dimensionUnit = unitSystem === "imperial" ? "in" : "cm";
  const fieldError = calculation.error?.field;
  const postEnabled = form.postShape !== "none";

  return (
    <div className="calculator-workspace">
      <form className="calculator-panel" onSubmit={handleSubmit} noValidate>
        <div className="calculator-panel-head">
          <div>
            <p className="panel-kicker">Hole geometry</p>
            <h2>Enter the post-hole measurements</h2>
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
            <small>in</small>
          </button>
          <button
            type="button"
            className={unitSystem === "metric" ? "active" : ""}
            aria-pressed={unitSystem === "metric"}
            onClick={() => changeUnitSystem("metric")}
          >
            Metric
            <small>cm</small>
          </button>
        </fieldset>

        <div className="input-grid">
          <label className={fieldError === "holeCount" ? "field-invalid" : ""}>
            <span>Number of holes</span>
            <span className="input-with-unit">
              <input
                id="post-hole-count"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={form.holeCount}
                onChange={(event) => setField("holeCount", event.target.value)}
                aria-describedby={fieldError === "holeCount" ? "calculator-error" : undefined}
              />
              <span>holes</span>
            </span>
          </label>
          <label className={fieldError === "holeDiameter" ? "field-invalid" : ""}>
            <span>Hole diameter</span>
            <span className="input-with-unit">
              <input
                id="post-hole-diameter"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.holeDiameter}
                onChange={(event) => setField("holeDiameter", event.target.value)}
                aria-describedby={fieldError === "holeDiameter" ? "calculator-error" : undefined}
              />
              <span>{dimensionUnit}</span>
            </span>
          </label>
          <label className={fieldError === "holeDepth" ? "field-invalid" : ""}>
            <span>Concrete depth</span>
            <span className="input-with-unit">
              <input
                id="post-hole-depth"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.holeDepth}
                onChange={(event) => setField("holeDepth", event.target.value)}
                aria-describedby={fieldError === "holeDepth" ? "calculator-error" : "post-hole-depth-help"}
              />
              <span>{dimensionUnit}</span>
            </span>
            <small id="post-hole-depth-help">Enter the actual concrete-filled depth; this calculator does not choose structural embedment.</small>
          </label>
        </div>

        <div className="option-grid">
          <label className={fieldError === "postShape" ? "field-invalid" : ""}>
            <span>Post displacement</span>
            <select
              value={form.postShape}
              onChange={(event) => setField("postShape", event.target.value as PostShape)}
            >
              <option value="none">Do not subtract a post</option>
              <option value="round">Round post</option>
              <option value="square">Square post</option>
            </select>
            <small>Optional: subtract the volume occupied by one post in each hole.</small>
          </label>

          {postEnabled ? (
            <label className={fieldError === "postSize" ? "field-invalid" : ""}>
              <span>{form.postShape === "round" ? "Post diameter" : "Post side"}</span>
              <span className="input-with-unit">
                <input
                  id="post-size"
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  value={form.postSize}
                  onChange={(event) => setField("postSize", event.target.value)}
                  aria-describedby={fieldError === "postSize" ? "calculator-error" : "post-size-help"}
                />
                <span>{dimensionUnit}</span>
              </span>
              <small id="post-size-help">Assumes this post occupies the full entered concrete depth.</small>
            </label>
          ) : null}

          <label className={fieldError === "wastePercent" ? "field-invalid" : ""}>
            <span>Extra allowance</span>
            <span className="input-with-unit">
              <input
                type="number"
                min="0"
                max="50"
                step="1"
                inputMode="decimal"
                value={form.wastePercent}
                onChange={(event) => setField("wastePercent", event.target.value)}
                aria-describedby={fieldError === "wastePercent" ? "calculator-error" : "post-hole-waste-help"}
              />
              <span>%</span>
            </span>
            <small id="post-hole-waste-help">Adjust for over-excavation, spillage, and site variation.</small>
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
            <small>Approximate manufacturer-published yields; verify your product.</small>
          </label>
        </div>

        <CalculatorCostFields
          unitLabel={purchaseUnitLabel}
          unitPrice={purchaseCost.unitPrice}
          currencyLabel={purchaseCost.currencyLabel}
          error={purchaseCost.error}
          errorId="post-hole-cost-error"
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
            <p className="panel-kicker">Concrete estimate</p>
            <h2>Your result</h2>
          </div>
          <span className="engine-badge">Engine v{POST_HOLE_ENGINE_VERSION}</span>
        </div>

        {calculation.result ? (
          <>
            <div className="primary-result">
              <span>Order this volume</span>
              <strong>
                {unitSystem === "imperial"
                  ? format(calculation.result.cubicYards, 3)
                  : format(calculation.result.orderCubicMeters, 3)}
                <small>{unitSystem === "imperial" ? "yd³" : "m³"}</small>
              </strong>
              <p>Includes {format(calculation.result.wastePercent)}% extra allowance.</p>
            </div>

            <dl className="result-breakdown">
              <div>
                <dt>Net per hole</dt>
                <dd>
                  {unitSystem === "imperial"
                    ? `${format(calculation.result.netPerHoleCubicMeters / METERS_PER_FOOT ** 3, 3)} ft³`
                    : `${format(calculation.result.netPerHoleCubicMeters * LITERS_PER_CUBIC_METER, 1)} L`}
                </dd>
              </div>
              <div>
                <dt>Total net concrete</dt>
                <dd>{format(calculation.result.totalNetCubicMeters, 3)} m³</dd>
              </div>
              <div>
                <dt>Order cubic feet</dt>
                <dd>{format(calculation.result.cubicFeet, 2)} ft³</dd>
              </div>
              <div className="bag-result">
                <dt>{calculation.result.bagSize} lb bags</dt>
                <dd>{calculation.result.bags} bags</dd>
              </div>
            </dl>

            <CalculatorCostResult result={purchaseCost.result} />

            <p className="result-caution">
              This is a quantity estimate, not a structural post-hole design. Verify
              hole geometry, local requirements, and the selected mix yield before purchase.
            </p>

            <CalculatorActions
              calculator="post-hole-concrete-calculator"
              onCopy={copyResult}
              onSave={saveResult}
            />
          </>
        ) : (
          <div className="empty-result">
            <span>—</span>
            <p>Enter valid hole geometry to calculate your estimate.</p>
          </div>
        )}

        <p className="calculator-notice" role="status">{notice}</p>
      </aside>

      <CalculatorHistory
        history={history}
        onClear={clearHistory}
        titleId="post-hole-concrete-history-title"
      />
    </div>
  );
}
