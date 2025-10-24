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
    } else {
        // Sem dados de medição
        document.getElementById('temperatura').textContent = '--';
        document.getElementById('co2').textContent = '--';
        document.getElementById('umidade').textContent = '--';
        document.getElementById('texto-qualidade').textContent = 'Sem dados';
    }

    // Carregar histórico de manutenções
    carregarHistoricoManutencoes(aparelho.id);
}

function fecharDetalhes() {
    const detalhesContainer = document.getElementById('detalhes-aparelho');
    if (detalhesContainer) {
        detalhesContainer.style.display = 'none';
    }
    aparelhoAtual = null;
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