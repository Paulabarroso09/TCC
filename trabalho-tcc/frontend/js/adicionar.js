document.getElementById('formAddDevice').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const novoAparelho = {
      nome: document.getElementById('nome').value,
      tipo: document.getElementById('tipo').value,
      localizacao: document.getElementById('localizacao').value,
      numeroSerie: document.getElementById('numeroSerie').value
    };
  
    try {
      const response = await fetch('http://localhost:3000/api/aparelhos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoAparelho)
      });
  
      if (response.ok) {
        alert('Aparelho adicionado com sucesso!');
        window.location.href = 'aparelhos.html';
      } else {
        alert('Erro ao adicionar aparelho.');
      }
    } catch (err) {
      console.error(err);
      alert('Falha na conexão com o servidor.');
    }
  });
  