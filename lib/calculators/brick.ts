/**
 * BuildMeasure fired-clay brick wall quantity engine.
 *
 * Formula version: 1.0.0
 * Engine version: 0.1.0
 * Last reviewed: 2026-08-13
 *
 * Method references:
 * - Brick Industry Association Technical Note 10: wall-area estimating method,
 *   Table 4 coverage rates, running/stack bond basis, and waste guidance.
 * - BIA Technical Notes scope statement: recommendations are based on fired
 *   clay brick and should not be assumed to apply to non-clay brick products.
 *
 * Unit references:
 * - NIST SP 811, Appendix B: exact international foot conversion.
 */

import {
  METERS_PER_FOOT,
  SQUARE_METERS_PER_SQUARE_FOOT,
} from "../units.ts";
import { ceilToSafeInteger } from "../numbers.ts";
import { isFiniteInRange, isPositiveFinite } from "../validation.ts";
import { isUnitSystem, type UnitSystem } from "./types.ts";

export const BRICK_ENGINE_VERSION = "0.1.0";
export const BRICK_FORMULA_VERSION = "1.0.0";
export const BRICK_LAST_REVIEWED = "2026-08-13";

export const BRICK_RATE_IMPERIAL_AREA_SQUARE_FEET = 100;
export const BRICK_RATE_METRIC_AREA_SQUARE_METERS = 10;

export const BRICK_PRESETS = {
  modular: {
    label: "Modular",
    detail: "4 × 2⅔ × 8 in nominal",
    bricksPer100SquareFeet: 675,
  },
  "engineer-modular": {
    label: "Engineer Modular",
    detail: "4 × 3⅕ × 8 in nominal",
    bricksPer100SquareFeet: 563,
  },
  "closure-modular": {
    label: "Closure Modular",
    detail: "4 × 4 × 8 in nominal",
    bricksPer100SquareFeet: 450,
  },
  roman: {
    label: "Roman",
    detail: "4 × 2 × 12 in nominal",
    bricksPer100SquareFeet: 600,
  },
  norman: {
    label: "Norman",
    detail: "4 × 2⅔ × 12 in nominal",
    bricksPer100SquareFeet: 450,
  },
  utility: {
    label: "Utility",
    detail: "4 × 4 × 12 in nominal",
    bricksPer100SquareFeet: 300,
  },
  meridian: {
    label: "Meridian",
    detail: "4 × 4 × 16 in nominal",
    bricksPer100SquareFeet: 225,
  },
  standard: {
    label: "Standard",
    detail: "BIA non-modular Standard",
    bricksPer100SquareFeet: 655,
  },
} as const;

export type BrickPresetId = keyof typeof BRICK_PRESETS;

export type BrickInput = {
  unitSystem: UnitSystem;
  wallLength: number;
  wallHeight: number;
  openingsArea: number;
  coverageRate: number;
  wastePercent: number;
};

export type BrickResult = {
  unitSystem: UnitSystem;
  grossAreaSquareMeters: number;
  grossAreaSquareFeet: number;
  openingsAreaSquareMeters: number;
  openingsAreaSquareFeet: number;
  netAreaSquareMeters: number;
  netAreaSquareFeet: number;
  bricksPerSquareMeter: number;
  bricksPer100SquareFeet: number;
  bricksPer10SquareMeters: number;
  exactNetBricks: number;
  minimumWholeBricks: number;
  orderBricks: number;
  allowanceAddedBricks: number;
  wastePercent: number;
};

export class BrickInputError extends Error {
  field: keyof BrickInput;

  constructor(field: keyof BrickInput, message: string) {
    super(message);
    this.name = "BrickInputError";
    this.field = field;
  }
}

export function brickPresetRate(
  preset: BrickPresetId,
  unitSystem: UnitSystem,
) {
  const per100SquareFeet = BRICK_PRESETS[preset].bricksPer100SquareFeet;
  if (unitSystem === "imperial") return per100SquareFeet;

  const squareMetersPer100SquareFeet =
    BRICK_RATE_IMPERIAL_AREA_SQUARE_FEET * SQUARE_METERS_PER_SQUARE_FOOT;
  return (
    (per100SquareFeet / squareMetersPer100SquareFeet) *
    BRICK_RATE_METRIC_AREA_SQUARE_METERS
  );
}

export function convertBrickCoverageRate(
  value: number,
  from: UnitSystem,
  to: UnitSystem,
) {
  if (!isPositiveFinite(value) || from === to) return value;

  const bricksPerSquareMeter =
    from === "imperial"
      ? value /
        (BRICK_RATE_IMPERIAL_AREA_SQUARE_FEET *
          SQUARE_METERS_PER_SQUARE_FOOT)
      : value / BRICK_RATE_METRIC_AREA_SQUARE_METERS;

  return to === "imperial"
    ? bricksPerSquareMeter *
        BRICK_RATE_IMPERIAL_AREA_SQUARE_FEET *
        SQUARE_METERS_PER_SQUARE_FOOT
    : bricksPerSquareMeter * BRICK_RATE_METRIC_AREA_SQUARE_METERS;
}

