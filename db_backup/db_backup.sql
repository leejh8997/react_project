-- --------------------------------------------------------
-- 호스트:                          127.0.0.1
-- 서버 버전:                        8.0.41 - MySQL Community Server - GPL
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- project 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `project` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `project`;

-- 테이블 project.bookmarks 구조 내보내기
CREATE TABLE IF NOT EXISTS `bookmarks` (
  `bookmark_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `post_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`bookmark_id`),
  UNIQUE KEY `unique_bookmark` (`user_id`,`post_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `bookmarks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `bookmarks_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.bookmarks:~5 rows (대략적) 내보내기
INSERT INTO `bookmarks` (`bookmark_id`, `user_id`, `post_id`, `created_at`) VALUES
	(67, 1, 95, '2025-05-17 14:59:22'),
	(68, 1, 94, '2025-05-17 15:00:19'),
	(69, 1, 90, '2025-05-17 15:30:34'),
	(70, 1, 96, '2025-05-17 16:31:47'),
	(71, 4, 94, '2025-05-19 14:22:11');

-- 테이블 project.chat_messages 구조 내보내기
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `content` text NOT NULL,
  `type` enum('text','image','video','file') DEFAULT 'text',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `read_by` text,
  PRIMARY KEY (`message_id`),
  KEY `room_id` (`room_id`),
  KEY `sender_id` (`sender_id`),
  CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`room_id`) ON DELETE CASCADE,
  CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.chat_messages:~30 rows (대략적) 내보내기
INSERT INTO `chat_messages` (`message_id`, `room_id`, `sender_id`, `content`, `type`, `created_at`, `read_by`) VALUES
	(1, 1, 1, '안녕! 잘 지내?', 'text', '2025-05-12 16:50:07', '["1"]'),
	(2, 1, 2, '응~ 너도 잘 지내지?', 'text', '2025-05-12 16:50:08', '["1"]'),
	(3, 2, 1, '이거 오늘 회의 자료야.', 'text', '2025-05-12 16:50:07', '["1","4"]'),
	(4, 2, 3, '/uploads/design.png', 'image', '2025-05-12 16:50:07', '["1","4"]'),
	(5, 2, 4, '/uploads/meeting.mp4', 'video', '2025-05-12 16:50:08', '["1","4"]'),
	(6, 1, 1, 'ㅋㅋㅋㅋㅋ', 'text', '2025-05-12 21:03:41', '["1"]'),
	(7, 1, 1, 'ㅎㅎㅎㅎㅎ', 'text', '2025-05-12 21:05:56', '["1"]'),
	(8, 1, 1, 'ㅎㅎㅎㅎ', 'text', '2025-05-12 21:06:00', '["1"]'),
	(9, 1, 1, 'ㅎㅎㅎㅎ', 'text', '2025-05-12 21:06:28', '["1"]'),
	(10, 1, 1, 'ㅊㅊㅊㅊㅊㅊ', 'text', '2025-05-12 21:06:38', '["1"]'),
	(11, 1, 1, 'ㅋㅋㅋㅋ', 'text', '2025-05-12 21:20:54', '["1"]'),
	(12, 2, 1, '소고기.jpg', 'image', '2025-05-13 09:29:43', '["1","4"]'),
	(13, 2, 1, '삼겹살.jpg', 'image', '2025-05-13 09:30:07', '["1","4"]'),
	(14, 2, 1, '검색창 안닫힘.mp4', 'video', '2025-05-13 09:41:47', '["1","4"]'),
	(15, 2, 1, 'http://localhost:3005/uploads/1cf5e45a61056afff0e21833855bfd1e', 'video', '2025-05-13 09:59:33', '["1","4"]'),
	(16, 2, 1, 'http://localhost:3005/uploads/22604ea1590bd1855e6ff1fe7006dbb8', 'image', '2025-05-13 10:01:03', '["1","4"]'),
	(17, 1, 1, 'http://localhost:3005/uploads/572b3e47d30ab4f93fcb0180c320920f', 'image', '2025-05-13 10:11:03', '["1"]'),
	(18, 1, 1, 'http://localhost:3005/uploads/94b281f29e5bf00329d54e66f778d82b', 'video', '2025-05-13 10:11:22', '["1"]'),
	(19, 1, 1, 'http://localhost:3005/uploads/1747099164701-ê²ìì°½ ìë«í.mp4', 'video', '2025-05-13 10:19:24', '["1"]'),
	(20, 1, 1, 'http://localhost:3005/uploads/1747099164723-ì¼ê²¹ì´.jpg', 'image', '2025-05-13 10:19:24', '["1"]'),
	(21, 2, 1, '222\n', 'text', '2025-05-13 18:34:39', '["1","4"]'),
	(22, 2, 1, 'ㅋㅋㅋㅋ', 'text', '2025-05-18 16:10:14', '["4","1"]'),
	(23, 2, 4, 'ggggg', 'text', '2025-05-18 16:10:27', '["4","1"]'),
	(24, 3, 1, '됐나?', 'text', '2025-05-19 13:15:28', '["4","1"]'),
	(25, 3, 4, '되나?', 'text', '2025-05-19 13:15:56', '["4","1"]'),
	(26, 3, 4, 'test', 'text', '2025-05-19 14:34:17', '["1"]'),
	(27, 3, 4, 'test', 'text', '2025-05-19 14:34:54', '["1"]'),
	(28, 3, 4, 'http://localhost:3005/uploads/1747632894695-ê²ìì°½.mp4', 'video', '2025-05-19 14:34:54', '["1"]'),
	(29, 3, 4, 'http://localhost:3005/uploads/1747632894703-ìê³ ê¸°.jpg', 'image', '2025-05-19 14:34:54', '["1"]'),
	(30, 3, 4, 'test', 'text', '2025-05-19 14:35:11', '["1"]'),
	(31, 3, 1, 'test', 'text', '2025-05-20 10:53:07', NULL);

-- 테이블 project.chat_rooms 구조 내보내기
CREATE TABLE IF NOT EXISTS `chat_rooms` (
  `room_id` int NOT NULL AUTO_INCREMENT,
  `is_group` tinyint(1) NOT NULL DEFAULT '0',
  `room_name` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`room_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.chat_rooms:~2 rows (대략적) 내보내기
INSERT INTO `chat_rooms` (`room_id`, `is_group`, `room_name`, `created_at`) VALUES
	(1, 0, NULL, '2025-05-12 16:50:07'),
	(2, 1, '개발자 톡방', '2025-05-12 16:50:07'),
	(3, 1, NULL, '2025-05-19 13:15:04');

-- 테이블 project.chat_room_members 구조 내보내기
CREATE TABLE IF NOT EXISTS `chat_room_members` (
  `room_id` int NOT NULL,
  `user_id` int NOT NULL,
  `joined_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`room_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `chat_room_members_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`room_id`) ON DELETE CASCADE,
  CONSTRAINT `chat_room_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.chat_room_members:~8 rows (대략적) 내보내기
INSERT INTO `chat_room_members` (`room_id`, `user_id`, `joined_at`) VALUES
	(1, 1, '2025-05-12 16:50:07'),
	(1, 2, '2025-05-12 16:50:07'),
	(2, 1, '2025-05-12 16:50:07'),
	(2, 3, '2025-05-12 16:50:07'),
	(2, 4, '2025-05-12 16:50:07'),
	(3, 1, '2025-05-19 13:15:04'),
	(3, 2, '2025-05-19 13:15:04'),
	(3, 4, '2025-05-19 13:15:04');

-- 테이블 project.comments 구조 내보내기
CREATE TABLE IF NOT EXISTS `comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `parent_comment_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  `post_id` int NOT NULL,
  `text` text NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  KEY `user_id` (`user_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=175 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.comments:~133 rows (대략적) 내보내기
INSERT INTO `comments` (`comment_id`, `parent_comment_id`, `user_id`, `post_id`, `text`, `created_at`) VALUES
	(1, NULL, 2, 1, '와 날씨 진짜보이네요!', '2025-05-07 11:33:53'),
	(2, NULL, 3, 1, '사진 너무 예뻐요 😊', '2025-05-07 11:33:53'),
	(3, NULL, 1, 2, '여기 어디에요? 궁금해요!', '2025-05-07 11:33:53'),
	(4, NULL, 1, 4, '커피는 진리죠... ☕️', '2025-05-07 11:33:53'),
	(10, NULL, 5, 1, '좋은 아이디어네요!', '2025-05-08 15:05:11'),
	(11, NULL, 6, 2, '점심은 김밥 어때요?', '2025-05-08 15:05:11'),
	(12, NULL, 4, 3, '공감됩니다 😊', '2025-05-08 15:05:11'),
	(13, NULL, 7, 13, '노을 진짜 예뻐요~', '2025-05-08 15:05:11'),
	(14, NULL, 8, 15, '화이팅입니다 💪', '2025-05-08 15:05:11'),
	(50, NULL, 1, 13, 'test', '2025-05-08 15:44:35'),
	(51, NULL, 1, 13, 'test', '2025-05-08 15:46:55'),
	(52, NULL, 1, 13, 'ㅗㅚ히', '2025-05-08 16:31:16'),
	(53, NULL, 1, 13, 'dfsdfsd', '2025-05-08 17:50:49'),
	(54, NULL, 1, 13, 'dsfsdfdsfds', '2025-05-08 17:50:53'),
	(55, NULL, 1, 13, 'dfsdfsdfsdfs', '2025-05-08 17:50:57'),
	(56, NULL, 1, 13, 'sdfsdfs', '2025-05-08 17:51:04'),
	(57, NULL, 1, 13, 'zzzzzzzzzzzzzz', '2025-05-08 17:51:08'),
	(58, NULL, 1, 13, 'zzzzzzzzzzzzzzzzzzzzz', '2025-05-08 17:51:18'),
	(59, NULL, 1, 13, '12312312', '2025-05-08 19:56:35'),
	(60, NULL, 1, 13, '1', '2025-05-08 19:56:47'),
	(61, NULL, 1, 13, '2', '2025-05-08 19:56:49'),
	(62, NULL, 1, 13, '3', '2025-05-08 19:56:51'),
	(63, NULL, 1, 13, '4', '2025-05-08 19:56:52'),
	(64, NULL, 1, 13, '5', '2025-05-08 19:56:54'),
	(65, NULL, 1, 13, '6', '2025-05-08 19:56:56'),
	(66, NULL, 1, 13, '7', '2025-05-08 19:56:58'),
	(67, NULL, 1, 13, '8', '2025-05-08 19:57:00'),
	(68, NULL, 1, 13, '9', '2025-05-08 19:57:01'),
	(69, NULL, 1, 13, '10', '2025-05-08 19:57:03'),
	(70, NULL, 1, 13, '11', '2025-05-08 19:57:05'),
	(71, NULL, 1, 13, '12', '2025-05-08 19:57:06'),
	(72, NULL, 1, 13, '13', '2025-05-08 19:57:08'),
	(73, NULL, 1, 13, '14', '2025-05-08 19:57:09'),
	(74, NULL, 1, 13, '15', '2025-05-08 19:57:11'),
	(75, NULL, 1, 13, '16', '2025-05-08 19:57:13'),
	(76, NULL, 1, 13, '17', '2025-05-08 19:57:15'),
	(77, NULL, 1, 13, '18', '2025-05-08 19:57:17'),
	(78, NULL, 1, 13, '19', '2025-05-08 19:57:19'),
	(79, NULL, 1, 13, '20', '2025-05-08 19:57:20'),
	(80, NULL, 1, 13, '21', '2025-05-08 19:57:22'),
	(81, NULL, 1, 13, '22', '2025-05-08 19:57:23'),
	(82, NULL, 1, 13, '23', '2025-05-08 19:57:25'),
	(83, NULL, 1, 13, '24', '2025-05-08 19:57:26'),
	(84, NULL, 1, 13, '25', '2025-05-08 19:57:27'),
	(85, NULL, 1, 13, '26', '2025-05-08 19:57:45'),
	(86, NULL, 1, 13, '27', '2025-05-08 19:57:47'),
	(87, NULL, 1, 13, '28', '2025-05-08 19:57:48'),
	(88, NULL, 1, 13, '29', '2025-05-08 19:57:50'),
	(89, NULL, 1, 13, '30', '2025-05-08 19:57:52'),
	(90, NULL, 1, 13, 'test중', '2025-05-08 19:57:56'),
	(91, 13, 1, 13, 'test중', '2025-05-08 21:25:18'),
	(92, 13, 1, 13, 'test중', '2025-05-08 21:35:20'),
	(93, NULL, 1, 93, 'test중', '2025-05-12 16:19:11'),
	(94, 93, 1, 93, 'test중', '2025-05-12 16:19:15'),
	(95, NULL, 1, 93, 'test중', '2025-05-12 17:28:07'),
	(96, 95, 1, 93, '@test1 tttt', '2025-05-12 17:28:16'),
	(97, NULL, 1, 90, 'test중', '2025-05-13 17:01:04'),
	(98, NULL, 1, 94, 'test중', '2025-05-13 17:01:28'),
	(99, NULL, 1, 94, 'test중', '2025-05-13 17:06:37'),
	(100, NULL, 1, 94, 'test중', '2025-05-13 17:12:59'),
	(101, NULL, 1, 94, 'test중', '2025-05-13 17:13:13'),
	(102, NULL, 1, 93, 'test중', '2025-05-13 17:17:52'),
	(103, NULL, 1, 86, 'test중', '2025-05-13 18:04:50'),
	(104, NULL, 1, 86, 'test중', '2025-05-13 18:35:25'),
	(105, NULL, 1, 19, 'test중', '2025-05-14 15:25:46'),
	(106, NULL, 4, 95, 'test중', '2025-05-14 18:57:46'),
	(107, NULL, 1, 95, 'test중', '2025-05-14 18:59:28'),
	(108, NULL, 4, 95, 'test중', '2025-05-14 19:00:20'),
	(109, NULL, 1, 95, 'test중', '2025-05-14 19:02:17'),
	(110, NULL, 1, 95, 'test중', '2025-05-14 19:02:35'),
	(111, NULL, 4, 95, 'test중', '2025-05-14 19:41:41'),
	(112, NULL, 4, 95, 'test중', '2025-05-14 19:41:44'),
	(113, NULL, 4, 95, 'test중', '2025-05-14 19:45:34'),
	(114, NULL, 4, 95, 'test중', '2025-05-14 19:45:44'),
	(115, NULL, 4, 95, 'test중', '2025-05-14 19:47:58'),
	(116, NULL, 4, 95, 'test중', '2025-05-14 19:48:46'),
	(117, NULL, 4, 95, 'test중', '2025-05-14 19:52:01'),
	(118, NULL, 4, 95, 'test중', '2025-05-14 19:52:15'),
	(119, NULL, 4, 95, 'test중', '2025-05-14 21:47:41'),
	(120, NULL, 4, 95, 'test중', '2025-05-15 09:37:06'),
	(121, NULL, 4, 95, 'test중', '2025-05-15 09:39:16'),
	(122, NULL, 4, 95, 'test중', '2025-05-15 09:47:33'),
	(123, NULL, 4, 95, 'test중', '2025-05-15 09:50:43'),
	(124, NULL, 4, 95, 'test중', '2025-05-15 09:53:00'),
	(125, NULL, 4, 95, 'test중', '2025-05-15 10:16:59'),
	(126, NULL, 4, 95, 'test', '2025-05-15 11:11:09'),
	(127, NULL, 4, 95, 'test2', '2025-05-15 11:12:06'),
	(128, NULL, 4, 95, 'test중', '2025-05-15 11:28:00'),
	(129, NULL, 4, 95, 'test4444', '2025-05-15 12:54:19'),
	(130, NULL, 4, 95, 'test55555', '2025-05-15 13:06:07'),
	(131, NULL, 4, 95, 'test6666', '2025-05-15 13:06:38'),
	(132, NULL, 4, 95, 'test중', '2025-05-15 13:06:57'),
	(133, NULL, 4, 95, 'test중', '2025-05-15 13:07:27'),
	(134, NULL, 1, 95, '@test2', '2025-05-17 16:29:10'),
	(135, NULL, 1, 96, '@test2', '2025-05-17 16:32:39'),
	(136, NULL, 1, 95, 'test중', '2025-05-17 16:32:47'),
	(137, NULL, 1, 95, 'test중', '2025-05-17 16:33:12'),
	(138, NULL, 1, 95, 'test중', '2025-05-17 16:35:54'),
	(139, NULL, 1, 95, 'test중', '2025-05-17 16:38:01'),
	(140, NULL, 1, 95, 'test중', '2025-05-17 16:38:08'),
	(141, NULL, 1, 96, 'test', '2025-05-17 17:12:52'),
	(142, NULL, 1, 96, '@test2 zzzz', '2025-05-17 17:13:10'),
	(143, NULL, 1, 96, 'test중', '2025-05-17 17:21:18'),
	(144, NULL, 1, 96, 'ㅋㅋㅋㅋㅋㅋㅋㅋㅋ', '2025-05-17 17:21:23'),
	(145, NULL, 1, 95, 'test중', '2025-05-17 17:22:34'),
	(146, NULL, 1, 95, 'test중', '2025-05-17 17:23:16'),
	(147, NULL, 1, 95, 'test중', '2025-05-17 17:26:06'),
	(148, NULL, 1, 95, 'test', '2025-05-17 17:26:09'),
	(149, NULL, 1, 96, '@test2 zzz', '2025-05-18 12:58:43'),
	(150, NULL, 1, 96, '@test2 zzz', '2025-05-18 12:58:45'),
	(151, NULL, 1, 96, '@test2 zzz', '2025-05-18 13:01:10'),
	(152, NULL, 1, 96, '@test2 zzzz', '2025-05-18 13:03:45'),
	(153, NULL, 1, 96, '@test2 zzzz', '2025-05-18 13:09:27'),
	(154, NULL, 4, 95, 'test중', '2025-05-18 13:34:15'),
	(155, NULL, 1, 95, '@test2', '2025-05-18 13:50:19'),
	(156, NULL, 4, 95, 'test중', '2025-05-18 13:52:01'),
	(157, NULL, 4, 92, 'test', '2025-05-18 14:02:18'),
	(158, NULL, 4, 92, '@test2 ddfsdfsd', '2025-05-18 14:11:06'),
	(159, NULL, 4, 94, '@test1 dgasgsadgsdagsa', '2025-05-18 14:12:41'),
	(160, NULL, 1, 94, '@test2 gadfgdg', '2025-05-18 14:14:47'),
	(161, NULL, 4, 96, 'test중', '2025-05-18 14:15:32'),
	(162, NULL, 4, 91, '@test1', '2025-05-18 14:16:37'),
	(163, NULL, 1, 90, '@test2 됐나?', '2025-05-18 14:17:04'),
	(164, NULL, 4, 88, '@test1', '2025-05-18 14:17:28'),
	(165, NULL, 1, 90, '@test2 zzzz', '2025-05-18 14:17:42'),
	(166, NULL, 4, 87, '@test1', '2025-05-18 14:19:02'),
	(167, 106, 1, 95, '@test2 zzzzzz', '2025-05-18 14:21:58'),
	(168, NULL, 4, 87, '@test1', '2025-05-18 15:54:53'),
	(169, 168, 1, 87, '@test2 ㅇㄴㅁㄹㅇ', '2025-05-18 15:55:14'),
	(170, 168, 1, 87, '@test2  ㅎㄶㄶㅇ', '2025-05-18 15:57:14'),
	(171, NULL, 1, 96, '@test2', '2025-05-18 16:01:03'),
	(172, NULL, 4, 96, '@test1', '2025-05-18 16:01:19'),
	(173, NULL, 4, 96, 'test중', '2025-05-18 16:39:59'),
	(174, 142, 4, 96, '@test11 test', '2025-05-19 14:44:27');

-- 테이블 project.dm_conversations 구조 내보내기
CREATE TABLE IF NOT EXISTS `dm_conversations` (
  `conversation_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) DEFAULT NULL,
  `is_group` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`conversation_id`),
  KEY `idx_dm_conversations_is_group` (`is_group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.dm_conversations:~0 rows (대략적) 내보내기

-- 테이블 project.dm_messages 구조 내보내기
CREATE TABLE IF NOT EXISTS `dm_messages` (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `text` text NOT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`),
  KEY `idx_dm_messages_conversation_id` (`conversation_id`),
  KEY `idx_dm_messages_sender_id` (`sender_id`),
  CONSTRAINT `dm_messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `dm_conversations` (`conversation_id`) ON DELETE CASCADE,
  CONSTRAINT `dm_messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.dm_messages:~0 rows (대략적) 내보내기

-- 테이블 project.dm_participants 구조 내보내기
CREATE TABLE IF NOT EXISTS `dm_participants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `user_id` int NOT NULL,
  `joined_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_participant` (`conversation_id`,`user_id`),
  KEY `idx_dm_participants_user_id` (`user_id`),
  KEY `idx_dm_participants_conversation_id` (`conversation_id`),
  CONSTRAINT `dm_participants_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `dm_conversations` (`conversation_id`) ON DELETE CASCADE,
  CONSTRAINT `dm_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.dm_participants:~0 rows (대략적) 내보내기

-- 테이블 project.dm_read_status 구조 내보내기
CREATE TABLE IF NOT EXISTS `dm_read_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `message_id` int NOT NULL,
  `user_id` int NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_read` (`message_id`,`user_id`),
  KEY `idx_dm_read_status_message_id` (`message_id`),
  KEY `idx_dm_read_status_user_id` (`user_id`),
  CONSTRAINT `dm_read_status_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `dm_messages` (`message_id`) ON DELETE CASCADE,
  CONSTRAINT `dm_read_status_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.dm_read_status:~0 rows (대략적) 내보내기

-- 테이블 project.follows 구조 내보내기
CREATE TABLE IF NOT EXISTS `follows` (
  `follow_id` int NOT NULL AUTO_INCREMENT,
  `follower_id` int NOT NULL,
  `followee_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`follow_id`),
  UNIQUE KEY `uniq_follow` (`follower_id`,`followee_id`),
  KEY `followee_id` (`followee_id`),
  CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`followee_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.follows:~8 rows (대략적) 내보내기
INSERT INTO `follows` (`follow_id`, `follower_id`, `followee_id`, `created_at`) VALUES
	(2, 3, 1, '2025-05-07 11:33:53'),
	(9, 1, 8, '2025-05-08 15:08:00'),
	(11, 5, 1, '2025-05-08 15:08:00'),
	(13, 5, 6, '2025-05-08 15:08:00'),
	(14, 7, 6, '2025-05-08 15:08:00'),
	(15, 8, 7, '2025-05-08 15:08:00');

-- 테이블 project.likes 구조 내보내기
CREATE TABLE IF NOT EXISTS `likes` (
  `like_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `post_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`like_id`),
  UNIQUE KEY `uniq_user_post` (`user_id`,`post_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=232 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.likes:~24 rows (대략적) 내보내기
