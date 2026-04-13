-- ============================================================
-- ALPHENEX — MASTER TABLE DEFINITIONS (VERSION 2.0)
-- ============================================================
-- This file contains the finalized relational schema for:
-- 1. Alphenex_Chat_Leads (Centralized Inquiry Management)
-- 2. Alphenex_email_otp (Verification System)
-- 3. Alphenex_Services (Dynamic Service Offerings)
-- 4. Alphenex_LeadStatus (Relational Status Management)
-- 5. Alphenex_Error_Logs (System Health Monitoring)
-- 6. Alphenex_chat_messages (Raga Chat History)
-- ============================================================

-- 1. ALPHENEX LEAD STATUS (Status Catalog)
CREATE TABLE IF NOT EXISTS `Alphenex_LeadStatus` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `Lead_status` VARCHAR(50) NOT NULL,
  `bg_color_code` VARCHAR(20) DEFAULT NULL,
  `colour_code` VARCHAR(20) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT NULL,
  `isdeleted` TINYINT(1) DEFAULT 0,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- NEW COLUMN
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Initial Status Data (Matches image requirements)
INSERT INTO `Alphenex_LeadStatus` (`id`, `Lead_status`) VALUES 
(1, 'New'), 
(2, 'Contacted'), 
(3, 'Qualified'), 
(4, 'Converted'), 
(5, 'Lost')
ON DUPLICATE KEY UPDATE Lead_status=VALUES(Lead_status);


-- 2. ALPHENEX SERVICES (Service Config)
CREATE TABLE IF NOT EXISTS `Alphenex_Services` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `service_name` VARCHAR(255) NOT NULL,
  `bg_colour_code` VARCHAR(20) DEFAULT 'rgba(77,200,240,0.1)',
  `Colour_code` VARCHAR(20) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `isdeleted` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial Services Data
INSERT INTO `Alphenex_Services` (`service_name`) VALUES 
('AI Automation & SaaS'),
('Google Ads Management'),
('Meta Ads (FB & IG)'),
('10X Sales Funnels'),
('Global Lead Generation'),
('Analytics & Reporting'),
('Looking For other Services')
ON DUPLICATE KEY UPDATE service_name=VALUES(service_name);


-- 3. ALPHENEX CHAT LEADS (Main Lead Records)
CREATE TABLE IF NOT EXISTS `Alphenex_Chat_Leads` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `session_id` INT(11) DEFAULT NULL,
  `Session_token` VARCHAR(64) NOT NULL,
  `child_session_id` VARCHAR(50) DEFAULT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `Company_name` VARCHAR(255) DEFAULT NULL,
  `Service_Interest_id` INT(11) DEFAULT NULL,
  `inquiry` TEXT NOT NULL,
  `source` VARCHAR(50) DEFAULT 'unspecified',
  `Inquiry_Lead_status_id` INT(11) NOT NULL DEFAULT 1 COMMENT 'Link to Alphenex_LeadStatus',
  `isdeleted` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_session_token` (`Session_token`),
  KEY `idx_email` (`email`),
  KEY `idx_service_id` (`Service_Interest_id`),
  KEY `idx_status_id` (`Inquiry_Lead_status_id`),
  CONSTRAINT `fk_lead_service_id` FOREIGN KEY (`Service_Interest_id`) REFERENCES `Alphenex_Services` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_lead_status_id` FOREIGN KEY (`Inquiry_Lead_status_id`) REFERENCES `Alphenex_LeadStatus` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 4. ALPHENEX EMAIL OTP (Verification Records)
CREATE TABLE IF NOT EXISTS `Alphenex_email_otp` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `lead_id` INT(11) DEFAULT NULL,
  `email` VARCHAR(255) NOT NULL,
  `otp_code` VARCHAR(10) NOT NULL,
  `session_token` VARCHAR(64) NOT NULL,
  `source` VARCHAR(100) NOT NULL DEFAULT 'unknown',
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `attempts` INT(11) NOT NULL DEFAULT 0,
  `expires_at` DATETIME NOT NULL,
  `verified_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_stoken` (`session_token`),
  CONSTRAINT `fk_otp_lead_id` FOREIGN KEY (`lead_id`) REFERENCES `Alphenex_Chat_Leads` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 5. ALPHENEX ERROR LOGS (System Health)
CREATE TABLE IF NOT EXISTS `Alphenex_Error_Logs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `error_source` ENUM('frontend', 'backend', 'api_call') NOT NULL,
  `unique_error_id` VARCHAR(50) DEFAULT NULL,
  `error_page_name` VARCHAR(100) DEFAULT NULL,
  `endpoint` VARCHAR(500) DEFAULT NULL,
  `http_status` INT(11) DEFAULT NULL,
  `error_message` TEXT NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(500) DEFAULT NULL,
  `request_data` LONGTEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_unique_id` (`unique_error_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 6. ALPHENEX CHAT MESSAGES (Raga Context)
CREATE TABLE IF NOT EXISTS `Alphenex_chat_messages` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `session_id` INT(11) NOT NULL,
  `session_token` VARCHAR(64) NOT NULL,
  `role` ENUM('user', 'assistant') NOT NULL,
  `message` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_stoken` (`session_token`),
  CONSTRAINT `fk_msg_lead_session` FOREIGN KEY (`session_token`) REFERENCES `Alphenex_Chat_Leads` (`Session_token`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
