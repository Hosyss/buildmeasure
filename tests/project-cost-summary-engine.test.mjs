import assert from "node:assert/strict";
import test from "node:test";
import {
  buildProjectCostSummary,
  formatProjectCostGroup,
} from "../lib/project-cost-summary.ts";

function item(id, purchase) {
  return {
    calculator: "concrete",
    estimateId: id,
    label: `Estimate ${id}`,
    summary: "Saved estimate",
    ...(purchase ? { purchase } : {}),
  };
}

test("groups priced purchase lines only when the currency label matches exactly", () => {
  const summary = buildProjectCostSummary({
    items: [
      item(1, { quantity: 10, unitLabel: "bag", unitPrice: 5, total: 50, currencyLabel: "USD" }),
      item(2, { quantity: 2, unitLabel: "box", unitPrice: 12.5, total: 25, currencyLabel: "USD" }),
      item(3, { quantity: 1, unitLabel: "sheet", unitPrice: 20, total: 20, currencyLabel: "$" }),
      item(4, { quantity: 3, unitLabel: "bag" }),
      item(5, null),
    ],
  });

  assert.deepEqual(summary, {
    groups: [
      { currencyLabel: "USD", total: 75, pricedLineCount: 2 },
      { currencyLabel: "$", total: 20, pricedLineCount: 1 },
    ],
    purchaseLineCount: 4,
    pricedLineCount: 3,
    unpricedLineCount: 1,
  });
});

test("does not invent a total when saved purchase lines have no structured price", () => {
  const summary = buildProjectCostSummary({
    items: [
      item(1, { quantity: 10, unitLabel: "bag" }),
      item(2, { quantity: 3, unitLabel: "box" }),
    ],
  });

  assert.deepEqual(summary.groups, []);
  assert.equal(summary.purchaseLineCount, 2);
  assert.equal(summary.pricedLineCount, 0);
  assert.equal(summary.unpricedLineCount, 2);
});

test("keeps different user-entered currency labels separate instead of converting", () => {
  const summary = buildProjectCostSummary({
    items: [
      item(1, { quantity: 1, unitLabel: "bag", unitPrice: 10, total: 10, currencyLabel: "USD" }),
      item(2, { quantity: 1, unitLabel: "bag", unitPrice: 10, total: 10, currencyLabel: "usd" }),
      item(3, { quantity: 1, unitLabel: "bag", unitPrice: 10, total: 10, currencyLabel: "EUR" }),
    ],
  });

  assert.deepEqual(summary.groups.map((group) => group.currencyLabel), ["USD", "usd", "EUR"]);
});

test("preserves zero-cost priced lines as valid structured totals", () => {
  const summary = buildProjectCostSummary({
    items: [
      item(1, { quantity: 5, unitLabel: "bag", unitPrice: 0, total: 0, currencyLabel: "USD" }),
    ],
  });

  assert.deepEqual(summary.groups, [
    { currencyLabel: "USD", total: 0, pricedLineCount: 1 },
  ]);
  assert.equal(summary.pricedLineCount, 1);
  assert.equal(summary.unpricedLineCount, 0);
});

test("rejects a grouped total outside the safe numeric range", () => {
  assert.throws(
    () =>
      buildProjectCostSummary({
        items: [
          item(1, {
            quantity: 1,
            unitLabel: "unit",
            unitPrice: Number.MAX_SAFE_INTEGER,
            total: Number.MAX_SAFE_INTEGER,
            currencyLabel: "USD",
          }),
          item(2, {
            quantity: 1,
            unitLabel: "unit",
            unitPrice: 1,
            total: 1,
            currencyLabel: "USD",
          }),
        ],
      }),
    RangeError,
  );
});

test("formats a cost group without currency conversion", () => {
  assert.equal(
    formatProjectCostGroup({ currencyLabel: "EGP", total: 1234.5, pricedLineCount: 2 }),
    "EGP 1,234.5",
  );
});
