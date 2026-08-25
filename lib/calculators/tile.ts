/**
 * BuildNumbers rectangular surface tile engine.
 *
 * Formula version: 1.0.0
 * Engine version: 0.1.1
 * Last reviewed: 2026-07-31
 *
 * Method references:
 * - American Olean / Daltile Tile Pattern Guide: calculate and round required
 *   coverage upward.
 * - TCNA grout FAQ: grout-joint width is project- and tile-specific.
 * - Daltile FAQ: approximately 10% additional tile is recommended as attic
 *   stock; the engine keeps the allowance adjustable.
 *
 * Unit references:
 * - NIST Handbook 44, Appendix C
 */

import {
  METERS_PER_FOOT,
  METERS_PER_INCH,
  METERS_PER_MILLIMETER,
  SQUARE_METERS_PER_SQUARE_FOOT,
} from "../units.ts";
import { ceilToSafeInteger } from "../numbers.ts";
import {
  isFiniteInRange,
  isPositiveFinite,
  isWholeNumberInRange,
} from "../validation.ts";
import { isUnitSystem, type UnitSystem } from "./types.ts";

export const TILE_ENGINE_VERSION = "0.1.1";
export const TILE_FORMULA_VERSION = "1.0.0";
export const TILE_LAST_REVIEWED = "2026-07-31";

export type TileOrientation = "auto" | "aligned" | "rotated";

export type TileInput = {
  unitSystem: UnitSystem;
  surfaceLength: number;
  surfaceWidth: number;
  tileLength: number;
  tileWidth: number;
  groutJoint: number;
  wastePercent: number;
  tilesPerBox: number;
  orientation: TileOrientation;
};

export type TileResult = {
  unitSystem: UnitSystem;
  surfaceAreaSquareMeters: number;
  surfaceAreaSquareFeet: number;
  tileAreaSquareMeters: number;
  exactTileCount: number;
  minimumWholeTiles: number;
  orderTileCount: number;
  boxes: number;
  purchasedTiles: number;
  boxOverageTiles: number;
  purchasedAreaSquareMeters: number;
  wastePercent: number;
  tilesPerBox: number;
  groutJointMeters: number;
  layoutOrientation: Exclude<TileOrientation, "auto">;
  tilesAlongLength: number;
  tilesAlongWidth: number;
  layoutCells: number;
  alignedLayoutCells: number;
  rotatedLayoutCells: number;
};

export class TileInputError extends Error {
  field: keyof TileInput;

  constructor(field: keyof TileInput, message: string) {
    super(message);
    this.name = "TileInputError";
    this.field = field;
  }
}

function requirePositive(
  field:
    | "surfaceLength"
    | "surfaceWidth"
    | "tileLength"
    | "tileWidth",
  value: number,
) {
  if (!isPositiveFinite(value)) {
    throw new TileInputError(field, "Enter a number greater than zero.");
  }
}

function validateInput(input: TileInput) {
  if (!isUnitSystem(input.unitSystem)) {
    throw new TileInputError(
      "unitSystem",
      "Choose Imperial or Metric units.",
    );
  }

  requirePositive("surfaceLength", input.surfaceLength);
  requirePositive("surfaceWidth", input.surfaceWidth);
  requirePositive("tileLength", input.tileLength);
  requirePositive("tileWidth", input.tileWidth);

  if (!isFiniteInRange(input.groutJoint, 0, Number.MAX_VALUE)) {
    throw new TileInputError(
      "groutJoint",
      "Grout joint width cannot be negative.",
    );
  }

  if (!isFiniteInRange(input.wastePercent, 0, 50)) {
    throw new TileInputError(
      "wastePercent",
      "Waste allowance must be between 0% and 50%.",
    );
  }

  if (!isWholeNumberInRange(input.tilesPerBox, 1, 500)) {
    throw new TileInputError(
      "tilesPerBox",
      "Tiles per box must be a whole number from 1 to 500.",
    );
  }

  if (!["auto", "aligned", "rotated"].includes(input.orientation)) {
    throw new TileInputError(
      "orientation",
      "Choose a valid tile orientation.",
    );
  }
}

function moduleCount(
  surfaceSpanMeters: number,
  tileSpanMeters: number,
  groutJointMeters: number,
) {
  const count = ceilToSafeInteger(
    (surfaceSpanMeters + groutJointMeters) /
      (tileSpanMeters + groutJointMeters),
  );

  return count === null ? null : Math.max(1, count);
}

