import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateDrywall,
  drywallPresetDimensions,
  DrywallInputError,
} from "../lib/calculators/drywall.ts";
import {
  METERS_PER_FOOT,
  SQUARE_METERS_PER_SQUARE_FOOT,
} from "../lib/units.ts";

const baseInput = {
  unitSystem: "imperial",
  roomLength: 10,
  roomWidth: 10,
  wallHeight: 8,
  openingsArea: 0,
  includeCeiling: false,
  panelWidth: 4,
  panelLength: 8,
  wastePercent: 0,
};

function close(actual, expected, tolerance = 1e-10) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

test("matches the exact 10-panel wall boundary", () => {
  const result = calculateDrywall(baseInput);

  close(result.wallAreaSquareFeet, 320);
  close(result.ceilingAreaSquareFeet, 0);
  close(result.grossAreaSquareFeet, 320);
  close(result.netAreaSquareFeet, 320);
  close(result.panelAreaSquareFeet, 32);
  close(result.exactNetPanels, 10);
  close(result.exactOrderPanels, 10);
  assert.equal(result.minimumWholePanels, 10);
  assert.equal(result.orderPanels, 10);
  assert.equal(result.allowanceAddedPanels, 0);
});

test("matches the walls plus ceiling and measured openings vector", () => {
  const result = calculateDrywall({
    ...baseInput,
    roomLength: 12,
    roomWidth: 12,
    openingsArea: 24,
    includeCeiling: true,
  });

  close(result.wallAreaSquareFeet, 384);
  close(result.ceilingAreaSquareFeet, 144);
  close(result.grossAreaSquareFeet, 528);
  close(result.openingsAreaSquareFeet, 24);
  close(result.netAreaSquareFeet, 504);
  close(result.exactNetPanels, 15.75);
  assert.equal(result.minimumWholePanels, 16);
  assert.equal(result.orderPanels, 16);
});

test("applies explicit waste after net area", () => {
  const noWaste = calculateDrywall({
    ...baseInput,
    roomLength: 12,
    roomWidth: 12,
    openingsArea: 24,
    includeCeiling: true,
  });
  const withWaste = calculateDrywall({
    ...baseInput,
    roomLength: 12,
    roomWidth: 12,
    openingsArea: 24,
    includeCeiling: true,
    wastePercent: 10,
  });

  close(noWaste.netAreaSquareFeet, 504);
  close(withWaste.netAreaSquareFeet, 504);
  close(withWaste.adjustedAreaSquareFeet, 554.4, 1e-9);
  close(withWaste.exactOrderPanels, 17.325, 1e-10);
  assert.equal(withWaste.minimumWholePanels, 16);
  assert.equal(withWaste.orderPanels, 18);
  assert.equal(withWaste.allowanceAddedPanels, 2);
});

test("does not add a sheet at an exact waste boundary", () => {
  const result = calculateDrywall({ ...baseInput, wastePercent: 10 });

  close(result.adjustedAreaSquareFeet, 352, 1e-9);
  close(result.exactOrderPanels, 11);
  assert.equal(result.orderPanels, 11);
});

test("includes ceiling area only when requested", () => {
  const wallsOnly = calculateDrywall(baseInput);
  const withCeiling = calculateDrywall({ ...baseInput, includeCeiling: true });

  close(wallsOnly.ceilingAreaSquareFeet, 0);
  close(withCeiling.ceilingAreaSquareFeet, 100);
  close(withCeiling.grossAreaSquareFeet - wallsOnly.grossAreaSquareFeet, 100);
});

test("supports custom physical panel dimensions", () => {
  const result = calculateDrywall({
    ...baseInput,
    panelWidth: 4,
    panelLength: 10,
  });

  close(result.panelAreaSquareFeet, 40);
  close(result.exactNetPanels, 8);
  assert.equal(result.orderPanels, 8);
});

