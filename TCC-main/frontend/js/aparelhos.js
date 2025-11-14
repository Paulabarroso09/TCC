// aparelhos.js - VERSÃO COMPLETA CONECTADA COM API
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🎯 Tela de aparelhos carregada!");

    // Verificar autenticação
    if (!apiService.isAuthenticated()) {
        alert('⚠️ Faça login primeiro!');
        window.location.href = 'index.html';
        return;
    }

    try {
        console.log('📡 Buscando aparelhos da API...');
        const aparelhos = await apiService.getAparelhos();
        console.log('✅ Aparelhos recebidos:', aparelhos);
        
        atualizarListaAparelhos(aparelhos);
        
    } catch (error) {
        console.error('❌ Erro ao carregar aparelhos:', error);
        alert('Erro ao carregar aparelhos: ' + error.message);
    }

    // Configurar botão de adicionar
    const botao = document.querySelector('.add-aparelho-btn');
    if (botao) {
        botao.addEventListener('click', () => {
            window.location.href = 'adicionar.html';
        });
    }

    // Configurar formulário de manutenção
    const formManutencao = document.getElementById('form-manutencao');
    if (formManutencao) {
        formManutencao.addEventListener('submit', salvarManutencao);
    }
});

function atualizarListaAparelhos(aparelhos) {
    const container = document.querySelector('.aparelhos-list');
    
    if (!container) {
        console.error('❌ Container de aparelhos não encontrado');
        return;
    }

    if (aparelhos.length === 0) {
        container.innerHTML = `
            <div class="sem-aparelhos">
                <p>📭 Nenhum aparelho cadastrado</p>
                <p class="subtitulo">Clique em "Adicionar Aparelho" para começar</p>
            </div>
        `;
        return;
    }

    container.innerHTML = aparelhos.map(aparelho => `
        <div class="aparelho-card ${aparelho.status}" onclick="mostrarDetalhes(${aparelho.id})">
            <h3>${aparelho.nome_aparelho}</h3>
            <p>
                <span class="status ${aparelho.status}">${aparelho.status}</span> 
                Tipo: ${aparelho.tipo_ambiente} | Localização: ${aparelho.localizacao}
            </p>
            <small>Número: ${aparelho.numero_aparelho}</small>
        </div>
    `).join('');

    console.log('✅ Lista de aparelhos atualizada!');
}

// Variável global para armazenar o aparelho atual
let aparelhoAtual = null;

async function mostrarDetalhes(aparelhoId) {
    try {
        console.log('🔍 Buscando detalhes do aparelho:', aparelhoId);
        
        // Buscar aparelhos para encontrar o selecionado
        const aparelhos = await apiService.getAparelhos();
        aparelhoAtual = aparelhos.find(a => a.id === aparelhoId);
        
        if (!aparelhoAtual) {
            alert('❌ Aparelho não encontrado');
            return;
        }

        // Buscar medições deste aparelho
        const temperaturas = await apiService.getHistoricoAparelho(aparelhoId);
        const ultimaMedicao = temperaturas[0] || null;

        // Atualizar interface com dados reais
        atualizarDetalhesAparelho(aparelhoAtual, ultimaMedicao);
        
        // Mostrar container de detalhes
        const detalhesContainer = document.getElementById('detalhes-aparelho');
        if (detalhesContainer) {
            detalhesContainer.style.display = 'block';
            detalhesContainer.scrollIntoView({ behavior: 'smooth' });
        }

        console.log('✅ Detalhes carregados:', { aparelho: aparelhoAtual, ultimaMedicao });

    } catch (error) {
        console.error('❌ Erro ao carregar detalhes:', error);
        alert('Erro ao carregar detalhes do aparelho');
    }
}

function atualizarDetalhesAparelho(aparelho, ultimaMedicao) {
    // Informações do aparelho
    document.getElementById('detalhes-nome').textContent = aparelho.nome_aparelho;
    document.getElementById('info-modelo').textContent = aparelho.nome_aparelho;
    document.getElementById('info-localizacao').textContent = aparelho.localizacao;
    document.getElementById('info-serial').textContent = aparelho.numero_aparelho;
    document.getElementById('info-tipo').textContent = aparelho.tipo_ambiente;

    // Status da qualidade do ar (se houver medição)
    if (ultimaMedicao) {
        document.getElementById('temperatura').textContent = `${ultimaMedicao.temperatura}°C`;
        document.getElementById('co2').textContent = `${ultimaMedicao.co2 || '--'} ppm`;
        document.getElementById('umidade').textContent = `${ultimaMedicao.umidade}%`;
        
        // Atualizar indicador de qualidade
        const circulo = document.getElementById('circulo-qualidade');
        const texto = document.getElementById('texto-qualidade');
        if (circulo && texto) {
            circulo.className = 'circulo ' + ultimaMedicao.qualidade_ar;
            texto.textContent = ultimaMedicao.qualidade_ar.charAt(0).toUpperCase() + ultimaMedicao.qualidade_ar.slice(1);
        }

        // ✅ ATUALIZAÇÃO AUTOMÁTICA DAS PREVENÇÕES
        // Baseado nos dados REAIS da API/sensor
        atualizarPrevencoes(ultimaMedicao.qualidade_ar, ultimaMedicao);

    } else {
        // Sem dados de medição
        document.getElementById('temperatura').textContent = '--';
        document.getElementById('co2').textContent = '--';
        document.getElementById('umidade').textContent = '--';
        document.getElementById('texto-qualidade').textContent = 'Sem dados';
        
        // Ocultar prevenções quando não há dados
        ocultarPrevencoes();
    }

    // Carregar histórico de manutenções
    carregarHistoricoManutencoes(aparelho.id);
}

