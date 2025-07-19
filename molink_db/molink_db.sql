-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 19, 2025 at 09:07 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `molink_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `bunker`
--

CREATE TABLE `bunker` (
  `username` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bunker`
--

INSERT INTO `bunker` (`username`, `email`, `password`) VALUES
('Jason', 'karavan@gmail.com', '$2a$10$ALmQ4S0Z1xwmX7FurYA8ou4QMgsWS1tOGBjUna5Pxej.pAHccOb.e'),
('Mike Wazouski', '', '$2a$10$qPAtcC7imyCp.IdW3m.rkO9ocTRAUmzxwHz4hNjiHh8MDIC836AYO'),
('Qwerty', '', '$2a$10$Zy9Df04j5uLXcOqaLdXR8.3uN.1kqEeEe6ufyRyizQH7cW73ev8Qa'),
('Yoda Sulivan', '', '$2a$10$Fu1M.FBJh9RRu.JyOwgx6uDB5GyExFNZtqhB2BZ8CVtDU57RvJaVy');

-- --------------------------------------------------------

--
-- Table structure for table `folder`
--

CREATE TABLE `folder` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `vault_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `folder`
--

INSERT INTO `folder` (`id`, `name`, `password`, `vault_id`) VALUES
('9fdfe7db-e88c-48dd-935c-4e0867a634dd', 'Link Tutorial Coding', NULL, '209b66a6-41bd-4454-a233-035012b7ae0a'),
('a36099c7-88df-4247-b938-e27bc495ebeb', 'Nasi Goreng', NULL, '9afb1c6b-8a02-4ce6-8db1-4a2fe608d43f'),
('c9e3405f-5840-43fe-8d46-c84c913fda30', 'Format Surat HMP 2025', NULL, '209b66a6-41bd-4454-a233-035012b7ae0a'),
('ea13a0c8-70ee-4158-be9d-d4df21f51a56', 'Teplate Surat', NULL, '175dd02b-a6b9-49d8-a4b0-3db7da950426'),
('eb89876a-5473-4028-af33-dfb7760be15c', 'Materi Bahasa Pemrograman', NULL, '209b66a6-41bd-4454-a233-035012b7ae0a');

-- --------------------------------------------------------

--
-- Table structure for table `memo`
--

CREATE TABLE `memo` (
  `id` varchar(50) NOT NULL,
  `judul` varchar(150) NOT NULL,
  `deskripsi` text,
  `link` varchar(2048) NOT NULL,
  `icon_name` varchar(100) DEFAULT NULL,
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `folder_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `memo`
--

