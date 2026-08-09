import assert from "node:assert/strict";
import test from "node:test";
import { formatQuantityLabel } from "../lib/labels.ts";

test("uses singular and plural quantity labels correctly", () => {
  assert.equal(formatQuantityLabel(1, "coat"), "1 coat");
  assert.equal(formatQuantityLabel(2, "coat"), "2 coats");
  assert.equal(formatQuantityLabel(0, "box", "boxes"), "0 boxes");
});
