// create-test-user.js
const database = require('./database/database');

async function createTestUser() {
    try {
        // Verificar se usuário já existe
        const userExists = await database.userExists('01');
        
        if (!userExists) {
            // Criar usuário de teste
            const userId = await database.createUser({
                nome_completo: 'Usuário Teste',
                numero_acordo: '01',
                senha: '123456' // Senha simples para teste
            });

            // Adicionar aparelho
            await database.addAparelho(userId, 'Aparelho Principal', 1);

            // Adicionar histórico
            await database.addHistorico({
                usuario_id: userId,
                qualidade: 'Boa',
                temperatura: 23.5,
                umidade: 45.0,
                poluicao: 12.3
            });

            console.log('✅ Usuário de teste criado com sucesso!');
            console.log('Número do aparelho: 01');
            console.log('Senha: 123456');
        } else {
            console.log('✅ Usuário de teste já existe!');
            console.log('Número do aparelho: 01');
            console.log('Senha: 123456');
        }
    } catch (error) {
        console.error('Erro ao criar usuário de teste:', error);
    } finally {
        await database.close();
    }
}

createTestUser();