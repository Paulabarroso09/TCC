const { Sequelize } = require('sequelize');

// Configure com SUA senha do MySQL
const sequelize = new Sequelize({
  database: 'estacao_qualidade_ar',
  username: 'root',
  password: '', // ⚠️ COLOQUE SUA SENHA AQUI (se tiver)
  host: 'localhost',
  dialect: 'mysql',
  port: 3306,
  logging: false
});

// Teste de conexão mais simples
sequelize.authenticate()
  .then(() => console.log('✅ Conectado ao MySQL'))
  .catch(err => console.error('❌ Erro de conexão MySQL:', err.message));

module.exports = sequelize;