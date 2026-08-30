/**
 * BuildNumbers multi-shape concrete project engine.
 *
 * Formula version: 1.0.0
 * Engine version: 0.1.0
 * Last reviewed: 2026-08-28
 *
 * The project engine deliberately reuses the verified geometry engines for each
 * supported shape with zero local allowance. It then sums unrounded net volumes,
 * applies one project-level allowance, and rounds the final bag quantity once.
 */

import { ceilToSafeInteger } from "../numbers.ts";
import {
  LITERS_PER_CUBIC_METER,
  METERS_PER_FOOT,
  METERS_PER_YARD,
} from "../units.ts";
import {
  isFiniteInRange,
  isPositiveFinite,
  isWholeNumberInRange,
} from "../validation.ts";
import {
  BAG_YIELDS_CUBIC_FEET,
  calculateConcrete,
  type BagSize,
} from "./concrete.ts";
import { calculateCircularSlabConcrete } from "./circular-slab.ts";
import { calculateFootingConcrete } from "./footing.ts";
import { calculateColumnConcrete } from "./column.ts";
import { calculateWallConcrete } from "./wall.ts";
import {
  calculatePostHoleConcrete,
  type PostShape,
} from "./post-hole-concrete.ts";
import type { UnitSystem } from "./types.ts";

export const CONCRETE_PROJECT_ENGINE_VERSION = "0.1.0";
export const CONCRETE_PROJECT_FORMULA_VERSION = "1.0.0";
export const CONCRETE_PROJECT_LAST_REVIEWED = "2026-08-28";
export const MAX_CONCRETE_PROJECT_PARTS = 100;
export const MAX_CONCRETE_PROJECT_PART_QUANTITY = 100_000;
export const MAX_CONCRETE_PROJECT_LABEL_LENGTH = 80;

export type ConcreteProjectPartKind =
  | "rectangular-slab"
  | "circular-slab"
  | "footing"
  | "rectangular-column"
  | "circular-column"
  | "wall"
  | "post-hole";

type ProjectPartBase = {
  kind: ConcreteProjectPartKind;
  label: string;
  unitSystem: UnitSystem;
  quantity: number;
};

export type RectangularSlabProjectPart = ProjectPartBase & {
  kind: "rectangular-slab";
  length: number;
  width: number;
  depth: number;
};

export type CircularSlabProjectPart = ProjectPartBase & {
  kind: "circular-slab";
  diameter: number;
  depth: number;
};

export type FootingProjectPart = ProjectPartBase & {
  kind: "footing";
  length: number;
  width: number;
  depth: number;
};

export type RectangularColumnProjectPart = ProjectPartBase & {
  kind: "rectangular-column";
  height: number;
  width: number;
  depth: number;
};

export type CircularColumnProjectPart = ProjectPartBase & {
  kind: "circular-column";
  height: number;
  diameter: number;
};

export type WallProjectPart = ProjectPartBase & {
  kind: "wall";
  length: number;
  height: number;
  thickness: number;
  openingsArea: number;
};

export type PostHoleProjectPart = ProjectPartBase & {
  kind: "post-hole";
  holeDiameter: number;
  holeDepth: number;
  postShape: PostShape;
  postSize: number;
};

export type ConcreteProjectPart =
  | RectangularSlabProjectPart
  | CircularSlabProjectPart
  | FootingProjectPart
  | RectangularColumnProjectPart
  | CircularColumnProjectPart
  | WallProjectPart
  | PostHoleProjectPart;

export type ConcreteProjectInput = {
  parts: ConcreteProjectPart[];
  wastePercent: number;
  bagSize: BagSize;
};

export type ConcreteProjectPartResult = {
  kind: ConcreteProjectPartKind;
  label: string;
  quantity: number;
  netCubicMeters: number;
  netCubicFeet: number;
  sharePercent: number;
};

