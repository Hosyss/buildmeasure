import assert from "node:assert/strict";
import test from "node:test";
import {
  BAG_YIELDS_CUBIC_FEET,
  calculatePostHoleConcrete,
  PostHoleConcreteInputError,
} from "../lib/calculators/post-hole-concrete.ts";
import { METERS_PER_FOOT, METERS_PER_INCH } from "../lib/units.ts";

const baseInput = {
  unitSystem: "imperial",
  holeCount: 1,
  holeDiameter: 12,
  holeDepth: 24,
  postShape: "none",
  postSize: 0,
  wastePercent: 0,
  bagSize: 80,
};

test("calculates one 12 in × 24 in cylindrical hole", () => {
  const result = calculatePostHoleConcrete(baseInput);

  assert.ok(Math.abs(result.cubicFeet - Math.PI / 2) < 1e-12);
  assert.ok(Math.abs(result.cubicYards - Math.PI / 54) < 1e-12);
  assert.equal(result.bags, 3);
});

test("multiplies per-hole concrete by the whole-number hole count", () => {
  const result = calculatePostHoleConcrete({
    ...baseInput,
    holeCount: 4,
    wastePercent: 10,
  });

  assert.ok(Math.abs(result.totalNetCubicMeters / METERS_PER_FOOT ** 3 - 2 * Math.PI) < 1e-12);
  assert.ok(Math.abs(result.cubicFeet - 2 * Math.PI * 1.1) < 1e-12);
  assert.equal(result.bags, 12);
});

test("subtracts a round post that occupies the full entered concrete depth", () => {
  const result = calculatePostHoleConcrete({
    ...baseInput,
    postShape: "round",
    postSize: 4,
  });

  assert.ok(Math.abs(result.cubicFeet - (4 * Math.PI) / 9) < 1e-12);
  assert.ok(result.displacedPerHoleCubicMeters > 0);
});

test("subtracts a square post that fits inside the round hole", () => {
  const result = calculatePostHoleConcrete({
    ...baseInput,
    postShape: "square",
    postSize: 4,
  });

  assert.ok(
    Math.abs(result.cubicFeet - (Math.PI / 2 - 2 / 9)) < 1e-12,
  );
});

test("metric and imperial descriptions of the same holes agree", () => {
  const imperial = calculatePostHoleConcrete({
    ...baseInput,
    holeCount: 5,
    postShape: "round",
    postSize: 4,
    wastePercent: 7.5,
  });
  const metric = calculatePostHoleConcrete({
    ...baseInput,
    unitSystem: "metric",
    holeCount: 5,
    holeDiameter: 12 * METERS_PER_INCH * 100,
    holeDepth: 24 * METERS_PER_INCH * 100,
    postShape: "round",
    postSize: 4 * METERS_PER_INCH * 100,
    wastePercent: 7.5,
  });

  assert.ok(Math.abs(imperial.totalNetCubicMeters - metric.totalNetCubicMeters) < 1e-12);
  assert.ok(Math.abs(imperial.orderCubicMeters - metric.orderCubicMeters) < 1e-12);
  assert.equal(imperial.bags, metric.bags);
});

test("applies allowance after post displacement and net volume", () => {
  const noWaste = calculatePostHoleConcrete({
    ...baseInput,
    postShape: "square",
    postSize: 4,
  });
  const withWaste = calculatePostHoleConcrete({
    ...baseInput,
    postShape: "square",
    postSize: 4,
    wastePercent: 25,
  });

  assert.equal(noWaste.totalNetCubicMeters, withWaste.totalNetCubicMeters);
  assert.ok(
    Math.abs(withWaste.orderCubicMeters - noWaste.totalNetCubicMeters * 1.25) <
      1e-12,
  );
});

test("rounds bag quantities up for every supported concrete bag size", () => {
  const input = { ...baseInput, holeCount: 3, wastePercent: 10 };

  for (const bagSize of [40, 60, 80]) {
    const result = calculatePostHoleConcrete({ ...input, bagSize });
    const exact = result.cubicFeet / BAG_YIELDS_CUBIC_FEET[bagSize];
    assert.ok(result.bags >= exact - 1e-9);
    assert.ok(result.bags - 1 < exact + 1e-9);
  }
});

test("does not add a bag at an exact cylindrical yield boundary", () => {
  const result = calculatePostHoleConcrete({
    ...baseInput,
    holeDepth: 28.8 / Math.PI,
    bagSize: 80,
  });

  assert.ok(Math.abs(result.cubicFeet - 0.6) < 1e-12);
  assert.equal(result.bags, 1);
});

