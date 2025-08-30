CREATE TABLE `api_keys` (
  `id` int AUTO_INCREMENT NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `name` varchar(100),
  `hashed_key` varchar(128) NOT NULL,
  `prefix` varchar(16) NOT NULL,
  `last_four` varchar(4) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `last_used_at` datetime,
  `revoked_at` datetime,
  CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
  CONSTRAINT `api_keys_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_keys_hashed_key_unique` ON `api_keys` (`hashed_key`);
--> statement-breakpoint
CREATE INDEX `api_keys_user_id_idx` ON `api_keys` (`user_id`);