export type ConcreteProjectResult = {
  partCount: number;
  parts: ConcreteProjectPartResult[];
  netCubicMeters: number;
  orderCubicMeters: number;
  cubicFeet: number;
  cubicYards: number;
  liters: number;
  bags: number;
  bagSize: BagSize;
  wastePercent: number;
};

export class ConcreteProjectInputError extends Error {
  field: "parts" | "wastePercent" | "bagSize";
  partIndex?: number;
  partField?: string;

  constructor(
    field: "parts" | "wastePercent" | "bagSize",
    message: string,
    partIndex?: number,
    partField?: string,
  ) {
    super(message);
    this.name = "ConcreteProjectInputError";
    this.field = field;
    this.partIndex = partIndex;
    this.partField = partField;
  }
}

function validateProject(input: ConcreteProjectInput) {
  if (!Array.isArray(input.parts) || input.parts.length < 1) {
    throw new ConcreteProjectInputError("parts", "Add at least one concrete part.");
  }
  if (input.parts.length > MAX_CONCRETE_PROJECT_PARTS) {
    throw new ConcreteProjectInputError(
      "parts",
      `A project can contain up to ${MAX_CONCRETE_PROJECT_PARTS} parts.`,
    );
  }
  if (!isFiniteInRange(input.wastePercent, 0, 50)) {
    throw new ConcreteProjectInputError(
      "wastePercent",
      "Project allowance must be between 0% and 50%.",
    );
  }
  if (!Object.hasOwn(BAG_YIELDS_CUBIC_FEET, input.bagSize)) {
    throw new ConcreteProjectInputError("bagSize", "Select a supported bag size.");
  }
}

function validatePartBase(part: ConcreteProjectPart, index: number) {
  const label = typeof part.label === "string" ? part.label.trim() : "";
  if (
    !label ||
    label.length > MAX_CONCRETE_PROJECT_LABEL_LENGTH ||
    /[\r\n\t]/.test(part.label)
  ) {
    throw new ConcreteProjectInputError(
      "parts",
      `Part ${index + 1} needs a single-line label up to ${MAX_CONCRETE_PROJECT_LABEL_LENGTH} characters.`,
      index,
      "label",
    );
  }
  if (
    !isWholeNumberInRange(
      part.quantity,
      1,
      MAX_CONCRETE_PROJECT_PART_QUANTITY,
    )
  ) {
    throw new ConcreteProjectInputError(
      "parts",
      `Part ${index + 1} quantity must be a whole number from 1 to ${MAX_CONCRETE_PROJECT_PART_QUANTITY.toLocaleString("en-US")}.`,
      index,
      "quantity",
    );
  }
}

