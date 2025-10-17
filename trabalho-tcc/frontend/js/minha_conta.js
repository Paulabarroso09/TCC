// Estado de edição
let editMode = {
    personalInfo: false,
    addressInfo: false,
    preferences: false
};

// Dados originais do usuário
let userData = {
    nome: "João Silva",
    email: "joao.silva@email.com",
    telefone: "(11) 99999-9999",
    nascimento: "1990-01-01",
    cep: "01234-567",
    endereco: "Rua das Flores, 123",
    cidade: "São Paulo",
    estado: "SP",
    notificacoes: true,
    alertas: true,
    newsletter: false
};

// Backup dos dados durante edição
let backupData = {};

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    setupEventListeners();
    setupEditButtons();
    checkLoginStatus();
});

// Verifica se o usuário está logado
function checkLoginStatus() {
    if (!Auth.isLoggedIn()) {
        showNotification('Você precisa estar logado para acessar esta página', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
}

// Carrega os dados do usuário nos campos
function loadUserData() {
    // Tenta carregar dados do localStorage primeiro
    const savedData = localStorage.getItem('userProfileData');
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            userData = { ...userData, ...parsedData };
        } catch (e) {
            console.log('Erro ao carregar dados salvos, usando dados padrão');
        }
    }

    document.getElementById('nome').value = userData.nome;
    document.getElementById('email').value = userData.email;
    document.getElementById('telefone').value = userData.telefone;
    document.getElementById('nascimento').value = userData.nascimento;
    document.getElementById('cep').value = userData.cep;
    document.getElementById('endereco').value = userData.endereco;
    document.getElementById('cidade').value = userData.cidade;
    document.getElementById('estado').value = userData.estado;
    document.getElementById('notificacoes').checked = userData.notificacoes;
    document.getElementById('alertas').checked = userData.alertas;
    document.getElementById('newsletter').checked = userData.newsletter;
}

// Configura os event listeners
function setupEventListeners() {
    // Formatação automática do telefone
    document.getElementById('telefone').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            if (value.length <= 10) {
                value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            } else {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            }
            e.target.value = value;
        }
    });

    // Formatação automática do CEP
    document.getElementById('cep').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 8) {
            value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
            e.target.value = value;
        }
    });

    // Busca automática de endereço pelo CEP
    document.getElementById('cep').addEventListener('blur', function(e) {
        if (e.target.value.length === 9 && editMode.addressInfo) {
            searchAddressByCEP(e.target.value);
        }
    });

    // Validação de e-mail
    document.getElementById('email').addEventListener('blur', function(e) {
        if (editMode.personalInfo) {
            validateEmail(e.target.value);
        }
    });

    // Validação de data de nascimento
    document.getElementById('nascimento').addEventListener('change', function(e) {
        if (editMode.personalInfo) {
            validateBirthDate(e.target.value);
        }
    });

    // Enter para salvar em campos de edição
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && isAnySectionEditing()) {
            const focused = document.activeElement;
            if (focused.tagName === 'INPUT' && !focused.readOnly) {
                e.preventDefault();
                saveChanges();
            }
        }

        // ESC para cancelar edição
        if (e.key === 'Escape' && isAnySectionEditing()) {
            cancelEdit();
        }
    });
}

// Configura os botões de edição
function setupEditButtons() {
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const section = this.closest('.profile-section');
            if (section.id === 'personalInfo') {
                toggleEdit('personalInfo');
            } else if (section.id === 'addressInfo') {
                toggleEdit('addressInfo');
            } else if (section.id === 'preferences') {
                toggleEdit('preferences');
            }
        });
    });
}

// Verifica se alguma seção está em modo de edição
function isAnySectionEditing() {
    return Object.values(editMode).some(mode => mode === true);
}

