-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Aug 01, 2026 at 11:12 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `turf_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `slot_id` varchar(50) DEFAULT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `customer_name` varchar(100) NOT NULL,
  `mobile_number` varchar(20) NOT NULL,
  `amount` int(11) NOT NULL,
  `duration` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('PENDING','CONFIRMED','CANCELLED') DEFAULT 'CONFIRMED',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` varchar(50) NOT NULL,
  `branch_name` varchar(150) NOT NULL,
  `branch_code` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `owner_id` varchar(50) DEFAULT NULL,
  `subscription_plan_id` varchar(50) DEFAULT 'plan_starter',
  `country` varchar(100) DEFAULT 'India',
  `state` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `zip_code` varchar(20) DEFAULT NULL,
  `full_address` text DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `alternate_mobile` varchar(20) DEFAULT NULL,
  `gst_number` varchar(50) DEFAULT NULL,
  `timezone` varchar(50) DEFAULT 'Asia/Kolkata',
  `currency` varchar(10) DEFAULT 'INR',
  `logo` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','SUSPENDED') DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`id`, `branch_name`, `branch_code`, `description`, `owner_id`, `subscription_plan_id`, `country`, `state`, `city`, `zip_code`, `full_address`, `email`, `mobile`, `alternate_mobile`, `gst_number`, `timezone`, `currency`, `logo`, `status`, `created_at`) VALUES
('br_001', 'Green Arena Football Turf', 'GA-MUM-01', 'Premium FIFA certified artificial turf with floodlights.', 'own_001', 'plan_pro', 'India', NULL, 'Mumbai', '400053', 'Andheri West, Mumbai', 'andheri@greenarena.com', '+91 98200 11111', NULL, NULL, 'Asia/Kolkata', 'INR', NULL, 'ACTIVE', '2026-07-31 17:08:17'),
('br_004', 'ProPlay Arena Vashi', 'PPA-NAV-01', 'Covered rooftop multi-sport turf complex.', 'own_001', 'plan_pro', 'India', NULL, 'Navi Mumbai', '400703', 'Sector 17, Vashi', 'vashi@proplay.com', '+91 98200 55555', NULL, NULL, 'Asia/Kolkata', 'INR', NULL, 'ACTIVE', '2026-07-31 17:08:17');

-- --------------------------------------------------------

--
-- Table structure for table `branch_sports`
--

