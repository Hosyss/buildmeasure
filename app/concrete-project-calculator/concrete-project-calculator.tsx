"use client";

import { useMemo, useState } from "react";
import { CalculatorCostFields } from "@/components/calculator-cost";
import { usePurchaseCost } from "@/hooks/use-purchase-cost";
import { useSavedEstimates } from "@/hooks/use-saved-estimates";
import {
  calculateConcreteProject,
  ConcreteProjectInputError,
  MAX_CONCRETE_PROJECT_PARTS,
} from "@/lib/calculators/concrete-project";
import type { BagSize } from "@/lib/calculators/concrete";
import { createSavedEstimatePurchase } from "@/lib/history";
import { ProjectPartEditor } from "./project-part-editor";
import { ProjectResult } from "./project-result";
import {
  createDraftPart,
  readNumber,
  toConcreteProjectPart,
  type DraftPart,
} from "./project-draft";
import styles from "./concrete-project.module.css";

const STORAGE_KEY = "buildmeasure.concrete-project.history.v1";

export function ConcreteProjectCalculator() {
  const [parts, setParts] = useState<DraftPart[]>([createDraftPart(1, 0)]);
  const [nextId, setNextId] = useState(2);
  const [wastePercent, setWastePercent] = useState("10");
  const [bagSize, setBagSize] = useState<BagSize>(80);
  const [notice, setNotice] = useState("");
  const { history, saveEstimate, clearHistory } = useSavedEstimates(STORAGE_KEY, 8);

  const calculation = useMemo(() => {
    try {
      return {
        result: calculateConcreteProject({
          parts: parts.map(toConcreteProjectPart),
          wastePercent: readNumber(wastePercent),
          bagSize,
        }),
        error: null,
      };
    } catch (error) {
      if (error instanceof ConcreteProjectInputError) {
        return { result: null, error };
      }
      throw error;
    }
  }, [bagSize, parts, wastePercent]);

  const cost = usePurchaseCost(
    calculation.result?.bags ?? null,
    `${bagSize} lb bag`,
  );

  function patchPart(id: number, patch: Partial<DraftPart>) {
    setParts((current) =>
      current.map((part) => (part.id === id ? { ...part, ...patch } : part)),
    );
    setNotice("");
  }

  function replacePart(id: number, replacement: DraftPart) {
    setParts((current) =>
      current.map((part) => (part.id === id ? replacement : part)),
    );
    setNotice("");
  }

  function addPart() {
    if (parts.length >= MAX_CONCRETE_PROJECT_PARTS) return;
    setParts((current) => [
      ...current,
      createDraftPart(nextId, current.length),
    ]);
    setNextId((value) => value + 1);
    setNotice("");
  }

  function removePart(id: number) {
    if (parts.length === 1) return;
    setParts((current) => current.filter((part) => part.id !== id));
    setNotice("");
  }

  function movePart(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= parts.length) return;
    setParts((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setNotice("");
  }

  function reset() {
    setParts([createDraftPart(nextId, 0)]);
    setNextId((value) => value + 1);
    setWastePercent("10");
    setBagSize(80);
    cost.resetCost();
    setNotice("");
  }

  function summaryText() {
    const result = calculation.result;
    if (!result) return "";
    return [
      "BuildNumbers Multi-Shape Concrete Project",
      `${result.partCount} project parts`,
      `Net concrete: ${result.netCubicMeters.toFixed(3)} m³`,
      `Order concrete: ${result.orderCubicMeters.toFixed(3)} m³ / ${result.cubicYards.toFixed(3)} yd³`,
      `Allowance: ${result.wastePercent}%`,
      `Bags: ${result.bags} × ${result.bagSize} lb`,
      ...result.parts.map(
        (part) =>
          `- ${part.label}: ${part.netCubicMeters.toFixed(3)} m³ (${part.sharePercent.toFixed(1)}%)`,
      ),
    ].join("\n");
  }

  async function copy() {
    const text = summaryText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setNotice("Project result copied.");
    } catch {
      setNotice("Copy is unavailable in this browser.");
    }
  }

  function save() {
    const result = calculation.result;
    if (!result) return;

    saveEstimate({
      label: `Concrete project · ${result.partCount} part${result.partCount === 1 ? "" : "s"}`,
      summary: `${result.cubicYards.toFixed(3)} yd³ · ${result.bags} × ${result.bagSize} lb bags`,
      purchase: createSavedEstimatePurchase(
        result.bags,
        `${result.bagSize} lb bag`,
        cost.result,
      ),
    });
    setNotice("Project estimate saved on this device.");
  }

  return (
    <>
      <div className="calculator-workspace">
        <section className="calculator-panel">
          <div className="calculator-panel-head">
            <div>
              <p className="panel-kicker">Project builder</p>
              <h2>Combine concrete shapes</h2>
            </div>
            <span className="status-pill">
              {parts.length} / {MAX_CONCRETE_PROJECT_PARTS} parts
            </span>
          </div>

          <p className={styles.partHelp}>
            Add each concrete section separately. BuildNumbers converts every
            part to physical volume, sums net concrete first, then applies the
            project allowance and package rounding once.
          </p>

          <div className={styles.partStack}>
            {parts.map((part, index) => (
              <ProjectPartEditor
                part={part}
                index={index}
                partCount={parts.length}
                invalid={calculation.error?.partIndex === index}
                errorMessage={
                  calculation.error?.partIndex === index
                    ? calculation.error.message
                    : undefined
                }
                onPatch={(patch) => patchPart(part.id, patch)}
                onReplace={(replacement) => replacePart(part.id, replacement)}
                onMove={(direction) => movePart(index, direction)}
                onRemove={() => removePart(part.id)}
                key={part.id}
              />
            ))}
          </div>

          <div className={styles.builderActions}>
            <button
              type="button"
              className="button button-outline"
              onClick={addPart}
              disabled={parts.length >= MAX_CONCRETE_PROJECT_PARTS}
            >
              + Add concrete part
            </button>
            <button type="button" className="text-button" onClick={reset}>
              Reset project
            </button>
          </div>

          <div className={styles.projectOptions}>
            <label>
              <span>Project allowance</span>
              <span className={styles.unitPair}>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="any"
                  inputMode="decimal"
                  value={wastePercent}
                  onChange={(event) => setWastePercent(event.target.value)}
                />
                <span>%</span>
              </span>
            </label>
            <label>
              <span>Concrete bag size</span>
              <select
                value={bagSize}
                onChange={(event) =>
                  setBagSize(Number(event.target.value) as BagSize)
                }
              >
                <option value={40}>40 lb bag</option>
                <option value={60}>60 lb bag</option>
                <option value={80}>80 lb bag</option>
              </select>
            </label>
          </div>

          <CalculatorCostFields
            unitLabel={`${bagSize} lb bag`}
            unitPrice={cost.unitPrice}
            currencyLabel={cost.currencyLabel}
            error={cost.error}
            errorId="concrete-project-cost-error"
            onUnitPriceChange={cost.setUnitPrice}
            onCurrencyLabelChange={cost.setCurrencyLabel}
          />

          {calculation.error && calculation.error.partIndex === undefined ? (
            <p className="calculator-error" role="alert">
              {calculation.error.message}
            </p>
          ) : null}
        </section>

        <ProjectResult
          result={calculation.result}
          cost={cost.result}
          notice={notice}
          onCopy={copy}
          onSave={save}
        />
      </div>

      <section
        className="history-panel no-print"
        aria-labelledby="concrete-project-history-title"
      >
        <div className="history-head">
          <div>
            <p className="panel-kicker">This device</p>
            <h2 id="concrete-project-history-title">Saved concrete projects</h2>
          </div>
          {history.length ? (
            <button type="button" className="text-button" onClick={clearHistory}>
              Clear saved
            </button>
          ) : null}
        </div>
        {history.length ? (
          <ul>
            {history.map((item) => (
              <li key={item.id}>
                <strong>{item.label}</strong>
                <span>{item.summary}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="history-empty">
            No multi-shape concrete projects saved on this device yet.
          </p>
        )}
      </section>
    </>
  );
}
