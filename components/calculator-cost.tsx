"use client";

import {
  formatPurchaseCost,
  formatPurchaseUnitPrice,
  MAX_CURRENCY_LABEL_LENGTH,
  type CostInputError,
  type PurchaseCostResult,
} from "@/lib/cost-estimate";

type CalculatorCostFieldsProps = {
  unitLabel: string;
  unitPrice: string;
  currencyLabel: string;
  error: CostInputError | null;
  errorId: string;
  onUnitPriceChange: (value: string) => void;
  onCurrencyLabelChange: (value: string) => void;
};

export function CalculatorCostFields({
  unitLabel,
  unitPrice,
  currencyLabel,
  error,
  errorId,
  onUnitPriceChange,
  onCurrencyLabelChange,
}: CalculatorCostFieldsProps) {
  const priceLabel = `Optional price per ${unitLabel}`;

  return (
    <>
      <div className="option-grid">
        <label className={error?.field === "unitPrice" ? "field-invalid" : ""}>
          <span>{priceLabel}</span>
          <span className="input-with-unit">
            <input
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={unitPrice}
              placeholder="Leave blank"
              onChange={(event) => onUnitPriceChange(event.target.value)}
              aria-label={`Price per ${unitLabel}`}
              aria-describedby={error?.field === "unitPrice" ? errorId : `${errorId}-help`}
            />
            <span>{currencyLabel.trim() || "currency"}</span>
          </span>
          <small id={`${errorId}-help`}>
            Uses the supplier price you enter for the current {unitLabel}. No live prices are fetched.
          </small>
        </label>

        <label className={error?.field === "currencyLabel" ? "field-invalid" : ""}>
          <span>Currency label</span>
          <span className="input-with-unit">
            <input
              type="text"
              value={currencyLabel}
              maxLength={MAX_CURRENCY_LABEL_LENGTH}
              placeholder="$, EUR, EGP"
              onChange={(event) => onCurrencyLabelChange(event.target.value)}
              aria-describedby={error?.field === "currencyLabel" ? errorId : `${errorId}-currency-help`}
            />
            <span>label</span>
          </span>
          <small id={`${errorId}-currency-help`}>
            Display only. BuildMeasure does not convert currencies or exchange rates.
          </small>
        </label>
      </div>

      {error ? (
        <p className="calculator-error" id={errorId} role="alert">
          {error.message}
        </p>
      ) : null}
    </>
  );
}

type CalculatorCostResultProps = {
  result: PurchaseCostResult | null;
};

export function CalculatorCostResult({ result }: CalculatorCostResultProps) {
  if (!result) return null;

  return (
    <>
      <div className="surface-summary">
        <span>Estimated material cost</span>
        <strong>{formatPurchaseCost(result)}</strong>
        <span>Based on</span>
        <strong>
          {result.quantity} × {formatPurchaseUnitPrice(result)} per {result.unitLabel}
        </strong>
      </div>
      <p className="result-caution">
        Cost is approximate and uses only your entered unit price. Tax, delivery,
        labor, discounts, minimum-order rules, and future price changes are not included.
      </p>
    </>
  );
}
