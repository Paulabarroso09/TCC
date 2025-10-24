const express = require('express');
const { Temperatura, Aparelhos } = require('../models');
const router = express.Router();

// Listar todas as medições
router.get('/', async (req, res) => {
  try {
    const medicoes = await Temperatura.findAll({
      include: [{
        model: Aparelhos,
        attributes: ['nome_aparelho', 'localizacao']
      }],
      order: [['data_leitura', 'DESC']],
      limit: 100
    });
    res.json(medicoes);
  } catch (error) {
    console.error('Erro ao buscar medições:', error);
    res.status(500).json({ error: 'Erro ao buscar medições' });
  }
});

// Histórico de medições de um aparelho
router.get('/aparelho/:aparelho_id', async (req, res) => {
  try {
    const { aparelho_id } = req.params;
    const { limit = 100 } = req.query;

    const medicoes = await Temperatura.findAll({
      where: { aparelho_id },
      order: [['data_leitura', 'DESC']],
      limit: parseInt(limit),
      include: [{
        model: Aparelhos,
        attributes: ['nome_aparelho', 'localizacao']
      }]
    });

    res.json(medicoes);
  } catch (error) {
    console.error('Erro ao buscar medições:', error);
    res.status(500).json({ error: 'Erro ao buscar medições' });
  }
});

module.exports = router;