import type { AnalyticsSubmission } from "@/lib/analytics";

type AnalyticsTotalsRow = {
  engagedSessions: number;
  openings: number;
  interactions: number;
  completed: number;
  failed: number;
  feedback: number;
  errors: number;
};

export type CalculatorAnalyticsRow = {
  calculator: string;
  engagedSessions: number;
  completed: number;
  failed: number;
};

export type SourceAnalyticsRow = {
  source: string;
  engagedSessions: number;
};

export type PageAnalyticsRow = {
  route: string;
  engagedSessions: number;
};

export type ErrorAnalyticsRow = {
  route: string;
  browser: string;
  device: string;
  detail: string;
  createdAt: string;
};

export type AnalyticsDashboard = {
  totals: AnalyticsTotalsRow;
  calculators: CalculatorAnalyticsRow[];
  sources: SourceAnalyticsRow[];
  pages: PageAnalyticsRow[];
  recentErrors: ErrorAnalyticsRow[];
  days: number;
};

let schemaReady: Promise<void> | null = null;

async function getCloudflareEnvironment() {
  const { env } = await import("cloudflare:workers");
  return env;
}

async function getAnalyticsDatabase() {
  const environment = await getCloudflareEnvironment();
  if (!environment.DB) {
    throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  }
  return environment.DB;
}

export function ensureAnalyticsStorage() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const database = await getAnalyticsDatabase();
      await database.batch([
        database.prepare(`
          CREATE TABLE IF NOT EXISTS analytics_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event TEXT NOT NULL,
            calculator TEXT NOT NULL DEFAULT '',
            route TEXT NOT NULL,
            session_token TEXT NOT NULL,
            source TEXT NOT NULL DEFAULT 'direct',
            medium TEXT NOT NULL DEFAULT '',
            campaign TEXT NOT NULL DEFAULT '',
            referrer_host TEXT NOT NULL DEFAULT '',
            browser TEXT NOT NULL,
            device TEXT NOT NULL,
            locale TEXT NOT NULL DEFAULT '',
            detail TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `),
        database.prepare(
          "CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON analytics_events (created_at)",
        ),
        database.prepare(
          "CREATE INDEX IF NOT EXISTS analytics_events_event_idx ON analytics_events (event)",
        ),
        database.prepare(
          "CREATE INDEX IF NOT EXISTS analytics_events_session_token_idx ON analytics_events (session_token)",
        ),
        database.prepare(
          "DELETE FROM analytics_events WHERE created_at < datetime('now', '-90 days')",
        ),
      ]);
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }

  return schemaReady;
}

export async function countRecentAnalyticsEvents(sessionToken: string) {
  await ensureAnalyticsStorage();
  const database = await getAnalyticsDatabase();
  const row = await database
    .prepare(
      `SELECT COUNT(*) AS total
       FROM analytics_events
       WHERE session_token = ?
         AND created_at >= datetime('now', '-1 hour')`,
    )
    .bind(sessionToken)
    .first<{ total: number }>();

  return Number(row?.total ?? 0);
}

