import assert from "node:assert/strict";
import test from "node:test";
import {
  BAG_YIELDS_CUBIC_FEET,
} from "../lib/calculators/concrete.ts";
import {
  calculateColumnConcrete,
  ColumnInputError,
  MAX_COLUMN_QUANTITY,
} from "../lib/calculators/column.ts";
import { METERS_PER_FOOT, METERS_PER_INCH } from "../lib/units.ts";

function close(actual, expected, tolerance = 1e-10) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)),
    `expected ${actual} to be close to ${expected}`,
  );
}

const baseRectangular = {
  unitSystem: "imperial",
  shape: "rectangular",
  height: 10,
  width: 12,
  depth: 12,
  diameter: 0,
  quantity: 3,
  wastePercent: 10,
  bagSize: 80,
};

const baseCircular = {
  unitSystem: "metric",
  shape: "circular",
  height: 3,
  width: 0,
  depth: 0,
  diameter: 30,
  quantity: 2,
  wastePercent: 5,
  bagSize: 80,
};

test("matches the three 12 in square-column reference vector", () => {
  const result = calculateColumnConcrete(baseRectangular);

  close(result.perColumnCubicFeet, 10);
  close(result.cubicFeet, 33);
  close(result.cubicYards, 33 / 27);
  assert.equal(result.bags, 55);
});

test("matches the circular metric reference vector", () => {
  const result = calculateColumnConcrete(baseCircular);

  close(result.perColumnCubicMeters, 0.21205750411731106);
  close(result.netCubicMeters, 0.4241150082346221);
  close(result.orderCubicMeters, 0.44532075864635323);
  assert.equal(result.bags, 27);
});

test("combines identical columns before final package rounding", () => {
  const one = calculateColumnConcrete({
    ...baseRectangular,
    height: 0.31,
    quantity: 1,
    wastePercent: 0,
  });
  const two = calculateColumnConcrete({
    ...baseRectangular,
    height: 0.31,
    quantity: 2,
    wastePercent: 0,
  });

  assert.equal(one.bags, 1);
  assert.equal(two.bags, 2);
  assert.ok(two.cubicFeet > BAG_YIELDS_CUBIC_FEET[80]);
});

test("does not add a bag at an exact yield boundary", () => {
  const result = calculateColumnConcrete({
    ...baseRectangular,
    height: 0.6,
    quantity: 1,
    wastePercent: 0,
  });

  close(result.cubicFeet, 0.6);
  assert.equal(result.bags, 1);
});

test("rectangular metric and imperial descriptions agree", () => {
  const imperial = calculateColumnConcrete({
    ...baseRectangular,
    width: 12,
    depth: 18,
    height: 10,
    quantity: 4,
    wastePercent: 12,
  });
  const metric = calculateColumnConcrete({
    ...baseRectangular,
    unitSystem: "metric",
    width: 30.48,
    depth: 45.72,
    height: 3.048,
    quantity: 4,
    wastePercent: 12,
  });

  close(metric.netCubicMeters, imperial.netCubicMeters);
  close(metric.orderCubicMeters, imperial.orderCubicMeters);
  assert.equal(metric.bags, imperial.bags);
});

test("circular metric and imperial descriptions agree", () => {
  const imperial = calculateColumnConcrete({
    ...baseCircular,
    unitSystem: "imperial",
    height: 8,
    diameter: 24,
    quantity: 5,
    wastePercent: 8,
  });
  const metric = calculateColumnConcrete({
    ...baseCircular,
    height: 2.4384,
    diameter: 60.96,
    quantity: 5,
    wastePercent: 8,
  });

  close(metric.netCubicMeters, imperial.netCubicMeters);
  close(metric.orderCubicMeters, imperial.orderCubicMeters);
  assert.equal(metric.bags, imperial.bags);
});

test("applies allowance only after net project volume", () => {
  const zero = calculateColumnConcrete({ ...baseRectangular, wastePercent: 0 });
  for (const wastePercent of [10, 25, 50]) {
    const result = calculateColumnConcrete({ ...baseRectangular, wastePercent });
    close(result.netCubicMeters, zero.netCubicMeters);
    close(
      result.orderCubicMeters,
      zero.netCubicMeters * (1 + wastePercent / 100),
    );
  }
});

test("validates only the dimensions used by the selected shape", () => {
  assert.doesNotThrow(() =>
    calculateColumnConcrete({ ...baseRectangular, diameter: 0 }),
  );
  assert.doesNotThrow(() =>
    calculateColumnConcrete({ ...baseCircular, width: 0, depth: 0 }),
  );
});