// Alterna modo de edição
function toggleEdit(section) {
    editMode[section] = !editMode[section];
    
    const sectionElement = document.getElementById(section);
    const inputs = sectionElement.querySelectorAll('input');
    const button = sectionElement.querySelector('.edit-btn');
    
    if (editMode[section]) {
        // Entrando no modo de edição - fazer backup
        backupSectionData(section);
        enableInputs(inputs, button);
        
        // Foca no primeiro campo editável
        const firstInput = Array.from(inputs).find(input => !input.disabled);
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    } else {
        // Saindo do modo de edição - restaurar backup
        restoreSectionData(section);
        disableInputs(inputs, button);
    }
}

// Faz backup dos dados da seção
function backupSectionData(section) {
    const sectionElement = document.getElementById(section);
    const inputs = sectionElement.querySelectorAll('input');
    
    backupData[section] = {};
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            backupData[section][input.id] = input.checked;
        } else {
            backupData[section][input.id] = input.value;
        }
    });
}

// Restaura dados do backup
function restoreSectionData(section) {
    const sectionElement = document.getElementById(section);
    const inputs = sectionElement.querySelectorAll('input');
    
    if (backupData[section]) {
        inputs.forEach(input => {
            if (backupData[section][input.id] !== undefined) {
                if (input.type === 'checkbox') {
                    input.checked = backupData[section][input.id];
                } else {
                    input.value = backupData[section][input.id];
                }
            }
        });
    }
}

// Habilita inputs para edição
function enableInputs(inputs, button) {
    inputs.forEach(input => {
        input.readOnly = false;
        input.disabled = false;
        input.style.backgroundColor = 'white';
        input.style.color = '#333';
        input.style.borderColor = '#00aaff';
        input.style.cursor = 'text';
        
        // Adiciona classe de edição
        input.classList.add('editing');
    });
    
    button.textContent = 'Cancelar';
    button.style.background = '#dc3545';
    button.classList.add('cancel-mode');
}

// Desabilita inputs
function disableInputs(inputs, button) {
    inputs.forEach(input => {
        input.readOnly = true;
        input.style.backgroundColor = '#f8f9fa';
        input.style.color = '#666';
        input.style.borderColor = '#e1e5e9';
        input.style.cursor = 'not-allowed';
        
        // Remove classe de edição
        input.classList.remove('editing');
    });
    
    button.textContent = 'Editar';
    button.style.background = '#00aaff';
    button.classList.remove('cancel-mode');
}

// Busca endereço pelo CEP
function searchAddressByCEP(cep) {
    const cleanCEP = cep.replace(/\D/g, '');
    
    if (cleanCEP.length !== 8) return;

    // Mostrar loading
    const enderecoInput = document.getElementById('endereco');
    const cidadeInput = document.getElementById('cidade');
    const estadoInput = document.getElementById('estado');
    
    const originalEndereco = enderecoInput.value;
    const originalCidade = cidadeInput.value;
    const originalEstado = estadoInput.value;
    
    enderecoInput.value = 'Buscando endereço...';
    cidadeInput.value = '...';
    estadoInput.value = '...';
    enderecoInput.disabled = true;
    cidadeInput.disabled = true;
    estadoInput.disabled = true;

    // Simulação de API (substitua por uma chamada real à API dos Correios)
    setTimeout(() => {
        // Dados mockados para exemplo
        const mockAddresses = {
            '01234567': {
                endereco: 'Rua das Flores, 123 - Jardim das Acácias',
                cidade: 'São Paulo',
                estado: 'SP'
            },
            '12345678': {
                endereco: 'Avenida Paulista, 1000 - Bela Vista',
                cidade: 'São Paulo',
                estado: 'SP'
            },
            '04534000': {
                endereco: 'Avenida Brigadeiro Faria Lima, 1500',
                cidade: 'São Paulo',
                estado: 'SP'
            },
            '22041011': {
                endereco: 'Avenida Atlântica, 100 - Copacabana',
                cidade: 'Rio de Janeiro',
                estado: 'RJ'
            }
        };

        const address = mockAddresses[cleanCEP];
        
        if (address) {
            enderecoInput.value = address.endereco;
            cidadeInput.value = address.cidade;
            estadoInput.value = address.estado;
            showNotification('Endereço encontrado com sucesso!', 'success');
        } else {
            enderecoInput.value = originalEndereco;
            cidadeInput.value = originalCidade;
            estadoInput.value = originalEstado;
            showNotification('CEP não encontrado. Verifique o número.', 'error');
        }
        
        enderecoInput.disabled = false;
        cidadeInput.disabled = false;
        estadoInput.disabled = false;
    }, 1500);
}

