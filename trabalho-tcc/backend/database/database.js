// database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'airsmart.db');

// Criar conexão com o banco
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar com o banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        initDatabase();
    }
});

// Inicializar tabelas
function initDatabase() {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_completo TEXT NOT NULL,
        numero_acordo TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS aparelhos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        numero_serie TEXT UNIQUE NOT NULL,
        modelo TEXT NOT NULL,
        status TEXT DEFAULT 'ativo',
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS prevencoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descricao TEXT NOT NULL,
        tipo TEXT NOT NULL
    )`);

    // Inserir prevenções de exemplo
    db.get("SELECT COUNT(*) as count FROM prevencoes", (err, row) => {
        if (row.count === 0) {
            const prevencoes = [
                {
                    titulo: 'Manutenção Preventiva',
                    descricao: 'Recomendamos limpeza dos filtros esta semana.',
                    tipo: 'manutencao'
                },
                {
                    titulo: 'Qualidade do Ar',
                    descricao: 'O ar está com boa qualidade hoje.',
                    tipo: 'qualidade'
                },
                {
                    titulo: 'Troca de Filtro',
                    descricao: 'Seu filtro precisa ser trocado em 30 dias.',
                    tipo: 'manutencao'
                }
            ];

            const stmt = db.prepare("INSERT INTO prevencoes (titulo, descricao, tipo) VALUES (?, ?, ?)");
            prevencoes.forEach(prevencao => {
                stmt.run([prevencao.titulo, prevencao.descricao, prevencao.tipo]);
            });
            stmt.finalize();
        }
    });
}

// Funções do banco de dados
class Database {
    // Verificar se usuário existe
    userExists(numero_acordo) {
        return new Promise((resolve, reject) => {
            db.get("SELECT id FROM users WHERE numero_acordo = ?", [numero_acordo], (err, row) => {
                if (err) reject(err);
                resolve(!!row);
            });
        });
    }

    // Criar usuário
    createUser(userData) {
        return new Promise((resolve, reject) => {
            const { nome_completo, numero_acordo, senha } = userData;
            db.run(
                "INSERT INTO users (nome_completo, numero_acordo, senha) VALUES (?, ?, ?)",
                [nome_completo, numero_acordo, senha],
                function(err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });
    }

    // Buscar usuário por número de acordo
    getUserByNumeroAcordo(numero_acordo) {
        return new Promise((resolve, reject) => {
            db.get(
                "SELECT id, nome_completo, numero_acordo, senha FROM users WHERE numero_acordo = ?",
                [numero_acordo],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });
    }

    // Buscar dados do dashboard
    getDashboardData(userId) {
        return new Promise((resolve, reject) => {
            // Buscar número de aparelhos ativos
            db.get(
                "SELECT COUNT(*) as aparelhos_ativos FROM aparelhos WHERE user_id = ? AND status = 'ativo'",
                [userId],
                (err, aparelhosRow) => {
                    if (err) reject(err);

                    // Buscar prevenções
                    db.all(
                        "SELECT titulo, descricao FROM prevencoes LIMIT 3",
                        (err, prevencoesRows) => {
                            if (err) reject(err);

                            resolve({
                                aparelhos_ativos: aparelhosRow.aparelhos_ativos,
                                qualidade_ar: 'Boa',
                                prevencoes: prevencoesRows
                            });
                        }
                    );
                }
            );
        });
    }
}

module.exports = new Database();