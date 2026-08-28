import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateFootingConcrete,
  FootingInputError,
  MAX_FOOTING_QUANTITY,
} from "../lib/calculators/footing.ts";
import {
  BAG_YIELDS_CUBIC_FEET,
  METERS_PER_FOOT,
} from "../lib/calculators/concrete.ts";

const baseInput = {
  unitSystem: "imperial",
  footingLength: 10,
  footingWidth: 2,
  footingDepth: 8,
  quantity: 1,
  wastePercent: 0,
  bagSize: 80,
};

test("calculates one 10 ft × 2 ft × 8 in rectangular footing", () => {
  const result = calculateFootingConcrete(baseInput);

  assert.ok(Math.abs(result.cubicFeet - 13.333333333333334) < 1e-12);
  assert.ok(Math.abs(result.cubicYards - 0.4938271604938272) < 1e-12);
  assert.equal(result.bags, 23);
});

test("combines identical footings before final bag rounding", () => {
  const result = calculateFootingConcrete({
    ...baseInput,
    quantity: 3,
  });

  assert.ok(Math.abs(result.cubicFeet - 40) < 1e-12);
  assert.equal(result.bags, 67);
  assert.ok(Math.abs(result.perFootingCubicFeet * 3 - 40) < 1e-12);
});

test("calculates metric footing dimensions directly", () => {
  const result = calculateFootingConcrete({
    ...baseInput,
    unitSystem: "metric",
    footingLength: 4,
    footingWidth: 0.6,
    footingDepth: 25,
    quantity: 2,
  });

  assert.ok(Math.abs(result.perFootingCubicMeters - 0.6) < 1e-12);
  assert.ok(Math.abs(result.netCubicMeters - 1.2) < 1e-12);
  assert.ok(Math.abs(result.orderCubicMeters - 1.2) < 1e-12);
  assert.ok(Math.abs(result.liters - 1200) < 1e-9);
});

test("applies allowance after calculating total net volume", () => {
  const noAllowance = calculateFootingConcrete(baseInput);
  const withAllowance = calculateFootingConcrete({
    ...baseInput,
    wastePercent: 10,
  });

  assert.equal(noAllowance.netCubicMeters, withAllowance.netCubicMeters);
  assert.ok(
    Math.abs(
      withAllowance.orderCubicMeters - noAllowance.netCubicMeters * 1.1,
    ) < 1e-12,
  );
});

test("rounds complete bag quantities upward for every supported bag size", () => {
  assert.equal(
    calculateFootingConcrete({ ...baseInput, bagSize: 40 }).bags,
    45,
  );
  assert.equal(
    calculateFootingConcrete({ ...baseInput, bagSize: 60 }).bags,
    30,
  );
  assert.equal(
    calculateFootingConcrete({ ...baseInput, bagSize: 80 }).bags,
    23,
  );
});

test("does not add a bag at an exact package-yield boundary", () => {
  const result = calculateFootingConcrete({
    ...baseInput,
    footingLength: 3,
    footingWidth: 3,
    footingDepth: 2,
    bagSize: 40,
  });

  // 3 ft × 3 ft × 2 in = 1.5 ft³; 1.5 ÷ 0.30 = exactly 5 bags.
  assert.equal(result.bags, 5);
});

test("metric and imperial descriptions of the same footing agree", () => {
  const imperial = calculateFootingConcrete(baseInput);
  const metric = calculateFootingConcrete({
    ...baseInput,
    unitSystem: "metric",
    footingLength: baseInput.footingLength * METERS_PER_FOOT,
    footingWidth: baseInput.footingWidth * METERS_PER_FOOT,
    footingDepth: baseInput.footingDepth * 2.54,
  });

  assert.ok(Math.abs(imperial.netCubicMeters - metric.netCubicMeters) < 1e-12);
  assert.ok(Math.abs(imperial.cubicYards - metric.cubicYards) < 1e-12);
  assert.equal(imperial.bags, metric.bags);
});

test("rejects invalid dimensions", () => {
  for (const invalid of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(
      () =>
        calculateFootingConcrete({
          ...baseInput,
          footingLength: invalid,
        }),
      (error) =>
        error instanceof FootingInputError &&
        error.field === "footingLength" &&
        error.message === "Enter a number greater than zero.",
    );
  }
});

test("rejects invalid footing quantities", () => {
  for (const invalid of [0, -1, 1.5, MAX_FOOTING_QUANTITY + 1, Number.NaN]) {
    assert.throws(
      () => calculateFootingConcrete({ ...baseInput, quantity: invalid }),
      (error) =>
        error instanceof FootingInputError && error.field === "quantity",
    );
  }
});

test("rejects allowance percentages outside the documented range", () => {
  for (const invalid of [-0.1, 50.1, Number.NaN]) {
    assert.throws(
      () =>
        calculateFootingConcrete({ ...baseInput, wastePercent: invalid }),
      (error) =>
        error instanceof FootingInputError && error.field === "wastePercent",
    );
  }
});

test("rejects unsupported runtime options", () => {
  assert.throws(
    () => calculateFootingConcrete({ ...baseInput, unitSystem: "si" }),
    (error) =>
      error instanceof FootingInputError && error.field === "unitSystem",
  );

  for (const bagSize of [50, "toString"]) {
    assert.throws(
      () => calculateFootingConcrete({ ...baseInput, bagSize }),
      (error) =>
        error instanceof FootingInputError && error.field === "bagSize",
    );
  }
});

test("rejects dimensions that cannot produce a numerically safe result", () => {
  for (const footingLength of [Number.MIN_VALUE, Number.MAX_VALUE]) {
    assert.throws(
      () =>
        calculateFootingConcrete({
          ...baseInput,
          footingLength,
        }),
      (error) =>
        error instanceof FootingInputError &&
        error.message.includes("safe numeric range"),
    );
  }
});

test("randomized valid inputs preserve geometry and procurement invariants", () => {
  let seed = 0xf0071a6;
  const random = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };

  for (let index = 0; index < 250; index += 1) {
    const unitSystem = index % 2 === 0 ? "imperial" : "metric";
    const footingLength = 0.5 + random() * 100;
    const footingWidth = 0.25 + random() * 20;
    const footingDepth = 1 + random() * 36;
    const quantity = 1 + Math.floor(random() * 100);
    const wastePercent = random() * 50;
    const bagSize = [40, 60, 80][index % 3];
    const result = calculateFootingConcrete({
      unitSystem,
      footingLength,
      footingWidth,
      footingDepth,
      quantity,
      wastePercent,
      bagSize,
    });

    const expectedPerFootingM3 =
      unitSystem === "imperial"
        ? footingLength *
          footingWidth *
          (footingDepth / 12) *
          METERS_PER_FOOT ** 3
        : footingLength * footingWidth * (footingDepth / 100);
    const expectedNetM3 = expectedPerFootingM3 * quantity;
    const expectedOrderM3 = expectedNetM3 * (1 + wastePercent / 100);
    const relativeError =
      Math.abs(result.orderCubicMeters - expectedOrderM3) / expectedOrderM3;
    const exactBags = result.cubicFeet / BAG_YIELDS_CUBIC_FEET[bagSize];

    assert.ok(relativeError < 1e-12);
    assert.ok(result.netCubicMeters >= result.perFootingCubicMeters);
    assert.ok(result.orderCubicMeters >= result.netCubicMeters);
    assert.ok(result.bags >= exactBags - 1e-9);
    assert.ok(result.bags - 1 < exactBags + 1e-9);
    assert.ok(Number.isSafeInteger(result.bags));
  }
});
