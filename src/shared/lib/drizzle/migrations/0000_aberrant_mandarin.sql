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
	`name` varchar(300) NOT NULL,
	`details` text,
	`date` date,
	`completed_at` datetime,
	`list` varchar(255) NOT NULL,
	`is_blocker` boolean DEFAULT false,
	`selected_at` date,
	`uid` int,
	`deleted_at` datetime,
	`updated_at` datetime,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
