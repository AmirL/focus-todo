-- Add user_id columns as nullable first
ALTER TABLE `goals` ADD `user_id` varchar(36);--> statement-breakpoint
ALTER TABLE `tasks` ADD `user_id` varchar(36);--> statement-breakpoint

-- Update existing records to assign them to the user
UPDATE `goals` SET `user_id` = 'GTFET9xe8j0CVG9bQYaqhtiL3eSCHm0o' WHERE `user_id` IS NULL;--> statement-breakpoint
UPDATE `tasks` SET `user_id` = 'GTFET9xe8j0CVG9bQYaqhtiL3eSCHm0o' WHERE `user_id` IS NULL;--> statement-breakpoint

-- Make the columns NOT NULL
ALTER TABLE `goals` MODIFY `user_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` MODIFY `user_id` varchar(36) NOT NULL;--> statement-breakpoint

-- Add foreign key constraints
ALTER TABLE `goals` ADD CONSTRAINT `goals_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;