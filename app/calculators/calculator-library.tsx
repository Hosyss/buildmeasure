"use client";

import { useMemo, useState } from "react";
import {
  CALCULATOR_CATALOG,
  CALCULATOR_GROUPS,
  calculatorSearchText,
  type CalculatorCatalogGroup,
} from "@/lib/calculator-catalog";
import styles from "./calculator-library.module.css";

type GroupFilter = "All tools" | CalculatorCatalogGroup;

export function CalculatorLibrary() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<GroupFilter>("All tools");

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      CALCULATOR_CATALOG.filter((calculator) => {
        const groupMatches = group === "All tools" || calculator.group === group;
        const queryMatches =
          !normalizedQuery || calculatorSearchText(calculator).includes(normalizedQuery);
        return groupMatches && queryMatches;
      }),
    [group, normalizedQuery],
  );

  const filters: readonly GroupFilter[] = ["All tools", ...CALCULATOR_GROUPS];

  return (
    <div className={styles.libraryShell}>
      <div className={styles.libraryToolbar}>
        <div className={styles.searchRow}>
          <label className={styles.searchLabel}>
            <span>Search calculators</span>
            <input
              className={styles.searchInput}
              type="search"
              value={query}
              placeholder="Try concrete, tile, drywall, fence…"
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
            />
          </label>
          <div className={styles.resultCount} aria-live="polite">
            {filtered.length} of {CALCULATOR_CATALOG.length} tools
          </div>
        </div>

        <div className={styles.filters} aria-label="Filter calculators by work area">
          {filters.map((filter) => {
            const active = group === filter;
            return (
              <button
                className={`${styles.filterButton} ${active ? styles.filterButtonActive : ""}`}
                key={filter}
                type="button"
                aria-pressed={active}
                onClick={() => setGroup(filter)}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.libraryGrid}>
        {filtered.map((calculator) => (
          <article className={styles.toolCard} key={calculator.id} data-calculator-id={calculator.id}>
            <div className={styles.cardTopline}>
              <span className={styles.family}>{calculator.family}</span>
              {calculator.featured ? <span className={styles.featured}>Popular workflow</span> : null}
            </div>
            <h2>{calculator.name}</h2>
            <p>{calculator.description}</p>
            <div className={styles.cardActions}>
              <a className={styles.primaryAction} href={calculator.href}>
                Open calculator
              </a>
              <a className={styles.secondaryAction} href={calculator.guideHref}>
                Read guide
              </a>
            </div>
          </article>
        ))}

        {!filtered.length ? (
          <div className={styles.emptyState} role="status">
            <h2>No calculator matched that search.</h2>
            <p>Try a material name, project type, or clear the work-area filter.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
