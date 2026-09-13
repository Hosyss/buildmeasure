import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateCircularSlabConcrete,
  CIRCULAR_SLAB_ENGINE_VERSION,
  CIRCULAR_SLAB_FORMULA_VERSION,
  CircularSlabInputError,
} from "../lib/calculators/circular-slab.ts";
import { BAG_YIELDS_CUBIC_FEET } from "../lib/calculators/concrete.ts";
import {
  LITERS_PER_CUBIC_METER,
  METERS_PER_FOOT,
  METERS_PER_INCH,
  METERS_PER_YARD,
} from "../lib/units.ts";

function close(actual, expected, tolerance = 1e-10) {
  const scale = Math.max(1, Math.abs(actual), Math.abs(expected));
  assert.ok(
    Math.abs(actual - expected) <= tolerance * scale,
    `expected ${actual} to be close to ${expected}`,
  );
}

function imperialInput(overrides = {}) {
  return {
    unitSystem: "imperial",
    diameter: 12,
    depth: 4,
    quantity: 1,
    wastePercent: 0,
    bagSize: 80,
    ...overrides,
  };
}

test("publishes explicit engine and formula versions", () => {
  assert.equal(CIRCULAR_SLAB_ENGINE_VERSION, "0.1.0");
  assert.equal(CIRCULAR_SLAB_FORMULA_VERSION, "1.0.0");
});

test("calculates a controlled 12 ft diameter by 4 in circular slab", () => {
  const result = calculateCircularSlabConcrete(imperialInput());
  const expectedAreaSquareFeet = Math.PI * 6 ** 2;
  const expectedCubicFeet = expectedAreaSquareFeet * (4 / 12);

  close(result.areaSquareFeet, expectedAreaSquareFeet);
  close(result.perSlabCubicFeet, expectedCubicFeet);
  close(result.cubicFeet, expectedCubicFeet);
  close(result.cubicYards, expectedCubicFeet / 27);
  close(result.liters, result.orderCubicMeters * LITERS_PER_CUBIC_METER);
  assert.equal(result.bags, 63);
});

test("combines identical circular slabs before applying allowance and bag rounding", () => {
  const result = calculateCircularSlabConcrete(
    imperialInput({
      diameter: 10,
      depth: 6,
      quantity: 3,
      wastePercent: 10,
      bagSize: 60,
    }),
  );
  const perSlab = Math.PI * 5 ** 2 * 0.5;
  const net = perSlab * 3;
  const order = net * 1.1;

  close(result.perSlabCubicFeet, perSlab);
  close(result.cubicFeet, order);
  assert.equal(result.bags, Math.ceil(order / 0.45));
  assert.equal(result.bags, 288);
});

test("metric and imperial inputs describe the same physical slab", () => {
  const imperial = calculateCircularSlabConcrete(
    imperialInput({ diameter: 12, depth: 4, quantity: 2, wastePercent: 7 }),
  );
  const metric = calculateCircularSlabConcrete({
    unitSystem: "metric",
    diameter: 12 * METERS_PER_FOOT,
    depth: (4 * METERS_PER_INCH) * 100,
    quantity: 2,
    wastePercent: 7,
    bagSize: 80,
  });

  close(metric.areaSquareMeters, imperial.areaSquareMeters);
  close(metric.netCubicMeters, imperial.netCubicMeters);
  close(metric.orderCubicMeters, imperial.orderCubicMeters);
  close(metric.cubicFeet, imperial.cubicFeet);
  assert.equal(metric.bags, imperial.bags);
});

test("rounds only the final package quantity upward", () => {
  for (const bagSize of [40, 60, 80]) {
    const result = calculateCircularSlabConcrete(
      imperialInput({ diameter: 7.25, depth: 3.75, quantity: 17, wastePercent: 12.5, bagSize }),
    );
    assert.equal(
      result.bags,
      Math.ceil(result.cubicFeet / BAG_YIELDS_CUBIC_FEET[bagSize]),
    );
  }
});

test("rejects invalid dimensions, quantities, allowances, and bag sizes", () => {
  const badInputs = [
    imperialInput({ diameter: 0 }),
    imperialInput({ diameter: -1 }),
    imperialInput({ diameter: Number.NaN }),
    imperialInput({ depth: 0 }),
    imperialInput({ depth: Number.POSITIVE_INFINITY }),
    imperialInput({ quantity: 0 }),
    imperialInput({ quantity: 1.5 }),
    imperialInput({ wastePercent: -0.01 }),
    imperialInput({ wastePercent: 50.01 }),
    imperialInput({ bagSize: 999 }),
    imperialInput({ unitSystem: "yards" }),
  ];

  for (const input of badInputs) {
    assert.throws(() => calculateCircularSlabConcrete(input), CircularSlabInputError);
  }
});

test("rejects calculations outside the safe numeric range", () => {
  assert.throws(
    () =>
      calculateCircularSlabConcrete(
        imperialInput({ diameter: Number.MAX_VALUE, depth: Number.MAX_VALUE }),
      ),
    CircularSlabInputError,
  );
});

test("500 deterministic randomized cases preserve circle geometry, conversions, allowance, and package rounding", () => {
  let state = 0x4c554b45;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
  const bagSizes = [40, 60, 80];

  for (let index = 0; index < 500; index += 1) {
    const unitSystem = index % 2 === 0 ? "imperial" : "metric";
    const diameter =
      unitSystem === "imperial" ? 0.25 + random() * 99.75 : 0.08 + random() * 29.92;
    const depth =
      unitSystem === "imperial" ? 0.25 + random() * 23.75 : 0.5 + random() * 59.5;
    const quantity = 1 + Math.floor(random() * 100);
    const wastePercent = random() * 50;
    const bagSize = bagSizes[Math.floor(random() * bagSizes.length)];

    const result = calculateCircularSlabConcrete({
      unitSystem,
      diameter,
      depth,
      quantity,
      wastePercent,
      bagSize,
    });

    const diameterMeters =
      unitSystem === "imperial" ? diameter * METERS_PER_FOOT : diameter;
    const depthMeters =
      unitSystem === "imperial" ? depth * METERS_PER_INCH : depth * 0.01;
    const expectedArea = Math.PI * (diameterMeters / 2) ** 2;
    const expectedPerSlab = expectedArea * depthMeters;
    const expectedNet = expectedPerSlab * quantity;
    const expectedOrder = expectedNet * (1 + wastePercent / 100);
    const expectedCubicFeet = expectedOrder / METERS_PER_FOOT ** 3;

    close(result.areaSquareMeters, expectedArea);
    close(result.areaSquareFeet, expectedArea / METERS_PER_FOOT ** 2);
    close(result.perSlabCubicMeters, expectedPerSlab);
    close(result.netCubicMeters, expectedNet);
    close(result.orderCubicMeters, expectedOrder);
    close(result.cubicFeet, expectedCubicFeet);
    close(result.cubicYards, expectedOrder / METERS_PER_YARD ** 3);
    close(result.liters, expectedOrder * LITERS_PER_CUBIC_METER);
    assert.equal(
      result.bags,
      Math.ceil(expectedCubicFeet / BAG_YIELDS_CUBIC_FEET[bagSize]),
    );
  }
});
