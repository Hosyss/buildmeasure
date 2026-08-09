import assert from "node:assert/strict";
import test from "node:test";
import {
  calculatePaint,
  DEFAULT_COVERAGE_SQ_M_PER_LITER,
  PaintInputError,
} from "../lib/calculators/paint.ts";
import {
  LITERS_PER_US_GALLON,
  METERS_PER_FOOT,
  SQUARE_METERS_PER_SQUARE_FOOT,
} from "../lib/units.ts";

const baseInput = {
  unitSystem: "imperial",
  length: 12,
  width: 10,
  wallHeight: 8,
  openingsArea: 42,
  coats: 2,
  coverage: 400,
  extraPercent: 10,
  includeCeiling: false,
  containerLiters: LITERS_PER_US_GALLON,
};

test("calculates walls, openings, coats, and extra paint", () => {
  const result = calculatePaint(baseInput);

  const squareFeet = (squareMeters) =>
    squareMeters / SQUARE_METERS_PER_SQUARE_FOOT;

  assert.ok(Math.abs(squareFeet(result.wallAreaSquareMeters) - 352) < 1e-9);
  assert.ok(Math.abs(squareFeet(result.paintableAreaSquareMeters) - 310) < 1e-9);
  assert.ok(Math.abs(squareFeet(result.coatedAreaSquareMeters) - 620) < 1e-9);
  assert.ok(Math.abs(result.paintGallons - 1.705) < 1e-12);
  assert.equal(result.containers, 2);
});

test("matches the 1,000 square-foot coverage reference vector", () => {
  const result = calculatePaint({
    ...baseInput,
    length: 30,
    width: 32.5,
    wallHeight: 8,
    openingsArea: 0,
    coats: 1,
    coverage: 400,
    extraPercent: 0,
  });

  assert.ok(Math.abs(result.paintGallons - 2.5) < 1e-12);
  assert.equal(result.containers, 3);
});

test("adds ceiling area only when requested", () => {
  const wallsOnly = calculatePaint(baseInput);
  const withCeiling = calculatePaint({
    ...baseInput,
    includeCeiling: true,
  });
  const differenceSquareFeet =
    (withCeiling.paintableAreaSquareMeters -
      wallsOnly.paintableAreaSquareMeters) /
    SQUARE_METERS_PER_SQUARE_FOOT;

  assert.ok(Math.abs(differenceSquareFeet - 120) < 1e-9);
});

test("metric and imperial descriptions of the same room agree", () => {
  const imperial = calculatePaint(baseInput);
  const metric = calculatePaint({
    ...baseInput,
    unitSystem: "metric",
    length: baseInput.length * METERS_PER_FOOT,
    width: baseInput.width * METERS_PER_FOOT,
    wallHeight: baseInput.wallHeight * METERS_PER_FOOT,
    openingsArea:
      baseInput.openingsArea * SQUARE_METERS_PER_SQUARE_FOOT,
    coverage: DEFAULT_COVERAGE_SQ_M_PER_LITER,
  });

  assert.ok(
    Math.abs(imperial.paintableAreaSquareMeters - metric.paintableAreaSquareMeters) <
      1e-12,
  );
  assert.ok(Math.abs(imperial.paintLiters - metric.paintLiters) < 1e-12);
});

test("uses the selected container size and always rounds containers up", () => {
  const result = calculatePaint({
    ...baseInput,
    containerLiters: 2.5,
  });

  assert.equal(result.containers, 3);
  assert.equal(result.purchasedLiters, 7.5);
  assert.ok(result.purchasedLiters >= result.paintLiters);
});

test("does not add a container at an exact coverage boundary", () => {
  const result = calculatePaint({
    ...baseInput,
    length: 1,
    width: 1,
    wallHeight: 9,
    openingsArea: 0,
    coats: 1,
    coverage: 3,
    extraPercent: 0,
  });

  // 2 × (1 ft + 1 ft) × 9 ft = 36 ft²; 36 ÷ 3 = 12 gallons.
  assert.equal(result.containers, 12);
});

test("keeps base volume separate from the extra allowance", () => {
  const noExtra = calculatePaint({ ...baseInput, extraPercent: 0 });
  const withExtra = calculatePaint(baseInput);

  assert.equal(noExtra.basePaintLiters, withExtra.basePaintLiters);
  assert.ok(
    Math.abs(withExtra.paintLiters - noExtra.paintLiters * 1.1) < 1e-12,
  );
});

