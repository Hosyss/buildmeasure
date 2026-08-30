import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const homeCssUrl = new URL("../app/home-product.css", import.meta.url);

test("homepage workflow connector cannot rotate its full-width container", async () => {
  const css = await readFile(homeCssUrl, "utf8");
  const connectorBlock = css.match(/\.how-connector\s*\{([\s\S]*?)\}/)?.[1] ?? "";

  assert.ok(connectorBlock, "expected .how-connector styles");
  assert.doesNotMatch(
    connectorBlock,
    /transform\s*:\s*rotate\s*\(/i,
    "rotating the full-width connector creates a tall overlay that clips mobile workflow text",
  );
  assert.match(css, /\.how-connector::before\s*\{[\s\S]*?content:\s*["']↓["']/);
});
