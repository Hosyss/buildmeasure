export function formatQuantityLabel(
  quantity: number,
  singular: string,
  plural = `${singular}s`,
) {
  return `${quantity} ${quantity === 1 ? singular : plural}`;
}
