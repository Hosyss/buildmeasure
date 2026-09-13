import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const homeCssUrl = new URL("../app/home-product.css", import.meta.url);
const homeAnchorCssUrl = new URL("../app/home-anchor.css", import.meta.url);
const layoutUrl = new URL("../app/layout.tsx", import.meta.url);

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

test("homepage workflow anchor clears the sticky header without an oversized gap", async () => {
  const [anchorCss, layout] = await Promise.all([
    readFile(homeAnchorCssUrl, "utf8"),
    readFile(layoutUrl, "utf8"),
  ]);

  assert.match(layout, /import\s+["']\.\/home-anchor\.css["'];/);
  assert.match(
    anchorCss,
    /#how-it-works\s*\{[\s\S]*?scroll-margin-top\s*:\s*20px\s*;/,
    "desktop/tablet anchor spacing should account for the section's built-in top padding",
  );
  assert.match(
    anchorCss,
    /@media\s*\(max-width:\s*700px\)[\s\S]*?#how-it-works\s*\{[\s\S]*?scroll-margin-top\s*:\s*64px\s*;/,
    "mobile anchor spacing should leave the heading just below the sticky header",
  );
});
