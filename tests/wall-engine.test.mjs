import assert from "node:assert/strict";
import test from "node:test";
import { BAG_YIELDS_CUBIC_FEET } from "../lib/calculators/concrete.ts";
import {
  calculateWallConcrete,
  MAX_WALL_QUANTITY,
  WallInputError,
} from "../lib/calculators/wall.ts";
import { METERS_PER_FOOT, METERS_PER_INCH } from "../lib/units.ts";

function close(actual, expected, tolerance = 1e-10) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)),
    `expected ${actual} to be close to ${expected}`,
  );
}

const base = {
  unitSystem: "imperial",
  length: 10,
  height: 8,
  thickness: 6,
  openingsArea: 16,
  quantity: 1,
  wastePercent: 10,
  bagSize: 80,
};

test("matches the 10 ft × 8 ft × 6 in wall reference vector", () => {
  const result = calculateWallConcrete(base);

  close(result.grossFaceAreaSquareMetersPerWall / METERS_PER_FOOT ** 2, 80);
  close(result.netFaceAreaSquareFeetPerWall, 64);
  close(result.perWallCubicFeet, 32);
  close(result.cubicFeet, 35.2);
  close(result.cubicYards, 35.2 / 27);
  assert.equal(result.bags, 59);
});

test("matches the two-wall metric reference vector", () => {
  const result = calculateWallConcrete({
    ...base,
    unitSystem: "metric",
    length: 4,
    height: 2.5,
    thickness: 20,
    openingsArea: 2,
    quantity: 2,
    wastePercent: 5,
  });

  close(result.grossFaceAreaSquareMetersPerWall, 10);
  close(result.netFaceAreaSquareMetersPerWall, 8);
  close(result.perWallCubicMeters, 1.6);
  close(result.netCubicMeters, 3.2);
  close(result.orderCubicMeters, 3.36);
});

test("allows zero openings and subtracts measured openings before thickness", () => {
  const solid = calculateWallConcrete({ ...base, openingsArea: 0, wastePercent: 0 });
  const opened = calculateWallConcrete({ ...base, openingsArea: 16, wastePercent: 0 });

  close(solid.perWallCubicFeet, 40);
  close(opened.perWallCubicFeet, 32);
  assert.ok(opened.perWallCubicFeet < solid.perWallCubicFeet);
});

test("combines identical walls before final bag rounding", () => {
  const one = calculateWallConcrete({
    ...base,
    length: 1,
    height: 1,
    thickness: 6,
    openingsArea: 0,
    quantity: 1,
    wastePercent: 0,
  });
  const two = calculateWallConcrete({
    ...base,
    length: 1,
    height: 1,
    thickness: 6,
    openingsArea: 0,
    quantity: 2,
    wastePercent: 0,
  });

  close(one.cubicFeet, 0.5);
  close(two.cubicFeet, 1);
  assert.equal(one.bags, 1);
  assert.equal(two.bags, 2);
});

test("does not add a bag at an exact yield boundary", () => {
  const result = calculateWallConcrete({
    ...base,
    length: 1,
    height: 1,
    thickness: 7.2,
    openingsArea: 0,
    quantity: 1,
    wastePercent: 0,
  });

  close(result.cubicFeet, 0.6);
  assert.equal(result.bags, 1);
});

test("metric and imperial descriptions of the same wall agree", () => {
  const imperial = calculateWallConcrete({
    ...base,
    length: 12,
    height: 9,
    thickness: 8,
    openingsArea: 20,
    quantity: 3,
    wastePercent: 12,
  });
  const metric = calculateWallConcrete({
    ...base,
    unitSystem: "metric",
    length: 12 * METERS_PER_FOOT,
    height: 9 * METERS_PER_FOOT,
    thickness: (8 * METERS_PER_INCH) / 0.01,
    openingsArea: 20 * METERS_PER_FOOT ** 2,
    quantity: 3,
    wastePercent: 12,
  });

  close(metric.netCubicMeters, imperial.netCubicMeters);
  close(metric.orderCubicMeters, imperial.orderCubicMeters);
  assert.equal(metric.bags, imperial.bags);
});

test("keeps net volume unchanged when only allowance changes", () => {
  const zero = calculateWallConcrete({ ...base, wastePercent: 0 });
  for (const wastePercent of [10, 25, 50]) {
    const result = calculateWallConcrete({ ...base, wastePercent });
    close(result.netCubicMeters, zero.netCubicMeters);
    close(result.orderCubicMeters, zero.netCubicMeters * (1 + wastePercent / 100));
  }
});

