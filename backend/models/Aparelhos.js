const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Aparelhos = sequelize.define('Aparelhos', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_aparelho: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  nome_aparelho: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  localizacao: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  tipo_ambiente: {
    type: DataTypes.ENUM('culinaria', 'mecanica', 'quimica', 'automotiva', 'outro'),
    allowNull: false
  },
  mac_address: {
    type: DataTypes.STRING(17),
    unique: true
  },
  ip_address: {
    type: DataTypes.STRING(15)
  },
  esp32_id: {
    type: DataTypes.STRING(50),
    unique: true
  },
  status: {
    type: DataTypes.ENUM('ativo', 'inativo', 'manutencao'),
    defaultValue: 'ativo'
  },
  ultima_manutencao: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'aparelhos',
  timestamps: true,
  createdAt: 'data_instalacao',
  updatedAt: false
});

module.exports = Aparelhos;