function validateInput(input: BrickInput) {
  if (!isUnitSystem(input.unitSystem)) {
    throw new BrickInputError(
      "unitSystem",
      "Choose Imperial or Metric units.",
    );
  }

  if (!isPositiveFinite(input.wallLength)) {
    throw new BrickInputError(
      "wallLength",
      "Wall length must be greater than zero.",
    );
  }

  if (!isPositiveFinite(input.wallHeight)) {
    throw new BrickInputError(
      "wallHeight",
      "Wall height must be greater than zero.",
    );
  }

  if (!isFiniteInRange(input.openingsArea, 0, Number.MAX_VALUE)) {
    throw new BrickInputError(
      "openingsArea",
      "Openings area cannot be negative.",
    );
  }

  if (!isPositiveFinite(input.coverageRate)) {
    throw new BrickInputError(
      "coverageRate",
      "Brick coverage rate must be greater than zero.",
    );
  }

  if (!isFiniteInRange(input.wastePercent, 0, 50)) {
    throw new BrickInputError(
      "wastePercent",
      "Waste allowance must be between 0% and 50%.",
    );
  }
}

export function calculateBrick(input: BrickInput): BrickResult {
  validateInput(input);

  const wallLengthMeters =
    input.unitSystem === "imperial"
      ? input.wallLength * METERS_PER_FOOT
      : input.wallLength;
  const wallHeightMeters =
    input.unitSystem === "imperial"
      ? input.wallHeight * METERS_PER_FOOT
      : input.wallHeight;
  const openingsAreaSquareMeters =
    input.unitSystem === "imperial"
      ? input.openingsArea * SQUARE_METERS_PER_SQUARE_FOOT
      : input.openingsArea;
  const bricksPerSquareMeter =
    input.unitSystem === "imperial"
      ? input.coverageRate /
        (BRICK_RATE_IMPERIAL_AREA_SQUARE_FEET *
          SQUARE_METERS_PER_SQUARE_FOOT)
      : input.coverageRate / BRICK_RATE_METRIC_AREA_SQUARE_METERS;

  if (
    !isPositiveFinite(wallLengthMeters) ||
    !isPositiveFinite(wallHeightMeters)
  ) {
    throw new BrickInputError(
      "wallLength",
      "Wall dimensions are outside the calculator's safe numeric range.",
    );
  }

  if (
    !Number.isFinite(openingsAreaSquareMeters) ||
    openingsAreaSquareMeters < 0 ||
    (input.openingsArea > 0 && openingsAreaSquareMeters === 0)
  ) {
    throw new BrickInputError(
      "openingsArea",
      "Openings area is outside the calculator's safe numeric range.",
    );
  }

  if (!isPositiveFinite(bricksPerSquareMeter)) {
    throw new BrickInputError(
      "coverageRate",
      "Brick coverage rate is outside the calculator's safe numeric range.",
    );
  }

  const grossAreaSquareMeters = wallLengthMeters * wallHeightMeters;

  if (!isPositiveFinite(grossAreaSquareMeters)) {
    throw new BrickInputError(
      "wallLength",
      "Wall dimensions are outside the calculator's safe numeric range.",
    );
  }

  if (openingsAreaSquareMeters >= grossAreaSquareMeters) {
    throw new BrickInputError(
      "openingsArea",
      "Openings area must be smaller than the gross wall area.",
    );
  }

  const netAreaSquareMeters =
    grossAreaSquareMeters - openingsAreaSquareMeters;
  const exactNetBricks = netAreaSquareMeters * bricksPerSquareMeter;

  if (
    !isPositiveFinite(netAreaSquareMeters) ||
    !isPositiveFinite(exactNetBricks)
  ) {
    throw new BrickInputError(
      "wallLength",
      "These inputs produce a brick estimate outside the safe numeric range.",
    );
  }

  const minimumWholeBricks = ceilToSafeInteger(exactNetBricks);
  const orderBricks = ceilToSafeInteger(
    exactNetBricks * (1 + input.wastePercent / 100),
  );

  if (
    minimumWholeBricks === null ||
    orderBricks === null ||
    minimumWholeBricks < 1 ||
    orderBricks < minimumWholeBricks
  ) {
    throw new BrickInputError(
      "wallLength",
      "These inputs produce a brick quantity outside the safe numeric range.",
    );
  }

  const grossAreaSquareFeet =
    grossAreaSquareMeters / SQUARE_METERS_PER_SQUARE_FOOT;
  const openingsAreaSquareFeet =
    openingsAreaSquareMeters / SQUARE_METERS_PER_SQUARE_FOOT;
  const netAreaSquareFeet =
    netAreaSquareMeters / SQUARE_METERS_PER_SQUARE_FOOT;
  const bricksPer100SquareFeet =
    bricksPerSquareMeter *
    BRICK_RATE_IMPERIAL_AREA_SQUARE_FEET *
    SQUARE_METERS_PER_SQUARE_FOOT;
  const bricksPer10SquareMeters =
    bricksPerSquareMeter * BRICK_RATE_METRIC_AREA_SQUARE_METERS;

  if (
    ![
      grossAreaSquareFeet,
      openingsAreaSquareFeet,
      netAreaSquareFeet,
      bricksPer100SquareFeet,
      bricksPer10SquareMeters,
    ].every(Number.isFinite)
  ) {
    throw new BrickInputError(
      "wallLength",
      "These inputs produce a result outside the safe numeric range.",
    );
  }

  return {
    unitSystem: input.unitSystem,
    grossAreaSquareMeters,
    grossAreaSquareFeet,
    openingsAreaSquareMeters,
    openingsAreaSquareFeet,
    netAreaSquareMeters,
    netAreaSquareFeet,
    bricksPerSquareMeter,
    bricksPer100SquareFeet,
    bricksPer10SquareMeters,
    exactNetBricks,
    minimumWholeBricks,
    orderBricks,
    allowanceAddedBricks: orderBricks - minimumWholeBricks,
    wastePercent: input.wastePercent,
  };
}
