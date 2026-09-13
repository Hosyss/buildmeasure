import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateConcreteProject,
  CONCRETE_PROJECT_ENGINE_VERSION,
  CONCRETE_PROJECT_FORMULA_VERSION,
  ConcreteProjectInputError,
  MAX_CONCRETE_PROJECT_PARTS,
} from "../lib/calculators/concrete-project.ts";
import { calculateConcrete } from "../lib/calculators/concrete.ts";
import { calculateCircularSlabConcrete } from "../lib/calculators/circular-slab.ts";
import { calculateFootingConcrete } from "../lib/calculators/footing.ts";
import { calculateColumnConcrete } from "../lib/calculators/column.ts";
import { calculateWallConcrete } from "../lib/calculators/wall.ts";
import { calculatePostHoleConcrete } from "../lib/calculators/post-hole-concrete.ts";
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

function rectangularSlab(overrides = {}) {
  return {
    kind: "rectangular-slab",
    label: "Main slab",
    unitSystem: "imperial",
    quantity: 1,
    length: 10,
    width: 10,
    depth: 4,
    ...overrides,
  };
}

test("publishes explicit project engine and formula versions", () => {
  assert.equal(CONCRETE_PROJECT_ENGINE_VERSION, "0.1.0");
  assert.equal(CONCRETE_PROJECT_FORMULA_VERSION, "1.0.0");
});

test("sums unrounded rectangular and circular slab volumes before project allowance and bag rounding", () => {
  const result = calculateConcreteProject({
    parts: [
      rectangularSlab({ quantity: 2 }),
      {
        kind: "circular-slab",
        label: "Round pad",
        unitSystem: "imperial",
        quantity: 1,
        diameter: 12,
        depth: 4,
      },
    ],
    wastePercent: 10,
    bagSize: 80,
  });

  const slabCubicFeet = 10 * 10 * (4 / 12) * 2;
  const circleCubicFeet = Math.PI * 6 ** 2 * (4 / 12);
  const netCubicFeet = slabCubicFeet + circleCubicFeet;
  const orderCubicFeet = netCubicFeet * 1.1;

  close(result.netCubicMeters, netCubicFeet * METERS_PER_FOOT ** 3);
  close(result.cubicFeet, orderCubicFeet);
  close(result.cubicYards, orderCubicFeet / 27);
  close(result.liters, result.orderCubicMeters * LITERS_PER_CUBIC_METER);
  assert.equal(result.bags, Math.ceil(orderCubicFeet / 0.6));
  assert.equal(result.bags, 192);
});

test("rounds bags once for the combined project instead of adding per-part rounded bags", () => {
  const result = calculateConcreteProject({
    parts: [
      rectangularSlab({ label: "Tiny A", length: 1, width: 1, depth: 1.2 }),
      rectangularSlab({ label: "Tiny B", length: 1, width: 1, depth: 1.2 }),
    ],
    wastePercent: 0,
    bagSize: 80,
  });

  close(result.cubicFeet, 0.2);
  assert.equal(result.bags, 1);
});

