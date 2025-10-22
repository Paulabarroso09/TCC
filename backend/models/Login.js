const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Login = sequelize.define('Login', {
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
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  senha: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nome_completo: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  tipo_usuario: {
    type: DataTypes.ENUM('admin', 'usuario'),
    defaultValue: 'usuario'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'login',
  timestamps: true,
  createdAt: 'data_criacao',
  updatedAt: false,
  hooks: {
    beforeCreate: async (login) => {
      if (login.senha) {
        login.senha = await bcrypt.hash(login.senha, 10);
      }
    },
    beforeUpdate: async (login) => {
      if (login.changed('senha')) {
        login.senha = await bcrypt.hash(login.senha, 10);
      }
    }
  }
});

// Método para verificar senha
Login.prototype.verificarSenha = function(senha) {
  return bcrypt.compare(senha, this.senha);
};

module.exports = Login;