test("rejects openings that consume or exceed the wall face", () => {
  for (const openingsArea of [80, 80.01, 100]) {
    assert.throws(
      () => calculateWallConcrete({ ...base, openingsArea }),
      (error) => error instanceof WallInputError && error.field === "openingsArea",
    );
  }
});

test("rejects invalid dimensions and openings", () => {
  for (const [field, value] of [
    ["length", 0],
    ["height", -1],
    ["thickness", Number.NaN],
  ]) {
    assert.throws(
      () => calculateWallConcrete({ ...base, [field]: value }),
      (error) => error instanceof WallInputError && error.field === field,
    );
  }

  for (const openingsArea of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(
      () => calculateWallConcrete({ ...base, openingsArea }),
      (error) => error instanceof WallInputError && error.field === "openingsArea",
    );
  }
});

test("rejects invalid quantities, allowances, units, and bag sizes", () => {
  for (const quantity of [0, -1, 1.2, MAX_WALL_QUANTITY + 1, Number.NaN]) {
    assert.throws(
      () => calculateWallConcrete({ ...base, quantity }),
      (error) => error instanceof WallInputError && error.field === "quantity",
    );
  }

  for (const wastePercent of [-0.1, 50.1, Number.NaN]) {
    assert.throws(
      () => calculateWallConcrete({ ...base, wastePercent }),
      (error) => error instanceof WallInputError && error.field === "wastePercent",
    );
  }

  assert.throws(
    () => calculateWallConcrete({ ...base, unitSystem: "yards" }),
    (error) => error instanceof WallInputError && error.field === "unitSystem",
  );
  assert.throws(
    () => calculateWallConcrete({ ...base, bagSize: 50 }),
    (error) => error instanceof WallInputError && error.field === "bagSize",
  );
});

test("rejects underflow and overflow instead of returning misleading values", () => {
  assert.throws(
    () => calculateWallConcrete({ ...base, thickness: Number.MIN_VALUE }),
    WallInputError,
  );
  assert.throws(
    () => calculateWallConcrete({ ...base, length: Number.MAX_VALUE, height: Number.MAX_VALUE }),
    WallInputError,
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

test("500 deterministic randomized inputs preserve wall geometry and procurement invariants", () => {
  const rng = createRng(0x57414c4c);
  const bagSizes = [40, 60, 80];

  for (let index = 0; index < 500; index += 1) {
    const unitSystem = index % 3 === 0 ? "metric" : "imperial";
    const length = unitSystem === "imperial" ? randomBetween(rng, 2, 60) : randomBetween(rng, 0.6, 18);
    const height = unitSystem === "imperial" ? randomBetween(rng, 2, 20) : randomBetween(rng, 0.6, 6);
    const thickness = unitSystem === "imperial" ? randomBetween(rng, 3, 24) : randomBetween(rng, 7.5, 60);
    const grossFaceArea = length * height;
    const openingsArea = randomBetween(rng, 0, grossFaceArea * 0.7);
    const quantity = 1 + Math.floor(rng() * 25);
    const wastePercent = randomBetween(rng, 0, 50);
    const bagSize = bagSizes[index % bagSizes.length];

    const result = calculateWallConcrete({
      unitSystem,
      length,
      height,
      thickness,
      openingsArea,
      quantity,
      wastePercent,
      bagSize,
    });

    const lengthMeters = unitSystem === "imperial" ? length * METERS_PER_FOOT : length;
    const heightMeters = unitSystem === "imperial" ? height * METERS_PER_FOOT : height;
    const thicknessMeters = unitSystem === "imperial" ? thickness * METERS_PER_INCH : thickness * 0.01;
    const openingsSquareMeters = unitSystem === "imperial" ? openingsArea * METERS_PER_FOOT ** 2 : openingsArea;
    const expectedGross = lengthMeters * heightMeters;
    const expectedNetFace = expectedGross - openingsSquareMeters;
    const expectedPerWall = expectedNetFace * thicknessMeters;
    const expectedNet = expectedPerWall * quantity;
    const expectedOrder = expectedNet * (1 + wastePercent / 100);

    close(result.grossFaceAreaSquareMetersPerWall, expectedGross);
    close(result.netFaceAreaSquareMetersPerWall, expectedNetFace);
    close(result.perWallCubicMeters, expectedPerWall);
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
