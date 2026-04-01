-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 01, 2026 at 10:58 AM
-- Server version: 8.4.3
-- PHP Version: 8.2.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `b2c_ecommerce`
--

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `content`, `is_read`, `created_at`) VALUES
(6, 1, 'Đơn hàng đã giao', 'Đơn hàng #001 của bạn đã được giao thành công!', 1, '2026-04-01 11:42:03'),
(7, 3, 'Khuyến mãi hấp dẫn', 'Giảm 50% cho tất cả sản phẩm hôm nay!', 1, '2026-04-01 11:42:03'),
(8, 3, 'Phản hồi hỗ trợ', 'Yêu cầu hỗ trợ #123 của bạn đã được xử lý.', 1, '2026-04-01 11:42:03'),
(9, 1, 'Khuyến mãi hấp dẫn', 'Giảm 50% cho tất cả sản phẩm hôm nay!', 1, '2026-04-01 11:42:03'),
(10, 3, 'Phản hồi hỗ trợ', 'Yêu cầu hỗ trợ #123 của bạn đã được xử lý.', 1, '2026-04-01 11:42:03');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'customer',
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `phone`, `role`, `status`, `created_at`) VALUES
(1, 'testuser', 'test@gmail.com', '$2b$10$EiO0imK2bQkvIi05q0I1FeO1X3QYWUfOagy9Sap.7pUkJ4ukF8vim', '0901234567', 'customer', 'active', '2026-04-01 10:11:56'),
(3, 'newname', 'test1@gmail.com', '$2b$10$WqzhzvrIcYxfDrHDfeuXeuiNjS3Um6KOyE7x0jgcHYGIgG1Agf2JW', '0909999999', 'admin', 'active', '2026-04-01 10:44:56'),
(4, 'VanToan', 'test2@gmail.com', '$2b$10$qkCtLIrQiaPvFC7Br0J/e.tRIbUBvmJZXOhgdNBzlRGOILVTPQLWm', '0909999999', 'shipper', 'active', '2026-04-01 17:49:52');

-- --------------------------------------------------------

--
-- Table structure for table `user_address`
--

CREATE TABLE `user_address` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `receiver_name` varchar(150) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `province` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `ward` varchar(100) DEFAULT NULL,
  `detail` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_address`
--

INSERT INTO `user_address` (`id`, `user_id`, `receiver_name`, `phone`, `province`, `district`, `ward`, `detail`, `latitude`, `longitude`, `is_default`) VALUES
(2, 1, 'Nguyễn Văn B', '093636369', 'TP HCM', 'Quận 2', 'Phường Thảo Điền', '123 Thảo Điền', 10.7769000, 106.7009000, 0),
(3, 1, 'Nguyễn Văn C', '093636369', 'TP HCM', 'Quận 2', 'Phường Thảo Điền', '123 Thảo Điền', 10.7769000, 106.7009000, 0),
(4, 1, 'Nguyễn Văn D', '093636369', 'TP HCM', 'Quận 2', 'Phường Thảo Điền', '123 Thảo Điền', 10.7769000, 106.7009000, 1),
(5, 4, 'Nguyễn Văn C', '0901234567', 'TP HCM', 'Quận 1', 'Phường Bến Nghé', '125 Lê Lợi', 10.7769000, 106.7009000, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notif_user` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_address`
--
ALTER TABLE `user_address`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_address_user` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_address`
--
ALTER TABLE `user_address`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_address`
--
ALTER TABLE `user_address`
  ADD CONSTRAINT `fk_address_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
