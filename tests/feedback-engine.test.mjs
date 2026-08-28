import assert from "node:assert/strict";
import test from "node:test";
import { validateFeedbackPayload } from "../lib/feedback.ts";

const now = 1_800_000_000_000;

function validPayload(overrides = {}) {
  return {
    calculator: "concrete-calculator",
    category: "result_issue",
    calculationInputs: "9 ft × 9 ft × 4 in, 0% waste, 80 lb bags",
    actualResult: "1 yd³ and 45 bags",
    expectedResult: "1 yd³ and 45 bags",
    details: "I am checking the documented independent result vector.",
    clientToken: "123e4567-e89b-12d3-a456-426614174000",
    website: "",
    startedAt: now - 5_000,
    ...overrides,
  };
}

test("accepts a bounded anonymous calculator report", () => {
  const result = validateFeedbackPayload(validPayload(), now);

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.calculator, "concrete-calculator");
    assert.equal(result.value.category, "result_issue");
    assert.equal(result.value.details.startsWith("I am checking"), true);
  }
});

test("accepts the Circular Slab Calculator as a first-class feedback target", () => {
  const result = validateFeedbackPayload(
    validPayload({ calculator: "circular-slab-calculator" }),
    now,
  );

  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value.calculator, "circular-slab-calculator");
});

test("accepts the Footing Calculator as a first-class feedback target", () => {
  const result = validateFeedbackPayload(
    validPayload({ calculator: "footing-calculator" }),
    now,
  );

  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value.calculator, "footing-calculator");
});

test("accepts the Column Calculator as a first-class feedback target", () => {
  const result = validateFeedbackPayload(
    validPayload({ calculator: "column-calculator" }),
    now,
  );

  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value.calculator, "column-calculator");
});

test("accepts the Concrete Wall Calculator as a first-class feedback target", () => {
  const result = validateFeedbackPayload(
    validPayload({ calculator: "wall-calculator" }),
    now,
  );

  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value.calculator, "wall-calculator");
});

test("rejects unknown calculators and categories", () => {
  assert.equal(
    validateFeedbackPayload(validPayload({ calculator: "roofing-calculator" }), now).ok,
    false,
  );
  assert.equal(
    validateFeedbackPayload(validPayload({ category: "formula_override" }), now).ok,
    false,
  );
});

test("rejects too-short and oversized report content", () => {
  assert.equal(
    validateFeedbackPayload(validPayload({ details: "Too short" }), now).ok,
    false,
  );
  assert.equal(
    validateFeedbackPayload(validPayload({ details: "x".repeat(2_001) }), now).ok,
    false,
  );
  assert.equal(
    validateFeedbackPayload(
      validPayload({ calculationInputs: "x".repeat(1_001) }),
      now,
    ).ok,
    false,
  );
});

test("rejects honeypot submissions and implausible completion times", () => {
  assert.equal(
    validateFeedbackPayload(validPayload({ website: "spam.example" }), now).ok,
    false,
  );
  assert.equal(
    validateFeedbackPayload(validPayload({ startedAt: now - 500 }), now).ok,
    false,
  );
  assert.equal(
    validateFeedbackPayload(validPayload({ startedAt: now - 86_400_001 }), now).ok,
    false,
  );
});

test("rejects missing or malformed anonymous client tokens", () => {
  assert.equal(
    validateFeedbackPayload(validPayload({ clientToken: "short" }), now).ok,
    false,
  );
  assert.equal(
    validateFeedbackPayload(validPayload({ clientToken: "token with spaces that is long" }), now).ok,
    false,
  );
});
