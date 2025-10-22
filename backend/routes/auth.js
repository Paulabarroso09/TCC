const express = require('express');
const jwt = require('jsonwebtoken');
const { Login } = require('../models');
const router = express.Router();

const JWT_SECRET = 'seu_segredo_jwt_aqui';

// Login
router.post('/login', async (req, res) => {
  try {
    const { numero_aparelho, senha } = req.body;

    const usuario = await Login.findOne({ 
      where: { numero_aparelho, ativo: true } 
    });

    if (!usuario || !(await usuario.verificarSenha(senha))) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Atualizar último login
    await usuario.update({ ultimo_login: new Date() });

    const token = jwt.sign(
      { 
        id: usuario.id, 
        numero_aparelho: usuario.numero_aparelho,
        tipo_usuario: usuario.tipo_usuario 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        numero_aparelho: usuario.numero_aparelho,
        nome_completo: usuario.nome_completo,
        tipo_usuario: usuario.tipo_usuario
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Cadastro
router.post('/cadastro', async (req, res) => {
  try {
    const { numero_aparelho, email, senha, nome_completo } = req.body;

    const usuarioExistente = await Login.findOne({
      where: { numero_aparelho }
    });

    if (usuarioExistente) {
      return res.status(400).json({ error: 'Número do aparelho já cadastrado' });
    }

    const novoUsuario = await Login.create({
      numero_aparelho,
      email,
      senha,
      nome_completo
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      usuario: {
        id: novoUsuario.id,
        numero_aparelho: novoUsuario.numero_aparelho,
        nome_completo: novoUsuario.nome_completo
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

module.exports = router;