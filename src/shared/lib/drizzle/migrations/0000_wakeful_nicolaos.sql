-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255),
	`progress` tinyint DEFAULT 0,
	`list` varchar(255),
	`deleted_at` date,
	CONSTRAINT `goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(300),
	`details` text,
	`date` date,
	`completed_at` date,
	`list` varchar(255),
	`uid` int,
	`deleted_at` date,
	`selected_at` date,
	`updated_at` datetime DEFAULT (CURRENT_TIMESTAMP),
	`is_blocker` tinyint(1) NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);

*/