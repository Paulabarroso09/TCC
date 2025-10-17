// login.js
document.addEventListener('DOMContentLoaded', function() {
    const btnLogin = document.getElementById('btnLogin');
    const numeroAparelho = document.getElementById('numeroAparelho');
    const senha = document.getElementById('senha');

    // Se não encontrar o botão pelo ID, vamos criar um
    if (!btnLogin) {
        // Encontrar o botão/link de ENTRAR
        const entrarBtn = document.querySelector('.button, a[href="dashboard.html"]');
        if (entrarBtn && entrarBtn.tagName === 'A') {
            // Converter o link em botão
            const newBtn = document.createElement('button');
            newBtn.type = 'button';
            newBtn.id = 'btnLogin';
            newBtn.className = 'button';
            newBtn.textContent = 'ENTRAR';
            entrarBtn.parentNode.replaceChild(newBtn, entrarBtn);
        }
    }

    const loginButton = document.getElementById('btnLogin') || document.querySelector('.button');

    loginButton.addEventListener('click', async function() {
        const numero = numeroAparelho.value.trim();
        const password = senha.value;

        if (!numero || !password) {
            showMessage('Por favor, preencha todos os campos.', 'error');
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = 'ENTRANDO...';

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    numero_aparelho: numero,
                    senha: password
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Salvar usuário no localStorage
                localStorage.setItem('user', JSON.stringify(result.user));
                
                showMessage('Login realizado com sucesso! Redirecionando...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showMessage(result.message || 'Credenciais inválidas. Tente novamente.', 'error');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            showMessage('Erro de conexão. Verifique se o servidor está rodando.', 'error');
        } finally {
            loginButton.disabled = false;
            loginButton.textContent = 'ENTRAR';
        }
    });

    // Função para mostrar mensagens
    function showMessage(message, type = 'success') {
        // Remove mensagens anteriores
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            padding: 12px;
            margin: 15px 0;
            border-radius: 8px;
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            ${type === 'error' ? 
                'background: #ffebee; color: #c62828; border: 1px solid #ef5350;' : 
                'background: #e8f5e8; color: #2e7d32; border: 1px solid #4caf50;'
            }
        `;
        
        // Encontrar onde inserir a mensagem
        const loginBox = document.querySelector('.login-box');
        const forgotLink = document.querySelector('.forgot');
        
        if (forgotLink) {
            loginBox.insertBefore(messageDiv, forgotLink.nextSibling);
        } else {
            const entrarBtn = document.getElementById('btnLogin') || document.querySelector('.button');
            loginBox.insertBefore(messageDiv, entrarBtn);
        }
        
        // Remove após 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Permitir login com Enter
    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            const loginBtn = document.getElementById('btnLogin') || document.querySelector('.button');
            if (loginBtn) {
                loginBtn.click();
            }
        }
    });
});