// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const database = require('./database/database');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Servir arquivos estáticos
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));
app.use('/imgs', express.static(path.join(__dirname, '../frontend/imgs')));

// Middleware de log para debug
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Rotas para páginas HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/cadastro.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

app.get('/aparelhos', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/aparelhos.html'));
});

app.get('/prevencoes', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/prevencoes.html'));
});

app.get('/historico', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/historico.html'));
});

app.get('/recuperacao_senha', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/recuperacao_senha.html'));
});

// API Routes

// Rota de cadastro
app.post('/api/cadastro', async (req, res) => {
  try {
    const { nome_completo, numero_acordo, senha } = req.body;

    console.log('Tentativa de cadastro:', { nome_completo, numero_acordo, senha });

    // Validações básicas
    if (!nome_completo || !numero_acordo || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios.'
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter pelo menos 6 caracteres.'
      });
    }

    // Verificar se usuário já existe
    const userExists = await database.userExists(numero_acordo);
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Número de acordo já cadastrado.'
      });
    }

    // Criar usuário
    const userId = await database.createUser({
      nome_completo,
      numero_acordo,
      senha
    });

    // Adicionar um aparelho padrão para o usuário
    await database.addAparelho(userId, 'Aparelho Principal', 1);

    // Adicionar dados iniciais no histórico
    await database.addHistorico({
      usuario_id: userId,
      qualidade: 'Boa',
      temperatura: 23.5,
      umidade: 45.0,
      poluicao: 12.3
    });

    console.log('Usuário criado com sucesso - ID:', userId);

    res.json({
      success: true,
      message: 'Usuário criado com sucesso',
      userId: userId
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota de login
app.post('/api/login', async (req, res) => {
  try {
    const { numero_aparelho, senha } = req.body;

    console.log('Tentativa de login:', { numero_aparelho, senha });

    if (!numero_aparelho || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Número do aparelho e senha são obrigatórios.'
      });
    }

    // Buscar usuário
    const user = await database.getUserByNumeroAcordo(numero_aparelho);
    
    console.log('Usuário encontrado no banco:', user);

    if (user) {
      // Verificar senha (comparação direta para teste)
      if (user.senha === senha) {
        console.log('Login bem-sucedido para usuário:', user.numero_acordo);
        
        return res.json({
          success: true,
          message: 'Login realizado com sucesso',
          user: {
            id: user.id,
            nome_completo: user.nome_completo,
            numero_acordo: user.numero_acordo
          }
        });
      } else {
        console.log('Senha incorreta para usuário:', user.numero_acordo);
        console.log('Senha fornecida:', senha);
        console.log('Senha no banco:', user.senha);
      }
    } else {
      console.log('Usuário não encontrado:', numero_aparelho);
    }

    // Credenciais inválidas
    res.status(401).json({
      success: false,
      message: 'Credenciais inválidas. Verifique o número do aparelho e senha.'
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota do dashboard
app.get('/api/dashboard/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Buscando dados do dashboard para usuário:', userId);

    // Buscar dados do dashboard
    const dashboardData = await database.getDashboardData(userId);
    
    console.log('Dados do dashboard:', dashboardData);
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({
      error: 'Erro ao buscar dados do dashboard'
    });
  }
});

// Rota para obter aparelhos do usuário
app.get('/api/aparelhos/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Buscando aparelhos para usuário:', userId);

    const aparelhos = await database.getAparelhosByUsuario(userId);
    
    res.json({
      success: true,
      aparelhos: aparelhos
    });
  } catch (error) {
    console.error('Erro ao buscar aparelhos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar aparelhos'
    });
  }
});

// Rota para obter histórico do usuário
app.get('/api/historico/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = req.query.limit || 10;
    console.log('Buscando histórico para usuário:', userId, 'limite:', limit);

    const historico = await database.getHistoricoByUsuario(userId, limit);
    
    res.json({
      success: true,
      historico: historico
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar histórico'
    });
  }
});

// Rota para obter prevenções
app.get('/api/prevencoes', async (req, res) => {
  try {
    console.log('Buscando prevenções');
    
    // Buscar todas as prevenções
    const [prevencoes] = await database.pool.execute(
      'SELECT * FROM prevencoes ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      prevencoes: prevencoes
    });
  } catch (error) {
    console.error('Erro ao buscar prevenções:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar prevenções'
    });
  }
});

