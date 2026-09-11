-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 11, 2026 at 12:00 PM
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
-- Database: `farmerflow`
--

-- --------------------------------------------------------

--
-- Table structure for table `alerts`
--

CREATE TABLE `alerts` (
  `id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `body` text NOT NULL,
  `type` enum('slot','center','payment','delay','system') NOT NULL DEFAULT 'system',
  `farmer_id` int(11) DEFAULT NULL,
  `center_id` varchar(50) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `alerts`
--

INSERT INTO `alerts` (`id`, `title`, `body`, `type`, `farmer_id`, `center_id`, `created_by`, `created_at`) VALUES
(1, 'Today is the day', 'hi hi hi', 'system', NULL, NULL, NULL, '2026-09-11 07:08:27'),
(2, 'hi hi', 'hi', 'system', NULL, NULL, NULL, '2026-09-11 07:10:05');

-- --------------------------------------------------------

--
-- Table structure for table `alert_reads`
--

CREATE TABLE `alert_reads` (
  `alert_id` int(11) NOT NULL,
  `farmer_id` int(11) NOT NULL,
  `read_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `alert_reads`
--

INSERT INTO `alert_reads` (`alert_id`, `farmer_id`, `read_at`) VALUES
(1, 2, '2026-09-11 07:08:39'),
(2, 2, '2026-09-11 07:10:15');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` varchar(50) NOT NULL,
  `farmer_id` int(11) NOT NULL,
  `crop` enum('Wheat','Cotton','Rice','Groundnut','Mustard','Other') NOT NULL,
  `quantity_kg` decimal(10,2) NOT NULL,
  `center_id` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `slot_id` varchar(50) NOT NULL,
  `status` enum('Confirmed','Completed','Cancelled','Rescheduled') NOT NULL DEFAULT 'Confirmed',
  `expected_wait_min` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `farmer_id`, `crop`, `quantity_kg`, `center_id`, `date`, `time`, `slot_id`, `status`, `expected_wait_min`, `created_at`) VALUES
('FF-2026-089120', 4, 'Wheat', 250.00, 'C-C', '2026-09-12', '10:00:00', 'C-C-2026-09-12-10:00', 'Cancelled', 130, '2026-09-11 06:35:12'),
('FF-2026-335768', 7, 'Rice', 250.00, 'C-B', '2026-09-12', '09:00:00', 'C-B-2026-09-12-09:00', 'Confirmed', 58, '2026-09-11 07:58:29'),
('FF-2026-447748', 7, 'Wheat', 250.00, 'C-A', '2026-09-13', '08:00:00', 'C-A-2026-09-13-08:00', 'Confirmed', 24, '2026-09-11 07:57:40'),
('FF-2026-631700', 6, 'Other', 250.00, 'C-A', '2026-09-13', '10:00:00', 'C-A-2026-09-13-10:00', 'Confirmed', 24, '2026-09-11 07:47:37'),
('FF-2026-708760', 2, 'Wheat', 250.00, 'C-B', '2026-09-12', '12:00:00', 'C-B-2026-09-12-12:00', 'Confirmed', 58, '2026-09-11 07:22:22'),
('FF-2026-809685', 2, 'Wheat', 250.00, 'C-A', '2026-09-12', '09:00:00', 'C-A-2026-09-12-09:00', 'Confirmed', 24, '2026-09-11 06:36:56'),
('FF-2026-818265', 2, 'Wheat', 2500.00, 'C-B', '2026-09-12', '10:00:00', 'C-B-2026-09-12-10:00', 'Confirmed', 58, '2026-09-11 07:38:26'),
('FF-2026-938383', 4, 'Wheat', 250.00, 'C-A', '2026-09-13', '08:00:00', 'C-A-2026-09-13-08:00', 'Rescheduled', 24, '2026-09-11 06:43:40');

-- --------------------------------------------------------

--
-- Table structure for table `centers`
--

CREATE TABLE `centers` (
  `id` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `location` varchar(255) NOT NULL,
  `village` varchar(150) NOT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `distance_km` decimal(5,2) NOT NULL,
  `daily_capacity` int(11) NOT NULL,
  `booked_today` int(11) NOT NULL DEFAULT 0,
  `current_queue` int(11) NOT NULL DEFAULT 0,
  `counters_open` int(11) NOT NULL DEFAULT 0,
  `counters_total` int(11) NOT NULL DEFAULT 0,
  `expected_wait_min` int(11) NOT NULL DEFAULT 0,
  `processing_rate_per_hour` int(11) NOT NULL DEFAULT 0,
  `avg_wait_min` int(11) NOT NULL DEFAULT 0,
  `payment_reliability` decimal(5,2) NOT NULL DEFAULT 0.00,
  `reliability_score` decimal(5,2) NOT NULL DEFAULT 0.00,
  `on_time_payment` decimal(5,2) NOT NULL DEFAULT 0.00,
  `grievance_resolution` decimal(5,2) NOT NULL DEFAULT 0.00,
  `status` enum('Open','Busy','Closed') NOT NULL DEFAULT 'Open',
  `congestion` enum('low','medium','high') NOT NULL DEFAULT 'low',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `centers`
--

INSERT INTO `centers` (`id`, `name`, `location`, `village`, `latitude`, `longitude`, `distance_km`, `daily_capacity`, `booked_today`, `current_queue`, `counters_open`, `counters_total`, `expected_wait_min`, `processing_rate_per_hour`, `avg_wait_min`, `payment_reliability`, `reliability_score`, `on_time_payment`, `grievance_resolution`, `status`, `congestion`, `created_at`) VALUES
('C-A', 'Ahmedabad Procurement Center', 'Naroda, Ahmedabad', 'Ahmedabad', 23.0722000, 72.6506000, 8.00, 420, 302, 18, 4, 5, 24, 48, 28, 96.00, 94.00, 96.00, 92.00, 'Open', 'low', '2026-09-11 06:43:37'),
('C-B', 'Gandhinagar Procurement Center', 'Sector 21, Gandhinagar', 'Gandhinagar', 23.2156000, 72.6369000, 5.00, 360, 302, 32, 4, 5, 58, 40, 41, 88.00, 61.00, 78.00, 71.00, 'Busy', 'medium', '2026-09-11 06:43:37'),
('C-C', 'Kheda Procurement Center', 'NH-47, Kheda', 'Kheda', 22.7507000, 72.6860000, 12.00, 300, 288, 54, 3, 4, 130, 32, 67, 81.00, 54.00, 74.00, 63.00, 'Busy', 'high', '2026-09-11 06:43:37'),
('C-D', 'Nadiad Procurement Center', 'College Road, Nadiad', 'Nadiad', 22.6939000, 72.8614000, 18.00, 280, 118, 7, 4, 4, 14, 36, 22, 91.00, 82.00, 90.00, 85.00, 'Open', 'low', '2026-09-11 06:43:37'),
('C-E', 'Anand Procurement Center', 'Milk City Road, Anand', 'Anand', 22.5645000, 72.9289000, 22.00, 340, 208, 16, 5, 5, 31, 44, 33, 93.00, 88.00, 93.00, 88.00, 'Open', 'medium', '2026-09-11 06:43:37'),
('C-F', 'Mehsana Procurement Center', 'Highway Circle, Mehsana', 'Mehsana', 23.5880000, 72.3693000, 28.00, 260, 141, 9, 3, 4, 19, 30, 29, 87.00, 76.00, 84.00, 80.00, 'Open', 'low', '2026-09-11 06:43:37');

-- --------------------------------------------------------

--
-- Table structure for table `farmers`
--

CREATE TABLE `farmers` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `mobile` int(20) NOT NULL,
  `village` varchar(150) NOT NULL,
  `crop` enum('Wheat','Cotton','Rice','Groundnut','Mustard','Other') NOT NULL,
  `status` enum('Active','Pending','Inactive','') NOT NULL,
  `credit_score` int(11) NOT NULL DEFAULT 700,
  `email` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `farmers`
--

INSERT INTO `farmers` (`id`, `name`, `mobile`, `village`, `crop`, `status`, `credit_score`, `email`, `created_at`) VALUES
(1, 'Ayush', 0, 'Unknown', 'Other', 'Active', 700, 'ayush@gmail.com', '2026-09-11 06:33:26'),
(2, 'marya', 0, 'Unknown', 'Other', 'Active', 719, 'marya@gmail.com', '2026-09-11 06:33:26'),
(4, 'Aryan', 2147483647, 'Sanand', 'Other', 'Active', 700, 'aryan@gmail.com', '2026-09-11 06:34:58'),
(5, 'ayyyush', 2147483647, 'Sanand', 'Other', 'Active', 700, 'ayyush@gmail.com', '2026-09-11 06:58:59'),
(6, 'Neev Limbachiya', 2147483647, 'Kalol', 'Other', 'Active', 700, 'neev123@gmail.com', '2026-09-11 07:46:23'),
(7, 'Ayushh', 999999999, 'Sanand', 'Other', 'Active', 700, 'ayushhh3@gmail.com', '2026-09-11 07:56:40');

-- --------------------------------------------------------

--
-- Table structure for table `grievances`
--

CREATE TABLE `grievances` (
  `id` varchar(50) NOT NULL,
  `farmer_id` int(11) NOT NULL,
  `procurement_id` varchar(50) DEFAULT NULL,
  `category` enum('Payment Delay','Incorrect Grading','Slot Problem','Center Problem','Other') NOT NULL,
  `description` text NOT NULL,
  `status` enum('Open','In Progress','Resolved','Escalated') NOT NULL DEFAULT 'Open',
  `priority` enum('Low','Medium','High') NOT NULL DEFAULT 'Medium',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `assigned_to` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `grievances`
--

INSERT INTO `grievances` (`id`, `farmer_id`, `procurement_id`, `category`, `description`, `status`, `priority`, `created_at`, `assigned_to`) VALUES
('GRV-2026-48839', 4, NULL, 'Payment Delay', 'Payment has not arrived after the promised date.', 'Open', 'High', '2026-09-11 06:38:45', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `market_prices`
--

CREATE TABLE `market_prices` (
  `crop` enum('Wheat','Cotton','Rice','Groundnut','Mustard','Other') NOT NULL,
  `government_price_per_kg` decimal(10,2) NOT NULL,
  `effective_date` date NOT NULL,
  `source` varchar(150) NOT NULL DEFAULT 'Government procurement rate',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `market_prices`
--

INSERT INTO `market_prices` (`crop`, `government_price_per_kg`, `effective_date`, `source`, `updated_at`) VALUES
('Wheat', 30.00, '2026-09-11', 'Government procurement rate', '2026-09-11 07:42:21'),
('Cotton', 70.00, '2026-09-11', 'Government procurement rate', '2026-09-11 07:36:19'),
('Rice', 32.00, '2026-09-11', 'Government procurement rate', '2026-09-11 07:36:19'),
('Groundnut', 58.00, '2026-09-11', 'Government procurement rate', '2026-09-11 07:36:19'),
('Mustard', 52.00, '2026-09-11', 'Government procurement rate', '2026-09-11 07:36:19'),
('Other', 20.00, '2026-09-11', 'Government procurement rate', '2026-09-11 07:36:19');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` varchar(50) NOT NULL,
  `farmer_id` int(11) NOT NULL,
  `procurement_id` varchar(50) NOT NULL,
  `crop` enum('Wheat','Cotton','Rice','Groundnut','Mustard','Other') NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `date` date NOT NULL,
  `expected_date` date NOT NULL,
  `status` enum('Paid','Processing','Delayed') NOT NULL DEFAULT 'Processing',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `procurements`
--

CREATE TABLE `procurements` (
  `id` varchar(50) NOT NULL,
  `farmer_id` int(11) NOT NULL,
  `booking_id` varchar(50) DEFAULT NULL,
  `crop` enum('Wheat','Cotton','Rice','Groundnut','Mustard','Other') NOT NULL,
  `quantity_kg` decimal(10,2) NOT NULL,
  `accepted_quantity_kg` decimal(10,2) NOT NULL DEFAULT 0.00,
  `price_per_kg` decimal(10,2) NOT NULL DEFAULT 0.00,
  `center_id` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `lot_id` varchar(100) NOT NULL,
  `grade` enum('A','B','C') NOT NULL,
  `moisture` decimal(5,2) NOT NULL,
  `foreign_material` decimal(5,2) NOT NULL,
  `damaged` decimal(5,2) NOT NULL,
  `quality_deduction_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `grade_reason` varchar(255) NOT NULL,
  `estimated_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('Received','Graded','Approved','Payment Pending','Paid') NOT NULL DEFAULT 'Received',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `procurements`
--

INSERT INTO `procurements` (`id`, `farmer_id`, `booking_id`, `crop`, `quantity_kg`, `accepted_quantity_kg`, `price_per_kg`, `center_id`, `date`, `time`, `lot_id`, `grade`, `moisture`, `foreign_material`, `damaged`, `quality_deduction_percent`, `grade_reason`, `estimated_amount`, `status`, `created_at`) VALUES
('FF-P-2026-02053', 2, NULL, 'Wheat', 250.00, 250.00, 25.00, 'C-A', '2026-09-11', '10:00:00', '2122312321', 'A', 14.00, 1.00, 1.00, 6.00, 'Quality checks completed at receiving center.', 5875.00, 'Paid', '2026-09-11 07:38:44'),
('FF-P-2026-42214', 1, NULL, 'Wheat', 1333.00, 0.00, 0.00, 'C-A', '2026-09-11', '10:00:00', 'dsadasads', 'A', 14.00, 1.00, 1.00, 0.00, 'Quality checks completed at receiving center.', 0.00, 'Graded', '2026-09-11 07:31:23'),
('FF-P-2026-77611', 2, NULL, 'Wheat', 120.00, 0.00, 0.00, 'C-A', '2026-09-11', '10:00:00', 'asdadsasds', 'A', 14.00, 1.00, 1.00, 0.00, 'Quality checks completed at receiving center.', 0.00, 'Received', '2026-09-11 07:31:54');

-- --------------------------------------------------------

--
-- Table structure for table `procurement_events`
--

CREATE TABLE `procurement_events` (
  `id` int(11) NOT NULL,
  `procurement_id` varchar(50) NOT NULL,
  `event_key` enum('received','graded','approved','processing','paid') NOT NULL,
  `label` varchar(150) NOT NULL,
  `event_at` datetime DEFAULT NULL,
  `expected_at` datetime DEFAULT NULL,
  `done` tinyint(1) NOT NULL DEFAULT 0,
  `current_flag` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `procurement_events`
--

INSERT INTO `procurement_events` (`id`, `procurement_id`, `event_key`, `label`, `event_at`, `expected_at`, `done`, `current_flag`, `created_at`) VALUES
(1, 'FF-P-2026-42214', 'received', 'Produce Received', '2026-09-11 13:01:28', NULL, 1, 0, '2026-09-11 07:31:23'),
(2, 'FF-P-2026-42214', 'graded', 'Quality Grading', '2026-09-11 13:01:28', NULL, 1, 1, '2026-09-11 07:31:23'),
(3, 'FF-P-2026-42214', 'approved', 'Accepted', NULL, NULL, 0, 0, '2026-09-11 07:31:23'),
(4, 'FF-P-2026-42214', 'processing', 'Payment Processing', NULL, NULL, 0, 0, '2026-09-11 07:31:23'),
(5, 'FF-P-2026-42214', 'paid', 'Paid', NULL, NULL, 0, 0, '2026-09-11 07:31:23'),
(6, 'FF-P-2026-77611', 'received', 'Produce Received', '2026-09-11 13:02:05', NULL, 1, 1, '2026-09-11 07:31:54'),
(7, 'FF-P-2026-77611', 'graded', 'Quality Grading', '2026-09-11 13:02:05', NULL, 0, 0, '2026-09-11 07:31:54'),
(8, 'FF-P-2026-77611', 'approved', 'Accepted', '2026-09-11 13:02:05', NULL, 0, 0, '2026-09-11 07:31:54'),
(9, 'FF-P-2026-77611', 'processing', 'Payment Processing', '2026-09-11 13:02:05', NULL, 0, 0, '2026-09-11 07:31:54'),
(10, 'FF-P-2026-77611', 'paid', 'Paid', NULL, NULL, 0, 0, '2026-09-11 07:31:54'),
(11, 'FF-P-2026-02053', 'received', 'Produce Received', '2026-09-11 13:20:14', NULL, 1, 0, '2026-09-11 07:38:44'),
(12, 'FF-P-2026-02053', 'graded', 'Quality Grading', '2026-09-11 13:20:14', NULL, 1, 0, '2026-09-11 07:38:44'),
(13, 'FF-P-2026-02053', 'approved', 'Accepted', '2026-09-11 13:20:14', NULL, 1, 0, '2026-09-11 07:38:44'),
(14, 'FF-P-2026-02053', 'processing', 'Payment Processing', '2026-09-11 13:20:14', NULL, 1, 0, '2026-09-11 07:38:44'),
(15, 'FF-P-2026-02053', 'paid', 'Paid', '2026-09-11 13:20:15', NULL, 1, 1, '2026-09-11 07:38:44');

-- --------------------------------------------------------

--
-- Table structure for table `time_slots`
--

CREATE TABLE `time_slots` (
  `id` varchar(50) NOT NULL,
  `center_id` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `booked` int(11) NOT NULL DEFAULT 0,
  `capacity` int(11) NOT NULL,
  `state` enum('AVAILABLE','LIMITED','FULL','CLOSED') NOT NULL DEFAULT 'AVAILABLE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `time_slots`
--

INSERT INTO `time_slots` (`id`, `center_id`, `date`, `start_time`, `end_time`, `booked`, `capacity`, `state`, `created_at`) VALUES
('C-A-2026-09-11-08:00', 'C-A', '2026-09-11', '08:00:00', '09:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-A-2026-09-11-09:00', 'C-A', '2026-09-11', '09:00:00', '10:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-A-2026-09-11-10:00', 'C-A', '2026-09-11', '10:00:00', '11:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-A-2026-09-11-11:00', 'C-A', '2026-09-11', '11:00:00', '12:00:00', 24, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-A-2026-09-11-12:00', 'C-A', '2026-09-11', '12:00:00', '13:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-A-2026-09-12-08:00', 'C-A', '2026-09-12', '08:00:00', '09:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-A-2026-09-12-09:00', 'C-A', '2026-09-12', '09:00:00', '10:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-A-2026-09-12-10:00', 'C-A', '2026-09-12', '10:00:00', '11:00:00', 42, 50, 'LIMITED', '2026-09-11 06:43:37'),
('C-A-2026-09-12-11:00', 'C-A', '2026-09-12', '11:00:00', '12:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-A-2026-09-12-12:00', 'C-A', '2026-09-12', '12:00:00', '13:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-A-2026-09-13-08:00', 'C-A', '2026-09-13', '08:00:00', '09:00:00', 26, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-A-2026-09-13-09:00', 'C-A', '2026-09-13', '09:00:00', '10:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-A-2026-09-13-10:00', 'C-A', '2026-09-13', '10:00:00', '11:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-A-2026-09-13-11:00', 'C-A', '2026-09-13', '11:00:00', '12:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-A-2026-09-13-12:00', 'C-A', '2026-09-13', '12:00:00', '13:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-B-2026-09-11-08:00', 'C-B', '2026-09-11', '08:00:00', '09:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-B-2026-09-11-09:00', 'C-B', '2026-09-11', '09:00:00', '10:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-B-2026-09-11-10:00', 'C-B', '2026-09-11', '10:00:00', '11:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-B-2026-09-11-11:00', 'C-B', '2026-09-11', '11:00:00', '12:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-B-2026-09-11-12:00', 'C-B', '2026-09-11', '12:00:00', '13:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-B-2026-09-12-08:00', 'C-B', '2026-09-12', '08:00:00', '09:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-B-2026-09-12-09:00', 'C-B', '2026-09-12', '09:00:00', '10:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-B-2026-09-12-10:00', 'C-B', '2026-09-12', '10:00:00', '11:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-B-2026-09-12-11:00', 'C-B', '2026-09-12', '11:00:00', '12:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-B-2026-09-12-12:00', 'C-B', '2026-09-12', '12:00:00', '13:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-B-2026-09-13-08:00', 'C-B', '2026-09-13', '08:00:00', '09:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-B-2026-09-13-09:00', 'C-B', '2026-09-13', '09:00:00', '10:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-B-2026-09-13-10:00', 'C-B', '2026-09-13', '10:00:00', '11:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-B-2026-09-13-11:00', 'C-B', '2026-09-13', '11:00:00', '12:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-B-2026-09-13-12:00', 'C-B', '2026-09-13', '12:00:00', '13:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-C-2026-09-11-08:00', 'C-C', '2026-09-11', '08:00:00', '09:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-C-2026-09-11-09:00', 'C-C', '2026-09-11', '09:00:00', '10:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-C-2026-09-11-10:00', 'C-C', '2026-09-11', '10:00:00', '11:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-C-2026-09-11-11:00', 'C-C', '2026-09-11', '11:00:00', '12:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-C-2026-09-11-12:00', 'C-C', '2026-09-11', '12:00:00', '13:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-C-2026-09-12-08:00', 'C-C', '2026-09-12', '08:00:00', '09:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-C-2026-09-12-09:00', 'C-C', '2026-09-12', '09:00:00', '10:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-C-2026-09-12-10:00', 'C-C', '2026-09-12', '10:00:00', '11:00:00', 24, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-C-2026-09-12-11:00', 'C-C', '2026-09-12', '11:00:00', '12:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-C-2026-09-12-12:00', 'C-C', '2026-09-12', '12:00:00', '13:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-C-2026-09-13-08:00', 'C-C', '2026-09-13', '08:00:00', '09:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-C-2026-09-13-09:00', 'C-C', '2026-09-13', '09:00:00', '10:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-C-2026-09-13-10:00', 'C-C', '2026-09-13', '10:00:00', '11:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-C-2026-09-13-11:00', 'C-C', '2026-09-13', '11:00:00', '12:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-C-2026-09-13-12:00', 'C-C', '2026-09-13', '12:00:00', '13:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-D-2026-09-11-08:00', 'C-D', '2026-09-11', '08:00:00', '09:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-D-2026-09-11-09:00', 'C-D', '2026-09-11', '09:00:00', '10:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-D-2026-09-11-10:00', 'C-D', '2026-09-11', '10:00:00', '11:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-D-2026-09-11-11:00', 'C-D', '2026-09-11', '11:00:00', '12:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-D-2026-09-11-12:00', 'C-D', '2026-09-11', '12:00:00', '13:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-D-2026-09-12-08:00', 'C-D', '2026-09-12', '08:00:00', '09:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-D-2026-09-12-09:00', 'C-D', '2026-09-12', '09:00:00', '10:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-D-2026-09-12-10:00', 'C-D', '2026-09-12', '10:00:00', '11:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-D-2026-09-12-11:00', 'C-D', '2026-09-12', '11:00:00', '12:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-D-2026-09-12-12:00', 'C-D', '2026-09-12', '12:00:00', '13:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-D-2026-09-13-08:00', 'C-D', '2026-09-13', '08:00:00', '09:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-D-2026-09-13-09:00', 'C-D', '2026-09-13', '09:00:00', '10:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-D-2026-09-13-10:00', 'C-D', '2026-09-13', '10:00:00', '11:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-D-2026-09-13-11:00', 'C-D', '2026-09-13', '11:00:00', '12:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-D-2026-09-13-12:00', 'C-D', '2026-09-13', '12:00:00', '13:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-E-2026-09-11-08:00', 'C-E', '2026-09-11', '08:00:00', '09:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-E-2026-09-11-09:00', 'C-E', '2026-09-11', '09:00:00', '10:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-E-2026-09-11-10:00', 'C-E', '2026-09-11', '10:00:00', '11:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-E-2026-09-11-11:00', 'C-E', '2026-09-11', '11:00:00', '12:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-E-2026-09-11-12:00', 'C-E', '2026-09-11', '12:00:00', '13:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-E-2026-09-12-08:00', 'C-E', '2026-09-12', '08:00:00', '09:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-E-2026-09-12-09:00', 'C-E', '2026-09-12', '09:00:00', '10:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-E-2026-09-12-10:00', 'C-E', '2026-09-12', '10:00:00', '11:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-E-2026-09-12-11:00', 'C-E', '2026-09-12', '11:00:00', '12:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-E-2026-09-12-12:00', 'C-E', '2026-09-12', '12:00:00', '13:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-E-2026-09-13-08:00', 'C-E', '2026-09-13', '08:00:00', '09:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-E-2026-09-13-09:00', 'C-E', '2026-09-13', '09:00:00', '10:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-E-2026-09-13-10:00', 'C-E', '2026-09-13', '10:00:00', '11:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-E-2026-09-13-11:00', 'C-E', '2026-09-13', '11:00:00', '12:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-E-2026-09-13-12:00', 'C-E', '2026-09-13', '12:00:00', '13:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-F-2026-09-11-08:00', 'C-F', '2026-09-11', '08:00:00', '09:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-F-2026-09-11-09:00', 'C-F', '2026-09-11', '09:00:00', '10:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-F-2026-09-11-10:00', 'C-F', '2026-09-11', '10:00:00', '11:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-F-2026-09-11-11:00', 'C-F', '2026-09-11', '11:00:00', '12:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-F-2026-09-11-12:00', 'C-F', '2026-09-11', '12:00:00', '13:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-F-2026-09-12-08:00', 'C-F', '2026-09-12', '08:00:00', '09:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-F-2026-09-12-09:00', 'C-F', '2026-09-12', '09:00:00', '10:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-F-2026-09-12-10:00', 'C-F', '2026-09-12', '10:00:00', '11:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-F-2026-09-12-11:00', 'C-F', '2026-09-12', '11:00:00', '12:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-F-2026-09-12-12:00', 'C-F', '2026-09-12', '12:00:00', '13:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-F-2026-09-13-08:00', 'C-F', '2026-09-13', '08:00:00', '09:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-F-2026-09-13-09:00', 'C-F', '2026-09-13', '09:00:00', '10:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-F-2026-09-13-10:00', 'C-F', '2026-09-13', '10:00:00', '11:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-F-2026-09-13-11:00', 'C-F', '2026-09-13', '11:00:00', '12:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37'),
('C-F-2026-09-13-12:00', 'C-F', '2026-09-13', '12:00:00', '13:00:00', 25, 50, 'AVAILABLE', '2026-09-11 06:43:37');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('farmer','admin','','') NOT NULL,
  `farmer_id` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `farmer_id`, `created_at`) VALUES
(1, 'Ayush', 'ayush@gmail.com', '$2y$10$P5oqyq4x/Rqi69owq7Gya.yJzGn22MpQVNnVIHCW/sh3dxBZO/km6', 'farmer', '1', '2026-09-11 06:26:56'),
(2, 'marya', 'marya@gmail.com', '$2y$10$VLtO8JDhXp.7jH7uP.WAaecbwpKl1mHk8YSObiEm1k5tylblkYV4y', 'farmer', '2', '2026-09-11 06:27:58'),
(3, 'Aryan', 'aryan@gmail.com', '$2y$10$3CxXG7kEAjKK4M16SkFYbebRWgk32K9NA/tnUaocEvhUuinF3nuey', 'farmer', '4', '2026-09-11 06:34:58'),
(4, 'ayyyush', 'ayyush@gmail.com', '$2y$10$BnBXyyAsu8UHl6uhhE9fOuuxAcwqK3yzrLWXLSJuRivOP6zp16AjG', 'farmer', '5', '2026-09-11 06:58:59'),
(5, 'neev', 'neev@gmail.com', '$2y$10$h9iFHOErJ4dQsK0sy9jUPuso2zGeKzuWlzi0Ju0osfTkMOHMDbewy', 'admin', '0', '2026-09-11 07:00:14'),
(6, 'Neev Limbachiya', 'neev123@gmail.com', '$2y$10$TIIdgmGff4SZvH/LF6DfNe0ArGWz9QdUl84AMLreHNCufmoZj37eC', 'farmer', '6', '2026-09-11 07:46:23'),
(7, 'ayush', 'ayushhh@gmail.com', '$2y$10$m/TrTTNQpdFMxYrEd4zrCugKV6eml3EPb3PF3Oxo4gqp4jBhUVDUO', 'admin', '0', '2026-09-11 07:49:14'),
(8, 'Ayushh', 'ayushhh3@gmail.com', '$2y$10$crN6yyREUDB0/mvatvFN2O0ghRS.xeOlWFo9pW7bMCqP3HQh8WEYW', 'farmer', '7', '2026-09-11 07:56:40');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `alerts`
--
ALTER TABLE `alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_alert_farmer` (`farmer_id`),
  ADD KEY `idx_alert_center` (`center_id`);

--
-- Indexes for table `alert_reads`
--
ALTER TABLE `alert_reads`
  ADD PRIMARY KEY (`alert_id`,`farmer_id`),
  ADD KEY `fk_alert_read_farmer` (`farmer_id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_booking_farmer` (`farmer_id`);

--
-- Indexes for table `centers`
--
ALTER TABLE `centers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `farmers`
--
ALTER TABLE `farmers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `grievances`
--
ALTER TABLE `grievances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_grievance_farmer` (`farmer_id`),
  ADD KEY `fk_grievance_procurement` (`procurement_id`);

--
-- Indexes for table `market_prices`
--
ALTER TABLE `market_prices`
  ADD PRIMARY KEY (`crop`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_payment_farmer` (`farmer_id`),
  ADD KEY `fk_payment_procurement` (`procurement_id`);

--
-- Indexes for table `procurements`
--
ALTER TABLE `procurements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_procurement_farmer` (`farmer_id`),
  ADD KEY `fk_procurement_booking` (`booking_id`);

--
-- Indexes for table `procurement_events`
--
ALTER TABLE `procurement_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_event_procurement` (`procurement_id`);

--
-- Indexes for table `time_slots`
--
ALTER TABLE `time_slots`
  ADD PRIMARY KEY (`id`),
  ADD KEY `center_id` (`center_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `alerts`
--
ALTER TABLE `alerts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `farmers`
--
ALTER TABLE `farmers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `procurement_events`
--
ALTER TABLE `procurement_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `alerts`
--
ALTER TABLE `alerts`
  ADD CONSTRAINT `fk_alert_center` FOREIGN KEY (`center_id`) REFERENCES `centers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_alert_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `farmers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `alert_reads`
--
ALTER TABLE `alert_reads`
  ADD CONSTRAINT `fk_alert_read_alert` FOREIGN KEY (`alert_id`) REFERENCES `alerts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_alert_read_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `farmers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `fk_booking_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `farmers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `grievances`
--
ALTER TABLE `grievances`
  ADD CONSTRAINT `fk_grievance_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `farmers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_grievance_procurement` FOREIGN KEY (`procurement_id`) REFERENCES `procurements` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payment_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `farmers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payment_procurement` FOREIGN KEY (`procurement_id`) REFERENCES `procurements` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `procurements`
--
ALTER TABLE `procurements`
  ADD CONSTRAINT `fk_procurement_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_procurement_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `farmers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `procurement_events`
--
ALTER TABLE `procurement_events`
  ADD CONSTRAINT `fk_event_procurement` FOREIGN KEY (`procurement_id`) REFERENCES `procurements` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `time_slots`
--
ALTER TABLE `time_slots`
  ADD CONSTRAINT `time_slots_ibfk_1` FOREIGN KEY (`center_id`) REFERENCES `centers` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
