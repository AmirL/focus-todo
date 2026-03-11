ALTER TABLE `lists` ADD `color` varchar(50);--> statement-breakpoint
UPDATE `lists` SET `color` = 'blue' WHERE `name` = 'Work' AND `color` IS NULL;--> statement-breakpoint
UPDATE `lists` SET `color` = 'violet' WHERE `name` = 'Personal' AND `color` IS NULL;