test("exposes exact physical dimensions for the documented panel presets", () => {
  assert.deepEqual(drywallPresetDimensions("4x8", "imperial"), {
    width: 4,
    length: 8,
  });
  assert.deepEqual(drywallPresetDimensions("4x10", "imperial"), {
    width: 4,
    length: 10,
  });
  assert.deepEqual(drywallPresetDimensions("4x12", "imperial"), {
    width: 4,
    length: 12,
  });

  const metric = drywallPresetDimensions("4x12", "metric");
  close(metric.width, 4 * METERS_PER_FOOT, 1e-12);
  close(metric.length, 12 * METERS_PER_FOOT, 1e-12);
});

test("metric and imperial descriptions of the same room and panel agree", () => {
  const imperial = calculateDrywall({
    ...baseInput,
    roomLength: 12,
    roomWidth: 12,
    openingsArea: 24,
    includeCeiling: true,
    wastePercent: 10,
  });
  const metric = calculateDrywall({
    ...baseInput,
    unitSystem: "metric",
    roomLength: 12 * METERS_PER_FOOT,
    roomWidth: 12 * METERS_PER_FOOT,
    wallHeight: 8 * METERS_PER_FOOT,
    openingsArea: 24 * SQUARE_METERS_PER_SQUARE_FOOT,
    includeCeiling: true,
    panelWidth: 4 * METERS_PER_FOOT,
    panelLength: 8 * METERS_PER_FOOT,
    wastePercent: 10,
  });

  close(imperial.wallAreaSquareMeters, metric.wallAreaSquareMeters, 1e-12);
  close(imperial.ceilingAreaSquareMeters, metric.ceilingAreaSquareMeters, 1e-12);
  close(imperial.netAreaSquareMeters, metric.netAreaSquareMeters, 1e-12);
  close(imperial.panelAreaSquareMeters, metric.panelAreaSquareMeters, 1e-12);
  close(imperial.exactNetPanels, metric.exactNetPanels, 1e-12);
  close(imperial.exactOrderPanels, metric.exactOrderPanels, 1e-12);
  assert.equal(imperial.minimumWholePanels, metric.minimumWholePanels);
  assert.equal(imperial.orderPanels, metric.orderPanels);
});

test("accepts zero openings and rejects openings that consume the included surface", () => {
  assert.doesNotThrow(() => calculateDrywall({ ...baseInput, openingsArea: 0 }));

  for (const openingsArea of [320, 321]) {
    assert.throws(
      () => calculateDrywall({ ...baseInput, openingsArea }),
      (error) =>
        error instanceof DrywallInputError &&
        error.field === "openingsArea" &&
        error.message.includes("smaller than the included wall and ceiling area"),
    );
  }
});

test("rejects invalid room and panel dimensions", () => {
  const fields = [
    "roomLength",
    "roomWidth",
    "wallHeight",
    "panelWidth",
    "panelLength",
  ];

  for (const field of fields) {
    for (const invalid of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.throws(
        () => calculateDrywall({ ...baseInput, [field]: invalid }),
        (error) => error instanceof DrywallInputError && error.field === field,
      );
    }
  }
});

test("rejects invalid openings and waste allowances", () => {
  for (const invalid of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(
      () => calculateDrywall({ ...baseInput, openingsArea: invalid }),
      (error) =>
        error instanceof DrywallInputError && error.field === "openingsArea",
    );
  }

  for (const invalid of [-1, 50.0001, 51, Number.NaN]) {
    assert.throws(
      () => calculateDrywall({ ...baseInput, wastePercent: invalid }),
      (error) =>
        error instanceof DrywallInputError && error.field === "wastePercent",
    );
  }
});

test("rejects unsupported runtime options", () => {
  assert.throws(
    () => calculateDrywall({ ...baseInput, unitSystem: "si" }),
    (error) =>
      error instanceof DrywallInputError && error.field === "unitSystem",
  );
  assert.throws(
    () => calculateDrywall({ ...baseInput, includeCeiling: "yes" }),
    (error) =>
      error instanceof DrywallInputError && error.field === "includeCeiling",
  );
});

