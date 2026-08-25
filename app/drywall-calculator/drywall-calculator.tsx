"use client";

import { useMemo, useState } from "react";
import { CalculatorActions } from "@/components/calculator-actions";
import { CalculatorCostFields, CalculatorCostResult } from "@/components/calculator-cost";
import { CalculatorHistory } from "@/components/calculator-history";
import { useCalculatorAnalytics } from "@/components/analytics-tracker";
import { ResetIcon } from "@/components/icons";
import { usePurchaseCost } from "@/hooks/use-purchase-cost";
import { useSavedEstimates } from "@/hooks/use-saved-estimates";
import { formatPurchaseCost } from "@/lib/cost-estimate";
import { createSavedEstimatePurchase } from "@/lib/history";
import {
  calculateDrywall,
  drywallPresetDimensions,
  DRYWALL_ENGINE_VERSION,
  DRYWALL_PANEL_PRESETS,
  DrywallInputError,
  type DrywallPanelPresetId,
  type DrywallResult,
} from "@/lib/calculators/drywall";
import type { UnitSystem } from "@/lib/calculators/types";
import { formatConvertedInput, METERS_PER_FOOT, SQUARE_METERS_PER_SQUARE_FOOT } from "@/lib/units";

type PanelChoice = DrywallPanelPresetId | "custom";
type FormState = {
  roomLength: string;
  roomWidth: string;
  wallHeight: string;
  openingsArea: string;
  wastePercent: string;
  panelWidth: string;
  panelLength: string;
};

const DEFAULTS: Record<UnitSystem, FormState> = {
  imperial: { roomLength: "12", roomWidth: "12", wallHeight: "8", openingsArea: "24", wastePercent: "10", panelWidth: "4", panelLength: "8" },
  metric: { roomLength: "3.6", roomWidth: "3.6", wallHeight: "2.4", openingsArea: "2.2", wastePercent: "10", panelWidth: "1.2192", panelLength: "2.4384" },
};

function number(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function format(value: number, digits = 2) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
}

function summary(result: DrywallResult, unitSystem: UnitSystem) {
  const area = unitSystem === "imperial" ? result.adjustedAreaSquareFeet : result.adjustedAreaSquareMeters;
  return `${result.orderPanels} sheets · ${format(area)} ${unitSystem === "imperial" ? "ft²" : "m²"} order area`;
}

