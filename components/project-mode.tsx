"use client";

import {
  FormEvent,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  addSavedProject,
  collectAvailableProjectEstimates,
  formatSavedProject,
  getProjectHistorySource,
  parseSavedProjects,
  PROJECT_HISTORY_SOURCES,
  PROJECT_NAME_MAX_LENGTH,
  PROJECTS_STORAGE_KEY,
  projectEstimateKey,
  removeSavedProject,
  type SavedProject,
  type SerializedProjectHistories,
} from "@/lib/projects";
import styles from "@/app/projects/projects.module.css";

const PROJECTS_CHANGE_EVENT = "buildmeasure:projects-change";

function emptyHistories(): SerializedProjectHistories {
  return Object.fromEntries(
    PROJECT_HISTORY_SOURCES.map((source) => [source.id, null]),
  ) as SerializedProjectHistories;
}

const EMPTY_WORKSPACE_SNAPSHOT = JSON.stringify({
  histories: emptyHistories(),
  projects: null,
});

function readWorkspaceSnapshot() {
  const histories = emptyHistories();

  try {
    for (const source of PROJECT_HISTORY_SOURCES) {
      histories[source.id] = window.localStorage.getItem(source.storageKey);
    }

    return JSON.stringify({
      histories,
      projects: window.localStorage.getItem(PROJECTS_STORAGE_KEY),
    });
  } catch {
    return EMPTY_WORKSPACE_SNAPSHOT;
  }
}

function getServerSnapshot() {
  return EMPTY_WORKSPACE_SNAPSHOT;
}

function subscribe(onStoreChange: () => void) {
  const trackedKeys = new Set([
    PROJECTS_STORAGE_KEY,
    ...PROJECT_HISTORY_SOURCES.map((source) => source.storageKey),
  ]);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || trackedKeys.has(event.key)) onStoreChange();
  };
  const handleProjectChange = () => onStoreChange();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(PROJECTS_CHANGE_EVENT, handleProjectChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(PROJECTS_CHANGE_EVENT, handleProjectChange);
  };
}

function parseWorkspaceSnapshot(serialized: string) {
  try {
    const parsed = JSON.parse(serialized) as {
      histories?: SerializedProjectHistories;
      projects?: string | null;
    };

    return {
      available: collectAvailableProjectEstimates(parsed.histories ?? {}),
      projects: parseSavedProjects(parsed.projects ?? null),
    };
  } catch {
    return {
      available: collectAvailableProjectEstimates({}),
      projects: [],
    };
  }
}

