import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateTile,
  TileInputError,
} from "../lib/calculators/tile.ts";
import {
  METERS_PER_FOOT,
  MILLIMETERS_PER_INCH,
  SQUARE_METERS_PER_SQUARE_FOOT,
} from "../lib/units.ts";

const baseInput = {
  unitSystem: "imperial",
  surfaceLength: 12,
  surfaceWidth: 10,
  tileLength: 12,
  tileWidth: 12,
  groutJoint: 0.125,
  wastePercent: 10,
  tilesPerBox: 10,
  orientation: "auto",
};

test("calculates tiles, waste, boxes, and purchased coverage", () => {
  const result = calculateTile(baseInput);

  assert.ok(Math.abs(result.surfaceAreaSquareFeet - 120) < 1e-10);
  assert.ok(Math.abs(result.exactTileCount - 120) < 1e-10);
  assert.equal(result.minimumWholeTiles, 120);
  assert.equal(result.orderTileCount, 132);
  assert.equal(result.boxes, 14);
  assert.equal(result.purchasedTiles, 140);
  assert.equal(result.boxOverageTiles, 8);
  assert.ok(
    Math.abs(
      result.purchasedAreaSquareMeters /
        SQUARE_METERS_PER_SQUARE_FOOT -
        140,
    ) < 1e-10,
  );
});

test("metric and imperial descriptions of the same project agree", () => {
  const imperial = calculateTile(baseInput);
  const metric = calculateTile({
    ...baseInput,
    unitSystem: "metric",
    surfaceLength: baseInput.surfaceLength * METERS_PER_FOOT,
    surfaceWidth: baseInput.surfaceWidth * METERS_PER_FOOT,
    tileLength: baseInput.tileLength * MILLIMETERS_PER_INCH,
    tileWidth: baseInput.tileWidth * MILLIMETERS_PER_INCH,
    groutJoint: baseInput.groutJoint * MILLIMETERS_PER_INCH,
  });

  assert.ok(
    Math.abs(
      imperial.surfaceAreaSquareMeters -
        metric.surfaceAreaSquareMeters,
    ) < 1e-12,
  );
  assert.ok(
    Math.abs(imperial.exactTileCount - metric.exactTileCount) <
      1e-10,
  );
  assert.equal(imperial.orderTileCount, metric.orderTileCount);
  assert.equal(imperial.boxes, metric.boxes);
  assert.equal(imperial.layoutCells, metric.layoutCells);
});

test("rounds the material order and boxes upward", () => {
  const result = calculateTile({
    ...baseInput,
    surfaceLength: 10,
    surfaceWidth: 10,
    tileLength: 18,
    tileWidth: 18,
    groutJoint: 0,
    tilesPerBox: 12,
  });

  assert.ok(Math.abs(result.exactTileCount - 44.44444444444444) < 1e-10);
  assert.equal(result.minimumWholeTiles, 45);
  assert.equal(result.orderTileCount, 49);
  assert.equal(result.boxes, 5);
  assert.equal(result.purchasedTiles, 60);
});

test("does not add a tile at an exact waste boundary", () => {
  const result = calculateTile({
    ...baseInput,
    surfaceLength: 10,
    surfaceWidth: 10,
    tileLength: 12,
    tileWidth: 12,
    groutJoint: 0,
    wastePercent: 10,
    tilesPerBox: 10,
  });

  assert.ok(Math.abs(result.exactTileCount - 100) < 1e-10);
  assert.equal(result.orderTileCount, 110);
  assert.equal(result.boxes, 11);
});

test("calculates layout modules using one fewer joint than tiles", () => {
  const result = calculateTile({
    ...baseInput,
    surfaceLength: 8,
    surfaceWidth: 5,
    tileLength: 24,
    tileWidth: 12,
    groutJoint: 0.125,
  });

  assert.equal(result.layoutOrientation, "aligned");
  assert.equal(result.tilesAlongLength, 4);
  assert.equal(result.tilesAlongWidth, 5);
  assert.equal(result.layoutCells, 20);
  assert.equal(result.rotatedLayoutCells, 24);
});

