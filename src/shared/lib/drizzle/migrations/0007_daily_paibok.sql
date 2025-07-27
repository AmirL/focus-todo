-- Add foreign key columns
ALTER TABLE `goals` ADD `list_id` int;--> statement-breakpoint
ALTER TABLE `tasks` ADD `list_id` int;--> statement-breakpoint

-- Insert default lists for users who don't have any lists yet
INSERT INTO `lists` (`name`, `user_id`, `is_default`, `created_at`) 
SELECT 'Work', u.`id`, true, CURRENT_TIMESTAMP 
FROM `user` u 
LEFT JOIN `lists` l ON u.`id` = l.`user_id` 
WHERE l.`user_id` IS NULL;--> statement-breakpoint

INSERT INTO `lists` (`name`, `user_id`, `is_default`, `created_at`) 
SELECT 'Personal', u.`id`, true, CURRENT_TIMESTAMP 
FROM `user` u 
LEFT JOIN `lists` l ON u.`id` = l.`user_id` 
WHERE l.`user_id` IS NULL;--> statement-breakpoint

-- Update existing tasks to reference the correct list IDs
UPDATE `tasks` t 
SET `list_id` = (
  SELECT l.`id` FROM `lists` l 
  WHERE l.`user_id` = t.`user_id` AND l.`name` = t.`list`
) 
WHERE t.`list_id` IS NULL;--> statement-breakpoint

-- Update existing goals to reference the correct list IDs  
UPDATE `goals` g 
SET `list_id` = (
  SELECT l.`id` FROM `lists` l 
  WHERE l.`user_id` = g.`user_id` AND l.`name` = g.`list`
)
WHERE g.`list_id` IS NULL;--> statement-breakpoint

-- Add foreign key constraints
ALTER TABLE `goals` ADD CONSTRAINT `goals_list_id_lists_id_fk` FOREIGN KEY (`list_id`) REFERENCES `lists`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_list_id_lists_id_fk` FOREIGN KEY (`list_id`) REFERENCES `lists`(`id`) ON DELETE restrict ON UPDATE no action;