test("rejects underflow, overflow, and unsafe whole-sheet quantities", () => {
  assert.throws(
    () =>
      calculateDrywall({
        ...baseInput,
        unitSystem: "imperial",
        roomLength: Number.MIN_VALUE,
      }),
    (error) =>
      error instanceof DrywallInputError &&
      error.message.includes("safe numeric range"),
  );

  assert.throws(
    () =>
      calculateDrywall({
        ...baseInput,
        unitSystem: "imperial",
        openingsArea: Number.MIN_VALUE,
      }),
    (error) =>
      error instanceof DrywallInputError &&
      error.field === "openingsArea" &&
      error.message.includes("safe numeric range"),
  );

  assert.throws(
    () =>
      calculateDrywall({
        ...baseInput,
        unitSystem: "metric",
        roomLength: 1e200,
        roomWidth: 1e200,
        wallHeight: 1e200,
      }),
    (error) =>
      error instanceof DrywallInputError &&
      error.message.includes("safe numeric range"),
  );

  assert.throws(
    () =>
      calculateDrywall({
        ...baseInput,
        unitSystem: "metric",
        panelWidth: 1e200,
        panelLength: 1e200,
      }),
    (error) =>
      error instanceof DrywallInputError &&
      error.message.includes("safe numeric range"),
  );

  assert.throws(
    () =>
      calculateDrywall({
        ...baseInput,
        unitSystem: "metric",
        roomLength: 1,
        roomWidth: 1,
        wallHeight: 1,
        panelWidth: 1e-8,
        panelLength: 1e-8,
      }),
    (error) =>
      error instanceof DrywallInputError &&
      error.message.includes("safe numeric range"),
  );
});

test("randomized valid inputs preserve geometry, waste, and procurement invariants", () => {
  let seed = 0xd4a11eed;
  const random = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };

  for (let index = 0; index < 250; index += 1) {
    const unitSystem = index % 2 === 0 ? "imperial" : "metric";
    const roomLength = unitSystem === "imperial" ? 5 + random() * 45 : 2 + random() * 15;
    const roomWidth = unitSystem === "imperial" ? 5 + random() * 45 : 2 + random() * 15;
    const wallHeight = unitSystem === "imperial" ? 6 + random() * 14 : 2 + random() * 4;
    const includeCeiling = index % 3 !== 0;
    const grossInputArea =
      2 * (roomLength + roomWidth) * wallHeight +
      (includeCeiling ? roomLength * roomWidth : 0);
    const openingsArea = grossInputArea * random() * 0.65;
    const panelWidth = unitSystem === "imperial" ? 2 + random() * 4 : 0.6 + random() * 1.2;
    const panelLength = unitSystem === "imperial" ? 6 + random() * 10 : 1.8 + random() * 3;
    const wastePercent = random() * 50;

    const result = calculateDrywall({
      unitSystem,
      roomLength,
      roomWidth,
      wallHeight,
      openingsArea,
      includeCeiling,
      panelWidth,
      panelLength,
      wastePercent,
    });

    close(
      result.grossAreaSquareMeters,
      result.wallAreaSquareMeters + result.ceilingAreaSquareMeters,
      1e-8,
    );
    close(
      result.netAreaSquareMeters,
      result.grossAreaSquareMeters - result.openingsAreaSquareMeters,
      1e-8,
    );
    close(
      result.exactNetPanels,
      result.netAreaSquareMeters / result.panelAreaSquareMeters,
      1e-8,
    );
    close(
      result.adjustedAreaSquareMeters,
      result.netAreaSquareMeters * (1 + wastePercent / 100),
      1e-8,
    );
    close(
      result.exactOrderPanels,
      result.adjustedAreaSquareMeters / result.panelAreaSquareMeters,
      1e-8,
    );
    assert.ok(result.minimumWholePanels + 1e-9 >= result.exactNetPanels);
    assert.ok(result.orderPanels + 1e-9 >= result.exactOrderPanels);
    assert.ok(result.orderPanels >= result.minimumWholePanels);
    assert.equal(
      result.allowanceAddedPanels,
      result.orderPanels - result.minimumWholePanels,
    );
  }
});
