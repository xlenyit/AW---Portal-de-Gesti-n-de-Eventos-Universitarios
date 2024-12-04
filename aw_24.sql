-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 01-12-2024 a las 22:12:23
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `aw_24`
--
CREATE DATABASE IF NOT EXISTS `aw_24` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `aw_24`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `blacklist`
--

CREATE TABLE `blacklist` (
  `id` int(11) NOT NULL,
  `IP` varchar(16) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`) VALUES
(1, 'Musical');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuraciones_accesibilidad`
--

CREATE TABLE `configuraciones_accesibilidad` (
  `id` int(11) NOT NULL,
  `paleta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin CHECK (json_valid(`paleta`)),
  `tamanyo_texto` int(11),
  `configuracion_navegacion` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin CHECK (json_valid(`configuracion_navegacion`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `configuraciones_accesibilidad`
--

INSERT INTO `configuraciones_accesibilidad` (`id`, `paleta`, `tamanyo_texto`, `configuracion_navegacion`) VALUES
(1, '123', 12, '123');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `eventos`
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
  `id_organizador` int(11) NOT NULL,
  `id_categoria` int(11) NOT NULL,
  `foto` VARCHAR(45)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `eventos`
--

INSERT INTO `eventos` (`id`, `titulo`, `descripcion`, `precio`, `fecha`, `hora`, `ubicacion`, `capacidad_maxima`, `id_organizador`, `id_categoria`) VALUES
(1, 'Event', 'Eventual Eventoso Evento', 200, '2024-12-16', '17:51:55', 'Los Madriles', 100, 9, 1),
(2, 'Segundo', 'Juju', 500, '2024-11-06', '12:37:53', 'Los Mandriles', 10, 9, 1),
(3, 'Patinaje', 'Patinar por el retiro uwu', 2, '2024-11-06', '23:51:36', 'aqui', 3, 9, 1),
(4, 'Fun', 'aqa', 1, '2024-11-22', '17:06:00', 'alla', 2, 9, 1),
(5, 'Fun', 'qw', 1, '2024-11-24', '17:09:00', '1', 1, 9, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facultades`
--

CREATE TABLE `facultades` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `facultades`
--

INSERT INTO `facultades` (`id`, `nombre`) VALUES
(1, 'Facultad de Informática'),
(2, 'Facultad de Derecho'),
(3, 'Facultad de Ciencias de la Información');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inscripciones`
--

CREATE TABLE `inscripciones` (
  `id_usuario` int(11) NOT NULL,
  `id_evento` int(11) NOT NULL,
  `esta_lista_espera` tinyint(1) DEFAULT NULL,
  `fecha_inscripcion` datetime DEFAULT NULL,
  `activo` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inscripciones`
--

INSERT INTO `inscripciones` (`id_usuario`, `id_evento`, `esta_lista_espera`, `fecha_inscripcion`, `activo`) VALUES
(1, 1, 0, '2024-11-12 11:58:58', 0),
(7, 2, 0, '2024-11-27 13:30:23', 0),
(7, 4, 0, '2024-11-30 16:02:35', 1),
(7, 5, 0, '2024-11-30 20:01:53', 1),
(10, 5, 1, '2024-11-30 20:49:06', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_evento` int(11) NOT NULL,
  `titulo` varchar(20) NOT NULL,
  `mensaje` varchar(100) NOT NULL,
  `visto` tinyint(1) NOT NULL,
  `fechaRecibida` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `notificaciones`
--

INSERT INTO `notificaciones` (`id`, `id_usuario`, `id_evento`, `titulo`, `mensaje`, `visto`, `fechaRecibida`) VALUES
(1, 7, 4, 'Fun', 'Su inscripcion al evento Fun se ha realizado con exito', 1, '2024-11-30 18:23:02'),
(2, 9, 4, 'Fun', 'El usuario Elenaa se ha inscrito al evento', 0, '2024-11-30 18:23:02'),
(3, 7, 4, 'Fun', 'Su inscripcion al evento Fun se ha realizado con exito', 1, '2024-11-30 18:23:02'),
(4, 9, 4, 'Fun', 'El usuario Elenaa se ha inscrito al evento', 0, '2024-11-30 18:23:02'),
(5, 7, 4, 'Fun', 'Se ha eliminado su inscripcion al evento Fun con exito', 1, '2024-11-30 18:23:02'),
(6, 9, 4, 'Fun', 'El usuario Elenaa se ha desapuntado del evento', 0, '2024-11-30 18:23:02'),
(7, 7, 4, 'Fun', 'Su inscripcion al evento Fun se ha realizado con exito', 1, '2024-11-30 18:23:02'),
(8, 9, 4, 'Fun', 'El usuario Elenaa se ha inscrito al evento', 0, '2024-11-30 18:23:02'),
(9, 7, 5, 'Fun', 'Su inscripcion al evento Fun se ha realizado con exito', 1, '2024-11-30 18:23:02'),
(10, 9, 5, 'Fun', 'El usuario Elenaa se ha inscrito al evento', 0, '2024-11-30 18:23:02'),
(11, 7, 5, 'Fun', 'Su inscripcion al evento Fun se ha realizado con exito', 1, '2024-11-30 18:23:02'),
(12, 9, 5, 'Fun', 'El usuario Elenaa se ha inscrito al evento', 0, '2024-11-30 18:23:02'),
(13, 7, 5, 'Fun', 'Se ha eliminado su inscripcion al evento Fun con exito', 1, '2024-11-30 18:23:02'),
(14, 9, 5, 'Fun', 'El usuario Elenaa se ha desapuntado del evento', 0, '2024-11-30 18:23:02'),
(15, 7, 5, 'Fun', 'Su inscripcion al evento Fun se ha realizado con exito', 1, '2024-11-30 18:23:02'),
(16, 9, 5, 'Fun', 'El usuario Elenaa se ha inscrito al evento', 0, '2024-11-30 18:23:02'),
(17, 7, 5, 'Fun', 'Se ha eliminado su inscripcion al evento Fun con exito', 1, '2024-11-30 18:23:02'),
(18, 9, 5, 'Fun', 'El usuario Elenaa se ha desapuntado del evento', 0, '2024-11-30 18:23:02'),
(19, 7, 5, 'Fun', 'Su inscripcion al evento Fun se ha realizado con exito', 0, '2024-11-30 20:01:53'),
(20, 9, 5, 'Fun', 'El usuario Elenaa se ha inscrito al evento', 0, '2024-11-30 20:01:53'),
(21, 10, 5, 'Fun', 'Su inscripcion a la lista de espera del evento Fun se ha realizado con exito', 0, '2024-11-30 20:49:06'),
(22, 9, 5, 'Fun', 'El usuario Richi se ha inscrito al evento', 0, '2024-11-30 20:49:06');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `correo` varchar(50) NOT NULL,
  `telefono` int(11) NOT NULL,
  `contrasena` varchar(1000) NOT NULL,
  `es_organizador` tinyint(1) NOT NULL,
  `id_facultad` int(11) NOT NULL,
  `id_accesibilidad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `correo`, `telefono`, `contrasena`, `es_organizador`, `id_facultad`, `id_accesibilidad`) VALUES
(1, 'Joaquin', 'joaco@gmail.com', 666666777, 'q', 1, 1, 1),
(7, 'Elenaa', 'admin@ucm.es', 123121213, '$2b$10$UE.rjXbEdckzA8r0h05rnOJFRPwTeXrhiNJI5XjaeFsyIkltyG/Cu', 0, 2, 1),
(8, 'abel', 'abel@ucm.es', 123121212, '123456', 1, 3, 1),
(9, 'aa', 'santigsd@ucm.es', 312121212, '$2b$10$ByOVeMZcIeuKrwBxBtlJIeF39EHGTKXk4IuiZpEjJjtmHMUYvLGf2', 1, 3, 1),
(10, 'Richi', 'elencari@ucm.es', 456454545, '$2b$10$afY2jvTJI2WpyC01HhJqg.hfJB4X9Ezw6wW0GFofimEdjyL5ZnnM2', 0, 2, 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `blacklist`
--
ALTER TABLE `blacklist`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `configuraciones_accesibilidad`
--
ALTER TABLE `configuraciones_accesibilidad`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `eventos`
--
ALTER TABLE `eventos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_idOrganizadorEvento` (`id_organizador`),
  ADD KEY `FK_categoria` (`id_categoria`);

--
-- Indices de la tabla `facultades`
--
ALTER TABLE `facultades`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `inscripciones`
--
ALTER TABLE `inscripciones`
  ADD PRIMARY KEY (`id_usuario`,`id_evento`),
  ADD KEY `FK_idEvento` (`id_evento`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Fk_usuarios` (`id_usuario`),
  ADD KEY `Fk_evento` (`id_evento`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UniquenessTelefone` (`telefono`),
  ADD UNIQUE KEY `UniquenessEmail` (`correo`),
  ADD KEY `FK_idFacultad` (`id_facultad`),
  ADD KEY `FK_idAccesibilidad` (`id_accesibilidad`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `blacklist`
--
ALTER TABLE `blacklist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `configuraciones_accesibilidad`
--
ALTER TABLE `configuraciones_accesibilidad`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `eventos`
--
ALTER TABLE `eventos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `facultades`
--
ALTER TABLE `facultades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `eventos`
--
ALTER TABLE `eventos`
  ADD CONSTRAINT `FK_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id`),
  ADD CONSTRAINT `FK_idOrganizadorEvento` FOREIGN KEY (`id_organizador`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `inscripciones`
--
ALTER TABLE `inscripciones`
  ADD CONSTRAINT `FK_idEvento` FOREIGN KEY (`id_evento`) REFERENCES `eventos` (`id`),
  ADD CONSTRAINT `FK_idOrganizador` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `Fk_evento` FOREIGN KEY (`id_evento`) REFERENCES `eventos` (`id`),
  ADD CONSTRAINT `Fk_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `FK_idAccesibilidad` FOREIGN KEY (`id_accesibilidad`) REFERENCES `configuraciones_accesibilidad` (`id`),
  ADD CONSTRAINT `FK_idFacultad` FOREIGN KEY (`id_facultad`) REFERENCES `facultades` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