// Função para atualizar as prevenções baseado na qualidade do ar
function atualizarPrevencoes(qualidadeAr, dadosMedicao) {
    console.log("🎯 Atualizando prevenções automaticamente para:", qualidadeAr);
    
    const prevencoesContainer = document.getElementById('prevencoes-container');
    
    // Se o container não existir, criá-lo
    if (!prevencoesContainer) {
        criarContainerPrevencoes();
    }

    // ✅ LÓGICA AUTOMÁTICA: Mostrar prevenções apenas se a qualidade for ruim ou moderada
    if (qualidadeAr === 'ruim' || qualidadeAr === 'moderada') {
        console.log("🔄 Mostrando prevenções automaticamente");
        mostrarPrevencoes(qualidadeAr, dadosMedicao);
    } else {
        console.log("✅ Qualidade boa - ocultando prevenções");
        ocultarPrevencoes();
    }
}

// Função para criar o container de prevenções
function criarContainerPrevencoes() {
    const infoGrid = document.querySelector('.info-grid');
    if (!infoGrid) return;

    const prevencoesHTML = `
        <div id="prevencoes-container" class="prevencoes-bubble" style="display: none;">
            <div class="prevencoes-header">
                <h3>⚠️ Sugestões de Prevenções</h3>
            </div>
            <div id="prevencoes-content" class="prevencoes-content">
                <!-- As prevenções serão inseridas aqui dinamicamente -->
            </div>
        </div>
    `;

    // Inserir após o info-grid
    infoGrid.insertAdjacentHTML('afterend', prevencoesHTML);

    // Adicionar estilos CSS dinamicamente
    adicionarEstilosPrevencoes();
}

// Função para mostrar as prevenções específicas
function mostrarPrevencoes(qualidadeAr, dadosMedicao) {
    const container = document.getElementById('prevencoes-container');
    const content = document.getElementById('prevencoes-content');

    if (!container || !content) return;

    let prevencoes = [];
    let iconePrincipal = "⚠️";

    if (qualidadeAr === 'ruim') {
        prevencoes = [
            { icon: "🚫", text: "Evite atividades físicas ao ar livre" },
            { icon: "🏠", text: "Mantenha portas e janelas fechadas" },
            { icon: "💨", text: "Utilize purificadores de ar se disponíveis" },
            { icon: "💧", text: "Beba bastante água para se manter hidratado" },
            { icon: "😷", text: "Use máscara em ambientes externos" }
        ];
        iconePrincipal = "🔴";
        
        // Aplicar classe para qualidade ruim
        container.className = 'prevencoes-bubble qualidade-ruim';
    } 
    else if (qualidadeAr === 'moderada') {
        prevencoes = [
            { icon: "🌬️", text: "Verifique a ventilação do ambiente" },
            { icon: "⚡", text: "Reduza atividades que gerem partículas" },
            { icon: "📊", text: "Monitore os níveis de CO₂ regularmente" },
            { icon: "💧", text: "Mantenha-se hidratado" },
            { icon: "🌿", text: "Considere usar plantas purificadoras" }
        ];
        iconePrincipal = "🟠";
        
        // Aplicar classe para qualidade moderada
        container.className = 'prevencoes-bubble qualidade-moderada';
    }

    // Adicionar prevenções específicas baseadas nos dados
    if (dadosMedicao.umidade < 40) {
        prevencoes.push({ icon: "💦", text: "Utilize umidificador de ar se possível" });
    }

    if (dadosMedicao.co2 > 1000) {
        prevencoes.push({ icon: "🪟", text: "Melhore a ventilação do ambiente" });
    }

    // Atualizar o conteúdo com design moderno
    content.innerHTML = `
        <div class="prevencoes-header">
            <div class="prevencoes-icon">${iconePrincipal}</div>
            <h3>Sugestões de Prevenções</h3>
        </div>
        <div class="prevencoes-content">
            ${prevencoes.map(prevencao => `
                <div class="prevencao-item">
                    <div class="prevencao-icon">${prevencao.icon}</div>
                    <div class="prevencao-text">${prevencao.text}</div>
                </div>
            `).join('')}
        </div>
    `;

    // Mostrar o container
    container.style.display = 'block';
}

// Função para ocultar as prevenções
function ocultarPrevencoes() {
    const container = document.getElementById('prevencoes-container');
    if (container) {
        container.style.display = 'none';
    }
}

