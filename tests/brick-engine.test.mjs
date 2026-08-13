import assert from "node:assert/strict";
import test from "node:test";
import {
  BRICK_PRESETS,
  brickPresetRate,
  calculateBrick,
  convertBrickCoverageRate,
  BrickInputError,
} from "../lib/calculators/brick.ts";
import {
  METERS_PER_FOOT,
  SQUARE_METERS_PER_SQUARE_FOOT,
} from "../lib/units.ts";

const baseInput = {
  unitSystem: "imperial",
  wallLength: 10,
  wallHeight: 10,
  openingsArea: 0,
  coverageRate: BRICK_PRESETS.modular.bricksPer100SquareFeet,
  wastePercent: 5,
};

function close(actual, expected, tolerance = 1e-10) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

test("matches the BIA Modular 675 brick per 100 square feet vector", () => {
  const noWaste = calculateBrick({ ...baseInput, wastePercent: 0 });

  close(noWaste.grossAreaSquareFeet, 100);
  close(noWaste.netAreaSquareFeet, 100);
  close(noWaste.bricksPer100SquareFeet, 675);
  close(noWaste.exactNetBricks, 675);
  assert.equal(noWaste.minimumWholeBricks, 675);
  assert.equal(noWaste.orderBricks, 675);

  const fivePercent = calculateBrick(baseInput);
  assert.equal(fivePercent.orderBricks, 709);
  assert.equal(fivePercent.allowanceAddedBricks, 34);
});

test("matches the BIA Standard non-modular 655 brick per 100 square feet vector", () => {
  const result = calculateBrick({
    ...baseInput,
    coverageRate: BRICK_PRESETS.standard.bricksPer100SquareFeet,
    wastePercent: 0,
  });

  close(result.exactNetBricks, 655);
  assert.equal(result.orderBricks, 655);
});

test("subtracts measured openings before applying coverage and waste", () => {
  const result = calculateBrick({
    ...baseInput,
    wallLength: 20,
    wallHeight: 8,
    openingsArea: 16,
  });

  close(result.grossAreaSquareFeet, 160);
  close(result.openingsAreaSquareFeet, 16);
  close(result.netAreaSquareFeet, 144);
  close(result.exactNetBricks, 972);
  assert.equal(result.minimumWholeBricks, 972);
  assert.equal(result.orderBricks, 1021);
});

test("metric and imperial descriptions of the same wall and coverage rate agree", () => {
  const imperial = calculateBrick({
    ...baseInput,
    wallLength: 20,
    wallHeight: 8,
    openingsArea: 16,
  });
  const metricCoverage = convertBrickCoverageRate(
    baseInput.coverageRate,
    "imperial",
    "metric",
  );
  const metric = calculateBrick({
    ...baseInput,
    unitSystem: "metric",
    wallLength: 20 * METERS_PER_FOOT,
    wallHeight: 8 * METERS_PER_FOOT,
    openingsArea: 16 * SQUARE_METERS_PER_SQUARE_FOOT,
    coverageRate: metricCoverage,
  });

  close(imperial.grossAreaSquareMeters, metric.grossAreaSquareMeters, 1e-12);
  close(imperial.netAreaSquareMeters, metric.netAreaSquareMeters, 1e-12);
  close(imperial.bricksPerSquareMeter, metric.bricksPerSquareMeter, 1e-12);
  close(imperial.exactNetBricks, metric.exactNetBricks, 1e-9);
  assert.equal(imperial.minimumWholeBricks, metric.minimumWholeBricks);
  assert.equal(imperial.orderBricks, metric.orderBricks);
});

test("converts BIA preset coverage without changing the physical density", () => {
  const imperial = brickPresetRate("modular", "imperial");
  const metric = brickPresetRate("modular", "metric");

  assert.equal(imperial, 675);
  close(
    metric,
    convertBrickCoverageRate(imperial, "imperial", "metric"),
    1e-12,
  );
  close(
    convertBrickCoverageRate(metric, "metric", "imperial"),
    imperial,
    1e-10,
  );
});

test("applies waste after the exact net brick estimate", () => {
  const noWaste = calculateBrick({
    ...baseInput,
    wallLength: 7.3,
    wallHeight: 5.2,
    coverageRate: 655,
    wastePercent: 0,
  });
  const withWaste = calculateBrick({
    ...baseInput,
    wallLength: 7.3,
    wallHeight: 5.2,
    coverageRate: 655,
    wastePercent: 17,
  });

  close(noWaste.exactNetBricks, withWaste.exactNetBricks);
  const expected = Math.ceil(withWaste.exactNetBricks * 1.17);
  assert.equal(withWaste.orderBricks, expected);
});

