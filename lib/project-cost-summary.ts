import type { SavedProject } from "./projects.ts";

export type ProjectCostGroup = {
  currencyLabel: string;
  total: number;
  pricedLineCount: number;
};

export type ProjectCostSummary = {
  groups: ProjectCostGroup[];
  purchaseLineCount: number;
  pricedLineCount: number;
  unpricedLineCount: number;
};

export function buildProjectCostSummary(
  project: Pick<SavedProject, "items">,
): ProjectCostSummary {
  const grouped = new Map<string, ProjectCostGroup>();
  let purchaseLineCount = 0;
  let pricedLineCount = 0;

  for (const item of project.items) {
    const purchase = item.purchase;
    if (!purchase) continue;

    purchaseLineCount += 1;

    if (
      purchase.total === undefined ||
      purchase.currencyLabel === undefined
    ) {
      continue;
    }

    pricedLineCount += 1;
    const currencyLabel = purchase.currencyLabel.trim();
    const current = grouped.get(currencyLabel);
    const total = (current?.total ?? 0) + purchase.total;

    if (!Number.isFinite(total) || Math.abs(total) > Number.MAX_SAFE_INTEGER) {
      throw new RangeError("Project cost total exceeds the safe numeric range.");
    }

    grouped.set(currencyLabel, {
      currencyLabel,
      total,
      pricedLineCount: (current?.pricedLineCount ?? 0) + 1,
    });
  }

  return {
    groups: [...grouped.values()],
    purchaseLineCount,
    pricedLineCount,
    unpricedLineCount: purchaseLineCount - pricedLineCount,
  };
}

export function formatProjectCostGroup(group: ProjectCostGroup) {
  return `${group.currencyLabel} ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(group.total)}`;
}
