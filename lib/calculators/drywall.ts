/**
 * BuildMeasure rectangular-room drywall sheet quantity engine.
 *
 * Formula version: 1.0.0
 * Engine version: 0.1.0
 * Last reviewed: 2026-08-24
 *
 * Method references:
 * - USG Sheetrock Wallboard Estimator: area to be covered + selected panel size;
 *   published estimator excludes a waste allowance.
 * - USG Sheetrock Brand Gypsum Panels: 48 in. wide panels in 8-12 ft lengths.
 *
 * Unit reference:
 * - NIST SP 811 Appendix B: exact international-foot conversion.
 */

import {
  METERS_PER_FOOT,
  SQUARE_METERS_PER_SQUARE_FOOT,
} from "../units.ts";
import { ceilToSafeInteger } from "../numbers.ts";
import { isFiniteInRange, isPositiveFinite } from "../validation.ts";
import { isUnitSystem, type UnitSystem } from "./types.ts";

export const DRYWALL_ENGINE_VERSION = "0.1.0";
export const DRYWALL_FORMULA_VERSION = "1.0.0";
export const DRYWALL_LAST_REVIEWED = "2026-08-24";

export const DRYWALL_PANEL_PRESETS = {
  "4x8": { label: "4 × 8 ft", widthFeet: 4, lengthFeet: 8 },
  "4x10": { label: "4 × 10 ft", widthFeet: 4, lengthFeet: 10 },
  "4x12": { label: "4 × 12 ft", widthFeet: 4, lengthFeet: 12 },
} as const;

export type DrywallPanelPresetId = keyof typeof DRYWALL_PANEL_PRESETS;

export type DrywallInput = {
  unitSystem: UnitSystem;
  roomLength: number;
  roomWidth: number;
  wallHeight: number;
  openingsArea: number;
  includeCeiling: boolean;
  panelWidth: number;
  panelLength: number;
  wastePercent: number;
};

export type DrywallResult = {
  unitSystem: UnitSystem;
  wallAreaSquareMeters: number;
  wallAreaSquareFeet: number;
  ceilingAreaSquareMeters: number;
  ceilingAreaSquareFeet: number;
  grossAreaSquareMeters: number;
  grossAreaSquareFeet: number;
  openingsAreaSquareMeters: number;
  openingsAreaSquareFeet: number;
  netAreaSquareMeters: number;
  netAreaSquareFeet: number;
  panelAreaSquareMeters: number;
  panelAreaSquareFeet: number;
  exactNetPanels: number;
  minimumWholePanels: number;
  adjustedAreaSquareMeters: number;
  adjustedAreaSquareFeet: number;
  exactOrderPanels: number;
  orderPanels: number;
  allowanceAddedPanels: number;
  wastePercent: number;
};

export class DrywallInputError extends Error {
  field: keyof DrywallInput;

  constructor(field: keyof DrywallInput, message: string) {
    super(message);
    this.name = "DrywallInputError";
    this.field = field;
  }
}

export function drywallPresetDimensions(
  preset: DrywallPanelPresetId,
  unitSystem: UnitSystem,
) {
  const selected = DRYWALL_PANEL_PRESETS[preset];
  if (unitSystem === "imperial") {
    return { width: selected.widthFeet, length: selected.lengthFeet };
  }

  return {
    width: selected.widthFeet * METERS_PER_FOOT,
    length: selected.lengthFeet * METERS_PER_FOOT,
  };
}

function requirePositive(
  field:
    | "roomLength"
    | "roomWidth"
    | "wallHeight"
    | "panelWidth"
    | "panelLength",
  value: number,
) {
  if (!isPositiveFinite(value)) {
    throw new DrywallInputError(field, "Enter a number greater than zero.");
  }
}

function validateInput(input: DrywallInput) {
  if (!isUnitSystem(input.unitSystem)) {
    throw new DrywallInputError(
      "unitSystem",
      "Choose Imperial or Metric units.",
    );
  }

  requirePositive("roomLength", input.roomLength);
  requirePositive("roomWidth", input.roomWidth);
  requirePositive("wallHeight", input.wallHeight);
  requirePositive("panelWidth", input.panelWidth);
  requirePositive("panelLength", input.panelLength);

  if (!isFiniteInRange(input.openingsArea, 0, Number.MAX_VALUE)) {
    throw new DrywallInputError(
      "openingsArea",
      "Openings area cannot be negative.",
    );
  }

  if (!isFiniteInRange(input.wastePercent, 0, 50)) {
    throw new DrywallInputError(
      "wastePercent",
      "Waste allowance must be between 0% and 50%.",
    );
  }

  if (typeof input.includeCeiling !== "boolean") {
    throw new DrywallInputError(
      "includeCeiling",
      "Choose whether to include the ceiling.",
    );
  }
}

