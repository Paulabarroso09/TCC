-- Criar tabela login
CREATE TABLE login (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero_aparelho VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    nome_completo VARCHAR(100) NOT NULL,
    tipo_usuario ENUM('admin', 'usuario') DEFAULT 'usuario',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP NULL,
    ativo TINYINT(1) DEFAULT 1
);

-- Criar tabela aparelhos
CREATE TABLE aparelhos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero_aparelho VARCHAR(20) NOT NULL UNIQUE,
    nome_aparelho VARCHAR(100) NOT NULL,
    localizacao VARCHAR(100) NOT NULL,
    tipo_ambiente ENUM('culinaria', 'mecanica', 'quimica', 'automotiva', 'outro') NOT NULL,
    mac_address VARCHAR(17) UNIQUE,
    ip_address VARCHAR(15),
    esp32_id VARCHAR(50) UNIQUE,
    data_instalacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_manutencao DATE,
    status ENUM('ativo', 'inativo', 'manutencao') DEFAULT 'ativo',
    usuario_id INT,
    FOREIGN KEY (usuario_id) REFERENCES login(id) ON DELETE SET NULL
);

-- Criar tabela temperatura
CREATE TABLE temperatura (
    id INT PRIMARY KEY AUTO_INCREMENT,
    aparelho_id INT NOT NULL,
    temperatura DECIMAL(5,2) NOT NULL,
    umidade DECIMAL(5,2) NOT NULL,
    co2 DECIMAL(8,2),
    co DECIMAL(8,2),
    qualidade_ar ENUM('boa', 'moderada', 'ruim', 'perigosa') DEFAULT 'boa',
    data_leitura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aparelho_id) REFERENCES aparelhos(id) ON DELETE CASCADE
);

-- Inserir dados de exemplo
INSERT INTO login (numero_aparelho, email, senha, nome_completo, tipo_usuario) VALUES 
('001', 'admin@airsmart.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador Sistema', 'admin'),
('002', 'prof.mecanica@escola.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Professor João Silva', 'usuario');

INSERT INTO aparelhos (numero_aparelho, nome_aparelho, localizacao, tipo_ambiente, mac_address, esp32_id, usuario_id) VALUES 
('001', 'Estação Oficina Mecânica', 'Oficina Mecânica - Bloco A', 'mecanica', 'AA:BB:CC:DD:EE:01', 'ESP32_001', 1),
('002', 'Estação Laboratório Química', 'Laboratório Química - Bloco B', 'quimica', 'AA:BB:CC:DD:EE:02', 'ESP32_002', 2);

INSERT INTO temperatura (aparelho_id, temperatura, umidade, co2, co, qualidade_ar) VALUES 
(1, 23.5, 45.2, 450.00, 2.5, 'boa'),
(1, 24.1, 44.8, 480.00, 3.1, 'boa'),
(2, 22.8, 52.3, 420.00, 1.8, 'boa'); #Sequelize