function persistProjects(projects: SavedProject[]) {
  try {
    window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    window.dispatchEvent(new Event(PROJECTS_CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

function formatProjectDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
      new Date(iso),
    );
  } catch {
    return "Saved on this device";
  }
}

export function ProjectMode() {
  const serializedWorkspace = useSyncExternalStore(
    subscribe,
    readWorkspaceSnapshot,
    getServerSnapshot,
  );
  const { available, projects } = useMemo(
    () => parseWorkspaceSnapshot(serializedWorkspace),
    [serializedWorkspace],
  );
  const [projectName, setProjectName] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  const selectedKeySet = useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const selectedItems = useMemo(
    () =>
      available.filter((item) => selectedKeySet.has(projectEstimateKey(item))),
    [available, selectedKeySet],
  );
  const groupedSources = useMemo(
    () =>
      PROJECT_HISTORY_SOURCES.map((source) => ({
        source,
        items: available.filter((item) => item.calculator === source.id),
      })).filter((group) => group.items.length > 0),
    [available],
  );

  function toggleEstimate(key: string) {
    setSelectedKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
    setNotice("");
  }

  function selectAll() {
    setSelectedKeys(available.map(projectEstimateKey));
    setNotice("");
  }

  function clearSelection() {
    setSelectedKeys([]);
    setNotice("");
  }

  function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const next = addSavedProject(projects, projectName, selectedItems);
      if (!persistProjects(next)) {
        setNotice("This browser could not save the project.");
        return;
      }

      setProjectName("");
      setSelectedKeys([]);
      setNotice("Project saved on this device.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Project could not be saved.");
    }
  }

  async function copyProject(project: SavedProject) {
    try {
      await navigator.clipboard.writeText(formatSavedProject(project));
      setNotice(`Copied ${project.name}.`);
    } catch {
      setNotice("Copy is unavailable in this browser.");
    }
  }

  function deleteProject(project: SavedProject) {
    if (!persistProjects(removeSavedProject(projects, project.id))) {
      setNotice("This browser could not update saved projects.");
      return;
    }
    setNotice(`Deleted ${project.name}.`);
  }

  return (
    <>
      <div className={styles.workspace}>
        <form className={`calculator-panel ${styles.builder}`} onSubmit={createProject}>
          <div className="calculator-panel-head">
            <div>
              <p className="panel-kicker">Project builder</p>
              <h2>Create a project</h2>
            </div>
            <span className="status-pill">Local only</span>
          </div>

          <label className={styles.field}>
            <span>Project name</span>
            <input
              className={styles.textInput}
              type="text"
              maxLength={PROJECT_NAME_MAX_LENGTH}
              value={projectName}
              onChange={(event) => {
                setProjectName(event.target.value);
                setNotice("");
              }}
              placeholder="Back patio, guest room, fence…"
              autoComplete="off"
            />
          </label>
          <p className={styles.helper}>
            Projects are saved in this browser. They are not synchronized to an
            account or sent to BuildMeasure.
          </p>

          <div className={styles.selectionHead}>
            <div>
              <p className="panel-kicker">Available estimates</p>
              <h3>Select what belongs in this project</h3>
            </div>
            {available.length ? (
              <div className={styles.selectionActions}>
                <button type="button" className="text-button" onClick={selectAll}>
                  Select all
                </button>
                {selectedItems.length ? (
                  <button
                    type="button"
                    className="text-button"
                    onClick={clearSelection}
                  >
                    Clear selection
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {groupedSources.length ? (
            <div className={styles.sourceStack}>
              {groupedSources.map(({ source, items }) => (
                <section className={styles.sourceGroup} key={source.id}>
                  <div className={styles.sourceHead}>
                    <div>
                      <h3>{source.label}</h3>
                      <span className={styles.sourceCount}>
                        {items.length} saved estimate{items.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <a className={styles.sourceLink} href={source.href}>
                      Open calculator
                    </a>
                  </div>
                  <ul className={styles.estimateList}>
                    {items.map((item) => {
                      const key = projectEstimateKey(item);
                      return (
                        <li key={key}>
                          <label className={styles.estimateOption}>
                            <input
                              type="checkbox"
                              checked={selectedKeySet.has(key)}
                              onChange={() => toggleEstimate(key)}
                            />
                            <span className={styles.check} aria-hidden="true" />
                            <span className={styles.estimateText}>
                              <strong>{item.label}</strong>
                              <small>{item.summary}</small>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>
              No saved estimates yet. Open a calculator, create an estimate, and
              use <strong>Save estimate</strong>; it will appear here on this device.
            </p>
          )}

          <div className={styles.formActions}>
            <button
              type="submit"
              className="button button-primary"
              disabled={!projectName.trim() || selectedItems.length === 0}
            >
              Save project
            </button>
            <span className={styles.sourceCount}>
              {selectedItems.length} selected
            </span>
          </div>
          <p className="calculator-notice" role="status">
            {notice}
          </p>
        </form>

        <aside className={`result-panel ${styles.draft}`} aria-live="polite">
          <div className="result-panel-head">
            <div>
              <p className="panel-kicker">Current project</p>
              <h2>{projectName.trim() || "Untitled project"}</h2>
            </div>
          </div>
          <div className={styles.draftCount}>
            <strong>{selectedItems.length}</strong>
            <span>saved estimate{selectedItems.length === 1 ? "" : "s"} selected</span>
          </div>
          {selectedItems.length ? (
            <ul className={styles.draftList}>
              {selectedItems.map((item) => {
                const source = getProjectHistorySource(item.calculator);
                return (
                  <li key={projectEstimateKey(item)}>
                    <strong>{source?.label ?? item.calculator}</strong>
                    <span>{item.label}</span>
                    <span>{item.summary}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.empty}>
              Choose one or more saved estimates to build a cross-calculator
              material list.
            </p>
          )}
        </aside>
      </div>

      <section className={`history-panel no-print ${styles.saved}`} aria-labelledby="saved-projects-title">
        <div className="history-head">
          <div>
            <p className="panel-kicker">This device</p>
            <h2 id="saved-projects-title">Saved projects</h2>
          </div>
          <span className="status-pill">Up to 10</span>
        </div>

        {projects.length ? (
          <div className={styles.savedGrid}>
            {projects.map((project) => (
              <article className={styles.projectCard} key={project.id}>
                <div className={styles.projectHead}>
                  <div>
                    <h3>{project.name}</h3>
                    <p className={styles.projectMeta}>
                      {formatProjectDate(project.createdAt)} · {project.items.length} estimate
                      {project.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <ul className={styles.projectItems}>
                  {project.items.map((item) => {
                    const source = getProjectHistorySource(item.calculator);
                    return (
                      <li key={projectEstimateKey(item)}>
                        <strong>{source?.label ?? item.calculator}</strong>
                        <span>{item.label}</span>
                        <span>{item.summary}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className="button button-outline button-small"
                    onClick={() => copyProject(project)}
                  >
                    Copy project list
                  </button>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => deleteProject(project)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="history-empty">
            No saved projects yet. Create one above from estimates already saved
            in your calculators.
          </p>
        )}
      </section>
    </>
  );
}