test("rejects invalid active dimensions", () => {
  for (const [field, value] of [
    ["height", 0],
    ["height", -1],
    ["height", Number.POSITIVE_INFINITY],
    ["width", 0],
    ["depth", Number.NaN],
  ]) {
    assert.throws(
      () => calculateColumnConcrete({ ...baseRectangular, [field]: value }),
      (error) => error instanceof ColumnInputError && error.field === field,
    );
  }

  assert.throws(
    () => calculateColumnConcrete({ ...baseCircular, diameter: 0 }),
    (error) => error instanceof ColumnInputError && error.field === "diameter",
  );
});

test("rejects invalid column quantities", () => {
  for (const quantity of [0, -1, 1.5, MAX_COLUMN_QUANTITY + 1, Number.NaN]) {
    assert.throws(
      () => calculateColumnConcrete({ ...baseRectangular, quantity }),
      (error) => error instanceof ColumnInputError && error.field === "quantity",
    );
  }
});

test("rejects invalid allowances, shapes, units, and bag sizes", () => {
  for (const wastePercent of [-0.1, 50.1, Number.NaN]) {
    assert.throws(
      () => calculateColumnConcrete({ ...baseRectangular, wastePercent }),
      (error) => error instanceof ColumnInputError && error.field === "wastePercent",
    );
  }

  assert.throws(
    () => calculateColumnConcrete({ ...baseRectangular, shape: "hexagonal" }),
    (error) => error instanceof ColumnInputError && error.field === "shape",
  );
  assert.throws(
    () => calculateColumnConcrete({ ...baseRectangular, unitSystem: "yards" }),
    (error) => error instanceof ColumnInputError && error.field === "unitSystem",
  );
  assert.throws(
    () => calculateColumnConcrete({ ...baseRectangular, bagSize: 50 }),
    (error) => error instanceof ColumnInputError && error.field === "bagSize",
  );
});

test("rejects underflow and overflow instead of returning misleading values", () => {
  assert.throws(
    () => calculateColumnConcrete({ ...baseRectangular, width: Number.MIN_VALUE }),
    ColumnInputError,
  );
  assert.throws(
    () =>
      calculateColumnConcrete({
        ...baseRectangular,
        width: Number.MAX_VALUE,
        depth: Number.MAX_VALUE,
      }),
    ColumnInputError,
  );
});

function createRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

function randomBetween(rng, min, max) {
  return min + rng() * (max - min);
}

test("500 deterministic randomized inputs preserve geometry and procurement invariants", () => {
  const rng = createRng(0x434f4c55);
  const bagSizes = [40, 60, 80];

  for (let index = 0; index < 500; index += 1) {
    const shape = index % 2 === 0 ? "rectangular" : "circular";
    const unitSystem = index % 3 === 0 ? "metric" : "imperial";
    const quantity = 1 + Math.floor(rng() * 50);
    const wastePercent = randomBetween(rng, 0, 50);
    const bagSize = bagSizes[index % bagSizes.length];
    const height = unitSystem === "imperial"
      ? randomBetween(rng, 1, 30)
      : randomBetween(rng, 0.3, 9);
    const width = unitSystem === "imperial"
      ? randomBetween(rng, 4, 48)
      : randomBetween(rng, 10, 120);
    const depth = unitSystem === "imperial"
      ? randomBetween(rng, 4, 48)
      : randomBetween(rng, 10, 120);
    const diameter = unitSystem === "imperial"
      ? randomBetween(rng, 4, 60)
      : randomBetween(rng, 10, 150);

    const result = calculateColumnConcrete({
      unitSystem,
      shape,
      height,
      width,
      depth,
      diameter,
      quantity,
      wastePercent,
      bagSize,
    });

    const heightMeters = unitSystem === "imperial" ? height * METERS_PER_FOOT : height;
    const scale = unitSystem === "imperial" ? METERS_PER_INCH : 0.01;
    const expectedArea = shape === "rectangular"
      ? width * scale * depth * scale
      : Math.PI * (diameter * scale / 2) ** 2;
    const expectedPerColumn = expectedArea * heightMeters;
    const expectedNet = expectedPerColumn * quantity;
    const expectedOrder = expectedNet * (1 + wastePercent / 100);

    close(result.crossSectionSquareMeters, expectedArea);
    close(result.perColumnCubicMeters, expectedPerColumn);
    close(result.netCubicMeters, expectedNet);
    close(result.orderCubicMeters, expectedOrder);
    assert.ok(result.bags >= 1);
    assert.ok(result.bags * BAG_YIELDS_CUBIC_FEET[bagSize] + 1e-10 >= result.cubicFeet);
    assert.ok(
      result.bags === 1 ||
      (result.bags - 1) * BAG_YIELDS_CUBIC_FEET[bagSize] < result.cubicFeet + 1e-10,
    );
  }
});