// Função para adicionar estilos CSS para as prevenções
function adicionarEstilosPrevencoes() {
    const styles = `
        <style>
            .prevencoes-bubble {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 16px;
                padding: 24px;
                margin: 25px 0;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                animation: slideIn 0.4s ease-out;
                border: 1px solid rgba(255,255,255,0.2);
                backdrop-filter: blur(10px);
                position: relative;
                overflow: hidden;
            }

            .prevencoes-bubble::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #ff6b6b, #ffa726);
            }

            .prevencoes-bubble.qualidade-ruim {
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
            }

            .prevencoes-bubble.qualidade-ruim::before {
                background: linear-gradient(90deg, #ff4757, #ff3838);
            }

            .prevencoes-bubble.qualidade-moderada {
                background: linear-gradient(135deg, #ffa726 0%, #ff9800 100%);
            }

            .prevencoes-bubble.qualidade-moderada::before {
                background: linear-gradient(90deg, #ffb74d, #ffa726);
            }

            .prevencoes-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 20px;
            }

            .prevencoes-header h3 {
                color: white;
                margin: 0;
                font-size: 1.3em;
                font-weight: 600;
                text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .prevencoes-icon {
                width: 32px;
                height: 32px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.1em;
            }

            .prevencoes-content {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .prevencao-item {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 14px 16px;
                background: rgba(255,255,255,0.1);
                border-radius: 12px;
                color: white;
                font-size: 0.95em;
                line-height: 1.5;
                backdrop-filter: blur(5px);
                border: 1px solid rgba(255,255,255,0.1);
                transition: all 0.3s ease;
            }

            .prevencao-item:hover {
                background: rgba(255,255,255,0.15);
                transform: translateX(5px);
            }

            .prevencao-item:last-child {
                border-bottom: none;
            }

            .prevencao-icon {
                font-size: 1.2em;
                flex-shrink: 0;
                margin-top: 2px;
            }

            .prevencao-text {
                flex: 1;
            }

            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            /* Efeito de brilho suave */
            .prevencoes-bubble::after {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                opacity: 0;
                animation: glow 3s ease-in-out infinite;
            }

            @keyframes glow {
                0%, 100% { opacity: 0; }
                50% { opacity: 1; }
            }
        </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
}

function fecharDetalhes() {
    const detalhesContainer = document.getElementById('detalhes-aparelho');
    if (detalhesContainer) {
        detalhesContainer.style.display = 'none';
    }
    aparelhoAtual = null;
    
    // Ocultar prevenções ao fechar detalhes
    ocultarPrevencoes();
}

function salvarManutencao(event) {
    event.preventDefault();
    
    if (!aparelhoAtual) {
        alert('❌ Nenhum aparelho selecionado');
        return;
    }

    const formData = new FormData(event.target);
    const dados = {
        ultimaManutencao: formData.get('ultima-manutencao'),
        proximaManutencao: formData.get('proxima-manutencao'),
        ultimaLimpeza: formData.get('ultima-limpeza'),
        tipoManutencao: formData.get('tipo-manutencao'),
        observacoes: formData.get('observacoes'),
        dataRegistro: new Date().toISOString()
    };
    
    // Validar dados
    if (!dados.ultimaManutencao && !dados.ultimaLimpeza) {
        alert('Por favor, preencha pelo menos uma data de manutenção ou limpeza.');
        return;
    }
    
    // Salvar no localStorage (simulação)
    salvarNoHistorico(aparelhoAtual.id, dados);
    
    // Recarregar histórico
    carregarHistoricoManutencoes(aparelhoAtual.id);
    
    // Limpar formulário
    limparFormulario();
    
    alert('✅ Registro de manutenção salvo com sucesso!');
}

function salvarNoHistorico(aparelhoId, dados) {
    const historico = JSON.parse(localStorage.getItem(`historico-${aparelhoId}`) || '[]');
    historico.unshift(dados);
    localStorage.setItem(`historico-${aparelhoId}`, JSON.stringify(historico));
}

function carregarHistoricoManutencoes(aparelhoId) {
    const historico = JSON.parse(localStorage.getItem(`historico-${aparelhoId}`) || '[]');
    const lista = document.getElementById('lista-historico');
    
    if (!lista) return;

    if (historico.length === 0) {
        lista.innerHTML = '<p class="sem-historico">Nenhum registro de manutenção encontrado.</p>';
        return;
    }
    
    lista.innerHTML = historico.map(item => `
        <div class="historico-item">
            <div class="historico-data">${formatarData(item.dataRegistro)}</div>
            <div class="historico-tipo">${item.tipoManutencao || 'Manutenção Geral'}</div>
            ${item.observacoes ? `<div class="historico-obs">${item.observacoes}</div>` : ''}
            ${item.ultimaManutencao ? `<small>Última manutenção: ${formatarDataBR(item.ultimaManutencao)}</small><br>` : ''}
            ${item.ultimaLimpeza ? `<small>Última limpeza: ${formatarDataBR(item.ultimaLimpeza)}</small>` : ''}
        </div>
    `).join('');
}

function formatarData(dataString) {
    return new Date(dataString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatarDataBR(dataString) {
    return new Date(dataString).toLocaleDateString('pt-BR');
}

function limparFormulario() {
    const form = document.getElementById('form-manutencao');
    if (form) {
        form.reset();
    }
}