import assert from "node:assert/strict";
import test from "node:test";
import {
  createSavedEstimatePurchase,
  parseSavedEstimateHistory,
} from "../lib/history.ts";
import {
  buildProjectShoppingList,
  collectAvailableProjectEstimates,
} from "../lib/projects.ts";

test("creates validated structured purchase snapshots without parsing display text", () => {
  const purchase = createSavedEstimatePurchase(62, "80 lb bag", {
    quantity: 62,
    unitPrice: 5.5,
    total: 341,
    currencyLabel: "$",
    unitLabel: "80 lb bag",
  });

  assert.deepEqual(purchase, {
    quantity: 62,
    unitLabel: "80 lb bag",
    unitPrice: 5.5,
    total: 341,
    currencyLabel: "$",
  });
  assert.deepEqual(createSavedEstimatePurchase(4, "1 gal can", null), {
    quantity: 4,
    unitLabel: "1 gal can",
  });
  assert.equal(createSavedEstimatePurchase(null, "bag", null), undefined);
});

test("keeps legacy histories compatible and rejects malformed structured purchases", () => {
  const parsed = parseSavedEstimateHistory(JSON.stringify([
    { id: 1, label: "Legacy", summary: "10 bags" },
    {
      id: 2,
      label: "Structured",
      summary: "62 bags",
      purchase: { quantity: 62, unitLabel: "80 lb bag" },
    },
    {
      id: 3,
      label: "Bad structured value",
      summary: "bad",
      purchase: { quantity: 1.5, unitLabel: "bag" },
    },
  ]));

  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].purchase, undefined);
  assert.deepEqual(parsed[1].purchase, { quantity: 62, unitLabel: "80 lb bag" });
});

test("propagates structured purchase data into project shopping lists only when present", () => {
  const available = collectAvailableProjectEstimates({
    concrete: JSON.stringify([
      {
        id: 10,
        label: "Patio slab",
        summary: "62 × 80 lb bags",
        purchase: { quantity: 62, unitLabel: "80 lb bag" },
      },
    ]),
    paint: JSON.stringify([
      { id: 11, label: "Legacy room", summary: "2 × 1 gal cans" },
    ]),
  });

  const shopping = buildProjectShoppingList({ items: available });
  assert.deepEqual(shopping, [
    {
      calculator: "concrete",
      estimateId: 10,
      estimateLabel: "Patio slab",
      quantity: 62,
      unitLabel: "80 lb bag",
    },
  ]);
});
