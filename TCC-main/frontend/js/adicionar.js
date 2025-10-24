// adicionar.js - VERSÃO COMPLETA E ATUALIZADA
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Página de adicionar aparelho carregada');

    // Verificar autenticação
    if (!apiService.isAuthenticated()) {
        alert('⚠️ Faça login primeiro!');
        window.location.href = 'index.html';
        return;
    }

    console.log('✅ Usuário autenticado:', apiService.getUsuarioAtual());

    // Configurar formulário
    const form = document.getElementById('formAddDevice');
    if (!form) {
        console.error('❌ Formulário não encontrado');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const usuario = apiService.getUsuarioAtual();
            
            // Coletar dados do formulário
            const novoAparelho = {
                nome_aparelho: document.getElementById('nome').value.trim(),
                tipo_ambiente: document.getElementById('tipo').value,
                localizacao: document.getElementById('localizacao').value.trim(),
                numero_aparelho: document.getElementById('numeroSerie').value.trim(),
                usuario_id: usuario?.id || 1,
                status: 'ativo'
            };

            console.log('📦 Dados do novo aparelho:', novoAparelho);

            // Validar campos obrigatórios
            if (!novoAparelho.nome_aparelho) {
                alert('❌ Por favor, informe o nome do aparelho.');
                document.getElementById('nome').focus();
                return;
            }

            if (!novoAparelho.tipo_ambiente) {
                alert('❌ Por favor, selecione o tipo do aparelho.');
                document.getElementById('tipo').focus();
                return;
            }

            if (!novoAparelho.localizacao) {
                alert('❌ Por favor, informe a localização do aparelho.');
                document.getElementById('localizacao').focus();
                return;
            }

            if (!novoAparelho.numero_aparelho) {
                alert('❌ Por favor, informe o número do aparelho.');
                document.getElementById('numeroSerie').focus();
                return;
            }

            // Mostrar loading
            const botao = document.querySelector('.btn-add');
            const textoOriginal = botao.textContent;
            botao.disabled = true;
            botao.textContent = 'Adicionando...';
            botao.style.opacity = '0.7';

            console.log('📤 Enviando para API...');
            
            // ✅ USANDO A FUNÇÃO DO API SERVICE
            const resultado = await apiService.registrarAparelho(novoAparelho);
            
            console.log('✅ Resposta da API:', resultado);

            // Restaurar botão
            botao.disabled = false;
            botao.textContent = textoOriginal;
            botao.style.opacity = '1';

            // Mostrar mensagem de sucesso
            alert('🎉 Aparelho adicionado com sucesso!\n\nRedirecionando para a lista de aparelhos...');

            // ✅ REDIRECIONAR PARA APARELHOS COM PARÂMETRO DE REFRESH
            setTimeout(() => {
                window.location.href = 'aparelhos.html?refresh=' + Date.now();
            }, 1500);
            
        } catch (error) {
            console.error('❌ Erro ao adicionar aparelho:', error);
            
            // Restaurar botão em caso de erro
            const botao = document.querySelector('.btn-add');
            if (botao) {
                botao.disabled = false;
                botao.textContent = 'Adicionar Aparelho';
                botao.style.opacity = '1';
            }

            // Mensagem de erro específica
            let mensagemErro = 'Erro ao adicionar aparelho: ';
            
            if (error.message.includes('Failed to fetch')) {
                mensagemErro += 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
            } else if (error.message.includes('Erro ao registrar aparelho')) {
                mensagemErro += 'O servidor recusou a solicitação. Verifique os dados e tente novamente.';
            } else {
                mensagemErro += error.message;
            }

            alert('❌ ' + mensagemErro);
        }
    });

    // Botão voltar personalizado
    const voltarBtn = document.querySelector('.imagemVoltar');
    if (voltarBtn) {
        voltarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Deseja voltar para a lista de aparelhos? As alterações não salvas serão perdidas.')) {
                window.location.href = 'aparelhos.html';
            }
        });
    }

    // Enter para submeter formulário
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const focused = document.activeElement;
            if (focused && focused.form === document.getElementById('formAddDevice')) {
                document.querySelector('.btn-add').click();
            }
        }
    });

    console.log('✅ Página de adicionar aparelho configurada com sucesso');
});

// Função para validar formato do número do aparelho (opcional)
function validarNumeroAparelho(numero) {
    // Permitir letras, números e hífens
    const regex = /^[A-Za-z0-9-]+$/;
    return regex.test(numero);
}

// Função para sugerir número do aparelho baseado no tipo (opcional)
function sugerirNumeroAparelho() {
    const tipo = document.getElementById('tipo').value;
    const nome = document.getElementById('nome').value;
    
    if (tipo && nome) {
        const prefixo = tipo.substring(0, 3).toUpperCase();
        const sufixo = nome.replace(/\s+/g, '').substring(0, 4).toUpperCase();
        const numero = `${prefixo}-${sufixo}-${Date.now().toString().slice(-4)}`;
        
        document.getElementById('numeroSerie').value = numero;
    }
}

// Opcional: Adicionar sugestão automática ao mudar tipo ou nome
document.addEventListener('DOMContentLoaded', function() {
    const tipoSelect = document.getElementById('tipo');
    const nomeInput = document.getElementById('nome');
    
    if (tipoSelect && nomeInput) {
        tipoSelect.addEventListener('change', sugerirNumeroAparelho);
        nomeInput.addEventListener('blur', sugerirNumeroAparelho);
    }
});