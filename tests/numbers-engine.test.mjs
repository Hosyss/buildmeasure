import assert from "node:assert/strict";
import test from "node:test";
import { ceilToSafeInteger } from "../lib/numbers.ts";

test("removes only microscopic integer-boundary artifacts", () => {
  assert.equal(ceilToSafeInteger(5.000000000000001), 5);
  assert.equal(ceilToSafeInteger(110.00000000000004), 110);
  assert.equal(ceilToSafeInteger(5.00000001), 6);
});

test("rounds every positive non-boundary quantity upward", () => {
  assert.equal(ceilToSafeInteger(Number.MIN_VALUE), 1);
  assert.equal(ceilToSafeInteger(0.01), 1);
  assert.equal(ceilToSafeInteger(5.25), 6);
});

test("rejects non-finite and unsafe integer quantities", () => {
  assert.equal(ceilToSafeInteger(Number.POSITIVE_INFINITY), null);
  assert.equal(ceilToSafeInteger(Number.NaN), null);
  assert.equal(ceilToSafeInteger(Number.MAX_SAFE_INTEGER + 1), null);
});