export function DrywallCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");
  const [panelChoice, setPanelChoice] = useState<PanelChoice>("4x8");
  const [includeCeiling, setIncludeCeiling] = useState(true);
  const [form, setForm] = useState<FormState>(DEFAULTS.imperial);
  const [notice, setNotice] = useState("");
  const { history, saveEstimate, clearHistory } = useSavedEstimates("buildmeasure.drywall.history.v1");

  const calculation = useMemo(() => {
    try {
      return { result: calculateDrywall({
        unitSystem,
        roomLength: Number(form.roomLength),
        roomWidth: Number(form.roomWidth),
        wallHeight: Number(form.wallHeight),
        openingsArea: Number(form.openingsArea),
        includeCeiling,
        panelWidth: Number(form.panelWidth),
        panelLength: Number(form.panelLength),
        wastePercent: Number(form.wastePercent),
      }), error: null };
    } catch (error) {
      if (error instanceof DrywallInputError) return { result: null, error };
      throw error;
    }
  }, [form, includeCeiling, unitSystem]);

  const purchaseUnitLabel = `${form.panelWidth} × ${form.panelLength} ${unitSystem === "imperial" ? "ft" : "m"} sheet`;
  const purchaseCost = usePurchaseCost(calculation.result?.orderPanels ?? null, purchaseUnitLabel);
  const markInteraction = useCalculatorAnalytics("drywall-calculator", Boolean(calculation.result), calculation.error?.field ?? "");

  function setField(field: keyof FormState, value: string) {
    markInteraction();
    setForm((current) => ({ ...current, [field]: value }));
    setNotice("");
  }

  function selectPanel(choice: PanelChoice) {
    markInteraction();
    setPanelChoice(choice);
    purchaseCost.clearUnitPrice();
    if (choice !== "custom") {
      const dimensions = drywallPresetDimensions(choice, unitSystem);
      setForm((current) => ({ ...current, panelWidth: formatConvertedInput(dimensions.width), panelLength: formatConvertedInput(dimensions.length) }));
    }
  }

  function changeUnits(next: UnitSystem) {
    if (next === unitSystem) return;
    markInteraction();
    const multiplier = next === "metric" ? METERS_PER_FOOT : 1 / METERS_PER_FOOT;
    const areaMultiplier = next === "metric" ? SQUARE_METERS_PER_SQUARE_FOOT : 1 / SQUARE_METERS_PER_SQUARE_FOOT;
    setForm((current) => ({
      ...current,
      roomLength: formatConvertedInput(number(current.roomLength) * multiplier),
      roomWidth: formatConvertedInput(number(current.roomWidth) * multiplier),
      wallHeight: formatConvertedInput(number(current.wallHeight) * multiplier),
      openingsArea: formatConvertedInput(number(current.openingsArea) * areaMultiplier),
      panelWidth: formatConvertedInput(number(current.panelWidth) * multiplier),
      panelLength: formatConvertedInput(number(current.panelLength) * multiplier),
    }));
    setUnitSystem(next);
    setNotice(`Inputs converted to ${next} units.`);
  }

  function reset() {
    markInteraction();
    purchaseCost.resetCost();
    setPanelChoice("4x8");
    setIncludeCeiling(true);
    setForm(DEFAULTS[unitSystem]);
    setNotice("Calculator reset to example values.");
  }

  async function copyResult() {
    if (!calculation.result) return;
    const cost = purchaseCost.result ? `\nEstimated material cost: ${formatPurchaseCost(purchaseCost.result)}` : "";
    try {
      await navigator.clipboard.writeText(`JobsiteQuant drywall estimate\n${summary(calculation.result, unitSystem)}\nNet area: ${format(unitSystem === "imperial" ? calculation.result.netAreaSquareFeet : calculation.result.netAreaSquareMeters)} ${unitSystem === "imperial" ? "ft²" : "m²"}\nAllowance: ${form.wastePercent}%${cost}`);
      setNotice("Estimate copied.");
    } catch { setNotice("Copy is unavailable in this browser."); }
  }

  function saveResult() {
    if (!calculation.result) return;
    saveEstimate({
      label: `${form.roomLength} × ${form.roomWidth} ${unitSystem === "imperial" ? "ft" : "m"} room`,
      summary: `${summary(calculation.result, unitSystem)}${purchaseCost.result ? ` · Est. cost ${formatPurchaseCost(purchaseCost.result)}` : ""}`,
      purchase: createSavedEstimatePurchase(calculation.result.orderPanels, purchaseUnitLabel, purchaseCost.result),
    });
    setNotice("Estimate saved on this device.");
  }

  const lengthUnit = unitSystem === "imperial" ? "ft" : "m";
  const areaUnit = unitSystem === "imperial" ? "ft²" : "m²";
  const resultArea = calculation.result && (unitSystem === "imperial" ? calculation.result.netAreaSquareFeet : calculation.result.netAreaSquareMeters);
  const adjustedArea = calculation.result && (unitSystem === "imperial" ? calculation.result.adjustedAreaSquareFeet : calculation.result.adjustedAreaSquareMeters);
  const errorField = calculation.error?.field;

  return (
    <div className="calculator-workspace drywall-workspace">
      <form className="calculator-panel" onSubmit={(event) => event.preventDefault()} noValidate>
        <div className="calculator-panel-head"><div><p className="panel-kicker">Room walls &amp; ceiling</p><h2>Enter the room and panel</h2></div><button className="icon-button" type="button" onClick={reset}><ResetIcon /> Reset</button></div>
        <fieldset className="unit-toggle"><legend>Measurement system</legend><button type="button" className={unitSystem === "imperial" ? "active" : ""} aria-pressed={unitSystem === "imperial"} onClick={() => changeUnits("imperial")}>Imperial<small>ft / ft²</small></button><button type="button" className={unitSystem === "metric" ? "active" : ""} aria-pressed={unitSystem === "metric"} onClick={() => changeUnits("metric")}>Metric<small>m / m²</small></button></fieldset>
        <div className="input-grid">
          {([ ["roomLength", "Room length"], ["roomWidth", "Room width"], ["wallHeight", "Wall height"] ] as const).map(([field, label]) => <label key={field} className={errorField === field ? "field-invalid" : ""}><span>{label}</span><span className="input-with-unit"><input type="number" min="0" step="any" inputMode="decimal" value={form[field]} onChange={(event) => setField(field, event.target.value)} aria-describedby={errorField === field ? "drywall-error" : undefined}/><span>{lengthUnit}</span></span></label>)}
        </div>
        <div className="paint-option-grid">
          <label className={errorField === "openingsArea" ? "field-invalid" : ""}><span>Measured openings</span><span className="input-with-unit"><input type="number" min="0" step="any" inputMode="decimal" value={form.openingsArea} onChange={(event) => setField("openingsArea", event.target.value)} aria-describedby={errorField === "openingsArea" ? "drywall-error" : "drywall-openings-help"}/><span>{areaUnit}</span></span><small id="drywall-openings-help">Combined measured door and window area.</small></label>
          <label className="checkbox-card"><input type="checkbox" checked={includeCeiling} onChange={(event) => { markInteraction(); setIncludeCeiling(event.target.checked); }}/><span><strong>Include ceiling</strong><small>Add room length × width to the covered area.</small></span></label>
        </div>
        <fieldset className="unit-toggle"><legend>Panel size</legend>{Object.entries(DRYWALL_PANEL_PRESETS).map(([id, preset]) => <button key={id} type="button" className={panelChoice === id ? "active" : ""} aria-pressed={panelChoice === id} onClick={() => selectPanel(id as DrywallPanelPresetId)}>{preset.label}</button>)}<button type="button" className={panelChoice === "custom" ? "active" : ""} aria-pressed={panelChoice === "custom"} onClick={() => selectPanel("custom")}>Custom</button></fieldset>
        <div className="input-grid">
          <label className={errorField === "panelWidth" ? "field-invalid" : ""}><span>Panel width</span><span className="input-with-unit"><input type="number" min="0" step="any" inputMode="decimal" value={form.panelWidth} onChange={(event) => { setPanelChoice("custom"); purchaseCost.clearUnitPrice(); setField("panelWidth", event.target.value); }} aria-describedby={errorField === "panelWidth" ? "drywall-error" : undefined}/><span>{lengthUnit}</span></span></label>
          <label className={errorField === "panelLength" ? "field-invalid" : ""}><span>Panel length</span><span className="input-with-unit"><input type="number" min="0" step="any" inputMode="decimal" value={form.panelLength} onChange={(event) => { setPanelChoice("custom"); purchaseCost.clearUnitPrice(); setField("panelLength", event.target.value); }} aria-describedby={errorField === "panelLength" ? "drywall-error" : undefined}/><span>{lengthUnit}</span></span></label>
          <label className={errorField === "wastePercent" ? "field-invalid" : ""}><span>Waste allowance</span><span className="input-with-unit"><input type="number" min="0" max="50" step="1" inputMode="decimal" value={form.wastePercent} onChange={(event) => setField("wastePercent", event.target.value)} aria-describedby={errorField === "wastePercent" ? "drywall-error" : "drywall-waste-help"}/><span>%</span></span><small id="drywall-waste-help">Explicit and adjustable; the default example uses 10%.</small></label>
        </div>
        <CalculatorCostFields unitLabel={purchaseUnitLabel} unitPrice={purchaseCost.unitPrice} currencyLabel={purchaseCost.currencyLabel} error={purchaseCost.error} errorId="drywall-cost-error" onUnitPriceChange={purchaseCost.setUnitPrice} onCurrencyLabelChange={purchaseCost.setCurrencyLabel}/>
        {calculation.error ? <p className="calculator-error" id="drywall-error" role="alert">{calculation.error.message}</p> : null}
      </form>

      <aside className="result-panel" aria-live="polite">
        <div className="result-panel-head"><div><p className="panel-kicker">Live estimate</p><h2>Drywall result</h2></div><span className="engine-badge">Engine v{DRYWALL_ENGINE_VERSION}</span></div>
        {calculation.result ? <>
          <div className="primary-result"><span>Complete sheets to order</span><strong>{calculation.result.orderPanels}</strong><small>{purchaseUnitLabel}s</small></div>
          <div className="result-grid"><div><span>Net covered area</span><strong>{format(resultArea || 0)} {areaUnit}</strong></div><div><span>Area with allowance</span><strong>{format(adjustedArea || 0)} {areaUnit}</strong></div><div><span>Minimum whole sheets</span><strong>{calculation.result.minimumWholePanels}</strong></div><div><span>Allowance-added sheets</span><strong>{calculation.result.allowanceAddedPanels}</strong></div></div>
          <CalculatorCostResult result={purchaseCost.result}/>
          <p className="result-caution">Area-based quantity only. Confirm layout, board type, orientation, layers, framing, fire/moisture requirements, and supplier stock before purchase.</p>
          <CalculatorActions calculator="drywall-calculator" onCopy={copyResult} onSave={saveResult}/>
        </> : <div className="result-empty"><strong>Complete the highlighted field.</strong><p>The estimate updates when every value is valid.</p></div>}
        {notice ? <p className="calculator-notice" role="status">{notice}</p> : null}
      </aside>
      <CalculatorHistory history={history} onClear={() => { clearHistory(); setNotice("Saved estimates cleared."); }} titleId="drywall-history-title"/>
    </div>
  );
}
