import assert from "node:assert/strict";
import test from "node:test";
import {
  addSavedProject,
  collectAvailableProjectEstimates,
  formatSavedProject,
  parseSavedProjects,
  projectEstimateKey,
  removeSavedProject,
} from "../lib/projects.ts";

const concrete = {
  calculator: "concrete",
  estimateId: 100,
  label: "10 × 10 × 4 ft / in",
  summary: "1.36 yd³ · 62 × 80 lb bags",
};

const paint = {
  calculator: "paint",
  estimateId: 200,
  label: "12 × 10 × 8 ft",
  summary: "2 × 1 gal · 1.6 gal",
};

test("collects valid saved estimates across calculator histories newest first", () => {
  const result = collectAvailableProjectEstimates({
    concrete: JSON.stringify([
      { id: 100, label: concrete.label, summary: concrete.summary },
      { id: 99, label: 123, summary: "invalid" },
    ]),
    paint: JSON.stringify([
      { id: 200, label: paint.label, summary: paint.summary },
    ]),
    tile: "{",
  });

  assert.deepEqual(result, [paint, concrete]);
});

test("creates a trimmed project, deduplicates estimate snapshots, and keeps newest first", () => {
  const existing = [
    {
      id: 300,
      name: "Existing",
      createdAt: "2026-08-20T00:00:00.000Z",
      items: [concrete],
    },
  ];
  const result = addSavedProject(
    existing,
    "  Back patio  ",
    [concrete, concrete, paint],
    10,
    300,
  );

  assert.equal(result[0].id, 301);
  assert.equal(result[0].name, "Back patio");
  assert.equal(result[0].createdAt, "1970-01-01T00:00:00.300Z");
  assert.deepEqual(result[0].items, [concrete, paint]);
  assert.equal(result[1], existing[0]);
});

test("rejects blank names and empty projects", () => {
  assert.throws(() => addSavedProject([], "   ", [concrete]), /Project name is required/);
  assert.throws(() => addSavedProject([], "Kitchen", []), /Select at least one saved estimate/);
});

test("parses only valid saved projects and recovers from malformed storage", () => {
  const valid = {
    id: 10,
    name: "Kitchen",
    createdAt: "2026-08-21T00:00:00.000Z",
    items: [paint],
  };
  const parsed = parseSavedProjects(
    JSON.stringify([
      valid,
      { ...valid, id: 11, items: [] },
      { ...valid, id: 12, createdAt: "not-a-date" },
    ]),
  );

  assert.deepEqual(parsed, [valid]);
  assert.deepEqual(parseSavedProjects("{"), []);
  assert.deepEqual(parseSavedProjects(null), []);
});

test("formats and removes saved projects without exposing storage internals", () => {
  const project = {
    id: 10,
    name: "Kitchen",
    createdAt: "2026-08-21T00:00:00.000Z",
    items: [concrete, paint],
  };
  const text = formatSavedProject(project);

  assert.match(text, /^BuildNumbers project: Kitchen/m);
  assert.match(text, /Concrete: 10 × 10 × 4 ft \/ in/);
  assert.match(text, /Paint: 12 × 10 × 8 ft/);
  assert.doesNotMatch(text, /buildmeasure\./);
  assert.equal(projectEstimateKey(concrete), "concrete:100");
  assert.deepEqual(removeSavedProject([project], project.id), []);
});
