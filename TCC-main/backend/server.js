const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// ========== ARMAZENAMENTO EM MEMÓRIA (simulação de banco) ==========
let aparelhos = [
  {
    id: 1,
    numero_aparelho: '001',
    nome_aparelho: 'Estação Oficina Mecânica',
    localizacao: 'Oficina - Bloco A',
    tipo_ambiente: 'mecanica',
    status: 'ativo',
    usuario_id: 1,
    data_criacao: new Date().toISOString()
  },
  {
    id: 2,
    numero_aparelho: '002',
    nome_aparelho: 'Estação Laboratório Química',
    localizacao: 'Laboratório - Bloco B',
    tipo_ambiente: 'quimica',
    status: 'ativo',
    usuario_id: 1,
    data_criacao: new Date().toISOString()
  }
];

let temperaturas = [
  {
    id: 1,
    aparelho_id: 1,
    temperatura: 23.5,
    umidade: 45.2,
    co2: 450,
    co: 2.5,
    qualidade_ar: 'boa',
    data_leitura: new Date().toISOString()
  },
  {
    id: 2,
    aparelho_id: 1,
    temperatura: 24.1,
    umidade: 44.8,
    co2: 480,
    co: 3.1,
    qualidade_ar: 'boa',
    data_leitura: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 3,
    aparelho_id: 2,
    temperatura: 22.8,
    umidade: 52.3,
    co2: 420,
    co: 1.8,
    qualidade_ar: 'boa',
    data_leitura: new Date().toISOString()
  }
];

// ========== ROTAS DA API ==========

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ API AirSmart - COMPLETA!',
    status: 'Todas as rotas funcionando',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: ['POST /auth/login', 'POST /auth/cadastro'],
      aparelhos: ['GET /aparelhos', 'POST /aparelhos'],
      temperatura: ['GET /temperatura', 'GET /temperatura/aparelho/:id', 'POST /temperatura']
    }
  });
});

// ========== AUTENTICAÇÃO ==========
app.post('/auth/login', (req, res) => {
  console.log('🔐 Login attempt:', req.body);
  
  const { numero_aparelho, senha } = req.body;
  
  // Credenciais de teste
  if (numero_aparelho === '001' && senha === '123') {
    res.json({
      success: true,
      token: 'token_teste_' + Date.now(),
      usuario: {
        id: 1,
        numero_aparelho: '001',
        nome_completo: 'Usuário de Teste',
        email: 'teste@airsmart.com',
        tipo_usuario: 'admin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Credenciais inválidas. Use: Número 001, Senha 123'
    });
  }
});

app.post('/auth/cadastro', (req, res) => {
  console.log('📝 Cadastro attempt:', req.body);
  
  const { numero_aparelho, email, nome_completo, senha } = req.body;
  
  // Validação básica
  if (!numero_aparelho || !email || !nome_completo || !senha) {
    return res.status(400).json({
      success: false,
      error: 'Todos os campos são obrigatórios'
    });
  }
  
  res.json({
    success: true,
    message: 'Usuário cadastrado com sucesso!',
    usuario: {
      id: Date.now(),
      numero_aparelho,
      nome_completo,
      email,
      tipo_usuario: 'usuario'
    }
  });
});

// ========== APARELHOS ==========

// GET - Listar todos os aparelhos
app.get('/aparelhos', (req, res) => {
  console.log('📱 Buscando aparelhos - Total:', aparelhos.length);
  
  // Filtrar por usuário se necessário
  const usuarioId = req.query.usuario_id;
  let aparelhosFiltrados = aparelhos;
  
  if (usuarioId) {
    aparelhosFiltrados = aparelhos.filter(a => a.usuario_id == usuarioId);
  }
  
  res.json(aparelhosFiltrados);
});

// POST - Adicionar novo aparelho
app.post('/aparelhos', (req, res) => {
  console.log('➕ Novo aparelho request:', req.body);
  
  const { nome_aparelho, tipo_ambiente, localizacao, numero_aparelho, usuario_id } = req.body;
  
  // Validação de campos obrigatórios
  if (!nome_aparelho || !tipo_ambiente || !localizacao || !numero_aparelho) {
    return res.status(400).json({
      success: false,
      error: 'Todos os campos são obrigatórios: nome_aparelho, tipo_ambiente, localizacao, numero_aparelho'
    });
  }
  
  // Verificar se número do aparelho já existe
  const aparelhoExistente = aparelhos.find(a => a.numero_aparelho === numero_aparelho);
  if (aparelhoExistente) {
    return res.status(400).json({
      success: false,
      error: 'Número do aparelho já está em uso'
    });
  }
  
  // Criar novo aparelho
  const novoAparelho = {
    id: Date.now(), // ID único baseado no timestamp
    numero_aparelho,
    nome_aparelho,
    localizacao,
    tipo_ambiente,
    status: 'ativo',
    usuario_id: usuario_id || 1,
    data_criacao: new Date().toISOString()
  };
  
  // Adicionar à lista
  aparelhos.push(novoAparelho);
  
  console.log('✅ Aparelho adicionado. Total agora:', aparelhos.length);
  
  res.json({
    success: true,
    message: 'Aparelho adicionado com sucesso!',
    aparelho: novoAparelho
  });
});

// GET - Buscar aparelho por ID
app.get('/aparelhos/:id', (req, res) => {
  const aparelhoId = parseInt(req.params.id);
  const aparelho = aparelhos.find(a => a.id === aparelhoId);
  
  if (!aparelho) {
    return res.status(404).json({
      success: false,
      error: 'Aparelho não encontrado'
    });
  }
  
  res.json({
    success: true,
    aparelho
  });
});

// ========== TEMPERATURA/MEDICOES ==========

// GET - Todas as medições
app.get('/temperatura', (req, res) => {
  console.log('🌡️ Buscando medições - Total:', temperaturas.length);
  res.json(temperaturas);
});

// GET - Histórico de um aparelho específico
app.get('/temperatura/aparelho/:aparelho_id', (req, res) => {
  const aparelhoId = parseInt(req.params.aparelho_id);
  console.log('📊 Histórico do aparelho:', aparelhoId);
  
  const medicoesAparelho = temperaturas.filter(t => t.aparelho_id === aparelhoId);
  
  res.json(medicoesAparelho);
});

// POST - Nova medição
app.post('/temperatura', (req, res) => {
  console.log('📈 Nova medição:', req.body);
  
  const { aparelho_id, temperatura, umidade, co2, co } = req.body;
  
  // Determinar qualidade do ar baseado nos valores
  let qualidade_ar = 'boa';
  
  if (co2 > 1000 || co > 50) {
    qualidade_ar = 'perigosa';
  } else if (co2 > 800 || co > 30) {
    qualidade_ar = 'ruim';
  } else if (co2 > 600 || co > 15) {
    qualidade_ar = 'moderada';
  }
  
  const novaMedicao = {
    id: Date.now(),
    aparelho_id: parseInt(aparelho_id),
    temperatura: parseFloat(temperatura),
    umidade: parseFloat(umidade),
    co2: co2 ? parseFloat(co2) : null,
    co: co ? parseFloat(co) : null,
    qualidade_ar,
    data_leitura: new Date().toISOString()
  };
  
  temperaturas.unshift(novaMedicao); // Adicionar no início
  
  res.json({
    success: true,
    message: 'Medição registrada com sucesso!',
    medicao: novaMedicao
  });
});

// ========== ROTAS ADICIONAIS ==========

// GET - Status do sistema
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    aparelhos_cadastrados: aparelhos.length,
    medicoes_registradas: temperaturas.length,
    ultima_atualizacao: new Date().toISOString(),
    memoria: {
      aparelhos: aparelhos.map(a => ({ id: a.id, nome: a.nome_aparelho })),
      ultimas_medicoes: temperaturas.slice(0, 3)
    }
  });
});