test("does not add a brick at an exact waste boundary", () => {
  const result = calculateBrick({
    ...baseInput,
    coverageRate: 100,
    wastePercent: 10,
  });

  close(result.exactNetBricks, 100);
  assert.equal(result.orderBricks, 110);
});

test("allows zero openings and rejects openings that consume the wall", () => {
  assert.doesNotThrow(() => calculateBrick({ ...baseInput, openingsArea: 0 }));

  for (const openingsArea of [100, 101]) {
    assert.throws(
      () => calculateBrick({ ...baseInput, openingsArea }),
      (error) =>
        error instanceof BrickInputError &&
        error.field === "openingsArea" &&
        error.message.includes("smaller than the gross wall area"),
    );
  }
});

test("rejects invalid wall dimensions, openings, and coverage rates", () => {
  for (const invalid of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(
      () => calculateBrick({ ...baseInput, wallLength: invalid }),
      (error) =>
        error instanceof BrickInputError && error.field === "wallLength",
    );
    assert.throws(
      () => calculateBrick({ ...baseInput, wallHeight: invalid }),
      (error) =>
        error instanceof BrickInputError && error.field === "wallHeight",
    );
    assert.throws(
      () => calculateBrick({ ...baseInput, coverageRate: invalid }),
      (error) =>
        error instanceof BrickInputError && error.field === "coverageRate",
    );
  }

  for (const invalid of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(
      () => calculateBrick({ ...baseInput, openingsArea: invalid }),
      (error) =>
        error instanceof BrickInputError && error.field === "openingsArea",
    );
  }
});

test("rejects waste allowances outside the documented range", () => {
  for (const invalid of [-1, 50.0001, 51, Number.NaN]) {
    assert.throws(
      () => calculateBrick({ ...baseInput, wastePercent: invalid }),
      (error) =>
        error instanceof BrickInputError && error.field === "wastePercent",
    );
  }
});

test("rejects an unsupported runtime unit system", () => {
  assert.throws(
    () => calculateBrick({ ...baseInput, unitSystem: "si" }),
    (error) =>
      error instanceof BrickInputError && error.field === "unitSystem",
  );
});

test("rejects underflow, overflow, and unsafe whole-brick quantities", () => {
  assert.throws(
    () =>
      calculateBrick({
        ...baseInput,
        unitSystem: "imperial",
        wallLength: Number.MIN_VALUE,
      }),
    (error) =>
      error instanceof BrickInputError &&
      error.message.includes("safe numeric range"),
  );

  assert.throws(
    () =>
      calculateBrick({
        ...baseInput,
        unitSystem: "metric",
        wallLength: 1e200,
        wallHeight: 1e200,
        coverageRate: 100,
      }),
    (error) =>
      error instanceof BrickInputError &&
      error.message.includes("safe numeric range"),
  );

  assert.throws(
    () =>
      calculateBrick({
        ...baseInput,
        unitSystem: "metric",
        wallLength: 10_000_000,
        wallHeight: 10_000_000,
        coverageRate: 1000,
      }),
    (error) =>
      error instanceof BrickInputError &&
      error.message.includes("safe numeric range"),
  );
});

test("randomized valid inputs preserve area, waste, and procurement invariants", () => {
  let seed = 0xb71c5eed;
  const random = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };

  for (let index = 0; index < 250; index += 1) {
    const unitSystem = index % 2 === 0 ? "imperial" : "metric";
    const wallLength = 1 + random() * 100;
    const wallHeight = 1 + random() * 40;
    const grossArea = wallLength * wallHeight;
    const openingsArea = grossArea * random() * 0.7;
    const coverageRate =
      unitSystem === "imperial"
        ? 100 + random() * 900
        : 100 + random() * 900;
    const wastePercent = random() * 40;

    const result = calculateBrick({
      unitSystem,
      wallLength,
      wallHeight,
      openingsArea,
      coverageRate,
      wastePercent,
    });

    assert.ok(result.grossAreaSquareMeters > result.netAreaSquareMeters);
    assert.ok(result.netAreaSquareMeters > 0);
    assert.ok(result.exactNetBricks > 0);
    assert.ok(result.minimumWholeBricks >= result.exactNetBricks - 1e-9);
    assert.ok(result.orderBricks >= result.minimumWholeBricks);
    assert.equal(
      result.allowanceAddedBricks,
      result.orderBricks - result.minimumWholeBricks,
    );
    close(
      result.exactNetBricks,
      result.netAreaSquareMeters * result.bricksPerSquareMeter,
      1e-7,
    );
    assert.ok(
      result.orderBricks + 1e-9 >=
        result.exactNetBricks * (1 + wastePercent / 100),
    );
  }
});
