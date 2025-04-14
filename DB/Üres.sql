-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: localhost:3307:3307
-- Létrehozás ideje: 2025. Már 16. 19:41
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `parfumvilag`
--
CREATE DATABASE IF NOT EXISTS `parfumvilag` DEFAULT CHARACTER SET utf8 COLLATE utf8_hungarian_ci;
USE `parfumvilag`;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `brands`
--

CREATE TABLE `brands` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;


-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `notes`
--

CREATE TABLE `notes` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('top','heart','base') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `perfumes`
--

CREATE TABLE `perfumes` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `brand_id` int(11) NOT NULL,
  `gender` enum('male','female','unisex') DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(2083) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `perfume_notes`
--

CREATE TABLE `perfume_notes` (
  `id` int(11) NOT NULL,
  `perfume_id` int(11) NOT NULL,
  `note_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `perfume_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `scent_trail_rating` int(11) NOT NULL CHECK (`scent_trail_rating` between 1 and 5),
  `longevity_rating` int(11) NOT NULL CHECK (`longevity_rating` between 1 and 5),
  `value_rating` int(11) NOT NULL CHECK (`value_rating` between 1 and 5),
  `overall_impression` int(11) NOT NULL CHECK (`overall_impression` between 1 and 5),
  `review_text` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `saved_perfumes`
--

CREATE TABLE `saved_perfumes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `perfume_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `stores`
--

CREATE TABLE `stores` (
  `id` int(11) NOT NULL,
  `perfume_id` int(11) NOT NULL,
  `store_name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `url` varchar(2083) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `profile_picture_url` varchar(2083) DEFAULT NULL,
  `is_admin` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `profile_picture_url`, `is_admin`, `created_at`) VALUES
(1, 'Kero4', 'kermar709@hengersor.hu', '$2a$10$GDbIBb45PN04EiLprk1UyOPe2bqWTn0.IL2mFGuHJZl.wU73LliNK', NULL, NULL, 0, '2025-03-05 11:06:06');

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- A tábla indexei `notes`
--
ALTER TABLE `notes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- A tábla indexei `perfumes`
--
ALTER TABLE `perfumes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `brand_id` (`brand_id`);

--
-- A tábla indexei `perfume_notes`
--
ALTER TABLE `perfume_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `perfume_id` (`perfume_id`),
  ADD KEY `note_id` (`note_id`);

--
-- A tábla indexei `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `perfume_id` (`perfume_id`),
  ADD KEY `user_id` (`user_id`);

--
-- A tábla indexei `saved_perfumes`
--
ALTER TABLE `saved_perfumes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `perfume_id` (`perfume_id`);

--
-- A tábla indexei `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `perfume_id` (`perfume_id`);

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `brands`
--
ALTER TABLE `brands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT a táblához `notes`
--
ALTER TABLE `notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT a táblához `perfumes`
--
ALTER TABLE `perfumes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT a táblához `perfume_notes`
--
ALTER TABLE `perfume_notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `saved_perfumes`
--
ALTER TABLE `saved_perfumes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `stores`
--
ALTER TABLE `stores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `perfumes`
--
ALTER TABLE `perfumes`
  ADD CONSTRAINT `perfumes_ibfk_1` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`);

--
-- Megkötések a táblához `perfume_notes`
--
ALTER TABLE `perfume_notes`
  ADD CONSTRAINT `perfume_notes_ibfk_1` FOREIGN KEY (`perfume_id`) REFERENCES `perfumes` (`id`),
  ADD CONSTRAINT `perfume_notes_ibfk_2` FOREIGN KEY (`note_id`) REFERENCES `notes` (`id`);

--
-- Megkötések a táblához `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`perfume_id`) REFERENCES `perfumes` (`id`),
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Megkötések a táblához `saved_perfumes`
--
ALTER TABLE `saved_perfumes`
  ADD CONSTRAINT `saved_perfumes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `saved_perfumes_ibfk_2` FOREIGN KEY (`perfume_id`) REFERENCES `perfumes` (`id`);

--
-- Megkötések a táblához `stores`
--
ALTER TABLE `stores`
  ADD CONSTRAINT `stores_ibfk_1` FOREIGN KEY (`perfume_id`) REFERENCES `perfumes` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
