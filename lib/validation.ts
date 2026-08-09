export function isPositiveFinite(value: number) {
  return Number.isFinite(value) && value > 0;
}

export function isFiniteInRange(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Number.isFinite(value) && value >= minimum && value <= maximum;
}

export function isWholeNumberInRange(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Number.isInteger(value) && value >= minimum && value <= maximum;
}
