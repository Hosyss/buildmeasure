import assert from "node:assert/strict";
import test from "node:test";
import {
  CALCULATOR_CATALOG,
  CALCULATOR_GROUPS,
  LIVE_CALCULATOR_COUNT,
  calculatorSearchText,
} from "../lib/calculator-catalog.ts";

test("calculator catalog exposes thirteen unique first-class tools", () => {
  assert.equal(LIVE_CALCULATOR_COUNT, 13);
  assert.equal(CALCULATOR_CATALOG.length, 13);
  assert.equal(new Set(CALCULATOR_CATALOG.map((item) => item.id)).size, 13);
  assert.equal(new Set(CALCULATOR_CATALOG.map((item) => item.href)).size, 13);
  assert.equal(new Set(CALCULATOR_CATALOG.map((item) => item.guideHref)).size, 13);
});

test("every catalog item is assigned to a supported work area with searchable material context", () => {
  for (const calculator of CALCULATOR_CATALOG) {
    assert.equal(CALCULATOR_GROUPS.includes(calculator.group), true);
    assert.match(calculator.href, /^\/[a-z0-9-]+calculator$/);
    assert.match(calculator.guideHref, /^\/guides\/[a-z0-9-]+$/);
    assert.equal(calculator.name.trim().length > 0, true);
    assert.equal(calculator.description.trim().length > 30, true);
    assert.equal(calculator.keywords.length > 0, true);
    assert.match(calculatorSearchText(calculator), new RegExp(calculator.shortName.split(" ")[0], "i"));
  }
});

test("catalog grouping remains balanced enough to browse before search", () => {
  const counts = new Map(CALCULATOR_GROUPS.map((group) => [group, 0]));
  for (const calculator of CALCULATOR_CATALOG) {
    counts.set(calculator.group, (counts.get(calculator.group) ?? 0) + 1);
  }

  assert.deepEqual(Object.fromEntries(counts), {
    "Concrete & foundations": 7,
    "Interiors & finishes": 3,
    "Masonry & landscape": 3,
  });
});

test("common project vocabulary resolves into catalog search text", () => {
  const byId = Object.fromEntries(CALCULATOR_CATALOG.map((item) => [item.id, calculatorSearchText(item)]));
  assert.match(byId["concrete-project"], /mixed geometry/);
  assert.match(byId["post-hole"], /fence/);
  assert.match(byId.drywall, /sheetrock/);
  assert.match(byId.gravel, /driveway/);
  assert.match(byId.paint, /ceiling/);
});
