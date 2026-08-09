import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateGravel,
  GravelInputError,
} from "../lib/calculators/gravel.ts";
import {
  CENTIMETERS_PER_INCH,
  KILOGRAMS_PER_CUBIC_METER_PER_POUND_PER_CUBIC_FOOT,
  KILOGRAMS_PER_POUND,
  METERS_PER_FOOT,
} from "../lib/units.ts";

const baseInput = {
  unitSystem: "imperial",
  length: 10,
  width: 10,
  depth: 4,
  wastePercent: 10,
  bulkDensity: 93,
  bagWeight: 50,
};

test("matches the documented 10 × 10 × 4 in known-result vector", () => {
  const result = calculateGravel(baseInput);

  assert.ok(Math.abs(result.netCubicFeet - 33.3333333333) < 1e-9);
  assert.ok(Math.abs(result.netCubicYards - 1.2345679012) < 1e-9);
  assert.ok(Math.abs(result.orderCubicFeet - 36.6666666667) < 1e-9);
  assert.ok(Math.abs(result.orderCubicYards - 1.3580246914) < 1e-9);
  assert.ok(Math.abs(result.massPounds - 3410) < 1e-9);
  assert.ok(Math.abs(result.shortTons - 1.705) < 1e-12);
  assert.ok(Math.abs(result.metricTonnes - 1.5467499817) < 1e-12);
  assert.equal(result.bags, 69);
});

test("metric and imperial descriptions of the same layer agree", () => {
  const imperial = calculateGravel(baseInput);
  const metric = calculateGravel({
    ...baseInput,
    unitSystem: "metric",
    length: baseInput.length * METERS_PER_FOOT,
    width: baseInput.width * METERS_PER_FOOT,
    depth: baseInput.depth * CENTIMETERS_PER_INCH,
    bulkDensity:
      baseInput.bulkDensity *
      KILOGRAMS_PER_CUBIC_METER_PER_POUND_PER_CUBIC_FOOT,
    bagWeight: baseInput.bagWeight * KILOGRAMS_PER_POUND,
  });

  assert.ok(
    Math.abs(imperial.netCubicMeters - metric.netCubicMeters) < 1e-12,
  );
  assert.ok(
    Math.abs(imperial.massKilograms - metric.massKilograms) < 1e-12,
  );
  assert.equal(imperial.bags, metric.bags);
});

test("applies allowance after calculating net volume", () => {
  const noAllowance = calculateGravel({ ...baseInput, wastePercent: 0 });
  const highAllowance = calculateGravel({ ...baseInput, wastePercent: 50 });

  assert.equal(noAllowance.netCubicMeters, highAllowance.netCubicMeters);
  assert.ok(
    Math.abs(
      highAllowance.orderCubicMeters - noAllowance.netCubicMeters * 1.5,
    ) < 1e-12,
  );
  assert.ok(highAllowance.massKilograms > noAllowance.massKilograms);
});

test("rounds bags upward", () => {
  const result = calculateGravel({
    ...baseInput,
    length: 1,
    width: 1,
    depth: 12,
    wastePercent: 0,
    bulkDensity: 101,
    bagWeight: 50,
  });

  assert.ok(Math.abs(result.massPounds - 101) < 1e-10);
  assert.equal(result.bags, 3);
});

test("does not add a bag at an exact mass boundary", () => {
  const result = calculateGravel({
    ...baseInput,
    length: 1,
    width: 1,
    depth: 12,
    wastePercent: 0,
    bulkDensity: 100,
    bagWeight: 50,
  });

  assert.ok(Math.abs(result.massPounds - 100) < 1e-10);
  assert.equal(result.bags, 2);
});

test("keeps volume independent from density and bag size", () => {
  const first = calculateGravel(baseInput);
  const second = calculateGravel({
    ...baseInput,
    bulkDensity: 110,
    bagWeight: 25,
  });

  assert.equal(first.netCubicMeters, second.netCubicMeters);
  assert.equal(first.orderCubicMeters, second.orderCubicMeters);
  assert.notEqual(first.massKilograms, second.massKilograms);
  assert.notEqual(first.bags, second.bags);
});

test("rejects zero, negative, and non-finite positive inputs", () => {
  for (const field of [
    "length",
    "width",
    "depth",
    "bulkDensity",
    "bagWeight",
  ]) {
    for (const invalid of [
      0,
      -1,
      Number.NaN,
      Number.POSITIVE_INFINITY,
    ]) {
      assert.throws(
        () => calculateGravel({ ...baseInput, [field]: invalid }),
        (error) =>
          error instanceof GravelInputError &&
          error.field === field &&
          error.message === "Enter a number greater than zero.",
      );
    }
  }
});

test("rejects allowances outside the documented range", () => {
  for (const invalid of [-0.1, 50.1, Number.NaN]) {
    assert.throws(
      () => calculateGravel({ ...baseInput, wastePercent: invalid }),
      (error) =>
        error instanceof GravelInputError &&
        error.field === "wastePercent",
    );
  }
});

test("rejects an unsupported runtime unit system", () => {
  assert.throws(
    () => calculateGravel({ ...baseInput, unitSystem: "si" }),
    (error) =>
      error instanceof GravelInputError && error.field === "unitSystem",
  );
});

test("rejects underflow, overflow, and unsafe bag quantities", () => {
  for (const length of [Number.MIN_VALUE, Number.MAX_VALUE]) {
    assert.throws(
      () => calculateGravel({ ...baseInput, length }),
      (error) =>
        error instanceof GravelInputError &&
        error.message.includes("safe numeric range"),
    );
  }

  assert.throws(
    () =>
      calculateGravel({
        ...baseInput,
        length: 1_000_000_000,
        width: 1_000_000_000,
        depth: 12,
      }),
    (error) =>
      error instanceof GravelInputError &&
      error.message.includes("safe numeric range"),
  );

  assert.throws(
    () =>
      calculateGravel({
        ...baseInput,
        bagWeight: Number.MIN_VALUE,
      }),
    (error) =>
      error instanceof GravelInputError &&
      error.message.includes("safe numeric range"),
  );
});

test("randomized valid inputs preserve volume, mass, and bag invariants", () => {
  let seed = 0x6a617665;
  const random = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };

  for (let index = 0; index < 300; index += 1) {
    const unitSystem = index % 2 === 0 ? "imperial" : "metric";
    const length = 0.5 + random() * 100;
    const width = 0.5 + random() * 100;
    const depth = 1 + random() * 24;
    const wastePercent = random() * 50;
    const bulkDensity =
      unitSystem === "imperial"
        ? 70 + random() * 80
        : 1100 + random() * 1300;
    const bagWeight =
      unitSystem === "imperial"
        ? 20 + random() * 80
        : 10 + random() * 40;
    const result = calculateGravel({
      unitSystem,
      length,
      width,
      depth,
      wastePercent,
      bulkDensity,
      bagWeight,
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
    const exactBags = result.massKilograms / result.bagWeightKilograms;

    assert.ok(relativeError < 1e-12);
    assert.ok(result.orderCubicMeters >= result.netCubicMeters);
    assert.ok(result.massKilograms > 0);
    assert.ok(result.bags >= exactBags - 1e-9);
    assert.ok(result.bags - 1 < exactBags + 1e-9);
    assert.ok(Number.isSafeInteger(result.bags));
  }
});