export function calculateDrywall(input: DrywallInput): DrywallResult {
  validateInput(input);

  const conversion = input.unitSystem === "imperial" ? METERS_PER_FOOT : 1;
  const roomLengthMeters = input.roomLength * conversion;
  const roomWidthMeters = input.roomWidth * conversion;
  const wallHeightMeters = input.wallHeight * conversion;
  const panelWidthMeters = input.panelWidth * conversion;
  const panelLengthMeters = input.panelLength * conversion;
  const openingsAreaSquareMeters =
    input.unitSystem === "imperial"
      ? input.openingsArea * SQUARE_METERS_PER_SQUARE_FOOT
      : input.openingsArea;

  if (
    ![
      roomLengthMeters,
      roomWidthMeters,
      wallHeightMeters,
      panelWidthMeters,
      panelLengthMeters,
    ].every(isPositiveFinite)
  ) {
    throw new DrywallInputError(
      "roomLength",
      "These dimensions are outside the calculator's safe numeric range.",
    );
  }

  if (
    !Number.isFinite(openingsAreaSquareMeters) ||
    openingsAreaSquareMeters < 0 ||
    (input.openingsArea > 0 && openingsAreaSquareMeters === 0)
  ) {
    throw new DrywallInputError(
      "openingsArea",
      "Openings area is outside the calculator's safe numeric range.",
    );
  }

  const wallAreaSquareMeters =
    2 * (roomLengthMeters + roomWidthMeters) * wallHeightMeters;
  const ceilingAreaSquareMeters = input.includeCeiling
    ? roomLengthMeters * roomWidthMeters
    : 0;
  const grossAreaSquareMeters =
    wallAreaSquareMeters + ceilingAreaSquareMeters;
  const panelAreaSquareMeters = panelWidthMeters * panelLengthMeters;

  if (
    !isPositiveFinite(wallAreaSquareMeters) ||
    !Number.isFinite(ceilingAreaSquareMeters) ||
    !isPositiveFinite(grossAreaSquareMeters)
  ) {
    throw new DrywallInputError(
      "roomLength",
      "These room dimensions are outside the calculator's safe numeric range.",
    );
  }

  if (!isPositiveFinite(panelAreaSquareMeters)) {
    throw new DrywallInputError(
      "panelWidth",
      "Panel dimensions are outside the calculator's safe numeric range.",
    );
  }

  const areaTolerance = grossAreaSquareMeters * 1e-12;
  if (
    openingsAreaSquareMeters >=
    grossAreaSquareMeters - areaTolerance
  ) {
    throw new DrywallInputError(
      "openingsArea",
      "Openings area must be smaller than the included wall and ceiling area.",
    );
  }

  const netAreaSquareMeters =
    grossAreaSquareMeters - openingsAreaSquareMeters;
  const exactNetPanels = netAreaSquareMeters / panelAreaSquareMeters;
  const adjustedAreaSquareMeters =
    netAreaSquareMeters * (1 + input.wastePercent / 100);
  const exactOrderPanels =
    adjustedAreaSquareMeters / panelAreaSquareMeters;

  if (
    ![
      netAreaSquareMeters,
      exactNetPanels,
      adjustedAreaSquareMeters,
      exactOrderPanels,
    ].every(isPositiveFinite)
  ) {
    throw new DrywallInputError(
      "roomLength",
      "These inputs produce a drywall estimate outside the safe numeric range.",
    );
  }

  const minimumWholePanels = ceilToSafeInteger(exactNetPanels);
  const orderPanels = ceilToSafeInteger(exactOrderPanels);

  if (
    minimumWholePanels === null ||
    orderPanels === null ||
    minimumWholePanels < 1 ||
    orderPanels < minimumWholePanels
  ) {
    throw new DrywallInputError(
      "roomLength",
      "These inputs produce a sheet quantity outside the safe numeric range.",
    );
  }

  const wallAreaSquareFeet =
    wallAreaSquareMeters / SQUARE_METERS_PER_SQUARE_FOOT;
  const ceilingAreaSquareFeet =
    ceilingAreaSquareMeters / SQUARE_METERS_PER_SQUARE_FOOT;
  const grossAreaSquareFeet =
    grossAreaSquareMeters / SQUARE_METERS_PER_SQUARE_FOOT;
  const openingsAreaSquareFeet =
    openingsAreaSquareMeters / SQUARE_METERS_PER_SQUARE_FOOT;
  const netAreaSquareFeet =
    netAreaSquareMeters / SQUARE_METERS_PER_SQUARE_FOOT;
  const panelAreaSquareFeet =
    panelAreaSquareMeters / SQUARE_METERS_PER_SQUARE_FOOT;
  const adjustedAreaSquareFeet =
    adjustedAreaSquareMeters / SQUARE_METERS_PER_SQUARE_FOOT;

  if (
    ![
      wallAreaSquareFeet,
      ceilingAreaSquareFeet,
      grossAreaSquareFeet,
      openingsAreaSquareFeet,
      netAreaSquareFeet,
      panelAreaSquareFeet,
      adjustedAreaSquareFeet,
    ].every(Number.isFinite)
  ) {
    throw new DrywallInputError(
      "roomLength",
      "These inputs produce a result outside the safe numeric range.",
    );
  }

  return {
    unitSystem: input.unitSystem,
    wallAreaSquareMeters,
    wallAreaSquareFeet,
    ceilingAreaSquareMeters,
    ceilingAreaSquareFeet,
    grossAreaSquareMeters,
    grossAreaSquareFeet,
    openingsAreaSquareMeters,
    openingsAreaSquareFeet,
    netAreaSquareMeters,
    netAreaSquareFeet,
    panelAreaSquareMeters,
    panelAreaSquareFeet,
    exactNetPanels,
    minimumWholePanels,
    adjustedAreaSquareMeters,
    adjustedAreaSquareFeet,
    exactOrderPanels,
    orderPanels,
    allowanceAddedPanels: orderPanels - minimumWholePanels,
    wastePercent: input.wastePercent,
  };
}
