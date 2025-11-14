const API_BASE = 'http://localhost:3000';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    // Headers para requisições
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Login
    async login(numeroAparelho, senha) {
        try {
            console.log('Fazendo login...', numeroAparelho);
            
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ 
                    numero_aparelho: numeroAparelho, 
                    senha: senha 
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                localStorage.setItem('token', data.token);
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                return data;
            } else {
                throw new Error(data.error || 'Erro no login');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            throw new Error('Erro de conexão com o servidor');
        }
    }

    // Cadastro
    async cadastro(dadosUsuario) {
        try {
            const response = await fetch(`${API_BASE}/auth/cadastro`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(dadosUsuario)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Erro no cadastro');
            }
            
            return data;
        } catch (error) {
            console.error('Erro no cadastro:', error);
            throw new Error('Erro de conexão com o servidor');
        }
    }

    // Buscar aparelhos
    async getAparelhos() {
        try {
            const response = await fetch(`${API_BASE}/aparelhos`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Erro ao buscar aparelhos');
            }
            
            return data;
        } catch (error) {
            console.error('Erro ao buscar aparelhos:', error);
            throw new Error('Erro de conexão com o servidor');
        }
    }

    // ✅ ADICIONADO: Registrar novo aparelho
    async registrarAparelho(dadosAparelho) {
        try {
            console.log('📦 Registrando novo aparelho:', dadosAparelho);
            
            const response = await fetch(`${API_BASE}/aparelhos`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(dadosAparelho)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Erro ao registrar aparelho');
            }
            
            console.log('✅ Aparelho registrado com sucesso:', data);
            return data;
        } catch (error) {
            console.error('Erro ao registrar aparelho:', error);
            throw new Error('Erro de conexão com o servidor');
        }
    }

    // Buscar histórico de temperaturas
    async getTemperatura() {
        try {
            const response = await fetch(`${API_BASE}/temperatura`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Erro ao buscar temperaturas');
            }
            
            return data;
        } catch (error) {
            console.error('Erro ao buscar temperaturas:', error);
            throw new Error('Erro de conexão com o servidor');
        }
    }

    // Buscar histórico específico de um aparelho
    async getHistoricoAparelho(aparelhoId) {
        try {
            const response = await fetch(`${API_BASE}/temperatura/aparelho/${aparelhoId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Erro ao buscar histórico');
            }
            
            return data;
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
            throw new Error('Erro de conexão com o servidor');
        }
    }

    // Registrar nova medição (para o ESP32)
    async registrarMedicao(dadosMedicao) {
        try {
            const response = await fetch(`${API_BASE}/temperatura`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(dadosMedicao)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Erro ao registrar medição');
            }
            
            return data;
        } catch (error) {
            console.error('Erro ao registrar medição:', error);
            throw new Error('Erro de conexão com o servidor');
        }
    }

    // Logout
    logout() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = 'index.html';
    }

    // Verificar se está autenticado
    isAuthenticated() {
        return !!this.token;
    }

    // Get usuário atual
    getUsuarioAtual() {
        const usuario = localStorage.getItem('usuario');
        return usuario ? JSON.parse(usuario) : null;
    }

    // Verificar conexão com a API
    async verificarConexao() {
        try {
            const response = await fetch(`${API_BASE}/`);
            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error('API offline');
        }
    }
}

// Instância global
const apiService = new ApiService();