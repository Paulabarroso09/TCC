-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           10.4.32-MariaDB - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para airsmart
CREATE DATABASE IF NOT EXISTS `airsmart` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `airsmart`;

-- Copiando estrutura para tabela airsmart.aparelhos
CREATE TABLE IF NOT EXISTS `aparelhos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero_aparelho` varchar(20) NOT NULL,
  `nome_aparelho` varchar(100) NOT NULL,
  `localizacao` varchar(100) NOT NULL,
  `tipo_ambiente` enum('culinaria','mecanica','quimica','automotiva','outro') NOT NULL,
  `mac_address` varchar(17) DEFAULT NULL,
  `ip_address` varchar(15) DEFAULT NULL,
  `esp32_id` varchar(50) DEFAULT NULL,
  `data_instalacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_manutencao` date DEFAULT NULL,
  `status` enum('ativo','inativo','manutencao') DEFAULT 'ativo',
  `usuario_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_aparelho` (`numero_aparelho`),
  UNIQUE KEY `mac_address` (`mac_address`),
  UNIQUE KEY `esp32_id` (`esp32_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `aparelhos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `login` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela airsmart.aparelhos: ~2 rows (aproximadamente)
INSERT INTO `aparelhos` (`id`, `numero_aparelho`, `nome_aparelho`, `localizacao`, `tipo_ambiente`, `mac_address`, `ip_address`, `esp32_id`, `data_instalacao`, `ultima_manutencao`, `status`, `usuario_id`) VALUES
	(1, '001', 'Estação Oficina Mecânica', 'Oficina Mecânica - Bloco A', 'mecanica', 'AA:BB:CC:DD:EE:01', NULL, 'ESP32_001', '2025-10-22 13:17:07', NULL, 'ativo', 1),
	(2, '002', 'Estação Laboratório Química', 'Laboratório Química - Bloco B', 'quimica', 'AA:BB:CC:DD:EE:02', NULL, 'ESP32_002', '2025-10-22 13:17:07', NULL, 'ativo', 2);

-- Copiando estrutura para tabela airsmart.login
CREATE TABLE IF NOT EXISTS `login` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero_aparelho` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `nome_completo` varchar(100) NOT NULL,
  `tipo_usuario` enum('admin','usuario') DEFAULT 'usuario',
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultimo_login` timestamp NULL DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_aparelho` (`numero_aparelho`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela airsmart.login: ~2 rows (aproximadamente)
INSERT INTO `login` (`id`, `numero_aparelho`, `email`, `senha`, `nome_completo`, `tipo_usuario`, `data_criacao`, `ultimo_login`, `ativo`) VALUES
	(1, '001', 'admin@airsmart.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador Sistema', 'admin', '2025-10-22 13:17:07', NULL, 1),
	(2, '002', 'prof.mecanica@escola.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Professor João Silva', 'usuario', '2025-10-22 13:17:07', NULL, 1);

-- Copiando estrutura para tabela airsmart.temperatura
CREATE TABLE IF NOT EXISTS `temperatura` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `aparelho_id` int(11) NOT NULL,
  `temperatura` decimal(5,2) NOT NULL,
  `umidade` decimal(5,2) NOT NULL,
  `co2` decimal(8,2) DEFAULT NULL,
  `co` decimal(8,2) DEFAULT NULL,
  `qualidade_ar` enum('boa','moderada','ruim','perigosa') DEFAULT 'boa',
  `data_leitura` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `aparelho_id` (`aparelho_id`),
  CONSTRAINT `temperatura_ibfk_1` FOREIGN KEY (`aparelho_id`) REFERENCES `aparelhos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela airsmart.temperatura: ~3 rows (aproximadamente)
INSERT INTO `temperatura` (`id`, `aparelho_id`, `temperatura`, `umidade`, `co2`, `co`, `qualidade_ar`, `data_leitura`) VALUES
	(1, 1, 23.50, 45.20, 450.00, 2.50, 'boa', '2025-10-22 13:17:07'),
	(2, 1, 24.10, 44.80, 480.00, 3.10, 'boa', '2025-10-22 13:17:07'),
	(3, 2, 22.80, 52.30, 420.00, 1.80, 'boa', '2025-10-22 13:17:07');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