INSERT INTO `likes` (`like_id`, `user_id`, `post_id`, `created_at`) VALUES
	(1, 2, 1, '2025-05-07 11:33:53'),
	(2, 3, 1, '2025-05-07 11:33:53'),
	(3, 1, 2, '2025-05-07 11:33:53'),
	(4, 2, 3, '2025-05-07 11:33:53'),
	(5, 1, 4, '2025-05-07 11:33:53'),
	(53, 1, 15, '2025-05-08 15:08:00'),
	(54, 1, 16, '2025-05-08 15:08:00'),
	(55, 4, 4, '2025-05-08 15:08:00'),
	(56, 5, 15, '2025-05-08 15:08:00'),
	(57, 6, 1, '2025-05-08 15:08:00'),
	(58, 7, 17, '2025-05-08 15:08:00'),
	(142, 1, 1, '2025-05-13 15:37:34'),
	(145, 1, 91, '2025-05-13 16:47:12'),
	(147, 1, 90, '2025-05-13 17:01:02'),
	(150, 1, 94, '2025-05-13 17:13:20'),
	(151, 1, 93, '2025-05-13 17:17:56'),
	(153, 1, 86, '2025-05-13 18:35:27'),
	(154, 1, 3, '2025-05-14 15:25:22'),
	(206, 1, 95, '2025-05-17 15:05:53'),
	(213, 1, 96, '2025-05-18 16:06:40'),
	(226, 4, 85, '2025-05-18 16:26:34'),
	(229, 4, 96, '2025-05-18 16:32:01'),
	(230, 4, 95, '2025-05-18 16:32:14'),
	(231, 4, 94, '2025-05-19 14:22:10');

