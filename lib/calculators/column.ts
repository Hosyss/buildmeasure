/**
 * BuildNumbers column concrete quantity engine.
 *
 * Formula version: 1.0.0
 * Engine version: 0.1.0
 * Last reviewed: 2026-08-28
 *
 * Unit references:
 * - NIST SP 811, Appendix B
 *
 * Bag-yield reference:
 * - Reuses the verified BuildNumbers concrete bag-yield constants sourced from
 *   Sakrete High-Strength Concrete Mix technical data.
 */

import {
  LITERS_PER_CUBIC_METER,
  METERS_PER_FOOT,
  METERS_PER_INCH,
  METERS_PER_YARD,
} from "../units.ts";
import { ceilToSafeInteger } from "../numbers.ts";
import {
  isFiniteInRange,
  isPositiveFinite,
  isWholeNumberInRange,
} from "../validation.ts";
import { BAG_YIELDS_CUBIC_FEET, type BagSize } from "./concrete.ts";
import { isUnitSystem, type UnitSystem } from "./types.ts";

export const COLUMN_ENGINE_VERSION = "0.1.0";
export const COLUMN_FORMULA_VERSION = "1.0.0";
export const COLUMN_LAST_REVIEWED = "2026-08-28";
export const MAX_COLUMN_QUANTITY = 100_000;

export type ColumnShape = "rectangular" | "circular";

export type ColumnInput = {
  unitSystem: UnitSystem;
  shape: ColumnShape;
  height: number;
  width: number;
  depth: number;
  diameter: number;
  quantity: number;
  wastePercent: number;
  bagSize: BagSize;
};

export type ColumnResult = {
  unitSystem: UnitSystem;
  shape: ColumnShape;
  quantity: number;
  crossSectionSquareMeters: number;
  crossSectionSquareFeet: number;
  perColumnCubicMeters: number;
  perColumnCubicFeet: number;
  netCubicMeters: number;
  orderCubicMeters: number;
  cubicYards: number;
  cubicFeet: number;
  liters: number;
  bags: number;
  bagSize: BagSize;
  wastePercent: number;
};

export class ColumnInputError extends Error {
  field: keyof ColumnInput;

  constructor(field: keyof ColumnInput, message: string) {
    super(message);
    this.name = "ColumnInputError";
    this.field = field;
  }
}

function requirePositive(field: keyof ColumnInput, value: number) {
  if (!isPositiveFinite(value)) {
    throw new ColumnInputError(field, "Enter a number greater than zero.");
  }
}

function isColumnShape(value: unknown): value is ColumnShape {
  return value === "rectangular" || value === "circular";
}

function validateInput(input: ColumnInput) {
  if (!isUnitSystem(input.unitSystem)) {
    throw new ColumnInputError("unitSystem", "Choose Imperial or Metric units.");
  }
  if (!isColumnShape(input.shape)) {
    throw new ColumnInputError("shape", "Choose a rectangular or circular column.");
  }

  requirePositive("height", input.height);
  if (input.shape === "rectangular") {
    requirePositive("width", input.width);
    requirePositive("depth", input.depth);
  } else {
    requirePositive("diameter", input.diameter);
  }

  if (!isWholeNumberInRange(input.quantity, 1, MAX_COLUMN_QUANTITY)) {
    throw new ColumnInputError(
      "quantity",
      `Quantity must be a whole number from 1 to ${MAX_COLUMN_QUANTITY.toLocaleString("en-US")}.`,
    );
  }

  if (!isFiniteInRange(input.wastePercent, 0, 50)) {
    throw new ColumnInputError(
      "wastePercent",
      "Extra allowance must be between 0% and 50%.",
    );
  }

  if (!Object.hasOwn(BAG_YIELDS_CUBIC_FEET, input.bagSize)) {
    throw new ColumnInputError("bagSize", "Select a supported bag size.");
  }
}

export function calculateColumnConcrete(input: ColumnInput): ColumnResult {
  validateInput(input);

  const heightMeters =
    input.unitSystem === "imperial" ? input.height * METERS_PER_FOOT : input.height;
  const sectionScale = input.unitSystem === "imperial" ? METERS_PER_INCH : 0.01;

  const crossSectionSquareMeters =
    input.shape === "rectangular"
      ? input.width * sectionScale * (input.depth * sectionScale)
      : Math.PI * (input.diameter * sectionScale / 2) ** 2;

  const perColumnCubicMeters = crossSectionSquareMeters * heightMeters;
  const netCubicMeters = perColumnCubicMeters * input.quantity;
  const orderCubicMeters = netCubicMeters * (1 + input.wastePercent / 100);
  const crossSectionSquareFeet = crossSectionSquareMeters / METERS_PER_FOOT ** 2;
  const perColumnCubicFeet = perColumnCubicMeters / METERS_PER_FOOT ** 3;
  const cubicFeet = orderCubicMeters / METERS_PER_FOOT ** 3;
  const cubicYards = orderCubicMeters / METERS_PER_YARD ** 3;
  const liters = orderCubicMeters * LITERS_PER_CUBIC_METER;
  const bags = ceilToSafeInteger(cubicFeet / BAG_YIELDS_CUBIC_FEET[input.bagSize]);

  if (
    ![
      heightMeters,
      crossSectionSquareMeters,
      crossSectionSquareFeet,
      perColumnCubicMeters,
      perColumnCubicFeet,
      netCubicMeters,
      orderCubicMeters,
      cubicFeet,
      cubicYards,
      liters,
    ].every(isPositiveFinite) ||
    bags === null ||
    bags < 1
  ) {
    throw new ColumnInputError(
      "height",
      "These values are outside the calculator's safe numeric range.",
    );
  }

  return {
    unitSystem: input.unitSystem,
    shape: input.shape,
    quantity: input.quantity,
    crossSectionSquareMeters,
    crossSectionSquareFeet,
    perColumnCubicMeters,
    perColumnCubicFeet,
    netCubicMeters,
    orderCubicMeters,
    cubicYards,
    cubicFeet,
    liters,
    bags,
    bagSize: input.bagSize,
    wastePercent: input.wastePercent,
  };
}
