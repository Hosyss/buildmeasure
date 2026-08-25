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
  calculateTile,
  TILE_ENGINE_VERSION,
  TileInputError,
  TileOrientation,
  TileResult,
} from "@/lib/calculators/tile";
import type { UnitSystem } from "@/lib/calculators/types";
import {
  formatConvertedInput,
  METERS_PER_FOOT,
  METERS_PER_INCH,
  METERS_PER_MILLIMETER,
  MILLIMETERS_PER_INCH,
  SQUARE_METERS_PER_SQUARE_FOOT,
} from "@/lib/units";

type FormState = {
  surfaceLength: string;
  surfaceWidth: string;
  tileLength: string;
  tileWidth: string;
  groutJoint: string;
  wastePercent: string;
  tilesPerBox: string;
  orientation: TileOrientation;
};

const DEFAULTS: Record<UnitSystem, FormState> = {
  imperial: {
    surfaceLength: "12",
    surfaceWidth: "10",
    tileLength: "12",
    tileWidth: "12",
    groutJoint: "0.125",
    wastePercent: "10",
    tilesPerBox: "10",
    orientation: "auto",
  },
  metric: {
    surfaceLength: "3.6",
    surfaceWidth: "3",
    tileLength: "300",
    tileWidth: "300",
    groutJoint: "3",
    wastePercent: "10",
    tilesPerBox: "10",
    orientation: "auto",
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

function displayJoint(meters: number, unitSystem: UnitSystem) {
  return unitSystem === "imperial"
    ? meters / METERS_PER_INCH
    : meters / METERS_PER_MILLIMETER;
}

function orientationLabel(result: TileResult) {
  return result.layoutOrientation === "aligned"
    ? "Length aligned"
    : "Rotated 90°";
}

function resultSummary(result: TileResult) {
  return `${result.boxes} ${result.boxes === 1 ? "box" : "boxes"} · ${result.purchasedTiles} tiles`;
}

export function TileCalculator() {
  const [unitSystem, setUnitSystem] =
    useState<UnitSystem>("imperial");
  const [form, setForm] = useState<FormState>(DEFAULTS.imperial);
  const [notice, setNotice] = useState("");
  const {
    history,
    saveEstimate,
    clearHistory: clearSavedHistory,
  } = useSavedEstimates("buildmeasure.tile.history.v1");

  const calculation = useMemo(() => {
    try {
      const result = calculateTile({
        unitSystem,
        surfaceLength: Number(form.surfaceLength),
        surfaceWidth: Number(form.surfaceWidth),
        tileLength: Number(form.tileLength),
        tileWidth: Number(form.tileWidth),
        groutJoint: Number(form.groutJoint),
        wastePercent: Number(form.wastePercent),
        tilesPerBox: Number(form.tilesPerBox),
        orientation: form.orientation,
      });

      return { result, error: null };
    } catch (error) {
      if (error instanceof TileInputError) {
        return { result: null, error };
      }
      throw error;
    }
  }, [form, unitSystem]);
  const purchaseUnitLabel = "box";
  const purchaseCost = usePurchaseCost(
    calculation.result?.boxes ?? null,
    purchaseUnitLabel,
  );

  const markInteraction = useCalculatorAnalytics(
    "tile-calculator",
    Boolean(calculation.result),
    calculation.error?.field ?? "",
  );

  function setField<Key extends keyof FormState>(
    field: Key,
    value: FormState[Key],
  ) {
    markInteraction();
    if (field === "tilesPerBox") purchaseCost.clearUnitPrice();
    setForm((current) => ({ ...current, [field]: value }));
    setNotice("");
  }

  function changeUnitSystem(next: UnitSystem) {
    if (next === unitSystem) return;
    markInteraction();

    const surfaceLength = safeNumber(form.surfaceLength);
    const surfaceWidth = safeNumber(form.surfaceWidth);
    const tileLength = safeNumber(form.tileLength);
    const tileWidth = safeNumber(form.tileWidth);
    const groutJoint = safeNumber(form.groutJoint);
    const movingToMetric = next === "metric";

    setForm((current) => ({
      ...current,
      surfaceLength: formatConvertedInput(
        movingToMetric
          ? surfaceLength * METERS_PER_FOOT
          : surfaceLength / METERS_PER_FOOT,
      ),
      surfaceWidth: formatConvertedInput(
        movingToMetric
          ? surfaceWidth * METERS_PER_FOOT
          : surfaceWidth / METERS_PER_FOOT,
      ),
      tileLength: formatConvertedInput(
        movingToMetric
          ? tileLength * MILLIMETERS_PER_INCH
          : tileLength / MILLIMETERS_PER_INCH,
      ),
      tileWidth: formatConvertedInput(
        movingToMetric
          ? tileWidth * MILLIMETERS_PER_INCH
          : tileWidth / MILLIMETERS_PER_INCH,
      ),
      groutJoint: formatConvertedInput(
        movingToMetric
          ? groutJoint * MILLIMETERS_PER_INCH
          : groutJoint / MILLIMETERS_PER_INCH,
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

    const areaUnit = unitSystem === "imperial" ? "ft²" : "m²";
    const costLine = purchaseCost.result
      ? `Estimated material cost: ${formatPurchaseCost(purchaseCost.result)}`
      : null;
    const text = [
      "BuildNumbers tile estimate",
      resultSummary(calculation.result),
      `Surface area: ${format(displayArea(calculation.result.surfaceAreaSquareMeters, unitSystem))} ${areaUnit}`,
      `Tiles with ${format(calculation.result.wastePercent)}% waste: ${calculation.result.orderTileCount}`,
      `Layout check: ${calculation.result.tilesAlongLength} × ${calculation.result.tilesAlongWidth}`,
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
      label: `${form.surfaceLength} × ${form.surfaceWidth} ${
        unitSystem === "imperial" ? "ft" : "m"
      } · ${form.tileLength} × ${form.tileWidth} ${
        unitSystem === "imperial" ? "in" : "mm"
      } tile`,
      summary: `${resultSummary(calculation.result)}${purchaseCost.result ? ` · Est. cost ${formatPurchaseCost(purchaseCost.result)}` : ""}` ,
      purchase: createSavedEstimatePurchase(
        calculation.result?.boxes ?? null,
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

  const surfaceUnit = unitSystem === "imperial" ? "ft" : "m";
  const tileUnit = unitSystem === "imperial" ? "in" : "mm";
  const areaUnit = unitSystem === "imperial" ? "ft²" : "m²";
  const fieldError = calculation.error?.field;

  return (
    <div className="calculator-workspace tile-workspace">
      <form
        className="calculator-panel"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="calculator-panel-head">
          <div>
            <p className="panel-kicker">Surface &amp; product</p>
            <h2>Define the tile project</h2>
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
            <small>m / mm</small>
          </button>
        </fieldset>

        <div className="input-grid tile-surface-grid">
          <label
            className={
              fieldError === "surfaceLength" ? "field-invalid" : ""
            }
          >
            <span>Surface length</span>
            <span className="input-with-unit">
              <input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.surfaceLength}
                onChange={(event) =>
                  setField("surfaceLength", event.target.value)
                }
                aria-describedby={
                  fieldError === "surfaceLength"
                    ? "tile-error"
                    : undefined
                }
              />
              <span>{surfaceUnit}</span>
            </span>
          </label>
          <label
            className={
              fieldError === "surfaceWidth" ? "field-invalid" : ""
            }
          >
            <span>Surface width</span>
            <span className="input-with-unit">
              <input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.surfaceWidth}
                onChange={(event) =>
                  setField("surfaceWidth", event.target.value)
                }
                aria-describedby={
                  fieldError === "surfaceWidth"
                    ? "tile-error"
                    : undefined
                }
              />
              <span>{surfaceUnit}</span>
            </span>
          </label>
        </div>

        <div className="paint-option-grid tile-option-grid">
          <label
            className={
              fieldError === "tileLength" ? "field-invalid" : ""
            }
          >
            <span>Tile length</span>
            <span className="input-with-unit">
              <input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.tileLength}
                onChange={(event) =>
                  setField("tileLength", event.target.value)
                }
                aria-describedby={
                  fieldError === "tileLength"
                    ? "tile-error"
                    : undefined
                }
              />
              <span>{tileUnit}</span>
            </span>
          </label>
          <label
            className={
              fieldError === "tileWidth" ? "field-invalid" : ""
            }
          >
            <span>Tile width</span>
            <span className="input-with-unit">
              <input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.tileWidth}
                onChange={(event) =>
                  setField("tileWidth", event.target.value)
                }
                aria-describedby={
                  fieldError === "tileWidth"
                    ? "tile-error"
                    : undefined
                }
              />
              <span>{tileUnit}</span>
            </span>
          </label>
          <label
            className={
              fieldError === "groutJoint" ? "field-invalid" : ""
            }
          >
            <span>Grout joint width</span>
            <span className="input-with-unit">
              <input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.groutJoint}
                onChange={(event) =>
                  setField("groutJoint", event.target.value)
                }
                aria-describedby={
                  fieldError === "groutJoint"
                    ? "tile-error"
                    : "tile-grout-help"
                }
              />
              <span>{tileUnit}</span>
            </span>
            <small id="tile-grout-help">
              Use the tile or installer specification.
            </small>
          </label>
          <label
            className={
              fieldError === "wastePercent" ? "field-invalid" : ""
            }
          >
            <span>Waste allowance</span>
            <span className="input-with-unit">
              <input
                type="number"
                min="0"
                max="50"
                step="1"
                inputMode="decimal"
                value={form.wastePercent}
                onChange={(event) =>
                  setField("wastePercent", event.target.value)
                }
                aria-describedby={
                  fieldError === "wastePercent"
                    ? "tile-error"
                    : "tile-waste-help"
                }
              />
              <span>%</span>
            </span>
            <small id="tile-waste-help">
              Adjust for cuts, breakage, pattern, and attic stock.
            </small>
          </label>
          <label
            className={
              fieldError === "tilesPerBox" ? "field-invalid" : ""
            }
          >
            <span>Tiles per box</span>
            <span className="input-with-unit">
              <input
                type="number"
                min="1"
                max="500"
                step="1"
                inputMode="numeric"
                value={form.tilesPerBox}
                onChange={(event) =>
                  setField("tilesPerBox", event.target.value)
                }
                aria-describedby={
                  fieldError === "tilesPerBox"
                    ? "tile-error"
                    : "tile-box-help"
                }
              />
              <span>pcs</span>
            </span>
            <small id="tile-box-help">
              Read the exact quantity from the carton.
            </small>
          </label>
          <label
            className={
              fieldError === "orientation" ? "field-invalid" : ""
            }
          >
            <span>Layout orientation</span>
            <select
              value={form.orientation}
              onChange={(event) =>
                setField(
                  "orientation",
                  event.target.value as TileOrientation,
                )
              }
              aria-describedby={
                fieldError === "orientation"
                  ? "tile-error"
                  : "tile-orientation-help"
              }
            >
              <option value="auto">Auto — fewer grid cells</option>
              <option value="aligned">
                Tile length along surface length
              </option>
              <option value="rotated">Rotate tile 90°</option>
            </select>
            <small id="tile-orientation-help">
              This changes the layout check, not the area order.
            </small>
          </label>
        </div>

        <CalculatorCostFields
          unitLabel={purchaseUnitLabel}
          unitPrice={purchaseCost.unitPrice}
          currencyLabel={purchaseCost.currencyLabel}
          error={purchaseCost.error}
          errorId="tile-cost-error"
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
          <p
            className="calculator-error"
            id="tile-error"
            role="alert"
          >
            {calculation.error.message}
          </p>
        ) : null}
      </form>

      <aside
        className="result-panel tile-result-panel"
        aria-live="polite"
      >
        <div className="result-panel-head">
          <div>
            <p className="panel-kicker">Tile estimate</p>
            <h2>Your result</h2>
          </div>
          <span className="engine-badge">
            Engine v{TILE_ENGINE_VERSION}
          </span>
        </div>

        {calculation.result ? (
          <>
            <div className="primary-result">
              <span>Boxes to buy</span>
              <strong>
                {calculation.result.boxes}
                <small>
                  × {calculation.result.tilesPerBox} tiles
                </small>
              </strong>
              <p>
                Purchase total: {calculation.result.purchasedTiles} tiles
              </p>
            </div>

            <dl className="result-breakdown">
              <div>
                <dt>Surface area</dt>
                <dd>
                  {format(
                    displayArea(
                      calculation.result.surfaceAreaSquareMeters,
                      unitSystem,
                    ),
                  )}{" "}
                  {areaUnit}
                </dd>
              </div>
              <div>
                <dt>Minimum whole tiles</dt>
                <dd>{calculation.result.minimumWholeTiles}</dd>
              </div>
              <div>
                <dt>
                  Tiles with {format(calculation.result.wastePercent)}%
                  waste
                </dt>
                <dd>{calculation.result.orderTileCount}</dd>
              </div>
              <div className="bag-result">
                <dt>Purchased coverage</dt>
                <dd>
                  {format(
                    displayArea(
                      calculation.result.purchasedAreaSquareMeters,
                      unitSystem,
                    ),
                  )}{" "}
                  {areaUnit}
                </dd>
              </div>
            </dl>

            <div className="surface-summary">
              <span>Layout grid check</span>
              <strong>
                {calculation.result.tilesAlongLength} ×{" "}
                {calculation.result.tilesAlongWidth}
              </strong>
              <span>Orientation</span>
              <strong>{orientationLabel(calculation.result)}</strong>
              <span>Grout joint</span>
              <strong>
                {format(
                  displayJoint(
                    calculation.result.groutJointMeters,
                    unitSystem,
                  ),
                  3,
                )}{" "}
                {tileUnit}
              </strong>
              <span>Extra from box rounding</span>
              <strong>
                {calculation.result.boxOverageTiles}{" "}
                {calculation.result.boxOverageTiles === 1
                  ? "tile"
                  : "tiles"}
              </strong>
            </div>

            <CalculatorCostResult result={purchaseCost.result} />

            <p className="result-caution">
              The purchase quantity is area-based and includes your waste
              allowance. The grid is a layout check only; it does not
              optimize reuse of cut pieces.
            </p>

            <CalculatorActions
              calculator="tile-calculator"
              onCopy={copyResult}
              onSave={saveResult}
            />
          </>
        ) : (
          <div className="empty-result">
            <span>—</span>
            <p>
              Enter valid surface, tile, joint, and box values to
              calculate your estimate.
            </p>
          </div>
        )}

        <p className="calculator-notice" role="status">
          {notice}
        </p>
      </aside>

      <CalculatorHistory
        history={history}
        onClear={clearHistory}
        titleId="tile-history-title"
      />
    </div>
  );
}