-- 테이블 project.notifications 구조 내보내기
CREATE TABLE IF NOT EXISTS `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `target_user_id` int NOT NULL,
  `from_user_id` int NOT NULL,
  `post_id` int DEFAULT NULL,
  `extra` json DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `type` enum('like','comment','mention','follow','follow-request','follow-reject') DEFAULT NULL,
  PRIMARY KEY (`notification_id`),
  KEY `target_user_id` (`target_user_id`),
  KEY `from_user_id` (`from_user_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`target_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=138 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.notifications:~19 rows (대략적) 내보내기
INSERT INTO `notifications` (`notification_id`, `target_user_id`, `from_user_id`, `post_id`, `extra`, `is_read`, `created_at`, `type`) VALUES
	(22, 1, 4, 95, '{"text": "dddd", "file_url": "http://localhost:3005/uploads/1747207369597-ì¼ê²¹ì´.jpg"}', 1, '2025-05-14 21:47:41', 'comment'),
	(29, 1, 4, 95, '{"text": "test2", "file_url": "http://localhost:3005/uploads/1747207369597-ì¼ê²¹ì´.jpg"}', 1, '2025-05-15 11:12:06', 'comment'),
	(30, 1, 4, 95, '{"text": "dddd", "file_url": "http://localhost:3005/uploads/1747207369597-ì¼ê²¹ì´.jpg"}', 1, '2025-05-15 11:28:00', 'comment'),
	(57, 1, 4, 95, '{"text": "test55555", "file_url": "http://localhost:3005/uploads/1747207369597-ì¼ê²¹ì´.jpg"}', 1, '2025-05-15 13:06:07', 'comment'),
	(58, 1, 4, 95, '{"text": "test6666", "file_url": "http://localhost:3005/uploads/1747207369597-ì¼ê²¹ì´.jpg"}', 1, '2025-05-15 13:06:38', 'comment'),
	(59, 1, 4, 95, '{"text": "tqfa", "file_url": "http://localhost:3005/uploads/1747207369597-ì¼ê²¹ì´.jpg"}', 1, '2025-05-15 13:06:57', 'comment'),
	(63, 1, 4, 95, '{"text": "tttttqfa", "file_url": "http://localhost:3005/uploads/1747207369597-ì¼ê²¹ì´.jpg"}', 1, '2025-05-15 13:07:27', 'comment'),
	(90, 1, 4, 95, '{"text": "qqqqqq", "file_url": "http://localhost:3005/uploads/1747207369597-ì¼ê²¹ì´.jpg"}', 1, '2025-05-18 13:34:15', 'comment'),
	(95, 1, 4, 96, '{"text": "eeee", "file_url": "http://localhost:3005/uploads/1747467094486-íë¡í.png"}', 1, '2025-05-18 14:15:32', 'comment'),
	(101, 4, 1, 90, '{"text": "@test2 zzzz"}', 1, '2025-05-18 14:17:42', 'mention'),
	(104, 4, 1, 95, '{"text": "@test2 zzzzzz"}', 1, '2025-05-18 14:21:58', 'mention'),
	(109, 4, 1, 96, '{"text": "@test2"}', 1, '2025-05-18 16:01:03', 'mention'),
	(125, 1, 4, 85, '{}', 1, '2025-05-18 16:26:34', 'like'),
	(128, 1, 4, 96, '{}', 1, '2025-05-18 16:32:01', 'like'),
	(129, 1, 4, 95, '{}', 1, '2025-05-18 16:32:14', 'like'),
	(130, 1, 4, 96, '{"text": "zzzz", "file_url": "http://localhost:3005/uploads/1747467094486-íë¡í.png"}', 1, '2025-05-18 16:39:59', 'comment'),
	(135, 1, 4, NULL, '{}', 1, '2025-05-19 14:42:42', 'follow-request'),
	(137, 1, 4, 96, '{"text": "@test11 test", "file_url": "http://localhost:3005/uploads/1747467094486-íë¡í.png"}', 1, '2025-05-19 14:44:27', 'mention');

-- 테이블 project.posts 구조 내보내기
CREATE TABLE IF NOT EXISTS `posts` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `caption` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.posts:~22 rows (대략적) 내보내기
INSERT INTO `posts` (`post_id`, `user_id`, `caption`, `created_at`) VALUES
	(1, 1, '오늘 날씨가 너무 좋아요 ☀️', '2025-05-07 11:33:53'),
	(2, 2, '뉴욕에서 찍은 풍경 #travel', '2025-05-07 11:33:53'),
	(3, 1, '고양이랑 놀기 🐱', '2025-05-07 11:33:53'),
	(4, 3, '코딩 중에 커피 한 잔 ☕️', '2025-05-07 11:33:53'),
	(13, 4, '개발하다가 머리 식히는 중', '2025-05-08 15:02:11'),
	(14, 4, '점심 뭐 먹을까요? 🍱', '2025-05-08 15:02:11'),
	(15, 5, '책장 정리하다가 추억에 빠짐 📚', '2025-05-08 15:02:11'),
	(16, 5, '카페에서 공부하는 중 ☕️', '2025-05-08 15:02:11'),
	(17, 6, '오늘 저녁은 샐러드!', '2025-05-08 15:02:11'),
	(18, 6, '집에서 찍은 노을 🌇', '2025-05-08 15:02:11'),
	(19, 7, '밤하늘 보면서 산책 중', '2025-05-08 15:02:11'),
	(20, 8, '헬스장에서 운동 완료 ✅', '2025-05-08 15:02:11'),
	(85, 1, 'test', '2025-05-10 17:32:02'),
	(86, 1, 'test1', '2025-05-11 14:04:12'),
	(87, 1, 'test2', '2025-05-11 14:06:02'),
	(88, 1, 'ㅋㅋㅋㅋ', '2025-05-11 14:07:46'),
	(89, 1, 'ㅎㅎㅎㅎ', '2025-05-11 14:08:07'),
	(90, 1, 'test중', '2025-05-11 14:16:13'),
	(91, 1, 'ㅎㅎㅎㅎㅎㅎ', '2025-05-11 14:16:38'),
	(92, 1, '테스트', '2025-05-11 14:18:38'),
	(93, 1, '샘플', '2025-05-11 14:53:05'),
	(94, 1, '테스트', '2025-05-12 17:29:18'),
	(95, 1, '김춘삼은 소문난 롤체고수임😂', '2025-05-14 16:22:49'),
	(96, 1, '재밌네', '2025-05-17 16:31:34');

-- 테이블 project.post_images_backup 구조 내보내기
CREATE TABLE IF NOT EXISTS `post_images_backup` (
  `image_id` int NOT NULL DEFAULT '0',
  `post_id` int NOT NULL,
  `image_url` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.post_images_backup:~16 rows (대략적) 내보내기
INSERT INTO `post_images_backup` (`image_id`, `post_id`, `image_url`) VALUES
	(1, 1, 'http://localhost:3005/uploads/login-background.jpg'),
	(2, 2, 'http://localhost:3005/uploads/login-background.jpg'),
	(3, 3, 'http://localhost:3005/uploads/login-background.jpg'),
	(4, 4, 'http://localhost:3005/uploads/login-background.jpg'),
	(5, 13, 'http://localhost:3005/uploads/login-background.jpg'),
	(6, 14, 'http://localhost:3005/uploads/login-background.jpg'),
	(7, 15, 'http://localhost:3005/uploads/login-background.jpg'),
	(8, 16, 'http://localhost:3005/uploads/login-background.jpg'),
	(9, 17, 'http://localhost:3005/uploads/login-background.jpg'),
	(10, 18, 'http://localhost:3005/uploads/login-background.jpg'),
	(11, 19, 'http://localhost:3005/uploads/login-background.jpg'),
	(12, 20, 'http://localhost:3005/uploads/login-background.jpg'),
	(13, 1, 'http://localhost:3005/uploads/login-background.jpg'),
	(14, 13, 'http://localhost:3005/uploads/login-background.jpg'),
	(15, 13, 'http://localhost:3005/uploads/login-background.jpg'),
	(16, 13, 'http://localhost:3005/uploads/login-background.jpg');

-- 테이블 project.post_media 구조 내보내기
CREATE TABLE IF NOT EXISTS `post_media` (
  `media_id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `file_url` varchar(255) NOT NULL,
  `media_type` enum('image','video') NOT NULL DEFAULT 'image',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`media_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `post_media_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.post_media:~43 rows (대략적) 내보내기
