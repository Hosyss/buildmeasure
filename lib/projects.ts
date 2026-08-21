import { parseSavedEstimateHistory } from "./history.ts";

export const PROJECTS_STORAGE_KEY = "buildmeasure.projects.v1";
export const PROJECT_NAME_MAX_LENGTH = 80;
export const PROJECT_ITEM_LIMIT = 50;
export const PROJECT_LIMIT = 10;

export type ProjectCalculatorId =
  | "concrete"
  | "post-hole-concrete"
  | "paint"
  | "tile"
  | "brick"
  | "gravel"
  | "mulch";

export type ProjectHistorySource = {
  id: ProjectCalculatorId;
  label: string;
  href: string;
  storageKey: string;
};

export const PROJECT_HISTORY_SOURCES: readonly ProjectHistorySource[] = [
  {
    id: "concrete",
    label: "Concrete",
    href: "/concrete-calculator",
    storageKey: "buildmeasure.concrete.history.v1",
  },
  {
    id: "post-hole-concrete",
    label: "Post-hole concrete",
    href: "/post-hole-concrete-calculator",
    storageKey: "buildmeasure.post-hole-concrete.history.v1",
  },
  {
    id: "paint",
    label: "Paint",
    href: "/paint-calculator",
    storageKey: "buildmeasure.paint.history.v1",
  },
  {
    id: "tile",
    label: "Tile",
    href: "/tile-calculator",
    storageKey: "buildmeasure.tile.history.v1",
  },
  {
    id: "brick",
    label: "Brick",
    href: "/brick-calculator",
    storageKey: "buildmeasure.brick.history.v1",
  },
  {
    id: "gravel",
    label: "Gravel",
    href: "/gravel-calculator",
    storageKey: "buildmeasure.gravel.history.v1",
  },
  {
    id: "mulch",
    label: "Mulch",
    href: "/mulch-calculator",
    storageKey: "buildmeasure.mulch.history.v1",
  },
];

export type ProjectEstimate = {
  calculator: ProjectCalculatorId;
  estimateId: number;
  label: string;
  summary: string;
};

export type SavedProject = {
  id: number;
  name: string;
  createdAt: string;
  items: ProjectEstimate[];
};

export type SerializedProjectHistories = Partial<
  Record<ProjectCalculatorId, string | null>
>;

export function getProjectHistorySource(calculator: ProjectCalculatorId) {
  return PROJECT_HISTORY_SOURCES.find((source) => source.id === calculator) ?? null;
}

export function projectEstimateKey(item: ProjectEstimate) {
  return `${item.calculator}:${item.estimateId}`;
}

function isProjectCalculatorId(value: unknown): value is ProjectCalculatorId {
  return (
    typeof value === "string" &&
    PROJECT_HISTORY_SOURCES.some((source) => source.id === value)
  );
}

function isProjectEstimate(value: unknown): value is ProjectEstimate {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as ProjectEstimate;
  return (
    isProjectCalculatorId(candidate.calculator) &&
    Number.isSafeInteger(candidate.estimateId) &&
    candidate.estimateId > 0 &&
    typeof candidate.label === "string" &&
    candidate.label.length > 0 &&
    typeof candidate.summary === "string" &&
    candidate.summary.length > 0
  );
}

function isSavedProject(value: unknown): value is SavedProject {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as SavedProject;
  return (
    Number.isSafeInteger(candidate.id) &&
    candidate.id > 0 &&
    typeof candidate.name === "string" &&
    candidate.name.trim().length > 0 &&
    candidate.name.length <= PROJECT_NAME_MAX_LENGTH &&
    typeof candidate.createdAt === "string" &&
    Number.isFinite(Date.parse(candidate.createdAt)) &&
    Array.isArray(candidate.items) &&
    candidate.items.length > 0 &&
    candidate.items.length <= PROJECT_ITEM_LIMIT &&
    candidate.items.every(isProjectEstimate)
  );
}

export function parseSavedProjects(serialized: string | null): SavedProject[] {
  if (!serialized) return [];

  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedProject).slice(0, PROJECT_LIMIT);
  } catch {
    return [];
  }
}

export function collectAvailableProjectEstimates(
  histories: SerializedProjectHistories,
): ProjectEstimate[] {
  return PROJECT_HISTORY_SOURCES.flatMap((source) =>
    parseSavedEstimateHistory(histories[source.id] ?? null).map((estimate) => ({
      calculator: source.id,
      estimateId: estimate.id,
      label: estimate.label,
      summary: estimate.summary,
    })),
  ).sort((a, b) => b.estimateId - a.estimateId);
}

export function addSavedProject(
  projects: SavedProject[],
  name: string,
  items: ProjectEstimate[],
  limit = PROJECT_LIMIT,
  timestamp = Date.now(),
): SavedProject[] {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error("Project name is required.");
  if (trimmedName.length > PROJECT_NAME_MAX_LENGTH) {
    throw new Error(`Project name must be ${PROJECT_NAME_MAX_LENGTH} characters or fewer.`);
  }

  const uniqueItems = Array.from(
    new Map(items.filter(isProjectEstimate).map((item) => [projectEstimateKey(item), item])).values(),
  ).slice(0, PROJECT_ITEM_LIMIT);
  if (!uniqueItems.length) throw new Error("Select at least one saved estimate.");

  const highestExistingId = projects.reduce(
    (highest, project) => Math.max(highest, project.id),
    0,
  );
  const id = Math.max(timestamp, highestExistingId + 1);
  const createdAt = new Date(timestamp).toISOString();

  return [
    {
      id,
      name: trimmedName,
      createdAt,
      items: uniqueItems,
    },
    ...projects,
  ].slice(0, Math.max(1, limit));
}

export function removeSavedProject(projects: SavedProject[], projectId: number) {
  return projects.filter((project) => project.id !== projectId);
}

export function formatSavedProject(project: SavedProject) {
  const lines = project.items.map((item) => {
    const source = getProjectHistorySource(item.calculator);
    return `- ${source?.label ?? item.calculator}: ${item.label} — ${item.summary}`;
  });

  return [
    `BuildMeasure project: ${project.name}`,
    `${project.items.length} saved estimate${project.items.length === 1 ? "" : "s"}`,
    "",
    ...lines,
  ].join("\n");
}