test("rejects zero, negative, and non-finite dimensions", () => {
  for (const invalid of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(
      () => calculatePaint({ ...baseInput, length: invalid }),
      (error) =>
        error instanceof PaintInputError &&
        error.field === "length" &&
        error.message === "Enter a number greater than zero.",
    );
  }
});

test("rejects invalid coats and extra allowance", () => {
  for (const invalid of [0, 1.5, 7]) {
    assert.throws(
      () => calculatePaint({ ...baseInput, coats: invalid }),
      (error) => error instanceof PaintInputError && error.field === "coats",
    );
  }

  for (const invalid of [-1, 26, Number.NaN]) {
    assert.throws(
      () => calculatePaint({ ...baseInput, extraPercent: invalid }),
      (error) =>
        error instanceof PaintInputError && error.field === "extraPercent",
    );
  }
});

test("rejects unsupported runtime options", () => {
  assert.throws(
    () => calculatePaint({ ...baseInput, unitSystem: "si" }),
    (error) =>
      error instanceof PaintInputError &&
      error.field === "unitSystem",
  );

  assert.throws(
    () => calculatePaint({ ...baseInput, includeCeiling: "false" }),
    (error) =>
      error instanceof PaintInputError &&
      error.field === "includeCeiling",
  );
});

test("rejects values that cannot produce a numerically safe result", () => {
  assert.throws(
    () => calculatePaint({ ...baseInput, coverage: Number.MIN_VALUE }),
    (error) =>
      error instanceof PaintInputError &&
      error.field === "coverage" &&
      error.message.includes("safe numeric range"),
  );

  assert.throws(
    () =>
      calculatePaint({
        ...baseInput,
        length: Number.MAX_VALUE,
        width: Number.MAX_VALUE,
      }),
    (error) =>
      error instanceof PaintInputError &&
      error.message.includes("safe numeric range"),
  );

  assert.throws(
    () =>
      calculatePaint({
        ...baseInput,
        containerLiters: Number.MIN_VALUE,
      }),
    (error) =>
      error instanceof PaintInputError &&
      error.message.includes("safe numeric range"),
  );
});

test("rejects openings that remove every paintable surface", () => {
  assert.throws(
    () => calculatePaint({ ...baseInput, openingsArea: 352 }),
    (error) =>
      error instanceof PaintInputError && error.field === "openingsArea",
  );
});

test("randomized valid inputs preserve area and purchase invariants", () => {
  let seed = 0xbad5eed;
  const random = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  const containers = [1, 2.5, 5, LITERS_PER_US_GALLON];

  for (let index = 0; index < 250; index += 1) {
    const unitSystem = index % 2 === 0 ? "imperial" : "metric";
    const length = 2 + random() * 40;
    const width = 2 + random() * 40;
    const wallHeight = 2 + random() * 12;
    const includeCeiling = index % 3 === 0;
    const grossArea =
      2 * (length + width) * wallHeight +
      (includeCeiling ? length * width : 0);
    const openingsArea = grossArea * random() * 0.4;
    const coats = 1 + (index % 6);
    const coverage =
      unitSystem === "imperial"
        ? 250 + random() * 250
        : 5 + random() * 10;
    const extraPercent = random() * 25;
    const containerLiters = containers[index % containers.length];
    const result = calculatePaint({
      unitSystem,
      length,
      width,
      wallHeight,
      openingsArea,
      coats,
      coverage,
      extraPercent,
      includeCeiling,
      containerLiters,
    });
    const expectedPaintLiters =
      unitSystem === "imperial"
        ? (((grossArea - openingsArea) * coats) / coverage) *
          (1 + extraPercent / 100) *
          LITERS_PER_US_GALLON
        : (((grossArea - openingsArea) * coats) / coverage) *
          (1 + extraPercent / 100);
    const relativeError =
      Math.abs(result.paintLiters - expectedPaintLiters) /
      expectedPaintLiters;

    assert.ok(relativeError < 1e-12);
    assert.ok(result.purchasedLiters >= result.paintLiters - 1e-9);
    assert.ok(
      result.purchasedLiters - result.paintLiters <=
        containerLiters + 1e-9,
    );
    assert.ok(Number.isSafeInteger(result.containers));
  }
});
