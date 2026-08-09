export type UnitSystem = "imperial" | "metric";

export function isUnitSystem(value: unknown): value is UnitSystem {
  return value === "imperial" || value === "metric";
}
