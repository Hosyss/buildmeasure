"use client";

import type { ConcreteProjectPartKind } from "@/lib/calculators/concrete-project";
import {
  convertDraftPartUnits,
  draftUnitLabel,
  KIND_LABELS,
  type DraftPart,
} from "./project-draft";
import styles from "./concrete-project.module.css";

type ProjectPartEditorProps = {
  part: DraftPart;
  index: number;
  partCount: number;
  invalid: boolean;
  errorMessage?: string;
  onPatch: (patch: Partial<DraftPart>) => void;
  onReplace: (part: DraftPart) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
};

function NumberField({
  part,
  field,
  label,
  value,
  onChange,
  min = "0",
}: {
  part: DraftPart;
  field: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
}) {
  return (
    <label>
      <span>{label}</span>
      <span className={styles.unitPair}>
        <input
          type="number"
          min={min}
          step="any"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <span>{draftUnitLabel(part, field)}</span>
      </span>
    </label>
  );
}

function ShapeFields({
  part,
  patch,
}: {
  part: DraftPart;
  patch: (patch: Partial<DraftPart>) => void;
}) {
  const field = (key: keyof DraftPart, label: string) => (
    <NumberField
      part={part}
      field={String(key)}
      label={label}
      value={String(part[key])}
      onChange={(value) => patch({ [key]: value } as Partial<DraftPart>)}
    />
  );

  switch (part.kind) {
    case "rectangular-slab":
    case "footing":
      return <>{field("length", "Length")}{field("width", "Width")}{field("depth", "Depth")}</>;
    case "circular-slab":
      return <>{field("diameter", "Diameter")}{field("depth", "Depth")}</>;
    case "rectangular-column":
      return <>{field("height", "Height")}{field("width", "Section width")}{field("depth", "Section depth")}</>;
    case "circular-column":
      return <>{field("height", "Height")}{field("diameter", "Column diameter")}</>;
    case "wall":
      return <>{field("length", "Wall length")}{field("height", "Wall height")}{field("thickness", "Thickness")}{field("openingsArea", "Openings area")}</>;
    case "post-hole":
      return (
        <>
          {field("holeDiameter", "Hole diameter")}
          {field("holeDepth", "Hole depth")}
          <label>
            <span>Post displacement</span>
            <select
              value={part.postShape}
              onChange={(event) => patch({ postShape: event.target.value as DraftPart["postShape"] })}
            >
              <option value="none">No post displacement</option>
              <option value="round">Round post</option>
              <option value="square">Square post</option>
            </select>
          </label>
          {part.postShape !== "none"
            ? field("postSize", part.postShape === "round" ? "Post diameter" : "Post side")
            : null}
        </>
      );
  }
}

export function ProjectPartEditor({
  part,
  index,
  partCount,
  invalid,
  errorMessage,
  onPatch,
  onReplace,
  onMove,
  onRemove,
}: ProjectPartEditorProps) {
  return (
    <article className={`${styles.partCard} ${invalid ? styles.partCardInvalid : ""}`}>
      <div className={styles.partHead}>
        <div>
          <span className={styles.partIndex}>Part {index + 1}</span>
          <h3>{part.label.trim() || KIND_LABELS[part.kind]}</h3>
        </div>
        <div className={styles.partActions}>
          <button type="button" className="text-button" disabled={index === 0} onClick={() => onMove(-1)}>
            Move up
          </button>
          <button type="button" className="text-button" disabled={index === partCount - 1} onClick={() => onMove(1)}>
            Move down
          </button>
          <button type="button" className="text-button" disabled={partCount === 1} onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>

      <div className={styles.partMetaGrid}>
        <label>
          <span>Part label</span>
          <input
            type="text"
            maxLength={80}
            value={part.label}
            onChange={(event) => onPatch({ label: event.target.value })}
          />
        </label>
        <label>
          <span>Geometry</span>
          <select
            value={part.kind}
            onChange={(event) => onPatch({ kind: event.target.value as ConcreteProjectPartKind })}
          >
            {Object.entries(KIND_LABELS).map(([kind, label]) => (
              <option value={kind} key={kind}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Quantity</span>
          <input
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={part.quantity}
            onChange={(event) => onPatch({ quantity: event.target.value })}
          />
        </label>
      </div>

      <div className="unit-toggle" aria-label={`Units for part ${index + 1}`}>
        {(["imperial", "metric"] as const).map((unit) => (
          <button
            type="button"
            className={part.unitSystem === unit ? "active" : ""}
            aria-pressed={part.unitSystem === unit}
            key={unit}
            onClick={() => onReplace(convertDraftPartUnits(part, unit))}
          >
            <span>{unit === "imperial" ? "Imperial" : "Metric"}</span>
            <small>{unit === "imperial" ? "ft / in" : "m / cm"}</small>
          </button>
        ))}
      </div>

      <div className={styles.partFields}>
        <ShapeFields part={part} patch={onPatch} />
      </div>

      {invalid && errorMessage ? (
        <p className="calculator-error" role="alert">{errorMessage}</p>
      ) : null}
    </article>
  );
}
