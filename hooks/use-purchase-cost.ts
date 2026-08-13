"use client";

import { useMemo, useState } from "react";
import {
  calculatePurchaseCost,
  CostInputError,
  DEFAULT_CURRENCY_LABEL,
} from "@/lib/cost-estimate";

export function usePurchaseCost(
  quantity: number | null,
  unitLabel: string,
) {
  const [unitPrice, setUnitPrice] = useState("");
  const [currencyLabel, setCurrencyLabel] = useState(DEFAULT_CURRENCY_LABEL);

  const calculation = useMemo(() => {
    if (quantity === null) return { result: null, error: null };

    try {
      return {
        result: calculatePurchaseCost({
          quantity,
          unitPrice,
          currencyLabel,
          unitLabel,
        }),
        error: null,
      };
    } catch (error) {
      if (error instanceof CostInputError) {
        return { result: null, error };
      }
      throw error;
    }
  }, [currencyLabel, quantity, unitLabel, unitPrice]);

  function clearUnitPrice() {
    setUnitPrice("");
  }

  function resetCost() {
    setUnitPrice("");
    setCurrencyLabel(DEFAULT_CURRENCY_LABEL);
  }

  return {
    unitPrice,
    currencyLabel,
    setUnitPrice,
    setCurrencyLabel,
    clearUnitPrice,
    resetCost,
    result: calculation.result,
    error: calculation.error,
  };
}
