/**
 * JobsiteQuant rectangular mulch-layer engine.
 *
 * Formula version: 1.0.0
 * Engine version: 0.1.0
 * Last reviewed: 2026-08-01
 *
 * Method reference:
 * - The rectangular-layer volume is length × width × installed depth.
 * - U.S. EPA WaterSense guidance describes 3–4 in as suitable coverage for
 *   most plants. That guidance informs the example only and is not imposed by
 *   the engine.
 *
 * Unit reference:
 * - NIST Handbook 44 (2026), Appendix C
 */

import {
  CUBIC_METERS_PER_CUBIC_FOOT,
  CUBIC_METERS_PER_CUBIC_YARD,
  LITERS_PER_CUBIC_METER,
  METERS_PER_CENTIMETER,
  METERS_PER_FOOT,
  METERS_PER_INCH,
  SQUARE_METERS_PER_SQUARE_FOOT,
} from "../units.ts";
import { ceilToSafeInteger } from "../numbers.ts";
import { isFiniteInRange, isPositiveFinite } from "../validation.ts";
import { isUnitSystem, type UnitSystem } from "./types.ts";

export const MULCH_ENGINE_VERSION = "0.1.0";
export const MULCH_FORMULA_VERSION = "1.0.0";
export const MULCH_LAST_REVIEWED = "2026-08-01";

export type MulchInput = {
  unitSystem: UnitSystem;
  length: number;
  width: number;
  depth: number;
  wastePercent: number;
  bagVolume: number;
};

export type MulchResult = {
  unitSystem: UnitSystem;
  areaSquareMeters: number;
  areaSquareFeet: number;
  netCubicMeters: number;
  netCubicFeet: number;
  netCubicYards: number;
  netLiters: number;
  orderCubicMeters: number;
  orderCubicFeet: number;
  orderCubicYards: number;
  orderLiters: number;
  bagVolumeCubicMeters: number;
  bagVolumeCubicFeet: number;
  bagVolumeLiters: number;
  coveragePerBagSquareMeters: number;
  coveragePerBagSquareFeet: number;
  bags: number;
  wastePercent: number;
};

export class MulchInputError extends Error {
  field: keyof MulchInput;

  constructor(field: keyof MulchInput, message: string) {
    super(message);
    this.name = "MulchInputError";
    this.field = field;
  }
}

function requirePositive(
  field: "length" | "width" | "depth" | "bagVolume",
  value: number,
) {
  if (!isPositiveFinite(value)) {
    throw new MulchInputError(field, "Enter a number greater than zero.");
  }
}

function validateInput(input: MulchInput) {
  if (!isUnitSystem(input.unitSystem)) {
    throw new MulchInputError(
      "unitSystem",
      "Choose Imperial or Metric units.",
    );
  }

  requirePositive("length", input.length);
  requirePositive("width", input.width);
  requirePositive("depth", input.depth);
  requirePositive("bagVolume", input.bagVolume);

  if (!isFiniteInRange(input.wastePercent, 0, 50)) {
    throw new MulchInputError(
      "wastePercent",
      "Allowance must be between 0% and 50%.",
    );
  }
}

export function calculateMulch(input: MulchInput): MulchResult {
  validateInput(input);

  const lengthMeters =
    input.unitSystem === "imperial"
      ? input.length * METERS_PER_FOOT
      : input.length;
  const widthMeters =
    input.unitSystem === "imperial"
      ? input.width * METERS_PER_FOOT
      : input.width;
  const depthMeters =
    input.unitSystem === "imperial"
      ? input.depth * METERS_PER_INCH
      : input.depth * METERS_PER_CENTIMETER;
  const bagVolumeCubicMeters =
    input.unitSystem === "imperial"
      ? input.bagVolume * CUBIC_METERS_PER_CUBIC_FOOT
      : input.bagVolume / LITERS_PER_CUBIC_METER;

  if (![lengthMeters, widthMeters, depthMeters].every(isPositiveFinite)) {
    throw new MulchInputError(
      "length",
      "These dimensions are outside the calculator's safe numeric range.",
    );
  }

  if (!isPositiveFinite(bagVolumeCubicMeters)) {
    throw new MulchInputError(
      "bagVolume",
      "Bag volume is outside the calculator's safe numeric range.",
    );
  }

  const areaSquareMeters = lengthMeters * widthMeters;
  const netCubicMeters = areaSquareMeters * depthMeters;
  const orderCubicMeters =
    netCubicMeters * (1 + input.wastePercent / 100);
  const coveragePerBagSquareMeters = bagVolumeCubicMeters / depthMeters;
  const bags = ceilToSafeInteger(orderCubicMeters / bagVolumeCubicMeters);

  const areaSquareFeet =
    areaSquareMeters / SQUARE_METERS_PER_SQUARE_FOOT;
  const netCubicFeet =
    netCubicMeters / CUBIC_METERS_PER_CUBIC_FOOT;
  const netCubicYards =
    netCubicMeters / CUBIC_METERS_PER_CUBIC_YARD;
  const netLiters = netCubicMeters * LITERS_PER_CUBIC_METER;
  const orderCubicFeet =
    orderCubicMeters / CUBIC_METERS_PER_CUBIC_FOOT;
  const orderCubicYards =
    orderCubicMeters / CUBIC_METERS_PER_CUBIC_YARD;
  const orderLiters = orderCubicMeters * LITERS_PER_CUBIC_METER;
  const bagVolumeCubicFeet =
    bagVolumeCubicMeters / CUBIC_METERS_PER_CUBIC_FOOT;
  const bagVolumeLiters =
    bagVolumeCubicMeters * LITERS_PER_CUBIC_METER;
  const coveragePerBagSquareFeet =
    coveragePerBagSquareMeters / SQUARE_METERS_PER_SQUARE_FOOT;

  if (
    ![
      areaSquareMeters,
      areaSquareFeet,
      netCubicMeters,
      netCubicFeet,
      netCubicYards,
      netLiters,
      orderCubicMeters,
      orderCubicFeet,
      orderCubicYards,
      orderLiters,
      bagVolumeCubicFeet,
      bagVolumeLiters,
      coveragePerBagSquareMeters,
      coveragePerBagSquareFeet,
    ].every(isPositiveFinite) ||
    bags === null ||
    bags < 1
  ) {
    throw new MulchInputError(
      "length",
      "These values produce a result outside the calculator's safe numeric range.",
    );
  }

  return {
    unitSystem: input.unitSystem,
    areaSquareMeters,
    areaSquareFeet,
    netCubicMeters,
    netCubicFeet,
    netCubicYards,
    netLiters,
    orderCubicMeters,
    orderCubicFeet,
    orderCubicYards,
    orderLiters,
    bagVolumeCubicMeters,
    bagVolumeCubicFeet,
    bagVolumeLiters,
    coveragePerBagSquareMeters,
    coveragePerBagSquareFeet,
    bags,
    wastePercent: input.wastePercent,
  };
}
