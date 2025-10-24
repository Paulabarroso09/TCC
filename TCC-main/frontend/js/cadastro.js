document.addEventListener('DOMContentLoaded', function() {
    const cadastroForm = document.querySelector('form');
    
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Pegar valores dos campos - ajuste conforme seu HTML
            const nomeCompleto = document.querySelector('input[placeholder*="nome completo"]').value;
            const email = document.querySelector('input[placeholder*="email"]').value;
            const numeroAparelho = document.querySelector('input[placeholder*="número do aparelho"]').value;
            const senha = document.querySelectorAll('input[type="password"]')[0].value;
            const confirmarSenha = document.querySelectorAll('input[type="password"]')[1].value;
            
            if (senha !== confirmarSenha) {
                alert('❌ As senhas não coincidem!');
                return;
            }
            
            const dadosUsuario = {
                nome_completo: nomeCompleto,
                email: email,
                numero_aparelho: numeroAparelho,
                senha: senha
            };
            
            try {
                console.log('Cadastrando usuário...', dadosUsuario);
                
                const resultado = await apiService.cadastro(dadosUsuario);
                
                alert('✅ Cadastro realizado com sucesso! Faça login para continuar.');
                window.location.href = 'index.html';
                
            } catch (error) {
                console.error('Erro no cadastro:', error);
                alert('❌ Erro no cadastro: ' + error.message);
            }
        });
    }
});