CREATE TABLE `branch_sports` (
  `id` varchar(50) NOT NULL,
  `branch_id` varchar(50) DEFAULT NULL,
  `sport_id` varchar(50) DEFAULT NULL,
  `regular_price` int(11) DEFAULT 0,
  `peak_price` int(11) DEFAULT 0,
  `total_courts` int(11) DEFAULT 1,
  `opening_time` time DEFAULT '06:00:00',
  `closing_time` time DEFAULT '22:00:00',
  `slot_duration` int(11) DEFAULT 60,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `branch_sports`
--

INSERT INTO `branch_sports` (`id`, `branch_id`, `sport_id`, `regular_price`, `peak_price`, `total_courts`, `opening_time`, `closing_time`, `slot_duration`, `status`) VALUES
('bs_001', 'br_001', 'sp_master_01', 1200, 1600, 2, '06:00:00', '23:00:00', 60, 'ACTIVE'),
('bs_002', 'br_001', 'sp_master_02', 1000, 1400, 1, '07:00:00', '22:00:00', 60, 'ACTIVE'),
('bs_003', 'br_001', 'sp_master_03', 600, 900, 2, '06:00:00', '22:00:00', 60, 'ACTIVE'),
('bs_004', 'br_001', 'sp_master_04', 1000, 1400, 1, '07:00:00', '21:00:00', 60, 'ACTIVE');

-- --------------------------------------------------------

--
-- Table structure for table `holidays`
--

CREATE TABLE `holidays` (
  `id` varchar(50) NOT NULL,
  `branch_id` varchar(50) DEFAULT NULL,
  `title` varchar(150) DEFAULT NULL,
  `holiday_date` date NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `is_full_day` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `holidays`
--

INSERT INTO `holidays` (`id`, `branch_id`, `title`, `holiday_date`, `reason`, `is_full_day`, `created_at`) VALUES
('hol_001', 'br_001', 'Holi National Holiday', '2026-03-25', 'Public Holiday', 1, '2026-07-31 17:08:17'),
('hol_002', 'br_001', 'Turf Turf Maintenance', '2026-04-10', 'Pitch Relaying', 1, '2026-07-31 17:08:17');

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `id` varchar(50) NOT NULL,
  `branch_id` varchar(50) NOT NULL,
  `item_name` varchar(150) NOT NULL,
  `category` varchar(100) DEFAULT 'Equipment',
  `stock_quantity` int(11) DEFAULT 0,
  `min_stock_alert` int(11) DEFAULT 5,
  `price` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `amount` int(11) NOT NULL,
  `payment_method` enum('UPI','CASH','CARD','WALLET') DEFAULT 'UPI',
  `status` enum('PENDING','COMPLETED','FAILED') DEFAULT 'COMPLETED',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `booking_id`, `invoice_number`, `customer_name`, `amount`, `payment_method`, `status`, `created_at`) VALUES
(1, NULL, 'INV-1001', 'Amit Sharma', 1200, 'UPI', 'COMPLETED', '2026-05-22 05:00:00'),
(2, NULL, 'INV-1002', 'Neha Patel', 420, 'CASH', 'COMPLETED', '2026-05-23 08:45:00'),
(3, NULL, 'INV-1003', 'Karan Singh', 650, 'CARD', 'COMPLETED', '2026-05-24 13:15:00'),
(4, NULL, 'INV-1004', 'Pooja Verma', 980, 'UPI', 'PENDING', '2026-05-25 03:30:00'),
(5, NULL, 'INV-1005', 'Ravi Kumar', 320, 'CASH', 'COMPLETED', '2026-05-26 06:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_entries`
--

CREATE TABLE `purchase_entries` (
  `id` int(11) NOT NULL,
  `inventory_id` varchar(50) NOT NULL,
  `quantity` int(11) NOT NULL,
  `purchase_cost` int(11) NOT NULL,
  `supplier` varchar(150) DEFAULT NULL,
  `purchase_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `slots`
--

CREATE TABLE `slots` (
  `id` varchar(50) NOT NULL,
  `branch_id` varchar(50) DEFAULT NULL,
  `sport_id` varchar(50) DEFAULT NULL,
  `court_name` varchar(100) NOT NULL,
  `slot_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `duration` int(11) NOT NULL,
  `regular_price` int(11) DEFAULT 0,
  `peak_price` int(11) DEFAULT 0,
  `is_peak_hour` tinyint(1) DEFAULT 0,
  `status` enum('AVAILABLE','BOOKED','BLOCKED','COMPLETED') DEFAULT 'AVAILABLE',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `slots`
--

INSERT INTO `slots` (`id`, `branch_id`, `sport_id`, `court_name`, `slot_date`, `start_time`, `end_time`, `duration`, `regular_price`, `peak_price`, `is_peak_hour`, `status`, `notes`, `created_at`, `updated_at`) VALUES
('slot_1785521511225_782', 'br_001', 'sp_master_01', 'Football Court 1', '2026-07-31', '18:00:00', '19:00:00', 60, 800, 1200, 0, 'AVAILABLE', '', '2026-07-31 18:11:51', '2026-07-31 18:11:51');

-- --------------------------------------------------------

--
-- Table structure for table `sports`
--

CREATE TABLE `sports` (
  `id` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `icon` varchar(10) DEFAULT '⚽',
  `category` varchar(50) DEFAULT 'Team Sport',
  `default_slot_duration` int(11) DEFAULT 60
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sports`
--

INSERT INTO `sports` (`id`, `name`, `icon`, `category`, `default_slot_duration`) VALUES
('sp_master_01', 'Football', '⚽', 'Team Sport', 60),
('sp_master_02', 'Cricket', '🏏', 'Team Sport', 60),
('sp_master_03', 'Badminton', '🏸', 'Racquet', 60),
('sp_master_04', 'Basketball', '🏀', 'Team Sport', 60),
('sp_master_05', 'Tennis', '🎾', 'Racquet', 60);

-- --------------------------------------------------------

--
-- Table structure for table `teams`
--

CREATE TABLE `teams` (
  `id` varchar(50) NOT NULL,
  `tournament_id` varchar(50) NOT NULL,
  `team_name` varchar(100) NOT NULL,
  `captain_name` varchar(100) NOT NULL,
  `captain_email` varchar(100) NOT NULL,
  `captain_mobile` varchar(20) NOT NULL,
  `status` enum('PENDING','CONFIRMED','CANCELLED') DEFAULT 'CONFIRMED',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teams`
--

INSERT INTO `teams` (`id`, `tournament_id`, `team_name`, `captain_name`, `captain_email`, `captain_mobile`, `status`, `created_at`) VALUES
('tm_101', 't_001', 'Indore Thunders', 'Rajesh Patel', 'rajesh@gmail.com', '9876543201', 'CONFIRMED', '2026-07-31 17:08:17'),
('tm_102', 't_001', 'Royal Challengers', 'Kunal Shah', 'kunal@gmail.com', '9876543202', 'CONFIRMED', '2026-07-31 17:08:17'),
('tm_103', 't_001', 'Warriors XI', 'Devendra Singh', 'dev@gmail.com', '9876543203', 'CONFIRMED', '2026-07-31 17:08:17'),
('tm_104', 't_001', 'Super Kings', 'Rahul Sharma', 'rahul@gmail.com', '9876543204', 'CONFIRMED', '2026-07-31 17:08:17'),
('tm_201', 't_002', 'Red Devils', 'Sunny Leone', 'sunny@gmail.com', '9876543220', 'CONFIRMED', '2026-07-31 17:08:17'),
('tm_202', 't_002', 'Blue Eagles', 'Varun Dhawan', 'varun@gmail.com', '9876543221', 'CONFIRMED', '2026-07-31 17:08:17');

-- --------------------------------------------------------

--
-- Table structure for table `tournaments`
--

CREATE TABLE `tournaments` (
  `id` varchar(50) NOT NULL,
  `branch_id` varchar(50) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `sport_id` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `registration_fee` int(11) DEFAULT 0,
  `max_teams` int(11) DEFAULT 16,
  `prize_pool` varchar(150) DEFAULT NULL,
  `status` enum('Upcoming','Active','Completed','Cancelled') DEFAULT 'Upcoming',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tournaments`
--

INSERT INTO `tournaments` (`id`, `branch_id`, `title`, `description`, `sport_id`, `start_date`, `end_date`, `registration_fee`, `max_teams`, `prize_pool`, `status`, `created_at`) VALUES
('t_001', 'br_001', 'Premier Cricket Cup', 'Indore annual cricket master tournament.', 'sp_master_02', '2026-03-15', '2026-03-20', 500, 16, '50,000', 'Active', '2026-07-31 17:08:17'),
('t_002', 'br_001', 'Indore Football Cup', '5-a-side football tournament under floodlights.', 'sp_master_01', '2026-03-22', '2026-03-25', 800, 8, '30,000', 'Upcoming', '2026-07-31 17:08:17'),
('t_003', 'br_001', 'Badminton Open Arena', 'Singles master category badminton league.', 'sp_master_03', '2026-02-28', '2026-03-02', 300, 16, '15,000', 'Completed', '2026-07-31 17:08:17');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('SUPER_ADMIN','OWNER','STAFF','CUSTOMER') DEFAULT 'CUSTOMER',
  `mobile` varchar(20) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `mobile`, `avatar`, `status`, `created_at`, `updated_at`) VALUES
('own_001', 'Rajesh Sharma (Turf Owner)', 'owner@gmail.com', '$2b$10$TMrnxEPJzFEnrKa3TQ45humJ8Pp6tkiqVa/NrjtEmAJFjwJduguhO', 'OWNER', '+91 98765 12345', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', 'ACTIVE', '2026-07-31 17:08:17', '2026-07-31 17:08:17'),
('usr_customer_01', 'Rohan Verma', 'customer@gmail.com', '$2b$10$TMrnxEPJzFEnrKa3TQ45huNKItYeKaVOvwnurDv6tyMlHhyI49y0e', 'CUSTOMER', '+91 98765 99999', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200', 'ACTIVE', '2026-07-31 17:08:17', '2026-07-31 17:08:17'),
('usr_staff_01', 'Amit Kumar (Arena Staff)', 'staff@gmail.com', '$2b$10$TMrnxEPJzFEnrKa3TQ45huNKItYeKaVOvwnurDv6tyMlHhyI49y0e', 'STAFF', '+91 98765 67890', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', 'ACTIVE', '2026-07-31 17:08:17', '2026-07-31 17:08:17'),
('usr_superadmin_01', 'Super Administrator', 'superadmin@gmail.com', '$2b$10$TMrnxEPJzFEnrKa3TQ45humJ8Pp6tkiqVa/NrjtEmAJFjwJduguhO', 'SUPER_ADMIN', '+91 98765 43210', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', 'ACTIVE', '2026-07-31 17:08:17', '2026-07-31 17:08:17');

-- --------------------------------------------------------

--
-- Table structure for table `wallets`
--

CREATE TABLE `wallets` (
  `id` varchar(50) NOT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `balance` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wallets`
--

INSERT INTO `wallets` (`id`, `user_id`, `balance`, `created_at`, `updated_at`) VALUES
('wal_001', 'usr_customer_01', 500, '2026-07-31 17:08:17', '2026-07-31 17:08:17');

-- --------------------------------------------------------

--
-- Table structure for table `wallet_transactions`
--

CREATE TABLE `wallet_transactions` (
  `id` int(11) NOT NULL,
  `wallet_id` varchar(50) NOT NULL,
  `transaction_code` varchar(50) NOT NULL,
  `type` enum('Booking','Tournament','Refund','Top-up','Prize') NOT NULL,
  `description` varchar(255) NOT NULL,
  `amount` int(11) NOT NULL,
  `status` enum('Completed','Pending') DEFAULT 'Completed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `slot_id` (`slot_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `branch_code` (`branch_code`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `branch_sports`
--
ALTER TABLE `branch_sports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `sport_id` (`sport_id`);

--
-- Indexes for table `holidays`
--
ALTER TABLE `holidays`
  ADD PRIMARY KEY (`id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Indexes for table `purchase_entries`
--
ALTER TABLE `purchase_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inventory_id` (`inventory_id`);

--
-- Indexes for table `slots`
--
ALTER TABLE `slots`
  ADD PRIMARY KEY (`id`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `sport_id` (`sport_id`);

--
-- Indexes for table `sports`
--
ALTER TABLE `sports`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `teams`
--
ALTER TABLE `teams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tournament_id` (`tournament_id`);

--
-- Indexes for table `tournaments`
--
ALTER TABLE `tournaments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `sport_id` (`sport_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `wallets`
--
ALTER TABLE `wallets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_code` (`transaction_code`),
  ADD KEY `wallet_id` (`wallet_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `purchase_entries`
--
ALTER TABLE `purchase_entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`slot_id`) REFERENCES `slots` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `branches`
--
ALTER TABLE `branches`
  ADD CONSTRAINT `branches_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `branch_sports`
--
ALTER TABLE `branch_sports`
  ADD CONSTRAINT `branch_sports_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `branch_sports_ibfk_2` FOREIGN KEY (`sport_id`) REFERENCES `sports` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `holidays`
--
ALTER TABLE `holidays`
  ADD CONSTRAINT `holidays_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `purchase_entries`
--
ALTER TABLE `purchase_entries`
  ADD CONSTRAINT `purchase_entries_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `slots`
--
ALTER TABLE `slots`
  ADD CONSTRAINT `slots_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `slots_ibfk_2` FOREIGN KEY (`sport_id`) REFERENCES `sports` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teams`
--
ALTER TABLE `teams`
  ADD CONSTRAINT `teams_ibfk_1` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tournaments`
--
ALTER TABLE `tournaments`
  ADD CONSTRAINT `tournaments_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tournaments_ibfk_2` FOREIGN KEY (`sport_id`) REFERENCES `sports` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wallets`
--
ALTER TABLE `wallets`
  ADD CONSTRAINT `wallets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD CONSTRAINT `wallet_transactions_ibfk_1` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
