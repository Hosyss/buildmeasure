/**
 * Rounds a nonnegative material quantity upward without turning a
 * floating-point representation artifact at an integer boundary into an
 * extra purchase unit.
 *
 * Returns null when the input cannot be represented as a safe JavaScript
 * integer. The absolute tolerance is capped so it cannot grow with very large
 * quantities.
 */
export function ceilToSafeInteger(value: number): number | null {
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > Number.MAX_SAFE_INTEGER
  ) {
    return null;
  }

  const nearestInteger = Math.round(value);
  const tolerance = Math.min(
    1e-9,
    Number.EPSILON * Math.max(1, Math.abs(value)) * 16,
  );
  const rounded =
    nearestInteger > 0 &&
    Math.abs(value - nearestInteger) <= tolerance
      ? nearestInteger
      : Math.ceil(value);

  return Number.isSafeInteger(rounded) ? rounded : null;
}
