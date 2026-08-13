import assert from "node:assert/strict";
import test from "node:test";
import {
  formatConvertedInput,
  LITERS_PER_US_GALLON,
  METERS_PER_FOOT,
  SQUARE_METERS_PER_SQUARE_FOOT,
} from "../lib/units.ts";
import {
  BRICK_PRESETS,
  brickPresetRate,
  calculateBrick,
} from "../lib/calculators/brick.ts";

test("preserves practical dimensions through a displayed unit round trip", () => {
  const metric = Number(formatConvertedInput(8 * METERS_PER_FOOT));
  const imperial = formatConvertedInput(metric / METERS_PER_FOOT);

  assert.equal(metric, 2.4384);
  assert.equal(imperial, "8");
});

test("preserves paint coverage through a displayed unit round trip", () => {
  const metricCoverage = Number(
    formatConvertedInput(
      (400 * SQUARE_METERS_PER_SQUARE_FOOT) /
        LITERS_PER_US_GALLON,
    ),
  );
  const imperialCoverage = Number(
    formatConvertedInput(
      (metricCoverage * LITERS_PER_US_GALLON) /
        SQUARE_METERS_PER_SQUARE_FOOT,
    ),
  );

  assert.equal(imperialCoverage, 400);
});

test("preserves whole-brick boundaries through displayed metric inputs", () => {
  const formatBrickInput = (value) => formatConvertedInput(value, 10);
  const imperial = calculateBrick({
    unitSystem: "imperial",
    wallLength: 20,
    wallHeight: 8,
    openingsArea: 16,
    coverageRate: BRICK_PRESETS.modular.bricksPer100SquareFeet,
    wastePercent: 5,
  });
  const metric = calculateBrick({
    unitSystem: "metric",
    wallLength: Number(formatBrickInput(20 * METERS_PER_FOOT)),
    wallHeight: Number(formatBrickInput(8 * METERS_PER_FOOT)),
    openingsArea: Number(
      formatBrickInput(16 * SQUARE_METERS_PER_SQUARE_FOOT),
    ),
    coverageRate: Number(
      formatBrickInput(brickPresetRate("modular", "metric")),
    ),
    wastePercent: 5,
  });

  assert.equal(metric.minimumWholeBricks, imperial.minimumWholeBricks);
  assert.equal(metric.orderBricks, imperial.orderBricks);
});
