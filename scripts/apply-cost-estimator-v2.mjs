import { readFile, writeFile } from "node:fs/promises";

const path = "CHANGELOG.md";
const marker = "### Added";
const mask = "### __COST_PATCH_ADDED__";
const original = await readFile(path, "utf8");
const first = original.indexOf(marker);

if (first < 0) throw new Error("Missing Unreleased Added heading in CHANGELOG.md");

const masked =
  original.slice(0, first + marker.length) +
  original.slice(first + marker.length).replaceAll(marker, mask);
await writeFile(path, masked, "utf8");

try {
  await import("./apply-cost-estimator.mjs");
} finally {
  const updated = await readFile(path, "utf8");
  await writeFile(path, updated.replaceAll(mask, marker), "utf8");
}