export function calculateTile(input: TileInput): TileResult {
  validateInput(input);

  const surfaceLengthMeters =
    input.unitSystem === "imperial"
      ? input.surfaceLength * METERS_PER_FOOT
      : input.surfaceLength;
  const surfaceWidthMeters =
    input.unitSystem === "imperial"
      ? input.surfaceWidth * METERS_PER_FOOT
      : input.surfaceWidth;
  const tileLengthMeters =
    input.unitSystem === "imperial"
      ? input.tileLength * METERS_PER_INCH
      : input.tileLength * METERS_PER_MILLIMETER;
  const tileWidthMeters =
    input.unitSystem === "imperial"
      ? input.tileWidth * METERS_PER_INCH
      : input.tileWidth * METERS_PER_MILLIMETER;
  const groutJointMeters =
    input.unitSystem === "imperial"
      ? input.groutJoint * METERS_PER_INCH
      : input.groutJoint * METERS_PER_MILLIMETER;

  if (
    ![
      surfaceLengthMeters,
      surfaceWidthMeters,
      tileLengthMeters,
      tileWidthMeters,
    ].every(isPositiveFinite)
  ) {
    throw new TileInputError(
      "surfaceLength",
      "These dimensions are outside the calculator's safe numeric range.",
    );
  }

  if (
    !Number.isFinite(groutJointMeters) ||
    groutJointMeters < 0 ||
    (input.groutJoint > 0 && groutJointMeters === 0)
  ) {
    throw new TileInputError(
      "groutJoint",
      "Grout joint width is outside the safe numeric range.",
    );
  }

  if (
    groutJointMeters >= tileLengthMeters ||
    groutJointMeters >= tileWidthMeters
  ) {
    throw new TileInputError(
      "groutJoint",
      "Grout joint width must be smaller than both tile dimensions.",
    );
  }

  const surfaceAreaSquareMeters =
    surfaceLengthMeters * surfaceWidthMeters;
  const tileAreaSquareMeters = tileLengthMeters * tileWidthMeters;
  const exactTileCount =
    surfaceAreaSquareMeters / tileAreaSquareMeters;

  if (
    ![
      surfaceAreaSquareMeters,
      tileAreaSquareMeters,
      exactTileCount,
    ].every(isPositiveFinite)
  ) {
    throw new TileInputError(
      "surfaceLength",
      "These dimensions are outside the calculator's safe numeric range.",
    );
  }

  const minimumWholeTiles = ceilToSafeInteger(exactTileCount);
  const orderTileCount = ceilToSafeInteger(
    exactTileCount * (1 + input.wastePercent / 100),
  );

  if (
    minimumWholeTiles === null ||
    orderTileCount === null ||
    minimumWholeTiles < 1 ||
    orderTileCount < minimumWholeTiles
  ) {
    throw new TileInputError(
      "surfaceLength",
      "These dimensions produce a tile quantity outside the safe numeric range.",
    );
  }

  const boxes = ceilToSafeInteger(
    orderTileCount / input.tilesPerBox,
  );
  const purchasedTiles =
    boxes === null ? Number.NaN : boxes * input.tilesPerBox;

  if (
    boxes === null ||
    boxes < 1 ||
    !Number.isSafeInteger(purchasedTiles)
  ) {
    throw new TileInputError(
      "surfaceLength",
      "These dimensions produce a tile quantity outside the safe numeric range.",
    );
  }

  const alignedAlongLength = moduleCount(
    surfaceLengthMeters,
    tileLengthMeters,
    groutJointMeters,
  );
  const alignedAlongWidth = moduleCount(
    surfaceWidthMeters,
    tileWidthMeters,
    groutJointMeters,
  );
  const rotatedAlongLength = moduleCount(
    surfaceLengthMeters,
    tileWidthMeters,
    groutJointMeters,
  );
  const rotatedAlongWidth = moduleCount(
    surfaceWidthMeters,
    tileLengthMeters,
    groutJointMeters,
  );

  if (
    alignedAlongLength === null ||
    alignedAlongWidth === null ||
    rotatedAlongLength === null ||
    rotatedAlongWidth === null
  ) {
    throw new TileInputError(
      "surfaceLength",
      "These dimensions produce a layout outside the safe numeric range.",
    );
  }

  const alignedLayoutCells =
    alignedAlongLength * alignedAlongWidth;
  const rotatedLayoutCells =
    rotatedAlongLength * rotatedAlongWidth;

  if (
    !Number.isSafeInteger(alignedLayoutCells) ||
    !Number.isSafeInteger(rotatedLayoutCells)
  ) {
    throw new TileInputError(
      "surfaceLength",
      "These dimensions produce a layout outside the safe numeric range.",
    );
  }

  const layoutOrientation =
    input.orientation === "auto"
      ? alignedLayoutCells <= rotatedLayoutCells
        ? "aligned"
        : "rotated"
      : input.orientation;
  const tilesAlongLength =
    layoutOrientation === "aligned"
      ? alignedAlongLength
      : rotatedAlongLength;
  const tilesAlongWidth =
    layoutOrientation === "aligned"
      ? alignedAlongWidth
      : rotatedAlongWidth;
  const purchasedAreaSquareMeters =
    purchasedTiles * tileAreaSquareMeters;
  const surfaceAreaSquareFeet =
    surfaceAreaSquareMeters / SQUARE_METERS_PER_SQUARE_FOOT;
  const layoutCells = tilesAlongLength * tilesAlongWidth;

  if (
    !isPositiveFinite(purchasedAreaSquareMeters) ||
    !isPositiveFinite(surfaceAreaSquareFeet) ||
    !Number.isSafeInteger(layoutCells)
  ) {
    throw new TileInputError(
      "surfaceLength",
      "These dimensions produce a result outside the safe numeric range.",
    );
  }

  return {
    unitSystem: input.unitSystem,
    surfaceAreaSquareMeters,
    surfaceAreaSquareFeet,
    tileAreaSquareMeters,
    exactTileCount,
    minimumWholeTiles,
    orderTileCount,
    boxes,
    purchasedTiles,
    boxOverageTiles: purchasedTiles - orderTileCount,
    purchasedAreaSquareMeters,
    wastePercent: input.wastePercent,
    tilesPerBox: input.tilesPerBox,
    groutJointMeters,
    layoutOrientation,
    tilesAlongLength,
    tilesAlongWidth,
    layoutCells,
    alignedLayoutCells,
    rotatedLayoutCells,
  };
}
