CREATE TABLE `feedback_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`calculator` text NOT NULL,
	`category` text NOT NULL,
	`calculation_inputs` text DEFAULT '' NOT NULL,
	`actual_result` text DEFAULT '' NOT NULL,
	`expected_result` text DEFAULT '' NOT NULL,
	`details` text NOT NULL,
	`client_token` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `feedback_reports_created_at_idx` ON `feedback_reports` (`created_at`);--> statement-breakpoint
CREATE INDEX `feedback_reports_client_token_idx` ON `feedback_reports` (`client_token`);