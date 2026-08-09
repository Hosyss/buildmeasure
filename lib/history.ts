export type SavedEstimate = {
  id: number;
  label: string;
  summary: string;
};

export function parseSavedEstimateHistory(
  serialized: string | null,
): SavedEstimate[] {
  if (!serialized) return [];

  try {
    const parsed: unknown = JSON.parse(serialized);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is SavedEstimate =>
        typeof item === "object" &&
        item !== null &&
        Number.isSafeInteger((item as SavedEstimate).id) &&
        typeof (item as SavedEstimate).label === "string" &&
        typeof (item as SavedEstimate).summary === "string",
    );
  } catch {
    return [];
  }
}

export function addSavedEstimate(
  history: SavedEstimate[],
  estimate: Omit<SavedEstimate, "id">,
  limit = 5,
  timestamp = Date.now(),
): SavedEstimate[] {
  const highestExistingId = history.reduce(
    (highest, item) => Math.max(highest, item.id),
    0,
  );
  const id = Math.max(timestamp, highestExistingId + 1);

  return [{ ...estimate, id }, ...history].slice(0, limit);
}
