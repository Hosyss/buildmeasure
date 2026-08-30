/**
 * BuildNumbers circular slab concrete quantity engine.
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

export const CIRCULAR_SLAB_ENGINE_VERSION = "0.1.0";
export const CIRCULAR_SLAB_FORMULA_VERSION = "1.0.0";
export const CIRCULAR_SLAB_LAST_REVIEWED = "2026-08-28";
export const MAX_CIRCULAR_SLAB_QUANTITY = 100_000;

export type CircularSlabInput = {
  unitSystem: UnitSystem;
  diameter: number;
  depth: number;
  quantity: number;
  wastePercent: number;
  bagSize: BagSize;
};

export type CircularSlabResult = {
  unitSystem: UnitSystem;
  quantity: number;
  areaSquareMeters: number;
  areaSquareFeet: number;
  perSlabCubicMeters: number;
  perSlabCubicFeet: number;
  netCubicMeters: number;
  orderCubicMeters: number;
  cubicYards: number;
  cubicFeet: number;
  liters: number;
  bags: number;
  bagSize: BagSize;
  wastePercent: number;
};

export class CircularSlabInputError extends Error {
  field: keyof CircularSlabInput;

  constructor(field: keyof CircularSlabInput, message: string) {
    super(message);
    this.name = "CircularSlabInputError";
    this.field = field;
  }
}

function requirePositive(field: keyof CircularSlabInput, value: number) {
  if (!isPositiveFinite(value)) {
    throw new CircularSlabInputError(field, "Enter a number greater than zero.");
  }
}

function validateInput(input: CircularSlabInput) {
  if (!isUnitSystem(input.unitSystem)) {
    throw new CircularSlabInputError("unitSystem", "Choose Imperial or Metric units.");
  }

  requirePositive("diameter", input.diameter);
  requirePositive("depth", input.depth);

  if (!isWholeNumberInRange(input.quantity, 1, MAX_CIRCULAR_SLAB_QUANTITY)) {
    throw new CircularSlabInputError(
      "quantity",
      `Quantity must be a whole number from 1 to ${MAX_CIRCULAR_SLAB_QUANTITY.toLocaleString("en-US")}.`,
    );
  }

  if (!isFiniteInRange(input.wastePercent, 0, 50)) {
    throw new CircularSlabInputError(
      "wastePercent",
      "Extra allowance must be between 0% and 50%.",
    );
  }

  if (!Object.hasOwn(BAG_YIELDS_CUBIC_FEET, input.bagSize)) {
    throw new CircularSlabInputError("bagSize", "Select a supported bag size.");
  }
}

export function calculateCircularSlabConcrete(
  input: CircularSlabInput,
): CircularSlabResult {
  validateInput(input);

  const diameterMeters =
    input.unitSystem === "imperial" ? input.diameter * METERS_PER_FOOT : input.diameter;
  const depthMeters =
    input.unitSystem === "imperial" ? input.depth * METERS_PER_INCH : input.depth * 0.01;
  const radiusMeters = diameterMeters / 2;
  const areaSquareMeters = Math.PI * radiusMeters ** 2;
  const perSlabCubicMeters = areaSquareMeters * depthMeters;
  const netCubicMeters = perSlabCubicMeters * input.quantity;
  const orderCubicMeters = netCubicMeters * (1 + input.wastePercent / 100);
  const areaSquareFeet = areaSquareMeters / METERS_PER_FOOT ** 2;
  const perSlabCubicFeet = perSlabCubicMeters / METERS_PER_FOOT ** 3;
  const cubicFeet = orderCubicMeters / METERS_PER_FOOT ** 3;
  const cubicYards = orderCubicMeters / METERS_PER_YARD ** 3;
  const liters = orderCubicMeters * LITERS_PER_CUBIC_METER;
  const bags = ceilToSafeInteger(cubicFeet / BAG_YIELDS_CUBIC_FEET[input.bagSize]);

  if (
    ![
      diameterMeters,
      depthMeters,
      radiusMeters,
      areaSquareMeters,
      areaSquareFeet,
      perSlabCubicMeters,
      perSlabCubicFeet,
      netCubicMeters,
      orderCubicMeters,
      cubicFeet,
      cubicYards,
      liters,
    ].every(isPositiveFinite) ||
    bags === null ||
    bags < 1
  ) {
    throw new CircularSlabInputError(
      "diameter",
      "These values are outside the calculator's safe numeric range.",
    );
  }

  return {
    unitSystem: input.unitSystem,
    quantity: input.quantity,
    areaSquareMeters,
    areaSquareFeet,
    perSlabCubicMeters,
    perSlabCubicFeet,
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
