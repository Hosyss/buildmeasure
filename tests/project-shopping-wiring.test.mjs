import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const calculatorFiles = [
  "app/concrete-calculator/concrete-calculator.tsx",
  "app/post-hole-concrete-calculator/post-hole-concrete-calculator.tsx",
  "app/paint-calculator/paint-calculator.tsx",
  "app/tile-calculator/tile-calculator.tsx",
  "app/brick-calculator/brick-calculator.tsx",
  "app/gravel-calculator/gravel-calculator.tsx",
  "app/mulch-calculator/mulch-calculator.tsx",
  "app/drywall-calculator/drywall-calculator.tsx",
];

test("all eight calculator save actions persist structured purchase quantities", () => {
  assert.equal(calculatorFiles.length, 8);
  for (const file of calculatorFiles) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.match(source, /createSavedEstimatePurchase/);
    assert.match(source, /purchase:\s*createSavedEstimatePurchase\(/);
    assert.match(source, /purchaseUnitLabel/);
    assert.match(source, /purchaseCost\.result/);
  }
});
