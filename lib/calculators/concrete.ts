/**
 * BuildMeasure concrete volume engine.
 *
 * Formula version: 1.0.0
 * Engine version: 0.1.1
 * Last reviewed: 2026-07-31
 *
 * Unit references:
 * - NIST Handbook 44 (2026), Appendix C
 * - NIST SP 811, Appendix B
 *
 * Bag yield reference:
 * - Sakrete High-Strength Concrete Mix technical data
 */

import {
  LITERS_PER_CUBIC_METER,
  METERS_PER_FOOT,
  METERS_PER_INCH,
  METERS_PER_YARD,
} from "../units.ts";
import { ceilToSafeInteger } from "../numbers.ts";
import { isUnitSystem, type UnitSystem } from "./types.ts";
import { isFiniteInRange, isPositiveFinite } from "../validation.ts";

export {
  LITERS_PER_CUBIC_METER,
  METERS_PER_FOOT,
  METERS_PER_INCH,
  METERS_PER_YARD,
} from "../units.ts";
export type { UnitSystem } from "./types.ts";

export const CONCRETE_ENGINE_VERSION = "0.1.1";
export const CONCRETE_FORMULA_VERSION = "1.0.0";
export const CONCRETE_LAST_REVIEWED = "2026-07-31";

export const BAG_YIELDS_CUBIC_FEET = {
  40: 0.3,
  60: 0.45,
  80: 0.6,
} as const;

export type BagSize = keyof typeof BAG_YIELDS_CUBIC_FEET;

export type ConcreteInput = {
  unitSystem: UnitSystem;
  length: number;
  width: number;
  depth: number;
  wastePercent: number;
  bagSize: BagSize;
};

export type ConcreteResult = {
  unitSystem: UnitSystem;
  areaSquareMeters: number;
  areaSquareFeet: number;
  netCubicMeters: number;
  orderCubicMeters: number;
  cubicYards: number;
  cubicFeet: number;
  liters: number;
  bags: number;
  bagSize: BagSize;
  wastePercent: number;
};

export class ConcreteInputError extends Error {
  field: keyof ConcreteInput;

  constructor(field: keyof ConcreteInput, message: string) {
    super(message);
    this.name = "ConcreteInputError";
    this.field = field;
  }
}

function requirePositive(
  field: "length" | "width" | "depth",
  value: number,
) {
  if (!isPositiveFinite(value)) {
    throw new ConcreteInputError(field, "Enter a number greater than zero.");
  }
}

function validateInput(input: ConcreteInput) {
  if (!isUnitSystem(input.unitSystem)) {
    throw new ConcreteInputError(
      "unitSystem",
      "Choose Imperial or Metric units.",
    );
  }

  requirePositive("length", input.length);
  requirePositive("width", input.width);
  requirePositive("depth", input.depth);

  if (!isFiniteInRange(input.wastePercent, 0, 50)) {
    throw new ConcreteInputError(
      "wastePercent",
      "Waste allowance must be between 0% and 50%.",
    );
  }

  if (!Object.hasOwn(BAG_YIELDS_CUBIC_FEET, input.bagSize)) {
    throw new ConcreteInputError("bagSize", "Select a supported bag size.");
  }
}

export function calculateConcrete(input: ConcreteInput): ConcreteResult {
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
      : input.depth / 100;

  const areaSquareMeters = lengthMeters * widthMeters;
  const netCubicMeters = areaSquareMeters * depthMeters;
  const orderCubicMeters = netCubicMeters * (1 + input.wastePercent / 100);
  const cubicFeet = orderCubicMeters / METERS_PER_FOOT ** 3;
  const cubicYards = orderCubicMeters / METERS_PER_YARD ** 3;
  const areaSquareFeet = areaSquareMeters / METERS_PER_FOOT ** 2;
  const liters = orderCubicMeters * LITERS_PER_CUBIC_METER;
  const bagYield = BAG_YIELDS_CUBIC_FEET[input.bagSize];
  const bags = ceilToSafeInteger(cubicFeet / bagYield);

  if (
    ![
      lengthMeters,
      widthMeters,
      depthMeters,
      areaSquareMeters,
      areaSquareFeet,
      netCubicMeters,
      orderCubicMeters,
      cubicYards,
      cubicFeet,
      liters,
    ].every(isPositiveFinite) ||
    bags === null ||
    bags < 1
  ) {
    throw new ConcreteInputError(
      "length",
      "These values are outside the calculator's safe numeric range.",
    );
  }

  return {
    unitSystem: input.unitSystem,
    areaSquareMeters,
    areaSquareFeet,
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