// Valida e-mail
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailInput = document.getElementById('email');
    
    if (!emailRegex.test(email)) {
        emailInput.style.borderColor = '#dc3545';
        showNotification('Por favor, insira um e-mail válido.', 'error');
        return false;
    } else {
        emailInput.style.borderColor = '#28a745';
        return true;
    }
}

// Valida data de nascimento
function validateBirthDate(date) {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const nascimentoInput = document.getElementById('nascimento');
    
    if (age < 13) {
        nascimentoInput.style.borderColor = '#dc3545';
        showNotification('Você deve ter pelo menos 13 anos para usar o sistema.', 'error');
        return false;
    } else if (age > 120) {
        nascimentoInput.style.borderColor = '#dc3545';
        showNotification('Por favor, verifique sua data de nascimento.', 'error');
        return false;
    } else {
        nascimentoInput.style.borderColor = '#28a745';
        return true;
    }
}

// Mostra notificação
function showNotification(message, type) {
    // Remove notificação anterior se existir
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    if (type === 'success') {
        notification.style.background = '#28a745';
    } else if (type === 'error') {
        notification.style.background = '#dc3545';
    } else if (type === 'info') {
        notification.style.background = '#17a2b8';
    } else {
        notification.style.background = '#007bff';
    }
    
    document.body.appendChild(notification);
    
    // Remove automaticamente após 4 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// Altera senha
function changePassword() {
    const newPassword = prompt('Digite sua nova senha:');
    if (newPassword) {
        if (newPassword.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        
        const confirmPassword = prompt('Confirme sua nova senha:');
        if (newPassword === confirmPassword) {
            // Simulação de alteração de senha
            showNotification('Senha alterada com sucesso!', 'success');
            // Aqui você faria a chamada para a API
        } else {
            showNotification('As senhas não coincidem!', 'error');
        }
    }
}

// Habilita autenticação em 2 fatores
function enable2FA() {
    const enable = confirm('Deseja habilitar a autenticação em 2 fatores?\n\nIsso adicionará uma camada extra de segurança à sua conta.');
    if (enable) {
        // Simulação de ativação do 2FA
        showNotification('Autenticação em 2 fatores habilitada! Você receberá um e-mail com as instruções.', 'success');
        // Aqui você faria a chamada para a API
    }
}

// Coleta dados do formulário
function collectFormData() {
    return {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        nascimento: document.getElementById('nascimento').value,
        cep: document.getElementById('cep').value,
        endereco: document.getElementById('endereco').value,
        cidade: document.getElementById('cidade').value,
        estado: document.getElementById('estado').value,
        notificacoes: document.getElementById('notificacoes').checked,
        alertas: document.getElementById('alertas').checked,
        newsletter: document.getElementById('newsletter').checked
    };
}

// Valida todos os dados antes de salvar
function validateFormData(data) {
    // Validar e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Por favor, insira um e-mail válido.', 'error');
        return false;
    }
    
    // Validar telefone (pelo menos 10 dígitos)
    const phoneDigits = data.telefone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
        showNotification('Por favor, insira um telefone válido com DDD.', 'error');
        return false;
    }
    
    // Validar data de nascimento
    const birthDate = new Date(data.nascimento);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 13 || age > 120) {
        showNotification('Data de nascimento inválida. Você deve ter entre 13 e 120 anos.', 'error');
        return false;
    }
    
    // Validar CEP
    const cepDigits = data.cep.replace(/\D/g, '');
    if (cepDigits.length !== 8) {
        showNotification('Por favor, insira um CEP válido com 8 dígitos.', 'error');
        return false;
    }
    
    return true;
}

