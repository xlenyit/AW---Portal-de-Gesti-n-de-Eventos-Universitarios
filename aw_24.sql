-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 17, 2024 at 06:22 PM
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
-- Database: `aw_24`
--
CREATE DATABASE IF NOT EXISTS `aw_24` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `aw_24`;

-- --------------------------------------------------------

--
-- Table structure for table `configuraciones_accesibilidad`
--

CREATE TABLE `configuraciones_accesibilidad` (
  `id` int(11) NOT NULL,
  `paleta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`paleta`)),
  `tamanyo_texto` int(11) NOT NULL,
  `configuracion_navegacion` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`configuracion_navegacion`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `configuraciones_accesibilidad`
--

INSERT INTO `configuraciones_accesibilidad` (`id`, `paleta`, `tamanyo_texto`, `configuracion_navegacion`) VALUES
(1, '123', 12, '123');

-- --------------------------------------------------------

--
-- Table structure for table `eventos`
--

CREATE TABLE `eventos` (
  `id` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `descripcion` varchar(1000) NOT NULL,
  `precio` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `ubicacion` varchar(200) NOT NULL,
  `capacidad_maxima` int(11) NOT NULL,
  `id_organizador` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `eventos`
--

INSERT INTO `eventos` (`id`, `titulo`, `descripcion`, `precio`, `fecha`, `hora`, `ubicacion`, `capacidad_maxima`, `id_organizador`) VALUES
(1, 'Evento', 'Eventual Eventoso Evento', 200, '2022-08-22', '17:51:55', 'Los Madriles', 1000, 1);

-- --------------------------------------------------------

--
-- Table structure for table `facultades`
--

CREATE TABLE `facultades` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `facultades`
--

INSERT INTO `facultades` (`id`, `nombre`) VALUES
(1, 'Facultad de Informática'),
(2, 'Facultad de Derecho'),
(3, 'Facultad de Ciencias de la Información');

-- --------------------------------------------------------

--
-- Table structure for table `inscripciones`
--

CREATE TABLE `inscripciones` (
  `id_usuario` int(11) NOT NULL,
  `id_evento` int(11) NOT NULL,
  `esta_lista_espera` tinyint(1) DEFAULT NULL,
  `fecha_inscripcion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `correo` varchar(50) NOT NULL,
  `telefono` int(11) NOT NULL,
  `es_organizador` tinyint(1) NOT NULL,
  `id_facultad` int(11) NOT NULL,
  `id_accesibilidad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `correo`, `telefono`, `es_organizador`, `id_facultad`, `id_accesibilidad`) VALUES
(1, 'Joaquin', 'joaco@gmail.com', 666666777, 1, 1, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `configuraciones_accesibilidad`
--
ALTER TABLE `configuraciones_accesibilidad`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `eventos`
--
ALTER TABLE `eventos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_idOrganizadorEvento` (`id_organizador`);

--
-- Indexes for table `facultades`
--
ALTER TABLE `facultades`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `inscripciones`
--
ALTER TABLE `inscripciones`
  ADD PRIMARY KEY (`id_usuario`,`id_evento`),
  ADD KEY `FK_idEvento` (`id_evento`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_idFacultad` (`id_facultad`),
  ADD KEY `FK_idAccesibilidad` (`id_accesibilidad`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `configuraciones_accesibilidad`
--
ALTER TABLE `configuraciones_accesibilidad`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `eventos`
--
ALTER TABLE `eventos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `facultades`
--
ALTER TABLE `facultades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `eventos`
--
ALTER TABLE `eventos`
  ADD CONSTRAINT `FK_idOrganizadorEvento` FOREIGN KEY (`id_organizador`) REFERENCES `usuarios` (`id`);

--
-- Constraints for table `inscripciones`
--
ALTER TABLE `inscripciones`
  ADD CONSTRAINT `FK_idEvento` FOREIGN KEY (`id_evento`) REFERENCES `eventos` (`id`),
  ADD CONSTRAINT `FK_idOrganizador` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`);

--
-- Constraints for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `FK_idAccesibilidad` FOREIGN KEY (`id_accesibilidad`) REFERENCES `configuraciones_accesibilidad` (`id`),
  ADD CONSTRAINT `FK_idFacultad` FOREIGN KEY (`id_facultad`) REFERENCES `facultades` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
