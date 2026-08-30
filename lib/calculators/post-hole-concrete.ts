/**
 * BuildNumbers post-hole concrete volume engine.
 *
 * Formula version: 1.0.0
 * Engine version: 0.1.0
 * Last reviewed: 2026-08-13
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
import { isFiniteInRange, isPositiveFinite } from "../validation.ts";
import { isUnitSystem, type UnitSystem } from "./types.ts";
import {
  BAG_YIELDS_CUBIC_FEET,
  type BagSize,
} from "./concrete.ts";

export type { BagSize } from "./concrete.ts";
export type { UnitSystem } from "./types.ts";
export { BAG_YIELDS_CUBIC_FEET } from "./concrete.ts";

export const POST_HOLE_ENGINE_VERSION = "0.1.0";
export const POST_HOLE_FORMULA_VERSION = "1.0.0";
export const POST_HOLE_LAST_REVIEWED = "2026-08-13";

export const POST_SHAPES = ["none", "round", "square"] as const;
export type PostShape = (typeof POST_SHAPES)[number];

export type PostHoleConcreteInput = {
  unitSystem: UnitSystem;
  holeCount: number;
  holeDiameter: number;
  holeDepth: number;
  postShape: PostShape;
  postSize: number;
  wastePercent: number;
  bagSize: BagSize;
};

export type PostHoleConcreteResult = {
  unitSystem: UnitSystem;
  holeCount: number;
  postShape: PostShape;
  grossPerHoleCubicMeters: number;
  displacedPerHoleCubicMeters: number;
  netPerHoleCubicMeters: number;
  totalNetCubicMeters: number;
  orderCubicMeters: number;
  cubicFeet: number;
  cubicYards: number;
  liters: number;
  bags: number;
  bagSize: BagSize;
  wastePercent: number;
};

export class PostHoleConcreteInputError extends Error {
  field: keyof PostHoleConcreteInput;

  constructor(field: keyof PostHoleConcreteInput, message: string) {
    super(message);
    this.name = "PostHoleConcreteInputError";
    this.field = field;
  }
}

function toMeters(value: number, unitSystem: UnitSystem) {
  return unitSystem === "imperial" ? value * METERS_PER_INCH : value / 100;
}

function isPostShape(value: unknown): value is PostShape {
  return POST_SHAPES.includes(value as PostShape);
}

function validateInput(input: PostHoleConcreteInput) {
  if (!isUnitSystem(input.unitSystem)) {
    throw new PostHoleConcreteInputError(
      "unitSystem",
      "Choose Imperial or Metric units.",
    );
  }

  if (!Number.isSafeInteger(input.holeCount) || input.holeCount < 1) {
    throw new PostHoleConcreteInputError(
      "holeCount",
      "Enter a whole number of holes greater than zero.",
    );
  }

  for (const field of ["holeDiameter", "holeDepth"] as const) {
    if (!isPositiveFinite(input[field])) {
      throw new PostHoleConcreteInputError(
        field,
        "Enter a number greater than zero.",
      );
    }
  }

  if (!isPostShape(input.postShape)) {
    throw new PostHoleConcreteInputError(
      "postShape",
      "Choose no post, a round post, or a square post.",
    );
  }

  if (!Number.isFinite(input.postSize) || input.postSize < 0) {
    throw new PostHoleConcreteInputError(
      "postSize",
      "Post size cannot be negative.",
    );
  }

  if (input.postShape !== "none") {
    if (!isPositiveFinite(input.postSize)) {
      throw new PostHoleConcreteInputError(
        "postSize",
        "Enter a post size greater than zero.",
      );
    }

    if (
      input.postShape === "round" &&
      input.postSize >= input.holeDiameter
    ) {
      throw new PostHoleConcreteInputError(
        "postSize",
        "Round post diameter must be smaller than the hole diameter.",
      );
    }

    if (
      input.postShape === "square" &&
      input.postSize * Math.SQRT2 > input.holeDiameter
    ) {
      throw new PostHoleConcreteInputError(
        "postSize",
        "Square post diagonal must fit inside the hole diameter.",
      );
    }
  }

  if (!isFiniteInRange(input.wastePercent, 0, 50)) {
    throw new PostHoleConcreteInputError(
      "wastePercent",
      "Waste allowance must be between 0% and 50%.",
    );
  }

  if (!Object.hasOwn(BAG_YIELDS_CUBIC_FEET, input.bagSize)) {
    throw new PostHoleConcreteInputError(
      "bagSize",
      "Select a supported bag size.",
    );
  }
}

export function calculatePostHoleConcrete(
  input: PostHoleConcreteInput,
): PostHoleConcreteResult {
  validateInput(input);

  const diameterMeters = toMeters(input.holeDiameter, input.unitSystem);
  const depthMeters = toMeters(input.holeDepth, input.unitSystem);
  const postSizeMeters = toMeters(input.postSize, input.unitSystem);
  const holeRadiusMeters = diameterMeters / 2;

  const grossPerHoleCubicMeters =
    Math.PI * holeRadiusMeters ** 2 * depthMeters;

  let postCrossSectionSquareMeters = 0;
  if (input.postShape === "round") {
    postCrossSectionSquareMeters = Math.PI * (postSizeMeters / 2) ** 2;
  } else if (input.postShape === "square") {
    postCrossSectionSquareMeters = postSizeMeters ** 2;
  }

  const displacedPerHoleCubicMeters =
    postCrossSectionSquareMeters * depthMeters;
  const netPerHoleCubicMeters =
    grossPerHoleCubicMeters - displacedPerHoleCubicMeters;
  const totalNetCubicMeters = netPerHoleCubicMeters * input.holeCount;
  const orderCubicMeters =
    totalNetCubicMeters * (1 + input.wastePercent / 100);
  const cubicFeet = orderCubicMeters / METERS_PER_FOOT ** 3;
  const cubicYards = orderCubicMeters / METERS_PER_YARD ** 3;
  const liters = orderCubicMeters * LITERS_PER_CUBIC_METER;
  const bags = ceilToSafeInteger(
    cubicFeet / BAG_YIELDS_CUBIC_FEET[input.bagSize],
  );

  if (
    ![
      diameterMeters,
      depthMeters,
      grossPerHoleCubicMeters,
      netPerHoleCubicMeters,
      totalNetCubicMeters,
      orderCubicMeters,
      cubicFeet,
      cubicYards,
      liters,
    ].every(isPositiveFinite) ||
    !Number.isFinite(postSizeMeters) ||
    !Number.isFinite(displacedPerHoleCubicMeters) ||
    displacedPerHoleCubicMeters < 0 ||
    bags === null ||
    bags < 1
  ) {
    throw new PostHoleConcreteInputError(
      "holeDiameter",
      "These values are outside the calculator's safe numeric range.",
    );
  }

  return {
    unitSystem: input.unitSystem,
    holeCount: input.holeCount,
    postShape: input.postShape,
    grossPerHoleCubicMeters,
    displacedPerHoleCubicMeters,
    netPerHoleCubicMeters,
    totalNetCubicMeters,
    orderCubicMeters,
    cubicFeet,
    cubicYards,
    liters,
    bags,
    bagSize: input.bagSize,
    wastePercent: input.wastePercent,
  };
}
