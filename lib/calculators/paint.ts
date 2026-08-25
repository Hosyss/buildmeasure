/**
 * JobsiteQuant rectangular room paint engine.
 *
 * Formula version: 1.0.0
 * Engine version: 0.1.1
 * Last reviewed: 2026-07-31
 *
 * Method references:
 * - Sherwin-Williams: multiply wall height by width, total wall areas, and
 *   subtract large openings.
 * - Sherwin-Williams: coated area / product coverage = paint volume.
 *
 * Unit references:
 * - NIST Handbook 44, Appendix C
 * - NIST SP 1038
 */

import {
  LITERS_PER_US_GALLON,
  METERS_PER_FOOT,
  SQUARE_METERS_PER_SQUARE_FOOT,
} from "../units.ts";
import { ceilToSafeInteger } from "../numbers.ts";
import { isUnitSystem, type UnitSystem } from "./types.ts";
import {
  isFiniteInRange,
  isPositiveFinite,
  isWholeNumberInRange,
} from "../validation.ts";

export const PAINT_ENGINE_VERSION = "0.1.1";
export const PAINT_FORMULA_VERSION = "1.0.0";
export const PAINT_LAST_REVIEWED = "2026-07-31";
export const DEFAULT_COVERAGE_SQ_FT_PER_GALLON = 400;
export const DEFAULT_COVERAGE_SQ_M_PER_LITER =
  (DEFAULT_COVERAGE_SQ_FT_PER_GALLON *
    SQUARE_METERS_PER_SQUARE_FOOT) /
  LITERS_PER_US_GALLON;

export type PaintInput = {
  unitSystem: UnitSystem;
  length: number;
  width: number;
  wallHeight: number;
  openingsArea: number;
  coats: number;
  coverage: number;
  extraPercent: number;
  includeCeiling: boolean;
  containerLiters: number;
};

export type PaintResult = {
  unitSystem: UnitSystem;
  wallAreaSquareMeters: number;
  ceilingAreaSquareMeters: number;
  grossAreaSquareMeters: number;
  openingsAreaSquareMeters: number;
  paintableAreaSquareMeters: number;
  coatedAreaSquareMeters: number;
  coverageSquareMetersPerLiter: number;
  basePaintLiters: number;
  paintLiters: number;
  paintGallons: number;
  containers: number;
  containerLiters: number;
  purchasedLiters: number;
  extraPercent: number;
  coats: number;
};

export class PaintInputError extends Error {
  field: keyof PaintInput;

  constructor(field: keyof PaintInput, message: string) {
    super(message);
    this.name = "PaintInputError";
    this.field = field;
  }
}

function requirePositive(
  field: "length" | "width" | "wallHeight" | "coverage" | "containerLiters",
  value: number,
) {
  if (!isPositiveFinite(value)) {
    throw new PaintInputError(field, "Enter a number greater than zero.");
  }
}

function validateInput(input: PaintInput) {
  if (!isUnitSystem(input.unitSystem)) {
    throw new PaintInputError(
      "unitSystem",
      "Choose Imperial or Metric units.",
    );
  }

  requirePositive("length", input.length);
  requirePositive("width", input.width);
  requirePositive("wallHeight", input.wallHeight);
  requirePositive("coverage", input.coverage);
  requirePositive("containerLiters", input.containerLiters);

  if (!isFiniteInRange(input.openingsArea, 0, Number.MAX_VALUE)) {
    throw new PaintInputError(
      "openingsArea",
      "Opening area cannot be negative.",
    );
  }

  if (!isWholeNumberInRange(input.coats, 1, 6)) {
    throw new PaintInputError("coats", "Coats must be a whole number from 1 to 6.");
  }

  if (!isFiniteInRange(input.extraPercent, 0, 25)) {
    throw new PaintInputError(
      "extraPercent",
      "Extra allowance must be between 0% and 25%.",
    );
  }

  if (typeof input.includeCeiling !== "boolean") {
    throw new PaintInputError(
      "includeCeiling",
      "Choose whether to include the ceiling.",
    );
  }
}