test("honors an explicitly rotated layout", () => {
  const result = calculateTile({
    ...baseInput,
    surfaceLength: 8,
    surfaceWidth: 5,
    tileLength: 24,
    tileWidth: 12,
    groutJoint: 0,
    orientation: "rotated",
  });

  assert.equal(result.layoutOrientation, "rotated");
  assert.equal(result.tilesAlongLength, 8);
  assert.equal(result.tilesAlongWidth, 3);
  assert.equal(result.layoutCells, 24);
});

test("keeps grout spacing out of the area-based purchase quantity", () => {
  const noJoint = calculateTile({ ...baseInput, groutJoint: 0 });
  const largerJoint = calculateTile({ ...baseInput, groutJoint: 0.25 });

  assert.equal(noJoint.orderTileCount, largerJoint.orderTileCount);
  assert.equal(noJoint.boxes, largerJoint.boxes);
});

test("rejects zero, negative, and non-finite dimensions", () => {
  for (const invalid of [
    0,
    -1,
    Number.NaN,
    Number.POSITIVE_INFINITY,
  ]) {
    assert.throws(
      () => calculateTile({ ...baseInput, surfaceLength: invalid }),
      (error) =>
        error instanceof TileInputError &&
        error.field === "surfaceLength" &&
        error.message === "Enter a number greater than zero.",
    );
  }
});

test("rejects invalid waste and box quantities", () => {
  for (const invalid of [-1, 51, Number.NaN]) {
    assert.throws(
      () => calculateTile({ ...baseInput, wastePercent: invalid }),
      (error) =>
        error instanceof TileInputError &&
        error.field === "wastePercent",
    );
  }

  for (const invalid of [0, 1.5, 501]) {
    assert.throws(
      () => calculateTile({ ...baseInput, tilesPerBox: invalid }),
      (error) =>
        error instanceof TileInputError &&
        error.field === "tilesPerBox",
    );
  }
});

test("rejects an unsupported runtime unit system", () => {
  assert.throws(
    () => calculateTile({ ...baseInput, unitSystem: "si" }),
    (error) =>
      error instanceof TileInputError &&
      error.field === "unitSystem",
  );
});

test("rejects dimensions outside the safe numeric range", () => {
  assert.throws(
    () =>
      calculateTile({
        ...baseInput,
        surfaceLength: Number.MIN_VALUE,
      }),
    (error) =>
      error instanceof TileInputError &&
      error.message.includes("safe numeric range"),
  );

  assert.throws(
    () =>
      calculateTile({
        ...baseInput,
        unitSystem: "metric",
        surfaceLength: 10_000_000_000,
        surfaceWidth: 10_000_000_000,
        tileLength: 1,
        tileWidth: 1,
      }),
    (error) =>
      error instanceof TileInputError &&
      error.message.includes("safe numeric range"),
  );
});

test("rejects a grout joint as large as either tile edge", () => {
  assert.throws(
    () =>
      calculateTile({
        ...baseInput,
        tileWidth: 0.125,
        groutJoint: 0.125,
      }),
    (error) =>
      error instanceof TileInputError &&
      error.field === "groutJoint",
  );
});

test("randomized valid inputs preserve procurement invariants", () => {
  let seed = 0x5eed1234;
  const random = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };

  for (let index = 0; index < 250; index += 1) {
    const result = calculateTile({
      unitSystem: index % 2 === 0 ? "imperial" : "metric",
      surfaceLength: 1 + random() * 50,
      surfaceWidth: 1 + random() * 50,
      tileLength: 50 + random() * 950,
      tileWidth: 50 + random() * 950,
      groutJoint: random() * 20,
      wastePercent: random() * 30,
      tilesPerBox: 1 + Math.floor(random() * 40),
      orientation: ["auto", "aligned", "rotated"][index % 3],
    });

    assert.ok(result.minimumWholeTiles >= result.exactTileCount - 1e-9);
    assert.ok(result.orderTileCount >= result.minimumWholeTiles);
    assert.ok(result.purchasedTiles >= result.orderTileCount);
    assert.equal(result.purchasedTiles, result.boxes * result.tilesPerBox);
    assert.ok(result.tilesAlongLength >= 1);
    assert.ok(result.tilesAlongWidth >= 1);
  }
});
