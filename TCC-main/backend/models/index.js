const sequelize = require('../config/database');
const Login = require('./Login');
const Aparelhos = require('./Aparelhos');
const Temperatura = require('./Temperatura');

// Associações
Login.hasMany(Aparelhos, { foreignKey: 'usuario_id' });
Aparelhos.belongsTo(Login, { foreignKey: 'usuario_id' });

Aparelhos.hasMany(Temperatura, { foreignKey: 'aparelho_id' });
Temperatura.belongsTo(Aparelhos, { foreignKey: 'aparelho_id' });

module.exports = {
  sequelize,
  Login,
  Aparelhos,
  Temperatura
};