export async function insertAnalyticsEvent(event: AnalyticsSubmission) {
  await ensureAnalyticsStorage();
  const database = await getAnalyticsDatabase();
  await database
    .prepare(
      `INSERT INTO analytics_events (
        event,
        calculator,
        route,
        session_token,
        source,
        medium,
        campaign,
        referrer_host,
        browser,
        device,
        locale,
        detail
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      event.event,
      event.calculator,
      event.route,
      event.sessionToken,
      event.source,
      event.medium,
      event.campaign,
      event.referrerHost,
      event.browser,
      event.device,
      event.locale,
      event.detail,
    )
    .run();
}

export async function getAnalyticsDashboard(days = 30): Promise<AnalyticsDashboard> {
  await ensureAnalyticsStorage();
  const safeDays = Math.min(Math.max(Math.trunc(days), 1), 90);
  const interval = `-${safeDays} days`;
  const database = await getAnalyticsDatabase();

  const [totals, calculators, sources, pages, recentErrors] = await Promise.all([
    database
      .prepare(
        `SELECT
          COUNT(DISTINCT CASE WHEN event IN ('page_engaged', 'calculator_interacted') THEN session_token END) AS engagedSessions,
          SUM(CASE WHEN event = 'calculator_opened' THEN 1 ELSE 0 END) AS openings,
          SUM(CASE WHEN event = 'calculator_interacted' THEN 1 ELSE 0 END) AS interactions,
          SUM(CASE WHEN event = 'calculation_completed' THEN 1 ELSE 0 END) AS completed,
          SUM(CASE WHEN event = 'calculation_failed' THEN 1 ELSE 0 END) AS failed,
          SUM(CASE WHEN event = 'feedback_submitted' THEN 1 ELSE 0 END) AS feedback,
          SUM(CASE WHEN event = 'client_error' THEN 1 ELSE 0 END) AS errors
         FROM analytics_events
         WHERE created_at >= datetime('now', ?)`,
      )
      .bind(interval)
      .first<AnalyticsTotalsRow>(),
    database
      .prepare(
        `SELECT
          calculator,
          COUNT(DISTINCT CASE WHEN event = 'calculator_interacted' THEN session_token END) AS engagedSessions,
          SUM(CASE WHEN event = 'calculation_completed' THEN 1 ELSE 0 END) AS completed,
          SUM(CASE WHEN event = 'calculation_failed' THEN 1 ELSE 0 END) AS failed
         FROM analytics_events
         WHERE created_at >= datetime('now', ?)
           AND calculator <> ''
         GROUP BY calculator
         ORDER BY engagedSessions DESC, completed DESC, calculator ASC`,
      )
      .bind(interval)
      .all<CalculatorAnalyticsRow>(),
    database
      .prepare(
        `SELECT
          source,
          COUNT(DISTINCT session_token) AS engagedSessions
         FROM analytics_events
         WHERE created_at >= datetime('now', ?)
           AND event IN ('page_engaged', 'calculator_interacted')
         GROUP BY source
         ORDER BY engagedSessions DESC, source ASC
         LIMIT 20`,
      )
      .bind(interval)
      .all<SourceAnalyticsRow>(),
    database
      .prepare(
        `SELECT
          route,
          COUNT(DISTINCT session_token) AS engagedSessions
         FROM analytics_events
         WHERE created_at >= datetime('now', ?)
           AND event = 'page_engaged'
         GROUP BY route
         ORDER BY engagedSessions DESC, route ASC
         LIMIT 20`,
      )
      .bind(interval)
      .all<PageAnalyticsRow>(),
    database
      .prepare(
        `SELECT
          route,
          browser,
          device,
          detail,
          created_at AS createdAt
         FROM analytics_events
         WHERE created_at >= datetime('now', ?)
           AND event = 'client_error'
         ORDER BY id DESC
         LIMIT 50`,
      )
      .bind(interval)
      .all<ErrorAnalyticsRow>(),
  ]);

  return {
    totals: {
      engagedSessions: Number(totals?.engagedSessions ?? 0),
      openings: Number(totals?.openings ?? 0),
      interactions: Number(totals?.interactions ?? 0),
      completed: Number(totals?.completed ?? 0),
      failed: Number(totals?.failed ?? 0),
      feedback: Number(totals?.feedback ?? 0),
      errors: Number(totals?.errors ?? 0),
    },
    calculators: calculators.results.map((row) => ({
      ...row,
      engagedSessions: Number(row.engagedSessions ?? 0),
      completed: Number(row.completed ?? 0),
      failed: Number(row.failed ?? 0),
    })),
    sources: sources.results.map((row) => ({
      ...row,
      engagedSessions: Number(row.engagedSessions ?? 0),
    })),
    pages: pages.results.map((row) => ({
      ...row,
      engagedSessions: Number(row.engagedSessions ?? 0),
    })),
    recentErrors: recentErrors.results,
    days: safeDays,
  };
}
