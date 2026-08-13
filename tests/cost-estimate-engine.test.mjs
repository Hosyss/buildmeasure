import assert from "node:assert/strict";
import test from "node:test";
import {
  calculatePurchaseCost,
  CostInputError,
  formatPurchaseCost,
  formatPurchaseUnitPrice,
} from "../lib/cost-estimate.ts";

const baseInput = {
  quantity: 12,
  unitPrice: "8.75",
  currencyLabel: "$",
  unitLabel: "80 lb bag",
};

test("returns no cost when the optional unit price is blank", () => {
  assert.equal(
    calculatePurchaseCost({ ...baseInput, unitPrice: "   " }),
    null,
  );
});

test("multiplies the rounded purchase quantity by the user-entered unit price", () => {
  const result = calculatePurchaseCost(baseInput);
  assert.ok(result);
  assert.equal(result.quantity, 12);
  assert.equal(result.unitPrice, 8.75);
  assert.equal(result.total, 105);
  assert.equal(result.currencyLabel, "$" );
  assert.equal(result.unitLabel, "80 lb bag");
  assert.equal(formatPurchaseCost(result), "$ 105.00");
  assert.equal(formatPurchaseUnitPrice(result), "$ 8.75");
});

test("accepts zero as an explicit unit price", () => {
  const result = calculatePurchaseCost({ ...baseInput, unitPrice: "0" });
  assert.ok(result);
  assert.equal(result.total, 0);
});

test("trims a user-provided currency label without converting it", () => {
  const result = calculatePurchaseCost({
    ...baseInput,
    currencyLabel: " EGP ",
    unitPrice: "125.5",
  });
  assert.ok(result);
  assert.equal(result.currencyLabel, "EGP");
  assert.equal(result.total, 1506);
});

test("rejects negative and non-finite prices", () => {
  for (const unitPrice of ["-1", "Infinity", "NaN"]) {
    assert.throws(
      () => calculatePurchaseCost({ ...baseInput, unitPrice }),
      (error) =>
        error instanceof CostInputError && error.field === "unitPrice",
    );
  }
});

test("rejects unsafe purchase quantities", () => {
  for (const quantity of [-1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(
      () => calculatePurchaseCost({ ...baseInput, quantity }),
      (error) =>
        error instanceof CostInputError && error.field === "quantity",
    );
  }
});

test("requires a bounded currency label when a price is supplied", () => {
  for (const currencyLabel of ["", "abcdefghijklmn", "USD\nEUR"]) {
    assert.throws(
      () => calculatePurchaseCost({ ...baseInput, currencyLabel }),
      (error) =>
        error instanceof CostInputError && error.field === "currencyLabel",
    );
  }
});

test("rejects totals outside the reliable numeric range", () => {
  assert.throws(
    () =>
      calculatePurchaseCost({
        ...baseInput,
        quantity: 2,
        unitPrice: String(Number.MAX_SAFE_INTEGER),
      }),
    (error) =>
      error instanceof CostInputError && error.field === "unitPrice",
  );
});
