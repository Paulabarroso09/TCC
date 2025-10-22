const express = require('express');
const { Aparelhos, Login } = require('../models');
const router = express.Router();

// Listar todos os aparelhos
router.get('/', async (req, res) => {
  try {
    const aparelhos = await Aparelhos.findAll({
      include: [{
        model: Login,
        attributes: ['nome_completo', 'email']
      }]
    });
    res.json(aparelhos);
  } catch (error) {
    console.error('Erro ao buscar aparelhos:', error);
    res.status(500).json({ error: 'Erro ao buscar aparelhos' });
  }
});

// Buscar aparelho por número
router.get('/:numero', async (req, res) => {
  try {
    const aparelho = await Aparelhos.findOne({
      where: { numero_aparelho: req.params.numero },
      include: [{
        model: Login,
        attributes: ['nome_completo', 'email']
      }]
    });

    if (!aparelho) {
      return res.status(404).json({ error: 'Aparelho não encontrado' });
    }

    res.json(aparelho);
  } catch (error) {
    console.error('Erro ao buscar aparelho:', error);
    res.status(500).json({ error: 'Erro ao buscar aparelho' });
  }
});

module.exports = router;