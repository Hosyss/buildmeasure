/**
 * JobsiteQuant rectangular gravel-layer engine.
 *
 * Formula version: 1.0.0
 * Engine version: 0.1.0
 * Last reviewed: 2026-08-01
 *
 * Method references:
 * - ASTM C29/C29M-23: aggregate bulk density may be measured in a loose or
 *   compacted condition; the selected density must match the estimate.
 * - USACE HEC-HMS 4.11: 93 lb/ft³ (1,490 kg/m³) is a dry planning default for
 *   sand through gravel and should be replaced when a better value is known.
 *
 * Unit reference:
 * - NIST Handbook 44 (2026), Appendix C
 */

import {
  CUBIC_METERS_PER_CUBIC_FOOT,
  CUBIC_METERS_PER_CUBIC_YARD,
  KILOGRAMS_PER_CUBIC_METER_PER_POUND_PER_CUBIC_FOOT,
  KILOGRAMS_PER_METRIC_TONNE,
  KILOGRAMS_PER_POUND,
  METERS_PER_CENTIMETER,
  METERS_PER_FOOT,
  METERS_PER_INCH,
  POUNDS_PER_SHORT_TON,
  SQUARE_METERS_PER_SQUARE_FOOT,
} from "../units.ts";
import { ceilToSafeInteger } from "../numbers.ts";
import { isFiniteInRange, isPositiveFinite } from "../validation.ts";
import { isUnitSystem, type UnitSystem } from "./types.ts";

export const GRAVEL_ENGINE_VERSION = "0.1.0";
export const GRAVEL_FORMULA_VERSION = "1.0.0";
export const GRAVEL_LAST_REVIEWED = "2026-08-01";
export const GRAVEL_REFERENCE_DENSITY_POUNDS_PER_CUBIC_FOOT = 93;

export type GravelInput = {
  unitSystem: UnitSystem;
  length: number;
  width: number;
  depth: number;
  wastePercent: number;
  bulkDensity: number;
  bagWeight: number;
};

export type GravelResult = {
  unitSystem: UnitSystem;
  areaSquareMeters: number;
  areaSquareFeet: number;
  netCubicMeters: number;
  netCubicFeet: number;
  netCubicYards: number;
  orderCubicMeters: number;
  orderCubicFeet: number;
  orderCubicYards: number;
  bulkDensityKilogramsPerCubicMeter: number;
  massKilograms: number;
  massPounds: number;
  metricTonnes: number;
  shortTons: number;
  bagWeightKilograms: number;
  bags: number;
  wastePercent: number;
};

export class GravelInputError extends Error {
  field: keyof GravelInput;

  constructor(field: keyof GravelInput, message: string) {
    super(message);
    this.name = "GravelInputError";
    this.field = field;
  }
}

function requirePositive(
  field: "length" | "width" | "depth" | "bulkDensity" | "bagWeight",
  value: number,
) {
  if (!isPositiveFinite(value)) {
    throw new GravelInputError(field, "Enter a number greater than zero.");
  }
}

function validateInput(input: GravelInput) {
  if (!isUnitSystem(input.unitSystem)) {
    throw new GravelInputError(
      "unitSystem",
      "Choose Imperial or Metric units.",
    );
  }

  requirePositive("length", input.length);
  requirePositive("width", input.width);
  requirePositive("depth", input.depth);
  requirePositive("bulkDensity", input.bulkDensity);
  requirePositive("bagWeight", input.bagWeight);

  if (!isFiniteInRange(input.wastePercent, 0, 50)) {
    throw new GravelInputError(
      "wastePercent",
      "Allowance must be between 0% and 50%.",
    );
  }
}

export function calculateGravel(input: GravelInput): GravelResult {
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
  const bulkDensityKilogramsPerCubicMeter =
    input.unitSystem === "imperial"
      ? input.bulkDensity *
        KILOGRAMS_PER_CUBIC_METER_PER_POUND_PER_CUBIC_FOOT
      : input.bulkDensity;
  const bagWeightKilograms =
    input.unitSystem === "imperial"
      ? input.bagWeight * KILOGRAMS_PER_POUND
      : input.bagWeight;

  if (![lengthMeters, widthMeters, depthMeters].every(isPositiveFinite)) {
    throw new GravelInputError(
      "length",
      "These dimensions are outside the calculator's safe numeric range.",
    );
  }

  if (!isPositiveFinite(bulkDensityKilogramsPerCubicMeter)) {
    throw new GravelInputError(
      "bulkDensity",
      "Bulk density is outside the calculator's safe numeric range.",
    );
  }

  if (!isPositiveFinite(bagWeightKilograms)) {
    throw new GravelInputError(
      "bagWeight",
      "Bag weight is outside the calculator's safe numeric range.",
    );
  }

  const areaSquareMeters = lengthMeters * widthMeters;
  const netCubicMeters = areaSquareMeters * depthMeters;
  const orderCubicMeters =
    netCubicMeters * (1 + input.wastePercent / 100);
  const massKilograms =
    orderCubicMeters * bulkDensityKilogramsPerCubicMeter;
  const bags = ceilToSafeInteger(massKilograms / bagWeightKilograms);

  const areaSquareFeet =
    areaSquareMeters / SQUARE_METERS_PER_SQUARE_FOOT;
  const netCubicFeet =
    netCubicMeters / CUBIC_METERS_PER_CUBIC_FOOT;
  const netCubicYards =
    netCubicMeters / CUBIC_METERS_PER_CUBIC_YARD;
  const orderCubicFeet =
    orderCubicMeters / CUBIC_METERS_PER_CUBIC_FOOT;
  const orderCubicYards =
    orderCubicMeters / CUBIC_METERS_PER_CUBIC_YARD;
  const massPounds = massKilograms / KILOGRAMS_PER_POUND;
  const metricTonnes =
    massKilograms / KILOGRAMS_PER_METRIC_TONNE;
  const shortTons = massPounds / POUNDS_PER_SHORT_TON;

  if (
    ![
      areaSquareMeters,
      areaSquareFeet,
      netCubicMeters,
      netCubicFeet,
      netCubicYards,
      orderCubicMeters,
      orderCubicFeet,
      orderCubicYards,
      massKilograms,
      massPounds,
      metricTonnes,
      shortTons,
    ].every(isPositiveFinite) ||
    bags === null ||
    bags < 1
  ) {
    throw new GravelInputError(
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
    orderCubicMeters,
    orderCubicFeet,
    orderCubicYards,
    bulkDensityKilogramsPerCubicMeter,
    massKilograms,
    massPounds,
    metricTonnes,
    shortTons,
    bagWeightKilograms,
    bags,
    wastePercent: input.wastePercent,
  };
}