test("supports every concrete geometry by reusing its verified zero-allowance engine", () => {
  const parts = [
    rectangularSlab(),
    {
      kind: "circular-slab",
      label: "Circular pad",
      unitSystem: "imperial",
      quantity: 1,
      diameter: 12,
      depth: 4,
    },
    {
      kind: "footing",
      label: "Footings",
      unitSystem: "imperial",
      quantity: 2,
      length: 10,
      width: 2,
      depth: 8,
    },
    {
      kind: "rectangular-column",
      label: "Square columns",
      unitSystem: "imperial",
      quantity: 2,
      height: 10,
      width: 12,
      depth: 12,
    },
    {
      kind: "circular-column",
      label: "Round column",
      unitSystem: "imperial",
      quantity: 1,
      height: 10,
      diameter: 12,
    },
    {
      kind: "wall",
      label: "Concrete wall",
      unitSystem: "imperial",
      quantity: 1,
      length: 10,
      height: 8,
      thickness: 6,
      openingsArea: 16,
    },
    {
      kind: "post-hole",
      label: "Fence holes",
      unitSystem: "imperial",
      quantity: 4,
      holeDiameter: 12,
      holeDepth: 36,
      postShape: "none",
      postSize: 0,
    },
  ];

  const expected = [
    calculateConcrete({
      unitSystem: "imperial",
      length: 10,
      width: 10,
      depth: 4,
      wastePercent: 0,
      bagSize: 80,
    }).netCubicMeters,
    calculateCircularSlabConcrete({
      unitSystem: "imperial",
      diameter: 12,
      depth: 4,
      quantity: 1,
      wastePercent: 0,
      bagSize: 80,
    }).netCubicMeters,
    calculateFootingConcrete({
      unitSystem: "imperial",
      footingLength: 10,
      footingWidth: 2,
      footingDepth: 8,
      quantity: 2,
      wastePercent: 0,
      bagSize: 80,
    }).netCubicMeters,
    calculateColumnConcrete({
      unitSystem: "imperial",
      shape: "rectangular",
      height: 10,
      width: 12,
      depth: 12,
      diameter: 0,
      quantity: 2,
      wastePercent: 0,
      bagSize: 80,
    }).netCubicMeters,
    calculateColumnConcrete({
      unitSystem: "imperial",
      shape: "circular",
      height: 10,
      width: 0,
      depth: 0,
      diameter: 12,
      quantity: 1,
      wastePercent: 0,
      bagSize: 80,
    }).netCubicMeters,
    calculateWallConcrete({
      unitSystem: "imperial",
      length: 10,
      height: 8,
      thickness: 6,
      openingsArea: 16,
      quantity: 1,
      wastePercent: 0,
      bagSize: 80,
    }).netCubicMeters,
    calculatePostHoleConcrete({
      unitSystem: "imperial",
      holeCount: 4,
      holeDiameter: 12,
      holeDepth: 36,
      postShape: "none",
      postSize: 0,
      wastePercent: 0,
      bagSize: 80,
    }).totalNetCubicMeters,
  ];

  const result = calculateConcreteProject({
    parts,
    wastePercent: 7.5,
    bagSize: 60,
  });
  const expectedNet = expected.reduce((total, value) => total + value, 0);

  assert.equal(result.partCount, 7);
  close(result.netCubicMeters, expectedNet);
  for (let index = 0; index < expected.length; index += 1) {
    close(result.parts[index].netCubicMeters, expected[index]);
  }
  close(
    result.parts.reduce((total, part) => total + part.sharePercent, 0),
    100,
  );
  close(result.orderCubicMeters, expectedNet * 1.075);
  assert.equal(result.bags, Math.ceil(result.cubicFeet / 0.45));
});

test("allows mixed Imperial and Metric parts in one project after normalization", () => {
  const imperialDiameter = 12;
  const metricDiameter = imperialDiameter * METERS_PER_FOOT;
  const metricDepthCm = 4 * METERS_PER_INCH * 100;

  const result = calculateConcreteProject({
    parts: [
      rectangularSlab({ label: "Imperial slab" }),
      {
        kind: "circular-slab",
        label: "Metric circular pad",
        unitSystem: "metric",
        quantity: 1,
        diameter: metricDiameter,
        depth: metricDepthCm,
      },
    ],
    wastePercent: 0,
    bagSize: 80,
  });

  const expectedSlab = 10 * 10 * (4 / 12);
  const expectedCircle = Math.PI * 6 ** 2 * (4 / 12);
  close(result.cubicFeet, expectedSlab + expectedCircle);
});

