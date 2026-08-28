"use client";

import { useSyncExternalStore } from "react";
import styles from "@/app/projects/projects.module.css";
import {
  buildProjectCostSummary,
  formatProjectCostGroup,
  type ProjectCostSummary,
} from "@/lib/project-cost-summary";
import {
  parseSavedProjects,
  PROJECTS_STORAGE_KEY,
  type SavedProject,
} from "@/lib/projects";

const PROJECTS_CHANGE_EVENT = "buildmeasure:projects-change";

function readProjectsSnapshot() {
  try {
    return window.localStorage.getItem(PROJECTS_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function getServerSnapshot() {
  return "";
}

function subscribe(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === PROJECTS_STORAGE_KEY) onStoreChange();
  };
  const handleProjectChange = () => onStoreChange();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(PROJECTS_CHANGE_EVENT, handleProjectChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(PROJECTS_CHANGE_EVENT, handleProjectChange);
  };
}

function summarize(project: SavedProject): ProjectCostSummary | null {
  try {
    return buildProjectCostSummary(project);
  } catch {
    return null;
  }
}

export function ProjectCostSummaryPanel() {
  const serializedProjects = useSyncExternalStore(
    subscribe,
    readProjectsSnapshot,
    getServerSnapshot,
  );
  const projects = parseSavedProjects(serializedProjects || null);
  const summaries = projects
    .map((project) => ({ project, summary: summarize(project) }))
    .filter(({ summary }) => summary === null || summary.purchaseLineCount > 0);

  return (
    <section
      className={`history-panel no-print ${styles.saved}`}
      aria-labelledby="project-cost-summary-title"
    >
      <div className="history-head">
        <div>
          <p className="panel-kicker">Project Mode</p>
          <h2 id="project-cost-summary-title">Project cost roll-up</h2>
          <p className={styles.savedHelp}>
            Totals use only structured prices saved with calculator estimates.
            Currency labels are kept separate exactly as entered; BuildNumbers
            does not convert currencies or infer exchange rates.
          </p>
        </div>
        <span className="status-pill">No FX</span>
      </div>

      {summaries.length ? (
        <div className={styles.savedGrid}>
          {summaries.map(({ project, summary }) => (
            <article className={styles.projectCard} key={project.id}>
              <div className={styles.projectHead}>
                <div>
                  <h3>{project.name}</h3>
                  <p className={styles.projectMeta}>
                    {summary
                      ? `${summary.pricedLineCount} priced of ${summary.purchaseLineCount} purchase lines`
                      : "Cost total unavailable"}
                  </p>
                </div>
              </div>

              {summary?.groups.length ? (
                <ul className={styles.shoppingList} aria-label={`${project.name} cost totals`}>
                  {summary.groups.map((group) => (
                    <li key={group.currencyLabel}>
                      <span>
                        <strong>{group.currencyLabel}</strong>
                        <small>
                          {group.pricedLineCount} priced line
                          {group.pricedLineCount === 1 ? "" : "s"}
                        </small>
                      </span>
                      <b>{formatProjectCostGroup(group)}</b>
                    </li>
                  ))}
                </ul>
              ) : summary ? (
                <p className={styles.empty}>No saved prices are available for this project yet.</p>
              ) : (
                <p className={styles.empty} role="alert">
                  The saved totals exceed the safe numeric range, so BuildNumbers
                  will not display an aggregate cost.
                </p>
              )}

              {summary && summary.unpricedLineCount > 0 ? (
                <p className={styles.helper}>
                  {summary.unpricedLineCount} purchase line
                  {summary.unpricedLineCount === 1 ? " is" : "s are"} excluded
                  because no price was saved with the estimate.
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="history-empty">
          Save an estimate with an optional package price, add it to a project,
          and the structured cost total will appear here on this device.
        </p>
      )}
    </section>
  );
}
