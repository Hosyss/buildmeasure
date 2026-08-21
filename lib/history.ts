import {
  MAX_CURRENCY_LABEL_LENGTH,
  type PurchaseCostResult,
} from "./cost-estimate.ts";

export const MAX_PURCHASE_UNIT_LABEL_LENGTH = 80;

export type SavedEstimatePurchase = {
  quantity: number;
  unitLabel: string;
  unitPrice?: number;
  total?: number;
  currencyLabel?: string;
};

export type SavedEstimate = {
  id: number;
  label: string;
  summary: string;
  purchase?: SavedEstimatePurchase;
};

function validSingleLineLabel(value: unknown, maxLength: number) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maxLength &&
    !/[\r\n\t]/.test(value)
  );
}

export function isSavedEstimatePurchase(
  value: unknown,
): value is SavedEstimatePurchase {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as SavedEstimatePurchase;
  if (
    !Number.isSafeInteger(candidate.quantity) ||
    candidate.quantity < 0 ||
    !validSingleLineLabel(candidate.unitLabel, MAX_PURCHASE_UNIT_LABEL_LENGTH)
  ) {
    return false;
  }

  const hasUnitPrice = candidate.unitPrice !== undefined;
  const hasTotal = candidate.total !== undefined;
  const hasCurrency = candidate.currencyLabel !== undefined;
  const hasAnyCost = hasUnitPrice || hasTotal || hasCurrency;

  if (!hasAnyCost) return true;
  if (!(hasUnitPrice && hasTotal && hasCurrency)) return false;

  return (
    typeof candidate.unitPrice === "number" &&
    Number.isFinite(candidate.unitPrice) &&
    candidate.unitPrice >= 0 &&
    typeof candidate.total === "number" &&
    Number.isFinite(candidate.total) &&
    candidate.total >= 0 &&
    Math.abs(candidate.total) <= Number.MAX_SAFE_INTEGER &&
    candidate.total === candidate.quantity * candidate.unitPrice &&
    validSingleLineLabel(candidate.currencyLabel, MAX_CURRENCY_LABEL_LENGTH)
  );
}

export function createSavedEstimatePurchase(
  quantity: number | null,
  unitLabel: string,
  cost: PurchaseCostResult | null,
): SavedEstimatePurchase | undefined {
  const normalizedUnit = unitLabel.trim();
  const base: SavedEstimatePurchase = {
    quantity: quantity ?? Number.NaN,
    unitLabel: normalizedUnit,
  };

  if (!isSavedEstimatePurchase(base)) return undefined;
  if (!cost) return base;

  const withCost: SavedEstimatePurchase = {
    ...base,
    unitPrice: cost.unitPrice,
    total: cost.total,
    currencyLabel: cost.currencyLabel,
  };

  if (
    cost.quantity !== base.quantity ||
    cost.unitLabel !== base.unitLabel ||
    !isSavedEstimatePurchase(withCost)
  ) {
    return base;
  }

  return withCost;
}

export function parseSavedEstimateHistory(
  serialized: string | null,
): SavedEstimate[] {
  if (!serialized) return [];

  try {
    const parsed: unknown = JSON.parse(serialized);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is SavedEstimate => {
      if (typeof item !== "object" || item === null) return false;
      const candidate = item as SavedEstimate;
      return (
        Number.isSafeInteger(candidate.id) &&
        typeof candidate.label === "string" &&
        typeof candidate.summary === "string" &&
        (candidate.purchase === undefined ||
          isSavedEstimatePurchase(candidate.purchase))
      );
    });
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
