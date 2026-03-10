CREATE TABLE `time_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`task_id` int NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`started_at` datetime NOT NULL,
	`ended_at` datetime,
	`duration_minutes` int,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `time_entries_id` PRIMARY KEY(`id`),
	CONSTRAINT `time_entries_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `time_entries_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action
);
