const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Temperatura = sequelize.define('Temperatura', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  temperatura: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  umidade: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  co2: {
    type: DataTypes.DECIMAL(8, 2)
  },
  co: {
    type: DataTypes.DECIMAL(8, 2)
  },
  qualidade_ar: {
    type: DataTypes.ENUM('boa', 'moderada', 'ruim', 'perigosa'),
    defaultValue: 'boa'
  }
}, {
  tableName: 'temperatura',
  timestamps: true,
  createdAt: 'data_leitura',
  updatedAt: false
});

module.exports = Temperatura;