function calculatePartNetCubicMeters(
  part: ConcreteProjectPart,
  index: number,
) {
  validatePartBase(part, index);

  try {
    switch (part.kind) {
      case "rectangular-slab": {
        const single = calculateConcrete({
          unitSystem: part.unitSystem,
          length: part.length,
          width: part.width,
          depth: part.depth,
          wastePercent: 0,
          bagSize: 80,
        });
        return single.netCubicMeters * part.quantity;
      }
      case "circular-slab":
        return calculateCircularSlabConcrete({
          unitSystem: part.unitSystem,
          diameter: part.diameter,
          depth: part.depth,
          quantity: part.quantity,
          wastePercent: 0,
          bagSize: 80,
        }).netCubicMeters;
      case "footing":
        return calculateFootingConcrete({
          unitSystem: part.unitSystem,
          footingLength: part.length,
          footingWidth: part.width,
          footingDepth: part.depth,
          quantity: part.quantity,
          wastePercent: 0,
          bagSize: 80,
        }).netCubicMeters;
      case "rectangular-column":
        return calculateColumnConcrete({
          unitSystem: part.unitSystem,
          shape: "rectangular",
          height: part.height,
          width: part.width,
          depth: part.depth,
          diameter: 0,
          quantity: part.quantity,
          wastePercent: 0,
          bagSize: 80,
        }).netCubicMeters;
      case "circular-column":
        return calculateColumnConcrete({
          unitSystem: part.unitSystem,
          shape: "circular",
          height: part.height,
          width: 0,
          depth: 0,
          diameter: part.diameter,
          quantity: part.quantity,
          wastePercent: 0,
          bagSize: 80,
        }).netCubicMeters;
      case "wall":
        return calculateWallConcrete({
          unitSystem: part.unitSystem,
          length: part.length,
          height: part.height,
          thickness: part.thickness,
          openingsArea: part.openingsArea,
          quantity: part.quantity,
          wastePercent: 0,
          bagSize: 80,
        }).netCubicMeters;
      case "post-hole":
        return calculatePostHoleConcrete({
          unitSystem: part.unitSystem,
          holeCount: part.quantity,
          holeDiameter: part.holeDiameter,
          holeDepth: part.holeDepth,
          postShape: part.postShape,
          postSize: part.postSize,
          wastePercent: 0,
          bagSize: 80,
        }).totalNetCubicMeters;
      default: {
        const unreachable: never = part;
        throw new Error(`Unsupported concrete part: ${String(unreachable)}`);
      }
    }
  } catch (error) {
    if (error instanceof ConcreteProjectInputError) throw error;
    const partField =
      error && typeof error === "object" && "field" in error
        ? String((error as { field?: unknown }).field ?? "")
        : "";
    const message = error instanceof Error ? error.message : "Invalid concrete part.";
    throw new ConcreteProjectInputError(
      "parts",
      `Part ${index + 1} (${part.label.trim()}): ${message}`,
      index,
      partField || undefined,
    );
  }
}

export function calculateConcreteProject(
  input: ConcreteProjectInput,
): ConcreteProjectResult {
  validateProject(input);

  const rawParts = input.parts.map((part, index) => {
    const netCubicMeters = calculatePartNetCubicMeters(part, index);
    if (!isPositiveFinite(netCubicMeters)) {
      throw new ConcreteProjectInputError(
        "parts",
        `Part ${index + 1} is outside the calculator's safe numeric range.`,
        index,
      );
    }
    return {
      kind: part.kind,
      label: part.label.trim(),
      quantity: part.quantity,
      netCubicMeters,
      netCubicFeet: netCubicMeters / METERS_PER_FOOT ** 3,
    };
  });

  const netCubicMeters = rawParts.reduce((total, part) => {
    const next = total + part.netCubicMeters;
    if (!Number.isFinite(next) || next > Number.MAX_SAFE_INTEGER) {
      throw new ConcreteProjectInputError(
        "parts",
        "Combined concrete volume exceeds the safe numeric range.",
      );
    }
    return next;
  }, 0);

  if (!isPositiveFinite(netCubicMeters)) {
    throw new ConcreteProjectInputError(
      "parts",
      "Combined concrete volume must be greater than zero.",
    );
  }

  const orderCubicMeters = netCubicMeters * (1 + input.wastePercent / 100);
  const cubicFeet = orderCubicMeters / METERS_PER_FOOT ** 3;
  const cubicYards = orderCubicMeters / METERS_PER_YARD ** 3;
  const liters = orderCubicMeters * LITERS_PER_CUBIC_METER;
  const bags = ceilToSafeInteger(
    cubicFeet / BAG_YIELDS_CUBIC_FEET[input.bagSize],
  );

  if (
    ![orderCubicMeters, cubicFeet, cubicYards, liters].every(isPositiveFinite) ||
    bags === null ||
    bags < 1
  ) {
    throw new ConcreteProjectInputError(
      "parts",
      "Combined project values exceed the calculator's safe numeric range.",
    );
  }

  const parts: ConcreteProjectPartResult[] = rawParts.map((part) => ({
    ...part,
    sharePercent: (part.netCubicMeters / netCubicMeters) * 100,
  }));

  return {
    partCount: parts.length,
    parts,
    netCubicMeters,
    orderCubicMeters,
    cubicFeet,
    cubicYards,
    liters,
    bags,
    bagSize: input.bagSize,
    wastePercent: input.wastePercent,
  };
}
