// database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
    constructor() {
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'airsmart_db',
            port: process.env.DB_PORT || 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        };
        this.pool = mysql.createPool(this.config);
        this.initDatabase();
    }

    async initDatabase() {
        try {
            // Criar banco de dados se não existir
            const connection = await mysql.createConnection({
                host: this.config.host,
                user: this.config.user,
                password: this.config.password
            });

            await connection.execute(`CREATE DATABASE IF NOT EXISTS ${this.config.database}`);
            await connection.end();

            console.log('Banco de dados verificado/criado com sucesso.');

            // Executar script SQL para criar tabelas
            await this.executeSQLScript();
        } catch (error) {
            console.error('Erro ao inicializar banco de dados:', error);
        }
    }

    async executeSQLScript() {
        try {
            // Aqui você pode executar seu script SQL completo
            // Por enquanto, vamos criar as tabelas seguindo sua estrutura
            await this.createTables();
        } catch (error) {
            console.error('Erro ao executar script SQL:', error);
        }
    }

    async createTables() {
        try {
            // Tabela de usuários
            await this.pool.execute(`
                CREATE TABLE IF NOT EXISTS usuarios (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nome_completo VARCHAR(255) NOT NULL,
                    numero_acordo VARCHAR(100) UNIQUE NOT NULL,
                    senha VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX (numero_acordo)
                )
            `);

            // Tabela de status de aparelhos
            await this.pool.execute(`
                CREATE TABLE IF NOT EXISTS status_aparelho (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    status VARCHAR(50) UNIQUE NOT NULL
                )
            `);

            // Tabela de aparelhos
            await this.pool.execute(`
                CREATE TABLE IF NOT EXISTS aparelhos (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    usuario_id INT NOT NULL,
                    nome_aparelho VARCHAR(255) NOT NULL,
                    status_id INT DEFAULT 2,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                    FOREIGN KEY (status_id) REFERENCES status_aparelho(id) ON DELETE SET NULL,
                    INDEX (usuario_id)
                )
            `);

            // Tabela de histórico
            await this.pool.execute(`
                CREATE TABLE IF NOT EXISTS historico (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    usuario_id INT NOT NULL,
                    qualidade VARCHAR(50),
                    temperatura DECIMAL(5,2),
                    umidade DECIMAL(5,2),
                    poluicao DECIMAL(5,2),
                    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                    INDEX (usuario_id)
                )
            `);

            // Tabela de prevenções
            await this.pool.execute(`
                CREATE TABLE IF NOT EXISTS prevencoes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    titulo VARCHAR(255) NOT NULL,
                    descricao TEXT,
                    tipo VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Inserir status padrão
            await this.insertDefaultData();

            console.log('Todas as tabelas foram criadas/verificadas com sucesso.');
        } catch (error) {
            console.error('Erro ao criar tabelas:', error);
        }
    }

    async insertDefaultData() {
        try {
            // Inserir status de aparelhos
            const statusCount = await this.pool.execute('SELECT COUNT(*) as count FROM status_aparelho');
            if (statusCount[0][0].count === 0) {
                await this.pool.execute(`
                    INSERT INTO status_aparelho (status) VALUES 
                    ('ativo'), ('inativo'), ('ontem')
                `);
                console.log('Status de aparelhos inseridos com sucesso.');
            }

            // Inserir prevenções padrão
            const prevCount = await this.pool.execute('SELECT COUNT(*) as count FROM prevencoes');
            if (prevCount[0][0].count === 0) {
                await this.pool.execute(`
                    INSERT INTO prevencoes (titulo, descricao, tipo) VALUES 
                    ('Manutenção Preventiva', 'Recomendamos limpeza dos filtros esta semana para melhor desempenho do aparelho.', 'manutencao'),
                    ('Qualidade do Ar', 'O ar está com boa qualidade hoje. Mantenha os ambientes ventilados.', 'qualidade'),
                    ('Troca de Filtro', 'Seu filtro precisa ser trocado em 30 dias para manter a eficiência.', 'manutencao'),
                    ('Economia de Energia', 'Desligue o aparelho quando o ambiente estiver vazio para economizar energia.', 'economia'),
                    ('Umidade Ideal', 'Mantenha a umidade entre 40% e 60% para melhor conforto respiratório.', 'conforto')
                `);
                console.log('Prevenções padrão inseridas com sucesso.');
            }
        } catch (error) {
            console.error('Erro ao inserir dados padrão:', error);
        }
    }

    // Verificar se usuário existe
    async userExists(numero_acordo) {
        try {
            const [rows] = await this.pool.execute(
                'SELECT id FROM usuarios WHERE numero_acordo = ?',
                [numero_acordo]
            );
            return rows.length > 0;
        } catch (error) {
            console.error('Erro ao verificar usuário:', error);
            throw error;
        }
    }

    // Criar usuário
    async createUser(userData) {
        try {
            const { nome_completo, numero_acordo, senha } = userData;
            const [result] = await this.pool.execute(
                'INSERT INTO usuarios (nome_completo, numero_acordo, senha) VALUES (?, ?, ?)',
                [nome_completo, numero_acordo, senha]
            );
            return result.insertId;
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            throw error;
        }
    }

    // Buscar usuário por número de acordo
    async getUserByNumeroAcordo(numero_acordo) {
        try {
            const [rows] = await this.pool.execute(
                'SELECT id, nome_completo, numero_acordo, senha FROM usuarios WHERE numero_acordo = ?',
                [numero_acordo]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            throw error;
        }
    }

    // Buscar dados do dashboard
    async getDashboardData(userId) {
        try {
            // Buscar número de aparelhos ativos
            const [aparelhosRows] = await this.pool.execute(
                `SELECT COUNT(*) as aparelhos_ativos 
                 FROM aparelhos 
                 WHERE usuario_id = ? AND status_id = 1`,
                [userId]
            );

            // Buscar última leitura de qualidade do ar
            const [qualidadeRows] = await this.pool.execute(
                `SELECT qualidade 
                 FROM historico 
                 WHERE usuario_id = ? 
                 ORDER BY data DESC 
                 LIMIT 1`,
                [userId]
            );

            // Buscar prevenções
            const [prevencoesRows] = await this.pool.execute(
                'SELECT titulo, descricao FROM prevencoes LIMIT 5'
            );

            return {
                aparelhos_ativos: aparelhosRows[0]?.aparelhos_ativos || 0,
                qualidade_ar: qualidadeRows[0]?.qualidade || 'N/A',
                prevencoes: prevencoesRows
            };
        } catch (error) {
            console.error('Erro ao buscar dados do dashboard:', error);
            throw error;
        }
    }

    // Adicionar aparelho para usuário
    async addAparelho(usuario_id, nome_aparelho, status_id = 1) {
        try {
            const [result] = await this.pool.execute(
                'INSERT INTO aparelhos (usuario_id, nome_aparelho, status_id) VALUES (?, ?, ?)',
                [usuario_id, nome_aparelho, status_id]
            );
            return result.insertId;
        } catch (error) {
            console.error('Erro ao adicionar aparelho:', error);
            throw error;
        }
    }

    // Buscar aparelhos do usuário
    async getAparelhosByUsuario(usuario_id) {
        try {
            const [rows] = await this.pool.execute(
                `SELECT a.*, s.status 
                 FROM aparelhos a 
                 JOIN status_aparelho s ON a.status_id = s.id 
                 WHERE a.usuario_id = ?`,
                [usuario_id]
            );
            return rows;
        } catch (error) {
            console.error('Erro ao buscar aparelhos:', error);
            throw error;
        }
    }

    // Adicionar registro no histórico
    async addHistorico(historicoData) {
        try {
            const { usuario_id, qualidade, temperatura, umidade, poluicao } = historicoData;
            const [result] = await this.pool.execute(
                'INSERT INTO historico (usuario_id, qualidade, temperatura, umidade, poluicao) VALUES (?, ?, ?, ?, ?)',
                [usuario_id, qualidade, temperatura, umidade, poluicao]
            );
            return result.insertId;
        } catch (error) {
            console.error('Erro ao adicionar histórico:', error);
            throw error;
        }
    }

    // Buscar histórico do usuário
    async getHistoricoByUsuario(usuario_id, limit = 10) {
        try {
            const [rows] = await this.pool.execute(
                `SELECT * FROM historico 
                 WHERE usuario_id = ? 
                 ORDER BY data DESC 
                 LIMIT ?`,
                [usuario_id, limit]
            );
            return rows;
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
            throw error;
        }
    }

    // Fechar conexão
    async close() {
        await this.pool.end();
    }
}

module.exports = new Database();