// Salva as alterações
function saveChanges() {
    const updatedData = collectFormData();
    
    if (!validateFormData(updatedData)) {
        return;
    }
    
    // Mostra loading
    showNotification('Salvando alterações...', 'info');
    
    // Simulação de salvamento (substitua por chamada API real)
    setTimeout(() => {
        // Atualiza os dados do usuário
        userData = { ...userData, ...updatedData };
        
        // Salva no localStorage (simulação de banco de dados)
        localStorage.setItem('userProfileData', JSON.stringify(userData));
        
        // Desativa todos os modos de edição
        Object.keys(editMode).forEach(section => {
            editMode[section] = false;
            const sectionElement = document.getElementById(section);
            const inputs = sectionElement.querySelectorAll('input');
            const button = sectionElement.querySelector('.edit-btn');
            if (button) disableInputs(inputs, button);
        });
        
        // Limpa o backup
        backupData = {};
        
        showNotification('Alterações salvas com sucesso!', 'success');
        
        // Log dos dados salvos (para demonstração)
        console.log('Dados do perfil salvos:', userData);
        
    }, 1500);
}

// Cancela a edição
function cancelEdit() {
    if (confirm('Tem certeza que deseja cancelar? Todas as alterações não salvas serão perdidas.')) {
        // Restaura dados originais
        loadUserData();
        
        // Desativa todos os modos de edição
        Object.keys(editMode).forEach(section => {
            editMode[section] = false;
            const sectionElement = document.getElementById(section);
            const inputs = sectionElement.querySelectorAll('input');
            const button = sectionElement.querySelector('.edit-btn');
            if (button) disableInputs(inputs, button);
        });
        
        // Limpa o backup
        backupData = {};
        
        showNotification('Alterações canceladas.', 'info');
    }
}

// Sistema completo de autenticação
const Auth = {
    // Verifica se o usuário está logado
    isLoggedIn: function() {
        return localStorage.getItem('userLoggedIn') === 'true';
    },

    // Faz login do usuário
    login: function() {
        localStorage.setItem('userLoggedIn', 'true');
        showNotification('Login realizado com sucesso!', 'success');
    },

    // Faz logout do usuário
    logout: function() {
        if (confirm('Deseja realmente sair da sua conta?\n\nVocê será redirecionado para a página inicial.')) {
            showNotification('Saindo da conta...', 'info');
            
            // Desativa todos os modos de edição antes de sair
            Object.keys(editMode).forEach(section => {
                editMode[section] = false;
                const sectionElement = document.getElementById(section);
                if (sectionElement) {
                    const inputs = sectionElement.querySelectorAll('input');
                    const button = sectionElement.querySelector('.edit-btn');
                    if (button) disableInputs(inputs, button);
                }
            });
            
            // Limpa dados de sessão
            setTimeout(() => {
                // Remove o status de login (mas mantém os dados do perfil)
                localStorage.removeItem('userLoggedIn');
                
                // Redireciona para a página inicial
                window.location.href = 'index.html';
            }, 1000);
        }
    },

    // Verifica e redireciona se não estiver logado
    requireAuth: function() {
        if (!this.isLoggedIn()) {
            showNotification('Você precisa fazer login para acessar esta página', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return false;
        }
        return true;
    }
};

// Inicialização para demonstração - REMOVER EM PRODUÇÃO
// Simula que o usuário está logado quando a página carrega
if (!Auth.isLoggedIn()) {
    // Para demonstração, vamos simular que o usuário está logado
    Auth.login();
}