export function calculatePaint(input: PaintInput): PaintResult {
  validateInput(input);

  const lengthMeters =
    input.unitSystem === "imperial"
      ? input.length * METERS_PER_FOOT
      : input.length;
  const widthMeters =
    input.unitSystem === "imperial"
      ? input.width * METERS_PER_FOOT
      : input.width;
  const heightMeters =
    input.unitSystem === "imperial"
      ? input.wallHeight * METERS_PER_FOOT
      : input.wallHeight;
  const openingsAreaSquareMeters =
    input.unitSystem === "imperial"
      ? input.openingsArea * SQUARE_METERS_PER_SQUARE_FOOT
      : input.openingsArea;
  const coverageSquareMetersPerLiter =
    input.unitSystem === "imperial"
      ? (input.coverage * SQUARE_METERS_PER_SQUARE_FOOT) /
        LITERS_PER_US_GALLON
      : input.coverage;

  if (
    ![lengthMeters, widthMeters, heightMeters].every(isPositiveFinite)
  ) {
    throw new PaintInputError(
      "length",
      "These dimensions are outside the calculator's safe numeric range.",
    );
  }

  if (
    !isPositiveFinite(coverageSquareMetersPerLiter)
  ) {
    throw new PaintInputError(
      "coverage",
      "Coverage is outside the calculator's safe numeric range.",
    );
  }

  if (
    !Number.isFinite(openingsAreaSquareMeters) ||
    openingsAreaSquareMeters < 0 ||
    (input.openingsArea > 0 && openingsAreaSquareMeters === 0)
  ) {
    throw new PaintInputError(
      "openingsArea",
      "Opening area is outside the calculator's safe numeric range.",
    );
  }

  const wallAreaSquareMeters =
    2 * (lengthMeters + widthMeters) * heightMeters;
  const ceilingAreaSquareMeters = input.includeCeiling
    ? lengthMeters * widthMeters
    : 0;
  const grossAreaSquareMeters =
    wallAreaSquareMeters + ceilingAreaSquareMeters;

  if (
    ![
      wallAreaSquareMeters,
      grossAreaSquareMeters,
    ].every(isPositiveFinite) ||
    !Number.isFinite(ceilingAreaSquareMeters)
  ) {
    throw new PaintInputError(
      "length",
      "These dimensions are outside the calculator's safe numeric range.",
    );
  }

  const areaTolerance = grossAreaSquareMeters * 1e-12;
  if (
    openingsAreaSquareMeters >=
    grossAreaSquareMeters - areaTolerance
  ) {
    throw new PaintInputError(
      "openingsArea",
      "Opening area must be smaller than the surfaces being painted.",
    );
  }

  const paintableAreaSquareMeters =
    grossAreaSquareMeters - openingsAreaSquareMeters;
  const coatedAreaSquareMeters = paintableAreaSquareMeters * input.coats;
  const basePaintLiters =
    coatedAreaSquareMeters / coverageSquareMetersPerLiter;
  const paintLiters = basePaintLiters * (1 + input.extraPercent / 100);
  const paintGallons = paintLiters / LITERS_PER_US_GALLON;
  const containers = ceilToSafeInteger(
    paintLiters / input.containerLiters,
  );
  const purchasedLiters =
    containers === null ? Number.NaN : containers * input.containerLiters;

  if (
    ![
      paintableAreaSquareMeters,
      coatedAreaSquareMeters,
      basePaintLiters,
      paintLiters,
      paintGallons,
      purchasedLiters,
    ].every(isPositiveFinite) ||
    containers === null ||
    containers < 1
  ) {
    throw new PaintInputError(
      "coverage",
      "These values produce a paint quantity outside the safe numeric range.",
    );
  }

  return {
    unitSystem: input.unitSystem,
    wallAreaSquareMeters,
    ceilingAreaSquareMeters,
    grossAreaSquareMeters,
    openingsAreaSquareMeters,
    paintableAreaSquareMeters,
    coatedAreaSquareMeters,
    coverageSquareMetersPerLiter,
    basePaintLiters,
    paintLiters,
    paintGallons,
    containers,
    containerLiters: input.containerLiters,
    purchasedLiters,
    extraPercent: input.extraPercent,
    coats: input.coats,
  };
}
