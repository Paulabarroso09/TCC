// login.js - VERSÃO ESPECÍFICA PARA SEU HTML
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ login.js carregado! Iniciando configuração...');

    // Elementos do SEU HTML
    const btnLogin = document.getElementById('btnLogin');
    const numeroAparelho = document.getElementById('numeroAparelho');
    const senha = document.getElementById('senha');

    console.log('Elementos encontrados:', {
        btnLogin: btnLogin,
        numeroAparelho: numeroAparelho,
        senha: senha
    });

    // Evento de clique no botão ENTRAR
    if (btnLogin) {
        btnLogin.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const numero = numeroAparelho.value.trim();
            const password = senha.value;

            console.log('Tentando login com:', { numero, password });

            if (!numero || !password) {
                mostrarMensagem('Por favor, preencha todos os campos.', 'error');
                return;
            }

            // Desabilitar botão durante o login
            btnLogin.disabled = true;
            btnLogin.textContent = 'ENTRANDO...';

            try {
                console.log('🔐 Fazendo requisição para API...');
                
                // ✅ USANDO NOSSA API REAL
                const resultado = await apiService.login(numero, password);
                
                console.log('✅ Login bem-sucedido:', resultado);
                mostrarMensagem('Login realizado com sucesso! Redirecionando...', 'success');
                
                // Redirecionar após 1.5 segundos
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
                
            } catch (error) {
                console.error('❌ Erro no login:', error);
                mostrarMensagem(error.message || 'Credenciais inválidas. Tente novamente.', 'error');
            } finally {
                // Reabilitar botão
                btnLogin.disabled = false;
                btnLogin.textContent = 'ENTRAR';
            }
        });
    } else {
        console.error('❌ Botão de login não encontrado!');
    }

    // Login com Enter
    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            if (btnLogin) {
                btnLogin.click();
            }
        }
    });

    // Função para mostrar mensagens
    function mostrarMensagem(mensagem, tipo = 'success') {
        // Remover mensagens anteriores
        const mensagemAnterior = document.querySelector('.mensagem-login');
        if (mensagemAnterior) {
            mensagemAnterior.remove();
        }

        // Criar elemento de mensagem
        const mensagemDiv = document.createElement('div');
        mensagemDiv.className = `mensagem-login ${tipo}`;
        mensagemDiv.textContent = mensagem;
        mensagemDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 14px;
            z-index: 1000;
            max-width: 90%;
            text-align: center;
            ${tipo === 'error' ? 
                'background: #ff4444; color: white;' : 
                'background: #4CAF50; color: white;'
            }
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;

        // Adicionar ao body
        document.body.appendChild(mensagemDiv);

        // Remover após 4 segundos
        setTimeout(() => {
            if (mensagemDiv.parentNode) {
                mensagemDiv.remove();
            }
        }, 4000);
    }

    console.log('🎯 Login.js configurado com sucesso!');
    console.log('💡 Dica: Use Número "001" e Senha "123" para teste');
});