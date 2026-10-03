ALTER TABLE `user_profiles` ADD `onboarding_completed` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `onboarding_version` integer DEFAULT 1 NOT NULL;