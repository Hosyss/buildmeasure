export const DEFAULT_CURRENCY_LABEL = "$";
export const MAX_CURRENCY_LABEL_LENGTH = 12;

export type CostInputField =
  | "quantity"
  | "unitPrice"
  | "currencyLabel"
  | "unitLabel";

export class CostInputError extends Error {
  readonly field: CostInputField;

  constructor(field: CostInputField, message: string) {
    super(message);
    this.name = "CostInputError";
    this.field = field;
  }
}

export type PurchaseCostResult = {
  quantity: number;
  unitPrice: number;
  total: number;
  currencyLabel: string;
  unitLabel: string;
};

type PurchaseCostInput = {
  quantity: number;
  unitPrice: string;
  currencyLabel: string;
  unitLabel: string;
};

function normalizedLabel(value: string, field: "currencyLabel" | "unitLabel") {
  const label = value.trim();

  if (!label) {
    throw new CostInputError(
      field,
      field === "currencyLabel"
        ? "Enter a currency label when a unit price is supplied."
        : "A purchase unit label is required for the cost estimate.",
    );
  }

  if (/\r|\n|\t/.test(label)) {
    throw new CostInputError(field, "Labels cannot contain line breaks or tabs.");
  }

  if (field === "currencyLabel" && label.length > MAX_CURRENCY_LABEL_LENGTH) {
    throw new CostInputError(
      field,
      `Currency label must be ${MAX_CURRENCY_LABEL_LENGTH} characters or fewer.`,
    );
  }

  return label;
}

export function calculatePurchaseCost({
  quantity,
  unitPrice,
  currencyLabel,
  unitLabel,
}: PurchaseCostInput): PurchaseCostResult | null {
  const priceText = unitPrice.trim();
  if (!priceText) return null;

  if (!Number.isSafeInteger(quantity) || quantity < 0) {
    throw new CostInputError(
      "quantity",
      "Purchase quantity must be a nonnegative safe whole number.",
    );
  }

  const price = Number(priceText);
  if (!Number.isFinite(price) || price < 0) {
    throw new CostInputError(
      "unitPrice",
      "Unit price must be a finite number that is zero or greater.",
    );
  }

  const normalizedCurrency = normalizedLabel(currencyLabel, "currencyLabel");
  const normalizedUnit = normalizedLabel(unitLabel, "unitLabel");
  const total = quantity * price;

  if (
    !Number.isFinite(total) ||
    Math.abs(total) > Number.MAX_SAFE_INTEGER ||
    (price > 0 && quantity > 0 && total === 0)
  ) {
    throw new CostInputError(
      "unitPrice",
      "That price is outside the safe numeric range for a reliable total.",
    );
  }

  return {
    quantity,
    unitPrice: price,
    total,
    currencyLabel: normalizedCurrency,
    unitLabel: normalizedUnit,
  };
}

function formatMoneyNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPurchaseCost(result: PurchaseCostResult) {
  return `${result.currencyLabel} ${formatMoneyNumber(result.total)}`;
}

export function formatPurchaseUnitPrice(result: PurchaseCostResult) {
  return `${result.currencyLabel} ${formatMoneyNumber(result.unitPrice)}`;
}
