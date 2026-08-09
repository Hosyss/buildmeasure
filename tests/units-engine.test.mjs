import assert from "node:assert/strict";
import test from "node:test";
import {
  formatConvertedInput,
  LITERS_PER_US_GALLON,
  METERS_PER_FOOT,
  SQUARE_METERS_PER_SQUARE_FOOT,
} from "../lib/units.ts";

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
