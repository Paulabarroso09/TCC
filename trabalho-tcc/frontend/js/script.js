// script.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cadastroForm');
  const button = document.getElementById('btnCadastrar');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nomeCompleto = document.getElementById('nomeCompleto').value.trim();
    const numeroAcordo = document.getElementById('numeroAcordo').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    // Validações
    if (!nomeCompleto || !numeroAcordo || !senha || !confirmarSenha) {
      showMessage('Por favor, preencha todos os campos.', 'error');
      return;
    }

    if (senha !== confirmarSenha) {
      showMessage('As senhas não coincidem.', 'error');
      return;
    }

    if (senha.length < 6) {
      showMessage('A senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }

    // Estado de carregamento
    button.disabled = true;
    button.textContent = 'CRIANDO CONTA...';

    try {
      const response = await fetch('http://localhost:3000/api/cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome_completo: nomeCompleto,
          numero_acordo: numeroAcordo,
          senha: senha
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showMessage('Conta criada com sucesso! Redirecionando para login...');
        setTimeout(() => window.location.href = 'index.html', 2000);
      } else {
        showMessage(result.message || 'Erro ao criar conta.', 'error');
      }
    } catch (error) {
      showMessage('Erro de conexão. Tente novamente.', 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'CRIAR CONTA';
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
      padding: 10px;
      margin: 10px 0;
      border-radius: 5px;
      text-align: center;
      font-weight: bold;
      ${type === 'error' ? 'background: #ffebee; color: #c62828; border: 1px solid #ef5350;' : 'background: #e8f5e8; color: #2e7d32; border: 1px solid #4caf50;'}
    `;
    
    // Insere antes do formulário
    form.parentNode.insertBefore(messageDiv, form);
    
    // Remove após 5 segundos
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }

  // Permitir envio com tecla Enter
  document.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      button.click();
    }
  });
});