test("rejects empty or oversized projects and invalid project purchase settings", () => {
  assert.throws(
    () => calculateConcreteProject({ parts: [], wastePercent: 10, bagSize: 80 }),
    ConcreteProjectInputError,
  );
  assert.throws(
    () =>
      calculateConcreteProject({
        parts: Array.from({ length: MAX_CONCRETE_PROJECT_PARTS + 1 }, (_, index) =>
          rectangularSlab({ label: `Part ${index + 1}` }),
        ),
        wastePercent: 10,
        bagSize: 80,
      }),
    ConcreteProjectInputError,
  );
  assert.throws(
    () => calculateConcreteProject({ parts: [rectangularSlab()], wastePercent: -1, bagSize: 80 }),
    ConcreteProjectInputError,
  );
  assert.throws(
    () => calculateConcreteProject({ parts: [rectangularSlab()], wastePercent: 51, bagSize: 80 }),
    ConcreteProjectInputError,
  );
  assert.throws(
    () => calculateConcreteProject({ parts: [rectangularSlab()], wastePercent: 10, bagSize: 999 }),
    ConcreteProjectInputError,
  );
});

test("reports the part index when label, quantity, or shape geometry is invalid", () => {
  for (const part of [
    rectangularSlab({ label: "   " }),
    rectangularSlab({ label: "bad\nlabel" }),
    rectangularSlab({ quantity: 0 }),
    rectangularSlab({ depth: 0 }),
    {
      kind: "wall",
      label: "Bad openings",
      unitSystem: "imperial",
      quantity: 1,
      length: 10,
      height: 8,
      thickness: 6,
      openingsArea: 80,
    },
    {
      kind: "post-hole",
      label: "Bad post",
      unitSystem: "imperial",
      quantity: 1,
      holeDiameter: 12,
      holeDepth: 36,
      postShape: "round",
      postSize: 12,
    },
  ]) {
    assert.throws(
      () => calculateConcreteProject({ parts: [part], wastePercent: 10, bagSize: 80 }),
      (error) => error instanceof ConcreteProjectInputError && error.partIndex === 0,
    );
  }
});

test("300 deterministic mixed slab projects preserve independent geometry, project allowance, and one final rounding", () => {
  let state = 0x4d554c54;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
  const bagSizes = [40, 60, 80];
  const yields = { 40: 0.3, 60: 0.45, 80: 0.6 };

  for (let index = 0; index < 300; index += 1) {
    const slabLength = 1 + random() * 49;
    const slabWidth = 1 + random() * 39;
    const slabDepth = 1 + random() * 11;
    const slabQuantity = 1 + Math.floor(random() * 10);
    const diameter = 1 + random() * 29;
    const circleDepth = 1 + random() * 11;
    const circleQuantity = 1 + Math.floor(random() * 10);
    const wastePercent = random() * 50;
    const bagSize = bagSizes[Math.floor(random() * bagSizes.length)];

    const result = calculateConcreteProject({
      parts: [
        rectangularSlab({
          label: `Slab ${index}`,
          length: slabLength,
          width: slabWidth,
          depth: slabDepth,
          quantity: slabQuantity,
        }),
        {
          kind: "circular-slab",
          label: `Circle ${index}`,
          unitSystem: "imperial",
          quantity: circleQuantity,
          diameter,
          depth: circleDepth,
        },
      ],
      wastePercent,
      bagSize,
    });

    const slabFt3 = slabLength * slabWidth * (slabDepth / 12) * slabQuantity;
    const circleFt3 =
      Math.PI * (diameter / 2) ** 2 * (circleDepth / 12) * circleQuantity;
    const netFt3 = slabFt3 + circleFt3;
    const orderFt3 = netFt3 * (1 + wastePercent / 100);

    close(result.netCubicMeters, netFt3 * METERS_PER_FOOT ** 3);
    close(result.cubicFeet, orderFt3);
    close(result.cubicYards, result.orderCubicMeters / METERS_PER_YARD ** 3);
    assert.equal(result.bags, Math.ceil(orderFt3 / yields[bagSize]));
  }
});
