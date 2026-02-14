CREATE TABLE `goal_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`goal_id` int NOT NULL,
	`progress` tinyint NOT NULL,
	`description` varchar(500) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `goal_milestones_id` PRIMARY KEY(`id`),
	CONSTRAINT `goal_milestones_goal_id_goals_id_fk` FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON DELETE cascade ON UPDATE no action
);
