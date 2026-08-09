import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const feedbackReports = sqliteTable(
  "feedback_reports",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    calculator: text("calculator").notNull(),
    category: text("category").notNull(),
    calculationInputs: text("calculation_inputs").notNull().default(""),
    actualResult: text("actual_result").notNull().default(""),
    expectedResult: text("expected_result").notNull().default(""),
    details: text("details").notNull(),
    clientToken: text("client_token").notNull(),
    status: text("status").notNull().default("new"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("feedback_reports_created_at_idx").on(table.createdAt),
    index("feedback_reports_client_token_idx").on(table.clientToken),
  ],
);

export const analyticsEvents = sqliteTable(
  "analytics_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    event: text("event").notNull(),
    calculator: text("calculator").notNull().default(""),
    route: text("route").notNull(),
    sessionToken: text("session_token").notNull(),
    source: text("source").notNull().default("direct"),
    medium: text("medium").notNull().default(""),
    campaign: text("campaign").notNull().default(""),
    referrerHost: text("referrer_host").notNull().default(""),
    browser: text("browser").notNull(),
    device: text("device").notNull(),
    locale: text("locale").notNull().default(""),
    detail: text("detail").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("analytics_events_created_at_idx").on(table.createdAt),
    index("analytics_events_event_idx").on(table.event),
    index("analytics_events_session_token_idx").on(table.sessionToken),
  ],
);
