CREATE TABLE `Managers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`email` varchar(255),
	`password` varchar(255),
	`parent_id` int,
	`contact_number_1` varchar(255),
	`contact_number_2` varchar(255),
	`address_1` varchar(255),
	`address_2` varchar(255),
	`country_id` int,
	`state` varchar(255),
	`city` varchar(255),
	`postal_code` varchar(255),
	`sip_agent_id` varchar(255),
	`status` int,
	`role_id` int,
	`mlm_role_id` int,
	`created_by` int,
	`email_verified_at` datetime,
	`remember_token` varchar(255),
	`percent_setting` varchar(255),
	`agent_type` int,
	`commission_shares_percent` int,
	`created_at` timestamp,
	`updated_at` timestamp,
	`deleted_at` timestamp,
	CONSTRAINT `Managers_id` PRIMARY KEY(`id`),
	CONSTRAINT `UNIQUE_MANAGERS_ID` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `Paymentmethodconfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`logo` varchar(255),
	`name` varchar(255),
	`label` varchar(255),
	`link` varchar(255),
	`config` varchar(255),
	`status` int,
	`created_at` timestamp,
	`updated_at` timestamp,
	`deleted_at` timestamp,
	CONSTRAINT `Paymentmethodconfig_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Paymentmethod` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`manager_id` int,
	`type` varchar(255),
	`info` varchar(255),
	`balance` int,
	`created_at` timestamp,
	`updated_at` timestamp,
	`deleted_at` timestamp,
	CONSTRAINT `Paymentmethod_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `radio_draws` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`session_id` int NOT NULL,
	`show_id` int NOT NULL,
	`draw_number` int NOT NULL,
	`scheduled_at` datetime NOT NULL,
	`conducted_at` datetime,
	`winning_ticket_id` int,
	`status` enum('pending','active','completed','cancelled') NOT NULL DEFAULT 'pending',
	`max_entries` int,
	`entry_deadline` datetime,
	`prizes` json,
	`draw_settings` json,
	`winner_details` json,
	`total_entries` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `radio_draws_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `radio_jackpot_draws` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`station_id` int,
	`show_id` int,
	`draw_period` enum('daily','weekly','biweekly','monthly','quarterly','custom') NOT NULL,
	`period_start` datetime NOT NULL,
	`period_end` datetime NOT NULL,
	`scheduled_at` datetime NOT NULL,
	`conducted_at` datetime,
	`winning_ticket_id` int,
	`status` enum('pending','active','completed','cancelled') NOT NULL DEFAULT 'pending',
	`prize_amount` decimal(10,2) NOT NULL,
	`jackpot_settings` json DEFAULT ('{}'),
	`winner_details` json,
	`previous_winners` json DEFAULT ('[]'),
	`total_tickets` int NOT NULL DEFAULT 0,
	`total_entries` int NOT NULL DEFAULT 0,
	`eligible_users` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `radio_jackpot_draws_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `radio_show_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`show_id` int NOT NULL,
	`user_id` int NOT NULL,
	`start_time` datetime NOT NULL,
	`end_time` datetime,
	`status` enum('active','ended','paused') NOT NULL DEFAULT 'active',
	`session_date` date NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `radio_show_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `radio_shows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`days` varchar(500) NOT NULL,
	`air_time` time NOT NULL,
	`station_id` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `radio_shows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `radio_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticket_uuid` varchar(36) NOT NULL,
	`user_id` int NOT NULL,
	`station_id` int NOT NULL,
	`draw_id` int,
	`quantity` int NOT NULL DEFAULT 1,
	`used_count` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`expires_at` datetime,
	`invalidated_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `radio_tickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `radio_tickets_ticket_uuid_unique` UNIQUE(`ticket_uuid`)
);
--> statement-breakpoint
CREATE TABLE `Transaction` (
	`id` int AUTO_INCREMENT NOT NULL,
	`id_user` int,
	`id_manager` int,
	`id_payment_method` int,
	`amount` int,
	`status` varchar(255),
	`type` varchar(255),
	`bonus_type` varchar(255),
	`payment_ref` varchar(255),
	`id_payment_method_config` int,
	`description` varchar(255),
	`id_objector` int,
	`id_objector_payment_method` int,
	`id_ref` int,
	`date` datetime NOT NULL DEFAULT '2025-07-08 14:23:46.710',
	`id_order` int,
	`order_no` varchar(255),
	`log_id` varchar(255),
	`id_withdrawal` int,
	`id_group` int,
	`id_draw` int,
	`id_playwin` int,
	`id_voucher_user` int,
	`id_agent` int,
	`id_terminal` int,
	`reason` varchar(255),
	`mlm_level` int,
	`id_super` int,
	`id_sales` int,
	`created_at` timestamp,
	`updated_at` timestamp,
	`deleted_at` timestamp,
	CONSTRAINT `Transaction_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_stations` (
	`user_id` int NOT NULL,
	`station_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now())
);
--> statement-breakpoint
ALTER TABLE `radio_jackpot_draws` ADD CONSTRAINT `radio_jackpot_draws_station_id_radio_stations_id_fk` FOREIGN KEY (`station_id`) REFERENCES `radio_stations`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `radio_jackpot_draws` ADD CONSTRAINT `radio_jackpot_draws_winning_ticket_id_radio_tickets_id_fk` FOREIGN KEY (`winning_ticket_id`) REFERENCES `radio_tickets`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `user_stations` ADD CONSTRAINT `user_stations_user_id_User_id_fk` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `user_stations` ADD CONSTRAINT `user_stations_station_id_radio_stations_id_fk` FOREIGN KEY (`station_id`) REFERENCES `radio_stations`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `idx_station_id` ON `radio_jackpot_draws` (`station_id`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `radio_jackpot_draws` (`status`);--> statement-breakpoint
CREATE INDEX `idx_draw_period` ON `radio_jackpot_draws` (`draw_period`);--> statement-breakpoint
CREATE INDEX `idx_scheduled_at` ON `radio_jackpot_draws` (`scheduled_at`);--> statement-breakpoint
CREATE INDEX `idx_period_range` ON `radio_jackpot_draws` (`period_start`,`period_end`);--> statement-breakpoint
CREATE INDEX `idx_winning_ticket_id` ON `radio_jackpot_draws` (`winning_ticket_id`);--> statement-breakpoint
CREATE INDEX `idx_ticket_uuid` ON `radio_tickets` (`ticket_uuid`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `radio_tickets` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_station_id` ON `radio_tickets` (`station_id`);--> statement-breakpoint
CREATE INDEX `idx_draw_id` ON `radio_tickets` (`draw_id`);--> statement-breakpoint
CREATE INDEX `idx_is_active` ON `radio_tickets` (`is_active`);