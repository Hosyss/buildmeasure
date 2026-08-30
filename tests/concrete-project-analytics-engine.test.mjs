import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../app/concrete-project-calculator/concrete-project-calculator.tsx", import.meta.url),
  "utf8",
);

test("multi-shape concrete project uses the shared calculator analytics lifecycle", () => {
  assert.match(source, /useCalculatorAnalytics/);
  assert.match(
    source,
    /useCalculatorAnalytics\(\s*["']concrete-project-calculator["']/,
  );
  assert.match(source, /const markInteraction = useCalculatorAnalytics/);
  assert.match(source, /function patchPart[\s\S]*markInteraction\(\)/);
  assert.match(source, /Project allowance[\s\S]*markInteraction\(\)/);
  assert.match(source, /Concrete bag size[\s\S]*markInteraction\(\)/);
});
