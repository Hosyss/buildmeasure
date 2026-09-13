/**
 * BuildNumbers rectangular-footing concrete quantity engine.
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
import {
  BAG_YIELDS_CUBIC_FEET,
  type BagSize,
} from "./concrete.ts";
import { isUnitSystem, type UnitSystem } from "./types.ts";

export const FOOTING_ENGINE_VERSION = "0.1.0";
export const FOOTING_FORMULA_VERSION = "1.0.0";
export const FOOTING_LAST_REVIEWED = "2026-08-28";
export const MAX_FOOTING_QUANTITY = 100_000;

export type FootingInput = {
  unitSystem: UnitSystem;
  footingLength: number;
  footingWidth: number;
  footingDepth: number;
  quantity: number;
  wastePercent: number;
  bagSize: BagSize;
};

export type FootingResult = {
  unitSystem: UnitSystem;
  quantity: number;
  perFootingCubicMeters: number;
  perFootingCubicFeet: number;
  netCubicMeters: number;
  orderCubicMeters: number;
  cubicYards: number;
  cubicFeet: number;
  liters: number;
  bags: number;
  bagSize: BagSize;
  wastePercent: number;
};

export class FootingInputError extends Error {
  field: keyof FootingInput;

  constructor(field: keyof FootingInput, message: string) {
    super(message);
    this.name = "FootingInputError";
    this.field = field;
  }
}

function requirePositive(
  field: "footingLength" | "footingWidth" | "footingDepth",
  value: number,
) {
  if (!isPositiveFinite(value)) {
    throw new FootingInputError(field, "Enter a number greater than zero.");
  }
}

function validateInput(input: FootingInput) {
  if (!isUnitSystem(input.unitSystem)) {
    throw new FootingInputError(
      "unitSystem",
      "Choose Imperial or Metric units.",
    );
  }

  requirePositive("footingLength", input.footingLength);
  requirePositive("footingWidth", input.footingWidth);
  requirePositive("footingDepth", input.footingDepth);

  if (!isWholeNumberInRange(input.quantity, 1, MAX_FOOTING_QUANTITY)) {
    throw new FootingInputError(
      "quantity",
      `Quantity must be a whole number from 1 to ${MAX_FOOTING_QUANTITY.toLocaleString("en-US")}.`,
    );
  }

  if (!isFiniteInRange(input.wastePercent, 0, 50)) {
    throw new FootingInputError(
      "wastePercent",
      "Extra allowance must be between 0% and 50%.",
    );
  }

  if (!Object.hasOwn(BAG_YIELDS_CUBIC_FEET, input.bagSize)) {
    throw new FootingInputError("bagSize", "Select a supported bag size.");
  }
}

export function calculateFootingConcrete(input: FootingInput): FootingResult {
  validateInput(input);

  const lengthMeters =
    input.unitSystem === "imperial"
      ? input.footingLength * METERS_PER_FOOT
      : input.footingLength;
  const widthMeters =
    input.unitSystem === "imperial"
      ? input.footingWidth * METERS_PER_FOOT
      : input.footingWidth;
  const depthMeters =
    input.unitSystem === "imperial"
      ? input.footingDepth * METERS_PER_INCH
      : input.footingDepth / 100;

  const perFootingCubicMeters = lengthMeters * widthMeters * depthMeters;
  const netCubicMeters = perFootingCubicMeters * input.quantity;
  const orderCubicMeters = netCubicMeters * (1 + input.wastePercent / 100);
  const perFootingCubicFeet = perFootingCubicMeters / METERS_PER_FOOT ** 3;
  const cubicFeet = orderCubicMeters / METERS_PER_FOOT ** 3;
  const cubicYards = orderCubicMeters / METERS_PER_YARD ** 3;
  const liters = orderCubicMeters * LITERS_PER_CUBIC_METER;
  const bags = ceilToSafeInteger(
    cubicFeet / BAG_YIELDS_CUBIC_FEET[input.bagSize],
  );

  if (
    ![
      lengthMeters,
      widthMeters,
      depthMeters,
      perFootingCubicMeters,
      perFootingCubicFeet,
      netCubicMeters,
      orderCubicMeters,
      cubicFeet,
      cubicYards,
      liters,
    ].every(isPositiveFinite) ||
    bags === null ||
    bags < 1
  ) {
    throw new FootingInputError(
      "footingLength",
      "These values are outside the calculator's safe numeric range.",
    );
  }

  return {
    unitSystem: input.unitSystem,
    quantity: input.quantity,
    perFootingCubicMeters,
    perFootingCubicFeet,
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
