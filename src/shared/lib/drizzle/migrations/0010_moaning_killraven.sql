CREATE TABLE `current_initiatives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`date` date NOT NULL,
	`suggested_list_id` int,
	`chosen_list_id` int,
	`reason` varchar(500),
	`set_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`changed_at` datetime,
	CONSTRAINT `current_initiatives_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `lists` ADD `participates_in_initiative` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `current_initiatives` ADD CONSTRAINT `current_initiatives_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `current_initiatives` ADD CONSTRAINT `current_initiatives_suggested_list_id_lists_id_fk` FOREIGN KEY (`suggested_list_id`) REFERENCES `lists`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `current_initiatives` ADD CONSTRAINT `current_initiatives_chosen_list_id_lists_id_fk` FOREIGN KEY (`chosen_list_id`) REFERENCES `lists`(`id`) ON DELETE set null ON UPDATE no action;