INSERT INTO `post_media` (`media_id`, `post_id`, `file_url`, `media_type`, `created_at`) VALUES
	(1, 1, 'http://localhost:3005/uploads/login-background.jpg', 'image', '2025-05-10 16:39:07'),
	(2, 2, 'http://localhost:3005/uploads/login-background.jpg', 'image', '2025-05-10 16:39:07'),
	(3, 3, 'http://localhost:3005/uploads/login-background.jpg', 'image', '2025-05-10 16:39:07'),
	(4, 4, 'http://localhost:3005/uploads/login-background.jpg', 'image', '2025-05-10 16:39:07'),
	(5, 13, 'http://localhost:3005/uploads/login-background.jpg', 'image', '2025-05-10 16:39:07'),
	(6, 14, 'http://localhost:3005/uploads/login-background.jpg', 'image', '2025-05-10 16:39:07'),
	(7, 15, 'http://localhost:3005/uploads/login-background.jpg', 'image', '2025-05-10 16:39:07'),
	(8, 16, 'http://localhost:3005/uploads/login-background.jpg', 'image', '2025-05-10 16:39:07'),
	(9, 17, 'http://localhost:3005/uploads/login-background.jpg', 'image', '2025-05-10 16:39:07'),
	(10, 18, 'http://localhost:3005/uploads/login-background.jpg', 'image', '2025-05-10 16:39:07'),
	(11, 19, 'http://localhost:3005/uploads/login-background.jpg', 'image', '2025-05-10 16:39:07'),
	(12, 20, 'http://localhost:3005/uploads/login-background.jpg', 'image', '2025-05-10 16:39:07'),
	(13, 1, 'http://localhost:3005/uploads/login-background.jpg', 'image', '2025-05-10 16:39:07'),
	(14, 13, 'http://localhost:3005/uploads/login-background.jpg', 'image', '2025-05-10 16:39:07'),
	(15, 13, 'http://localhost:3005/uploads/login-background.jpg', 'image', '2025-05-10 16:39:07'),
	(16, 13, 'http://localhost:3005/uploads/login-background.jpg', 'image', '2025-05-10 16:39:07'),
	(32, 85, 'http://localhost:3005/uploads/1746865922616-ì¼ê²¹ì´.jpg', 'image', '2025-05-10 17:32:02'),
	(33, 85, 'http://localhost:3005/uploads/1746865922618-ì¼ê²¹ì´2.jpg', 'image', '2025-05-10 17:32:02'),
	(34, 85, 'http://localhost:3005/uploads/1746865922618-ì¼ê²¹ì´3.jpg', 'image', '2025-05-10 17:32:02'),
	(35, 85, 'http://localhost:3005/uploads/1746865922619-ìê³ ê¸°.jpg', 'image', '2025-05-10 17:32:02'),
	(36, 85, 'http://localhost:3005/uploads/1746865922619-ìê³ ê¸°2.jpg', 'image', '2025-05-10 17:32:02'),
	(37, 85, 'http://localhost:3005/uploads/1746865922619-ìê³ ê¸°3.jpg', 'image', '2025-05-10 17:32:02'),
	(38, 86, 'http://localhost:3005/uploads/1746939852866-test1.mp4', 'video', '2025-05-11 14:04:12'),
	(39, 86, 'http://localhost:3005/uploads/1746939852877-ì¼ê²¹ì´.jpg', 'image', '2025-05-11 14:04:12'),
	(40, 86, 'http://localhost:3005/uploads/1746939852877-ì¼ê²¹ì´2.jpg', 'image', '2025-05-11 14:04:12'),
	(41, 87, 'http://localhost:3005/uploads/1746939962350-test1.mp4', 'video', '2025-05-11 14:06:02'),
	(42, 87, 'http://localhost:3005/uploads/1746939962358-ì¼ê²¹ì´.jpg', 'image', '2025-05-11 14:06:02'),
	(43, 87, 'http://localhost:3005/uploads/1746939962359-ì¼ê²¹ì´2.jpg', 'image', '2025-05-11 14:06:02'),
	(44, 88, 'http://localhost:3005/uploads/1746940066470-ì¼ê²¹ì´.jpg', 'image', '2025-05-11 14:07:46'),
	(45, 88, 'http://localhost:3005/uploads/1746940066471-ì¼ê²¹ì´2.jpg', 'image', '2025-05-11 14:07:46'),
	(46, 88, 'http://localhost:3005/uploads/1746940066471-ì¼ê²¹ì´3.jpg', 'image', '2025-05-11 14:07:46'),
	(47, 89, 'http://localhost:3005/uploads/1746940087533-ì¼ê²¹ì´.jpg', 'image', '2025-05-11 14:08:07'),
	(48, 89, 'http://localhost:3005/uploads/1746940087533-ì¼ê²¹ì´2.jpg', 'image', '2025-05-11 14:08:07'),
	(49, 89, 'http://localhost:3005/uploads/1746940087533-ì¼ê²¹ì´3.jpg', 'image', '2025-05-11 14:08:07'),
	(50, 90, 'http://localhost:3005/uploads/1746940573733-ìê³ ê¸°.jpg', 'image', '2025-05-11 14:16:13'),
	(51, 90, 'http://localhost:3005/uploads/1746940573733-ìê³ ê¸°2.jpg', 'image', '2025-05-11 14:16:13'),
	(52, 90, 'http://localhost:3005/uploads/1746940573733-ìê³ ê¸°3.jpg', 'image', '2025-05-11 14:16:13'),
	(53, 91, 'http://localhost:3005/uploads/1746940598430-ìê³ ê¸°2.jpg', 'image', '2025-05-11 14:16:38'),
	(54, 91, 'http://localhost:3005/uploads/1746940598430-ìê³ ê¸°3.jpg', 'image', '2025-05-11 14:16:38'),
	(55, 92, 'http://localhost:3005/uploads/1746940718365-ì¼ê²¹ì´2.jpg', 'image', '2025-05-11 14:18:38'),
	(56, 93, 'http://localhost:3005/uploads/1746942785526-test1.mp4', 'video', '2025-05-11 14:53:05'),
	(57, 93, 'http://localhost:3005/uploads/1746942785536-ì¼ê²¹ì´3.jpg', 'image', '2025-05-11 14:53:05'),
	(58, 93, 'http://localhost:3005/uploads/1746942785536-ìê³ ê¸°3.jpg', 'image', '2025-05-11 14:53:05'),
	(59, 94, 'http://localhost:3005/uploads/1747038557999-ê²ìì°½ ìë«í.mp4', 'video', '2025-05-12 17:29:18'),
	(60, 94, 'http://localhost:3005/uploads/1747038558008-ì¼ê²¹ì´2.jpg', 'image', '2025-05-12 17:29:18'),
	(61, 94, 'http://localhost:3005/uploads/1747038558008-Instagram - íë¡í 1 - Microsoftâ Edge 2025-05-11 16-47-02.mp4', 'video', '2025-05-12 17:29:18'),
	(62, 94, 'http://localhost:3005/uploads/1747038558015-ì¼ê²¹ì´3.jpg', 'image', '2025-05-12 17:29:18'),
	(63, 95, 'http://localhost:3005/uploads/1747207369597-ì¼ê²¹ì´.jpg', 'image', '2025-05-14 16:22:49'),
	(64, 96, 'http://localhost:3005/uploads/1747467094486-íë¡í.png', 'image', '2025-05-17 16:31:34');

