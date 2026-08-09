"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  addSavedEstimate,
  parseSavedEstimateHistory,
  type SavedEstimate,
} from "@/lib/history";

export type { SavedEstimate } from "@/lib/history";

const EMPTY_HISTORY = "[]";
const HISTORY_CHANGE_EVENT = "buildmeasure:history-change";

function readSerializedHistory(storageKey: string) {
  try {
    return window.localStorage.getItem(storageKey) ?? EMPTY_HISTORY;
  } catch {
    return EMPTY_HISTORY;
  }
}

function getServerSnapshot() {
  return EMPTY_HISTORY;
}

function notifyHistoryChange(storageKey: string) {
  window.dispatchEvent(
    new CustomEvent(HISTORY_CHANGE_EVENT, {
      detail: storageKey,
    }),
  );
}

export function useSavedEstimates(storageKey: string, limit = 5) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const handleStorage = (event: StorageEvent) => {
        if (event.key === storageKey) onStoreChange();
      };
      const handleLocalChange = (event: Event) => {
        if (
          event instanceof CustomEvent &&
          event.detail === storageKey
        ) {
          onStoreChange();
        }
      };

      window.addEventListener("storage", handleStorage);
      window.addEventListener(
        HISTORY_CHANGE_EVENT,
        handleLocalChange,
      );

      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(
          HISTORY_CHANGE_EVENT,
          handleLocalChange,
        );
      };
    },
    [storageKey],
  );
  const getSnapshot = useCallback(
    () => readSerializedHistory(storageKey),
    [storageKey],
  );
  const serializedHistory = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const history = useMemo(
    () => parseSavedEstimateHistory(serializedHistory),
    [serializedHistory],
  );

  function saveEstimate(estimate: Omit<SavedEstimate, "id">) {
    const current = parseSavedEstimateHistory(
      readSerializedHistory(storageKey),
    );
    const next = addSavedEstimate(current, estimate, limit);

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      return;
    }

    notifyHistoryChange(storageKey);
  }

  function clearHistory() {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      return;
    }

    notifyHistoryChange(storageKey);
  }

  return { history, saveEstimate, clearHistory };
}
