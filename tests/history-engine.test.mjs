import assert from "node:assert/strict";
import test from "node:test";
import {
  addSavedEstimate,
  parseSavedEstimateHistory,
} from "../lib/history.ts";

test("parses only valid saved estimates", () => {
  const parsed = parseSavedEstimateHistory(
    JSON.stringify([
      { id: 1, label: "Valid", summary: "10 bags" },
      { id: 2, label: 123, summary: "Invalid label" },
      { id: Number.MAX_SAFE_INTEGER + 1, label: "Unsafe", summary: "ID" },
      null,
    ]),
  );

  assert.deepEqual(parsed, [
    { id: 1, label: "Valid", summary: "10 bags" },
  ]);
});

test("recovers from malformed or non-array storage values", () => {
  assert.deepEqual(parseSavedEstimateHistory("{"), []);
  assert.deepEqual(parseSavedEstimateHistory('{"id":1}'), []);
  assert.deepEqual(parseSavedEstimateHistory(null), []);
});

test("adds newest estimates first with a unique id and fixed limit", () => {
  const history = [
    { id: 100, label: "Existing A", summary: "A" },
    { id: 99, label: "Existing B", summary: "B" },
  ];
  const result = addSavedEstimate(
    history,
    { label: "Newest", summary: "C" },
    2,
    100,
  );

  assert.deepEqual(result, [
    { id: 101, label: "Newest", summary: "C" },
    history[0],
  ]);
});