-- 테이블 project.users 구조 내보내기
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `profile_image` varchar(500) DEFAULT NULL,
  `bio` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `full_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 project.users:~9 rows (대략적) 내보내기
INSERT INTO `users` (`user_id`, `email`, `password`, `username`, `profile_image`, `bio`, `created_at`, `full_name`) VALUES
	(1, 'test', '$2b$10$eQpfDVeRb6PbRYp6xnysX.0K2lyOfTT98rlVytOYOZKuTmbU6N.de', 'test11', 'http://localhost:3005/uploads/1747462656643-íë¡í.png', '안녕하세요! test입니다.', '2025-05-07 11:33:53', 'test'),
	(2, 'test3', '$2b$10$ctwbTDcIGfL9SzhA1mbZ2uLpZiu0iYyTLa85r4.cJj173RMhEGFuK', 'test3', 'http://localhost:3005/uploads/default_profile.png', 'Travel & photography 📷', '2025-05-07 11:33:53', 'test'),
	(3, 'carol@example.com', '$2b$10$ctwbTDcIGfL9SzhA1mbZ2uLpZiu0iYyTLa85r4.cJj173RMhEGFuK', 'carol', 'http://localhost:3005/uploads/default_profile.png', '개발하는 Carol 💻', '2025-05-07 11:33:53', 'test'),
	(4, 'test2', '$2b$10$ctwbTDcIGfL9SzhA1mbZ2uLpZiu0iYyTLa85r4.cJj173RMhEGFuK', 'test2', 'http://localhost:3005/uploads/default_profile.png', 'test', '2025-05-08 15:00:57', 'test'),
	(5, 'dave@example.com', '$2b$10$ctwbTDcIGfL9SzhA1mbZ2uLpZiu0iYyTLa85r4.cJj173RMhEGFuK', 'dave', 'http://localhost:3005/uploads/default_profile.png', '자전거 여행가 🚴', '2025-05-08 14:53:15', 'Dave Park'),
	(6, 'emma@example.com', '$2b$10$ctwbTDcIGfL9SzhA1mbZ2uLpZiu0iYyTLa85r4.cJj173RMhEGFuK', 'emma', 'http://localhost:3005/uploads/default_profile.png', '책과 커피를 좋아하는 사람', '2025-05-08 14:53:15', 'Emma Choi'),
	(7, 'frank@example.com', '$2b$10$ctwbTDcIGfL9SzhA1mbZ2uLpZiu0iYyTLa85r4.cJj173RMhEGFuK', 'frank', 'http://localhost:3005/uploads/default_profile.png', '소소한 일상 공유', '2025-05-08 14:53:15', 'Frank Kim'),
	(8, 'grace@example.com', '$2b$10$ctwbTDcIGfL9SzhA1mbZ2uLpZiu0iYyTLa85r4.cJj173RMhEGFuK', 'grace', 'http://localhost:3005/uploads/default_profile.png', '밤하늘을 좋아하는 사람 🌌', '2025-05-08 14:53:15', 'Grace Lee'),
	(9, 'henry@example.com', '$2b$10$ctwbTDcIGfL9SzhA1mbZ2uLpZiu0iYyTLa85r4.cJj173RMhEGFuK', 'henry', 'http://localhost:3005/uploads/default_profile.png', '운동 매니아 💪', '2025-05-08 14:53:15', 'Henry Jung');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