test("rejects invalid hole counts and dimensions", () => {
  for (const holeCount of [0, -1, 1.5, Number.NaN, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(
      () => calculatePostHoleConcrete({ ...baseInput, holeCount }),
      (error) =>
        error instanceof PostHoleConcreteInputError &&
        error.field === "holeCount",
    );
  }

  for (const field of ["holeDiameter", "holeDepth"]) {
    for (const value of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.throws(
        () => calculatePostHoleConcrete({ ...baseInput, [field]: value }),
        (error) =>
          error instanceof PostHoleConcreteInputError && error.field === field,
      );
    }
  }
});

test("rejects unsupported post shapes and posts that cannot fit", () => {
  assert.throws(
    () => calculatePostHoleConcrete({ ...baseInput, postShape: "hexagon" }),
    (error) =>
      error instanceof PostHoleConcreteInputError && error.field === "postShape",
  );

  assert.throws(
    () =>
      calculatePostHoleConcrete({
        ...baseInput,
        postShape: "round",
        postSize: 12,
      }),
    (error) =>
      error instanceof PostHoleConcreteInputError && error.field === "postSize",
  );

  assert.throws(
    () =>
      calculatePostHoleConcrete({
        ...baseInput,
        postShape: "square",
        postSize: 9,
      }),
    (error) =>
      error instanceof PostHoleConcreteInputError && error.field === "postSize",
  );
});

test("rejects invalid post sizes, allowance, units, and bag sizes", () => {
  for (const postSize of [0, -1, Number.NaN]) {
    assert.throws(
      () =>
        calculatePostHoleConcrete({
          ...baseInput,
          postShape: "round",
          postSize,
        }),
      (error) =>
        error instanceof PostHoleConcreteInputError && error.field === "postSize",
    );
  }

  for (const wastePercent of [-0.1, 50.1, Number.NaN]) {
    assert.throws(
      () => calculatePostHoleConcrete({ ...baseInput, wastePercent }),
      (error) =>
        error instanceof PostHoleConcreteInputError &&
        error.field === "wastePercent",
    );
  }

  assert.throws(
    () => calculatePostHoleConcrete({ ...baseInput, unitSystem: "si" }),
    (error) =>
      error instanceof PostHoleConcreteInputError && error.field === "unitSystem",
  );

  assert.throws(
    () => calculatePostHoleConcrete({ ...baseInput, bagSize: 50 }),
    (error) =>
      error instanceof PostHoleConcreteInputError && error.field === "bagSize",
  );
});

test("rejects inputs that exceed the safe numeric range", () => {
  for (const holeDiameter of [Number.MIN_VALUE, Number.MAX_VALUE]) {
    assert.throws(
      () => calculatePostHoleConcrete({ ...baseInput, holeDiameter }),
      (error) =>
        error instanceof PostHoleConcreteInputError &&
        error.message.includes("safe numeric range"),
    );
  }
});

test("randomized valid inputs preserve cylindrical volume and procurement invariants", () => {
  let seed = 0x50a7;
  const random = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };

  for (let index = 0; index < 250; index += 1) {
    const unitSystem = index % 2 === 0 ? "imperial" : "metric";
    const holeCount = 1 + Math.floor(random() * 30);
    const holeDiameter = 8 + random() * 22;
    const holeDepth = 12 + random() * 48;
    const postShape = ["none", "round", "square"][index % 3];
    const postSize =
      postShape === "none"
        ? 0
        : holeDiameter * (postShape === "round" ? 0.35 : 0.4);
    const wastePercent = random() * 50;
    const bagSize = [40, 60, 80][index % 3];

    const result = calculatePostHoleConcrete({
      unitSystem,
      holeCount,
      holeDiameter,
      holeDepth,
      postShape,
      postSize,
      wastePercent,
      bagSize,
    });

    const scale = unitSystem === "imperial" ? METERS_PER_INCH : 0.01;
    const diameterMeters = holeDiameter * scale;
    const depthMeters = holeDepth * scale;
    const postSizeMeters = postSize * scale;
    const gross = Math.PI * (diameterMeters / 2) ** 2 * depthMeters;
    const displacement =
      postShape === "round"
        ? Math.PI * (postSizeMeters / 2) ** 2 * depthMeters
        : postShape === "square"
          ? postSizeMeters ** 2 * depthMeters
          : 0;
    const expectedNet = (gross - displacement) * holeCount;
    const expectedOrder = expectedNet * (1 + wastePercent / 100);
    const relativeError =
      Math.abs(result.orderCubicMeters - expectedOrder) / expectedOrder;
    const exactBags = result.cubicFeet / BAG_YIELDS_CUBIC_FEET[bagSize];

    assert.ok(relativeError < 1e-12);
    assert.ok(result.totalNetCubicMeters > 0);
    assert.ok(result.orderCubicMeters >= result.totalNetCubicMeters);
    assert.ok(result.bags >= exactBags - 1e-9);
    assert.ok(result.bags - 1 < exactBags + 1e-9);
    assert.ok(Number.isSafeInteger(result.bags));
  }
});
