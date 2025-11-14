document.addEventListener('DOMContentLoaded', () => {
    console.log("Tela de detalhes do aparelho carregada!");
    
    // Obter ID do aparelho da URL
    const urlParams = new URLSearchParams(window.location.search);
    const aparelhoId = urlParams.get('id');
    
    // Carregar dados do aparelho
    carregarDadosAparelho(aparelhoId);
    
    // Configurar formulário
    const form = document.getElementById('form-manutencao');
    form.addEventListener('submit', salvarManutencao);
    
    // Carregar histórico
    carregarHistorico(aparelhoId);
});

function carregarDadosAparelho(aparelhoId) {
    // Simulação de dados - em uma aplicação real, isso viria de uma API
    const aparelhos = {
        'principal': {
            nome: 'Aparelho Principal',
            modelo: 'AirSmart Pro',
            localizacao: 'Sala de Estar',
            serial: 'AS-2024-PRO-001',
            status: 'ativo',
            qualidade: 'boa',
            pm25: '12 µg/m³',
            co2: '450 ppm',
            umidade: '55%'
        },
        'quarto': {
            nome: 'Aparelho Quarto',
            modelo: 'AirSmart Lite',
            localizacao: 'Quarto Principal',
            serial: 'AS-2024-LITE-002',
            status: 'ativo',
            qualidade: 'moderada',
            pm25: '35 µg/m³',
            co2: '600 ppm',
            umidade: '50%'
        },
        'cozinha': {
            nome: 'Aparelho Cozinha',
            modelo: 'AirSmart Pro',
            localizacao: 'Cozinha',
            serial: 'AS-2024-PRO-003',
            status: 'inativo',
            qualidade: 'ruim',
            pm25: '45 µg/m³',
            co2: '800 ppm',
            umidade: '65%'
        }
    };
    
    const aparelho = aparelhos[aparelhoId] || aparelhos['principal'];
    
    // Atualizar interface
    document.getElementById('aparelho-nome').textContent = aparelho.nome;
    document.getElementById('aparelho-status').textContent = aparelho.status === 'ativo' ? 'Ativo' : 'Inativo';
    document.getElementById('info-modelo').textContent = aparelho.modelo;
    document.getElementById('info-localizacao').textContent = aparelho.localizacao;
    document.getElementById('info-serial').textContent = aparelho.serial;
    
    // Atualizar qualidade do ar
    const circulo = document.getElementById('circulo-qualidade');
    const texto = document.getElementById('texto-qualidade');
    circulo.className = 'circulo ' + aparelho.qualidade;
    circulo.textContent = aparelho.qualidade.charAt(0).toUpperCase() + aparelho.qualidade.slice(1);
    texto.textContent = aparelho.qualidade.charAt(0).toUpperCase() + aparelho.qualidade.slice(1);
    
    document.getElementById('pm25').textContent = aparelho.pm25;
    document.getElementById('co2').textContent = aparelho.co2;
    document.getElementById('umidade').textContent = aparelho.umidade;
}

function salvarManutencao(event) {
    event.preventDefault();
    
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
    
    // Salvar no localStorage (em uma aplicação real, enviaria para uma API)
    const aparelhoId = new URLSearchParams(window.location.search).get('id');
    salvarNoHistorico(aparelhoId, dados);
    
    // Recarregar histórico
    carregarHistorico(aparelhoId);
    
    // Limpar formulário
    limparFormulario();
    
    alert('Registro de manutenção salvo com sucesso!');
}

function salvarNoHistorico(aparelhoId, dados) {
    const historico = JSON.parse(localStorage.getItem(`historico-${aparelhoId}`) || '[]');
    historico.unshift(dados);
    localStorage.setItem(`historico-${aparelhoId}`, JSON.stringify(historico));
}

function carregarHistorico(aparelhoId) {
    const historico = JSON.parse(localStorage.getItem(`historico-${aparelhoId}`) || '[]');
    const lista = document.getElementById('lista-historico');
    
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
    document.getElementById('form-manutencao').reset();
}

function atualizarDetalhesAparelho(aparelho, ultimaMedicao) {
    // ... código existente ...

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

        // Mostrar/ocultar prevenções baseado na qualidade do ar
        atualizarPrevencoes(ultimaMedicao.qualidade_ar, ultimaMedicao);

    } else {
        // Sem dados de medição - usar dados padrão BOA
        document.getElementById('temperatura').textContent = '22.8°C';
        document.getElementById('co2').textContent = '420 ppm';
        document.getElementById('umidade').textContent = '52.3%';
        document.getElementById('texto-qualidade').textContent = 'Boa';
        document.getElementById('circulo-qualidade').className = 'circulo boa';
        
        // Ocultar prevenções quando não há dados (qualidade boa)
        ocultarPrevencoes();
    }

    // ✅ ADICIONAR BOTÕES DE TESTE
    adicionarBotoesTeste();

    // Carregar histórico de manutenções
    carregarHistoricoManutencoes(aparelho.id);
}