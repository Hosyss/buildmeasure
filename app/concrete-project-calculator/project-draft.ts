import type {
  ConcreteProjectPart,
  ConcreteProjectPartKind,
} from "@/lib/calculators/concrete-project";
import type { UnitSystem } from "@/lib/calculators/types";
import { METERS_PER_FOOT, METERS_PER_INCH } from "@/lib/units";

export type DraftPart = {
  id: number;
  kind: ConcreteProjectPartKind;
  label: string;
  unitSystem: UnitSystem;
  quantity: string;
  length: string;
  width: string;
  depth: string;
  diameter: string;
  height: string;
  thickness: string;
  openingsArea: string;
  holeDiameter: string;
  holeDepth: string;
  postShape: "none" | "round" | "square";
  postSize: string;
};

export const KIND_LABELS: Record<ConcreteProjectPartKind, string> = {
  "rectangular-slab": "Rectangular slab",
  "circular-slab": "Circular slab / pad",
  footing: "Rectangular footing",
  "rectangular-column": "Rectangular / square column",
  "circular-column": "Circular column",
  wall: "Concrete wall",
  "post-hole": "Post holes",
};

export function createDraftPart(id: number, index: number): DraftPart {
  return {
    id,
    kind: "rectangular-slab",
    label: `Concrete part ${index + 1}`,
    unitSystem: "imperial",
    quantity: "1",
    length: "10",
    width: "10",
    depth: "4",
    diameter: "10",
    height: "8",
    thickness: "6",
    openingsArea: "0",
    holeDiameter: "12",
    holeDepth: "24",
    postShape: "none",
    postSize: "0",
  };
}

export function readNumber(value: string) {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function formatInput(value: number) {
  if (!Number.isFinite(value)) return "";
  return Number(value.toPrecision(10)).toString();
}

function convert(value: string, factor: number) {
  const parsed = readNumber(value);
  return Number.isFinite(parsed) ? formatInput(parsed * factor) : value;
}

export function convertDraftPartUnits(
  part: DraftPart,
  next: UnitSystem,
): DraftPart {
  if (part.unitSystem === next) return part;

  const toMetric = next === "metric";
  const feet = toMetric ? METERS_PER_FOOT : 1 / METERS_PER_FOOT;
  const inchesToCentimeters = toMetric
    ? METERS_PER_INCH * 100
    : 1 / (METERS_PER_INCH * 100);
  const squareFeet = toMetric
    ? METERS_PER_FOOT ** 2
    : 1 / METERS_PER_FOOT ** 2;

  const converted = { ...part, unitSystem: next };

  if (part.kind === "rectangular-slab" || part.kind === "footing") {
    converted.length = convert(part.length, feet);
    converted.width = convert(part.width, feet);
    converted.depth = convert(part.depth, inchesToCentimeters);
  } else if (part.kind === "circular-slab") {
    converted.diameter = convert(part.diameter, feet);
    converted.depth = convert(part.depth, inchesToCentimeters);
  } else if (part.kind === "rectangular-column") {
    converted.height = convert(part.height, feet);
    converted.width = convert(part.width, inchesToCentimeters);
    converted.depth = convert(part.depth, inchesToCentimeters);
  } else if (part.kind === "circular-column") {
    converted.height = convert(part.height, feet);
    converted.diameter = convert(part.diameter, inchesToCentimeters);
  } else if (part.kind === "wall") {
    converted.length = convert(part.length, feet);
    converted.height = convert(part.height, feet);
    converted.thickness = convert(part.thickness, inchesToCentimeters);
    converted.openingsArea = convert(part.openingsArea, squareFeet);
  } else {
    converted.holeDiameter = convert(part.holeDiameter, inchesToCentimeters);
    converted.holeDepth = convert(part.holeDepth, inchesToCentimeters);
    converted.postSize = convert(part.postSize, inchesToCentimeters);
  }

  return converted;
}

export function draftUnitLabel(part: DraftPart, field: string) {
  const metric = part.unitSystem === "metric";
  if (field === "openingsArea") return metric ? "m²" : "ft²";
  if (field === "height") return metric ? "m" : "ft";
  if (field === "length" || field === "width") return metric ? "m" : "ft";
  if (field === "diameter" && part.kind === "circular-slab") {
    return metric ? "m" : "ft";
  }
  return metric ? "cm" : "in";
}

export function toConcreteProjectPart(part: DraftPart): ConcreteProjectPart {
  const base = {
    label: part.label,
    unitSystem: part.unitSystem,
    quantity: readNumber(part.quantity),
  };

  switch (part.kind) {
    case "rectangular-slab":
      return { ...base, kind: part.kind, length: readNumber(part.length), width: readNumber(part.width), depth: readNumber(part.depth) };
    case "circular-slab":
      return { ...base, kind: part.kind, diameter: readNumber(part.diameter), depth: readNumber(part.depth) };
    case "footing":
      return { ...base, kind: part.kind, length: readNumber(part.length), width: readNumber(part.width), depth: readNumber(part.depth) };
    case "rectangular-column":
      return { ...base, kind: part.kind, height: readNumber(part.height), width: readNumber(part.width), depth: readNumber(part.depth) };
    case "circular-column":
      return { ...base, kind: part.kind, height: readNumber(part.height), diameter: readNumber(part.diameter) };
    case "wall":
      return { ...base, kind: part.kind, length: readNumber(part.length), height: readNumber(part.height), thickness: readNumber(part.thickness), openingsArea: readNumber(part.openingsArea) };
    case "post-hole":
      return { ...base, kind: part.kind, holeDiameter: readNumber(part.holeDiameter), holeDepth: readNumber(part.holeDepth), postShape: part.postShape, postSize: readNumber(part.postSize) };
  }
}
