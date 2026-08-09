import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateMulch,
  MulchInputError,
} from "../lib/calculators/mulch.ts";
import {
  CENTIMETERS_PER_INCH,
  LITERS_PER_CUBIC_FOOT,
  METERS_PER_FOOT,
} from "../lib/units.ts";

const baseInput = {
  unitSystem: "imperial",
  length: 20,
  width: 10,
  depth: 3,
  wastePercent: 10,
  bagVolume: 2,
};

test("matches the documented 20 × 10 × 3 in known-result vector", () => {
  const result = calculateMulch(baseInput);

  assert.ok(Math.abs(result.netCubicFeet - 50) < 1e-10);
  assert.ok(Math.abs(result.netCubicYards - 1.85185185185) < 1e-10);
  assert.ok(Math.abs(result.orderCubicFeet - 55) < 1e-10);
  assert.ok(Math.abs(result.orderCubicYards - 2.03703703704) < 1e-10);
  assert.ok(Math.abs(result.coveragePerBagSquareFeet - 8) < 1e-10);
  assert.equal(result.bags, 28);
});

test("metric and imperial descriptions of the same bed agree", () => {
  const imperial = calculateMulch(baseInput);
  const metric = calculateMulch({
    ...baseInput,
    unitSystem: "metric",
    length: baseInput.length * METERS_PER_FOOT,
    width: baseInput.width * METERS_PER_FOOT,
    depth: baseInput.depth * CENTIMETERS_PER_INCH,
    bagVolume: baseInput.bagVolume * LITERS_PER_CUBIC_FOOT,
  });

  assert.ok(
    Math.abs(imperial.netCubicMeters - metric.netCubicMeters) < 1e-12,
  );
  assert.ok(
    Math.abs(imperial.orderCubicMeters - metric.orderCubicMeters) < 1e-12,
  );
  assert.ok(
    Math.abs(
      imperial.coveragePerBagSquareMeters -
        metric.coveragePerBagSquareMeters,
    ) < 1e-12,
  );
  assert.equal(imperial.bags, metric.bags);
});

test("applies allowance after calculating net volume", () => {
  const noAllowance = calculateMulch({ ...baseInput, wastePercent: 0 });
  const highAllowance = calculateMulch({
    ...baseInput,
    wastePercent: 50,
  });

  assert.equal(noAllowance.netCubicMeters, highAllowance.netCubicMeters);
  assert.ok(
    Math.abs(
      highAllowance.orderCubicMeters - noAllowance.netCubicMeters * 1.5,
    ) < 1e-12,
  );
  assert.ok(highAllowance.bags > noAllowance.bags);
});

test("rounds a partial bag upward", () => {
  const result = calculateMulch({
    ...baseInput,
    length: 10,
    width: 10,
    depth: 3,
    wastePercent: 0,
  });

  assert.ok(Math.abs(result.orderCubicFeet - 25) < 1e-10);
  assert.equal(result.bags, 13);
});

test("does not add a bag at an exact volume boundary", () => {
  const result = calculateMulch({
    ...baseInput,
    length: 4,
    width: 4,
    depth: 3,
    wastePercent: 0,
  });

  assert.ok(Math.abs(result.orderCubicFeet - 4) < 1e-10);
  assert.equal(result.bags, 2);
});

test("keeps bed volume independent from bag size", () => {
  const first = calculateMulch(baseInput);
  const second = calculateMulch({ ...baseInput, bagVolume: 3 });

  assert.equal(first.netCubicMeters, second.netCubicMeters);
  assert.equal(first.orderCubicMeters, second.orderCubicMeters);
  assert.notEqual(first.bags, second.bags);
  assert.notEqual(
    first.coveragePerBagSquareMeters,
    second.coveragePerBagSquareMeters,
  );
});

test("coverage per bag changes with installed depth", () => {
  const shallow = calculateMulch({ ...baseInput, depth: 2 });
  const deep = calculateMulch({ ...baseInput, depth: 4 });

  assert.ok(
    Math.abs(shallow.coveragePerBagSquareFeet - 12) < 1e-10,
  );
  assert.ok(Math.abs(deep.coveragePerBagSquareFeet - 6) < 1e-10);
});

test("rejects zero, negative, and non-finite positive inputs", () => {
  for (const field of ["length", "width", "depth", "bagVolume"]) {
    for (const invalid of [
      0,
      -1,
      Number.NaN,
      Number.POSITIVE_INFINITY,
    ]) {
      assert.throws(
        () => calculateMulch({ ...baseInput, [field]: invalid }),
        (error) =>
          error instanceof MulchInputError &&
          error.field === field &&
          error.message === "Enter a number greater than zero.",
      );
    }
  }
});

test("rejects allowances outside the documented range", () => {
  for (const invalid of [-0.1, 50.1, Number.NaN]) {
    assert.throws(
      () => calculateMulch({ ...baseInput, wastePercent: invalid }),
      (error) =>
        error instanceof MulchInputError &&
        error.field === "wastePercent",
    );
  }
});

test("rejects an unsupported runtime unit system", () => {
  assert.throws(
    () => calculateMulch({ ...baseInput, unitSystem: "si" }),
    (error) =>
      error instanceof MulchInputError && error.field === "unitSystem",
  );
});

test("rejects underflow, overflow, and unsafe bag quantities", () => {
  for (const length of [Number.MIN_VALUE, Number.MAX_VALUE]) {
    assert.throws(
      () => calculateMulch({ ...baseInput, length }),
      (error) =>
        error instanceof MulchInputError &&
        error.message.includes("safe numeric range"),
    );
  }

  assert.throws(
    () =>
      calculateMulch({
        ...baseInput,
        length: 1_000_000_000,
        width: 1_000_000_000,
        depth: 12,
      }),
    (error) =>
      error instanceof MulchInputError &&
      error.message.includes("safe numeric range"),
  );

  assert.throws(
    () => calculateMulch({ ...baseInput, bagVolume: Number.MIN_VALUE }),
    (error) =>
      error instanceof MulchInputError &&
      error.message.includes("safe numeric range"),
  );
});

test("randomized valid inputs preserve volume and procurement invariants", () => {
  let seed = 0x6d756c63;
  const random = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };

  for (let index = 0; index < 300; index += 1) {
    const unitSystem = index % 2 === 0 ? "imperial" : "metric";
    const length = 0.5 + random() * 100;
    const width = 0.5 + random() * 100;
    const depth = 0.5 + random() * 12;
    const wastePercent = random() * 50;
    const bagVolume =
      unitSystem === "imperial"
        ? 0.5 + random() * 4
        : 10 + random() * 90;
    const result = calculateMulch({
      unitSystem,
      length,
      width,
      depth,
      wastePercent,
      bagVolume,
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
      result.orderCubicMeters / result.bagVolumeCubicMeters;

    assert.ok(relativeError < 1e-12);
    assert.ok(result.orderCubicMeters >= result.netCubicMeters);
    assert.ok(result.bags >= exactBags - 1e-9);
    assert.ok(result.bags - 1 < exactBags + 1e-9);
    assert.ok(Number.isSafeInteger(result.bags));
  }
});
