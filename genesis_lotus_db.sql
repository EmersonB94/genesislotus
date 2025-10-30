-- phpMyAdmin SQL Dump ajustado para FreeSQLDatabase
-- Versão: 5.2.1
-- Host: 127.0.0.1
-- Servidor: 10.4.32-MariaDB

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- ===========================
-- Tabela: acoestreinamentos
-- ===========================

CREATE TABLE IF NOT EXISTS `acoestreinamentos` (
  `empresa` varchar(50) NOT NULL,
  `tema` varchar(150) NOT NULL,
  `realizado` text NOT NULL,
  `data_realizacao` date NOT NULL,
  `local` varchar(150) NOT NULL,
  `tipo_acao` varchar(50) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `duracao` decimal(5,2) NOT NULL,
  `departamento` varchar(150) NOT NULL,
  `responsavel` varchar(50) NOT NULL,
  `modalidade` varchar(50) NOT NULL,
  `pat` varchar(10) NOT NULL,
  `participantes` int(5) NOT NULL,
  `data_hora_registro` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `criado_por` varchar(50) NOT NULL,
  `atualizado_em` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `acoestreinamentos` (`empresa`, `tema`, `realizado`, `data_realizacao`, `local`, `tipo_acao`, `id`, `duracao`, `departamento`, `responsavel`, `modalidade`, `pat`, `participantes`, `data_hora_registro`, `criado_por`, `atualizado_em`) VALUES
('DC Empresarial', 'Outubro Rosa', 'foi realizado um momento com a equipe...', '0000-00-00', '', 'Ação', 1, 0.00, 'Recursos Humanos', 'Lucas Dourado', 'Presencial', 'Sim', 20, '2025-10-30 10:52:45', '', ''),
('DC Empresarial', 'EPI', 'Treinamento sobre o uso correto do EPI', '2025-10-30', 'NEPES', 'Treinamento', 2, 6.00, 'Segurança do trabalho', 'Lucas Dourado', 'Presencial', 'Sim', 20, '2025-10-30 10:53:34', '', '');

-- ===========================
-- Tabela: cad_empresa
-- ===========================

CREATE TABLE IF NOT EXISTS `cad_empresa` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome_fantasia` varchar(50) NOT NULL,
  `cnpj` varchar(50) NOT NULL,
  `endereco` varchar(150) NOT NULL,
  `telefone` varchar(50) NOT NULL,
  `responsavel` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL,
  `data_hora_cadastro` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `usuario` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `cad_empresa` (`id`, `nome_fantasia`, `cnpj`, `endereco`, `telefone`, `responsavel`, `status`, `data_hora_cadastro`, `usuario`) VALUES
(1, 'Genesis', 'XX.XXX.XXX/YYYY-ZZ', 'Brasília', '(00) 00000-0000', 'Lucas Dourado', '', '2025-10-30 10:27:11', 'Lucas Dourado'),
(2, 'DC Empresarial', 'XX.XXX.XXX/YYYY-ZZ', 'Brasília', '(00) 00000-0000', 'Lucas Dourado', '', '2025-10-30 10:30:51', 'Lucas Dourado');

-- ===========================
-- Tabela: indicadores
-- ===========================

CREATE TABLE IF NOT EXISTS `indicadores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `indicador` varchar(255) NOT NULL,
  `mes` varchar(50) NOT NULL,
  `ano` int(11) NOT NULL,
  `valor` decimal(5,2) DEFAULT NULL,
  `analise_critica` text DEFAULT NULL,
  `acao_corretiva` text DEFAULT NULL,
  `prazo` date DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `evidencias` varchar(255) DEFAULT NULL,
  `admitidos` int(11) DEFAULT NULL,
  `demitidos` int(11) DEFAULT NULL,
  `total_colaboradores` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `indicadores` (`id`, `indicador`, `mes`, `ano`, `valor`, `analise_critica`, `acao_corretiva`, `prazo`, `status`, `evidencias`, `admitidos`, `demitidos`, `total_colaboradores`) VALUES
(1, 'Absenteísmo', 'Janeiro', 2024, 0.00, 'asc', 'asc', '2025-04-27', 'Aberta', NULL, NULL, NULL, NULL),
(2, '', 'Janeiro', 2000, 0.00, '', '', '2025-04-27', 'Aberto', '', 0, 0, 0),
(3, 'Turnover', 'Janeiro', 2024, 0.00, 'Teste', 'Teste', '2025-04-27', 'Em andamento', NULL, 0, 0, 1),
(4, 'Absenteísmo', 'Janeiro', 2025, 3.00, 'Teste', 'Teste', '2025-04-28', 'Em andamento', NULL, NULL, NULL, NULL);

-- ===========================
-- Tabela: usuario
-- ===========================

CREATE TABLE IF NOT EXISTS `usuario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(200) NOT NULL,
  `email` varchar(50) NOT NULL,
  `contato` varchar(50) NOT NULL,
  `senha` varchar(50) NOT NULL,
  `setor` varchar(50) NOT NULL,
  `nivel_usuario` varchar(30) NOT NULL DEFAULT 'Sem permissões',
  `cadastro` datetime NOT NULL,
  `atualizacao` datetime NOT NULL,
  `status` varchar(30) NOT NULL,
  `cargo` varchar(30) NOT NULL DEFAULT 'Não informado',
  `empresa` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabela de usuário';

INSERT INTO `usuario` (`id`, `nome`, `email`, `contato`, `senha`, `setor`, `nivel_usuario`, `cadastro`, `atualizacao`, `status`, `cargo`, `empresa`) VALUES
(1, 'Emerson Nunes Bezerra Borges', 'emerson@genesisgenteegestao.com', '82 98896-7690', '123', 'TI', 'Administrador', '0000-00-00 00:00:00', '2025-10-30 08:26:45', 'Ativo', 'Não informado', 'DC Empresarial'),
(2, 'Lucas Dourado', 'lucas@genesis', '62 8180-6931', '123', 'CEO', 'Administrador', '2025-10-29 08:36:45', '2025-10-30 08:33:42', 'Ativo', 'Não informado', 'DC Empresarial'),
(3, 'Daise Lopes', 'daise@genesis', '61 9115-5724', '123', 'Cooredenação de RH', 'Administrador', '2025-10-29 15:51:23', '2025-10-30 08:33:48', 'Ativo', 'Não informado', 'Genesis');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
