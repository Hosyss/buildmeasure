import type { FeedbackSubmission } from "@/lib/feedback";

export type FeedbackReportRecord = FeedbackSubmission & {
  id: number;
  status: string;
  createdAt: string;
};

let schemaReady: Promise<void> | null = null;

async function getCloudflareEnvironment() {
  const { env } = await import("cloudflare:workers");
  return env;
}

async function getFeedbackDatabase() {
  const env = await getCloudflareEnvironment();
  if (!env.DB) {
    throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  }
  return env.DB;
}

export function ensureFeedbackStorage() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const database = await getFeedbackDatabase();
      await database.batch([
        database.prepare(`
          CREATE TABLE IF NOT EXISTS feedback_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            calculator TEXT NOT NULL,
            category TEXT NOT NULL,
            calculation_inputs TEXT NOT NULL DEFAULT '',
            actual_result TEXT NOT NULL DEFAULT '',
            expected_result TEXT NOT NULL DEFAULT '',
            details TEXT NOT NULL,
            client_token TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'new',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `),
        database.prepare(
          "CREATE INDEX IF NOT EXISTS feedback_reports_created_at_idx ON feedback_reports (created_at)",
        ),
        database.prepare(
          "CREATE INDEX IF NOT EXISTS feedback_reports_client_token_idx ON feedback_reports (client_token)",
        ),
        database.prepare(
          "DELETE FROM feedback_reports WHERE created_at < datetime('now', '-24 months')",
        ),
      ]);
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }

  return schemaReady;
}

export async function countRecentFeedback(clientToken: string) {
  await ensureFeedbackStorage();
  const database = await getFeedbackDatabase();
  const row = await database
    .prepare(
      `SELECT COUNT(*) AS total
       FROM feedback_reports
       WHERE client_token = ?
         AND created_at >= datetime('now', '-1 hour')`,
    )
    .bind(clientToken)
    .first<{ total: number }>();

  return Number(row?.total ?? 0);
}

export async function insertFeedback(submission: FeedbackSubmission) {
  await ensureFeedbackStorage();
  const database = await getFeedbackDatabase();
  const result = await database
    .prepare(
      `INSERT INTO feedback_reports (
        calculator,
        category,
        calculation_inputs,
        actual_result,
        expected_result,
        details,
        client_token
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      submission.calculator,
      submission.category,
      submission.calculationInputs,
      submission.actualResult,
      submission.expectedResult,
      submission.details,
      submission.clientToken,
    )
    .run();

  const id = Number(result.meta.last_row_id);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new Error("Feedback report was saved without a valid identifier.");
  }
  return id;
}

export async function listFeedbackReports(limit = 100) {
  await ensureFeedbackStorage();
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const database = await getFeedbackDatabase();
  const result = await database
    .prepare(
      `SELECT
        id,
        calculator,
        category,
        calculation_inputs AS calculationInputs,
        actual_result AS actualResult,
        expected_result AS expectedResult,
        details,
        client_token AS clientToken,
        status,
        created_at AS createdAt
       FROM feedback_reports
       ORDER BY id DESC
       LIMIT ?`,
    )
    .bind(safeLimit)
    .all<FeedbackReportRecord>();

  return result.results;
}

export async function feedbackAdminEmail() {
  const environment = await getCloudflareEnvironment();
  const value = (environment as unknown as { FEEDBACK_ADMIN_EMAIL?: string })
    .FEEDBACK_ADMIN_EMAIL;
  return value?.trim().toLowerCase() || null;
}
