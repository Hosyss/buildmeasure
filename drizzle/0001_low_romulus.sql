CREATE TABLE `analytics_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event` text NOT NULL,
	`calculator` text DEFAULT '' NOT NULL,
	`route` text NOT NULL,
	`session_token` text NOT NULL,
	`source` text DEFAULT 'direct' NOT NULL,
	`medium` text DEFAULT '' NOT NULL,
	`campaign` text DEFAULT '' NOT NULL,
	`referrer_host` text DEFAULT '' NOT NULL,
	`browser` text NOT NULL,
	`device` text NOT NULL,
	`locale` text DEFAULT '' NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `analytics_events_created_at_idx` ON `analytics_events` (`created_at`);--> statement-breakpoint
CREATE INDEX `analytics_events_event_idx` ON `analytics_events` (`event`);--> statement-breakpoint
CREATE INDEX `analytics_events_session_token_idx` ON `analytics_events` (`session_token`);