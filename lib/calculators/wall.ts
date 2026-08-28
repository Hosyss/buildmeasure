/**
 * BuildNumbers rectangular concrete wall quantity engine.
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

export const WALL_ENGINE_VERSION = "0.1.0";
export const WALL_FORMULA_VERSION = "1.0.0";
export const WALL_LAST_REVIEWED = "2026-08-28";
export const MAX_WALL_QUANTITY = 100_000;

export type WallInput = {
  unitSystem: UnitSystem;
  length: number;
  height: number;
  thickness: number;
  openingsArea: number;
  quantity: number;
  wastePercent: number;
  bagSize: BagSize;
};

export type WallResult = {
  unitSystem: UnitSystem;
  quantity: number;
  grossFaceAreaSquareMetersPerWall: number;
  openingsAreaSquareMetersPerWall: number;
  netFaceAreaSquareMetersPerWall: number;
  netFaceAreaSquareFeetPerWall: number;
  perWallCubicMeters: number;
  perWallCubicFeet: number;
  netCubicMeters: number;
  orderCubicMeters: number;
  cubicYards: number;
  cubicFeet: number;
  liters: number;
  bags: number;
  bagSize: BagSize;
  wastePercent: number;
};

export class WallInputError extends Error {
  field: keyof WallInput;

  constructor(field: keyof WallInput, message: string) {
    super(message);
    this.name = "WallInputError";
    this.field = field;
  }
}

function requirePositive(field: keyof WallInput, value: number) {
  if (!isPositiveFinite(value)) {
    throw new WallInputError(field, "Enter a number greater than zero.");
  }
}

function validateInput(input: WallInput) {
  if (!isUnitSystem(input.unitSystem)) {
    throw new WallInputError("unitSystem", "Choose Imperial or Metric units.");
  }

  requirePositive("length", input.length);
  requirePositive("height", input.height);
  requirePositive("thickness", input.thickness);

  if (!isFiniteInRange(input.openingsArea, 0, Number.MAX_VALUE)) {
    throw new WallInputError("openingsArea", "Opening area cannot be negative.");
  }

  if (!isWholeNumberInRange(input.quantity, 1, MAX_WALL_QUANTITY)) {
    throw new WallInputError(
      "quantity",
      `Quantity must be a whole number from 1 to ${MAX_WALL_QUANTITY.toLocaleString("en-US")}.`,
    );
  }

  if (!isFiniteInRange(input.wastePercent, 0, 50)) {
    throw new WallInputError(
      "wastePercent",
      "Extra allowance must be between 0% and 50%.",
    );
  }

  if (!Object.hasOwn(BAG_YIELDS_CUBIC_FEET, input.bagSize)) {
    throw new WallInputError("bagSize", "Select a supported bag size.");
  }
}

export function calculateWallConcrete(input: WallInput): WallResult {
  validateInput(input);

  const lengthMeters =
    input.unitSystem === "imperial" ? input.length * METERS_PER_FOOT : input.length;
  const heightMeters =
    input.unitSystem === "imperial" ? input.height * METERS_PER_FOOT : input.height;
  const thicknessMeters =
    input.unitSystem === "imperial" ? input.thickness * METERS_PER_INCH : input.thickness * 0.01;
  const openingsAreaSquareMetersPerWall =
    input.unitSystem === "imperial"
      ? input.openingsArea * METERS_PER_FOOT ** 2
      : input.openingsArea;

  const grossFaceAreaSquareMetersPerWall = lengthMeters * heightMeters;
  const netFaceAreaSquareMetersPerWall =
    grossFaceAreaSquareMetersPerWall - openingsAreaSquareMetersPerWall;

  if (!isPositiveFinite(netFaceAreaSquareMetersPerWall)) {
    throw new WallInputError(
      "openingsArea",
      "Opening area must be smaller than the wall face area.",
    );
  }

  const perWallCubicMeters = netFaceAreaSquareMetersPerWall * thicknessMeters;
  const netCubicMeters = perWallCubicMeters * input.quantity;
  const orderCubicMeters = netCubicMeters * (1 + input.wastePercent / 100);
  const netFaceAreaSquareFeetPerWall =
    netFaceAreaSquareMetersPerWall / METERS_PER_FOOT ** 2;
  const perWallCubicFeet = perWallCubicMeters / METERS_PER_FOOT ** 3;
  const cubicFeet = orderCubicMeters / METERS_PER_FOOT ** 3;
  const cubicYards = orderCubicMeters / METERS_PER_YARD ** 3;
  const liters = orderCubicMeters * LITERS_PER_CUBIC_METER;
  const bags = ceilToSafeInteger(cubicFeet / BAG_YIELDS_CUBIC_FEET[input.bagSize]);

  if (
    ![
      lengthMeters,
      heightMeters,
      thicknessMeters,
      grossFaceAreaSquareMetersPerWall,
      netFaceAreaSquareMetersPerWall,
      netFaceAreaSquareFeetPerWall,
      perWallCubicMeters,
      perWallCubicFeet,
      netCubicMeters,
      orderCubicMeters,
      cubicFeet,
      cubicYards,
      liters,
    ].every(isPositiveFinite) ||
    !Number.isFinite(openingsAreaSquareMetersPerWall) ||
    openingsAreaSquareMetersPerWall < 0 ||
    bags === null ||
    bags < 1
  ) {
    throw new WallInputError(
      "length",
      "These values are outside the calculator's safe numeric range.",
    );
  }

  return {
    unitSystem: input.unitSystem,
    quantity: input.quantity,
    grossFaceAreaSquareMetersPerWall,
    openingsAreaSquareMetersPerWall,
    netFaceAreaSquareMetersPerWall,
    netFaceAreaSquareFeetPerWall,
    perWallCubicMeters,
    perWallCubicFeet,
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