INSERT INTO `memo` (`id`, `judul`, `deskripsi`, `link`, `icon_name`, `date`, `folder_id`) VALUES
('093522aa-fd2a-4547-b509-27cc0dda26c7', 'Template Rapat 1', 'Template Untuk HMP SI', 'https://docs.google.com/document/d/15orvwq2q7Y2SgFJpbXV77jO4LcoSEx6L/edit', 'description', '2025-07-17 07:48:37', 'c9e3405f-5840-43fe-8d46-c84c913fda30'),
('14df1884-fb5c-4679-b922-5104e723fa03', 'C Course', 'BAB 1 sampai 3', 'https://www.youtube.com/watch?v=hOyn0bCydZo', 'link', '2025-07-17 07:57:16', '9fdfe7db-e88c-48dd-935c-4e0867a634dd'),
('41e6a958-1c6f-4801-916b-921307bdc4a9', 'Sambal Matah', 'Wenak Sedapp', 'https://www.youtube.com/watch?v=hOyn0bCydZo', 'link', '2025-07-16 06:42:41', 'a36099c7-88df-4247-b938-e27bc495ebeb'),
('4742816d-ba03-4df6-b6e2-46750d47a62a', 'Template Dana', 'HMP SI 2025', 'https://maps.app.goo.gl/rMj2ohEuC6K7PbPDA', 'description', '2025-07-17 07:54:15', 'c9e3405f-5840-43fe-8d46-c84c913fda30'),
('5349e7bb-b955-4cef-ba9d-a26439381ce3', 'Coba 1', 'Coba Aja', 'https://docs.google.com/document/d/15orvwq2q7Y2SgFJpbXV77jO4LcoSEx6L/edit', 'description', '2025-07-18 02:19:51', '9fdfe7db-e88c-48dd-935c-4e0867a634dd'),
('7aa8ca6b-76f8-4489-891d-626d4f82f853', 'Hashing', 'unkownn', 'https://www.youtube.com/watch?v=hOyn0bCydZo', 'videocam', '2025-07-17 07:57:59', 'eb89876a-5473-4028-af33-dfb7760be15c'),
('7cc7dc7a-feaf-4c49-a83f-afdc494b34df', 'Template Izin', 'HMP Si 2025', 'https://www.youtube.com/watch?v=hOyn0bCydZo', 'description', '2025-07-17 07:54:01', 'c9e3405f-5840-43fe-8d46-c84c913fda30'),
('7d5bbcf7-2754-4756-a56a-457e1f10a6dd', 'PHP Dalam 1 Jam', 'YA 1 jam aja', 'https://www.youtube.com/watch?v=hOyn0bCydZo', 'link', '2025-07-17 07:57:37', '9fdfe7db-e88c-48dd-935c-4e0867a634dd'),
('8f8a2d0c-8dbc-46de-8f66-9c801fc9ae45', 'Template SKP', 'HMP SI 2025', 'https://www.youtube.com/watch?v=hOyn0bCydZo', 'description', '2025-07-17 07:53:38', 'c9e3405f-5840-43fe-8d46-c84c913fda30'),
('aaf1717a-4552-4fe6-8442-0dc85bb6e3a1', 'Template SKP', 'Untuk HMP', 'https://docs.google.com/document/d/15orvwq2q7Y2SgFJpbXV77jO4LcoSEx6L/edit', 'description', '2025-07-18 02:16:40', 'ea13a0c8-70ee-4158-be9d-d4df21f51a56'),
('df51d0a5-94ab-4b25-b8a7-1f28e213685d', 'Nirwana', 'aaa', 'https://maps.app.goo.gl/rMj2ohEuC6K7PbPDA', 'videocam', '2025-07-16 07:09:58', 'a36099c7-88df-4247-b938-e27bc495ebeb');

-- --------------------------------------------------------

--
-- Table structure for table `vault`
--

CREATE TABLE `vault` (
  `id` varchar(50) NOT NULL,
  `namavault` varchar(50) NOT NULL,
  `bunker_username` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `vault`
--

INSERT INTO `vault` (`id`, `namavault`, `bunker_username`) VALUES
('175dd02b-a6b9-49d8-a4b0-3db7da950426', 'Qwerty\'s Vault', 'Qwerty'),
('209b66a6-41bd-4454-a233-035012b7ae0a', 'Yoda Sulivan\'s Vault', 'Yoda Sulivan'),
('9afb1c6b-8a02-4ce6-8db1-4a2fe608d43f', 'Mike Wazouski\'s Vault', 'Mike Wazouski'),
('e612c46d-6f0f-4ca8-831d-59bb8974e237', 'Jason\'s Vault', 'Jason');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bunker`
--
ALTER TABLE `bunker`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `folder`
--
ALTER TABLE `folder`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vault_id` (`vault_id`);

--
-- Indexes for table `memo`
--
ALTER TABLE `memo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `folder_id` (`folder_id`);

--
-- Indexes for table `vault`
--
ALTER TABLE `vault`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bunker_username` (`bunker_username`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `folder`
--
ALTER TABLE `folder`
  ADD CONSTRAINT `folder_ibfk_1` FOREIGN KEY (`vault_id`) REFERENCES `vault` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `memo`
--
ALTER TABLE `memo`
  ADD CONSTRAINT `memo_ibfk_1` FOREIGN KEY (`folder_id`) REFERENCES `folder` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `vault`
--
ALTER TABLE `vault`
  ADD CONSTRAINT `vault_ibfk_1` FOREIGN KEY (`bunker_username`) REFERENCES `bunker` (`username`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
