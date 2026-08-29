import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const layout = readFileSync(new URL("../app/column-calculator/layout.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../app/column-calculator/column-responsive.css", import.meta.url), "utf8");

test("column calculator keeps its mobile toggle shrinkable", () => {
  assert.match(layout, /column-responsive\.css/);
  assert.match(css, /@media \(max-width: 650px\)/);
  assert.match(css, /\.unit-toggle > button[\s\S]*min-width:\s*0/);
  assert.match(css, /\.unit-toggle > button[\s\S]*flex-wrap:\s*wrap/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
});
