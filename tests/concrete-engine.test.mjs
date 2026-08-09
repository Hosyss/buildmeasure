import assert from "node:assert/strict";
import test from "node:test";
import {
  BAG_YIELDS_CUBIC_FEET,
  calculateConcrete,
  ConcreteInputError,
  METERS_PER_FOOT,
} from "../lib/calculators/concrete.ts";

const baseInput = {
  unitSystem: "imperial",
  length: 10,
  width: 10,
  depth: 4,
  wastePercent: 0,
  bagSize: 80,
};

test("calculates a 10 × 10 × 4 in slab in cubic feet and yards", () => {
  const result = calculateConcrete(baseInput);

  assert.ok(Math.abs(result.cubicFeet - 33.3333333333) < 1e-9);
  assert.ok(Math.abs(result.cubicYards - 1.2345679012) < 1e-9);
  assert.equal(result.bags, 56);
});

test("matches the one-cubic-yard slab reference vector", () => {
  const result = calculateConcrete({
    ...baseInput,
    length: 9,
    width: 9,
    depth: 4,
  });

  assert.ok(Math.abs(result.cubicFeet - 27) < 1e-12);
  assert.ok(Math.abs(result.cubicYards - 1) < 1e-12);
  assert.equal(result.bags, 45);
});

test("calculates metric dimensions without a unit-system shortcut", () => {
  const result = calculateConcrete({
    ...baseInput,
    unitSystem: "metric",
    length: 5,
    width: 4,
    depth: 10,
  });

  assert.ok(Math.abs(result.netCubicMeters - 2) < 1e-12);
  assert.ok(Math.abs(result.orderCubicMeters - 2) < 1e-12);
  assert.equal(result.liters, 2000);
});

test("applies waste after calculating net volume", () => {
  const result = calculateConcrete({
    ...baseInput,
    unitSystem: "metric",
    length: 5,
    width: 4,
    depth: 10,
    wastePercent: 10,
  });

  assert.ok(Math.abs(result.netCubicMeters - 2) < 1e-12);
  assert.ok(Math.abs(result.orderCubicMeters - 2.2) < 1e-12);
});

test("rounds bag quantities up for every supported bag size", () => {
  const common = {
    ...baseInput,
    length: 5,
    width: 6,
    depth: 4,
  };

  assert.equal(calculateConcrete({ ...common, bagSize: 40 }).bags, 34);
  assert.equal(calculateConcrete({ ...common, bagSize: 60 }).bags, 23);
  assert.equal(calculateConcrete({ ...common, bagSize: 80 }).bags, 17);
});

test("does not add a bag at an exact yield boundary", () => {
  const result = calculateConcrete({
    ...baseInput,
    length: 3,
    width: 3,
    depth: 2,
    bagSize: 40,
  });

  // 3 ft × 3 ft × 2 in = 1.5 ft³; 1.5 ÷ 0.30 = exactly 5 bags.
  assert.equal(result.bags, 5);
});

test("metric and imperial inputs describing the same slab agree", () => {
  const imperial = calculateConcrete(baseInput);
  const metric = calculateConcrete({
    ...baseInput,
    unitSystem: "metric",
    length: 10 * METERS_PER_FOOT,
    width: 10 * METERS_PER_FOOT,
    depth: 4 * 2.54,
  });

  assert.ok(Math.abs(imperial.netCubicMeters - metric.netCubicMeters) < 1e-12);
  assert.ok(Math.abs(imperial.cubicYards - metric.cubicYards) < 1e-12);
});

test("rejects empty, zero, negative, and non-finite dimensions", () => {
  for (const invalid of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(
      () => calculateConcrete({ ...baseInput, length: invalid }),
      (error) =>
        error instanceof ConcreteInputError &&
        error.field === "length" &&
        error.message === "Enter a number greater than zero.",
    );
  }
});

test("rejects waste percentages outside the documented range", () => {
  for (const invalid of [-0.1, 50.1, Number.NaN]) {
    assert.throws(
      () => calculateConcrete({ ...baseInput, wastePercent: invalid }),
      (error) =>
        error instanceof ConcreteInputError &&
        error.field === "wastePercent",
    );
  }
});

test("rejects unsupported runtime options", () => {
  assert.throws(
    () => calculateConcrete({ ...baseInput, unitSystem: "si" }),
    (error) =>
      error instanceof ConcreteInputError &&
      error.field === "unitSystem",
  );

  for (const bagSize of [50, "toString"]) {
    assert.throws(
      () => calculateConcrete({ ...baseInput, bagSize }),
      (error) =>
        error instanceof ConcreteInputError &&
        error.field === "bagSize",
    );
  }
});

test("rejects dimensions that cannot produce a numerically safe result", () => {
  for (const length of [Number.MIN_VALUE, Number.MAX_VALUE]) {
    assert.throws(
      () => calculateConcrete({ ...baseInput, length }),
      (error) =>
        error instanceof ConcreteInputError &&
        error.message.includes("safe numeric range"),
    );
  }

  assert.throws(
    () =>
      calculateConcrete({
        ...baseInput,
        length: 1_000_000_000,
        width: 1_000_000_000,
        depth: 12,
      }),
    (error) =>
      error instanceof ConcreteInputError &&
      error.message.includes("safe numeric range"),
  );
});

test("keeps net volume unchanged when only waste changes", () => {
  const noWaste = calculateConcrete(baseInput);
  const highWaste = calculateConcrete({ ...baseInput, wastePercent: 50 });

  assert.equal(noWaste.netCubicMeters, highWaste.netCubicMeters);
  assert.ok(
    Math.abs(highWaste.orderCubicMeters - noWaste.netCubicMeters * 1.5) <
      1e-12,
  );
});

test("randomized valid inputs preserve volume and procurement invariants", () => {
  let seed = 0xc0ffee;
  const random = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };

  for (let index = 0; index < 250; index += 1) {
    const unitSystem = index % 2 === 0 ? "imperial" : "metric";
    const length = 0.5 + random() * 100;
    const width = 0.5 + random() * 100;
    const depth = 1 + random() * 24;
    const wastePercent = random() * 50;
    const bagSize = [40, 60, 80][index % 3];
    const result = calculateConcrete({
      unitSystem,
      length,
      width,
      depth,
      wastePercent,
      bagSize,
    });
    const expectedNetCubicMeters =
      unitSystem === "imperial"
        ? length * width * (depth / 12) * METERS_PER_FOOT ** 3
        : length * width * (depth / 100);
    const expectedOrderCubicMeters =
      expectedNetCubicMeters * (1 + wastePercent / 100);
    const relativeError =
      Math.abs(result.orderCubicMeters - expectedOrderCubicMeters) /
      expectedOrderCubicMeters;
    const exactBags =
      result.cubicFeet / BAG_YIELDS_CUBIC_FEET[bagSize];

    assert.ok(relativeError < 1e-12);
    assert.ok(result.orderCubicMeters >= result.netCubicMeters);
    assert.ok(result.bags >= exactBags - 1e-9);
    assert.ok(result.bags - 1 < exactBags + 1e-9);
    assert.ok(Number.isSafeInteger(result.bags));
  }
});