// Rota para adicionar novo aparelho
app.post('/api/aparelhos', async (req, res) => {
  try {
    const { usuario_id, nome_aparelho, status_id } = req.body;
    
    console.log('Adicionando aparelho:', { usuario_id, nome_aparelho, status_id });

    if (!usuario_id || !nome_aparelho) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário e nome do aparelho são obrigatórios.'
      });
    }

    const aparelhoId = await database.addAparelho(
      usuario_id, 
      nome_aparelho, 
      status_id || 1
    );

    res.json({
      success: true,
      message: 'Aparelho adicionado com sucesso',
      aparelhoId: aparelhoId
    });
  } catch (error) {
    console.error('Erro ao adicionar aparelho:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar aparelho'
    });
  }
});

// Rota para adicionar dados ao histórico
app.post('/api/historico', async (req, res) => {
  try {
    const { usuario_id, qualidade, temperatura, umidade, poluicao } = req.body;
    
    console.log('Adicionando histórico:', { usuario_id, qualidade, temperatura, umidade, poluicao });

    if (!usuario_id) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório.'
      });
    }

    const historicoId = await database.addHistorico({
      usuario_id,
      qualidade,
      temperatura,
      umidade,
      poluicao
    });

    res.json({
      success: true,
      message: 'Dados de histórico adicionados com sucesso',
      historicoId: historicoId
    });
  } catch (error) {
    console.error('Erro ao adicionar histórico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar histórico'
    });
  }
});

// Rota para verificar saúde da API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API está funcionando corretamente',
    timestamp: new Date().toISOString()
  });
});

// Rota para listar todos os usuários (apenas para desenvolvimento)
app.get('/api/usuarios', async (req, res) => {
  try {
    const [usuarios] = await database.pool.execute(
      'SELECT id, nome_completo, numero_acordo, created_at FROM usuarios'
    );
    
    res.json({
      success: true,
      usuarios: usuarios
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuários'
    });
  }
});

// Rota para criar usuário de teste rápido
app.post('/api/create-test-user', async (req, res) => {
  try {
    const { numero_acordo, senha, nome_completo } = req.body;
    
    const userData = {
      numero_acordo: numero_acordo || '01',
      senha: senha || '123456',
      nome_completo: nome_completo || 'Usuário Teste'
    };

    console.log('Criando usuário de teste:', userData);

    // Verificar se usuário já existe
    const userExists = await database.userExists(userData.numero_acordo);
    
    if (userExists) {
      return res.json({
        success: true,
        message: 'Usuário de teste já existe',
        user: {
          numero_acordo: userData.numero_acordo,
          senha: userData.senha
        }
      });
    }

    // Criar usuário
    const userId = await database.createUser(userData);

    // Adicionar aparelho padrão
    await database.addAparelho(userId, 'Aparelho Principal', 1);

    // Adicionar histórico
    await database.addHistorico({
      usuario_id: userId,
      qualidade: 'Boa',
      temperatura: 23.5,
      umidade: 45.0,
      poluicao: 12.3
    });

    res.json({
      success: true,
      message: 'Usuário de teste criado com sucesso',
      user: {
        id: userId,
        numero_acordo: userData.numero_acordo,
        senha: userData.senha,
        nome_completo: userData.nome_completo
      }
    });
  } catch (error) {
    console.error('Erro ao criar usuário de teste:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário de teste'
    });
  }
});

// Rota catch-all para páginas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

const PORT = process.env.PORT || 3000;

// Inicializar servidor
async function startServer() {
  try {
    // Aguardar a inicialização do banco de dados
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    app.listen(PORT, () => {
      console.log('🚀 Servidor AirSmart iniciado com sucesso!');
      console.log(`📍 Porta: ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
      console.log(`👤 Criar usuário teste: http://localhost:${PORT}/api/create-test-user`);
      console.log('✅ Banco de dados MySQL conectado e configurado!');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Desligando servidor...');
  await database.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Desligando servidor...');
  await database.close();
  process.exit(0);
});