// GET - Limpar dados (apenas para desenvolvimento)
app.get('/reset', (req, res) => {
  aparelhos = [
    {
      id: 1,
      numero_aparelho: '001',
      nome_aparelho: 'Estação Oficina Mecânica',
      localizacao: 'Oficina - Bloco A',
      tipo_ambiente: 'mecanica',
      status: 'ativo',
      usuario_id: 1,
      data_criacao: new Date().toISOString()
    },
    {
      id: 2,
      numero_aparelho: '002',
      nome_aparelho: 'Estação Laboratório Química',
      localizacao: 'Laboratório - Bloco B',
      tipo_ambiente: 'quimica',
      status: 'ativo',
      usuario_id: 1,
      data_criacao: new Date().toISOString()
    }
  ];
  
  res.json({
    success: true,
    message: 'Dados resetados para estado inicial',
    aparelhos
  });
});

// ========== MIDDLEWARE DE ERRO ==========
app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// ========== ROTA 404 ==========
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// ========== INICIAR SERVIDOR ==========
app.listen(PORT, () => {
  console.log('🎉 BACKEND AIRSMART INICIADO!');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log('⏰ Iniciado em:', new Date().toLocaleString('pt-BR'));
  console.log('');
  console.log('📋 ROTAS DISPONÍVEIS:');
  console.log('   🔐 AUTENTICAÇÃO');
  console.log('      POST /auth/login          - Login do usuário');
  console.log('      POST /auth/cadastro       - Cadastro de usuário');
  console.log('');
  console.log('   📱 APARELHOS');
  console.log('      GET  /aparelhos           - Listar aparelhos');
  console.log('      POST /aparelhos           - Adicionar aparelho');
  console.log('      GET  /aparelhos/:id       - Buscar aparelho por ID');
  console.log('');
  console.log('   🌡️  MEDIÇÕES');
  console.log('      GET  /temperatura         - Todas as medições');
  console.log('      POST /temperatura         - Nova medição');
  console.log('      GET  /temperatura/aparelho/:id - Histórico do aparelho');
  console.log('');
  console.log('   🔧 UTILITÁRIOS');
  console.log('      GET  /status              - Status do sistema');
  console.log('      GET  /reset               - Resetar dados (dev)');
  console.log('');
  console.log('🔑 CREDENCIAIS DE TESTE:');
  console.log('   Número do aparelho: 001');
  console.log('   Senha: 123');
  console.log('');
  console.log('💾 DADOS INICIAIS:');
  console.log('   Aparelhos cadastrados:', aparelhos.length);
  console.log('   Medições registradas:', temperaturas.length);
});